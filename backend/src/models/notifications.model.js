import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const notificationSchema = new Schema(
    {
        notificationId: {
            type: String,
            default: uuidv4,
            unique: true
        },
        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        reportId: {
            type: String,
            ref: 'Report',
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['unread', 'read'],
            default: 'unread',
            lowercase: true
        }
    },
    { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);