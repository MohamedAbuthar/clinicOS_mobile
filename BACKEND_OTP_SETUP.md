# Backend OTP Integration Setup Guide

This guide explains how the OTP functionality is integrated between the mobile app and the backend server.

## 🏗️ Architecture Overview

```
Mobile App (React Native) → Backend API (Node.js/Express) → SMTP (Gmail)
```

## 📁 File Structure

```
clinicOS_mobile/
├── backend/                          # Backend server
│   ├── src/
│   │   ├── routes/otpRoutes.ts       # OTP API endpoints
│   │   ├── services/
│   │   │   ├── emailService.ts       # SMTP email service
│   │   │   └── otpService.ts          # OTP management
│   │   └── server.ts                  # Main server file
│   └── package.json
├── lib/
│   ├── config/
│   │   └── backendConfig.ts          # Backend URL configuration
│   ├── services/
│   │   └── emailOTPService.ts        # Mobile OTP service
│   └── contexts/
│       └── PatientAuthContext.tsx     # Authentication context
└── app/
    ├── patient-login.tsx              # Patient login page
    └── backend-otp-test.tsx          # OTP test page
```

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install express cors dotenv nodemailer @types/node @types/express @types/cors
```

### 2. Environment Variables
Create a `.env` file in the backend directory:
```env
SMTP_EMAIL=your-email@gmail.com
SMTP_APP_PASSWORD=your-16-char-app-password
PORT=3001
NODE_ENV=development
```

### 3. Start Backend Server
```bash
cd backend
npm start
```

The server will start on `http://localhost:3001`

## 📱 Mobile App Configuration

### 1. Backend URL Configuration
The mobile app uses `lib/config/backendConfig.ts` to configure the backend URL:

```typescript
export const BACKEND_CONFIG = {
  DEV_URL: 'http://localhost:3001',        // Development
  PROD_URL: 'https://your-backend-url.com', // Production
  ENVIRONMENT: 'development',              // Change to 'production' when deploying
};
```

### 2. OTP Service Integration
The mobile app uses `lib/services/emailOTPService.ts` which:
- Sends OTP requests to backend API
- Verifies OTP with backend API
- Falls back to console logging if backend is unavailable

## 🔄 OTP Flow

### 1. Send OTP
```
Mobile App → POST /api/otp/send → Backend → SMTP → Email
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresIn": 180
}
```

### 2. Verify OTP
```
Mobile App → POST /api/otp/verify → Backend → Verification
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

## 🧪 Testing

### 1. Test Backend API
```bash
# Test send OTP
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test verify OTP
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### 2. Test Mobile App
1. Start the backend server
2. Run the mobile app
3. Navigate to `/backend-otp-test` page
4. Test the OTP flow

## 🚀 Deployment

### Backend Deployment
1. Deploy backend to your preferred platform (Heroku, Railway, etc.)
2. Update `BACKEND_CONFIG.PROD_URL` in mobile app
3. Change `BACKEND_CONFIG.ENVIRONMENT` to 'production'

### Mobile App Deployment
1. Build and deploy mobile app
2. Ensure backend URL is correctly configured for production

## 🔍 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if backend server is running
   - Verify backend URL in `backendConfig.ts`
   - Check network connectivity

2. **SMTP Authentication Failed**
   - Verify Gmail app password is correct
   - Ensure 2-factor authentication is enabled
   - Check SMTP credentials in backend `.env`

3. **OTP Not Received**
   - Check spam folder
   - Verify email address is correct
   - Check backend logs for SMTP errors

### Debug Steps

1. Check backend logs for errors
2. Use the test page `/backend-otp-test` to debug
3. Verify network connectivity between mobile app and backend
4. Check SMTP configuration in backend

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/otp/send` | POST | Send OTP to email |
| `/api/otp/verify` | POST | Verify OTP |
| `/api/otp/health` | GET | Health check |
| `/api/otp/cleanup` | POST | Cleanup expired OTPs |

## 🔐 Security Features

- OTP expires in 3 minutes
- Rate limiting prevents spam
- Secure SMTP authentication
- Input validation and sanitization
- Error handling and logging

## 📞 Support

If you encounter issues:
1. Check the backend logs
2. Verify environment variables
3. Test API endpoints manually
4. Check network connectivity
