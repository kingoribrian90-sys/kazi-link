import nodemailer from "nodemailer";
import { AppError } from "../utils/AppError.js";

export function isMailConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD && SMTP_FROM);
}

export async function sendMail({ to, subject, text, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;

  if (!isMailConfigured()) {
    throw new AppError("SMTP is not configured on the API server.", 503);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  await transporter.sendMail({ from: SMTP_FROM, to, subject, text, html });
}
