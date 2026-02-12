import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { config } from "dotenv";

// Load environment variables
config();

async function setup() {
  console.log("Starting database setup...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL is not set!");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  try {
    // Create tables using raw SQL based on the schema
    console.log("Creating facilities table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS facilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        domain VARCHAR(255) NOT NULL UNIQUE,
        logo_url VARCHAR(500),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        time_zone VARCHAR(50) DEFAULT 'America/New_York',
        geofence_latitude NUMERIC,
        geofence_longitude NUMERIC,
        geofence_radius NUMERIC,
        subscription_plan_id UUID,
        stripe_customer_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    console.log("Creating users table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'parent',
        phone VARCHAR(20),
        profile_image_url VARCHAR(500),
        email_verified_at TIMESTAMP,
        verification_token_hash VARCHAR(255),
        reset_token_hash VARCHAR(255),
        reset_token_expires TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP,
        UNIQUE(facility_id, email)
      )
    `);

    console.log("Creating families table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS families (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        head_of_household VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address_line_1 VARCHAR(255),
        address_line_2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    console.log("Creating students table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        family_id UUID REFERENCES families(id) ON DELETE SET NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth VARCHAR(20),
        gender VARCHAR(20),
        skill_level VARCHAR(50) DEFAULT 'beginner',
        enrollment_status VARCHAR(50) DEFAULT 'active',
        waiver_status VARCHAR(50) DEFAULT 'pending',
        allergies TEXT,
        medical_info TEXT,
        notes TEXT,
        photo_url VARCHAR(500),
        emergency_contacts JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    console.log("Creating classes table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        skill_level VARCHAR(50),
        max_capacity INTEGER,
        min_age_months INTEGER,
        max_age_months INTEGER,
        coach_ids JSONB DEFAULT '[]'::jsonb,
        price_per_month NUMERIC(10, 2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    console.log("Creating enrollments table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        enrollment_date TIMESTAMP DEFAULT now(),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        position INTEGER DEFAULT 1,
        is_waitlisted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        UNIQUE(class_id, student_id)
      )
    `);

    console.log("Creating global_admins table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS global_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email_verified_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Setup error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

setup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
