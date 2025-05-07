// src/screen/student/Lectures.tsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient"; // 설정된 Axios 클라이언트 import

// --- Styled Components for Courses Page ---

const CoursesContainer = styled.div`
  width: 100%;
  /* 전체적인 패딩이나 마진은 MainContent에서 처리될 수 있음 */
`;

const MainTitle = styled.h2`
  color: ${(props) => props.theme.textColor};
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const CoursesListCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 15px 0; /* 상하 패딩, 좌우 패딩은 TableRow/Header에서 처리 */
  overflow: hidden; /* 내부 요소가 넘치지 않도록 */
`;

// 테이블 레이아웃을 위한 Wrapper (Grid 또는 Flex)
const Table = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// 공통 Row 스타일 (Header와 Body Row)
const TableRowBase = styled.div`
  display: grid;
  /* 컬럼 비율 조정: Status(아이콘+뱃지), Course(이름+ID), Instructor, Schedule, Location, Action(화살표) */
  grid-template-columns: 1fr 3fr 2fr 2fr 1.5fr 0.5fr;
  align-items: center;
  padding: 12px 25px; /* 행 내부 좌우 패딩 */
  gap: 15px; /* 컬럼 간 간격 */

  @media (max-width: 1200px) {
    // 화면 작아질 때 비율 조정
    grid-template-columns: 1.5fr 3fr 2fr 1fr; // 스케줄, 위치 숨김 (예시)
    & > *:nth-child(4), // Schedule 숨김
     & > *:nth-child(5) {
      // Location 숨김
      display: none;
    }
  }
  @media (max-width: 768px) {
    // 더 작아질 때
    grid-template-columns: 1fr 3fr 1fr; // 교수명 숨김 (예시)
    & > *:nth-child(3) {
      // Instructor 숨김
      display: none;
    }
  }
`;

// 테이블 헤더 스타일
const TableHeader = styled(TableRowBase)`
  color: ${(props) => props.theme.subTextColor};
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  padding-bottom: 10px;
  margin-bottom: 5px; /* 헤더와 첫 행 사이 간격 */
`;

// 테이블 내용 행 스타일
const TableRow = styled(TableRowBase)`
  color: ${(props) => props.theme.textColor};
  font-size: 0.9rem;

  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor || "#f9f9f9"};
  }
`;

// 테이블 셀 공통 스타일 (필요시 사용)
const TableCell = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0px;
  gap: 8px; /* 셀 내부 아이콘/텍스트 간격 */
  overflow: hidden; /* 내용 길어질 경우 */
  text-overflow: ellipsis; /* 내용 길어질 경우 ... */
  white-space: nowrap; /* 내용 길어질 경우 줄바꿈 방지 */
`;

// Status 뱃지 스타일
const StatusBadge = styled.span`
  background-color: #28a745; /* 초록색 배경 */
  color: white;
  padding: 3px 8px;
  border-radius: 12px; /* 타원형 */
  font-size: 0.75rem;
  font-weight: 600;
`;

// 아이콘 스타일 (Material Symbols 사용 가정)
const Icon = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.4rem; /* 아이콘 기본 크기 */
  color: ${(props) => props.theme.textColor}; /* 기본 아이콘 색상 */

  &.arrow-icon {
    justify-self: flex-end; /* 화살표 아이콘 오른쪽 끝 정렬 */
    color: ${(props) => props.theme.subTextColor};
  }
`;

// 로딩 및 에러 메시지 스타일
const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;

// --- Lecture 타입 정의 (API 응답 기반) ---
interface Lecture {
  lecture_id: number;
  lecture_name: string;
  instructor_name: string;
  classroom: string;
  schedule: string;
  // status: string; // API에 없으므로 필요시 추가 처리
}

// --- Courses Component ---
const StudentLectures = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      setError(null);
      try {
        // apiClient를 사용하여 데이터 요청 (자동 토큰 처리)
        const response = await apiClient.get<{ lectures: Lecture[] }>(
          "/students/lecture"
        );
        setLectures(response.data.lectures || []);
      } catch (err: any) {
        console.error("Failed to fetch lectures:", err);
        setError(err.message || "강의 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []); // 컴포넌트 마운트 시 1회 실행

  const handleRowClick = (lectureId: number) => {
    // TODO: 실제 강의 상세 페이지 경로로 수정
    navigate(`/student/courses/${lectureId}`);
  };

  return (
    <CoursesContainer>
      <MainTitle>Courses</MainTitle>

      <CoursesListCard>
        {loading && <MessageContainer>Loading lectures...</MessageContainer>}
        {error && <MessageContainer>Error: {error}</MessageContainer>}
        {!loading && !error && (
          <Table>
            {/* 테이블 헤더 */}
            <TableHeader>
              <div>Status</div>
              <div>Course</div>
              <div>Instructor Name</div>
              <div>Schedule</div>
              <div>Location</div>
              <div></div> {/* Action 컬럼 헤더 (내용 없음) */}
            </TableHeader>
            {/* 테이블 내용 */}
            {lectures.length > 0 ? (
              lectures.map((lecture) => (
                <TableRow
                  key={lecture.lecture_id}
                  onClick={() => handleRowClick(lecture.lecture_id)}
                >
                  {/* Status */}
                  <TableCell>
                    <Icon className="material-symbols-outlined">
                      account_circle
                    </Icon>
                    {/* API에 status 없으므로 임시 표시 */}
                    <StatusBadge>Current</StatusBadge>
                  </TableCell>
                  {/* Course */}
                  <TableCell
                    title={`${lecture.lecture_name} (ID: ${lecture.lecture_id})`}
                  >
                    {lecture.lecture_name} (Lecture ID {lecture.lecture_id})
                  </TableCell>
                  {/* Instructor Name */}
                  <TableCell>{lecture.instructor_name}</TableCell>
                  {/* Schedule */}
                  <TableCell>{lecture.schedule}</TableCell>
                  {/* Location */}
                  <TableCell>{lecture.classroom}</TableCell>
                  {/* Action Icon */}
                  <TableCell style={{ justifyContent: "flex-end" }}>
                    {" "}
                    {/* 아이콘 오른쪽 정렬 */}
                    <Icon className="material-symbols-outlined arrow-icon">
                      chevron_right
                    </Icon>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <MessageContainer>No lectures found.</MessageContainer>
            )}
          </Table>
        )}
      </CoursesListCard>
    </CoursesContainer>
  );
};

export default StudentLectures;
