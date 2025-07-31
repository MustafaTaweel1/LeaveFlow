// Updated MongoDB Seed Script with proper leave balance tracking
const bcrypt = require("bcryptjs")
const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/leave-management"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db()

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("leaverequests").deleteMany({})
    await db.collection("notifications").deleteMany({})

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("password123", 10)

    // Sample users with realistic leave balances
    const users = [
      {
        name: "John Employee",
        email: "employee@company.com",
        passwordHash: hashedPassword,
        role: "employee",
        department: "Engineering",
        leaveBalance: [
          { type: "annual", remaining: 15 }, // Some days already used
          { type: "sick", remaining: 8 },
          { type: "personal", remaining: 3 },
          { type: "emergency", remaining: 2 },
        ],
      },
      {
        name: "Jane Manager",
        email: "manager@company.com",
        passwordHash: hashedPassword,
        role: "manager",
        department: "Engineering",
        leaveBalance: [
          { type: "annual", remaining: 18 },
          { type: "sick", remaining: 10 },
          { type: "personal", remaining: 5 },
          { type: "emergency", remaining: 3 },
        ],
      },
      {
        name: "Bob HR",
        email: "hr@company.com",
        passwordHash: hashedPassword,
        role: "hr",
        department: "HR",
        leaveBalance: [
          { type: "annual", remaining: 20 },
          { type: "sick", remaining: 10 },
          { type: "personal", remaining: 5 },
          { type: "emergency", remaining: 3 },
        ],
      },
      {
        name: "Alice Admin",
        email: "admin@company.com",
        passwordHash: hashedPassword,
        role: "admin",
        department: "IT",
        leaveBalance: [
          { type: "annual", remaining: 22 },
          { type: "sick", remaining: 10 },
          { type: "personal", remaining: 5 },
          { type: "emergency", remaining: 3 },
        ],
      },
      {
        name: "Mike Developer",
        email: "mike@company.com",
        passwordHash: hashedPassword,
        role: "employee",
        department: "Engineering",
        leaveBalance: [
          { type: "annual", remaining: 0 }, // No annual leave remaining
          { type: "sick", remaining: 5 },
          { type: "personal", remaining: 2 },
          { type: "emergency", remaining: 1 },
        ],
      },
    ]

    const insertedUsers = await db.collection("users").insertMany(users)
    console.log(`Inserted ${insertedUsers.insertedCount} users`)

    // Get user IDs for leave requests
    const userIds = Object.values(insertedUsers.insertedIds)

    // Sample leave requests with days requested
    const leaveRequests = [
      {
        employeeId: userIds[0], // John Employee
        type: "annual",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-01-17"),
        reason: "Family vacation",
        status: "approved",
        daysRequested: 3,
        managerReview: {
          reviewedBy: userIds[1], // Jane Manager
          comment: "Approved by manager",
          reviewedAt: new Date("2024-01-10"),
        },
        hrReview: {
          reviewedBy: userIds[2], // Bob HR
          comment: "Final approval granted",
          reviewedAt: new Date("2024-01-11"),
        },
        createdAt: new Date("2024-01-08"),
      },
      {
        employeeId: userIds[0], // John Employee
        type: "sick",
        startDate: new Date("2024-02-20"),
        endDate: new Date("2024-02-21"),
        reason: "Flu symptoms",
        status: "pending_manager",
        daysRequested: 2,
        createdAt: new Date("2024-02-19"),
      },
      {
        employeeId: userIds[4], // Mike Developer (no annual leave)
        type: "annual",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-03"),
        reason: "Vacation request",
        status: "rejected_manager",
        daysRequested: 3,
        managerReview: {
          reviewedBy: userIds[1], // Jane Manager
          comment: "Insufficient annual leave balance",
          reviewedAt: new Date("2024-02-25"),
        },
        createdAt: new Date("2024-02-24"),
      },
    ]

    const insertedRequests = await db.collection("leaverequests").insertMany(leaveRequests)
    console.log(`Inserted ${insertedRequests.insertedCount} leave requests`)

    console.log("Database seeded successfully with leave balance tracking!")
    console.log("\nDemo Login Credentials:")
    console.log("Employee (John): employee@company.com / password123 - Has some leave balance")
    console.log("Manager (Jane): manager@company.com / password123")
    console.log("HR (Bob): hr@company.com / password123")
    console.log("Admin (Alice): admin@company.com / password123")
    console.log("Employee (Mike): mike@company.com / password123 - No annual leave remaining")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
