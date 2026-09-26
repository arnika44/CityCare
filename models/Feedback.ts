import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  complaintId: string;
  citizenId: string;
  rating: number;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    complaintId: {
      type: String,
      required: true,
      trim: true,
    },

    citizenId: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    feedback: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;