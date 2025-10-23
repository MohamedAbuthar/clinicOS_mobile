# ClinicOS Mobile Backend

A TypeScript backend service for the ClinicOS mobile application, handling OTP sending and verification.

## Features

- ✅ **OTP Sending** - Send OTP emails via Gmail SMTP
- ✅ **OTP Verification** - Verify OTP codes with rate limiting
- ✅ **Rate Limiting** - Prevent spam and abuse
- ✅ **Email Templates** - Beautiful HTML email templates
- ✅ **Health Checks** - Monitor service status
- ✅ **Auto Cleanup** - Remove expired OTPs automatically

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
The `.env` file is already configured with your SMTP credentials:
```env
SMTP_EMAIL=abutharskt@gmail.com
SMTP_APP_PASSWORD=osrb bxqc cvln onya
PORT=3001
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Or build and start
npm run build
npm start
```

### 4. Test the API
```bash
# Health check
curl http://localhost:3001/api/otp/health

# Send OTP
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify OTP
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## API Endpoints

### POST `/api/otp/send`
Send OTP to email address.

**Request:**
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

### POST `/api/otp/verify`
Verify OTP code.

**Request:**
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

### GET `/api/otp/health`
Check service health and email connection.

**Response:**
```json
{
  "success": true,
  "message": "OTP service is healthy",
  "emailConnection": true,
  "otpStats": {
    "total": 0,
    "emails": []
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Configuration

### Environment Variables
- `SMTP_EMAIL` - Your Gmail address
- `SMTP_APP_PASSWORD` - Your Gmail app password
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### CORS Configuration
The server is configured to accept requests from:
- `http://localhost:3000` (React web apps)
- `http://localhost:8081` (Expo development)
- `exp://192.168.1.100:8081` (Expo on network)

## Development

### Project Structure
```
backend/
├── src/
│   ├── routes/
│   │   └── otpRoutes.ts      # API routes
│   ├── services/
│   │   ├── emailService.ts   # Email sending
│   │   └── otpService.ts     # OTP management
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── server.ts             # Main server file
├── package.json
├── tsconfig.json
└── .env
```

### Scripts
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run watch` - Watch mode for development

## Security Features

- **Rate Limiting** - 1 minute cooldown between OTP requests
- **Attempt Limiting** - Maximum 3 attempts per OTP
- **Expiration** - OTPs expire after 3 minutes
- **Input Validation** - Email format validation
- **CORS Protection** - Restricted to mobile app origins

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify Gmail app password is correct
3. Check server logs for error messages
4. Test email connection: `curl http://localhost:3001/api/otp/health`

### CORS Issues
1. Ensure mobile app is running on allowed origins
2. Check CORS configuration in `server.ts`
3. Verify request headers include `Content-Type: application/json`

### OTP Verification Failing
1. Check if OTP has expired (3 minutes)
2. Verify email address matches exactly
3. Check attempt limit (max 3 attempts)
4. Look for typos in OTP code

## Production Deployment

For production deployment:

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   PORT=3001
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name clinic-os-backend
   ```

## Support

For issues or questions:
1. Check the server logs
2. Test API endpoints with curl
3. Verify environment configuration
4. Check Gmail SMTP settings
