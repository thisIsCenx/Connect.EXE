import axios from 'axios';
import { 
  API_BASE_URL, 
  ADMIN_STATS_ENDPOINT,
  ADMIN_USERS_ENDPOINT,
  ADMIN_USER_STATUS_ENDPOINT,
  ADMIN_PROJECTS_ENDPOINT,
  ADMIN_PROJECT_APPROVE_ENDPOINT,
  ADMIN_RECENT_ACTIVITIES_ENDPOINT
} from '../constants/ApiConst';
import { getToken } from '../utils/jwt';
import type {
  DashboardStatsResponseDTO,
  UserListResponseDTO,
  ProjectListResponseDTO,
  RecentActivitiesResponseDTO,
} from '../types/response/AdminResponseDTO';
import type {
  UpdateUserStatusRequestDTO,
  ApproveProjectRequestDTO,
  UserFilterRequestDTO,
  ProjectFilterRequestDTO,
} from '../types/request/AdminRequestDTO';

// Create axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStatsResponseDTO> => {
  const response = await axiosInstance.get(ADMIN_STATS_ENDPOINT);
  return response.data;
};

/**
 * Get list of users with filters and pagination
 */
export const getUsers = async (filters: UserFilterRequestDTO): Promise<UserListResponseDTO> => {
  const response = await axiosInstance.get(ADMIN_USERS_ENDPOINT, {
    params: filters,
  });
  return response.data;
};

/**
 * Update user status (ACTIVE, INACTIVE, SUSPENDED)
 */
export const updateUserStatus = async (payload: UpdateUserStatusRequestDTO): Promise<void> => {
  await axiosInstance.put(ADMIN_USER_STATUS_ENDPOINT(payload.userId), {
    status: payload.status,
  });
};

/**
 * Get list of projects with filters and pagination
 */
export const getProjects = async (filters: ProjectFilterRequestDTO): Promise<ProjectListResponseDTO> => {
  const response = await axiosInstance.get(ADMIN_PROJECTS_ENDPOINT, {
    params: filters,
  });
  return response.data;
};

/**
 * Approve or reject a project
 */
export const approveProject = async (payload: ApproveProjectRequestDTO): Promise<void> => {
  await axiosInstance.post(ADMIN_PROJECT_APPROVE_ENDPOINT(payload.projectId), {
    approved: payload.approved,
    reason: payload.reason,
  });
};

/**
 * Get recent activities
 */
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivitiesResponseDTO> => {
  const response = await axiosInstance.get(ADMIN_RECENT_ACTIVITIES_ENDPOINT, {
    params: { limit },
  });
  return response.data;
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`${ADMIN_USERS_ENDPOINT}/${userId}`);
};

/**
 * Delete project (admin only)
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  await axiosInstance.delete(`${ADMIN_PROJECTS_ENDPOINT}/${projectId}`);
};

export default {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getProjects,
  approveProject,
  getRecentActivities,
  deleteUser,
  deleteProject,
};
