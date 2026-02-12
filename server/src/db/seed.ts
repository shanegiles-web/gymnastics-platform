import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as schema from "./schema/index.js";
import { CONFIG } from "../config/index.js";

const SALT_ROUNDS = 10;

async function seed() {
  console.log("Starting database seed...");

  const client = postgres(CONFIG.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // Generate UUIDs
    const facilityId = uuidv4();
    const adminUserId = uuidv4();
    const coachUserId = uuidv4();
    const parentUserId = uuidv4();
    const family1Id = uuidv4();
    const family2Id = uuidv4();
    const family3Id = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const student3Id = uuidv4();
    const student4Id = uuidv4();
    const student5Id = uuidv4();
    const class1Id = uuidv4();
    const class2Id = uuidv4();
    const class3Id = uuidv4();
    const class4Id = uuidv4();
    const class5Id = uuidv4();
    const class6Id = uuidv4();

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash("Admin123!", SALT_ROUNDS);
    const coachPasswordHash = await bcrypt.hash("Coach123!", SALT_ROUNDS);
    const parentPasswordHash = await bcrypt.hash("Parent123!", SALT_ROUNDS);

    console.log("Creating facility...");
    // Create demo facility
    await db.insert(schema.facilities).values({
      id: facilityId,
      name: "Elite Gymnastics Academy",
      domain: "elite-gymnastics",
      addressLine1: "123 Gymnastics Way",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
      phone: "(555) 123-4567",
      email: "info@elitegymnastics.demo",
      timeZone: "America/Chicago",
      isActive: true,
    });

    console.log("Creating users...");
    // Create admin user
    await db.insert(schema.users).values({
      id: adminUserId,
      facilityId,
      email: "admin@demo.com",
      passwordHash: adminPasswordHash,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      emailVerifiedAt: new Date(),
      isActive: true,
    });

    // Create coach user
    await db.insert(schema.users).values({
      id: coachUserId,
      facilityId,
      email: "coach@demo.com",
      passwordHash: coachPasswordHash,
      firstName: "Coach",
      lastName: "Smith",
      role: "coach",
      emailVerifiedAt: new Date(),
      isActive: true,
    });

    // Create parent user
    await db.insert(schema.users).values({
      id: parentUserId,
      facilityId,
      email: "parent@demo.com",
      passwordHash: parentPasswordHash,
      firstName: "Parent",
      lastName: "Johnson",
      role: "parent",
      emailVerifiedAt: new Date(),
      isActive: true,
    });

    console.log("Creating families...");
    // Create family 1 (Johnson family - 2 kids)
    await db.insert(schema.families).values({
      id: family1Id,
      facilityId,
      headOfHousehold: "Parent Johnson",
      email: "parent@demo.com",
      phone: "(555) 111-1111",
      addressLine1: "100 Oak Street",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
    });

    // Create family 2 (Williams family - 2 kids)
    await db.insert(schema.families).values({
      id: family2Id,
      facilityId,
      headOfHousehold: "Sarah Williams",
      email: "williams@demo.com",
      phone: "(555) 222-2222",
      addressLine1: "200 Maple Avenue",
      city: "Springfield",
      state: "IL",
      postalCode: "62702",
      country: "USA",
    });

    // Create family 3 (Davis family - 1 kid)
    await db.insert(schema.families).values({
      id: family3Id,
      facilityId,
      headOfHousehold: "Mike Davis",
      email: "davis@demo.com",
      phone: "(555) 333-3333",
      addressLine1: "300 Pine Road",
      city: "Springfield",
      state: "IL",
      postalCode: "62703",
      country: "USA",
    });

    console.log("Creating students...");
    // Create 5 students
    await db.insert(schema.students).values([
      {
        id: student1Id,
        facilityId,
        familyId: family1Id,
        firstName: "Emma",
        lastName: "Johnson",
        dateOfBirth: "2016-03-15",
        gender: "female",
        skillLevel: "intermediate",
        enrollmentStatus: "active",
        waiverStatus: "signed",
      },
      {
        id: student2Id,
        facilityId,
        familyId: family1Id,
        firstName: "Liam",
        lastName: "Johnson",
        dateOfBirth: "2018-07-22",
        gender: "male",
        skillLevel: "beginner",
        enrollmentStatus: "active",
        waiverStatus: "signed",
      },
      {
        id: student3Id,
        facilityId,
        familyId: family2Id,
        firstName: "Olivia",
        lastName: "Williams",
        dateOfBirth: "2014-11-08",
        gender: "female",
        skillLevel: "advanced",
        enrollmentStatus: "active",
        waiverStatus: "signed",
      },
      {
        id: student4Id,
        facilityId,
        familyId: family2Id,
        firstName: "Noah",
        lastName: "Williams",
        dateOfBirth: "2017-05-30",
        gender: "male",
        skillLevel: "beginner",
        enrollmentStatus: "active",
        waiverStatus: "signed",
      },
      {
        id: student5Id,
        facilityId,
        familyId: family3Id,
        firstName: "Ava",
        lastName: "Davis",
        dateOfBirth: "2015-09-12",
        gender: "female",
        skillLevel: "intermediate",
        enrollmentStatus: "active",
        waiverStatus: "signed",
      },
    ]);

    console.log("Creating classes...");
    // Create 6 classes
    await db.insert(schema.classes).values([
      {
        id: class1Id,
        facilityId,
        name: "Beginner Tumbling",
        description: "Introduction to basic tumbling skills including rolls, cartwheels, and handstands.",
        skillLevel: "beginner",
        maxCapacity: 12,
        minAgeMonths: 48,
        maxAgeMonths: 96,
        coachIds: JSON.stringify([coachUserId]),
        pricePerMonth: "85.00",
      },
      {
        id: class2Id,
        facilityId,
        name: "Intermediate Bars",
        description: "Uneven bars training for intermediate level gymnasts.",
        skillLevel: "intermediate",
        maxCapacity: 8,
        minAgeMonths: 72,
        maxAgeMonths: 144,
        coachIds: JSON.stringify([coachUserId]),
        pricePerMonth: "110.00",
      },
      {
        id: class3Id,
        facilityId,
        name: "Advanced Beam",
        description: "Advanced balance beam techniques and routines.",
        skillLevel: "advanced",
        maxCapacity: 6,
        minAgeMonths: 96,
        maxAgeMonths: 192,
        coachIds: JSON.stringify([coachUserId]),
        pricePerMonth: "130.00",
      },
      {
        id: class4Id,
        facilityId,
        name: "Team Practice",
        description: "Competitive team training session for all apparatus.",
        skillLevel: "advanced",
        maxCapacity: 15,
        minAgeMonths: 84,
        maxAgeMonths: 216,
        coachIds: JSON.stringify([coachUserId]),
        pricePerMonth: "175.00",
      },
      {
        id: class5Id,
        facilityId,
        name: "Tiny Tumblers",
        description: "Fun gymnastics introduction for our youngest athletes. Parent participation required.",
        skillLevel: "beginner",
        maxCapacity: 10,
        minAgeMonths: 24,
        maxAgeMonths: 48,
        coachIds: JSON.stringify([coachUserId]),
        pricePerMonth: "65.00",
      },
      {
        id: class6Id,
        facilityId,
        name: "Open Gym",
        description: "Supervised open practice time on all equipment.",
        skillLevel: "beginner",
        maxCapacity: 20,
        minAgeMonths: 48,
        maxAgeMonths: 216,
        coachIds: JSON.stringify([coachUserId]),
        pricePerMonth: "45.00",
      },
    ]);

    console.log("Creating enrollments...");
    // Create enrollments
    const now = new Date();
    await db.insert(schema.enrollments).values([
      // Emma Johnson - Intermediate Bars, Open Gym
      {
        classId: class2Id,
        studentId: student1Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 1,
        isWaitlisted: false,
      },
      {
        classId: class6Id,
        studentId: student1Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 1,
        isWaitlisted: false,
      },
      // Liam Johnson - Beginner Tumbling
      {
        classId: class1Id,
        studentId: student2Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 1,
        isWaitlisted: false,
      },
      // Olivia Williams - Advanced Beam, Team Practice
      {
        classId: class3Id,
        studentId: student3Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 1,
        isWaitlisted: false,
      },
      {
        classId: class4Id,
        studentId: student3Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 1,
        isWaitlisted: false,
      },
      // Noah Williams - Beginner Tumbling
      {
        classId: class1Id,
        studentId: student4Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 2,
        isWaitlisted: false,
      },
      // Ava Davis - Intermediate Bars
      {
        classId: class2Id,
        studentId: student5Id,
        enrollmentDate: now,
        startDate: now,
        status: "active",
        position: 2,
        isWaitlisted: false,
      },
    ]);

    console.log("\n=== Seed completed successfully! ===\n");
    console.log("Demo Facility: Elite Gymnastics Academy");
    console.log("\nDemo Users:");
    console.log("  Admin:  admin@demo.com  / Admin123!");
    console.log("  Coach:  coach@demo.com  / Coach123!");
    console.log("  Parent: parent@demo.com / Parent123!");
    console.log("\nFamilies: 3 (Johnson, Williams, Davis)");
    console.log("Students: 5 (Emma, Liam, Olivia, Noah, Ava)");
    console.log("Classes: 6 (Beginner Tumbling, Intermediate Bars, Advanced Beam, Team Practice, Tiny Tumblers, Open Gym)");
    console.log("");

  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
