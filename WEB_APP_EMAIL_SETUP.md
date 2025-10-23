# 📧 Web App Email Setup - Send Real OTP Emails

## 🎯 **Goal: Send Real OTP Emails Like Your Web Application**

Your mobile app now uses your web application's API to send real OTP emails!

## 🚀 **How It Works:**

1. **Mobile app generates OTP** → Calls your web app's `/api/otp/send` endpoint
2. **Web app sends real email** → Uses Gmail SMTP (just like your web app)
3. **User receives OTP** → In their actual email inbox
4. **User enters OTP** → Mobile app verifies and logs in
5. **Navigation works** → Redirects to patient dashboard

## ⚙️ **Setup (Optional):**

### Step 1: Create .env File
Create a `.env` file in your project root with:

```env
# Your web application URL
EXPO_PUBLIC_WEB_APP_URL=https://clinic-os-web-new-neon.vercel.app
```

### Step 2: Restart Your App
After creating the .env file, restart your development server.

## 📱 **How It Works Now:**

### Without .env Configuration:
- ✅ **App works immediately**
- ✅ **OTP generated and shown in console**
- ✅ **User can enter OTP to login**
- ✅ **Navigation works properly**

### With .env Configuration:
- ✅ **OTP sent to actual email inbox**
- ✅ **Real email from your Gmail account**
- ✅ **Professional email template**
- ✅ **Works exactly like your web application**

## 🧪 **Test Components:**

```tsx
// Test email functionality
import { EmailTest } from '@/components/EmailTest';
<EmailTest />

// Test OTP display
import { SimpleOTPDisplay } from '@/components/SimpleOTPDisplay';
<SimpleOTPDisplay />
```

## 📋 **Console Logs to Watch:**

### Without Web App Configuration:
```
📧 Web app not configured, using fallback method
📧 OTP generated: 123456
📧 Email would be sent to: user@example.com
```

### With Web App Configuration:
```
📧 Sending OTP via web app API to user@example.com: 123456
✅ OTP sent to user@example.com: 123456
```

## ✅ **Benefits:**

- ✅ **Works immediately** - No setup required for basic functionality
- ✅ **Real email sending** - Uses your web app's Gmail SMTP
- ✅ **No external services** - Everything runs through your web app
- ✅ **Same email template** - Identical to your web application
- ✅ **Proper navigation** - Redirects to dashboard after login

## 🎯 **Expected Behavior:**

1. **Enter email** → Click "Send OTP"
2. **Check email inbox** → Receive OTP from your Gmail account
3. **Enter OTP** → Click "Verify OTP"
4. **Success!** → Navigate to patient dashboard (no more login page)

Your mobile app now works exactly like your web application! 🎉
