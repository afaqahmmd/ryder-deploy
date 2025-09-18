import { createSlice } from "@reduxjs/toolkit";
import { signupUser, verifyOTP, resendOTP } from "./signupThunk";
import { logout } from "../../utils/authUtils";

const initialState = {
  user: null,
  tokens: null,
  isLoading: false,
  isVerifying: false,
  isResending: false,
  isSignupComplete: false,
  isEmailVerified: false,
  email: null,
  error: null,
  expiresAt: null,
  resendCountdown: 0,
  canResendOtp: false,
};

export const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    clearSignupState: (state) => {
      state.user = null;
      state.tokens = null;
      state.isSignupComplete = false;
      state.isEmailVerified = false;
      state.email = null;
      state.error = null;
      state.expiresAt = null;
      state.resendCountdown = 0;
      state.canResendOtp = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.tokens = null;
      state.isSignupComplete = false;
      state.isEmailVerified = false;
      state.email = null;
      state.error = null;
      state.expiresAt = null;
      state.resendCountdown = 0;
      state.canResendOtp = false;
      
      // Use the centralized logout utility
      logout();
    },
    clearSignupError: (state) => {
      state.error = null;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    startResendCountdown: (state) => {
      state.resendCountdown = 120; // 2 minutes in seconds
      state.canResendOtp = false;
    },
    updateResendCountdown: (state) => {
      if (state.resendCountdown > 0) {
        state.resendCountdown -= 1;
      }
      if (state.resendCountdown === 0) {
        state.canResendOtp = true;
      }
    },
    resetResendCountdown: (state) => {
      state.resendCountdown = 0;
      state.canResendOtp = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Signup user cases
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSignupComplete = true;
        state.email = action.payload.email;
        state.error = null;
        // Start 2-minute countdown after successful signup
        state.resendCountdown = 120;
        state.canResendOtp = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Signup failed";
      })
      // Verify OTP cases
      .addCase(verifyOTP.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.isEmailVerified = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.expiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload?.message || "OTP verification failed";
      })
      // Resend OTP cases
      .addCase(resendOTP.pending, (state) => {
        state.isResending = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isResending = false;
        state.error = null;
        // Start 2-minute countdown after successful resend
        state.resendCountdown = 120;
        state.canResendOtp = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isResending = false;
        state.error = action.payload?.message || "Failed to send OTP";
      })
      // // Refresh token cases
      // .addCase(refreshAccessToken.pending, (state) => {
      //   // Optionally add a refreshing state
      // })
      // .addCase(refreshAccessToken.fulfilled, (state, action) => {
      //   state.tokens = action.payload.tokens;
      //   state.expiresAt = action.payload.expiresAt;
      // })
      // .addCase(refreshAccessToken.rejected, (state, action) => {
      //   // Token refresh failed, clear auth state
      //   state.user = null;
      //   state.tokens = null;
      //   state.expiresAt = null;
      //   state.isEmailVerified = false;
      // });
  },
});

export const { clearSignupState, clearSignupError, setEmail, startResendCountdown, updateResendCountdown, resetResendCountdown, logoutUser } = signupSlice.actions;
export default signupSlice.reducer;
