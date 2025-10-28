import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import { Home } from './components/Home';
import { RouteConst } from './constants/RouteConst';
import LoginPage from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ForumListPage from './pages/Forum/ForumListPage';
import TopicDetailPage from './pages/Forum/TopicDetailPage';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#d91c0f',
          colorPrimaryHover: '#b91c1c',
          borderRadius: 8,
        },
      }}
    >
        <Suspense fallback="Loading...">
          <BrowserRouter>
            <Routes>
              <Route path={RouteConst.HOME} element={<Home />} />
              <Route path={RouteConst.LOGIN} element={<LoginPage />} />
              <Route path={RouteConst.REGISTER} element={<RegisterPage />} />
              
              {/* Forum routes */}
              <Route path={RouteConst.FORUM.ROOT} element={<ForumListPage />} />
              <Route path={RouteConst.FORUM.TOPIC_DETAIL} element={<TopicDetailPage />} />
              
              {/* Admin routes */}
              <Route path={RouteConst.ADMIN.ROOT} element={<AdminDashboard />}>
                <Route path={RouteConst.ADMIN.USERS} element={<div>User Management</div>} />
              </Route>
              <Route
                path={RouteConst.FORGOT_PASSWORD}
                element={<ForgotPasswordPage />}
              />
              <Route path="*" element={<Navigate to={RouteConst.HOME} replace />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
    </ConfigProvider>
  );
}

export default App;
