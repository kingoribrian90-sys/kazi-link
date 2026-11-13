import { randomBytes, randomUUID, createHash } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { isMailConfigured, sendMail } from "../config/mail.js";
import { AppError } from "../utils/AppError.js";

const demoFreelancerProfile = {
  title: "Digital freelancer",
  service: "Digital services",
  category: "Design and Creative",
  price: 2500,
  location: "Nairobi",
  experience: "new",
  availability: "flexible",
  acceptsMpesa: true,
  bio: "Tell local businesses a little about what you do and how you can help.",
};

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function makeToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

function createAccessToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function frontendTokenUrl(parameter, token) {
  const url = new URL("/", process.env.CLIENT_URL);
  url.searchParams.set(parameter, token);
  return url.toString();
}

async function insertAuthToken(connection, userId, tokenHash, tokenType) {
  await connection.execute(
    `INSERT INTO auth_tokens (user_id, token_hash, token_type, expires_at)
     VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY))`,
    [userId, tokenHash, tokenType],
  );
}

export async function register(req, res) {
  if (!isMailConfigured()) {
    throw new AppError("Configure SMTP before enabling account registration.", 503);
  }

  const { name, email, password, role } = req.body;
  const id = randomUUID();
  const { token, tokenHash } = makeToken();
  const passwordHash = await bcrypt.hash(password, 12);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, passwordHash, role],
    );

    const freelancer = role === "freelancer";
    await connection.execute(
      `INSERT INTO profiles (
         id, title, service, category, subcategories, price, location,
         languages, experience, availability, accepts_mpesa, bio,
         portfolio
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        freelancer ? demoFreelancerProfile.title : null,
        freelancer ? demoFreelancerProfile.service : null,
        freelancer ? demoFreelancerProfile.category : null,
        JSON.stringify(freelancer ? [demoFreelancerProfile.service] : []),
        freelancer ? demoFreelancerProfile.price : null,
        freelancer ? demoFreelancerProfile.location : null,
        JSON.stringify(freelancer ? ["English", "Kiswahili"] : []),
        freelancer ? demoFreelancerProfile.experience : null,
        freelancer ? demoFreelancerProfile.availability : null,
        freelancer ? demoFreelancerProfile.acceptsMpesa : false,
        freelancer ? demoFreelancerProfile.bio : null,
        JSON.stringify([]),
      ],
    );
    await insertAuthToken(connection, id, tokenHash, "email_verification");
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const verificationUrl = frontendTokenUrl("verifyToken", token);
  await sendMail({
    to: email,
    subject: "Verify your KaziLink account",
    text: `Confirm your email address by opening this link: ${verificationUrl}`,
  });
  res.status(201).json({
    message: "Check your email to confirm your KaziLink account.",
  });
}

export async function login(req, res) {
  const [users] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.password_hash, u.role,
            u.email_verified_at, p.avatar_url
     FROM users u
     LEFT JOIN profiles p ON p.id = u.id
     WHERE u.email = ?
     LIMIT 1`,
    [req.body.email],
  );
  const user = users[0];
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    throw new AppError("Email or password is incorrect.", 401);
  }
  if (!user.email_verified_at) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  res.json({
    token: createAccessToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url || "",
    },
  });
}

export async function getMe(req, res) {
  const [users] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.role, p.title, p.service, p.category,
            p.subcategories, p.price, p.rating, p.review_count, p.location,
            p.languages, p.verified, p.experience, p.availability,
            p.accepts_mpesa, p.online, p.bio, p.avatar_url, p.portfolio,
            p.created_at, p.updated_at
     FROM users u
     JOIN profiles p ON p.id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [req.user.id],
  );
  if (!users.length) throw new AppError("Account not found.", 404);
  const user = users[0];
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url || "",
    },
    profile: user,
  });
}

export async function verifyEmail(req, res) {
  const connection = await pool.getConnection();
  let userId;
  try {
    await connection.beginTransaction();
    const [tokens] = await connection.execute(
      `SELECT t.id, t.user_id
       FROM auth_tokens t
       WHERE t.token_hash = ?
         AND t.token_type = 'email_verification'
         AND t.used_at IS NULL
         AND t.expires_at > CURRENT_TIMESTAMP
       FOR UPDATE`,
      [hashToken(req.body.token)],
    );
    if (!tokens.length) throw new AppError("Verification link is invalid or expired.", 400);
    userId = tokens[0].user_id;
    await connection.execute(
      "UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE id = ?",
      [userId],
    );
    await connection.execute(
      "UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?",
      [tokens[0].id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const [users] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.role, p.avatar_url
     FROM users u LEFT JOIN profiles p ON p.id = u.id
     WHERE u.id = ?`,
    [userId],
  );
  const user = users[0];
  res.json({
    token: createAccessToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url || "",
    },
  });
}

export async function resendVerification(req, res) {
  if (!isMailConfigured()) {
    throw new AppError("Configure SMTP before sending account emails.", 503);
  }
  const [users] = await pool.execute(
    "SELECT id, email FROM users WHERE email = ? AND email_verified_at IS NULL",
    [req.body.email],
  );
  if (users.length) {
    const { token, tokenHash } = makeToken();
    await pool.execute(
      `UPDATE auth_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND token_type = 'email_verification' AND used_at IS NULL`,
      [users[0].id],
    );
    await insertAuthToken(pool, users[0].id, tokenHash, "email_verification");
    await sendMail({
      to: users[0].email,
      subject: "Verify your KaziLink account",
      text: `Confirm your email address by opening this link: ${frontendTokenUrl(
        "verifyToken",
        token,
      )}`,
    });
  }
  res.status(202).json({
    message: "If the account needs verification, a new link is on its way.",
  });
}

export async function requestPasswordReset(req, res) {
  if (!isMailConfigured()) {
    throw new AppError("Configure SMTP before sending account emails.", 503);
  }
  const [users] = await pool.execute(
    "SELECT id, email FROM users WHERE email = ?",
    [req.body.email],
  );
  if (users.length) {
    const { token, tokenHash } = makeToken();
    await pool.execute(
      `UPDATE auth_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND token_type = 'password_reset' AND used_at IS NULL`,
      [users[0].id],
    );
    await insertAuthToken(pool, users[0].id, tokenHash, "password_reset");
    await sendMail({
      to: users[0].email,
      subject: "Reset your KaziLink password",
      text: `Choose a new password by opening this link: ${frontendTokenUrl(
        "resetToken",
        token,
      )}`,
    });
  }
  res.status(202).json({
    message: "If an account exists for that email, a reset link is on its way.",
  });
}

export async function resetPassword(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [tokens] = await connection.execute(
      `SELECT id, user_id
       FROM auth_tokens
       WHERE token_hash = ?
         AND token_type = 'password_reset'
         AND used_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP
       FOR UPDATE`,
      [hashToken(req.body.token)],
    );
    if (!tokens.length) throw new AppError("Password reset link is invalid or expired.", 400);
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    await connection.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, tokens[0].user_id],
    );
    await connection.execute(
      `UPDATE auth_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND token_type = 'password_reset' AND used_at IS NULL`,
      [tokens[0].user_id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  res.json({ message: "Your password has been updated." });
}
