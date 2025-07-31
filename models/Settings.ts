import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    company: {
      name: {
        type: String,
        required: true,
        default: "Your Company Name",
      },
      address: {
        type: String,
        required: true,
        default: "123 Business St, City, State 12345",
      },
      phone: {
        type: String,
        required: true,
        default: "+1 (555) 123-4567",
      },
      email: {
        type: String,
        required: true,
        default: "hr@company.com",
      },
    },
    leave: {
      maxDaysInAdvance: {
        type: Number,
        required: true,
        default: 365,
      },
      minNoticeHours: {
        type: Number,
        required: true,
        default: 24,
      },
      allowWeekendRequests: {
        type: Boolean,
        required: true,
        default: true,
      },
      autoApprovalLimit: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    notifications: {
      emailEnabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      managerNotifications: {
        type: Boolean,
        required: true,
        default: true,
      },
      hrNotifications: {
        type: Boolean,
        required: true,
        default: true,
      },
      reminderDays: {
        type: Number,
        required: true,
        default: 7,
      },
    },
    holidays: [
      {
        name: {
          type: String,
          required: true,
        },
        date: {
          type: String,
          required: true,
        },
        recurring: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema)
