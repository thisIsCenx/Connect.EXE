// src/components/Header.tsx
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// translations removed; using plain strings
import './styles/Header.scss';
import { FaUserCircle } from 'react-icons/fa';

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
      <div className="top-border"></div>
      <header>
        <div className="header-container">
          <div className="logo-nav">
            {/* <img
              className="logo"
              src={defaultLogo}
              alt="Star Theater logo"
              height={50}
              width={100}
            /> */}
            <nav>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('home'); }}>Home</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('movies'); }}>Movies</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('theaters'); }}>Theaters</a>
              <a href="#">Promotions</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('score'); }}>Score</a>
              {user && (
                <a href="#" onClick={(e) => { e.preventDefault(); onStepChange?.('mybookings'); }}>
                  My bookings
                </a>
              )}
            </nav>
          </div>
          <div className="user-info" style={{ marginLeft: 'auto', paddingRight: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="wave" style={{ fontSize: 22 }}>👋</span>
                  Hi <b>{user.fullName}</b>
                </span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setIsProfileDropdownOpen((v) => !v)}
                  aria-label="Profile menu"
                >
                  <FaUserCircle size={28} color="#333" />
                </button>
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown" style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: 180, zIndex: 100 }}>
                    <button className="profile-dropdown-item" style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { onEditProfile?.(); setIsProfileDropdownOpen(false); }}>✏️ Edit profile</button>
                    <button className="profile-dropdown-item" style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { onChangePassword?.(); setIsProfileDropdownOpen(false); }}>🔒 Change password</button>
                    <button className="profile-dropdown-item" style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', color: '#d32f2f', cursor: 'pointer' }} onClick={handleLogout}>{loading ? 'Logging out...' : 'Logout'}</button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" style={{ color: '#f66' }}>
                Login
              </a>
            )}
          </div>
        </div>
      </header>
      <div className="bottom-border"></div>
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
    </>
  );
};

export default Header;