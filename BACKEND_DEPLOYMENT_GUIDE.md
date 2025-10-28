# Backend Deployment Guide for APK Builds

## Problem
Your local patient OTP is working in development but not in APK builds because the APK is trying to connect to your local IP (`http://192.168.31.63:3005`) which is not accessible from other devices.

## Solution
Deploy your backend to a public hosting service so it's accessible from anywhere.

## Option 1: Deploy to Render (Recommended - Free)

### Step 1: Push Backend to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `clinic-os-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Port**: `3005`

5. Add Environment Variables:
   - `SMTP_EMAIL`: Your Gmail address
   - `SMTP_APP_PASSWORD`: Your Gmail app password (16 characters)
   - `PORT`: `3005`
   - `NODE_ENV`: `production`

6. Click "Create Web Service"
7. Wait for deployment (about 5-10 minutes)
8. Copy your service URL (e.g., `https://clinic-os-backend.onrender.com`)

### Step 3: Update Frontend Config

Update `lib/config/backendConfig.ts`:

```typescript
export const BACKEND_CONFIG = {
  DEV_URL: 'http://192.168.31.63:3005',
  PROD_URL: 'https://clinic-os-backend.onrender.com', // Your Render URL
  ENVIRONMENT: 'production' as 'development' | 'production', // ← Change this
  // ...
};
```

### Step 4: Build APK

```bash
# Make sure to use production environment
eas build --platform android --profile production
```

## Option 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your backend repository
4. Add environment variables (SMTP credentials)
5. Railway will automatically detect Node.js and deploy
6. Copy your deployment URL
7. Update `PROD_URL` in `lib/config/backendConfig.ts`

## Option 3: Use Your Public IP (Temporary Solution)

**⚠️ Warning**: This only works if your device is on the same network as your development machine.

### Step 1: Find Your Public IP
Visit [whatismyip.com](https://whatismyip.com) to get your public IP.

### Step 2: Configure Port Forwarding
In your router settings:
- Forward port 3005 to your local machine
- Allow incoming connections on port 3005

### Step 3: Update Config
```typescript
PROD_URL: 'http://YOUR_PUBLIC_IP:3005',
ENVIRONMENT: 'production',
```

**⚠️ Note**: This solution is temporary and requires your computer to be on and your router to allow port forwarding.

## Testing Backend Deployment

Test your deployed backend:

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "OTP service is healthy",
  "emailConnection": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Building Production APK

### 1. Switch to Production Mode
In `lib/config/backendConfig.ts`:
```typescript
ENVIRONMENT: 'production', // Change from 'development'
```

### 2. Build APK
```bash
# With EAS Build
eas build --platform android --profile production

# Or local build
npx expo prebuild
cd android
./gradlew assembleRelease
```

### 3. Test OTP in APK
1. Install the APK on your device
2. Try sending an OTP
3. Check backend logs to ensure requests are received
4. Verify OTP works correctly

## Troubleshooting

### Issue: "Network request failed" in APK
**Solution**: Check that `ENVIRONMENT` is set to `'production'` and `PROD_URL` is correct.

### Issue: Backend returns 500 error
**Solution**: Check your backend logs for missing environment variables or SMTP configuration issues.

### Issue: OTP emails not sent
**Solution**: Verify that `SMTP_EMAIL` and `SMTP_APP_PASSWORD` are set correctly in your deployment environment.

### Issue: Backend times out
**Solution**: Render free tier instances sleep after 15 minutes of inactivity. Consider upgrading or use Railway/Render paid tier.

## Best Practices

1. **Environment Variables**: Never commit `.env` files to Git
2. **HTTPS**: Use HTTPS in production (Render provides this automatically)
3. **Monitoring**: Set up error monitoring (Sentry, etc.)
4. **Backup**: Keep regular backups of your backend configuration
5. **Testing**: Test backend deployment before building production APK

## Quick Reference

```typescript
// lib/config/backendConfig.ts
export const BACKEND_CONFIG = {
  DEV_URL: 'http://192.168.31.63:3005',          // Local testing
  PROD_URL: 'https://your-backend.onrender.com', // Deployed backend
  ENVIRONMENT: 'production',                      // ← Change for APK build
  getCurrentUrl: (): string => {
    return BACKEND_CONFIG.ENVIRONMENT === 'development' 
      ? BACKEND_CONFIG.DEV_URL 
      : BACKEND_CONFIG.PROD_URL;
  }
};
```

## Next Steps

1. Deploy backend to Render/Railway
2. Get deployment URL
3. Update `PROD_URL` in `backendConfig.ts`
4. Set `ENVIRONMENT: 'production'`
5. Build APK with `eas build`
6. Test OTP functionality in the APK

