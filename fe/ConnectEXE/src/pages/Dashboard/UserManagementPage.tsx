import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getUsers, updateUserStatus } from '../../services/AdminService';
import type { UserItemDTO } from '../../types/response/AdminResponseDTO';
import './styles/UserManagementPage.scss';

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [users, setUsers] = useState<UserItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // Check if user is admin
    const fullName = sessionStorage.getItem('userName') || 
                     localStorage.getItem('userName') || 
                     Cookies.get('fullName') || 
                     'Admin';
    
    const role = sessionStorage.getItem('userRole') || 
                 localStorage.getItem('userRole') || 
                 Cookies.get('role') || 
                 '';
    
    if (role.toUpperCase() !== 'ADMIN') {
      navigate('/');
      return;
    }

    setUser({ fullName, role: role.toUpperCase() });
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: currentPage,
        size: 10,
        role: roleFilter,
        status: statusFilter,
        searchQuery: searchQuery,
      });
      
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers();
  };

  const handleToggleUserActive = async (userId: string, userName: string, currentStatus: string) => {
    const isActive = currentStatus === 'ACTIVE';
    const action = isActive ? 'vô hiệu hóa' : 'kích hoạt lại';
    const newStatus = isActive ? 'INACTIVE' : 'ACTIVE';
    
    if (!confirm(`${isActive ? '⚠️' : '✅'} ${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản "${userName}"?\n\nHành động này sẽ:\n- Đặt trạng thái thành "${isActive ? 'Không hoạt động' : 'Hoạt động'}"\n- User ${isActive ? 'không thể' : 'có thể'} đăng nhập\n\nBạn có chắc chắn?`)) {
      return;
    }

    try {
      await updateUserStatus({ 
        userId, 
        status: newStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' 
      });
      alert(`✅ Đã ${action} tài khoản thành công!`);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      alert(`❌ Không thể ${action} tài khoản`);
    }
  };

  const handleSuspendUser = async (userId: string, userName: string, currentStatus: string) => {
    if (currentStatus === 'SUSPENDED') {
      return;
    }

    if (!confirm(`🔒 Khóa vĩnh viễn tài khoản "${userName}"?\n\n⚠️ CẢNH BÁO:\n- Tài khoản sẽ bị SUSPENDED\n- Không thể đăng nhập\n- Cần admin can thiệp để mở khóa\n- Chỉ dùng cho vi phạm nghiêm trọng\n\nBạn có CHẮC CHẮN muốn khóa vĩnh viễn?`)) {
      return;
    }

    try {
      await updateUserStatus({ 
        userId, 
        status: 'SUSPENDED' 
      });
      alert('🔒 Đã khóa tài khoản vĩnh viễn!');
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('❌ Không thể khóa tài khoản');
    }
  };

  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('fullName');
    Cookies.remove('role');
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <h2>Connect.EXE</h2>
            <span className="admin-badge">Admin</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Tổng quan</h3>
            <Link to="/admin" className="nav-item">
              <span className="icon">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3>Quản lý</h3>
            <Link to="/admin/users" className="nav-item active">
              <span className="icon">👥</span>
              <span>Người dùng</span>
            </Link>
            <Link to="/admin/projects" className="nav-item">
              <span className="icon">📁</span>
              <span>Dự án</span>
            </Link>
            <Link to="/admin/forum" className="nav-item">
              <span className="icon">💬</span>
              <span>Diễn đàn</span>
            </Link>
            <Link to="/admin/reports" className="nav-item">
              <span className="icon">⚠️</span>
              <span>Báo cáo</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3>Cài đặt</h3>
            <Link to="/admin/settings" className="nav-item">
              <span className="icon">⚙️</span>
              <span>Cấu hình</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.fullName.charAt(0)}</div>
            <div className="user-details">
              <p className="user-name">{user?.fullName}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Quản lý người dùng</h1>
          <p className="subtitle">Tổng số: {totalItems} người dùng</p>
        </header>

        {/* Info Banner */}
        <div className="info-banner">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <strong>Trạng thái người dùng:</strong>
            <ul>
              <li><span className="badge-success">Hoạt động</span> - Có thể đăng nhập và sử dụng hệ thống</li>
              <li><span className="badge-inactive">Không hoạt động</span> - Tạm thời không thể đăng nhập</li>
              <li><span className="badge-danger">Đã khóa</span> - Bị cấm vĩnh viễn</li>
            </ul>
            <p><strong>Toggle nhanh:</strong> Nút <span className="toggle-badge deactivate">⛔</span> để vô hiệu hóa, nút <span className="toggle-badge activate">✅</span> để kích hoạt lại.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍 Tìm kiếm</button>
          </form>

          <div className="filter-group">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả vai trò</option>
              <option value="STUDENT">Sinh viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="SUSPENDED">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="toggle-container">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={user.status === 'ACTIVE'}
                              onChange={() => handleToggleUserActive(user.userId, user.fullName, user.status)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <span className={`status-text ${user.status?.toLowerCase()}`}>
                            {user.status === 'ACTIVE' ? 'Hoạt động' : 
                             user.status === 'SUSPENDED' ? 'Đã khóa' : 'Tắt'}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleSuspendUser(user.userId, user.fullName, user.status)}
                            className="suspend-btn"
                            title="Khóa vĩnh viễn (SUSPENDED)"
                            disabled={user.status === 'SUSPENDED'}
                          >
                            🔒
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                ← Trước
              </button>
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="pagination-btn"
              >
                Sau →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserManagementPage;
