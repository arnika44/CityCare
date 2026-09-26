import mongoose, { Schema, Document } from "mongoose";

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
  status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    citizenId: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        default: "",
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

    status: {
      type: String,
      enum: ["Reported", "Verified", "Assigned", "In Progress", "Resolved"],
      default: "Reported",
    },
  },
  {
    timestamps: true,
  }
);

const Complaint =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;