
import { API_CONFIG, getApiUrl } from '../config/api';

export interface EmailResponse {
    success: boolean;
    message: string;
}

/**
 * Send login credentials to assistant's email via the web backend API
 * @param email - Assistant's email address
 * @param password - Assistant's password
 * @param name - Assistant's full name
 * @returns Promise with success status and message
 */
export const sendAssistantPasswordEmail = async (
    email: string,
    password: string,
    name: string
): Promise<EmailResponse> => {
    try {
        const url = getApiUrl(API_CONFIG.ENDPOINTS.SEND_ASSISTANT_CREDENTIALS);

        console.log(`📧 Sending credentials to ${email} via ${url}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                name,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Email API failed:', data);
            return {
                success: false,
                message: data.message || `Server error: ${response.status}`,
            };
        }

        if (data.success) {
            console.log(`✅ Email sent successfully to ${email}`);
            return {
                success: true,
                message: 'Login credentials sent successfully.',
            };
        } else {
            console.warn(`⚠️ Email sent request returned failure: ${data.message}`);
            return {
                success: false,
                message: data.message || 'Failed to send email.',
            };
        }
    } catch (error: any) {
        console.error('❌ Error calling email API:', error);
        return {
            success: false,
            message: error.message || 'Network request failed.',
        };
    }
};
