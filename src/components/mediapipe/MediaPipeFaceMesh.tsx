import { off, onValue, ref } from "firebase/database";
import React, { useRef, useEffect } from "react";
import { db } from "../../firebase";

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

  const frameCounter = useRef(0);
  const isPairedRef = useRef(isPaired);
  useEffect(() => {
    isPairedRef.current = isPaired;
    console.log(`[MediaPipeFaceMesh] isPaired prop updated: ${isPaired}`);
  }, [isPaired]);

  const openWebSocket = (id: string) => {
    // [수정] HTTPS 페이지에서 접속 시 혼합콘텐츠 오류 방지: wss 사용 권장

    wsRef.current = new WebSocket(
      `ws://20.41.114.132:8000/ws/drowsiness/landmarks/${id}` // [수정]
    );

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
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

  // sessionId 바뀌면 WS 연결을 보장
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
              frameCounter.current += 1;
              // 너무 시끄러우면 주석 처리 가능
              console.log(
                `[WebSocket] Landmark frame sent: #${frameCounter.current}`
              );
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

    // ----------------- Firebase stop 시그널 리스너 -----------------
    // [수정] sessionId 없으면 리스너를 만들지 않음
    if (!sessionId) {
      console.warn("[MediaPipeFaceMesh] No sessionId; skipping stop listener.");
      return;
    }

    // [수정] 서버에서 올리는 키와 일치시키기: '/pairing/stop'
    const dbRefStop = ref(db, `${sessionId}/pairing/stop`); // [수정: stopped -> stop]

    // [수정] onValue가 반환하는 것은 '구독 해제 함수' 입니다.
    const unsubscribe = onValue(dbRefStop, (snapshot) => {
      const val = snapshot.val();
      console.log("[Firebase] pairing/stop =", val); // [수정] 디버그 로그
      if (val === true) {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log("[MediaPipeFaceMesh] stop signal received → closing WS"); // [수정]
          wsRef.current.close();
        }
        // 필요하다면 여기서 카메라도 멈추고 싶을 수 있음:
        // (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
      }
    });

    return () => {
      // [수정] 구독 해제 함수를 직접 호출
      unsubscribe(); // [수정]
      // (off를 쓰고 싶다면, 콜백 함수를 별도 변수로 두고 동일 콜백으로 off 호출)
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
    // [수정] sessionId가 바뀌면 stop 리스너도 재바인딩
  }, [sessionId]); // [수정]

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

export default MediaPipeFaceMesh;
