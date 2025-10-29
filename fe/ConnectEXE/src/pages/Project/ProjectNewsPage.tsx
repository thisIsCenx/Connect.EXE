import React, { useEffect, useState } from 'react';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import { ProjectCard } from '../../components/Project';
import { getSuccessfulProjects } from '../../services/ProjectService';
import type { ProjectResponse } from '../../types/response/ProjectResponseDTO';
import './styles/ProjectNewsPage.scss';

const ProjectNewsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getSuccessfulProjects(currentPage, 12);
        setProjects(response.projects);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to fetch successful projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  return (
    <div className="project-news-page">
      <Header breadcrumbs={[]} />
      
      <main className="news-main">
        <div className="news-container">
          <div className="news-header">
            <h1 className="news-title">Tin tức & Dự án thành công</h1>
            <p className="news-subtitle">
              Cập nhật những dự án khởi nghiệp đạt được thành công và tin tức mới nhất
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải tin tức...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có dự án thành công nào</p>
            </div>
          ) : (
            <>
              <div className="projects-grid">
                {projects.map((project) => (
                  <ProjectCard key={project.projectId} project={project} showVotes={true} />
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

      <Footer />
    </div>
  );
};

export default ProjectNewsPage;
