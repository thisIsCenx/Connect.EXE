import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import { getProjectDetail, voteProject, unvoteProject } from '../../services/ProjectService';
import type { ProjectDetailResponse } from '../../types/response/ProjectResponseDTO';
import './styles/ProjectDetailPage.scss';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectDetail(Number(projectId));
        setProject(data);
      } catch (err) {
        setError('Không thể tải thông tin dự án');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleVote = async () => {
    if (!project || isVoting) return;
    
    try {
      setIsVoting(true);
      if (project.isVotedByCurrentUser) {
        await unvoteProject(project.projectId);
        setProject({
          ...project,
          isVotedByCurrentUser: false,
          voteCount: (project.voteCount || 0) - 1,
        });
      } else {
        await voteProject(project.projectId);
        setProject({
          ...project,
          isVotedByCurrentUser: true,
          voteCount: (project.voteCount || 0) + 1,
        });
      }
    } catch (err) {
      console.error('Vote failed:', err);
      alert('Không thể vote. Vui lòng đăng nhập.');
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <Header breadcrumbs={[]} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <Header breadcrumbs={[]} />
        <div className="error-container">
          <h2>Lỗi</h2>
          <p>{error || 'Không tìm thấy dự án'}</p>
          <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <Header breadcrumbs={[]} />
      
      <main className="project-detail-main">
        <div className="project-detail-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>

          <div className="project-detail-hero">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="project-hero-image" />
            ) : (
              <div className="project-hero-placeholder">Project Image</div>
            )}
          </div>

          <div className="project-detail-content">
            <div className="project-detail-header">
              <div className="project-categories">
                <span className="project-category">{project.category}</span>
                <span className={`project-status status-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>
              
              <h1 className="project-title">{project.title}</h1>
              
              <p className="project-description">{project.description}</p>

              <div className="project-meta">
                <div className="project-author">
                  <span className="meta-icon">👤</span>
                  <span>Tạo bởi: <strong>{project.createdBy.fullName}</strong></span>
                </div>
                <div className="project-date">
                  <span className="meta-icon">📅</span>
                  <span>{new Date(project.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div className="project-actions">
                <button 
                  className={`btn-vote ${project.isVotedByCurrentUser ? 'voted' : ''}`}
                  onClick={handleVote}
                  disabled={isVoting}
                >
                  <span className="vote-icon">❤️</span>
                  <span>{project.isVotedByCurrentUser ? 'Đã vote' : 'Vote'}</span>
                  <span className="vote-count">({project.voteCount || 0})</span>
                </button>
              </div>
            </div>

            <div className="project-detail-body">
              <h2>Nội dung chi tiết</h2>
              <div 
                className="project-content" 
                dangerouslySetInnerHTML={{ __html: project.content }}
              />

              {project.tags && project.tags.length > 0 && (
                <div className="project-tags">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {project.members && project.members.length > 0 && (
                <div className="project-members">
                  <h3>Thành viên</h3>
                  <ul className="members-list">
                    {project.members.map((member, index) => (
                      <li key={index}>{member}</li>
                    ))}
                  </ul>
                </div>
              )}

              {project.links && (
                <div className="project-links">
                  <h3>Liên kết</h3>
                  <div className="links-list">
                    {project.links.website && (
                      <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="link-item">
                        🌐 Website
                      </a>
                    )}
                    {project.links.github && (
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="link-item">
                        💻 GitHub
                      </a>
                    )}
                    {project.links.demo && (
                      <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="link-item">
                        🎬 Demo
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
