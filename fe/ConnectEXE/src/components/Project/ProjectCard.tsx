import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectResponse } from '../../types/response/ProjectResponseDTO';
import './styles/ProjectCard.scss';

interface ProjectCardProps {
  project: ProjectResponse;
  showVotes?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, showVotes = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.projectId}`);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      TECHNOLOGY: 'Công nghệ',
      EDUCATION: 'Giáo dục',
      RECYCLE: 'Tái chế',
      INDUSTRIAL: 'Công nghiệp',
      OTHER: 'Khác',
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      APPROVED: 'blue',
      SUCCESSFUL: 'green',
      REJECTED: 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="project-card" onClick={handleClick}>
      <div className="project-card-image">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} loading="lazy" />
        ) : (
          <div className="project-card-placeholder">
            <span>Project Image</span>
          </div>
        )}
        <div className={`project-card-status status-${getStatusColor(project.status)}`}>
          {project.status}
        </div>
      </div>
      
      <div className="project-card-content">
        <div className="project-card-category">
          {getCategoryLabel(project.category)}
        </div>
        
        <h3 className="project-card-title">{project.title}</h3>
        
        <p className="project-card-description">
          {project.description}
        </p>
        
        <div className="project-card-footer">
          <div className="project-card-author">
            <span className="author-icon">👤</span>
            <span className="author-name">{project.createdBy.fullName}</span>
          </div>
          
          {showVotes && project.voteCount !== undefined && (
            <div className="project-card-votes">
              <span className="vote-icon">❤️</span>
              <span className="vote-count">{project.voteCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
