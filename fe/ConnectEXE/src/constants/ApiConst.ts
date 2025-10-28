// Base URL
export const API_BASE_URL = 'http://localhost:8080';

// Auth endpoints
export const AUTH_BASE = '/auth';
export const LOGIN_ENDPOINT = `${AUTH_BASE}/login`;
export const LOGOUT_ENDPOINT = `${AUTH_BASE}/logout`;
export const REGISTER_ENDPOINT = `${AUTH_BASE}/register`;
export const VERIFY_REGISTER_CODE_ENDPOINT = `${AUTH_BASE}/register/verify-code`;
export const RESEND_REGISTER_CODE_ENDPOINT = `${AUTH_BASE}/register/resend-code`;
export const FORGOT_PASSWORD_ENDPOINT = `${AUTH_BASE}/password/forgot`;
export const VERIFY_OTP_ENDPOINT = `${AUTH_BASE}/password/verify`;
export const RESET_PASSWORD_ENDPOINT = `${AUTH_BASE}/password/reset`;
export const CHANGE_PASSWORD_ENDPOINT = `${AUTH_BASE}/change-password`;
export const EDIT_PROFILE_ENDPOINT = `${AUTH_BASE}/edit-profile`;
export const GET_PROFILE_ENDPOINT = `${AUTH_BASE}/profile`;
export const CHECK_EMAIL_ENDPOINT = `${AUTH_BASE}/check-email`;
export const CHECK_PHONE_ENDPOINT = `${AUTH_BASE}/check-phone`;

// OAuth2 endpoint - CRITICAL: Must match Spring Security configuration
export const GOOGLE_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/google`;

// User endpoints
export const USERS_BASE = '/users';
export const MEMBER_LIST_ENDPOINT = `${USERS_BASE}`;
export const UPDATE_USER_ENDPOINT = `${USERS_BASE}`;

// Project endpoints
export const PROJECTS_BASE = '/projects';

// Skills endpoints
export const SKILLS_BASE = '/skills';

// Materials endpoints
export const MATERIALS_BASE = '/materials';

// News endpoints
export const NEWS_BASE = '/news';

// Forum endpoints
export const FORUM_BASE = '/forum';
export const FORUM_TOPICS = `${FORUM_BASE}/topics`;

// Support endpoints
export const SUPPORT_BASE = '/support';
export const SUPPORT_TICKETS = `${SUPPORT_BASE}/tickets`;