# SMTP to EmailJS Setup Guide

Since you have SMTP credentials, here's how to set up EmailJS to use your Gmail SMTP:

## Step 1: Create EmailJS Account

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up for a free account**
3. **Verify your email address**

## Step 2: Add Gmail Service

1. **Go to Email Services** in your EmailJS dashboard
2. **Click "Add New Service"**
3. **Select "Gmail"**
4. **Enter your Gmail credentials:**
   - **Email:** `your-email@gmail.com` (your SMTP_EMAIL)
   - **Password:** `your-app-password` (your SMTP_APP_PASSWORD)
5. **Click "Create Service"**
6. **Copy the Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. **Go to Email Templates** in your EmailJS dashboard
2. **Click "Create New Template"**
3. **Fill in the template details:**

   **Template Name:** `ClinicOS OTP Template`
   
   **Subject:** `Your ClinicOS Login OTP`
   
   **Content Type:** `HTML`
   
   **Template Content (copy this exactly):**
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

4. **Click "Save"**
5. **Copy the Template ID** (e.g., `template_xyz789`)

## Step 4: Get Public Key

1. **Go to Account → API Keys** in your EmailJS dashboard
2. **Copy the Public Key** (e.g., `user_abcdef123456`)

## Step 5: Update Your .env File

Create a `.env` file in your mobile app root with **only 2 variables**:

```env
# EmailJS Configuration (only 2 variables needed!)
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=user_abcdef123456
```

**No template ID needed!** The HTML is written directly in the code.

## Step 6: Test Your Setup

1. **Start your mobile app**
2. **Try patient login**
3. **Check your email for OTP**
4. **Check console logs for debugging**

## Alternative: Quick Test Without EmailJS

If you want to test immediately without setting up EmailJS:

1. **Just run your mobile app**
2. **Try patient login**
3. **Check console for OTP** (it will be logged there)
4. **Use the OTP from console to login**

This works perfectly for development and testing!

## Troubleshooting

- **Gmail setup issues:** Make sure you're using App Password, not regular password
- **Template not working:** Check that template variables match exactly
- **No emails received:** Check spam folder
- **Console errors:** Check that all environment variables are set correctly
