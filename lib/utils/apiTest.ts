// API Test utilities for debugging
import { API_CONFIG, getApiUrl } from '../config/api';

export const testApiEndpoint = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.SEND_OTP);
    console.log('🧪 Testing API endpoint:', apiUrl);
    
    // Test with a dummy request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        otp: '123456' 
      }),
    });

    const responseText = await response.text();
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('📡 Response body:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          message: 'API endpoint is working correctly',
          details: { status: response.status, data }
        };
      } catch (parseError) {
        return {
          success: false,
          message: `API returned non-JSON response: ${responseText.substring(0, 100)}...`,
          details: { status: response.status, responseText }
        };
      }
    } else {
      return {
        success: false,
        message: `API returned error ${response.status}: ${responseText.substring(0, 200)}...`,
        details: { status: response.status, responseText }
      };
    }
  } catch (error: any) {
    console.error('🚨 API test error:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      details: { error: error.message }
    };
  }
};

export const testApiHealth = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const baseUrl = API_CONFIG.BASE_URL;
    const healthUrl = `${baseUrl}/api/health`;
    
    console.log('🏥 Testing API health:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
    });

    if (response.ok) {
      return {
        success: true,
        message: 'API health check passed'
      };
    } else {
      return {
        success: false,
        message: `API health check failed: ${response.status}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Health check failed: ${error.message}`
    };
  }
};
