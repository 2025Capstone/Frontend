import React from "react";
import './App.css'

import HlsPlayer from "./components/video/HlsPlayer";
import MediaPipeFaceMesh from "./components/mediapipe/MediaPipeFaceMesh";
import UploadVideo from "./components/video/UploadVideo";

function App() {
  return (
    <div>
      {/* <MediaPipeFaceMesh /> */}
        <HlsPlayer src="https://shubusket.s3.ap-northeast-2.amazonaws.com/hls/5cd3c1e9-4544-4e33-af7e-2827553da39e/playlist.m3u8" />
        <UploadVideo></UploadVideo>
    </div>
  );
}

export default App
