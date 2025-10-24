import LoginForm from '../../components/auth/LoginForm';
import './styles/LoginPage.scss';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-left">
          <LoginForm />
        </div>
        <div className="auth-right" aria-hidden />
      </div>
    </div>
  );
}