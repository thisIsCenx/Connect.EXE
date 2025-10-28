package com.connectexe.ConnectEXE.common.constant;

/**
 * Constants for API routes used in the movie theater application.
 */
public class RouteConst {

    // public static final String API_VERSION = "/v1";
    // public static final String API_BASE = "/api" + API_VERSION;
    public static final String API_PARAM_ID = "id";
    public static final String API_PARAM_ID_PATH = "/{" + API_PARAM_ID + "}";
    public static final String API_PARAM_MOVIE_ID = "movieId";
    public static final String API_PARAM_MOVIE_ID_PATH = "/{" + API_PARAM_MOVIE_ID + "}";
    public static final String API_PARAM_SCHEDULE_ID = "scheduleId";
    public static final String API_PARAM_SCHEDULE_ID_PATH = "/{" + API_PARAM_SCHEDULE_ID + "}";
    public static final String API_PARAM_IMAGE_ID = "imageId";
    public static final String API_PARAM_IMAGE_ID_PATH = "/{" + API_PARAM_IMAGE_ID + "}";
    public static final String API_PARAM_MEMBER_ID = "memberId";
    public static final String API_PARAM_MEMBER_ID_PATH = "/{" + API_PARAM_MEMBER_ID + "}";
    public static final String API_PARAM_COMMENT_ID = "commentId";
    public static final String API_PARAM_COMMENT_ID_PATH = "/{" + API_PARAM_COMMENT_ID + "}";
    public static final String API_PARAM_REPORT_ID = "reportId";
    public static final String API_PARAM_REPORT_ID_PATH = "/{" + API_PARAM_REPORT_ID + "}";
    public static final String API_PARAM_TOPIC_ID = "topicId";
    public static final String API_PARAM_TOPIC_ID_PATH = "/{" + API_PARAM_TOPIC_ID + "}";

    // Authentication routes
    // Use /auth as the public authentication base. Keep endpoints centralized here for easier changes and
    // to avoid leaking raw strings throughout the codebase.
    public static final String AUTH_BASE = "/auth";
    public static final String OTP_BASE = AUTH_BASE + "/otp";
    public static final String LOGIN = "/login";
    public static final String LOGOUT = "/logout";
    public static final String REGISTER = "/register";
    public static final String REGISTER_VERIFY = REGISTER + "/verify-code";
    public static final String REGISTER_RESEND = REGISTER + "/resend-code";
    public static final String PASSWORD = "/password";
    public static final String PASSWORD_FORGOT = PASSWORD + "/forgot";
    public static final String PASSWORD_VERIFY = PASSWORD + "/verify";
    public static final String PASSWORD_RESET = PASSWORD + "/reset";
    public static final String OAUTH2_SUCCESS = "/oauth2/success";
    // Profile related endpoints under AUTH_BASE
    public static final String CHANGE_PASSWORD = "/change-password";
    public static final String EDIT_PROFILE = "/edit-profile";
    public static final String PROFILE = "/profile";
    public static final String CHECK_EMAIL = "/check-email";
    public static final String CHECK_PHONE = "/check-phone";
    
    // User profile routes
    public static final String USERS_BASE = "/users";
    public static final String USERS_ME = USERS_BASE + "/me";
    public static final String USERS_ID_PATH = USERS_BASE + API_PARAM_ID_PATH;
    public static final String USERS_ME_SKILLS = USERS_ME + "/skills";

    // Skills and competencies 
    public static final String SKILLS = "/skills";

    // User settings
    public static final String SETTINGS_BASE = "/settings";
    public static final String SETTINGS_ME = SETTINGS_BASE + "/me";

    // Forum and discussions
    public static final String FORUM_BASE = "/forum";
    public static final String FORUM_TOPICS = FORUM_BASE + "/topics";
    public static final String FORUM_TOPIC_ID_PATH = FORUM_TOPICS + API_PARAM_TOPIC_ID_PATH;
    public static final String FORUM_TOPIC_REPLIES = FORUM_TOPIC_ID_PATH + "/replies";
    public static final String FORUM_TOPIC_APPROVE = FORUM_TOPIC_ID_PATH + "/approve";
    // Backwards-compatible alias used by SecurityConfig
    public static final String FORUM_APPROVE = FORUM_TOPIC_APPROVE;

