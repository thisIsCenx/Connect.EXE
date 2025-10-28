import React, { useEffect, useState } from 'react';
import { FaKey, FaLock } from 'react-icons/fa';

interface RegisterVerifyOTPProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
  verifyRegisterCode: (email: string, code: string) => Promise<any>;
  resendRegisterCode: (email: string) => Promise<any>;
  isSubmitting?: boolean;
}

// ====== CONSTANTS FOR OTP BUSINESS RULES ======
const OTP_CODE_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 300;
const RESEND_INTERVAL_SECONDS = 60;

// ====== FUNCTION TO MAP OTP ERROR MESSAGE TO i18n ======
// Map backend messages to plain English messages for the UI
const mapVerifyMessage = (beMsg: string): string => {
  if (!beMsg) return '';
  // Map for too many OTP resend attempts
  if (
    beMsg === 'Bạn đã gửi lại mã OTP quá 5 lần trong ngày. Vui lòng thử lại vào ngày mai hoặc liên hệ hỗ trợ nếu cần giúp đỡ.' ||
    beMsg === 'You have exceeded the maximum number of OTP resends per day. Please try again tomorrow or contact support if you need help.' ||
    beMsg.includes('quá 5 lần') ||
    beMsg.toLowerCase().includes('maximum number of otp resends')
  ) {
    return 'You have exceeded the maximum number of OTP resends per day.';
  }
  // Too many failed attempts
  if (
    beMsg === 'Bạn đã nhập sai mã OTP quá nhiều lần. Vui lòng yêu cầu gửi lại mã mới hoặc liên hệ hỗ trợ.' ||
    beMsg === 'You have entered the OTP incorrectly too many times. Please request a new code or contact support.' ||
    beMsg.includes('quá nhiều lần') ||
    beMsg.toLowerCase().includes('too many times')
  ) {
    return 'You have entered the OTP incorrectly too many times. Please request a new code or contact support.';
  }
  // Incorrect OTP
  if (
    beMsg === 'Verification code is incorrect.' ||
    beMsg === 'OTP is incorrect.' ||
    beMsg === 'OTP không đúng.'
  ) {
    return 'Verification code is incorrect.';
  }
  // Code already used
  if (beMsg === 'Verification code has already been used.') {
    return 'Verification code has already been used.';
  }
  // Already verified
  if (beMsg === 'Your account is already verified.') {
    return 'Your account is already verified.';
  }
  // Expired
  if (beMsg === 'OTP đã hết hạn.' || beMsg === 'OTP has expired.') {
    return 'OTP has expired.';
  }
  // Other cases
  return beMsg;
};

