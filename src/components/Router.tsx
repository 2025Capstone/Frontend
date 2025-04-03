import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Main from "../screen/student/Main";
import Lectures from "../screen/student/Lectures";
import Lecture from "../screen/student/Lecture";
import Analysis from "../screen/student/Analysis";
import Chat from "../screen/student/Chat";
import Setting from "../screen/student/Setting";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    //학생용 화면
    path: "/student",
    element: <Main />,
    children: [
      {
        path: "lectures",
        element: <Lectures />,
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
        element: <Setting />
      }
    ],
  },
]);
export default router;
