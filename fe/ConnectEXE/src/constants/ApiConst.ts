export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const LOGIN_ENDPOINT = '/auth/login';
export const REGISTER_ENDPOINT = '/auth/register';
export const VERIFY_REGISTER_CODE_ENDPOINT = '/auth/register/verify-code';
export const RESEND_REGISTER_CODE_ENDPOINT = '/auth/register/resend-code';
// Align password recovery endpoints with backend RouteConst (AUTH_BASE = '/auth')
export const FORGOT_PASSWORD_ENDPOINT = '/auth/password/forgot';
export const VERIFY_OTP_ENDPOINT = '/auth/password/verify';
export const RESET_PASSWORD_ENDPOINT = '/auth/password/reset';
// Authenticated profile-related endpoints live under /auth
export const CHANGE_PASSWORD_ENDPOINT = '/auth/change-password';
export const EDIT_PROFILE_ENDPOINT = '/auth/edit-profile';
export const GET_PROFILE_ENDPOINT = '/auth/profile';
export const CHECK_EMAIL_ENDPOINT = '/auth/check-email';
export const CHECK_PHONE_ENDPOINT = '/auth/check-phone';
export const MEMBER_LIST_ENDPOINT = '/api/admin/users';
export const UPDATE_USER_ENDPOINT = '/api/admin/users';
export const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;