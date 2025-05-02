import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";

//인증
import RegisterPage from "../screen/RegisterPage";
import LoginPage from "../screen/LoginPage";

//메인(Nav)
import StudentMain from "../screen/student/Main";
import LecturerMain from "../screen/instructor/Main";

//학생 페이지
import StudentDashBoard from "../screen/student/Dashboard"
import StudentLectures from "../screen/student/Lectures";
import Analysis from "../screen/student/Monitoring";
import StudentSetting from "../screen/student/Setting";

//교수자 페이지
import InstructorLectures from "../screen/instructor/Lectures";
import InstructorSetting from "../screen/instructor/Setting";
import RecordingList from "../screen/instructor/RecordingList";
import RecordingDetail from "../screen/instructor/RecordingDetail";

//todo admin페이지 구현..

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children:[
      {
        path:"login",
        element: <LoginPage />
      },
      {
        path:"register",
        element: <RegisterPage />
      }
    ]
  },
  {
    //학생용 화면
    path: "/student",
    element: <StudentMain />,
    children: [
      {
        path: "dashboard",
        element: <StudentDashBoard />
      },
      {
        path: "courses",
        element: <StudentLectures />,
      },
      {
        path: "monitoring",
        element: <Analysis />
      },
    ],
  },
  {
    // 교수자용 화면
    path: "/instructor",
    element: <LecturerMain />,
    children: [
      {
        path: "lectures",
        element: <InstructorLectures/>
      },
      {
        path: "recording",
        children: [
          {
            index: true,
            element: <RecordingList />
          },
          {
            path: ":id",
            element: <RecordingDetail />
          }
        ]
      },
      {
        path: "setting",
        element: <InstructorSetting />
      }
    ]
  }
]);
export default router;
