import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const reportAssignmentSchema = new Schema(
    {
        assignmentId: {
            type: String,
            default: uuidv4,
            unique: true
        },
        reportId: {
            type: String,
            ref: "Report",
            required: true
        },
        departmentId: {
            type: String,
            ref: "Department",
            required: true
        },
        assigned_to_userId: {
            type: String,
            ref: "User",
            required: true
        },
        assigned_at: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['assigned', 'in_progress', 'completed'],
            default: 'assigned',
            lowercase: true
        },
        remarks: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

export const ReportAssignment = mongoose.model('ReportAssignment', reportAssignmentSchema);