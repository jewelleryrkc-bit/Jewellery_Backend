require("dotenv").config();
import nodemailer, { Transporter } from "nodemailer";

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER, // e.g. 958883001@smtp-brevo.com
        pass: process.env.SMTP_PASS, // your SMTP key
      },
    });
  }

  async sendMail({
    fromName,
    replyTo,
    to,
    subject,
    html,
    attachments,
  }: {
    fromName: string;
    replyTo: string;
    to: string[];
    subject: string;
    html: string;
    attachments?: any[];
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <okaberintarou31@gmail.com>`, // ✅ your validated Brevo sender
        replyTo,
        to: to.join(","),
        subject,
        html,
        attachments,
      });

      console.log("✅ Email sent:", info.messageId);
      return info;
    } catch (err) {
      console.error("❌ Email send failed:", err);
      throw err;
    }
  }
}
