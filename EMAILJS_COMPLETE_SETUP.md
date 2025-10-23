# Complete EmailJS Setup for Mobile App

## Step 1: Create EmailJS Account

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up for free account**
3. **Verify your email address**

## Step 2: Add Gmail Service

1. **Go to Email Services** in EmailJS dashboard
2. **Click "Add New Service"**
3. **Select "Gmail"**
4. **Enter your Gmail credentials:**
   - **Email:** `abutharskt@gmail.com` (your email)
   - **Password:** `osrb bxqc cvln onya` (your app password)
5. **Click "Create Service"**
6. **Copy the Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. **Go to Email Templates** in EmailJS dashboard
2. **Click "Create New Template"**
3. **Fill in the template details:**

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

4. **Click "Save"**
5. **Copy the Template ID** (e.g., `template_xyz789`)

## Step 4: Get Public Key

1. **Go to Account → API Keys** in EmailJS dashboard
2. **Copy the Public Key** (e.g., `user_abcdef123456`)

## Step 5: Update Your .env File

Update your `.env` file with the real EmailJS credentials:

```env
# EmailJS Configuration (get these from EmailJS dashboard)
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=user_abcdef123456
```

## Step 6: Update the Code

Update the email service to use your real credentials:

```typescript
// In lib/services/emailOTPService.ts, replace the hardcoded values:
service_id: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || 'service_clinic_os',
user_id: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_emailjs_public_key',
template_id: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_otp',
```

## Step 7: Test

1. **Restart your mobile app**
2. **Try patient login**
3. **Check your email for OTP**

## Quick Test (No Setup Required)

If you don't want to setup EmailJS right now, the app will work in fallback mode:

1. **Just run your mobile app**
2. **Try patient login**
3. **Check console for OTP** (it will be logged there)
4. **Use the OTP from console to login**

This works perfectly for development and testing!
