#!/bin/bash

# ClinicOS Mobile App Email Setup Script

echo "🚀 Setting up email service for ClinicOS Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install express nodemailer cors dotenv nodemon --save

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Backend Email Service Environment Variables
SMTP_EMAIL=your-email@gmail.com
SMTP_APP_PASSWORD=your-app-password
PORT=3000
NODE_ENV=development
EOF
    echo "⚠️  Please update .env file with your Gmail credentials"
fi

# Create package.json for backend
if [ ! -f package.json ]; then
    echo "📝 Creating package.json for backend..."
    cp backend-package.json package.json
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your Gmail credentials"
echo "2. Run: node backend-server.js"
echo "3. Update your mobile app's EXPO_PUBLIC_BACKEND_URL to http://localhost:3000"
echo "4. Test the patient login in your mobile app"
echo ""
echo "📖 For detailed instructions, see EMAIL_SETUP_GUIDE.md"
