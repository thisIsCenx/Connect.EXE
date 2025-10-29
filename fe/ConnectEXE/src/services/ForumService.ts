import axios from 'axios';
import { getAuthHeader, removeTokens, getUserFromToken } from '../utils/jwt';
import type {
  TopicResponse,
  TopicDetailResponse,
  ReplyResponse,
  ApiResponse,
  PageResponse,
} from '../types/response/ForumResponseDTO';
import type {
  CreateTopicRequest,
  CreateReplyRequest,
} from '../types/request/ForumRequestDTO';
import {
  API_BASE_URL,
  FORUM_TOPICS_ENDPOINT,
  FORUM_TOPIC_DETAIL_ENDPOINT,
  FORUM_TOPIC_REPLIES_ENDPOINT,
  FORUM_TOPIC_APPROVE_ENDPOINT,
  FORUM_TOPIC_RESTORE_ENDPOINT,
} from '../constants/ApiConst';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for logging and adding JWT Authorization header or userId header
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    
    // Try JWT first
    const authHeader = getAuthHeader();
    if (authHeader && config.headers) {
      config.headers['Authorization'] = authHeader;
      console.log('✅ ForumService - Added JWT Authorization header');
      
      // Also add userId header for backwards compatibility with backend
      const decoded = getUserFromToken();
      if (decoded && decoded.userId) {
        config.headers['userId'] = decoded.userId;
        console.log('✅ ForumService - Added userId header from JWT:', decoded.userId);
      }
    } else {
      // Fallback to userId from localStorage if no JWT
      const userId = localStorage.getItem('userId');
      if (userId && config.headers) {
        config.headers['userId'] = userId;
        console.log('⚠️ ForumService - Using userId from localStorage:', userId);
      } else {
        console.warn('⚠️ ForumService - No authentication available');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('🚫 ForumService - 401 Unauthorized. Redirecting to login...');
      removeTokens();
      window.location.href = '/login?error=SessionExpired';
      return;
    }
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}:`, error.response?.data);
    return Promise.reject(error);
  }
);

/**
 * Get list of topics with optional filtering
 * @param approved Filter by approval status (optional)
 * @param userId Filter by user ID (optional)
 * @param isActive Filter by active status (optional, default: true)
 * @param page Page number (0-indexed, default: 0)
 * @param size Page size (default: 10)
 */
export const getTopics = async (
  approved?: boolean,
  userId?: string,
  isActive?: boolean,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<TopicResponse>>> => {
  const params: any = { page, size };
  if (approved !== undefined) params.approved = approved;
  if (userId) params.userId = userId;
  if (isActive !== undefined) params.isActive = isActive;
  
  const response = await axiosInstance.get(FORUM_TOPICS_ENDPOINT, { params });
  return response.data;
};

/**
 * Create a new topic
 * @param payload Topic creation request
 */
export const createTopic = async (
  payload: CreateTopicRequest
): Promise<ApiResponse<TopicResponse>> => {
  const response = await axiosInstance.post(FORUM_TOPICS_ENDPOINT, payload);
  return response.data;
};

/**
 * Get topic details with all replies
 * @param topicId ID of the topic
 */
export const getTopicDetail = async (
  topicId: string
): Promise<ApiResponse<TopicDetailResponse>> => {
  const response = await axiosInstance.get(FORUM_TOPIC_DETAIL_ENDPOINT(topicId));
  return response.data;
};

/**
 * Create a reply to a topic
 * @param topicId ID of the topic
 * @param payload Reply creation request
 */
export const createReply = async (
  topicId: string,
  payload: CreateReplyRequest
): Promise<ApiResponse<ReplyResponse>> => {
  const response = await axiosInstance.post(FORUM_TOPIC_REPLIES_ENDPOINT(topicId), payload);
  return response.data;
};

/**
 * Approve a topic (requires teacher/admin role)
 * @param topicId ID of the topic to approve
 */
export const approveTopic = async (
  topicId: string
): Promise<ApiResponse<TopicResponse>> => {
  const response = await axiosInstance.patch(FORUM_TOPIC_APPROVE_ENDPOINT(topicId));
  return response.data;
};

/**
 * Delete a reply (requires teacher/admin role)
 * @param replyId ID of the reply to delete
 */
export const deleteReply = async (
  replyId: string
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete(`/api/forum/replies/${replyId}`);
  return response.data;
};

/**
 * Soft delete a topic (requires teacher/admin role)
 * Sets isActive to false instead of hard delete
 * @param topicId ID of the topic to delete
 */
export const deleteTopic = async (
  topicId: string
): Promise<ApiResponse<void>> => {
  // Use unified forum base path (no /api prefix)
  const response = await axiosInstance.delete(FORUM_TOPIC_DETAIL_ENDPOINT(topicId));
  return response.data;
};

/**
 * Restore a soft-deleted topic (requires teacher/admin role)
 * Sets isActive back to true
 * @param topicId ID of the topic to restore
 */
export const restoreTopic = async (
  topicId: string
): Promise<ApiResponse<void>> => {
  // Use unified forum base path (no /api prefix)
  const response = await axiosInstance.patch(FORUM_TOPIC_RESTORE_ENDPOINT(topicId));
  return response.data;
};
