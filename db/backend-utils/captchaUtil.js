/**
 * Captcha verification utility for server-side validation
 * Verifies Google reCAPTCHA v2 tokens
 */

/**
 * Verifies a reCAPTCHA token with Google's verification API
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} remoteip - Optional: The user's IP address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyCaptcha(token, remoteip = null) {
    if (!token) {
        return {
            success: false,
            error: 'Captcha token is required'
        };
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not configured in environment variables');
        return {
            success: false,
            error: 'Captcha verification is not properly configured'
        };
    }

    try {
        const params = new URLSearchParams();
        params.append('secret', secretKey);
        params.append('response', token);
        if (remoteip) {
            params.append('remoteip', remoteip);
        }

        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        if (!response.ok) {
            console.error('reCAPTCHA API returned non-OK status:', response.status);
            return {
                success: false,
                error: 'Failed to verify captcha with Google'
            };
        }

        const data = await response.json();

        if (!data.success) {
            console.warn('reCAPTCHA verification failed:', data['error-codes']);

            const errorCodes = data['error-codes'] || [];
            let errorMessage = 'Captcha verification failed';

            if (errorCodes.includes('timeout-or-duplicate')) {
                errorMessage = 'Captcha has expired or was already used. Please try again.';
            } else if (errorCodes.includes('invalid-input-response')) {
                errorMessage = 'Invalid captcha response. Please refresh and try again.';
            } else if (errorCodes.includes('missing-input-response')) {
                errorMessage = 'Please complete the captcha verification.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }

        return {
            success: true
        };

    } catch (error) {
        console.error('Error verifying captcha:', error);
        return {
            success: false,
            error: 'An error occurred while verifying captcha. Please try again.'
        };
    }
}

/**
 * Middleware-style function to verify captcha from form data
 * @param {FormData} formData - The form data containing the captcha token
 * @param {string} clientIP - Optional: The client's IP address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyCaptchaFromFormData(formData, clientIP = null) {
    const captchaToken = formData.get('captchaToken');
    return await verifyCaptcha(captchaToken, clientIP);
}
