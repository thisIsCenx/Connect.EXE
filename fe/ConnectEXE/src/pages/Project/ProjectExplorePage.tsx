import React, { useEffect, useState } from 'react';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import { ProjectCard, CreateProjectForm } from '../../components/Project';
import { getAllProjects, getProjectsByCategory } from '../../services/ProjectService';
import type { ProjectResponse } from '../../types/response/ProjectResponseDTO';
import { getUserFromToken } from '../../utils/jwt';
import './styles/ProjectExplorePage.scss';

const ProjectExplorePage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const user = getUserFromToken();
  
  // Check if user can create project (admin, teacher, or student with subscription)
  const canCreateProject = () => {
    if (!user) return false;
    const role = user.role?.replace(/^ROLE_/, '').toUpperCase();
    // TODO: Add subscription check for students when backend is ready
    return role === 'ADMIN' || role === 'TEACHER' || role === 'STUDENT';
  };

  const categories = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'TECHNOLOGY', label: 'Công nghệ' },
    { value: 'EDUCATION', label: 'Giáo dục' },
    { value: 'RECYCLE', label: 'Tái chế' },
    { value: 'INDUSTRIAL', label: 'Công nghiệp' },
    { value: 'OTHER', label: 'Khác' },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = selectedCategory === 'ALL'
          ? await getAllProjects(currentPage, 12)
          : await getProjectsByCategory(selectedCategory, currentPage, 12);
        
        setProjects(response.projects);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, currentPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // Reload projects
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = selectedCategory === 'ALL'
          ? await getAllProjects(currentPage, 12)
          : await getProjectsByCategory(selectedCategory, currentPage, 12);
        
        setProjects(response.projects);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  };

  return (
    <div className="project-explore-page">
      <Header breadcrumbs={[]} />
      
      <main className="explore-main">
        <div className="explore-container">
          <div className="explore-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="explore-title">Khám phá dự án</h1>
                <p className="explore-subtitle">
                  Khám phá các dự án khởi nghiệp sáng tạo từ cộng đồng sinh viên
                </p>
              </div>
              {canCreateProject() && (
                <button
                  className="btn-create-project"
                  onClick={() => setShowCreateForm(true)}
                >
                  + Đăng dự án
                </button>
              )}
            </div>
          </div>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dự án...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>Không có dự án nào trong danh mục này</p>
            </div>
          ) : (
            <>
              <div className="projects-grid">
                {projects.map((project) => (
                  <ProjectCard key={project.projectId} project={project} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    ← Trước
                  </button>
                  
                  <span className="page-info">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateProjectForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProjectExplorePage;
