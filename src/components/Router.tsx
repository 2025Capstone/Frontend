import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import StudentMain from "../screen/student/Main";
import LecturerMain from "../screen/instructor/Main";
import StudentLectures from "../screen/student/Lectures";
import LecturerLectures from "../screen/instructor/Lectures";
import Lecture from "../screen/student/Lecture";
import Analysis from "../screen/student/Analysis";
import Chat from "../screen/student/Chat";
import StudentSetting from "../screen/student/Setting";
import LecturerSetting from "../screen/instructor/Setting";
import RecordingList from "../screen/instructor/RecordingList";
import RecordingDetail from "../screen/instructor/RecordingDetail";
import RegisterPage from "../screen/RegisterPage";
import LoginPage from "../screen/LoginPage";
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
        element: <>dashboard 구현 필요</>
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
        element: <LecturerLectures/>
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
        element: <LecturerSetting />
      }
    ]
  }
]);
export default router;
