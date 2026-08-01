import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let transporter = null;

/**
 * Lazily build a Nodemailer transporter. When SMTP is not configured
 * (e.g. local dev / tests) emails are logged instead of sent, so the
 * app never crashes for a missing mail provider.
 */
const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: (env.SMTP_PORT || 587) === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
};

/**
 * Send an email.
 * @param {{to:string, subject:string, html:string, text?:string}} msg
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const tx = getTransporter();
  if (!tx) {
    logger.info(`[email:dev] To=${to} Subject="${subject}"`);
    return { queued: false, dev: true };
  }
  const info = await tx.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
  logger.info(`[email] sent ${info.messageId} -> ${to}`);
  return { queued: true, messageId: info.messageId };
};

export const emailTemplates = {
  verify: (name, url) => ({
    subject: "Verify your VINCI account",
    html: `<h2>Welcome ${name}</h2><p>Confirm your email:</p><a href="${url}">Verify Email</a>`,
  }),
  reset: (name, url) => ({
    subject: "Reset your VINCI password",
    html: `<h2>Hi ${name}</h2><p>Reset your password (valid 15 min):</p><a href="${url}">Reset Password</a>`,
  }),
  orderConfirmed: (name, orderNo) => ({
    subject: `Order ${orderNo} confirmed`,
    html: `<h2>Thank you ${name}</h2><p>Your order <b>${orderNo}</b> has been received and is being prepared.</p>`,
  }),
};
