# 📧 EmailJS Setup Guide - Send Real Emails

## 🎯 **Goal: Send OTP to Actual Email Inbox**

To send real emails to the user's inbox (like your web application), you need to set up EmailJS properly.

## 🚀 **Step 1: Create EmailJS Account**

1. **Go to [EmailJS.com](https://www.emailjs.com/)**
2. **Sign up for free account**
3. **Verify your email address**

## 🔧 **Step 2: Set Up Email Service**

1. **Go to Email Services** in your EmailJS dashboard
2. **Click "Add New Service"**
3. **Choose your email provider** (Gmail, Outlook, etc.)
4. **Connect your email account**
5. **Note down your Service ID** (e.g., `service_xxxxxxx`)

## 📝 **Step 3: Create Email Template**

1. **Go to Email Templates** in your EmailJS dashboard
2. **Click "Create New Template"**
3. **Use this template content:**

```html
Subject: Your ClinicOS Login OTP

<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #14B8A6, #0D9488); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🏥 ClinicOS</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Login OTP</p>
  </div>
  
  <div style="background: #f8fafc; border: 2px dashed #14B8A6; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
    <h2 style="color: #0f766e; margin: 0 0 10px 0; font-size: 24px;">Your OTP Code</h2>
    <div style="background: white; border: 2px solid #14B8A6; border-radius: 8px; padding: 20px; margin: 15px 0;">
      <span style="font-size: 36px; letter-spacing: 8px; color: #0f766e; font-weight: bold; font-family: 'Courier New', monospace;">
        {{otp_code}}
      </span>
    </div>
    <p style="color: #64748b; margin: 0; font-size: 14px;">This code expires in 10 minutes</p>
  </div>
  
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
    <p style="color: #92400e; margin: 0; font-size: 14px;">
      <strong>Security Notice:</strong> Do not share this code with anyone. ClinicOS will never ask for your OTP via phone or email.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This is an automated message from ClinicOS. Please do not reply to this email.
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
      If you didn't request this OTP, please ignore this email.
    </p>
  </div>
</div>
```

4. **Note down your Template ID** (e.g., `template_xxxxxxx`)

## 🔑 **Step 4: Get Your User ID**

1. **Go to Account** in your EmailJS dashboard
2. **Copy your Public Key** (e.g., `user_xxxxxxx`)

## ⚙️ **Step 5: Update Your Code**

Update `lib/services/realEmailService.ts` with your actual credentials:

```typescript
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_your_actual_id', // Replace with your service ID
  TEMPLATE_ID: 'template_your_actual_id', // Replace with your template ID
  USER_ID: 'user_your_actual_id', // Replace with your user ID
};
```

## 🧪 **Step 6: Test**

1. **Run your app**
2. **Enter email address**
3. **Click "Send OTP"**
4. **Check your email inbox** - you should receive the OTP!

## 📋 **Expected Result:**

- ✅ **OTP sent to email inbox**
- ✅ **Beautiful email template**
- ✅ **Professional appearance**
- ✅ **Works exactly like your web application**

## 🚨 **If Still Not Working:**

1. **Check EmailJS dashboard** for any errors
2. **Verify all IDs are correct**
3. **Test with a different email address**
4. **Check spam folder**

Your OTP will now be sent to the actual email inbox! 🎉
