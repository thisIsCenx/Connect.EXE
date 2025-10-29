// Project Request DTOs - Match backend structure
export interface CreateProjectRequest {
  projectName: string;  // Backend field name
  description: string;
  content: string;
  category: 'TECHNOLOGY' | 'EDUCATION' | 'RECYCLE' | 'INDUSTRIAL' | 'OTHER';
  imageUrl?: string;
  tags?: string;  // Backend expects string, not array
  members?: string;  // Backend expects string, not array
  websiteLink?: string;
  githubLink?: string;
  demoLink?: string;
  isPublic?: boolean;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  projectId: number;
}

export interface VoteProjectRequest {
  projectId: number;
}
