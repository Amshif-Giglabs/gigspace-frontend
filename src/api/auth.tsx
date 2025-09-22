import { BASE_URL } from "@/constants";

export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  otp_id:string;
  session_id?: string;
  expires_in:number;
  message?: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp_code: string;
  session_id: string;
}

export interface VerifyOtpResponse {
  access_token?: string;
  user_id?: string;
  user?: any;
  token_type?: string;
  message?: string;
  success?: boolean;
}

export const sendOtp = async (phoneNumber: string, email: string): Promise<SendOtpResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneNumber,
        email: email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send OTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error sending OTP:", err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Failed to send OTP");
  }
};

export const verifyOtp = async (
  phoneNumber: string,
  otpCode: string,
  email: string,
  name: string
): Promise<VerifyOtpResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneNumber,
        otp_code: otpCode,
        email: email,
        full_name: name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to verify OTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error verifying OTP:", err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Failed to verify OTP");
  }
};

// Helper function to store auth token
export const storeAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};