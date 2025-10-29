// src/constants/RouteConst.ts
export const RouteConst = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  STUDENT: '/student',
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    PROJECTS: '/admin/projects',
    FORUM: '/admin/forum',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },
  FORUM: {
    ROOT: '/forum',
    TOPIC_DETAIL: '/forum/topics/:topicId',
  },
  PROJECTS: {
    ROOT: '/projects',
    DETAIL: '/projects/:projectId',
    NEWS: '/projects/news',
    EXPLORE: '/projects/explore', 
    VOTING: '/projects/voting',
  },
};
