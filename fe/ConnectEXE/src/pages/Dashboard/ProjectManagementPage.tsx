import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getProjects, approveProject, deleteProject } from '../../services/AdminService';
import type { ProjectItemDTO } from '../../types/response/AdminResponseDTO';
import './styles/ProjectManagementPage.scss';

const ProjectManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [projects, setProjects] = useState<ProjectItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectItemDTO | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveReason, setApproveReason] = useState('');

  useEffect(() => {
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
    fetchProjects();
  }, [currentPage, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects({
        page: currentPage,
        size: 10,
        status: statusFilter,
        searchQuery: searchQuery,
      });
      
      setProjects(response.projects);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchProjects();
  };

  const handleApprove = async (approved: boolean) => {
    if (!selectedProject) return;

    try {
      await approveProject({
        projectId: selectedProject.projectId,
        approved,
        reason: approveReason,
      });
      setShowApproveModal(false);
      setApproveReason('');
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error approving project:', error);
      alert('Không thể cập nhật trạng thái dự án');
    }
  };

  const handleDelete = async (projectId: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa dự án "${title}"?`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Không thể xóa dự án');
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

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'pending';
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Đã từ chối';
      default: return status;
    }
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
            <Link to="/admin/users" className="nav-item">
              <span className="icon">👥</span>
              <span>Người dùng</span>
            </Link>
            <Link to="/admin/projects" className="nav-item active">
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
          <h1>Quản lý dự án</h1>
          <p className="subtitle">Tổng số: {totalItems} dự án</p>
        </header>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍 Tìm kiếm</button>
          </form>

          <div className="filter-group">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Projects Table */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên dự án</th>
                    <th>Chủ sở hữu</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.projectId}>
                      <td>{project.projectId}</td>
                      <td>
                        <div className="project-info">
                          <strong>{project.title}</strong>
                          <p className="project-desc">{project.description?.substring(0, 80)}...</p>
                        </div>
                      </td>
                      <td>{project.owner}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td>{new Date(project.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className="action-buttons">
                          {project.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowApproveModal(true);
                                }}
                                className="approve-btn"
                                title="Phê duyệt"
                              >
                                ✅
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  handleApprove(false);
                                }}
                                className="reject-btn"
                                title="Từ chối"
                              >
                                ❌
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(project.projectId, project.title)}
                            className="delete-btn"
                            title="Xóa"
                          >
                            🗑️
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

      {/* Approve Modal */}
      {showApproveModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Phê duyệt dự án</h2>
            <p><strong>Dự án:</strong> {selectedProject.title}</p>
            <p><strong>Chủ sở hữu:</strong> {selectedProject.owner}</p>
            
            <textarea
              placeholder="Lý do phê duyệt (tùy chọn)"
              value={approveReason}
              onChange={(e) => setApproveReason(e.target.value)}
              rows={4}
            />

            <div className="modal-actions">
              <button onClick={() => handleApprove(true)} className="approve-btn-modal">
                ✅ Phê duyệt
              </button>
              <button onClick={() => setShowApproveModal(false)} className="cancel-btn">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagementPage;
