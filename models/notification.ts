
import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  citizenId: string;
  complaintId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "STATUS_UPDATE" | "COMPLAINT_ASSIGNED" | "COMPLAINT_RESOLVED";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    citizenId: {
      type: String,
      required: true,
      index: true,
    },

    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "STATUS_UPDATE",
        "COMPLAINT_ASSIGNED",
        "COMPLAINT_RESOLVED",
      ],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ citizenId: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
