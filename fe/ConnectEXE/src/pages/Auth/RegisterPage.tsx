import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/Auth/RegisterForm';
import { register, verifyRegisterCode, resendRegisterCode, testApiConnection, testRegisterEndpoint } from '../../services/AuthService';
import type { RegisterRequestDTO } from '../../types/request/AuthRequestDTO';
import './styles/RegisterPage.scss';
import { RegisterVerifyOTP } from '../../components/Auth/RegisterVerifyOTP';

export const RegisterPage = () => {
  const [form, setForm] = useState<RegisterRequestDTO & { confirmPassword: string }>({
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    identityCard: '',
    email: '',
    address: '',
    phoneNumber: '',
  });

  const [message, setMessage] = useState('');
  const [showVerifyOverlay, setShowVerifyOverlay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ 
    email?: string; 
    phoneNumber?: string; 
    identityCard?: string;
    password?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    confirmPassword?: string;
  }>({});



  const navigate = useNavigate();

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 Testing API connection on RegisterPage mount...');
      const isConnected = await testApiConnection();
      if (!isConnected) {
        console.warn('⚠️ API connection test failed');
      }
      
      // Test register endpoint specifically
      console.log('🔍 Testing register endpoint...');
      const isRegisterWorking = await testRegisterEndpoint();
      if (!isRegisterWorking) {
        console.warn(' Register endpoint test failed');
      }
    };
    testConnection();
  }, []);



  const validateFields = (fields = form) => {
    const errors: typeof fieldErrors = {};
    
    // Email: kiểm tra định dạng hợp lệ nâng cao (giống CGV)
    if (fields.email) {
      // Regex: không bắt đầu/kết thúc bằng dấu chấm, không có 2 dấu chấm liên tiếp, chỉ cho phép ký tự hợp lệ
      const emailRegex = /^(?![.])[A-Za-z0-9._%+-]+@(?![.])[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?<![.])$/;
      if (!emailRegex.test(fields.email) || /\.\./.test(fields.email)) {
        errors.email = 'auth.validation.invalidEmail';
      }
    }
    
    // Số điện thoại Việt Nam hợp lệ (đầu số di động hợp lệ)
    if (fields.phoneNumber && !/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/.test(fields.phoneNumber)) {
      errors.phoneNumber = 'auth.validation.invalidPhone';
    }
    
    // CCCD hợp lệ (9-12 số)
    if (fields.identityCard && !/^[0-9]{9,12}$/.test(fields.identityCard)) {
      errors.identityCard = 'auth.validation.invalidIdentityCard';
    }
    
    // Ngày sinh hợp lệ (theo CGV: phải đủ 16 tuổi trở lên)
    if (fields.dateOfBirth) {
      const dob = new Date(fields.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (isNaN(dob.getTime()) || age < 16 || dob > today) {
        errors.dateOfBirth = 'auth.validation.invalidAge';
      }
    }
    
    // Full name: 2-50 ký tự, không số, không ký tự lạ, chỉ ký tự tiếng Việt và khoảng trắng
    if (fields.fullName) {
      const fullName = fields.fullName.trim();
      if (fullName.length < 2) {
        errors.fullName = 'auth.validation.fullNameMinLength', { minLength: 2 };
      } else if (fullName.length > 50) {
        errors.fullName = 'auth.validation.fullNameMaxLength', { maxLength: 50 };
      } else if (!/^([A-Za-zÀ-ỹà-ỹ\s']+)$/.test(fullName)) {
        errors.fullName = 'auth.errors.invalidFullName';
      }
    }
    
    // Password: ít nhất 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt
    if (fields.password) {
      if (fields.password.length < 8) {
        errors.password = 'auth.validation.passwordMinLength', { minLength: 8 };
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(fields.password)) {
        errors.password = 'auth.validation.passwordComplexity';
      }
    }
    
    // Confirm password: phải trùng khớp
    if (fields.password && fields.confirmPassword && fields.password !== fields.confirmPassword) {
      errors.confirmPassword = 'auth.validation.passwordMismatch';
    }
    
    // Gender: bắt buộc
    if (!fields.gender) {
      errors.gender = 'auth.validation.genderRequired'
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    // Validate realtime từng trường
    const errors = validateFields(newForm);
    setFieldErrors((prev) => ({ ...prev, [name]: errors[name as keyof typeof fieldErrors] }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showVerifyOverlay) return; // Chặn submit lại khi đang xác thực OTP
    setIsSubmitting(true);
    setMessage('');

    // --- VALIDATE LOCAL ---
    const localErrors = validateFields();
    let mergedFieldErrors = { ...localErrors };
    // Nếu có lỗi format thì không gửi lên backend, chỉ hiển thị lỗi format
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(mergedFieldErrors);
      setIsSubmitting(false);
      return;
    }

    const {
      password,
      confirmPassword,
      email,
    } = form;

    // Client-side validation for confirm password
    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'auth.validation.passwordMismatch' }));
      setIsSubmitting(false);
      return;
    }

    // Clear field errors if no validation errors
    setFieldErrors({});

    try {
      const { confirmPassword, ...formData } = form;
      const response = await register(formData);
      // Xử lý response mới với thông tin chi tiết về email/phone/identityCard đã được sử dụng
      if (response.emailUsed || response.phoneUsed || response.identityCardUsed) {
        let newFieldErrors: { email?: string; phoneNumber?: string; identityCard?: string } = {};
        if (response.emailUsed) newFieldErrors.email = 'auth.validation.emailAlreadyExists';
        if (response.phoneUsed) newFieldErrors.phoneNumber = 'auth.validation.phoneAlreadyExists';
        if (response.identityCardUsed) newFieldErrors.identityCard = 'auth.validation.invalidIdentityCard';
        setFieldErrors({ ...localErrors, ...newFieldErrors });
        setMessage('');
        return;
      }
      // Nếu không có lỗi từng trường, set message tổng như cũ
      setMessage(response.message);
      setFieldErrors({});
      localStorage.setItem("register_email", email);
      if (response.message.toLowerCase().includes('successful')) {
        setShowVerifyOverlay(true);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 400 && err.response?.data) {
        // Xử lý lỗi chi tiết từ BE trả về
        const { emailUsed, phoneUsed, identityCardUsed, fieldErrors: beFieldErrors } = err.response.data;
        let newFieldErrors: { email?: string; phoneNumber?: string; identityCard?: string } = {};
        if (emailUsed) newFieldErrors.email = 'auth.validation.emailAlreadyExists';
        if (phoneUsed) newFieldErrors.phoneNumber = 'auth.validation.phoneAlreadyExists';
        if (identityCardUsed) newFieldErrors.identityCard = 'auth.validation.invalidIdentityCard';
        // Áp dụng i18n cho các lỗi BE trả về nếu có
        let mergedFieldErrors: Record<string, string> = { ...localErrors, ...newFieldErrors };
        if (beFieldErrors) {
          Object.entries(beFieldErrors).forEach(([key, value]) => {
            // Nếu BE trả về đúng key, ưu tiên dùng i18n nếu có
            if (key === 'passwordMismatch') mergedFieldErrors['confirmPassword'] = 'auth.validation.passwordMismatch';
            else if (key === 'password') mergedFieldErrors['password'] = 'auth.validation.passwordComplexity';
            else mergedFieldErrors[key] = value as string;
          });
        }
        setFieldErrors(mergedFieldErrors);
        setMessage('');
        return;
      }
      if (err.response?.status === 405) {
        setMessage('auth.errors.invalidFormat');
      } else if (err.response?.status === 404) {
        setMessage('auth.errors.notFound');
      } else if (err.response?.status === 500) {
        setMessage('auth.errors.serverError');
      } else if (err.response?.data?.fieldErrors) {
        // Handle validation errors from backend
        const backendFieldErrors = err.response.data.fieldErrors;
        setFieldErrors({ ...localErrors, ...backendFieldErrors });
        setMessage('auth.errors.invalidFormat');
      } else if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        setMessage(errorMessage);
      } else if (err.message) {
        setMessage(err.message);
      } else {
        setMessage('auth.errors.serverError');
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="register-page">
      <div className="auth-card">
        <div className="auth-left">
          {!showVerifyOverlay ? (
            <RegisterForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              message={message}
              isSubmitting={isSubmitting}
              fieldErrors={fieldErrors}
            />
          ) : (
            <RegisterVerifyOTP
              email={form.email}
              onSuccess={() => { navigate('/login'); }}
              onCancel={() => { setShowVerifyOverlay(false); }}
              verifyRegisterCode={verifyRegisterCode}
              resendRegisterCode={resendRegisterCode}
            />
          )}
        </div>
        <div className="auth-right" aria-hidden />
      </div>
    </div>
  );
};