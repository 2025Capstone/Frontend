import React from "react";
import { useNavigate } from "react-router-dom";

const Recording = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1 style={{ fontSize: "40px", marginBottom: "100px" }}>
        강의 녹화 페이지입니다.
      </h1>
    </>
  );
};
export default Recording;
