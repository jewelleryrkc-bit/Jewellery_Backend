"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
require("dotenv").config();
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendMail({ fromName, replyTo, to, subject, html, attachments, }) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${fromName}" <okaberintarou31@gmail.com>`,
                replyTo,
                to: to.join(","),
                subject,
                html,
                attachments,
            });
            console.log("✅ Email sent:", info.messageId);
            return info;
        }
        catch (err) {
            console.error("❌ Email send failed:", err);
            throw err;
        }
    }
}
exports.MailService = MailService;
//# sourceMappingURL=MailService.js.map