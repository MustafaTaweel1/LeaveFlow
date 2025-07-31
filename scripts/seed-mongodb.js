// MongoDB Seed Script for Employee Leave Management System
// Run this script to populate the database with sample data

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

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("password123", 10)

    // Sample users
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
      {
        name: "Mike Developer",
        email: "mike@company.com",
        passwordHash: hashedPassword,
        role: "employee",
        department: "Engineering",
        leaveBalance: [
          { type: "annual", remaining: 15 },
          { type: "sick", remaining: 7 },
          { type: "personal", remaining: 3 },
          { type: "emergency", remaining: 2 },
        ],
      },
      {
        name: "Sarah Marketing",
        email: "sarah@company.com",
        passwordHash: hashedPassword,
        role: "employee",
        department: "Marketing",
        leaveBalance: [
          { type: "annual", remaining: 20 },
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

    // Sample leave requests
    const leaveRequests = [
      {
        employeeId: userIds[0], // John Employee
        type: "annual",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-02-17"),
        reason: "Family vacation",
        status: "approved",
        review: {
          reviewedBy: userIds[1], // Jane Manager
          comment: "Approved for family time",
          reviewedAt: new Date("2024-02-10"),
        },
        createdAt: new Date("2024-02-08"),
      },
      {
        employeeId: userIds[4], // Mike Developer
        type: "sick",
        startDate: new Date("2024-02-20"),
        endDate: new Date("2024-02-21"),
        reason: "Flu symptoms",
        status: "pending",
        createdAt: new Date("2024-02-19"),
      },
      {
        employeeId: userIds[5], // Sarah Marketing
        type: "personal",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-01"),
        reason: "Medical appointment",
        status: "approved",
        review: {
          reviewedBy: userIds[2], // Bob HR
          comment: "Approved",
          reviewedAt: new Date("2024-02-25"),
        },
        createdAt: new Date("2024-02-24"),
      },
      {
        employeeId: userIds[0], // John Employee
        type: "emergency",
        startDate: new Date("2024-03-10"),
        endDate: new Date("2024-03-12"),
        reason: "Family emergency",
        status: "rejected",
        review: {
          reviewedBy: userIds[1], // Jane Manager
          comment: "Need more documentation",
          reviewedAt: new Date("2024-03-08"),
        },
        createdAt: new Date("2024-03-07"),
      },
    ]

    const insertedRequests = await db.collection("leaverequests").insertMany(leaveRequests)
    console.log(`Inserted ${insertedRequests.insertedCount} leave requests`)

    console.log("Database seeded successfully!")
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
