# Mobile App Email Setup Guide

## Option 1: Use Backend Server (Recommended)

### 1. Setup Backend Server

1. **Install dependencies:**
   ```bash
   npm install express nodemailer cors dotenv
   ```

2. **Create `.env` file:**
   ```env
   SMTP_EMAIL=your-email@gmail.com
   SMTP_APP_PASSWORD=your-app-password
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   node backend-server.js
   ```

4. **Update mobile app environment:**
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
   ```

### 2. Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_APP_PASSWORD`

## Option 2: Use EmailJS (Alternative)

### 1. Setup EmailJS

1. **Create EmailJS account** at https://www.emailjs.com/
2. **Create email service** (Gmail, Outlook, etc.)
3. **Create email template** for OTP
4. **Get your credentials:**
   - Service ID
   - Template ID  
   - Public Key

### 2. Update Mobile App

1. **Install EmailJS:**
   ```bash
   npm install @emailjs/browser
   ```

2. **Update environment variables:**
   ```env
   EXPO_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
   EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
   EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
   ```

## Option 3: Use Your Web App's API

If you want to use your existing web app's email service:

1. **Update environment variable:**
   ```env
   EXPO_PUBLIC_BACKEND_URL=https://your-web-app-url.com
   ```

2. **The mobile app will call:** `https://your-web-app-url.com/api/otp/send`

## Testing

1. **Start your backend server** (if using Option 1)
2. **Run your mobile app**
3. **Try patient login** - OTP should be sent to email
4. **Check console logs** for debugging information

## Troubleshooting

- **SMTP errors:** Check Gmail credentials and 2FA setup
- **Network errors:** Ensure backend server is running
- **OTP not received:** Check spam folder, verify email address
- **Console logs:** Check mobile app console for detailed error messages
