import mongoose from "mongoose"

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["annual", "sick", "personal", "emergency"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending_manager", "pending_hr", "approved", "rejected_manager", "rejected_hr"],
      default: "pending_manager",
    },
    daysRequested: {
      type: Number,
      required: true,
      min: 1,
    },
    managerReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        trim: true,
      },
      reviewedAt: {
        type: Date,
      },
    },
    hrReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        trim: true,
      },
      reviewedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
leaveRequestSchema.index({ employeeId: 1, startDate: 1 })
leaveRequestSchema.index({ status: 1 })

export default mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveRequestSchema)
