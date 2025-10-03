import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const reportHistorySchema = new Schema(
    {
        historyId: {
            type: String,
            default: uuidv4,
            unique: true
        },
        reportId: { 
            type: String,
            ref: 'Report',
            required: true
        },
        previousStatus: {
            type: String,
            enum: ['pending', 'in_progress', 'resolved', 'rejected'],
            required: false,
            lowercase: true
        },
        newStatus: {
            type: String,
            enum: ['pending','in_progress', 'resolved', 'rejected'],
            required: true,
            lowercase: true
        },
        changedByUserId: {
            type: String,
            ref: 'User',
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export const ReportHistory = mongoose.model('ReportHistory', reportHistorySchema);