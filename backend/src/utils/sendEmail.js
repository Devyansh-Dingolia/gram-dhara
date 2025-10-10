import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { ApiError } from './ApiError.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        // Use the Resend SDK's 'emails.send' method
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM, 
            to: options.email,            
            subject: options.subject,     
            html: options.message         
        });

        // Check if the Resend API returned an error
        if (error) {
            console.error("Resend API Error:", error);
            throw new ApiError(500, error.message || "There was an issue sending the email.");
        }

        console.log(`Email sent successfully to ${options.email}. Message ID: ${data.id}`);
        return data; // Return the success data

    } catch (error) {
        console.error("Full error object in sendEmail:", error);
        throw new ApiError(500, "There was an issue sending the email. Please try again later.");
    }
};

export { sendEmail };