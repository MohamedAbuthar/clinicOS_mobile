// Quick test script to verify email service
// Run this to test your email configuration

const EMAILJS_CONFIG = {
  serviceId: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || '',
  publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

async function testEmailService() {
  console.log('🧪 Testing EmailJS Configuration...');
  console.log('Service ID:', EMAILJS_CONFIG.serviceId ? '✅ Set' : '❌ Missing');
  console.log('Public Key:', EMAILJS_CONFIG.publicKey ? '✅ Set' : '❌ Missing');
  
  if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.publicKey) {
    console.log('❌ EmailJS not configured properly');
    console.log('📝 Create .env file with:');
    console.log('EXPO_PUBLIC_EMAILJS_SERVICE_ID=your-service-id');
    console.log('EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key');
    return;
  }
  
  console.log('✅ EmailJS configuration looks good!');
  console.log('📧 Ready to send emails');
}

testEmailService();
