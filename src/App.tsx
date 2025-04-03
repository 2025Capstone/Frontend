import React from "react";
import './App.css'
// import Hls from "react-hls-player";


import MediaPipeFaceMesh from "./MediaPipeFaceMesh";
import UploadVideo from "./UploadVideo";

function App() {
  return (
    <div>
      {/* <MediaPipeFaceMesh /> */}
        {/* <Hls
            src="https://shubusket.s3.ap-northeast-2.amazonaws.com/hls/5cd3c1e9-4544-4e33-af7e-2827553da39e/playlist.m3u8"
            autoPlay={false}
            controls={true}
            width="100%"
            height="auto"
        /> */}
        <UploadVideo></UploadVideo>
    </div>


  );
}

export default App
