import React, { useEffect, useState, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/Header.scss';
import { RouteConst } from '../../constants/RouteConst';
import { STORAGE_KEYS } from '../../constants/AuthConst';
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

type NavSection = 'tin-tuc' | 'kham-pha-du-an' | 'binh-chon' | 'dien-dan' | null;

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
  const [activeNav, setActiveNav] = useState<NavSection>('kham-pha-du-an');

  const [isClickScrolling, setIsClickScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickedNavRef = useRef<NavSection>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const readUserFromClient = useCallback(() => {
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
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    if (location.pathname !== RouteConst.HOME) {
      setActiveNav(null);
      return;
    }

    const navSections: Exclude<NavSection, null>[] = ['kham-pha-du-an', 'tin-tuc', 'binh-chon', 'dien-dan'];
    const sectionIds: Record<Exclude<NavSection, null>, string[]> = {
      'kham-pha-du-an': ['kham-pha-du-an-hero', 'kham-pha-du-an-featured', 'kham-pha-du-an-products'],
      'tin-tuc': ['tin-tuc-gallery', 'tin-tuc-stats', 'tin-tuc-partners'],
      'binh-chon': ['binh-chon'],
      'dien-dan': ['dien-dan'],
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isClickScrolling) {
        return; // Không update khi đang scroll do click
      }
      
      // Nếu vừa click vào nav, ưu tiên giữ nav đó
      if (lastClickedNavRef.current && Date.now() - (window as any)._lastNavClickTime < 2000) {
        return;
      }
      
      const visibleEntries = entries
        .filter(entry => entry.isIntersecting && entry.intersectionRatio > 0.3) // Chỉ xét section hiển thị > 30%
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      
      if (visibleEntries.length > 0) {
        const topMostEntry = visibleEntries[0];
        const topId = topMostEntry.target.id;
        for (const navKey of navSections) {
          if (sectionIds[navKey].includes(topId)) {
            setActiveNav(navKey);
            break;
          }
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, { 
      root: null, 
      rootMargin: '-20% 0px -40% 0px', // Chỉ detect khi section ở giữa màn hình
      threshold: [0.3, 0.5, 0.7] 
    });
    const targets = navSections.flatMap(navKey => sectionIds[navKey]).map(id => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    targets.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [location.pathname, isClickScrolling]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, navKey: NavSection, elementId: string) => {
    if (location.pathname !== RouteConst.HOME) {
      navigate(`${RouteConst.HOME}#${elementId}`);
      return;
    }
    event.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      setIsClickScrolling(true);
      setActiveNav(navKey);
      lastClickedNavRef.current = navKey;
      (window as any)._lastNavClickTime = Date.now(); // Lưu thời gian click
      
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsClickScrolling(false);
      }, 2000); // Tăng lên 2 giây để đảm bảo scroll xong mới cho observer hoạt động
    }
  };
  
  // ***** KHỐI CODE GÂY LỖI ĐÃ ĐƯỢC XÓA BỎ *****

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
          <nav className="center-nav">
            <Link 
              to={`${RouteConst.HOME}#kham-pha-du-an-hero`} 
              className={`nav-item ${activeNav === 'kham-pha-du-an' ? 'nav-featured' : ''}`}
              onClick={(e) => handleNavClick(e, 'kham-pha-du-an', 'kham-pha-du-an-hero')}
            >
              Khám phá dự án
            </Link>
            <Link 
              to={`${RouteConst.HOME}#tin-tuc-gallery`} 
              className={`nav-item ${activeNav === 'tin-tuc' ? 'nav-featured' : ''}`}
              onClick={(e) => handleNavClick(e, 'tin-tuc', 'tin-tuc-gallery')}
            >
              Tin Tức
            </Link>
            <Link 
              to={`${RouteConst.HOME}#binh-chon`} 
              className={`nav-item ${activeNav === 'binh-chon' ? 'nav-featured' : ''}`}
              onClick={(e) => handleNavClick(e, 'binh-chon', 'binh-chon')}
            >
              Bình chọn
            </Link>
            <Link 
              to={RouteConst.FORUM.ROOT} 
              className={`nav-item ${location.pathname.startsWith('/forum') ? 'nav-featured' : ''}`}
            >
              Diễn đàn
            </Link>
          </nav>
          <div className="header-actions">
            {user ? (
              <div className="user-menu">
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