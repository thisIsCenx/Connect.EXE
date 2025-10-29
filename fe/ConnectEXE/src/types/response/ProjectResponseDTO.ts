// Project Response DTOs
export interface ProjectResponse {
  projectId: number;
  title: string;
  description: string;
  category: 'TECHNOLOGY' | 'EDUCATION' | 'RECYCLE' | 'INDUSTRIAL' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'SUCCESSFUL' | 'REJECTED';
  imageUrl?: string;
  createdBy: {
    userId: number;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  voteCount?: number;
  isVotedByCurrentUser?: boolean;
}

export interface ProjectDetailResponse extends ProjectResponse {
  content: string;
  tags?: string[];
  members?: string[];
  links?: {
    website?: string;
    github?: string;
    demo?: string;
  };
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}
