import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/AuthService';
import type { LoginRequestDTO } from '../../types/request/AuthRequestDTO';
import { GOOGLE_LOGIN_URL } from '../../constants/ApiConst';
import { Regex } from '../../constants/Regex';
import { RouteConst } from '../../constants/RouteConst';
import { USER_ROLES, STORAGE_KEYS } from '../../constants/AuthConst';
import './styles/LoginForm.scss';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequestDTO>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Regex.EMAIL.test(form.email)) {
      setError('Invalid email format');
      return;
    }

    try {
      const data = await login(form);
  const { userId, fullName, role, isVerified } = data;

      if (isVerified === false) {
        setError('Your email is not verified. Please check your email to verify your account.');
        return;
      }

      if (rememberMe) {
  localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, form.email);
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
  localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }

  localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      localStorage.setItem(STORAGE_KEYS.USER_NAME, fullName);
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);

      switch (role) {
        case USER_ROLES.ADMIN:
          navigate(RouteConst.ADMIN.ROOT);
          break;
        case USER_ROLES.STUDENT:
          navigate(RouteConst.STUDENT);
          break;
        default:
          navigate(RouteConst.HOME);
          break;
      }
    } catch (err: any) {
  const rawMsg = err.response?.data?.originMessage || err.response?.data?.message || '';
      let msg = 'Server error. Please try again.';
      if (rawMsg === 'Email hoặc số điện thoại không tồn tại trong hệ thống.' || rawMsg === 'Email or phone number does not exist in the system.') {
        msg = 'Email not found.';
      } else if (rawMsg === 'Mật khẩu không đúng.' || rawMsg === 'Incorrect password.') {
        msg = 'Incorrect password.';
      } else if (rawMsg.includes('not active')) {
        msg = 'Account is inactive.';
      } else if (rawMsg.includes('not verified')) {
        msg = 'Your email is not verified.';
      } else if (rawMsg.includes('Invalid email/phone or password')) {
        msg = 'Invalid credentials.';
      }
      setError(msg);
    }
  };

  useEffect(() => {
  const errorParam = new URLSearchParams(window.location.search).get('error');
    if (errorParam === 'AccountInactive') {
      setError('Account is inactive.');
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    } else if (errorParam === 'GoogleLoginFailed') {
      setError('Google login failed.');
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    } else if (errorParam === 'SessionChanged') {
      setError('Your session has changed. Please login again.');
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }
  }, []);

  const handleLoginWithGoogle = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <>
      <form className="login-box" onSubmit={handleSubmit}>
  <h1 className="logo">Sign in</h1>

        <div className="input-group">
            <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="icon" />
            <input
              type="text"
                name="email"
                placeholder={'Email'}
                value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group" id="mk">
          <label>Password</label>
          <div className="input-wrapper password-wrapper">
            <FaLock className="icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={'Password'}
              value={form.password}
              onChange={handleChange}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="remember-forgot">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <button
            type="button"
            className="forgot-link"
            onClick={() => setShowForgotPassword(true)}
          >
            {'Forgot password?'}
          </button>
        </div>

        <div className="error-container">
          {error && <p className="error">{error}</p>}
        </div>

        <button type="submit" className="login-btn">
          Sign in
        </button>

        <button type="button" className="loginwithgg-btn" onClick={handleLoginWithGoogle}>
          <FcGoogle style={{ marginRight: '8px', fontSize: '20px' }} />
          {'Sign in with Google'}
        </button>

        <button type="button" className="signup-btn" onClick={() => navigate(RouteConst.REGISTER)}>
          {'Sign up'}
        </button>

        <button
          type="button"
          className="btn-back-home"
          onClick={() => navigate('/')}
          style={{ margin: '18px auto 0', display: 'block' }}
        >
          {'← Back to Home'}
        </button>
      </form>

      {showForgotPassword && (
        <div className="forgot-overlay">
          <ForgotPasswordForm onClose={() => setShowForgotPassword(false)} />
        </div>
      )}
    </>
  );
}