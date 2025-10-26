import ForgotPasswordForm from '../../components/Auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="forgot-password-page">
      <ForgotPasswordForm onClose={() => window.history.back()} />
    </div>
  );
} 