import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";
import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { encryptData } from "../../utils/encryption";
import { handleLoginSuccess } from "../../utils/tokenManager";

export const signupUser = createAsyncThunk(
  "signup/signupUser",
  async ({ email, username, password, confirmPassword }, thunkAPI) => {
    try {
      // Frontend validation
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return thunkAPI.rejectWithValue({ message: "Passwords do not match" });
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return thunkAPI.rejectWithValue({ message: "Password must be at least 6 characters long" });
      }

      if (!username || username.trim().length < 3) {
        toast.error("Username must be at least 3 characters long");
        return thunkAPI.rejectWithValue({ message: "Username must be at least 3 characters long" });
      }

      // Prepare payload for encryption
      const payload = {
        email,
        username: username,
        password
      };

      // Encrypt the payload
      const encryptedData = encryptData(payload);

      // Send encrypted data to API (without token header)
      const response = await axiosInstance.post("/api/register/", {
        encryptedData
      }, {
        skipAuth: true // Custom flag to skip token
      });

      if (response.data) {
        toast.success("Registration successful! Please check your email for OTP verification.");
        return {
          message: response.data.details || "Registration successful",
          email: email // Store email for OTP verification
        };
      } else {
        toast.error("Registration failed");
        return thunkAPI.rejectWithValue(response);
      }
    } catch (error) {
      console.log("error");
      console.log(error);
      console.log("error.response");
      console.log(error.data.details.error);
      const errorMessage = error.data?.details?.error || "Registration failed";
      toast.error("Registration failed");
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "signup/verifyOTP",
  async ({ email, otp }, thunkAPI) => {
    try {
      // Prepare payload for encryption
      const payload = {
        email,
        otp: parseInt(otp)
      };

      const encryptedData = encryptData(payload);

      const response = await axiosInstance.post("/api/verify-email/", {
        encryptedData,
        otp: parseInt(otp) 
      }, {
        skipAuth: true 
      });

      if (response.data && response.data.details) {
        const { details } = response.data;
        const { user, tokens } = details;
        
        // Store tokens in cookies
        setCookie("token", tokens.access_token, { maxAge: tokens.expires_in });
        
        // Calculate expiration time
        const expiresAt = Date.now() + (tokens.expires_in * 1000);
        
        // Store user session in localStorage
        const userSession = {
          user: user,
          isLoginUser: false,
          isEmailVerified: true,
          expiresAt: expiresAt,
          isNewUser: true, // Mark as new user for onboarding
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user_session', JSON.stringify(userSession));
        
        // Initialize token management system
        handleLoginSuccess(tokens, expiresAt);
        
        toast.success("Email verified successfully! Welcome to the platform.");
        
        return {
          message: details.message,
          user: user,
          tokens: tokens,
          expiresAt: expiresAt
        };
      } else {
        toast.error("OTP verification failed");
        return thunkAPI.rejectWithValue(response);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "OTP verification failed";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

export const resendOTP = createAsyncThunk(
  "signup/resendOTP",
  async ({ email }, thunkAPI) => {
    try {
      // Send email without encryption as requested
      const response = await axiosInstance.post("/api/resend-otp/", {
        email: email
      }, {
        skipAuth: true // No token needed for resend OTP
      });

      if (response.data) {
        toast.success("OTP sent successfully! Please check your email.");
        return {
          message: response.data.message || "OTP sent successfully",
          email: email
        };
      } else {
        toast.error("Failed to send OTP");
        return thunkAPI.rejectWithValue({ message: "Failed to send OTP" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Failed to send OTP";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);