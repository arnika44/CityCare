import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  citizenId: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  address: string;
  pinCode: string;
  cityDistrict: string;
  state: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    citizenId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    pinCode: {
      type: String,
      default: "",
    },
    cityDistrict: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);