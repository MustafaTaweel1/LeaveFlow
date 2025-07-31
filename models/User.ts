import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "manager", "hr", "admin"],
      default: "employee",
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    leaveBalance: [
      {
        type: {
          type: String,
          enum: ["annual", "sick", "personal", "emergency"],
          required: true,
        },
        remaining: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
