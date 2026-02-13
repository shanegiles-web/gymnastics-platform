import nodemailer from "nodemailer";
import { CONFIG } from "../config/index.js";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  static isConfigured(): boolean {
    return !!(CONFIG.SMTP_HOST && CONFIG.SMTP_USER && CONFIG.SMTP_PASS);
  }

  static getSettings(): SmtpSettings {
    return {
      host: CONFIG.SMTP_HOST,
      port: CONFIG.SMTP_PORT,
      user: CONFIG.SMTP_USER,
      pass: CONFIG.SMTP_PASS ? "********" : "", // Don't expose password
      from: CONFIG.SMTP_FROM,
    };
  }

  private static getTransporter(): nodemailer.Transporter {
    if (!this.isConfigured()) {
      throw new Error("SMTP settings are not configured. Please save settings first.");
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: CONFIG.SMTP_HOST,
        port: CONFIG.SMTP_PORT,
        secure: CONFIG.SMTP_PORT === 465,
        auth: {
          user: CONFIG.SMTP_USER,
          pass: CONFIG.SMTP_PASS,
        },
      });
    }

    return this.transporter;
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: CONFIG.SMTP_FROM || CONFIG.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  static async sendTestEmail(to: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: "Test Email from GymFlow",
      text: "This is a test email from your GymFlow gymnastics management platform. If you received this, your email settings are configured correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5E6AD2;">GymFlow Test Email</h2>
          <p>This is a test email from your GymFlow gymnastics management platform.</p>
          <p>If you received this, your email settings are configured correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">GymFlow - Gymnastics Facility Management</p>
        </div>
      `,
    });
  }

  static async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
