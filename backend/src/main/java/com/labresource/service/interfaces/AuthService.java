package com.labresource.service.interfaces;

import com.labresource.dto.request.ForgotPasswordRequest;
import com.labresource.dto.request.GoogleAuthRequest;
import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RefreshTokenRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.request.ResetPasswordRequest;
import com.labresource.dto.request.VerifyOtpRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.AuthResponse;

public interface AuthService {

    ApiResponse<?> registerUser(RegisterRequest request);

    AuthResponse loginUser(LoginRequest request);

    AuthResponse googleAuth(GoogleAuthRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    ApiResponse<?> forgotPassword(ForgotPasswordRequest request);

    ApiResponse<?> verifyOtp(VerifyOtpRequest request);

    ApiResponse<?> resetPassword(ResetPasswordRequest request);
}
