import React, { useEffect, useState } from 'react';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import { ProjectCard } from '../../components/Project';
import { getVotingProjects } from '../../services/ProjectService';
import type { ProjectResponse } from '../../types/response/ProjectResponseDTO';
import './styles/ProjectVotingPage.scss';

const ProjectVotingPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getVotingProjects(currentPage, 12);
        setProjects(response.projects);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to fetch voting projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  // Sort by vote count
  const sortedProjects = [...projects].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  return (
    <div className="project-voting-page">
      <Header breadcrumbs={[]} />
      
      <main className="voting-main">
        <div className="voting-container">
          <div className="voting-header">
            <h1 className="voting-title">Bình chọn dự án yêu thích</h1>
            <p className="voting-subtitle">
              Vote cho những dự án bạn yêu thích để giúp họ có cơ hội phát triển
            </p>
            <div className="voting-stats">
              <div className="stat-item">
                <span className="stat-icon">🎯</span>
                <span className="stat-label">Tổng dự án</span>
                <span className="stat-value">{projects.length}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dự án...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có dự án nào để bình chọn</p>
            </div>
          ) : (
            <>
              <div className="top-projects">
                <h2 className="section-title">🏆 Top 3 dự án dẫn đầu</h2>
                <div className="top-projects-grid">
                  {sortedProjects.slice(0, 3).map((project, index) => (
                    <div key={project.projectId} className={`top-project-card rank-${index + 1}`}>
                      <div className="rank-badge">#{index + 1}</div>
                      <ProjectCard project={project} showVotes={true} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="all-projects">
                <h2 className="section-title">Tất cả dự án</h2>
                <div className="projects-grid">
                  {sortedProjects.map((project) => (
                    <ProjectCard key={project.projectId} project={project} showVotes={true} />
                  ))}
                </div>
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

      <Footer />
    </div>
  );
};

export default ProjectVotingPage;
