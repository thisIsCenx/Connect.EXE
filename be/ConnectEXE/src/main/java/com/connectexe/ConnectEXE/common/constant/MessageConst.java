package com.connectexe.ConnectEXE.common.constant;

/**
 * Constants for error and info messages used throughout the authentication and
 * user management modules.
 */
public class MessageConst {
    // Error messages
    /** Error code for account not found. */
    public static final String ERROR_ACCOUNT_NOT_FOUND = "E0001";
    /** Error code for password not matching. */
    public static final String ERROR_PASSWORD_NOT_MATCH = "E0002";
    /** Error code for invalid date. */
    public static final String ERROR_INVALID_DATE = "E0004";
    /** Error code for entity not found. */
    public static final String ERROR_ENTITY_NOT_FOUND = "E0005";
    /** Error code for invalid credentials. */
    public static final String ERROR_INVALID_CREDENTIALS = "E1001";
    /** Error code for invalid verification code. */
    public static final String ERROR_VERIFICATION_CODE_INVALID = "E1002";
    /** Error code for account already verified. */
    public static final String ERROR_ACCOUNT_ALREADY_VERIFIED = "E1003";
    /** Error code for email not found. */
    public static final String ERROR_EMAIL_NOT_FOUND = "E1004";
    /** Error code for invalid OTP. */
    public static final String ERROR_OTP_INVALID = "E1005";
    /** Error code for invalid password reset. */
    public static final String ERROR_PASSWORD_RESET_INVALID = "E1006";
    /** Error code for inactive account. */
    public static final String ERROR_ACCOUNT_INACTIVE = "E1007";
    /** Error code for email not verified. */
    public static final String ERROR_EMAIL_NOT_VERIFIED = "E1008";
    /** Error code for registration info already used. */
    public static final String ERROR_REGISTER_INFO_USED = "E1009";
    /** Error code for new password same as old. */
    public static final String ERROR_NEW_PASSWORD_SAME_AS_OLD = "E1010";
    /** Error code for employee not found. */
    public static final String ERROR_EMPLOYEE_NOT_FOUND = "E1001";
    /** Error code for employee already exists. */
    public static final String ERROR_EMPLOYEE_ALREADY_EXISTS = "E1002";
    /** Error code for failed to add employee. */
    public static final String ERROR_FAILED_TO_ADD_EMPLOYEE = "E1003";
    /** Error code for failed to update employee. */
    public static final String ERROR_FAILED_TO_UPDATE_EMPLOYEE = "E1004";
    /** Error code for failed to delete employee. */
    public static final String ERROR_FAILED_TO_DELETE_EMPLOYEE = "E1005";
    /** Error code for failed to restore employee. */
    public static final String ERROR_FAILED_TO_RESTORE_EMPLOYEE = "E1006";

    // Info messages
    public static final String INFO_REQUEST_SUCCESS = "I0001";

    // Message text
    public static final String MSG_REGISTER_INFO_USED = "Thông tin đăng ký đã được sử dụng";
    public static final String MSG_REGISTER_SUCCESS = "Registration successful. Please check your email for the 6-digit verification code.";
    public static final String MSG_VERIFICATION_SUCCESS = "Verification successful. Your account is now activated!";
    public static final String MSG_VERIFICATION_CODE_INVALID = "Verification code is incorrect.";
    public static final String MSG_VERIFICATION_CODE_USED = "Verification code has already been used.";
    public static final String MSG_VERIFICATION_CODE_RESENT = "Verification code resent successfully.";
    public static final String MSG_EMAIL_NOT_FOUND = "No user found with the provided email.";
    public static final String MSG_ACCOUNT_ALREADY_VERIFIED = "Your account is already verified.";
    public static final String MSG_LOGIN_INVALID = "Invalid email/phone or password.";
    public static final String MSG_ACCOUNT_INACTIVE = "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
    public static final String MSG_ACCOUNT_SUSPENDED = "Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm nghiêm trọng. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.";
    public static final String MSG_EMAIL_NOT_VERIFIED = "Your email is not verified. Please check your email to verify your account.";
    public static final String MSG_OTP_SENT = "OTP has been sent to your email.";
    public static final String MSG_OTP_INVALID = "OTP is incorrect.";
    public static final String MSG_OTP_EXPIRED = "OTP has expired.";
    public static final String MSG_OTP_VALID = "OTP is valid. You may reset your password.";
    public static final String MSG_PASSWORD_RESET_SUCCESS = "Password has been reset successfully.";
    public static final String MSG_PASSWORD_RESET_INVALID = "Invalid password reset request";
    public static final String MSG_NEW_PASSWORD_SAME_AS_OLD = "New password must be different from the old one.";
    public static final String MSG_USER_NOT_FOUND = "User not found";
    public static final String MSG_OTP_RESEND_LIMIT_EXCEEDED = "You have exceeded the maximum number of OTP resends per day. Please try again tomorrow or contact support if you need help.";
    public static final String MSG_OTP_NOT_VERIFIED_OR_EXPIRED = "Bạn chưa xác thực OTP hoặc OTP đã hết hạn.";
    public static final String MSG_OTP_FAILED_ATTEMPTS_EXCEEDED = "Bạn đã nhập sai mã OTP quá nhiều lần. Vui lòng yêu cầu gửi lại mã mới hoặc liên hệ hỗ trợ.";
    public static final String MSG_CANNOT_CHANGE_GOOGLE_PASSWORD = "Cannot change password for Google login accounts";
    public static final String MSG_CURRENT_PASSWORD_INCORRECT = "Current password is incorrect";
    public static final String MSG_EMAIL_ALREADY_EXISTS = "Email already exists!";
    public static final String MSG_PHONE_ALREADY_EXISTS = "Phone number already exists!";
    public static final String MSG_IDENTITY_CARD_ALREADY_EXISTS = "Identity card already exists!";

    public static final String MSG_EMPLOYEE_NOT_FOUND = "Employee not found";
    public static final String MSG_EMPLOYEE_USER_NOT_FOUND = "User information not found for employee";
    public static final String MSG_PASSWORD_MISMATCH = "Password and confirmation do not match";
    public static final String MSG_PASSWORD_TOO_SHORT = "Password must be at least 8 characters long";
    public static final String MSG_EMAIL_EXISTS = "Email already exists in the system";
    public static final String MSG_PHONE_EXISTS = "Phone number already exists in the system";
    public static final String MSG_IDENTITY_CARD_EXISTS = "Identity card already exists in the system";
    public static final String MSG_EMPLOYEE_ADDED = "Employee added successfully";
    public static final String MSG_EMPLOYEE_UPDATED = "Employee updated successfully";
    public static final String MSG_EMPLOYEE_DELETED = "Employee deleted successfully";
    public static final String MSG_EMPLOYEE_RESTORED = "Employee restored successfully";

    // Log message
    public static final String LOG_API_ACCESS = "[API_ACCESS] {} {} by user: {} - status: {} - duration: {}ms";
}