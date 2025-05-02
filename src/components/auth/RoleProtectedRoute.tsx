// src/components/auth/RoleProtectedRoute.tsx (수정)
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../authStore'; // 경로 확인

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);
  const location = useLocation();

  // 1. 로그인 여부 확인
  if (!isAuthenticated) {
    // 로그인 안됨 -> 로그인 페이지로 리디렉션
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. 역할 확인
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.warn(`RoleProtectedRoute: Role '${userRole}' not allowed for this route. Redirecting to /login.`);
    // 역할이 없거나 허용되지 않음 -> 로그인 페이지로 리디렉션 (unauthorized 대신)
    // 접근하려던 페이지 정보를 state로 넘겨서 로그인 후 이동시킬 수도 있음
    return <Navigate to="/login" state={{ from: location, unauthorized: true }} replace />;
  }

  // 3. 허용됨 -> 자식 라우트 렌더링
  return <Outlet />;
};

export default RoleProtectedRoute;