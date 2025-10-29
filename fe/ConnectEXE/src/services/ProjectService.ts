import { API_BASE_URL } from '../constants/ApiConst';
import type { ProjectResponse, ProjectDetailResponse, ProjectListResponse } from '../types/response/ProjectResponseDTO';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/request/ProjectRequestDTO';

// Helper to get headers with auth token
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Get random projects from subscribed users
export const getRandomProjects = async (limit: number = 6): Promise<ProjectResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/projects/random?limit=${limit}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch random projects');
  const result = await response.json();
  return result.data || result;
};

// Get successful projects (featured)
export const getSuccessfulProjects = async (page: number = 0, size: number = 10): Promise<ProjectListResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects/successful?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch successful projects');
  const result = await response.json();
  // Backend returns Page object in data, convert to ProjectListResponse
  const pageData = result.data || result;
  return {
    projects: pageData.content || [],
    totalPages: pageData.totalPages || 0,
    totalElements: pageData.totalElements || 0,
    currentPage: pageData.number || 0,
  };
};

// Get projects by category
export const getProjectsByCategory = async (
  category: string,
  page: number = 0,
  size: number = 10
): Promise<ProjectListResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects/category/${category}?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch projects by category');
  const result = await response.json();
  const pageData = result.data || result;
  return {
    projects: pageData.content || [],
    totalPages: pageData.totalPages || 0,
    totalElements: pageData.totalElements || 0,
    currentPage: pageData.number || 0,
  };
};

// Get all projects with pagination
export const getAllProjects = async (page: number = 0, size: number = 10): Promise<ProjectListResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch projects');
  const result = await response.json();
  const pageData = result.data || result;
  return {
    projects: pageData.content || [],
    totalPages: pageData.totalPages || 0,
    totalElements: pageData.totalElements || 0,
    currentPage: pageData.number || 0,
  };
};

// Get project detail
export const getProjectDetail = async (projectId: number): Promise<ProjectDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch project detail');
  const result = await response.json();
  return result.data || result;
};

// Create project
export const createProject = async (data: CreateProjectRequest): Promise<ProjectResponse> => {
  console.log('Creating project with data:', data);
  
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  console.log('Create project response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create project failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || errorData.error || 'Failed to create project');
    } catch (e) {
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
  }
  
  const result = await response.json();
  console.log('Create project result:', result);
  // Backend returns ApiResponse wrapper: { success, message, data }
  return result.data || result;
};

// Update project
export const updateProject = async (data: UpdateProjectRequest): Promise<ProjectResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects/${data.projectId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update project');
  const result = await response.json();
  return result.data || result;
};

// Vote for project
export const voteProject = async (projectId: number): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/vote`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to vote project');
};

// Unvote project
export const unvoteProject = async (projectId: number): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/unvote`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to unvote project');
};

// Get voting projects
export const getVotingProjects = async (page: number = 0, size: number = 10): Promise<ProjectListResponse> => {
  const response = await fetch(`${API_BASE_URL}/projects/voting?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch voting projects');
  const result = await response.json();
  const pageData = result.data || result;
  return {
    projects: pageData.content || [],
    totalPages: pageData.totalPages || 0,
    totalElements: pageData.totalElements || 0,
    currentPage: pageData.number || 0,
  };
};
