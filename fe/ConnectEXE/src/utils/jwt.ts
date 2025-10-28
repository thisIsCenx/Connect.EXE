/**
 * JWT Token Management Utilities
 */

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  exp: number;
  iat: number;
}

/**
 * Save access token to localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Save refresh token to localStorage
 */
export const saveRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Get access token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Remove tokens from localStorage
 */
export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Also remove old userId, fullName, role from localStorage
  localStorage.removeItem('userId');
  localStorage.removeItem('fullName');
  localStorage.removeItem('role');
  localStorage.removeItem('status');
};

/**
 * Decode JWT token (without verification)
 * WARNING: This is NOT secure - only use for reading claims from our own backend tokens
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get user info from current token
 */
export const getUserFromToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    console.warn('Token is expired');
    removeTokens();
    return null;
  }
  
  return decodeToken(token);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

/**
 * Get Authorization header value
 */
export const getAuthHeader = (): string | null => {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
};
