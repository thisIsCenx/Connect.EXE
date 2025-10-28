import React, { useState } from 'react';
// translations removed; using plain strings
import './styles/RegisterForm.scss';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaPhone, FaBirthdayCake, FaIdCard, FaTransgender, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequestDTO } from '../../types/request/AuthRequestDTO';
import { GENDER_OPTIONS } from '../../constants/AuthConst';
import { checkEmailUnique, checkPhoneUnique } from '../../services/AuthService';

interface RegisterFormProps {
  form: RegisterRequestDTO & { confirmPassword: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  message: string;
  isSubmitting: boolean;
  fieldErrors?: { 
    email?: string; 
    phoneNumber?: string; 
    identityCard?: string;
    password?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    confirmPassword?: string;
  };
}

export const RegisterForm = ({
  form,
  onChange,
  onSubmit,
  message,
  isSubmitting,
  fieldErrors = {},
}: RegisterFormProps) => {
  // translation hook removed
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [localFieldErrors, setLocalFieldErrors] = useState<{ email?: string; phoneNumber?: string }>({});

  const handleBack = () => {
    navigate('/login');
  };

  // Validate email on blur
  const handleEmailBlur = async () => {
    if (form.email) {
      try {
        const res = await checkEmailUnique(form.email);
        const available = res?.data?.available;
        setLocalFieldErrors((prev) => ({ 
          ...prev, 
          email: available === false ? 'Email này đã được sử dụng.' : undefined 
        }));
      } catch {
        // On error, don't block the user here; leave message empty
      }
    }
  };

  // Validate phone on blur
  const handlePhoneBlur = async () => {
    if (form.phoneNumber) {
      try {
        const res = await checkPhoneUnique(form.phoneNumber);
        const available = res?.data?.available;
        setLocalFieldErrors((prev) => ({ 
          ...prev, 
          phoneNumber: available === false ? 'Số điện thoại này đã được sử dụng.' : undefined 
        }));
      } catch {
        // ignore errors for blur check
      }
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <form
          onSubmit={(e) => {
              if (!agreed) {
              e.preventDefault();
              alert('Bạn phải đồng ý với điều khoản để đăng ký.');
              return;
            }
            onSubmit(e);
          }}
          className="register-form-box"
          autoComplete="off"
        >
          <h1 className="logo">Đăng ký</h1>

          {/* Hidden decoy fields to discourage password managers */}
          <input type="text" name="_fake_username" autoComplete="username" tabIndex={-1} style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
          <input type="password" name="_fake_password" autoComplete="new-password" tabIndex={-1} style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />

          <div className="form-grid">
            <div className="input-group">
              <label>Họ và tên</label>
              <div className="input-wrapper">
                <FaUser className="icon" />
                <input 
                  name="fullName" 
                  placeholder={'Họ và tên'} 
                  value={form.fullName} 
                  onChange={onChange}
                  autoComplete="name"
                  required 
                />
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.fullName ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.fullName || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="icon" />
                <input 
                  type="text" 
                  name="email" 
                  placeholder="email@example.com" 
                  value={form.email} 
                  onChange={onChange} 
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  required 
                />
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: (fieldErrors.email || localFieldErrors.email) ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.email || localFieldErrors.email || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <FaPhone className="icon" />
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  placeholder="VD: 0901234567" 
                  value={form.phoneNumber} 
                  onChange={onChange} 
                  onBlur={handlePhoneBlur}
                  autoComplete="tel"
                  required 
                />
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: (fieldErrors.phoneNumber || localFieldErrors.phoneNumber) ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.phoneNumber || localFieldErrors.phoneNumber || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Số CMND/CCCD</label>
              <div className="input-wrapper">
                <FaIdCard className="icon" />
                <input 
                  name="identityCard" 
                  placeholder="VD: 012345678901" 
                  value={form.identityCard} 
                  onChange={onChange}
                  autoComplete="off"
                  required 
                />
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.identityCard ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.identityCard || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Mật khẩu</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <FaLock className="icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                />
                <span
                  className="eye-icon"
                  style={{ cursor: 'pointer', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.password ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.password || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Xác nhận mật khẩu</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <FaLock className="icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={form.confirmPassword}
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                />
                <span
                  className="eye-icon"
                  style={{ cursor: 'pointer', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.confirmPassword ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.confirmPassword || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Ngày sinh</label>
              <div className="input-wrapper">
                <FaBirthdayCake className="icon" />
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={form.dateOfBirth} 
                  onChange={onChange}
                  autoComplete="bday"
                  required 
                />
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.dateOfBirth ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.dateOfBirth || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Địa chỉ</label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="icon" />
                <input 
                  name="address" 
                  placeholder="VD: 123 Nguyễn Văn Cừ" 
                  value={form.address} 
                  onChange={onChange}
                  autoComplete="street-address"
                  required 
                />
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.address ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.address || '.'}
              </div>
            </div>
            <div className="input-group">
              <label>Giới tính</label>
              <div className="input-wrapper">
                <FaTransgender className="icon" />
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={onChange}
                  autoComplete="off"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value={GENDER_OPTIONS.MALE}>Nam</option>
                  <option value={GENDER_OPTIONS.FEMALE}>Nữ</option>
                  <option value={GENDER_OPTIONS.OTHER}>Khác</option>
                </select>
              </div>
              <div style={{ minHeight: 16, fontSize: 12, color: fieldErrors.gender ? '#d93025' : 'transparent', marginTop: 2 }}>
                {fieldErrors.gender || '.'}
              </div>
            </div>
          </div>

          <div className="checkbox-agree">
            <input type="checkbox" id="agree" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <label htmlFor="agree">
              <span>
                Tôi đồng ý với các điều khoản và điều kiện. {' '}
                <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>
                  Điều khoản dịch vụ
                </button>{' '}
                và <a href="/privacy" target="_blank">Chính sách bảo mật</a>.
              </span>
            </label>
          </div>

          {message && !Object.values(fieldErrors).some(Boolean) && !/successful/i.test(message) && (
            <div className={`my-error-alert ${message ? 'show' : ''}`} style={{ margin: '0 0 14px 0' }}>
              <span className="error-text">{message}</span>
            </div>
          )}

          <div className="button-row">
            <button type="button" className="action-btn" onClick={handleBack} disabled={isSubmitting}>
              Quay lại
            </button>
            <button type="submit" className="action-btn" disabled={isSubmitting || !agreed}>
              Đăng ký
            </button>
          </div>
        </form>

        {showTerms && (
          <div className="terms-overlay">
            <div className="terms-modal">
              <h2 style={{ color: '#b71c1c', marginBottom: 16 }}>Chính sách bảo mật</h2>
              <div style={{ textAlign: 'left', maxHeight: 320, overflowY: 'auto', fontSize: 15, marginBottom: 18, whiteSpace: 'pre-line' }}>
                <div style={{ marginBottom: 6 }}>Nội dung chính sách bảo mật...</div>
              </div>
              <button onClick={() => setShowTerms(false)} className="btn-verify" style={{ marginTop: 8 }}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};