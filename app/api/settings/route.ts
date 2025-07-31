import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Settings from "@/models/Settings";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await connectDB();

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || !["hr", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let settings = await Settings.findOne({});

    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({
        company: {
          name: "Your Company Name",
          address: "123 Business St, City, State 12345",
          phone: "+1 (555) 123-4567",
          email: "hr@company.com",
        },
        leave: {
          maxDaysInAdvance: 365,
          minNoticeHours: 24,
          allowWeekendRequests: true,
          autoApprovalLimit: 0,
        },
        notifications: {
          emailEnabled: true,
          managerNotifications: true,
          hrNotifications: true,
          reminderDays: 7,
        },
        holidays: [
          { name: "New Year's Day", date: "2024-01-01", recurring: true },
          { name: "Independence Day", date: "2024-07-04", recurring: true },
          { name: "Christmas Day", date: "2024-12-25", recurring: true },
        ],
      });
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await connectDB();

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || !["hr", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const settingsData = await request.json();

    let settings = await Settings.findOne({});

    if (settings) {
      // Update existing settings
      Object.assign(settings, settingsData);
      await settings.save();
    } else {
      // Create new settings
      settings = new Settings(settingsData);
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
