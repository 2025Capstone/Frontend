// src/components/video/HlsPlayer.tsx (수정)
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";


interface HlsPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialSeekPercent?: number; // 초기 재생 퍼센트 prop 추가
}

// onTimeUpdate prop 추가
const HlsPlayer = ({ src, onTimeUpdate, initialSeekPercent = 0 }: HlsPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSeekedInitially = useRef(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null; // hls 변수 정의
    hasSeekedInitially.current = false;

    // timeupdate 이벤트 핸들러
    const handleTimeUpdateEvent = () => {
      // onTimeUpdate prop이 있으면 현재 시간과 전체 길이 전달
      if (video && onTimeUpdate && video.duration) {
        // duration이 유효할 때만 호출
        onTimeUpdate(video.currentTime, video.duration);
      }
    };

    // loadedmetadata 이벤트 핸들러 (초기 duration 전달용)
    const handleLoadedMetadata = () => {
      if (video && video.duration && !hasSeekedInitially.current && initialSeekPercent > 0) {
            const startTime = (video.duration * initialSeekPercent) / 100;
            // duration 범위 내 유효한 시간인지 확인
            if (startTime > 0 && startTime < video.duration) {
                console.log(`[HlsPlayer] Seeking to ${initialSeekPercent}% (${startTime.toFixed(2)}s)`);
                video.currentTime = startTime;
            }
            hasSeekedInitially.current = true; // 초기 탐색 완료 플래그 설정
        }
         // 메타데이터 로드 시 초기 시간/길이 전달
        if (video && onTimeUpdate && video.duration) {
            onTimeUpdate(video.currentTime, video.duration);
        }
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded.");
        // 매니페스트 파싱 후에도 메타데이터 로드를 기다리는 것이 더 안정적일 수 있음
        // handleLoadedMetadata(); // 여기서 바로 호출하거나 video 이벤트 사용
      });

      video.addEventListener('loadedmetadata', handleLoadedMetadata); // 메타데이터 로드 이벤트
      video.addEventListener('timeupdate', handleTimeUpdateEvent);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdateEvent);
        hls?.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener('loadedmetadata', handleLoadedMetadata); // 네이티브 지원 시에도 적용
      video.addEventListener('timeupdate', handleTimeUpdateEvent);
      return () => {
         video.removeEventListener('loadedmetadata', handleLoadedMetadata);
         video.removeEventListener('timeupdate', handleTimeUpdateEvent);
      }
    } else { console.error("HLS is not supported."); }
    // onTimeUpdate 함수가 변경될 경우 effect 재실행 방지 위해 보통은 dependency에서 제외하거나 useCallback 사용
  }, [src, onTimeUpdate, initialSeekPercent]); // src가 변경될 때 effect 재실행

  return <video ref={videoRef} controls style={{ width: "100%" }} />;
};

export default HlsPlayer;
