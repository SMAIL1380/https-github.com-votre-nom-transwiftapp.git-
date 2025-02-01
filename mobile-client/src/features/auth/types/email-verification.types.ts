export interface EmailVerificationStatus {
  isVerified: boolean;
  email: string;
  verificationSentAt?: Date;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  nextResendTime?: Date;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}
