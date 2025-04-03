import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const HlsPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded, video is ready to play.");
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // 일부 Safari 브라우저는 HLS를 기본 지원함
      video.src = src;
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [src]);

  return <video ref={videoRef} controls style={{ width: "100%" }} />;
};

export default HlsPlayer;
