#!/bin/bash

# EmailJS Setup Script for ClinicOS Mobile App

echo "🚀 Setting up EmailJS for ClinicOS Mobile App..."

echo ""
echo "📋 Step-by-step setup:"
echo "1. Go to https://www.emailjs.com/"
echo "2. Create a free account"
echo "3. Add Gmail service with your SMTP credentials"
echo "4. Create email template (see SMTP_EMAILJS_SETUP.md)"
echo "5. Get your credentials and update .env file"
echo ""

echo "📝 Create .env file with these variables:"
echo "EXPO_PUBLIC_EMAILJS_SERVICE_ID=your-service-id"
echo "EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id"
echo "EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key"
echo ""

echo "📖 For detailed instructions, see:"
echo "- SMTP_EMAILJS_SETUP.md (complete setup guide)"
echo "- FRONTEND_EMAIL_SETUP.md (general EmailJS guide)"
echo ""

echo "🧪 Quick test (no setup required):"
echo "1. Run your mobile app"
echo "2. Try patient login"
echo "3. Check console for OTP"
echo "4. Use OTP from console to login"
echo ""

echo "✅ Setup complete! Follow the guides above to configure EmailJS."
