import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import StudentMain from "../screen/student/Main";
import LecturerMain from "../screen/lecturer/Main";
import StudentLectures from "../screen/student/Lectures";
import LecturerLectures from "../screen/lecturer/Lectures";
import Lecture from "../screen/student/Lecture";
import Analysis from "../screen/student/Analysis";
import Chat from "../screen/student/Chat";
import StudentSetting from "../screen/student/Setting";
import LecturerSetting from "../screen/lecturer/Setting";
import RecordingList from "../screen/lecturer/RecordingList";
import RecordingDetail from "../screen/lecturer/RecordingDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    //학생용 화면
    path: "/student",
    element: <StudentMain />,
    children: [
      {
        path: "lectures",
        element: <StudentLectures />,
      },
      {
        path: "lecture",
        element: <Lecture />,
      },
      {
        path: "analysis",
        element: <Analysis />
      },
      {
        path: "chat",
        element: <Chat />
      },
      {
        path: "setting",
        element: <StudentSetting />
      }
    ],
  },
  {
    // 교수자용 화면
    path: "/lecturer",
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
