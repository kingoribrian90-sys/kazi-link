import { randomUUID } from "node:crypto";
import { pool } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function listRequests(req, res) {
  const query =
    req.user.role === "admin"
      ? `SELECT r.*,
           EXISTS (SELECT 1 FROM reviews v WHERE v.request_id = r.id) AS reviewed
         FROM job_requests r
         ORDER BY r.created_at DESC
         LIMIT 100`
      : `SELECT r.*,
           EXISTS (SELECT 1 FROM reviews v WHERE v.request_id = r.id) AS reviewed
         FROM job_requests r
         WHERE r.client_id = ? OR r.freelancer_id = ?
         ORDER BY r.created_at DESC
         LIMIT 100`;
  const [rows] =
    req.user.role === "admin"
      ? await pool.execute(query)
      : await pool.execute(query, [req.user.id, req.user.id]);
  res.json(rows);
}

export async function createRequest(req, res) {
  const { freelancerId, service, description, budget, deadline, location } =
    req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [freelancers] = await connection.execute(
      `SELECT name FROM users WHERE id = ? AND role = 'freelancer' FOR UPDATE`,
      [freelancerId],
    );
    if (!freelancers.length) throw new AppError("Freelancer not found.", 404);
    if (freelancerId === req.user.id) {
      throw new AppError("You cannot send a request to yourself.", 400);
    }
    const [[client]] = await connection.execute(
      "SELECT name FROM users WHERE id = ?",
      [req.user.id],
    );
    const requestId = randomUUID();
    await connection.execute(
      `INSERT INTO job_requests
        (id, client_id, client_name, freelancer_id, freelancer_name, service,
         description, budget, deadline, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        requestId,
        req.user.id,
        client.name,
        freelancerId,
        freelancers[0].name,
        service,
        description,
        budget,
        deadline,
        location,
      ],
    );
    const [[request]] = await connection.execute(
      "SELECT * FROM job_requests WHERE id = ?",
      [requestId],
    );
    await connection.commit();
    res.status(201).json({ ...request, reviewed: 0 });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateRequestStatus(req, res) {
  const { status } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT * FROM job_requests WHERE id = ? FOR UPDATE",
      [req.params.requestId],
    );
    if (!rows.length) throw new AppError("Request not found.", 404);
    const request = rows[0];
    if (req.user.role !== "admin" && request.freelancer_id !== req.user.id) {
      throw new AppError("You cannot update this request.", 403);
    }
    const valid =
      (request.status === "pending" &&
        ["accepted", "declined"].includes(status)) ||
      (request.status === "accepted" && status === "completed");
    if (!valid) {
      throw new AppError("That request status transition is not allowed.", 409);
    }
    await connection.execute(
      "UPDATE job_requests SET status = ? WHERE id = ?",
      [status, req.params.requestId],
    );
    const [[updated]] = await connection.execute(
      "SELECT * FROM job_requests WHERE id = ?",
      [req.params.requestId],
    );
    await connection.commit();
    res.json({ ...updated, reviewed: 0 });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
