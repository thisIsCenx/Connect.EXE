import { useState, useEffect } from 'react';
import './styles/ForgotPasswordForm.scss';
import { forgotPassword, verifyOtp, resetPassword } from '../../services/AuthService';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaKey } from 'react-icons/fa';
import type { ForgotPasswordRequestDTO, VerifyOtpRequestDTO, ResetPasswordRequestDTO } from '../../types/request/AuthRequestDTO';
import { RouteConst } from '../../constants/RouteConst';
import { VALIDATION } from '../../constants/AuthConst';
import { Regex } from '../../constants/Regex';

// ====== CONSTANTS FOR OTP BUSINESS RULES ======
// (OTP_RESEND_LIMIT, OTP_FAILED_LIMIT) are only used in BE, not needed in FE if not used
const OTP_EXPIRE_MINUTES = 5;
const OTP_RESEND_COUNTDOWN = 60; // seconds
const OTP_CODE_LENGTH = 6;
const OTP_TOTAL_SECONDS = OTP_EXPIRE_MINUTES * 60;

interface ForgotPasswordFormProps {
  onClose: () => void;
}

const ForgotPasswordForm = ({ onClose }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendDisabled, setSendDisabled] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(OTP_RESEND_COUNTDOWN);
  const [resendExceeded, setResendExceeded] = useState(false); // New state for resend exceeded
  const [otpCountdown, setOtpCountdown] = useState(OTP_TOTAL_SECONDS);

  const isValidEmail = (email: string) => Regex.EMAIL.test(email);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    // Không xóa thông báo thành công khi resendCountdown về 0
    // Chỉ xóa thông báo lỗi, giữ lại thông báo thành công
    return () => clearTimeout(timer);
  }, [resendCountdown, step]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'otp' && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown, step]);

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendOtp = async () => {
    setMessage(''); // Reset message when resending OTP
    if (!isValidEmail(email)) {
      setMessage('auth.validation.invalidEmail');
      return;
    }

    setSendDisabled(true);
    try {
      const payload: ForgotPasswordRequestDTO = { email };
      // Ensure sending email in body
      const res = await forgotPassword(payload);
      setMessage(res?.message || 'OTP has been sent to your email.');
      setStep('otp');
      setResendCountdown(OTP_RESEND_COUNTDOWN);
      setOtpCountdown(OTP_TOTAL_SECONDS);
      setResendExceeded(false); // Reset resend exceeded state
    } catch (err: any) {
      // Show backend message if any, otherwise generic error
      setMessage(err.response?.data?.message || 'Server error. Please try again.');
      setSendDisabled(false);
      if (
        err.response?.data?.message === 'Bạn đã gửi lại mã OTP quá 5 lần trong ngày. Vui lòng thử lại vào ngày mai hoặc liên hệ hỗ trợ nếu cần giúp đỡ.' ||
        err.response?.data?.message === 'You have exceeded the maximum of 5 OTP resends per day. Please try again tomorrow or contact support if you need help.' ||
        err.response?.data?.message === 'You have exceeded the maximum number of OTP resends per day. Please try again tomorrow or contact support if you need help.'
      ) {
        setResendExceeded(true);
      }
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const payload: VerifyOtpRequestDTO = { email, otp };
      // Ensure sending email and otp in body
      const res = await verifyOtp(payload);
      setMessage(res?.message || 'OTP verified.');
      setStep('reset');
    } catch (err: any) {
      // Handle OTP expired and OTP incorrect separately
      const rawMsg = err.response?.data?.message || '';
      if (rawMsg.includes('hết hạn') || rawMsg.toLowerCase().includes('expired')) {
        setMessage('OTP has expired.');
      } else if (rawMsg.includes('không đúng') || rawMsg.toLowerCase().includes('incorrect')) {
        setMessage('OTP is incorrect.');
      } else {
        setMessage(rawMsg || 'OTP verification failed.');
      }
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      setMessage(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setMessage('Password must include upper-case, lower-case, number and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const payload: ResetPasswordRequestDTO = { email, newPassword };
      // Ensure sending email and newPassword in body
      const res = await resetPassword(payload);
      setMessage(res?.message || 'Password reset successfully.');
      setTimeout(() => {
        onClose();
        window.location.href = RouteConst.LOGIN;
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Server error. Please try again.');
    }
  };

  return (
    <div className="verify-overlay">
      <div className="verify-modal">
        {/* Header */}
          <div className="verify-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn-close" onClick={onClose} aria-label="close" style={{ alignSelf: 'flex-end' }}>
            ×
          </button>
          <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="icon-lock-inline"><FaLock /></span>
            <h2 className="verify-title-inline" style={{ margin: 0 }}>Forgot Password</h2>
          </div>
        </div>

        {/* Content */}
        <div className="verify-content" style={{ marginBottom: 24 }}>
          {step === 'email' && (
            <>
              <div style={{ maxWidth: 320, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ marginBottom: 12, fontSize: 15, fontWeight: 500, textAlign: 'left', marginLeft: 10 }}>
                  Enter your email
                </div>
                <div className="input-group-modern input-group-compact" style={{ position: 'relative' }}>
                  <span className="input-icon-modern" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: 16 }}>
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="verify-input-modern input-compact"
                    style={{ paddingLeft: 38, fontSize: 16, width: '100%' }}
                  />
                </div>
                {message && (
                  <span className="verify-message" style={{ display: 'block', marginTop: 6, color: '#d32f2f', textAlign: 'left', fontSize: 15, marginLeft: 0, paddingLeft: 0 }}>
                    {message.replace(/^[\s✔✅❌]+/, '')}
                  </span>
                )}
              </div>
            </>
          )}
          {step === 'otp' && (
            <>
              <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
                <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', marginBottom: 8, fontSize: 15, fontWeight: 500 }}>
                  Enter verification code for <strong>{email}</strong>
                </p>
                <div className="input-group-modern input-group-compact" style={{ marginLeft: 0, marginRight: 0, width: '100%' }}>
                  <span className="input-icon-modern"><FaKey /></span>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    maxLength={OTP_CODE_LENGTH}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    onChange={(e) => {
                      // Chỉ cho phép nhập số và tối đa OTP_CODE_LENGTH ký tự
                      const val = e.target.value.replace(/\D/g, '').slice(0, OTP_CODE_LENGTH);
                      setOtp(val);
                    }}
                    className="verify-input-modern input-compact"
                    style={{ width: '100%' }}
                  />
                </div>
                {/* Error/success message highlight */}
                {message && (
                  <span style={{ color: '#d32f2f', fontSize: 15, display: 'block', textAlign: 'left', fontWeight: 500, marginTop: 8 }}>
                    {message.replace(/^[\s✔✅❌]+/, '')}
                  </span>
                )}
              </div>
              {/* OTP expiration time, faded color, at the bottom */}
              <div style={{ color: '#bbb', fontSize: 12, marginTop: 50, marginBottom: 0, textAlign: 'center' }}>
                Expires in {Math.floor(otpCountdown / 60)} minutes ({formatTime(otpCountdown)})
              </div>
              {/* Note for business rule, only show when too many failed attempts */}
            </>
          )}
          {step === 'reset' && (
            <>
              <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
                <div className="input-group-modern input-group-compact password-wrapper" style={{ position: 'relative' }}>
                  <span className="input-icon-modern" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: 16 }}>
                    <FaLock />
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="verify-input-modern input-compact"
                    style={{ paddingLeft: 38, fontSize: 16, width: '100%' }}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="input-group-modern input-group-compact password-wrapper" style={{ position: 'relative' }}>
                  <span className="input-icon-modern" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: 16 }}>
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="verify-input-modern input-compact"
                    style={{ paddingLeft: 38, fontSize: 16, width: '100%' }}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {message && (
                  <span className="verify-message" style={{ display: 'block', marginTop: 6, color: '#d32f2f', fontSize: 15, marginLeft: -25 }}>
                    {message.replace(/^[\s✔✅❌]+/, '')}
                  </span>
                )}
              </div>
              <div style={{ maxWidth: 320, margin: '50px auto 15px auto', width: '100%' }}>
                <button className="btn-verify-modern" onClick={handleResetPassword} style={{ width: '100%' }}>
                  Reset password
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="verify-footer" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {step === 'otp' && (
            <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 8 }}>
              You can enter the OTP incorrectly up to 5 times per code and can only resend the OTP up to 5 times per day.
            </div>
          )}
          <div className="button-group-modern button-group-row" style={{ justifyContent: step === 'otp' ? 'space-between' : 'flex-end', gap: 12 }}>
            {/* Add margin-top 30px for button group in OTP step */}
            {step === 'otp' && (
              <style>{`.button-group-modern.button-group-row { margin-top: 30px !important; }`}</style>
            )}
            {step === 'email' && (
              <button onClick={handleSendOtp} className="btn-verify-modern" disabled={sendDisabled} style={{ marginLeft: 20, marginRight: 20, marginTop: 18 }}>
                {sendDisabled ? 'Sending...' : 'Send code'}
              </button>
            )}
            {step === 'otp' && (
              <>
                <button
                  className="btn-cancel-modern"
                  onClick={handleSendOtp}
                  disabled={resendCountdown > 0 || resendExceeded}
                >
                  {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : 'Resend code'}
                </button>
                <button
                  className="btn-verify-modern"
                  onClick={handleVerifyOtp}
                  disabled={otp.length === 0 || resendExceeded}
                >
                  Verify code
                </button>
              </>
            )}
            {step === 'reset' && (
              <>
                {/* The button is now rendered inside the div */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;