import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axios";
import { toast } from "react-toastify";
import { setCookie } from "cookies-next";
import { encryptData } from "../../utils/encryption";
import { handleLoginSuccess } from "../../utils/tokenManager";

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async ({ user, password }, thunkAPI) => {
    try {
      if (!user || !password) {
        toast.error("Please fill in all fields");
        return thunkAPI.rejectWithValue({ message: "Please fill in all fields" });
      }

      const payload = {
        user,
        password
      };

      const encryptedData = encryptData(payload);

      const response = await axiosInstance.post("/api/login/", {
        encryptedData
      }, {
        skipAuth: true 
      });

      if (response.data && response.data.details) {
        const { details } = response.data;
        const { data } = details;
        const { tokens } = data;
        
        setCookie("token", tokens.access_token, { maxAge: tokens.expires_in });
        
        const expiresAt = Date.now() + (tokens.expires_in * 1000);
        
        // Store user session in localStorage
        const userSession = {
          user: { user },
          isLoginUser: true,
          isEmailVerified: true,
          expiresAt: expiresAt,
          isNewUser: true, // Mark as new user for onboarding
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user_session', JSON.stringify(userSession));
        
        // Initialize token management system
        handleLoginSuccess(tokens, expiresAt);
        
        toast.success("Login successful! Welcome back.");
        
        return {
          message: details.message,
          user: { user }, 
          tokens: tokens,
          expiresAt: expiresAt
        };
      } else {
        toast.error("Login failed");
        return thunkAPI.rejectWithValue(response);
      }
    } catch (error) {
      const errorMessage = error.data?.details?.error ||"Login failed";
      toast.error("Login failed");
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);