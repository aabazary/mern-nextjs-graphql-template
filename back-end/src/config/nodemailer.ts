import nodemailer from 'nodemailer';

if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
    console.warn('Nodemailer configuration incomplete. Ensure EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM are defined in environment variables.');
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' if port is 465 (SSL/TLS), 'false' for 587 (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default transporter;