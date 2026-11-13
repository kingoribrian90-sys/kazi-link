import { pool } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const publicProfileFields = `
  p.id, u.name, u.role, p.title, p.service, p.category, p.subcategories,
  p.price, p.rating, p.review_count, p.location, p.languages, p.verified,
  p.experience, p.availability, p.accepts_mpesa, p.online, p.bio,
  p.avatar_url, p.portfolio, p.created_at, p.updated_at
`;

export async function listProfiles(_req, res) {
  const [rows] = await pool.execute(
    `SELECT ${publicProfileFields}
     FROM profiles p
     JOIN users u ON u.id = p.id
     WHERE u.role = 'freelancer'
     ORDER BY p.created_at ASC
     LIMIT 100`,
  );
  res.json(rows);
}

export async function getProfile(req, res) {
  const [rows] = await pool.execute(
    `SELECT ${publicProfileFields}
     FROM profiles p
     JOIN users u ON u.id = p.id
     WHERE p.id = ?
       AND (u.role = 'freelancer' OR u.id = ? OR ? = 'admin')
     LIMIT 1`,
    [req.params.profileId, req.user?.id || "", req.user?.role || ""],
  );
  if (!rows.length) throw new AppError("Profile not found.", 404);
  res.json(rows[0]);
}

export async function updateMyProfile(req, res) {
  const {
    name,
    title,
    service,
    category,
    subcategories,
    price,
    location,
    languages,
    availability,
    acceptsMpesa,
    online,
    bio,
    avatar,
    portfolio,
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("UPDATE users SET name = ? WHERE id = ?", [
      name,
      req.user.id,
    ]);
    await connection.execute(
      `UPDATE profiles
       SET title = ?, service = ?, category = ?, subcategories = ?, price = ?,
           location = ?, languages = ?, availability = ?, accepts_mpesa = ?,
           online = ?, bio = ?, avatar_url = ?, portfolio = ?
       WHERE id = ?`,
      [
        title,
        service,
        category,
        JSON.stringify(subcategories),
        price,
        location,
        JSON.stringify(languages),
        availability,
        acceptsMpesa,
        online,
        bio,
        avatar,
        JSON.stringify(portfolio),
        req.user.id,
      ],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const [rows] = await pool.execute(
    `SELECT ${publicProfileFields}
     FROM profiles p JOIN users u ON u.id = p.id
     WHERE p.id = ?`,
    [req.user.id],
  );
  if (!rows.length) throw new AppError("Profile not found.", 404);
  res.json(rows[0]);
}
