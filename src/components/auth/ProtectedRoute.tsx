import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../authStore'; // 경로 확인

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation(); // 현재 경로 저장 (로그인 후 리디렉션용)

  if (!isAuthenticated) {
    // 로그인 안됨 -> 로그인 페이지로 리디렉션, 현재 경로는 state로 전달
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인 됨 -> 자식 라우트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;