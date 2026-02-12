import { config } from "dotenv";

config();

export const CONFIG = {
  // Server
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Third-party services
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "dev-encryption-key-32-bytes-min!",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),

  // Geofencing (timeclock)
  GEOFENCE_RADIUS_METERS: parseFloat(process.env.GEOFENCE_RADIUS_METERS || "500"),

  // Features
  ENABLE_STRIPE: process.env.ENABLE_STRIPE === "true",
  ENABLE_SENDGRID: process.env.ENABLE_SENDGRID === "true",
};

// Validate required configs
if (!CONFIG.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (CONFIG.JWT_SECRET === "dev-secret-key-change-in-production" && CONFIG.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be changed for production");
}

export default CONFIG;
