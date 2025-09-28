import React, { useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming"; // HLS 재생을 위한 import
import { Chart, registerables } from "chart.js";
import type { Chart as ChartType } from "chart.js";
import type Player from "video.js/dist/types/player";

// Chart.js 필수 요소 등록
Chart.register(...registerables);

// --- Styled Components ---
const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000; /* 비디오 로딩 중 배경색 */

  .video-js {
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .video-js .vjs-time-control { display: block; }
  .video-js .vjs-remaining-time { display: none; }
  .video-js .vjs-progress-control:hover .vjs-time-tooltip { display: none !important; }

  /* --- Graph Overlay Styles --- */
  .graph-overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 60px;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    transform: translateY(-10%);
  }

  .vjs-progress-control:hover .graph-overlay { opacity: 1; }
  .graph-hit-area { position: absolute; inset: 0; pointer-events: auto; cursor: pointer; }
  .graph-tooltip {
    position: absolute;
    padding: 4px 6px;
    border-radius: 6px;
    background: rgba(10, 12, 18, 0.92);
    color: #fff;
    font-size: 12px;
    transform: translate(-50%, -150%);
    white-space: nowrap;
    pointer-events: none;
    display: none;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    z-index: 11;
  }
`;

// --- Component Props Interface ---
interface GraphDataPoint {
  t: number;
  value: number;
}

interface VideoJSPlayerProps {
  src: string;
  graphData?: GraphDataPoint[];
  onTimeUpdate?: (time: number, duration: number) => void;
  initialSeekPercent?: number;
}

// --- The React Component ---
const VideoJSPlayer: React.FC<VideoJSPlayerProps> = ({
  src,
  graphData = [],
  onTimeUpdate,
  initialSeekPercent = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const chartRef = useRef<ChartType<"line", { x: number; y: number }[]> | null>(null);

  const secondsToLabel = useCallback((sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let resizeHandler: (() => void) | null = null;

    // ✨ React 18 Strict Mode의 이중 렌더링 문제를 회피하기 위해 setTimeout으로 초기화를 지연시킵니다.
    const initTimeout = setTimeout(() => {
      if (!videoRef.current) return;

      const player = videojs(videoRef.current, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{ src, type: "application/x-mpegURL" }],
      });
      playerRef.current = player;

      if (onTimeUpdate) {
        player.on("timeupdate", () => {
          onTimeUpdate(player.currentTime() ?? 0, player.duration() ?? 0);
        });
      }

      player.one("loadedmetadata", () => {
        const duration = player.duration();
        if (duration && initialSeekPercent && initialSeekPercent > 0) {
          player.currentTime((duration * initialSeekPercent) / 100);
        }
      });

      player.ready(() => {
        if (player.isDisposed() || player.el().querySelector(".graph-overlay")) return;
        
        const progressHolder = player.el().querySelector<HTMLElement>(".vjs-progress-holder");
        if (!progressHolder) return;
        progressHolder.style.position = "relative";

        const overlay = document.createElement("div");
        overlay.className = "graph-overlay";
        const canvas = document.createElement("canvas");
        const hitArea = document.createElement("div");
        hitArea.className = "graph-hit-area";
        const tooltip = document.createElement("div");
        tooltip.className = "graph-tooltip";

        overlay.append(canvas, hitArea, tooltip);
        progressHolder.appendChild(overlay);

        const buildChart = () => {
          if (player.isDisposed()) return;
          const rect = progressHolder.getBoundingClientRect();
          if (rect.width === 0) return;

          const cs = getComputedStyle(progressHolder);
          const padL = parseFloat(cs.paddingLeft) || 0;
          const padR = parseFloat(cs.paddingRight) || 0;
          const width = progressHolder.clientWidth;
          if (width === 0) return;
          
          overlay.style.left = `${padL}px`;
          overlay.style.right = `${padR}px`;

          canvas.width = width * devicePixelRatio;
          canvas.height = overlay.clientHeight * devicePixelRatio;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${overlay.clientHeight}px`;

          if (chartRef.current) chartRef.current.destroy();

          const duration = player.duration() || Math.max(...graphData.map((d) => d.t), 0);
          const points = graphData.map((d) => ({ x: d.t, y: d.value }));

          chartRef.current = new Chart(canvas, {
            type: "line",
            data: {
              datasets: [{
                label: "Drowsiness Level",
                data: points,
                fill: true,
                tension: 0.25,
                pointRadius: 0,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.9)",
                backgroundColor: "rgba(180, 200, 255, 0.35)",
              }],
            },
            options: {
              animation: false,
              responsive: false,
              maintainAspectRatio: false,
              layout: { padding: 0 },
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: {
                x: { type: "linear", min: 0, max: duration, grid: { display: false }, ticks: { display: false } },
                y: { display: false, beginAtZero: true },
              },
            },
          });
        };

        const attachInteractions = () => {
          const getSeekTime = (e: MouseEvent): number | null => {
            if (player.isDisposed()) return null;
            const rect = hitArea.getBoundingClientRect();
            if (rect.width === 0) return null;
            const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            return (x / rect.width) * (player.duration() ?? 0);
          };

          hitArea.addEventListener("mousemove", (e) => {
            const time = getSeekTime(e);
            if (time === null) return;
            
            const rect = hitArea.getBoundingClientRect();
            const x = e.clientX - rect.left;

            let nearest = graphData.length > 0 ? graphData[0] : null;
            if (nearest) {
              let minDiff = Infinity;
              for (const d of graphData) {
                const diff = Math.abs(d.t - time);
                if (diff < minDiff) {
                  minDiff = diff;
                  nearest = d;
                }
              }
            }

            tooltip.style.left = `${x}px`;
            tooltip.style.display = "block";
            tooltip.textContent = `${secondsToLabel(time)} · ${(nearest?.value ?? 0).toFixed(2)}`;
          });

          hitArea.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });
          hitArea.addEventListener("click", (e) => {
            const time = getSeekTime(e);
            if (time !== null) player.currentTime(time);
          });
        };
        
        const ro = new ResizeObserver(buildChart);
        ro.observe(progressHolder);
        resizeObserver = ro;
        
        const rebuildChartWithRAF = () => requestAnimationFrame(buildChart);
        player.on(["durationchange", "playerresize", "loadedmetadata"], rebuildChartWithRAF);
        window.addEventListener("resize", rebuildChartWithRAF);
        resizeHandler = rebuildChartWithRAF;
        
        attachInteractions();
        buildChart();
      });
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [src, graphData, initialSeekPercent, onTimeUpdate, secondsToLabel]);

  return (
    <PlayerWrapper>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </PlayerWrapper>
  );
};

export default VideoJSPlayer;