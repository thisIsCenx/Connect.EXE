// Admin Dashboard Response DTOs

export interface DashboardStatsResponseDTO {
  totalUsers: number;
  totalProjects: number;
  totalTopics: number;
  totalReplies: number;
  pendingProjects: number;
  activeUsers: number;
  projectsThisMonth: number;
  topicsThisMonth: number;
}

export interface UserListResponseDTO {
  users: UserItemDTO[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface UserItemDTO {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
}

export interface ProjectListResponseDTO {
  projects: ProjectItemDTO[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface ProjectItemDTO {
  projectId: string;
  title: string;
  description: string;
  owner: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface RecentActivityDTO {
  activityId: string;
  type: 'USER_REGISTERED' | 'PROJECT_CREATED' | 'PROJECT_APPROVED' | 'TOPIC_CREATED';
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
}

export interface RecentActivitiesResponseDTO {
  activities: RecentActivityDTO[];
  totalItems: number;
}
