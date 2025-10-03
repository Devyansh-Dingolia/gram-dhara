import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = './public/temp';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'photo') {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for photo uploads'), false);
        }
    } else if (file.fieldname === 'voiceRecording') {
        // Check if file is audio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed for voice recording uploads'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 2 // Maximum 2 files (photo + voice recording)
    },
    fileFilter: fileFilter
});

// Export the upload middleware
export const uploadMiddleware = upload;

// Middleware for handling multiple file uploads
export const uploadFiles = upload.fields([
    { name: 'photo', maxCount: 1 },
    // Add the new field for the completion photo
    { name: 'completionPhoto', maxCount: 1 },
    { name: 'voiceRecording', maxCount: 1 }
]);

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size allowed is 10MB.'
            });
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 2 files allowed.'
            });
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name in file upload.'
            });
        }
    } else if (error.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: 'Only image files (JPEG, PNG, GIF) are allowed for photo uploads.'
        });
    } else if (error.message.includes('Only audio files are allowed')) {
        return res.status(400).json({
            success: false,
            message: 'Only audio files (MP3, WAV, M4A) are allowed for voice recordings.'
        });
    }
    
    next(error);
};
