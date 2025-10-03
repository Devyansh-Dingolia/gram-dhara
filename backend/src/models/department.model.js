import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const departmentSchema = new Schema(
    {
        departmentId: {
            type: String,
            default: uuidv4,
            unique: true
        },
        userId: {
            type: String,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        description: {
            type: String,
            trim: true
        },
        contactInfo: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

export const Department = mongoose.model('Department', departmentSchema);