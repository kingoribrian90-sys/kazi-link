import { pool } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function listSavedProfiles(req, res) {
  const [rows] = await pool.execute(
    "SELECT profile_id FROM saved_profiles WHERE user_id = ?",
    [req.user.id],
  );
  res.json(rows.map((row) => row.profile_id));
}

export async function saveProfile(req, res) {
  const [profiles] = await pool.execute(
    `SELECT p.id FROM profiles p
     JOIN users u ON u.id = p.id
     WHERE p.id = ? AND u.role = 'freelancer'`,
    [req.params.profileId],
  );
  if (!profiles.length) throw new AppError("Freelancer profile not found.", 404);
  await pool.execute(
    "INSERT INTO saved_profiles (user_id, profile_id) VALUES (?, ?)",
    [req.user.id, req.params.profileId],
  );
  res.status(204).end();
}

export async function unsaveProfile(req, res) {
  await pool.execute(
    "DELETE FROM saved_profiles WHERE user_id = ? AND profile_id = ?",
    [req.user.id, req.params.profileId],
  );
  res.status(204).end();
}
