// router.ts (또는 .js)
import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"; // Navigate, Outlet 추가
import Root from "./Root"; // Root 컴포넌트가 무엇인지 확인 필요

// 인증 페이지
import RegisterPage from "../screen/RegisterPage";
import LoginPage from "../screen/LoginPage";

// 레이아웃 (Main 컴포넌트들)
import StudentMain from "../screen/student/Main";
import LecturerMain from "../screen/instructor/Main";
// import AdminMain from "../screen/admin/Main"; // TODO: 관리자 레이아웃

// 학생 페이지
import StudentDashBoard from "../screen/student/Dashboard"
import StudentLectures from "../screen/student/Courses";
import Analysis from "../screen/student/Monitoring";
import StudentSetting from "../screen/student/Setting";

// 교수자 페이지
import InstructorCourses from "../screen/instructor/Lectures";
import InstructorSetting from "../screen/instructor/Setting";
import RecordingList from "../screen/instructor/RecordingList";
import RecordingDetail from "../screen/instructor/RecordingDetail";

// TODO: 관리자 페이지 컴포넌트 import

// 보호 라우트 컴포넌트 import
import ProtectedRoute from "../components/auth/ProtectedRoute"; // 경로 확인
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute"; // 경로 확인

const router = createBrowserRouter([
  // --- 공개 라우트 ---
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <Root />,
  },

  // --- 보호 라우트 (로그인 필수) ---
  {
    element: <ProtectedRoute />, // 1단계: 로그인 여부 체크
    children: [
      // --- 학생 전용 라우트 ---
      {
        element: <RoleProtectedRoute allowedRoles={['student']} />,
        children: [
          {
            path: "/student",
            element: <StudentMain />,
            children: [
              { path: "dashboard", element: <StudentDashBoard /> },
              { path: "courses", element: <StudentLectures /> },
              { path: "monitoring", element: <Analysis /> },
              { path: "setting", element: <StudentSetting /> },
              // /student 기본 경로 -> dashboard로 리디렉션
              { index: true, element: <Navigate to="dashboard" replace /> }
            ],
          },
        ]
      },
      // --- 강의자 전용 라우트 ---
      {
        element: <RoleProtectedRoute allowedRoles={['instructor']} />, 
        children: [
          {
            path: "/instructor",
            element: <LecturerMain />,
            children: [
              { path: "courses", element: <InstructorCourses/> },
              {
                path: "recording",
                children: [
                  { index: true, element: <RecordingList /> }, // /instructor/recording
                  { path: ":id", element: <RecordingDetail /> } // /instructor/recording/:id
                ]
              },
              { path: "setting", element: <InstructorSetting /> },
               // /instructor 기본 경로 -> courses로 리디렉션
              { index: true, element: <Navigate to="courses" replace /> }
            ],
          }
        ]
      },
      // --- 관리자 전용 라우트 (TODO) ---
      // {
      //   element: <RoleProtectedRoute allowedRoles={['admin']} />, // 2단계: 관리자 역할 체크
      //   children: [
      //     {
      //       path: "/admin",
      //       element: <AdminMain />, // 관리자 레이아웃
      //       children: [
      //         // ... 관리자 페이지 라우트 ...
      //         { index: true, element: <Navigate to="some-admin-page" replace /> }
      //       ]
      //     }
      //   ]
      // },

      // --- 모든 로그인 사용자가 접근 가능한 공통 라우트 (선택 사항) ---
      // { path: "/profile", element: <UserProfile /> }

    ] // ProtectedRoute children 끝
  }, // ProtectedRoute 끝

  // --- 404 Not Found (맨 마지막에 위치) ---
  // { path: "*", element: <NotFound /> }
]);

export default router;