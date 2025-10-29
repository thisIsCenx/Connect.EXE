import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/Header.scss';
import { RouteConst } from '../../constants/RouteConst';
import { STORAGE_KEYS, USER_ROLES } from '../../constants/AuthConst';
import { API_BASE_URL } from '../../constants/ApiConst';
import logoPng from '../../../src/assets/logo.png';

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

function getInitials(fullName: string): string {
  if (!fullName) return '?';
  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  if (nameParts.length === 0) return '?';
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  return firstInitial + lastInitial;
}

function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B9D', '#C44569', '#5B78C7', '#667EEA', '#764BA2',
    '#F093FB', '#4FACFE', '#43E97B', '#FA709A', '#FEE140',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const Header: React.FC<HeaderProps> = ({ breadcrumbs, onEditProfile, onChangePassword }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on initial load
  useEffect(() => {
    if (location.pathname === RouteConst.HOME && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const readUserFromClient = useCallback(() => {
    // Priority 1: Check localStorage first (remember me = true)
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
    
    // Priority 2: Check sessionStorage (remember me = false)
    const ssUserId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
    const ssFullName = sessionStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
    const ssRole = sessionStorage.getItem(STORAGE_KEYS.USER_ROLE) || '';
    if (ssUserId && ssFullName && ssRole) {
      return {
        userId: Number(ssUserId),
        fullName: ssFullName,
        role: ssRole,
        status: 'ACTIVE',
      } as User;
    }
    
    // Priority 3: Fallback to cookies (for OAuth/Google login or old sessions)
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
    
    return null;
  }, []);

  useEffect(() => {
    setUser(readUserFromClient());
  }, [readUserFromClient, location.pathname]);

  useEffect(() => {
    const onAuthChanged = () => setUser(readUserFromClient());
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => window.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [readUserFromClient]);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.querySelector('.user-dropdown');
      const avatarButton = document.querySelector('.user-avatar-button');
      const target = e.target as Node;
      
      if (dropdown && !dropdown.contains(target) && avatarButton && !avatarButton.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    Cookies.remove('status');
    Cookies.remove('isVerified');
    localStorage.clear();
    sessionStorage.clear();
    setLoading(false);
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/login');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  
  return (
    <>
      <header className="ex-header">
        <div className="ex-header__inner">
          <Link to={RouteConst.HOME} className="site-logo" aria-label="Connect EXE Home">
            <img src={logoPng} alt="Connect EXE Logo" className="site-logo__symbol" />
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          
          <nav className={`center-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to={RouteConst.PROJECTS.NEWS} 
              className={`nav-item ${location.pathname === RouteConst.PROJECTS.NEWS ? 'nav-featured' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tin Tức
            </Link>
            <Link 
              to={RouteConst.PROJECTS.EXPLORE} 
              className={`nav-item ${location.pathname === RouteConst.PROJECTS.EXPLORE ? 'nav-featured' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Khám phá dự án
            </Link>
            <Link 
              to={RouteConst.PROJECTS.VOTING} 
              className={`nav-item ${location.pathname === RouteConst.PROJECTS.VOTING ? 'nav-featured' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Bình chọn
            </Link>
            <Link 
              to={RouteConst.FORUM.ROOT} 
              className={`nav-item ${location.pathname.startsWith('/forum') ? 'nav-featured' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Diễn đàn
            </Link>
            
            {/* Admin Dashboard Link */}
            {user && (user.role.toUpperCase() === 'ADMIN' || user.role === USER_ROLES.ADMIN) && (
              <Link 
                to={RouteConst.ADMIN.ROOT} 
                className={`nav-item ${location.pathname.startsWith('/admin') ? 'nav-featured' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {/* Mobile: User menu inside navigation */}
            {user && (
              <>
                <div className="mobile-nav-divider"></div>
                <div className="mobile-user-section">
                  <div className="mobile-user-header">
                    <div 
                      className="mobile-user-avatar"
                      style={{ background: getAvatarColor(user.fullName) }}
                    >
                      <span className="user-initials">{getInitials(user.fullName)}</span>
                    </div>
                    <div className="mobile-user-info">
                      <div className="mobile-user-name">{user.fullName}</div>
                      <div className="mobile-user-role">{capitalizeFirstLetter(user.role)}</div>
                    </div>
                  </div>
                  
                  {/* Admin Dashboard for Mobile */}
                  {(user.role.toUpperCase() === 'ADMIN' || user.role === USER_ROLES.ADMIN) && (
                    <button className="mobile-menu-item" onClick={() => { navigate(RouteConst.ADMIN.ROOT); setIsMobileMenuOpen(false); }}>
                      <span className="mobile-menu-icon">📊</span> Dashboard
                    </button>
                  )}
                  
                  <button className="mobile-menu-item" onClick={() => { onEditProfile?.(); setIsMobileMenuOpen(false); }}>
                    <span className="mobile-menu-icon">👤</span> Chỉnh sửa hồ sơ
                  </button>
                  <button className="mobile-menu-item" onClick={() => { onChangePassword?.(); setIsMobileMenuOpen(false); }}>
                    <span className="mobile-menu-icon">🔒</span> Đổi mật khẩu
                  </button>
                  <button className="mobile-menu-item logout" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} disabled={loading}>
                    <span className="mobile-menu-icon">🚪</span> {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </button>
                </div>
              </>
            )}
          </nav>
          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                {/* Desktop: Avatar Button */}
                <button 
                  className="user-avatar-button" 
                  onClick={() => setIsProfileDropdownOpen(v => !v)} 
                  aria-label="User Profile Menu"
                  style={{ background: getAvatarColor(user.fullName) }}
                  title={user.fullName}
                >
                  <span className="user-initials">{getInitials(user.fullName)}</span>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{user.fullName}</div>
                      <div className="dropdown-user-role">{capitalizeFirstLetter(user.role)}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item" onClick={() => { onEditProfile?.(); setIsProfileDropdownOpen(false); }}>
                      <span className="dropdown-item-icon">👤</span> Chỉnh sửa hồ sơ
                    </button>
                    <button className="dropdown-item" onClick={() => { onChangePassword?.(); setIsProfileDropdownOpen(false); }}>
                      <span className="dropdown-item-icon">🔒</span> Đổi mật khẩu
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout} disabled={loading}>
                      <span className="dropdown-item-icon">🚪</span> {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link className="sign-in-btn" to={RouteConst.LOGIN}>ĐĂNG NHẬP</Link>
            )}
          </div>
        </div>
      </header>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a
            href="#"
            className="breadcrumb-home"
            onClick={(e) => { e.preventDefault(); breadcrumbs[0]?.onClick?.(); }}
            aria-label="Home"
          >
            <i className="fas fa-home"></i>
          </a>
          {breadcrumbs.map((item) => (
            <React.Fragment key={item.step}>
              <span className="breadcrumb-separator"><i className="fas fa-chevron-right"></i></span>
              {item.onClick ? (
                <a href="#" className="breadcrumb-link" onClick={(e) => { e.preventDefault(); item.onClick?.(); }}>
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