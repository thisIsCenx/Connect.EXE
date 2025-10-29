import axios from 'axios';
import { getAuthHeader } from '../utils/jwt';

const API_BASE_URL = 'http://localhost:8080/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Upload image to Cloudinary
 * @param file Image file to upload
 * @param folder Optional folder name in Cloudinary (default: 'connect-exe')
 * @returns Upload response with image URL
 */
export const uploadImage = async (
  file: File,
  folder: string = 'connect-exe'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const authHeader = getAuthHeader();
  const headers: any = {
    'Content-Type': 'multipart/form-data',
  };

  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
    headers,
  });

  return response.data;
};

/**
 * Delete image from Cloudinary
 * @param publicId Public ID of the image to delete
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  const authHeader = getAuthHeader();
  const headers: any = {};

  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  await axios.delete(`${API_BASE_URL}/upload/image`, {
    params: { publicId },
    headers,
  });
};

/**
 * Validate image file before upload
 * @param file File to validate
 * @returns Validation result with error message if invalid
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File phải là ảnh' };
  }

  if (!allowedFormats.includes(file.type)) {
    return { valid: false, error: 'Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP, BMP' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Kích thước ảnh không được vượt quá 10MB' };
  }

  return { valid: true };
};
