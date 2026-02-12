import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { CONFIG } from "../config/index.js";
import * as schema from "./schema/index.js";

let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export async function initDb() {
  if (db) {
    return db;
  }

  try {
    client = postgres(CONFIG.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    db = drizzle(client, { schema });
    console.log("Database connection established");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

export async function closeDb() {
  if (client) {
    await client.end();
    db = null;
    client = null;
    console.log("Database connection closed");
  }
}

export { schema };
