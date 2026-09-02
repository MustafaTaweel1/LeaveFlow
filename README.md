# LeaveFlow (Employee Leave Management System) 🏖️💼
> A modern, enterprise-grade Employee Leave & Absence Management SaaS platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **MongoDB**.

---

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui%20%2B%20Radix-000000.svg?style=flat)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)]()

---

## 📖 Overview

**LeaveFlow** is an end-to-end cloud-ready human resources and employee leave tracking solution designed to streamline time-off requests, team calendar schedules, multi-tier manager/HR approval workflows, and workforce analytics.

Featuring dedicated role-based portals for **Employees**, **Team Managers**, and **HR Administrators**, LeaveFlow eliminates paperwork, automates leave balance calculations, and offers deep analytical insights into team attendance patterns.

---

## 🌟 Key Features

### 👥 1. Role-Based Access Control (RBAC)
- **Employee Portal**:
  - Request time-off across multiple leave categories (Annual, Sick, Personal, Emergency).
  - Live leave balance indicators and request history tracking.
  - Cancel pending requests and view managerial review notes.
- **Manager Portal**:
  - Review, approve, or reject department team leave requests with custom feedback.
  - Team calendar view to avoid scheduling conflicts and understaffing.
  - Department leave utilization metrics.
- **HR & Admin Portal**:
  - Company-wide leave oversight and final-stage approvals.
  - Employee balance adjustments and user management (add, edit, assign roles/departments).
  - Bulk actions (mass approval/rejection) for large volume operations.
  - Company holiday calendar and global policy configuration.

### 🔄 2. Multi-Stage Approval Workflow
```
[Employee Submits Request]
            │
            ▼
[Manager Review (1st Tier)] ───(Rejected)──► [Employee Notified]
            │ (Approved)
            ▼
[HR Review (Final Tier)]    ───(Rejected)──► [Employee Notified]
            │ (Approved)
            ▼
[Leave Confirmed & Balances Deducted Automatically]
```

### 📊 3. Analytics & Reporting
- Interactive charts powered by **Recharts** (monthly trends, category distributions, department breakdowns).
- Exportable leave and attendance reports.

### 📅 4. Interactive Team Calendar
- Color-coded team schedule showing upcoming holidays and approved leaves.
- Filtering by department, employee, or leave type.

### 🔔 5. Notifications & Alerts
- Real-time in-app notification center for request updates, approvals, rejections, and upcoming reminders.

### 🌓 6. Modern UX & Theming
- Light & Dark mode toggle with seamless system preference sync (`next-themes`).
- Accessible, responsive UI components built on Radix UI and Tailwind CSS.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) & [Lucide React Icons](https://lucide.dev/) |
| **Charts & Visuals** | [Recharts](https://recharts.org/) |
| **Database & ORM** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Authentication** | JWT (JSON Web Tokens) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Forms & Validation**| [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |

---

## 📁 Project Structure

```text
leave-management-system/
├── app/
│   ├── api/                    # Backend REST API Route Handlers
│   │   ├── analytics/          # Analytics & metrics endpoints
│   │   ├── auth/               # Login, registration & session endpoints
│   │   ├── calendar/           # Leave calendar schedule data
│   │   ├── dashboard/          # Summary metrics for roles
│   │   ├── leave-requests/     # CRUD & approval workflow API
│   │   ├── notifications/      # Notification triggers & mark-as-read
│   │   ├── reports/            # Data export & reporting endpoints
│   │   ├── settings/           # Company settings & holiday rules
│   │   └── users/              # User management & balance adjustments
│   ├── dashboard/              # Role-Based Front-end Pages
│   │   ├── calendar/           # Full-screen interactive calendar
│   │   ├── employee/           # Employee dashboard & request form
│   │   ├── hr/                 # HR management & analytics dashboard
│   │   ├── manager/            # Manager approval queue & team stats
│   │   ├── reports/            # Custom report generation view
│   │   ├── settings/           # Global policy & company configuration
│   │   └── users/              # Employee directory & user admin
│   ├── layout.tsx              # Root Layout & Theme Provider
│   └── page.tsx                # Landing & Dynamic Role-Based Login Redirect
├── components/
│   ├── analytics/              # Dashboard charts & KPI cards
│   ├── auth/                   # Login & registration forms
│   ├── calendar/               # Team absence calendar component
│   ├── layout/                 # Sidebar, header & navigation components
│   ├── leave/                  # Request modals, forms & bulk action toolbars
│   ├── notifications/          # Notification drawer & badge indicators
│   ├── reports/                # Report generation tables & export buttons
│   └── ui/                     # shadcn/ui components (buttons, dialogs, dropdowns, etc.)
├── contexts/
│   └── auth-context.tsx        # React Context for client-side auth & permissions
├── models/
│   ├── User.ts                 # User Schema & role definitions
│   ├── LeaveRequest.ts         # Leave Request schema with multi-tier reviews
│   ├── Notification.ts         # Notification message model
│   └── Settings.ts             # Company policies, thresholds & holidays
├── lib/
│   ├── mongodb.ts              # Cached Mongoose connection helper
│   └── utils.ts                # Class merging & utility helpers
└── scripts/
    ├── seed-mongodb.js         # Comprehensive MongoDB demo dataset generator
    └── update-seed-mongodb.js  # Additional migration & seed utilities
```

---

## 🗄️ Core Database Models

### `User`
```typescript
{
  name: string;
  email: string; // Unique
  passwordHash: string;
  role: "employee" | "manager" | "hr" | "admin";
  department: string;
  leaveBalance: [
    { type: "annual" | "sick" | "personal" | "emergency", remaining: number }
  ];
}
```

### `LeaveRequest`
```typescript
{
  employeeId: ObjectId (ref: "User");
  type: "annual" | "sick" | "personal" | "emergency";
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason: string;
  status: "pending_manager" | "pending_hr" | "approved" | "rejected_manager" | "rejected_hr";
  managerReview: { reviewedBy: ObjectId, comment: string, reviewedAt: Date };
  hrReview: { reviewedBy: ObjectId, comment: string, reviewedAt: Date };
}
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **MongoDB**: Local instance running on port `27017` or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.

---

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MustafaTaweel1/leave-management-system.git
cd leave-management-system
npm install
```

---

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/leave-management

# JWT Secret for Session Authentication
JWT_SECRET=your_secure_jwt_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Seed Demo Data

Populate the database with ready-to-use demo accounts, departments, leave balances, and sample requests:

```bash
node scripts/seed-mongodb.js
```

#### 🔑 Ready-to-Use Demo Accounts:
| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| 🧑‍💼 **Employee** | `employee@company.com` | `password123` | Submit requests, view balances & personal calendar |
| 👨‍💼 **Manager** | `manager@company.com` | `password123` | Department approval queue, team metrics & calendar |
| 👩‍💼 **HR** | `hr@company.com` | `password123` | Global leave oversight, multi-tier approvals & reports |
| 🛡️ **Admin** | `admin@company.com` | `password123` | Full system, user management, policies & settings |

---

### 4. Run Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the production bundle.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint checks.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/MustafaTaweel1/leave-management-system/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
