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
import StudentDashBoard from "../screen/student/Dashboard";
import StudentCourses from "../screen/student/Courses";
import StudentLectures from "../screen/student/Lectures";
import Analysis from "../screen/student/Monitoring";
import StudentSetting from "../screen/student/Setting";

// 교수자 페이지
import InstructorCourses from "../screen/instructor/Courses";
import InstructorLectures from "../screen/instructor/Lectures";
import InstructorSetting from "../screen/instructor/Setting";
import RecordingList from "../screen/instructor/RecordingList";
import RecordingDetail from "../screen/instructor/RecordingDetail";

// 관리자 페이지
import AdminMain from "../screen/admin/Main";
import AdminStudentUserList from "../screen/admin/user/StudentList";
import AdminInstructorUserList from "../screen/admin/user/ApprovedInstructorList";
import AdminUnApprovedInstructorUserList from "../screen/admin/user/UnapprovedInstructorList";
import CourseManage from "../screen/admin/CourseManage";

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
        element: <RoleProtectedRoute allowedRoles={["student"]} />,
        children: [
          {
            path: "/student",
            element: <StudentMain />,
            children: [
              { path: "dashboard", element: <StudentDashBoard /> },
              {
                path: "courses", // '/student/courses' 경로
                element: <Outlet />, // 하위 라우트(목록, 상세)를 위한 Outlet
                children: [
                  {
                    index: true, // '/student/courses' 정확히 일치할 때
                    element: <StudentCourses />, // 강의 목록 컴포넌트
                  },
                  {
                    path: ":lectureId", // '/student/courses/:lectureId' 패턴
                    element: <StudentLectures />, // *** 강의 상세 컴포넌트 ***
                  },
                ],
              },
              { path: "monitoring", element: <Analysis /> },
              { path: "setting", element: <StudentSetting /> },
              // /student 기본 경로 -> dashboard로 리디렉션
              { index: true, element: <Navigate to="dashboard" replace /> },
            ],
          },
        ],
      },
      // --- 강의자 전용 라우트 ---
      {
        element: <RoleProtectedRoute allowedRoles={["instructor"]} />,
        children: [
          {
            path: "/instructor",
            element: <LecturerMain />,
            children: [
              {
                path: "courses",
                element: <Outlet />, // 하위 라우트(목록, 상세)를 위한 Outlet
                children: [
                  {
                    index: true,
                    element: <InstructorCourses />,
                  },
                  {
                    path: ":lectureId",
                    element: <InstructorLectures />,
                  },
                ],
              },
              {
                path: "recording",
                children: [
                  { index: true, element: <RecordingList /> }, // /instructor/recording
                  { path: ":id", element: <RecordingDetail /> }, // /instructor/recording/:id
                ],
              },
              { path: "setting", element: <InstructorSetting /> },
              // /instructor 기본 경로 -> courses로 리디렉션
              { index: true, element: <Navigate to="courses" replace /> },
            ],
          },
        ],
      },
      {
        element: <RoleProtectedRoute allowedRoles={["admin"]} />, // 관리자 역할 체크
        children: [
          {
            path: "/admin", // 관리자 기본 경로
            element: <AdminMain />, // 관리자 레이아웃 적용
            children: [
              // 사용자 관리 섹션
              {
                path: "user", // /admin/user
                element: <Outlet />, // user 하위 페이지들 위한 Outlet
                children: [
                  {
                    path: "student", // /admin/user/student
                    element: <AdminStudentUserList />, // 학생 관리 페이지 컴포넌트
                  },
                  {
                    path: "instructor", // /admin/user/student
                    element: <AdminInstructorUserList />, // 학생 관리 페이지 컴포넌트
                  },
                  {
                    path: "unauthorized",
                    element: <AdminUnApprovedInstructorUserList />,
                  },
                  // TODO: path: "instructor", element: <AdminInstructorUserList /> 등 추가 가능
                  // /admin/user 접속 시 기본으로 student 보여주기
                  { index: true, element: <Navigate to="student" replace /> },
                ],
              },
              // 강의 관리 섹션 (예시)
              {
                path: "course", // /admin/course
                element: <CourseManage />,
              },
              { index: true, element: <Navigate to="user/student" replace /> },
            ],
          },
        ],
      }, // 관리자 라우트 끝
    ], // ProtectedRoute children 끝
  }, // ProtectedRoute 끝

  // --- 404 Not Found (맨 마지막에 위치) ---
  // { path: "*", element: <NotFound /> }
]);

export default router;