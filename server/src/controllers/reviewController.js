import { pool } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function listProfileReviews(req, res) {
  const [rows] = await pool.execute(
    `SELECT id, request_id, client_id, client_name, freelancer_id,
            rating, comment, created_at
     FROM reviews
     WHERE freelancer_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [req.params.profileId],
  );
  res.json(rows);
}

export async function createReview(req, res) {
  const { rating, comment } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [requests] = await connection.execute(
      "SELECT * FROM job_requests WHERE id = ? FOR UPDATE",
      [req.params.requestId],
    );
    if (!requests.length) throw new AppError("Request not found.", 404);
    const request = requests[0];
    if (req.user.role !== "admin" && request.client_id !== req.user.id) {
      throw new AppError("Only the client who sent this request can review it.", 403);
    }
    if (request.status !== "completed") {
      throw new AppError("Only completed requests can be reviewed.", 409);
    }

    await connection.execute(
      `INSERT INTO reviews
        (request_id, client_id, client_name, freelancer_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        request.id,
        request.client_id,
        request.client_name,
        request.freelancer_id,
        rating,
        comment,
      ],
    );
    await connection.execute(
      `UPDATE profiles p
       SET p.rating = (
             SELECT ROUND(AVG(r.rating), 2) FROM reviews r
             WHERE r.freelancer_id = p.id
           ),
           p.review_count = (
             SELECT COUNT(*) FROM reviews r
             WHERE r.freelancer_id = p.id
           )
       WHERE p.id = ?`,
      [request.freelancer_id],
    );
    const [[review]] = await connection.execute(
      "SELECT * FROM reviews WHERE request_id = ?",
      [request.id],
    );
    await connection.commit();
    res.status(201).json(review);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
