// src/components/Header.tsx
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Header.scss';
import { FaUserCircle } from 'react-icons/fa';
import { RouteConst } from '../../constants/RouteConst';

interface BreadcrumbItem {
  text: string;
  step: 'movies' | 'showtimes' | 'seats' | 'confirm' | 'mybookings' | 'theaters' | 'editProfile' | 'changePassword' | 'profile' | 'home' | 'score';
  onClick?: () => void;
}

interface HeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onStepChange?: (step: BreadcrumbItem['step']) => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

interface User {
  userId: number;
  fullName: string;
  role: string;
  status: string;
}

function decodeCookieValue(value?: string) {
  if (!value) return '';
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

const Header: React.FC<HeaderProps> = ({ breadcrumbs, onStepChange, onEditProfile, onChangePassword }) => {
  // translations removed
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Cookies.get('userId');
    const fullName = decodeCookieValue(Cookies.get('fullName'));
    const role = decodeCookieValue(Cookies.get('role'));
    const status = decodeCookieValue(Cookies.get('status'));

    if (userId && fullName && role && status) {
      setUser({
        userId: Number(userId),
        fullName,
        role,
        status,
      });
    } else {
      setUser(null);
    }

    // language switching removed; LanguageSwitcher component retained for UI but it will not change translations
  }, []);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.querySelector('.profile-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:8080/api/login/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    Cookies.remove('status');
    setLoading(false);
    navigate('/login');
  };

  return (
    <>
      <header className="ex-header">
        <div className="ex-header__inner">
          {/* Logo */}
          <Link to={RouteConst.HOME} className="ex-brand" aria-label="EX Connect">
            <span className="ex-logo">EX</span>
            <span className="ex-wordmark">Connect.<b>exe</b></span>
          </Link>

          {/* Nav pill */}
          <nav className="ex-nav">
            <Link to={RouteConst.HOME}>Trang chủ</Link>
            <a href="#" onClick={(e)=>{e.preventDefault(); onStepChange?.('movies')}}>Sản phẩm</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); onStepChange?.('theaters')}}>Diễn đàn</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); onStepChange?.('score')}}>Dự án</a>
            <a className="ex-icon" aria-label="Cart" href="#" onClick={(e)=>e.preventDefault()}>🛍️</a>
            <a className="ex-icon" aria-label="Search" href="#" onClick={(e)=>e.preventDefault()}>🔍</a>
            <span className="ex-divider" aria-hidden>|</span>
            <Link to={RouteConst.HOME}>Tin Tức</Link>
            <Link to={RouteConst.HOME}>Khám phá dự án</Link>
            <Link to={RouteConst.HOME}>Về chúng tôi</Link>
          </nav>

          {/* Right actions */}
          <div className="ex-actions">
            {user ? (
              <div className="ex-user" style={{ position:'relative' }}>
                <button className="ex-avatar" onClick={() => setIsProfileDropdownOpen(v=>!v)} aria-label="Profile">
                  <FaUserCircle size={22} />
                </button>
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <button className="profile-dropdown-item" onClick={() => { onEditProfile?.(); setIsProfileDropdownOpen(false); }}>✏️ Edit profile</button>
                    <button className="profile-dropdown-item" onClick={() => { onChangePassword?.(); setIsProfileDropdownOpen(false); }}>🔒 Change password</button>
                    <button className="profile-dropdown-item" style={{ color: '#d32f2f' }} onClick={handleLogout}>{loading ? 'Logging out...' : 'Logout'}</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link className="ex-login" to={RouteConst.LOGIN}>Login</Link>
                <Link className="ex-signup" to={RouteConst.REGISTER}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumbs (optional) */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a
            href="#"
            className="breadcrumb-home"
            onClick={(e) => {
              e.preventDefault();
              breadcrumbs[0]?.onClick?.();
            }}
            aria-label="Home"
          >
            <i className="fas fa-home"></i>
          </a>
          {breadcrumbs.map((item) => (
            <React.Fragment key={item.step}>
              <span className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </span>
              {item.onClick ? (
                <a
                  href="#"
                  className="breadcrumb-link"
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick?.();
                  }}
                >
                  {item.text}
                </a>
              ) : (
                <span className="breadcrumb-active">{item.text}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
    </>
  );
};

export default Header;