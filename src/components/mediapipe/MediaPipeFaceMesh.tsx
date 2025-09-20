import React, { useRef, useEffect } from "react";

// --- TypeScript 타입 선언 ---
// MediaPipe 라이브러리가 전역 스코프에 로드될 때를 대비한 타입 정의
declare global {
  interface Window {
    FaceMesh: any;
    drawConnectors: any;
    drawLandmarks: any;
    FACEMESH_TESSELATION: any;
    Results: any;
  }
}


const MediaPipeFaceMesh: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // MediaPipe 라이브러리 스크립트를 동적으로 로드합니다.
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeMediaPipe = async () => {
      // 라이브러리가 로드될 때까지 기다립니다.
      await Promise.all([
        loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"),
        loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"),
      ]);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      // 전역 window 객체에서 FaceMesh 생성자를 가져옵니다.
      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => { // window.Results 타입 사용
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.image) {
          canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }
        if (results.multiFaceLandmarks) {
          results.multiFaceLandmarks.forEach((landmarks: any) => {
            // 전역 window 객체에서 그리기 유틸리티를 사용합니다.
            window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, {
              color: "#C0C0C070",
              lineWidth: 1,
            });
            window.drawLandmarks(canvasCtx, landmarks, {
              color: "#FF0000",
              lineWidth: 1,
            });

            const flatLandmarks = landmarks.flatMap((lm: { x: number; y: number; z: number; }) => [lm.x, lm.y, lm.z]);

            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              openWebSocket();
            }

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify(flatLandmarks));
            }

            resetInactivityTimer();
          });
        }
        canvasCtx.restore();
      });

      const processFrame = async () => {
        if (video.readyState >= 2) {
          await faceMesh.send({ image: video });
        }
        requestAnimationFrame(processFrame);
      };

      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            processFrame();
          };
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
        });
    };

    initializeMediaPipe();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const openWebSocket = () => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/landmarks");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (wsRef.current) {
        console.log("No data received for 2 seconds, closing WebSocket.");
        wsRef.current.close();
      }
    }, 2000);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

export default MediaPipeFaceMesh;

