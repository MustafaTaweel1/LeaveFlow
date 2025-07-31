// Updated MongoDB Seed Script for new workflow
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

    // Sample users (same as before)
    const users = [
      {
        name: "John Employee",
        email: "employee@company.com",
        passwordHash: hashedPassword,
        role: "employee",
        department: "Engineering",
        leaveBalance: [
          { type: "annual", remaining: 18 },
          { type: "sick", remaining: 8 },
          { type: "personal", remaining: 5 },
          { type: "emergency", remaining: 3 },
        ],
      },
      {
        name: "Jane Manager",
        email: "manager@company.com",
        passwordHash: hashedPassword,
        role: "manager",
        department: "Engineering",
        leaveBalance: [
          { type: "annual", remaining: 20 },
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
          { type: "annual", remaining: 22 },
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
          { type: "annual", remaining: 25 },
          { type: "sick", remaining: 10 },
          { type: "personal", remaining: 5 },
          { type: "emergency", remaining: 3 },
        ],
      },
    ]

    const insertedUsers = await db.collection("users").insertMany(users)
    console.log(`Inserted ${insertedUsers.insertedCount} users`)

    // Get user IDs for leave requests
    const userIds = Object.values(insertedUsers.insertedIds)

    // Sample leave requests with new workflow
    const leaveRequests = [
      {
        employeeId: userIds[0], // John Employee
        type: "annual",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-02-17"),
        reason: "Family vacation",
        status: "approved",
        managerReview: {
          reviewedBy: userIds[1], // Jane Manager
          comment: "Approved by manager",
          reviewedAt: new Date("2024-02-10"),
        },
        hrReview: {
          reviewedBy: userIds[2], // Bob HR
          comment: "Final approval granted",
          reviewedAt: new Date("2024-02-11"),
        },
        createdAt: new Date("2024-02-08"),
      },
      {
        employeeId: userIds[0], // John Employee
        type: "sick",
        startDate: new Date("2024-02-20"),
        endDate: new Date("2024-02-21"),
        reason: "Flu symptoms",
        status: "pending_manager",
        createdAt: new Date("2024-02-19"),
      },
      {
        employeeId: userIds[1], // Jane Manager (manager taking leave)
        type: "personal",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-01"),
        reason: "Medical appointment",
        status: "pending_hr",
        managerReview: {
          reviewedBy: userIds[2], // Bob HR (acting as manager for this case)
          comment: "Approved by HR acting as manager",
          reviewedAt: new Date("2024-02-25"),
        },
        createdAt: new Date("2024-02-24"),
      },
    ]

    const insertedRequests = await db.collection("leaverequests").insertMany(leaveRequests)
    console.log(`Inserted ${insertedRequests.insertedCount} leave requests`)

    console.log("Database seeded successfully with new workflow!")
    console.log("\nDemo Login Credentials:")
    console.log("Employee: employee@company.com / password123")
    console.log("Manager: manager@company.com / password123")
    console.log("HR: hr@company.com / password123")
    console.log("Admin: admin@company.com / password123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