    // Support and tickets
    public static final String SUPPORT_BASE = "/support";
    public static final String SUPPORT_TICKETS = SUPPORT_BASE + "/tickets";
    public static final String SUPPORT_TICKET_ID_PATH = SUPPORT_TICKETS + API_PARAM_ID_PATH;

    // Projects and project management
    public static final String PROJECTS_BASE = "/projects";
    public static final String PROJECTS = PROJECTS_BASE; // alias expected by SecurityConfig
    public static final String PROJECTS_ID_PATH = PROJECTS + API_PARAM_ID_PATH; // alias expected by SecurityConfig
    public static final String PROJECT_ID_PATH = PROJECTS_BASE + API_PARAM_ID_PATH;
    public static final String PROJECT_MEMBERS = PROJECT_ID_PATH + "/members";
    public static final String PROJECT_MEMBER_ID_PATH = PROJECT_MEMBERS + API_PARAM_MEMBER_ID_PATH;
    public static final String PROJECT_IMAGES = PROJECT_ID_PATH + "/images";
    public static final String PROJECT_IMAGE_ID_PATH = PROJECT_IMAGES + API_PARAM_IMAGE_ID_PATH;
    public static final String PROJECT_COMMENTS = PROJECT_ID_PATH + "/comments";
    public static final String PROJECT_COMMENT_ID_PATH = PROJECT_COMMENTS + API_PARAM_COMMENT_ID_PATH;
    public static final String PROJECT_VOTES = PROJECT_ID_PATH + "/votes";
    public static final String PROJECT_REPORTS = PROJECT_ID_PATH + "/reports";
    public static final String PROJECT_REPORT_ID_PATH = PROJECT_REPORTS + API_PARAM_REPORT_ID_PATH;
    public static final String PROJECT_REPORT_DOWNLOAD = PROJECT_REPORT_ID_PATH + "/download";
    public static final String PROJECT_PUBLISH_STATUS = PROJECT_ID_PATH + "/publish-status";

    // Course materials and resources
    public static final String MATERIALS_BASE = "/materials";
    public static final String MATERIALS = MATERIALS_BASE; // alias expected by SecurityConfig
    public static final String MATERIAL_ID_PATH = MATERIALS_BASE + API_PARAM_ID_PATH;

    // News and announcements
    public static final String NEWS_BASE = "/news";
    public static final String NEWS = NEWS_BASE; // alias expected by SecurityConfig
    public static final String NEWS_ID_PATH = NEWS_BASE + API_PARAM_ID_PATH;

    // Marketplace
    public static final String MARKETPLACE_BASE = "/marketplace";
    public static final String MARKETPLACE_LISTINGS = MARKETPLACE_BASE + "/listings";
    public static final String MARKETPLACE_LISTING_ID_PATH = MARKETPLACE_LISTINGS + API_PARAM_ID_PATH;

    // Admin and management routes
    public static final String ADMIN_BASE = "/api/admin";
    public static final String ADMIN_USERS = ADMIN_BASE + "/users";
    public static final String ADMIN_USER_ID_PATH = ADMIN_USERS + API_PARAM_ID_PATH;
    public static final String ADMIN_USER_ROLE = ADMIN_USER_ID_PATH + "/role";
    public static final String ADMIN_USER_STATUS = ADMIN_USER_ID_PATH + "/status";
    public static final String ADMIN_AUDIT_LOGS = ADMIN_BASE + "/audit-logs";

    // Constants for query parameters 
    public static final String PARAM_PAGE = "page";
    public static final String PARAM_APPROVED = "approved";
    public static final String PARAM_USER_ID = "userId";
    public static final String PARAM_SEMESTER = "semester";
    public static final String PARAM_FIELD = "field";
    public static final String PARAM_COURSE = "course";
    public static final String PARAM_STATUS = "status";
    public static final String PARAM_QUERY = "q";
    public static final String PARAM_CATEGORY = "category";
    public static final String PARAM_FILE_TYPE = "filetype";
    public static final String PARAM_UPLOADER_ID = "uploaderId";
    public static final String PARAM_EVENT_TYPE = "eventtype";
    public static final String PARAM_IS_PINNED = "isPinned";
    public static final String PARAM_IS_APPROVED = "isApproved";
    
}