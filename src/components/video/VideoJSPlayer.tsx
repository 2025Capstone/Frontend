// src/components/video/VideoJSPlayer.tsx
import React, { useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";
import { Chart, registerables } from "chart.js";
import type { Chart as ChartType } from "chart.js";
import type Player from "video.js/dist/types/player";

Chart.register(...registerables);

// --- Styled Components ---
const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: clamp(320px, 56vw, 540px);
  background-color: #000;

  .video-js {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .vjs-tech {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .video-js .vjs-time-control { display: block; }
  .video-js .vjs-remaining-time { display: none; }
  .video-js .vjs-progress-control:hover .vjs-time-tooltip { display: none !important; }

  /* 그래프 오버레이 */
  .graph-overlay {
    position: absolute;
    left: 0px;
    right: 0px;
    width: 100%;
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

  /* 🔒 상호작용 제한 모드 - 진행바/재생버튼 클릭 비활성화 */
  .vjs-restrict .vjs-progress-control,
  .vjs-restrict .vjs-play-control {
    pointer-events: none !important;
    opacity: 0.7;
  }
`;

interface GraphDataPoint {
  t: number;
  value: number;
}

interface VideoJSPlayerProps {
  src: string;
  graphData?: GraphDataPoint[];
  onTimeUpdate?: (time: number, duration: number) => void;
  initialSeekPercent?: number;
  /** 처음 시청 중에는 일시정지/되감기/앞으로 감기 금지 */
  restrictInteract?: boolean;
  /** 🎯 영상이 끝났을 때 호출 (부모에서 finish API 등 처리) */
  onEnded?: () => void;
}

const VideoJSPlayer: React.FC<VideoJSPlayerProps> = ({
  src,
  graphData = [],
  onTimeUpdate,
  initialSeekPercent = 0,
  restrictInteract = false,
  onEnded,
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
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
    let pauseHandler: (() => void) | null = null;
    let seekingHandler: (() => void) | null = null;
    let timeupdateHandler: (() => void) | null = null;
    let endedHandler: (() => void) | null = null;

    const initTimeout = setTimeout(() => {
      if (!videoRef.current) return;

      const player = videojs(videoRef.current, {
        autoplay: true,
        controls: true,
        fill: true,
        sources: [{ src, type: "application/x-mpegURL" }],
        userActions: { hotkeys: false }, // 전역 핫키 방지
      });
      playerRef.current = player;

      // 🔒 상호작용 제한 모드 표시
      if (restrictInteract) player.addClass("vjs-restrict");
      else player.removeClass("vjs-restrict");

      // 안전한 play 호출
      const safePlay = () => {
        const maybe = player.play?.();
        if (maybe && typeof (maybe as any).catch === "function") {
          (maybe as Promise<any>).catch(() => {});
        }
      };

      // 일시정지 무력화 (단, 종료 직전/종료 시는 예외)
      if (restrictInteract) {
        pauseHandler = () => {
          const dur = player.duration() || 0;
          const t = player.currentTime() || 0;
          // ▶️ 끝에 가까우면 재생 강제 X (interrupted 스팸 방지)
          if (player.ended() || (dur > 0 && t >= dur - 0.35)) return;
          safePlay();
        };
        player.on("pause", pauseHandler);
      }

      if (onTimeUpdate) {
        timeupdateHandler = () => {
          onTimeUpdate(player.currentTime() ?? 0, player.duration() ?? 0);
        };
        player.on("timeupdate", timeupdateHandler);
      }

      // seeking 방지
      let lastTime = 0;
      const saveTime = () => { lastTime = player.currentTime() ?? lastTime; };
      player.on("timeupdate", saveTime);
      if (restrictInteract) {
        seekingHandler = () => {
          const now = player.currentTime() ?? 0;
          if (Math.abs(now - lastTime) > 1) player.currentTime(lastTime);
        };
        player.on("seeking", seekingHandler);
      }

      // 키보드 탐색/일시정지 차단
      if (restrictInteract) {
        keydownHandler = (e: KeyboardEvent) => {
          const block = [" ", "k", "j", "l", "ArrowLeft", "ArrowRight"];
          if (block.includes(e.key)) { e.preventDefault(); e.stopPropagation(); }
        };
        window.addEventListener("keydown", keydownHandler, true);
      }

      // ▶️ 영상 종료 감지 (종료 시 자동 재생 유발 금지)
      endedHandler = () => {
        onEnded?.();
      };
      player.on("ended", endedHandler);

      player.one("loadedmetadata", () => {
        const duration = player.duration();
        if (duration && initialSeekPercent && initialSeekPercent > 0) {
          player.currentTime((duration * initialSeekPercent) / 100);
        }
      });

      // ===== 그래프 오버레이 렌더링 =====
      player.ready(() => {
        if (player.isDisposed() || player.el().querySelector(".graph-overlay")) return;

        const progressHolder = player
          .el()
          .querySelector<HTMLElement>(".vjs-progress-holder");
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
          const width = overlay.clientWidth;
          if (width === 0) return;

          canvas.width = width * devicePixelRatio;
          canvas.height = overlay.clientHeight * devicePixelRatio;
          canvas.style.width = `100%`;
          canvas.style.height = `100%`;

          if (chartRef.current) chartRef.current.destroy();

          const duration =
            player.duration() || Math.max(...graphData.map((d) => d.t), 0);
          const points = graphData.map((d) => ({ x: d.t, y: d.value }));

          chartRef.current = new Chart(canvas, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Drowsiness Level",
                  data: points,
                  fill: true,
                  tension: 0.25,
                  pointRadius: 0,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.9)",
                  backgroundColor: "rgba(180, 200, 255, 0.35)",
                },
              ],
            },
            options: {
              animation: false,
              responsive: false,
              maintainAspectRatio: false,
              layout: { padding: 0 },
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: {
                x: {
                  type: "linear",
                  min: 1,
                  max: duration,
                  grid: { display: false },
                  ticks: { display: false },
                },
                y: { min: 1, max: 5, display: false, beginAtZero: true },
              },
            },
          });
        };

        const attachInteractions = () => {
          // 처음 시청 제한 모드면 그래프 클릭 탐색도 차단
          if (restrictInteract) return;

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
            tooltip.textContent = `${secondsToLabel(time)} · ${(
              nearest?.value ?? 0
            ).toFixed(2)}`;
          });

          hitArea.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
          });
          hitArea.addEventListener("click", (e) => {
            const time = getSeekTime(e);
            if (time !== null) player.currentTime(time);
          });
        };

        const ro = new ResizeObserver(buildChart);
        ro.observe(overlay);
        resizeObserver = ro;

        const rebuildChartWithRAF = () => requestAnimationFrame(buildChart);

        player.on(
          ["durationchange", "playerresize", "loadedmetadata", "fullscreenchange"],
          rebuildChartWithRAF
        );
        window.addEventListener("resize", rebuildChartWithRAF);
        resizeHandler = rebuildChartWithRAF;

        attachInteractions();
        buildChart();
      });
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      if (keydownHandler) window.removeEventListener("keydown", keydownHandler, true);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (resizeObserver) resizeObserver.disconnect();
      if (playerRef.current && !playerRef.current.isDisposed()) {
        if (pauseHandler) playerRef.current.off("pause", pauseHandler);
        if (seekingHandler) playerRef.current.off("seeking", seekingHandler);
        if (timeupdateHandler) playerRef.current.off("timeupdate", timeupdateHandler);
        if (endedHandler) playerRef.current.off("ended", endedHandler);
        playerRef.current.dispose();
        playerRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [src, graphData, initialSeekPercent, onTimeUpdate, secondsToLabel, restrictInteract, onEnded]);

  return (
    <PlayerWrapper>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </PlayerWrapper>
  );
};

export default VideoJSPlayer;
