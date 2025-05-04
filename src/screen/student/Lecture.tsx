// src/screen/student/LectureDetail.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient'; // Axios 클라이언트

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
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
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
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isActive ? `${props.theme.btnColor}20` : 'transparent'}; // 활성 배경

  &:last-child {
    border-bottom: none;
  }

  &:hover {
     background-color: ${props => props.isActive ? `${props.theme.btnColor}20` : `${props.theme.subTextColor}10`};
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
  color: ${(props) => props.theme.btnColor || '#1f6feb'};
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

const StopButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  float: right; /* 오른쪽 정렬 */
`;

// 로딩/에러 메시지
const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
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
const Lecture = () => {
  // URL 파라미터에서 lectureId 가져오기
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate(); // 이전 페이지 이동 등 활용 가능

  const [videos, setVideos] = useState<Video[]>([]);
  const [lectureName, setLectureName] = useState<string>("Loading..."); // 강의명 상태
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null); // 현재 선택/재생 중인 비디오
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        if (isNaN(lectureIdNumber)) {
            throw new Error("Invalid Lecture ID format.");
        }

        // apiClient 사용하여 비디오 목록 요청
        const response = await apiClient.post<{ videos: Video[] }>('/students/lecture/video', {
          lecture_id: lectureIdNumber
        });
        setVideos(response.data.videos || []);
        // 첫 번째 비디오를 기본 선택 (선택 사항)
        if (response.data.videos && response.data.videos.length > 0) {
            setSelectedVideo(response.data.videos[0]);
        }
        // TODO: 강의 이름(lecture_name)을 별도 API로 가져오거나,
        // 목록 페이지에서 navigate 시 state로 전달받아야 함. 임시로 ID 표시.
        setLectureName(`Lecture ID ${lectureId}`);

      } catch (err: any) {
        console.error("Failed to fetch videos:", err);
        setError(err.message || "강의 비디오 목록을 불러오는데 실패했습니다.");
        setLectureName("Error Loading Lecture");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [lectureId]); // lectureId가 변경될 때마다 다시 호출

  // 비디오 재생 시간 포맷 (MM:SS)
  const formatDuration = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // 비디오 리스트 아이템 클릭 핸들러
  const handleVideoSelect = (video: Video) => {
      setSelectedVideo(video);
      // TODO: 실제 비디오 플레이어에 선택된 비디오 로드 로직 추가
      console.log("Selected video:", video);
  }

  if (loading) return <MessageContainer>Loading lecture details...</MessageContainer>;
  if (error) return <MessageContainer>Error: {error}</MessageContainer>;

  return (
    <DetailPageContainer>
      <Breadcrumb>&gt; Courses / {lectureName}</Breadcrumb> {/* 동적 강의명 */}

      <ContentLayout>
        {/* 왼쪽 컬럼: 강의 스케줄 (비디오 목록) */}
        <LeftColumn>
          <Card>
            <CardTitle>Course Schedule</CardTitle>
            <VideoList>
              {videos.length > 0 ? videos.map((video) => (
                <VideoListItem
                  key={video.id}
                  isActive={selectedVideo?.id === video.id} // 현재 선택된 비디오 하이라이트
                  onClick={() => handleVideoSelect(video)}
                >
                  <VideoInfo>
                    {/* API 응답의 index가 주차 정보라고 가정 */}
                    <VideoMeta>Week {video.index + 1}</VideoMeta>
                    <VideoTitle>Chapter {video.index + 1}. {video.title}</VideoTitle>
                    {/* 날짜 형식은 API 응답에 맞춰 수정 필요 */}
                    <VideoMeta>{new Date(video.upload_at).toLocaleDateString()}</VideoMeta>
                  </VideoInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <VideoDuration>{formatDuration(video.duration)}</VideoDuration>
                    <VideoPlayButton title={`Play ${video.title}`}>
                       <span className="material-symbols-outlined">play_circle</span>
                    </VideoPlayButton>
                  </div>
                </VideoListItem>
              )) : <p>No videos available for this lecture.</p>}
            </VideoList>
          </Card>
        </LeftColumn>

        {/* 오른쪽 컬럼: 비디오 플레이어 및 분석 */}
        <RightColumn>
          <PlayerPlaceholder>
            Video Player Area (Selected: {selectedVideo?.title || 'None'})
          </PlayerPlaceholder>
          <AnalysisPlaceholder>
            Drowsiness Summary Placeholder
          </AnalysisPlaceholder>
          <StopButton>수강중지버튼</StopButton>
        </RightColumn>
      </ContentLayout>
    </DetailPageContainer>
  );
};

export default Lecture;