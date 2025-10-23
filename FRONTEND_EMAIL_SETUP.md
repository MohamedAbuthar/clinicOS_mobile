# Frontend-Only Email Setup Guide

## Option 1: EmailJS (Recommended - No Backend Required)

### 1. Setup EmailJS Account

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Create a free account**
3. **Add an email service:**
   - Gmail, Outlook, Yahoo, etc.
   - Follow their setup guide for your email provider

### 2. Create Email Template

1. **Go to Email Templates**
2. **Create a new template with these exact settings:**

   **Template Name:** `ClinicOS OTP Template`
   
   **Subject:** `Your ClinicOS Login OTP`
   
   **Content Type:** `HTML`
   
   **Template Content:**
   ```html
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
     <h2 style="color:#0f766e;">🏥 ClinicOS - Login OTP</h2>
     <p>Your one-time password is:</p>
     <div style="background:#f8fafc;border:2px dashed #0ea5e9;border-radius:8px;padding:16px;text-align:center;margin:12px 0;">
       <span style="font-size:32px;letter-spacing:6px;color:#0f766e;font-weight:bold;">{{otp_code}}</span>
     </div>
     <p>This code expires in 3 minutes. Do not share it with anyone.</p>
     <p style="color:#64748b;font-size:12px;margin-top:24px;">This is an automated message. Please do not reply.</p>
   </div>
   ```

   **Template Variables:**
   - `{{otp_code}}` - The 6-digit OTP code
   - `{{to_email}}` - Recipient email address

### 3. Get Your Credentials

1. **Service ID:** From your email service
2. **Template ID:** From your email template
3. **Public Key:** From your account settings

### 4. Update Mobile App Environment

Create `.env` file in your mobile app root:

```env
EXPO_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
```

### 5. Test the Setup

1. **Run your mobile app**
2. **Try patient login**
3. **Check console logs** for debugging
4. **Check your email** for OTP

## Option 2: Simple Console Fallback (Development)

If you don't want to setup EmailJS, the app will work with console logging:

1. **No setup required**
2. **OTP will be shown in console**
3. **Perfect for development/testing**

## Option 3: Use Your Web App's Email Service

If you want to use your existing web app's email service:

1. **Update environment variable:**
   ```env
   EXPO_PUBLIC_EMAILJS_SERVICE_ID=your-web-app-url
   ```

2. **The mobile app will call your web app's API**

## Troubleshooting

- **EmailJS errors:** Check your service and template configuration
- **No emails received:** Check spam folder
- **Console logs:** Check mobile app console for detailed error messages
- **Environment variables:** Make sure they're properly set in your `.env` file

## Quick Start (No Setup)

For immediate testing without any setup:

1. **Just run your mobile app**
2. **Try patient login**
3. **Check console for OTP** (it will be logged there)
4. **Use the OTP from console to login**

This works perfectly for development and testing!
