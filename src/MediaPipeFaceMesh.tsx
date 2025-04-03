import React, { useRef, useEffect } from "react";
import { FaceMesh, Results,FACEMESH_TESSELATION } from "@mediapipe/face_mesh";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const MediaPipeFaceMesh: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: Results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.image) {
        canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      }
      if (results.multiFaceLandmarks) {
        results.multiFaceLandmarks.forEach((landmarks) => {
          drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
            color: "#C0C0C070",
            lineWidth: 1,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 1,
          });

          const flatLandmarks = landmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);

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
      setTimeout(() => {
        requestAnimationFrame(processFrame);
      }, 33);
    };

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          requestAnimationFrame(processFrame);
        };
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
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
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
};

export default MediaPipeFaceMesh;
