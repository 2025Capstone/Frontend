// src/screen/student/LectureDetail.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Axios 클라이언트
import HlsPlayer from "../../components/video/HlsPlayer";
import { debounce } from "lodash";
import MediaPipeFaceMesh from "../../components/mediapipe/MediaPipeFaceMesh";
import VideoJSPlayer from "../../components/video/VideoJSPlayer"; // 새로 만든 VideoJSPlayer를 import
import { db } from "../../firebase";
import { ref, onValue, off } from "firebase/database";
import { useAuthStore } from "../../authStore";

// --- Styled Components for Detail Page ---

const DetailPageContainer = styled.div`
  width: 100%;
`;

const Breadcrumb = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.subTextColor};
  margin-bottom: 25px;
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 30px; /* 좌우 컬럼 간격 */

  @media (max-width: 1200px) {
    flex-direction: column; /* 화면 작으면 세로 배치 */
  }
`;

const LeftColumn = styled.div`
  flex: 1; /* 비율 조정 가능 */
  min-width: 300px; /* 최소 너비 */
  transition: all 0.3s ease-in-out;
`;

const RightColumn = styled.div<{ isListVisible: boolean }>`
  flex: ${(props) => (props.isListVisible ? 2 : 1)};
  transition: flex 0.3s ease-in-out;
`;

const Card = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 30px; /* 카드 아래 간격 */
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
  margin: 0 0 20px 0;
`;

const VideoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const VideoListItem = styled.li<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) =>
    props.isActive ? `${props.theme.btnColor}20` : "transparent"}; // 활성 배경

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) =>
      props.isActive
        ? `${props.theme.btnColor}20`
        : `${props.theme.subTextColor}10`};
  }
`;

const VideoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const VideoTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => props.theme.textColor};
`;

const VideoMeta = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.subTextColor};
`;

const VideoDuration = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.subTextColor};
  margin-left: 10px; /* 제목과의 간격 */
`;

const VideoPlayButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.btnColor || "#1f6feb"};
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 1.8rem;
  }
`;

// 오른쪽 컬럼 플레이어 및 분석 영역 (임시 플레이스홀더)
const PlayerPlaceholder = styled.div`
  background-color: #eee; // 임시 배경
  border-radius: 10px;
  width: 100%;
  aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: ${(props) => props.theme.btnColor};
  border: 1px solid ${(props) => props.theme.btnColor};
  color: ${(props) => props.theme.textColor};
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor};
  }
`;

// 로딩/에러 메시지
const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;

const DrowsinessButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: ${(props) => props.theme.textColor};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 1rem;
  width: 100%;

  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DrowsinessMessage = styled.p`
  margin-top: 1rem;
  color: ${(props) => props.theme.subTextColor};
`;

const DrowsinessResult = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.subTextColor};
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  border-radius: 5px;
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.textColor};
`;

const SectionSubTitle = styled.h3`
  color: ${(props) => props.theme.textColor};
`;

const GraphPlaceholder = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  border: 1px dashed ${(props) => props.theme.subTextColor};
  border-radius: 10px;
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.subTextColor};
  margin-bottom: 20px;
