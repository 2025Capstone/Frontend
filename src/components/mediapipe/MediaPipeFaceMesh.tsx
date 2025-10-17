import React, { useRef, useEffect } from "react";

// --- TypeScript 타입 선언 ---
declare global {
  interface Window {
    FaceMesh: any;
    drawConnectors: any;
    drawLandmarks: any;
    FACEMESH_TESSELATION: any;
    Results: any;
  }
}

interface MediaPipeFaceMeshProps {
  sessionId?: string | null;
  isPaired: boolean;
}

const MediaPipeFaceMesh: React.FC<MediaPipeFaceMeshProps> = ({
  sessionId,
  isPaired,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // --- 👇 [로그 확인용] 프레임 카운터를 위한 useRef 추가 ---
  const frameCounter = useRef(0);

  // isPaired prop의 최신 값을 추적하기 위한 ref
  const isPairedRef = useRef(isPaired);
  useEffect(() => {
    isPairedRef.current = isPaired;
    console.log(`[MediaPipeFaceMesh] isPaired prop updated: ${isPaired}`);
  }, [isPaired]);

  const openWebSocket = (id: string) => {
    wsRef.current = new WebSocket(
      `ws://20.41.114.132:8000/ws/drowsiness/landmarks/${id}`
    );

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      // 웹소켓이 새로 연결될 때마다 카운터 초기화
      frameCounter.current = 0;
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  useEffect(() => {
    if (sessionId) {
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        openWebSocket(sessionId);
      }
    } else {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    }
  }, [sessionId]);

  useEffect(() => {
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
      await Promise.all([
        loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        ),
        loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
        ),
      ]);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.image) {
          canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }
        if (results.multiFaceLandmarks) {
          results.multiFaceLandmarks.forEach((landmarks: any) => {
            window.drawConnectors(
              canvasCtx,
              landmarks,
              window.FACEMESH_TESSELATION,
              {
                color: "#C0C0C070",
                lineWidth: 1,
              }
            );
            window.drawLandmarks(canvasCtx, landmarks, {
              color: "#FF0000",
              lineWidth: 1,
            });

            if (
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN &&
              isPairedRef.current &&
              videoRef.current
            ) {
              const formattedLandmarks = landmarks.map(
                (lm: { x: number; y: number; z: number }) => [lm.x, lm.y, lm.z]
              );
              const currentTime = videoRef.current.currentTime;
              wsRef.current.send(
                JSON.stringify({
                  timestamp: currentTime,
                  frame: formattedLandmarks,
                })
              );
              
              // --- 👇 [로그 확인] 데이터를 보낼 때마다 카운터를 1씩 증가시키고 콘솔에 출력 ---
              frameCounter.current += 1;
              console.log(`[WebSocket] Landmark frame sent: #${frameCounter.current}`);
            }
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

      navigator.mediaDevices
        .getUserMedia({ video: true })
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
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

export default MediaPipeFaceMesh;