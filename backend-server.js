// Simple Backend Server for Mobile App Email Service
// Run this server to handle SMTP email sending for your mobile app

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// SMTP Configuration (same as your web app)
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp, subject, html } = req.body;

    console.log('📧 Sending OTP request:', { email, otp: otp ? '***' : 'missing' });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check SMTP credentials
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
      console.error('❌ SMTP credentials missing');
      return res.status(500).json({
        success: false,
        message: 'SMTP credentials not configured. Please check your environment variables.'
      });
    }

    // Send email
    const mailOptions = {
      from: {
        name: 'ClinicOS',
        address: process.env.SMTP_EMAIL,
      },
      to: email,
      subject: subject || 'Your ClinicOS Login OTP',
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#0f766e;">🏥 ClinicOS - Login OTP</h2>
          <p>Your one-time password is:</p>
          <div style="background:#f8fafc;border:2px dashed #0ea5e9;border-radius:8px;padding:16px;text-align:center;margin:12px 0;">
            <span style="font-size:32px;letter-spacing:6px;color:#0f766e;font-weight:bold;">${otp}</span>
          </div>
          <p>This code expires in 3 minutes. Do not share it with anyone.</p>
          <p style="color:#64748b;font-size:12px;margin-top:24px;">This is an automated message. Please do not reply.</p>
        </div>
      `,
      text: `Your ClinicOS OTP is: ${otp} (valid for 3 minutes)`,
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ OTP email sent successfully to:', email);
    res.json({ 
      success: true, 
      message: 'OTP sent successfully to your email' 
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to send OTP email: ${error.message}`
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Email service is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email service running on port ${PORT}`);
  console.log(`📧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Send OTP: http://localhost:${PORT}/api/send-otp`);
});

module.exports = app;