`;

// --- Video 타입 정의 (API 응답 기반) ---
interface Video {
  id: number;
  index: number; // 주차 정보로 활용 가능?
  title: string;
  duration: number; // 초 단위 가정
  upload_at: string; // 날짜 형식 확인 필요
  watched_percent: number;
}

const dummyDrowsinessData = [
  // -- 구간 1: 짧고 약한 스파이크 --
  { t: 0, value: 1.05 }, // 0~2분 졸음수준
  { t: 15, value: 1.10 },
  { t: 30, value: 2.50 }, // 상승
  { t: 40, value: 3.10 }, // 최고점
  { t: 55, value: 1.30 }, // 하강
  { t: 70, value: 1.15 },

  // -- 구간 2: 약간의 텀을 두고 발생하는 중간 강도 스파이크 --
  { t: 90, value: 1.20 },
  { t: 110, value: 1.25 },
  { t: 120, value: 2.90 }, // 2~4분 졸음수준
  { t: 135, value: 3.85 }, // 최고점
  { t: 145, value: 3.50 },
  { t: 160, value: 1.60 }, // 하강
  { t: 180, value: 1.30 },

  // -- 구간 3: 곧바로 이어지는 강한 스파이크 --
  { t: 195, value: 1.40 },
  { t: 210, value: 3.50 }, // 급상승
  { t: 225, value: 4.20 }, // 최고점
  { t: 240, value: 3.90 },
  { t: 255, value: 1.80 }, // 급하강
  { t: 270, value: 1.45 },

  // -- 구간 4: 길고 완만하게 안정되는 스파이크 --
  { t: 300, value: 1.40 },
  { t: 320, value: 1.50 },
  { t: 340, value: 3.10 }, // 상승
  { t: 355, value: 3.70 }, // 최고점
  { t: 370, value: 2.50 },
  { t: 390, value: 1.80 },
  { t: 410, value: 1.55 }, // 완만하게 하강

  // -- 구간 5: 짧지만 매우 강한 스파이크 --
  { t: 440, value: 1.50 },
  { t: 455, value: 3.90 }, // 급상승
  { t: 465, value: 4.50 }, // 최고점
  { t: 480, value: 1.90 }, // 급하강
  { t: 500, value: 1.60 },

  // -- 구간 6: 마지막 스파이크 후 안정 --
  { t: 530, value: 1.55 },
  { t: 550, value: 1.60 },
  { t: 570, value: 3.20 }, // 상승
  { t: 585, value: 3.90 }, // 최고점
  { t: 600, value: 3.00 },
  { t: 620, value: 1.80 }, // 하강
  { t: 640, value: 1.65 },
  { t: 660, value: 1.58 },
  { t: 671, value: 1.43},
];




// --- LectureDetail Component ---
const Lectures = () => {
  const uid = useAuthStore((state) => state.uid);
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [videos, setVideos] = useState<Video[]>([]);
  const [lectureName, setLectureName] = useState<string>("Loading...");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hlsSrc, setHlsSrc] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState<boolean>(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [initialWatchedPercent, setInitialWatchedPercent] = useState<number>(0);
  const [isListVisible, setIsListVisible] = useState(true);
  const progressRef = useRef<{ videoId: number | null; percent: number }>({
    videoId: null,
    percent: 0,
  });

  // Drowsiness states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [drowsinessData, setDrowsinessData] = useState<any[] | null>(dummyDrowsinessData);
  const [drowsinessMessage, setDrowsinessMessage] = useState<string | null>(
    "Start the session to begin drowsiness detection."
  );

  const handleStartSession = async () => {
    if (!selectedVideo) {
      setDrowsinessMessage("Please select a video first.");
      return;
    }
    try {
      const response = await apiClient.post("/students/drowsiness/start", {
        video_id: selectedVideo.id,
      });
      const { session_id, auth_code } = response.data;
      setSessionId(session_id);
      setAuthCode(auth_code);
      setIsDetecting(true);
      setDrowsinessMessage(
        `착용 기기 인증 코드: ${auth_code} — 기기에서 코드를 입력해 페어링을 완료하세요.`
      );
    } catch (error) {
      console.error("Error starting session:", error);
      setDrowsinessMessage("Failed to start session.");
    }
  };

  const handleFinishSession = async () => {
    if (!sessionId) {
      setDrowsinessMessage("Session not started.");
      return;
    }
    try {
      const response = await apiClient.post("/students/drowsiness/finish", {
        session_id: sessionId,
        student_uid: uid,
      });
      setDrowsinessData(response.data);
      setDrowsinessMessage(
        "Session finished. Click 'Start Session' to begin a new one."
      );
    } catch (error) {
      console.error("Error finishing session:", error);
      setDrowsinessMessage("Failed to finish session.");
    } finally {
      // Cleanup
      setSessionId(null);
      setAuthCode(null);
      setIsPaired(false);
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    // Reset paired status for new session
    setIsPaired(false);

    const dbRef = ref(db, `${sessionId}/pairing/paired`);

    const listener = onValue(dbRef, (snapshot) => {
      if (snapshot.val() === true) {
        setIsPaired(true);
        setDrowsinessMessage("Device connected. Starting data collection.");
      }
    });

    // Cleanup function to remove the listener
    return () => {
      off(dbRef, "value", listener);
    };
  }, [sessionId]);

  const performSave = useCallback(async () => {
    const { videoId, percent } = progressRef.current;
    if (videoId !== null && percent > 0 && percent <= 100) {
      console.log(
        `[performSave] Saving progress for video ${videoId}: ${percent}%`
      );
      try {
        await apiClient.post("/students/lecture/video/progress", {
          video_id: videoId,
          watched_percent: percent,
        });
        console.log(`[performSave] Success for video ${videoId}`);
      } catch (err) {
        console.error(`[performSave] Failed for video ${videoId}:`, err);
      }
    }
  }, []);

  const debouncedSaveProgress = useCallback(debounce(performSave, 5000), [
    performSave,
  ]);

  useEffect(() => {
    return () => {
      console.log("[Unmount Effect] Triggering final save attempt...");
      debouncedSaveProgress.cancel();
      performSave();
    };
  }, [performSave, debouncedSaveProgress]);

  useEffect(() => {
    const resetPercent =
      progressRef.current.videoId !== (selectedVideo?.id ?? null);
    progressRef.current = {
      videoId: selectedVideo?.id ?? null,
      percent: resetPercent ? 0 : progressRef.current.percent,
    };
  }, [selectedVideo]);

  const fetchHlsLink = useCallback(async (videoId: number) => {
    if (videoId === null || videoId === undefined) return;
    setPlayerLoading(true);
    setPlayerError(null);
    setHlsSrc(null);
    setInitialWatchedPercent(0);
    try {
      console.log(`[fetchHlsLink] Fetching HLS link for video ID: ${videoId}`);
      const response = await apiClient.post<{
        s3_link: string;
        watched_percent: number;
        drowsiness_levels?: number[];
      }>("/students/lecture/video/link", { video_id: videoId });
      console.log(`[fetchHlsLink] API Response for ${videoId}:`, response.data);
      if (response.data?.s3_link) {
        setHlsSrc(response.data.s3_link);
        setInitialWatchedPercent(response.data.watched_percent || 0);
      } else {
        throw new Error("비디오 링크를 가져올 수 없습니다.");
      }
    } catch (err: any) {
      console.error(
        `[fetchHlsLink] Error fetching HLS link for ${videoId}:`,
        err
      );
      setPlayerError(err.message || "비디오 링크 로딩 중 오류 발생");
    } finally {
      setPlayerLoading(false);
    }
  }, []); // 의존성 없음

  useEffect(() => {
    if (!lectureId) {
      setError("Lecture ID not found.");
      setLoading(false);
      return;
    }
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      const passedLectureName = location.state?.lectureName;
      setLectureName(passedLectureName || `Lecture ID ${lectureId}`);
      try {
        const lectureIdNumber = parseInt(lectureId, 10);
        if (isNaN(lectureIdNumber))
          throw new Error("Invalid Lecture ID format.");
        const response = await apiClient.post<{ videos: Video[] }>(
          "/students/lecture/video",
          { lecture_id: lectureIdNumber }
        );
        const fetchedVideos = response.data.videos || [];
        setVideos(fetchedVideos);
        if (fetchedVideos.length > 0) {
          setSelectedVideo(fetchedVideos[0]);
          await fetchHlsLink(fetchedVideos[0].id);
        } else {
          setHlsSrc(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch initial data:", err);
        setError(err.message || "강의 정보를 불러오는데 실패했습니다.");
        setLectureName("Error Loading Lecture");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [lectureId, location.state, fetchHlsLink]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleTimeUpdate = useCallback(
    (time: number, duration: number) => {
      setCurrentPlayTime(time);
      if (duration && !isNaN(duration) && duration > 0) {
        setCurrentDuration(duration);
        const percent = Math.round((time / duration) * 100);
        const currentPercentInRef = progressRef.current.percent;
        const newPercent =
          percent >= 0 && percent <= 100 ? percent : currentPercentInRef;
        if (newPercent > currentPercentInRef) {
          progressRef.current.percent = newPercent;
          debouncedSaveProgress();
        }
      }
    },
    [debouncedSaveProgress]
  );

  const handleVideoSelect = useCallback(
    async (video: Video) => {
      if (progressRef.current.videoId === video.id) {
        console.log(
          `[handleVideoSelect] Clicked the same video (${video.id}). Skipping.`
        );
        return;
      }
      console.log(
        `[handleVideoSelect] New video selected: ${video.id}. Saving progress for previous video: ${progressRef.current.videoId}`
      );
      debouncedSaveProgress.cancel();
      await performSave();
      setCurrentPlayTime(0);
      setCurrentDuration(0);
      setHlsSrc(null);
      setPlayerError(null);
      setInitialWatchedPercent(0);
      setSelectedVideo(video);
      await fetchHlsLink(video.id);
    },
    [performSave, debouncedSaveProgress, fetchHlsLink]
  );

  if (loading)
    return <MessageContainer>Loading lecture details...</MessageContainer>;
  if (error) return <MessageContainer>Error: {error}</MessageContainer>;

  // --- JSX Structure using Assumed Styled Components ---
  // Make sure to import the actual styled components where needed

  console.log({
    playerLoading,
    playerError,
    hlsSrc,
    selectedVideo,
  });
  return (
    <DetailPageContainer>
      <Breadcrumb>&gt; Courses / {lectureName}</Breadcrumb>
      <ToggleButton onClick={() => setIsListVisible(!isListVisible)}>
        {isListVisible ? "Hide List" : "Show List"}
      </ToggleButton>
      <ContentLayout>
        {isListVisible && (
          <LeftColumn>
            <Card>
              <CardTitle>Course Schedule</CardTitle>
              <VideoList>
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <VideoListItem
                      key={video.id}
                      isActive={selectedVideo?.id === video.id}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <VideoInfo>
                        <VideoMeta>Week {video.index + 1}</VideoMeta>
                        <VideoTitle>
                          Chapter {video.index + 1}. {video.title}
                        </VideoTitle>
                        <VideoMeta>
                          {new Date(video.upload_at).toLocaleDateString()}
                        </VideoMeta>
                      </VideoInfo>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <VideoDuration>
                          {formatDuration(video.duration)}
                        </VideoDuration>
                        <VideoPlayButton title={`Play ${video.title}`}>
                          <span className="material-symbols-outlined">
                            play_circle
                          </span>
                        </VideoPlayButton>
                      </div>
                    </VideoListItem>
                  ))
                ) : (
                  <p>No videos available for this lecture.</p>
                )}
              </VideoList>
            </Card>
          </LeftColumn>
        )}

        <RightColumn isListVisible={isListVisible}>
          <Card>
            {playerLoading && (
              <MessageContainer>Loading video...</MessageContainer>
            )}
            {playerError && (
              <MessageContainer>Error: {playerError}</MessageContainer>
            )}

            
            {!playerLoading && !playerError && hlsSrc && selectedVideo && (
            <VideoJSPlayer
              key={hlsSrc} // Using key forces a remount when the video changes, which is a simple and effective way to handle state reset.
              src={hlsSrc}
              onTimeUpdate={handleTimeUpdate}
              initialSeekPercent={initialWatchedPercent}
              graphData={drowsinessData || []} // Pass the drowsiness data to the player
            />
          )}
            {!playerLoading && !playerError && !hlsSrc && selectedVideo && (
              <MessageContainer>Could not load video source.</MessageContainer>
            )}
            {!playerLoading && !playerError && !hlsSrc && !selectedVideo && (
              <PlayerPlaceholder>
                Select a video from the list
              </PlayerPlaceholder>
            )}
          </Card>
          <Card>
            <SectionTitle>Drowsiness Detection</SectionTitle>
            <MediaPipeFaceMesh sessionId={sessionId} isPaired={isPaired} />
            {!isDetecting ? (
              <DrowsinessButton
                onClick={handleStartSession}
                disabled={!selectedVideo}
              >
                Start Session
              </DrowsinessButton>
            ) : (
              <DrowsinessButton onClick={handleFinishSession}>
                Finish Session
              </DrowsinessButton>
            )}

            {drowsinessMessage && (
              <DrowsinessMessage>{drowsinessMessage}</DrowsinessMessage>
            )}

          </Card>
        </RightColumn>
      </ContentLayout>
    </DetailPageContainer>
  );
};

export default Lectures;