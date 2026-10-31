
import mongoose, { Schema, Document } from "mongoose";

export type ComplaintStatus =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Awaiting Citizen Verification"
  | "Resolved";

export interface IStatusHistory {
  status: ComplaintStatus;
  timestamp: Date;
}

export interface IComplaint extends Document {
  citizenId: string;
  category: string;
  description: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  landmark?: string;
  locationDetails?: string;

  department?: "PWD" | "Water" | "Electricity" | "Sanitation" | "Traffic";
  assignedAdminId?: string;
  assignedAdminName?: string;

  status: ComplaintStatus;
  statusHistory: IStatusHistory[];

  resolutionDescription?: string;
  resolutionSubmittedAt?: Date;

  citizenResolutionStatus?: "Pending" | "Confirmed" | "Rejected";
  citizenResolutionFeedback?: string;
  citizenResolutionImageUrl?: string;
  citizenVerifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: [
        "Reported",
        "Verified",
        "Assigned",
        "In Progress",
        "Awaiting Citizen Verification",
        "Resolved",
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    citizenId: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },

    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },

    landmark: { type: String },
    locationDetails: { type: String },

    department: {
      type: String,
      enum: ["PWD", "Water", "Electricity", "Sanitation", "Traffic"],
      default: undefined,
    },

    assignedAdminId: { type: String, default: "" },
    assignedAdminName: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "Reported",
        "Verified",
        "Assigned",
        "In Progress",
        "Awaiting Citizen Verification",
        "Resolved",
      ],
      default: "Reported",
    },

    statusHistory: {
      type: [StatusHistorySchema],
      default: () => [{ status: "Reported", timestamp: new Date() }],
    },

    resolutionDescription: { type: String, default: "" },
    resolutionSubmittedAt: { type: Date },

    citizenResolutionStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected"],
    },

    citizenResolutionFeedback: { type: String, default: "" },
    citizenResolutionImageUrl: { type: String, default: "" },
    citizenVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);
