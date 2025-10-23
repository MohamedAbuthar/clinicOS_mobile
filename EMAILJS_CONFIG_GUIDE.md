# EmailJS Configuration Guide

## Step 1: Create .env File

Create a `.env` file in your mobile app root directory with these variables:

```env
# EmailJS Configuration (for frontend email sending)
EXPO_PUBLIC_EMAILJS_SERVICE_ID=your-emailjs-service-id
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your-emailjs-template-id
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your-emailjs-public-key
```

## Step 2: Get Your EmailJS Credentials

### 1. Service ID
- Go to EmailJS Dashboard → Email Services
- Copy the Service ID (e.g., `service_clinic_os`)

### 2. Template ID
- Go to EmailJS Dashboard → Email Templates
- Copy the Template ID (e.g., `template_otp`)

### 3. Public Key
- Go to EmailJS Dashboard → Account → API Keys
- Copy the Public Key (e.g., `user_xxxxxxxxxxxxxxxx`)

## Step 3: Email Template Setup

### Template Name: `ClinicOS OTP Template`

### Subject: `Your ClinicOS Login OTP`

### HTML Content:
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

### Template Variables:
- `{{otp_code}}` - The 6-digit OTP code
- `{{to_email}}` - Recipient email address

## Step 4: Test Your Setup

1. **Start your mobile app**
2. **Try patient login**
3. **Check your email for OTP**
4. **Check console logs for debugging**

## Troubleshooting

- **No emails received:** Check spam folder
- **EmailJS errors:** Verify your credentials in .env file
- **Template errors:** Make sure template variables match exactly
- **Console logs:** Check mobile app console for detailed error messages

## Development Mode (No Setup Required)

If you don't want to setup EmailJS right now:

1. **Just run your mobile app**
2. **Try patient login**
3. **Check console for OTP** (it will be logged there)
4. **Use the OTP from console to login**

This works perfectly for development and testing!
