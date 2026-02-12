import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { initDb, closeDb } from "./db/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { APIResponse } from "./types/index.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import familyRoutes from "./routes/family.routes.js";
import classRoutes from "./routes/class.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import waiverRoutes from "./routes/waiver.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import timeclockRoutes from "./routes/timeclock.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import studentRoutes from "./routes/student.routes.js";

const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: CONFIG.NODE_ENV === "production" ? undefined : false,
}));

// CORS - in production, client is served from same origin
const corsOrigin = CONFIG.NODE_ENV === "production"
  ? true  // Allow same-origin requests
  : CONFIG.FRONTEND_URL;
app.use(cors({ origin: corsOrigin, credentials: true }));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan("combined"));

// Rate limiting
app.use(rateLimit(CONFIG.RATE_LIMIT_WINDOW_MS, CONFIG.RATE_LIMIT_MAX_REQUESTS));

// Health check endpoint
app.get("/api/v1/health", (_req: Request, res: Response) => {
  const response: APIResponse = {
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/families", familyRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/waivers", waiverRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/timeclock", timeclockRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/students", studentRoutes);

// Serve static files in production
if (CONFIG.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDistPath));

  // Handle client-side routing - serve index.html for non-API routes
  app.get("*", (req: Request, res: Response, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// 404 handler (for API routes)
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Server startup
async function startServer() {
  try {
    // Initialize database
    await initDb();
    console.log("Database initialized successfully");

    // Start listening
    const port = CONFIG.PORT;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${CONFIG.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await closeDb();
  process.exit(0);
});

startServer();

export default app;
