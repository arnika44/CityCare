
import mongoose, { Schema, Document, Model } from "mongoose";

export type ComplaintStatus =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Awaiting Citizen Verification"
  | "Resolved";

export type Department =
  | "PWD"
  | "Water"
  | "Electricity"
  | "Sanitation"
  | "Traffic";

export type AIVerificationStatus =
  | "Pending"
  | "Verified"
  | "Manual Review"
  | "Failed";

export interface IStatusHistory {
  status: ComplaintStatus;
  timestamp: Date;
}

export interface IComplaint extends Document {
  citizenId: string;

  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;

  category: string;
  reportedCategory?: string;
  aiVerifiedCategory?: string;

  aiVerificationStatus: AIVerificationStatus;
  aiConfidence?: number;
  aiReason?: string;
  aiVerifiedAt?: Date;

  description: string;
  imageUrl?: string;

  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };

  landmark?: string;
  locationDetails?: string;

  department?: Department;

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
    citizenId: {
      type: String,
      required: true,
      index: true,
    },

    citizenName: {
      type: String,
      default: "",
    },

    citizenPhone: {
      type: String,
      default: "",
    },

    citizenEmail: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
    },

    reportedCategory: {
      type: String,
      default: "",
    },

    aiVerifiedCategory: {
      type: String,
      default: "",
    },

    aiVerificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Manual Review", "Failed"],
      default: "Pending",
    },

    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    aiReason: {
      type: String,
      default: "",
    },

    aiVerifiedAt: {
      type: Date,
    },

    description: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: {
        type: String,
        required: true,
      },
    },

    landmark: {
      type: String,
      default: "",
    },

    locationDetails: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      enum: ["PWD", "Water", "Electricity", "Sanitation", "Traffic"],
      default: undefined,
    },

    assignedAdminId: {
      type: String,
      default: "",
    },

    assignedAdminName: {
      type: String,
      default: "",
    },

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

    resolutionDescription: {
      type: String,
      default: "",
    },

    resolutionSubmittedAt: {
      type: Date,
    },

    citizenResolutionStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Rejected"],
    },

    citizenResolutionFeedback: {
      type: String,
      default: "",
    },

    citizenResolutionImageUrl: {
      type: String,
      default: "",
    },

    citizenVerifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint: Model<IComplaint> =
  (mongoose.models.Complaint as Model<IComplaint>) ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;