export const RegisterVerifyOTP: React.FC<RegisterVerifyOTPProps> = ({
  email,
  onSuccess,
  onCancel,
  verifyRegisterCode,
  resendRegisterCode,
  isSubmitting = false,
}) => {
  // const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpStartTime, setOtpStartTime] = useState<number | null>(Date.now());
  const [remainingTime, setRemainingTime] = useState(OTP_EXPIRE_SECONDS);
  const [resendCountdown, setResendCountdown] = useState(RESEND_INTERVAL_SECONDS);
  const [otpExpired, setOtpExpired] = useState(false);

  useEffect(() => {
    if (!otpStartTime) return;
    setRemainingTime(OTP_EXPIRE_SECONDS);
    setOtpExpired(false);
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - otpStartTime) / 1000);
      const timeLeft = OTP_EXPIRE_SECONDS - elapsed;
      if (timeLeft <= 0) {
        setOtpExpired(true);
        setRemainingTime(0);
        clearInterval(interval);
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpStartTime]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Không xóa thông báo thành công khi resendCountdown về 0
    // Chỉ xóa thông báo lỗi, giữ lại thông báo thành công
  }, [resendCountdown]);

  const isResendExceeded = verifyMessage === 'You have exceeded the maximum number of OTP resends per day.';

  const handleVerify = async () => {
    setShowResendSuccess(false);
    const targetEmail = (email || localStorage.getItem('register_email') || '').trim().toLowerCase();
    if (!targetEmail) {
      setVerifyMessage('No user found with the provided email.');
      return;
    }
    if (otpExpired) {
      setVerifyMessage('OTP has expired.');
      return;
    }
    try {
      const response = await verifyRegisterCode(targetEmail, verificationCode);
      
      // Kiểm tra response từ backend
      if (response.success) {
        setVerifyMessage('Your account has been verified.');
        // Giữ lại thông báo thành công cho user thấy ít nhất 2s trước khi chuyển trang
        setTimeout(() => {
          setVerifyMessage('');
          onSuccess();
        }, 2000);
      } else {
        // Xử lý thông báo lỗi từ backend
        let beMsg = response.message || '';
        console.log('OTP VERIFY BACKEND MESSAGE:', beMsg); // log message để debug mapping FE
        setVerifyMessage(mapVerifyMessage(beMsg));
      }
    } catch (err: any) {
      let beMsg = err.response?.data?.message || err.message || '';
      console.log('OTP VERIFY BACKEND MESSAGE (catch):', beMsg); // log message để debug mapping FE
      setVerifyMessage(mapVerifyMessage(beMsg));
    }
  };

  const handleResend = async () => {
    const targetEmail = (email || localStorage.getItem('register_email') || '').trim().toLowerCase();
    if (!targetEmail) {
      setVerifyMessage('No user found with the provided email.');
      return;
    }
    setIsResending(true);
    setVerifyMessage('');
    try {
      await resendRegisterCode(targetEmail);
      setShowResendSuccess(true);
  setVerifyMessage('OTP sent successfully.');
      setOtpStartTime(Date.now());
      setRemainingTime(OTP_EXPIRE_SECONDS);
      setResendCountdown(RESEND_INTERVAL_SECONDS);
      
      // Giữ thông báo thành công hiển thị ít nhất 3 giây
      setTimeout(() => {
        if (showResendSuccess) {
          setShowResendSuccess(false);
        }
      }, 3000);
    } catch (err: any) {
      setShowResendSuccess(false);
      setVerifyMessage('');
      if (err.response?.data?.message) {
        const beMsg = err.response.data.message as string;
        setVerifyMessage(mapVerifyMessage(beMsg));
      } else {
        setVerifyMessage('Failed to resend OTP. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-overlay">
      <div className="verify-modal">
        {/* Header */}
        <div className="verify-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn-close" onClick={onCancel} aria-label="close" style={{ alignSelf: 'flex-end' }}>
            ×
          </button>
          <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="icon-lock-inline"><FaLock /></span>
            <h2 className="verify-title-inline" style={{ margin: 0 }}>Verify your email</h2>
          </div>
        </div>
        {/* Content */}
        <div className="verify-content" style={{ marginBottom: 24 }}>
          <div style={{ maxWidth: 400, margin: 0 }}>
            <div className="otp-block">
              <p className="otp-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', paddingLeft: 8, marginBottom: 8 }}>
                Sent to your email <strong>{email}</strong>
              </p>
            </div>
            <div className="input-group-modern input-group-compact" style={{ marginLeft: 25, marginRight: 25 }}>
              <span className="input-icon-modern"><FaKey /></span>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  // Chỉ cho phép nhập số và tối đa OTP_CODE_LENGTH ký tự
                  const val = e.target.value.replace(/\D/g, '').slice(0, OTP_CODE_LENGTH);
                  setVerificationCode(val);
                }}
                placeholder={'Enter OTP'}
                maxLength={OTP_CODE_LENGTH}
                className="verify-input-modern input-compact"
              />
            </div>
            {/* Error/success message highlight */}
            {(verifyMessage || showResendSuccess) && (
              <span style={{ 
                color: (verifyMessage && (verifyMessage.toLowerCase().includes('thành công') || verifyMessage.toLowerCase().includes('success'))) || showResendSuccess ? '#388e3c' : '#d32f2f', 
                fontSize: 16, 
                display: 'block', 
                textAlign: 'left', 
                fontWeight: 500, 
                paddingLeft: 8, 
                marginTop: 8, 
                marginLeft: 25 
              }}>
                {showResendSuccess ? 'OTP sent successfully.' : verifyMessage}
              </span>
            )}
          </div>
          {/* OTP expiration time, faded color, at the bottom */}
          <div style={{ color: '#bbb', fontSize: 12, marginTop: 50, marginBottom: 0, textAlign: 'center' }}>
            Expires in {Math.floor(remainingTime / 60)} minutes ({Math.floor(remainingTime / 60).toString().padStart(2, '0')}:{(remainingTime % 60).toString().padStart(2, '0')})
          </div>
        </div>
        {/* Footer */}
        <div className="verify-footer" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 8, textAlign: 'justify' }}>
            You can enter the OTP incorrectly up to 5 times per code and can only resend the OTP up to 5 times per day.
          </div>
          <div className="button-group-modern button-group-row" style={{ justifyContent: 'flex-end', gap: 12, marginTop: 30 }}>
            <button
              className="btn-cancel-modern"
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResendExceeded || isResending}
            >
              {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : 'Resend code'}
            </button>
            <button
              className="btn-verify-modern"
              onClick={handleVerify}
              disabled={verificationCode.length === 0 || otpExpired || isResendExceeded || isSubmitting}
            >
              {'Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 