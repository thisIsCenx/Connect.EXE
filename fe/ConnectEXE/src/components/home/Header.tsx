// src/components/Header.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/Header.scss';
import { FaUserCircle } from 'react-icons/fa';
import { RouteConst } from '../../constants/RouteConst';
import { STORAGE_KEYS } from '../../constants/AuthConst';
import { API_BASE_URL } from '../../constants/ApiConst';

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

const Header: React.FC<HeaderProps> = ({ breadcrumbs, onEditProfile, onChangePassword }) => {
  // translations removed
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  const readUserFromClient = useCallback(() => {
    // Prefer cookies (set by backend)
    const cookieUserId = Cookies.get('userId');
    const cookieFullName = decodeCookieValue(Cookies.get('fullName'));
    const cookieRole = decodeCookieValue(Cookies.get('role'));
    const cookieStatus = decodeCookieValue(Cookies.get('status'));

    if (cookieUserId && cookieFullName && cookieRole && cookieStatus) {
      return {
        userId: Number(cookieUserId),
        fullName: cookieFullName,
        role: cookieRole,
        status: cookieStatus,
      } as User;
    }

    // Fallback to localStorage (set by FE after login)
    const lsUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const lsFullName = localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
    const lsRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) || '';
    if (lsUserId && lsFullName && lsRole) {
      return {
        userId: Number(lsUserId),
        fullName: lsFullName,
        role: lsRole,
        status: 'ACTIVE',
      } as User;
    }

    return null;
  }, []);

  useEffect(() => {
    setUser(readUserFromClient());
    // language switching removed
  }, [readUserFromClient, location.pathname]);

  useEffect(() => {
    const onAuthChanged = () => setUser(readUserFromClient());
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => window.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [readUserFromClient]);

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
      // Call logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    
    // Clear all user data
    setUser(null);
    
    // Clear cookies
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    Cookies.remove('status');
    
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    localStorage.removeItem('register_email');
    localStorage.clear(); // Clear all stored data
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    setLoading(false);
    
    // Notify other components about auth change
    window.dispatchEvent(new Event('auth:changed'));
    
    // Navigate to login page
    navigate('/login');
    
    // Force page reload to ensure complete session cleanup
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <>
      <header className="ex-header">
        <div className="ex-header__inner">
          {/* Logo - exact Wix style */}
          <Link to={RouteConst.HOME} className="wix-logo" aria-label="Connect EXE">
            <div className="logo-container">
              <span className="logo-symbol">⚡</span>
              <span className="logo-text">Connect</span>
            </div>
            <span className="logo-exe">exe</span>
          </Link>

          {/* Center Navigation - matching Wix menu */}
          <nav className="center-nav">
            <Link to={RouteConst.HOME} className="nav-item">Tin Tức</Link>
            <Link to="/projects" className="nav-item nav-featured">Khám phá dự án</Link>
            <Link to="/vote" className="nav-item">Bình chọn</Link>
            <Link to="/forum" className="nav-item">Diễn đàn</Link>
          </nav>

          {/* Right actions - matching Wix SIGN IN button */}
          <div className="header-actions">
            {user ? (
              <div className="user-menu" style={{ position:'relative' }}>
                <button className="user-avatar" onClick={() => setIsProfileDropdownOpen(v=>!v)} aria-label="Profile">
                  <FaUserCircle size={20} />
                </button>
                {isProfileDropdownOpen && (
                  <div className="user-dropdown">
                    <button className="dropdown-item" onClick={() => { onEditProfile?.(); setIsProfileDropdownOpen(false); }}>Chỉnh sửa hồ sơ</button>
                    <button className="dropdown-item" onClick={() => { onChangePassword?.(); setIsProfileDropdownOpen(false); }}>Đổi mật khẩu</button>
                    <button className="dropdown-item logout" onClick={handleLogout}>{loading ? 'Đang đăng xuất...' : 'Đăng xuất'}</button>
                  </div>
                )}
              </div>
            ) : (
              <Link className="sign-in-btn" to={RouteConst.LOGIN}>ĐĂNG NHẬP</Link>
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