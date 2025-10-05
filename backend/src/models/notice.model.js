// backend/src/models/notice.model.js

import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const noticeSchema = new Schema(
  {
    noticeId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    postedBy: {
      type: String, // Storing the userId of the admin who posted the notice
      ref: "User",
      refPath: "User.userId",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false, // Allows soft-deletion/hiding from users
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export const Notice = mongoose.model("Notice", noticeSchema);
