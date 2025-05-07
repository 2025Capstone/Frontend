// src/screen/instructor/LectureDetail.tsx
import React, { useState, useEffect } from "react"; // useCallback 제거 (현재 사용 안됨)
import styled from "styled-components";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Axios 클라이언트
import HlsPlayer from "../../components/video/HlsPlayer";

// --- Styled Components ---

const DetailPageContainer = styled.div`
  width: 100%;
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const Breadcrumb = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.subTextColor};
`;

const ManageButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
  }
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 30px;
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const RightColumn = styled.div`
  flex: 2;
`;

const Card = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 30px;
  transition: background-color 0.3s ease;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
  margin: 0 0 20px 0;
`;

// 비디오 리스트 관련 스타일 (StudentLectureDetail과 유사)
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
    props.isActive ? `${props.theme.btnColor}20` : "transparent"};

  &:last-child {
    border-bottom: none;
  }

  /* 클릭/호버 영역 개선 */
  padding-left: 10px;
  padding-right: 10px;
  margin-left: -10px;
  margin-right: -10px;
  border-radius: 6px;

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
  overflow: hidden;
`;

const VideoTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => props.theme.textColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VideoMeta = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.subTextColor};
`;

const VideoDuration = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.subTextColor};
  margin-left: 10px;
  white-space: nowrap;
`;

const VideoPlayButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.btnColor || "#1f6feb"};
  cursor: pointer;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 1.8rem;
  }
`;

const PlayerPlaceholder = styled.div`
  background-color: #eee;
  border-radius: 10px;
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center; /* 여러 줄 표시 위해 */
  line-height: 1.4;
`;

const VisibilitySettingsCard = styled(Card)`
  padding: 20px;
`;

const VisibilityTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
  margin: 0 0 15px 0;
`;

const VisibilityToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
`;

const VisibilityOptions = styled.div`
  display: flex;
  gap: 10px;
`;

const VisibilityOptionButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border-radius: 6px;
  border: 1px solid
    ${(props) => (props.isActive ? props.theme.btnColor : "#ccc")};
  background-color: ${(props) =>
    props.isActive ? `${props.theme.btnColor}20` : "transparent"};
  color: ${(props) =>
    props.isActive ? props.theme.btnColor : props.theme.subTextColor};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  .material-symbols-outlined {
    font-size: 1.2rem;
  }

  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.btnColor};
    color: ${(props) => props.theme.btnColor};
  }
`;

const SaveButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.85rem;
`;

// --- Video 타입 정의 ---
interface InstructorVideo {
  lecture_id: number;
  title: string;
  id: number;
  s3_link: string;
  duration: number;
  index: number;
  upload_at: string;
  is_public: 1 | 0;
}

// --- LectureDetail Component (Instructor) ---
const InstructorLectureDetail = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<InstructorVideo[]>([]);
  const [lectureName, setLectureName] = useState<string>("Loading...");
  const [selectedVideo, setSelectedVideo] = useState<InstructorVideo | null>(
    null
  );
  const [currentVisibility, setCurrentVisibility] = useState<1 | 0 | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!lectureId) {
      setError("Lecture ID not found.");
      setLoading(false);
      return;
    }
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const lectureIdNumber = parseInt(lectureId, 10);
        if (isNaN(lectureIdNumber)) throw new Error("Invalid Lecture ID.");

        // API 호출 (응답 타입을 InstructorVideo 배열 또는 any로 지정)
        const response = await apiClient.get<InstructorVideo[] | any>(
          "/instructors/lecture/videos",
          { params: { lecture_id: lectureIdNumber } }
        );

        // --- 수정된 데이터 추출 로직 ---
        // response.data가 배열인지 직접 확인
        const fetchedVideos = Array.isArray(response.data) ? response.data : [];
        // --- 수정된 데이터 추출 로직 끝 ---

        setVideos(fetchedVideos); // 상태 업데이트

        // 선택 및 가시성 상태 설정
        if (fetchedVideos.length > 0) {
          setSelectedVideo(fetchedVideos[0]);
          setCurrentVisibility(fetchedVideos[0].is_public);
        } else {
          setSelectedVideo(null);
          setCurrentVisibility(null);
          console.log("API returned an empty array or non-array data."); // 빈 배열 로그
        }
        setLectureName(location.state?.lectureName || `Lecture ${lectureId}`);
      } catch (err: any) {
        console.error("Failed to fetch videos:", err);
        setError(err.message || "Failed to load video list.");
        setLectureName("Error");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [lectureId, location.state]);

  const handleVideoSelect = (video: InstructorVideo) => {
    setSelectedVideo(video);
    setCurrentVisibility(video.is_public);
  };

  const handleVisibilityChange = (visibility: 1 | 0) => {
    setCurrentVisibility(visibility);
  };

  const handleSaveVisibility = async () => {
    if (selectedVideo === null || currentVisibility === null) return;
    // 현재 상태와 변경하려는 상태가 같으면 API 호출 안 함
    if (selectedVideo.is_public === currentVisibility) return;

    setIsSaving(true);
    setError(null);
    try {
      await apiClient.patch("/instructors/lecture/video/visibility", {
        video_id: selectedVideo.id,
        is_public: currentVisibility,
      });

      // 로컬 상태 즉시 업데이트
      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v.id === selectedVideo.id ? { ...v, is_public: currentVisibility } : v
        )
      );
      setSelectedVideo((prev) =>
        prev ? { ...prev, is_public: currentVisibility } : null
      );
      alert("Visibility updated successfully!");
    } catch (err: any) {
      console.error("Failed to update visibility:", err);
      setError(err.message || "Failed to update visibility.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading)
    return <MessageContainer>Loading lecture details...</MessageContainer>;
  if (error && videos.length === 0)
    return <MessageContainer>Error: {error}</MessageContainer>;

  const hlsSrc = selectedVideo?.s3_link || "";
  
  return (
    <DetailPageContainer>
      <TopHeader>
        <Breadcrumb>&gt; Courses / {lectureName}</Breadcrumb>
        <ManageButton onClick={() => alert("Manage Students clicked!")}>
          Manage Students
        </ManageButton>
      </TopHeader>

      <ContentLayout>
        <LeftColumn>
          <Card>
            <CardTitle>Course Schedule</CardTitle>
            {error && videos.length > 0 && (
              <ErrorMessage style={{ marginBottom: "15px" }}>
                {error}
              </ErrorMessage>
            )}
            <VideoList>
              {videos.length > 0 ? (
                videos.map((video) => (
                  <VideoListItem
                    key={video.id}
                    isActive={selectedVideo?.id === video.id}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <VideoInfo>
                      <VideoMeta>Week {video.index}</VideoMeta>
                      <VideoTitle>{video.title}</VideoTitle>
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
                <MessageContainer>No videos found.</MessageContainer>
              )}
            </VideoList>
          </Card>
        </LeftColumn>

        <RightColumn>
          {selectedVideo ? (
            <>
              {hlsSrc ? ( // HLS 소스 URL이 있을 때만 플레이어 렌더링
                <HlsPlayer
                  key={hlsSrc} // 비디오 소스가 변경될 때 플레이어 강제 리로드/초기화
                  src={hlsSrc} // 비디오 소스 URL 전달
                  initialSeekPercent={0} // 항상 처음(0%)부터 시작
                />
              ) : (
                // selectedVideo는 있지만 s3_link가 없을 경우 대체 표시
                <PlayerPlaceholder>
                  Video source not available.
                </PlayerPlaceholder>
              )}
              <VisibilitySettingsCard>
                <VisibilityTitle>Visibility Settings</VisibilityTitle>
                <VisibilityToggleContainer>
                  <VisibilityOptions>
                    <VisibilityOptionButton
                      isActive={currentVisibility === 1}
                      onClick={() => handleVisibilityChange(1)}
                      disabled={isSaving}
                    >
                      <span className="material-symbols-outlined">public</span>{" "}
                      Public
                    </VisibilityOptionButton>
                    <VisibilityOptionButton
                      isActive={currentVisibility === 0}
                      onClick={() => handleVisibilityChange(0)}
                      disabled={isSaving}
                    >
                      <span className="material-symbols-outlined">lock</span>{" "}
                      Private
                    </VisibilityOptionButton>
                  </VisibilityOptions>
                  <SaveButton
                    onClick={handleSaveVisibility}
                    disabled={
                      isSaving || selectedVideo.is_public === currentVisibility
                    }
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </SaveButton>
                </VisibilityToggleContainer>
                {error && (
                  <ErrorMessage
                    style={{ textAlign: "right", marginTop: "10px" }}
                  >
                    {error}
                  </ErrorMessage>
                )}
              </VisibilitySettingsCard>
            </>
          ) : (
            <Card>
              <MessageContainer>
                {videos.length > 0
                  ? "Select a video to view details."
                  : "No videos available for this lecture."}
              </MessageContainer>
            </Card>
          )}
        </RightColumn>
      </ContentLayout>
    </DetailPageContainer>
  );
};

export default InstructorLectureDetail;
