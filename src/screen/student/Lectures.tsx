import React from "react";
import { useNavigate } from "react-router-dom";

const Lectures = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1 style={{ fontSize: "40px", marginBottom: "100px" }}>
        강의 목록 화면입니다
      </h1>
      <h1
        onClick={() => navigate("/student/courses/lecture")}
        style={{ fontSize: "40px" }}
      >
        강의화면으로 이동
      </h1>
    </>
  );
};
export default Lectures;
