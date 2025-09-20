// src/screen/student/LectureDetail.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Axios 클라이언트
import HlsPlayer from "../../components/video/HlsPlayer";
import { debounce } from "lodash";
import MediaPipeFaceMesh from "../../components/mediapipe/MediaPipeFaceMesh";

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
`;

const RightColumn = styled.div`
  flex: 2; /* 비율 조정 가능 */
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

const AnalysisPlaceholder = styled.div`
  background-color: #eee; // 임시 배경
  border-radius: 10px;
  width: 100%;
  height: 200px; /* 임시 높이 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  margin-bottom: 20px;
`;

// 로딩/에러 메시지
const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;

const DrowsinessSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 10px;
`;

const DrowsinessButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 1rem;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DrowsinessInput = styled.input`
  padding: 0.5rem;
  margin-right: 1rem;
`;

const DrowsinessMessage = styled.p`
  margin-top: 1rem;
  color: #333;
`;

const DrowsinessResult = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
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

// --- LectureDetail Component ---
const Lectures = () => {
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
  const progressRef = useRef<{ videoId: number | null; percent: number }>({
    videoId: null,
    percent: 0,
  });

  // Drowsiness states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [userInputCode, setUserInputCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [drowsinessData, setDrowsinessData] = useState<any>(null);
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
      const { session_id, message } = response.data;
      setSessionId(session_id);
      const code = message.split(":")[1].trim();
      setAuthCode(code);
      setDrowsinessMessage(message);
    } catch (error) {
      console.error("Error starting session:", error);
      setDrowsinessMessage("Failed to start session.");
    }
  };

  const handleVerifySession = async () => {
    if (!sessionId) {
      setDrowsinessMessage("Session not started.");
      return;
    }
    try {
      const response = await apiClient.post("/students/drowsiness/verify", {
        session_id: sessionId,
        code: userInputCode,
      });
      const { verified, message } = response.data;
      setIsVerified(verified);
      setDrowsinessMessage(message);
    } catch (error) {
      console.error("Error verifying session:", error);
      setDrowsinessMessage("Failed to verify session.");
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
      });
      setDrowsinessData(response.data);
      setDrowsinessMessage("Session finished.");
      setSessionId(null);
      setIsVerified(false);
      setAuthCode(null);
    } catch (error) {
      console.error("Error finishing session:", error);
      setDrowsinessMessage("Failed to finish session.");
    }
  };

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
  return (
    <DetailPageContainer>
      <Breadcrumb>&gt; Courses / {lectureName}</Breadcrumb>
      <ContentLayout>
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

        <RightColumn>
          <Card>
            {playerLoading && (
              <MessageContainer>Loading video...</MessageContainer>
            )}
            {playerError && (
              <MessageContainer>Error: {playerError}</MessageContainer>
            )}
            {!playerLoading && !playerError && hlsSrc && selectedVideo && (
              <HlsPlayer
                key={hlsSrc}
                src={hlsSrc}
                onTimeUpdate={handleTimeUpdate}
                initialSeekPercent={initialWatchedPercent}
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
          <DrowsinessSection>
            <h2>Drowsiness Detection</h2>
            <MediaPipeFaceMesh />
            {!sessionId && (
              <DrowsinessButton
                onClick={handleStartSession}
                disabled={!selectedVideo}
              >
                Start Session
              </DrowsinessButton>
            )}
            {sessionId && !isVerified && (
              <div>
                <p>{drowsinessMessage}</p>
                <DrowsinessInput
                  type="text"
                  placeholder="Enter verification code"
                  value={userInputCode}
                  onChange={(e) => setUserInputCode(e.target.value)}
                />
                <DrowsinessButton onClick={handleVerifySession}>
                  Verify
                </DrowsinessButton>
              </div>
            )}
            {isVerified && (
              <div>
                <p>{drowsinessMessage}</p>
                <DrowsinessButton onClick={handleFinishSession}>
                  Finish Session
                </DrowsinessButton>
              </div>
            )}
            {drowsinessMessage && (
              <DrowsinessMessage>{drowsinessMessage}</DrowsinessMessage>
            )}
            {drowsinessData && (
              <div>
                <h3>Drowsiness Detection Result</h3>
                <DrowsinessResult>
                  <pre>{JSON.stringify(drowsinessData, null, 2)}</pre>
                </DrowsinessResult>
              </div>
            )}
          </DrowsinessSection>
        </RightColumn>
      </ContentLayout>
    </DetailPageContainer>
  );
};

export default Lectures;