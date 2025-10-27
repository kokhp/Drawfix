import { TokenResponse } from "../../../models/auth.model";

export interface VerifyPhoneResponse {
  requestId: string;
  otp: string;
  expiredAt: Date;
  resendRemains: number;
  otpLength: number;
  otpResendInterval: number;
}

export interface VerifyPhoneSubmitResponse extends TokenResponse {
  userId: string;
  loginId: string;
}


