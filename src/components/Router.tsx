import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Main from "../screen/Main";
import Lectures from "../screen/Lecture";

const router = createBrowserRouter([
    {
        path:"/",
        element: <Main />,
        children: [
            {
                path:"lectures",
                element: <Lectures />
            }
        ],
    }

])
export default router;