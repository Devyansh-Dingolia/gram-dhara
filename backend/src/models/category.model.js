import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = new Schema(
    {
        categoryId: {
            type: String,
            default: uuidv4,
            unique: true
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
        }
    },
    { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);