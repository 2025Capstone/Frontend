// src/screen/instructor/Lectures.tsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient"; // 설정된 Axios 클라이언트 import

// --- Styled Components (StudentLectures.tsx와 동일한 컴포넌트 재사용 또는 import) ---
// 아래 컴포넌트들이 별도 파일로 분리되어 있다면 import하여 사용하세요.
// 여기서는 설명을 위해 다시 정의합니다.

const CoursesContainer = styled.div`
  width: 100%;
`;

const PageTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${(props) => props.theme.subTextColor};
  margin-bottom: 20px;
`;

const CoursesListCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 15px 0;
  overflow: hidden;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TableRowBase = styled.div`
  display: grid;
  /* 컬럼 비율: Status, Course, Instructor, Schedule, Location, Action */
  /* 학생용과 동일하게 유지하되, 없는 데이터는 '-' 표시 */
  grid-template-columns: 1fr 3fr 2fr 2fr 1.5fr 0.5fr;
  align-items: center;
  padding: 12px 25px;
  gap: 15px;

  /* 반응형 스타일 (학생용과 동일하게 적용 가능) */
   @media (max-width: 1200px) {
     grid-template-columns: 1.5fr 3fr 2fr 1fr;
      & > *:nth-child(4), & > *:nth-child(5) { display: none; }
   }
    @media (max-width: 768px) {
     grid-template-columns: 1fr 3fr 1fr;
       & > *:nth-child(3) { display: none; }
    }
`;

const TableHeader = styled(TableRowBase)`
  color: ${(props) => props.theme.subTextColor};
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
  padding-bottom: 10px;
  margin-bottom: 5px;
`;

const TableRow = styled(TableRowBase)`
  color: ${(props) => props.theme.textColor};
  font-size: 0.9rem;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:last-child { border-bottom: none; }
  &:hover { background-color: ${(props) => props.theme.hoverBtnColor || '#f9f9f9'}; }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0px;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  background-color: #28a745;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  color: ${(props) => props.theme.textColor};

  &.arrow-icon { justify-self: flex-end; }
`;

const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;

// --- Instructor Lecture 타입 정의 (API 응답 기반) ---
interface InstructorLecture {
  id: number;
  name: string;
}

const InstructorCourses = () => {
  const [lectures, setLectures] = useState<InstructorLecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      setError(null);
      try {
        // apiClient 사용하여 강의자 강의 목록 요청
        const response = await apiClient.get<{ lectures: InstructorLecture[] }>('/instructors/lectures');
        setLectures(response.data.lectures || []);
      } catch (err: any) {
        console.error("Failed to fetch instructor lectures:", err);
        setError(err.message || "강의 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []); // 컴포넌트 마운트 시 1회 실행

  const handleRowClick = (lectureId: number) => {
    // TODO: 강의자용 강의 상세 또는 관리 페이지 경로로 수정
    navigate(`/instructor/courses/${lectureId}`); // 예시 경로
  };

  return (
    <CoursesContainer>
      <PageTitle>&gt; Courses</PageTitle>

      <CoursesListCard>
        {loading && <MessageContainer>Loading lectures...</MessageContainer>}
        {error && <MessageContainer>Error: {error}</MessageContainer>}
        {!loading && !error && (
          <Table>
            {/* 테이블 헤더 (학생용과 동일하게 표시) */}
            <TableHeader>
              <div>Status</div>
              <div>Course</div>
              <div>Instructor Name</div>
              <div>Schedule</div>
              <div>Location</div>
              <div></div>
            </TableHeader>
            {/* 테이블 내용 */}
            {lectures.length > 0 ? (
              lectures.map((lecture) => (
                <TableRow key={lecture.id} onClick={() => handleRowClick(lecture.id)}>
                  {/* Status (API에 없으므로 임시 표시) */}
                  <TableCell>
                    <Icon className="material-symbols-outlined">account_circle</Icon>
                    <StatusBadge>Current</StatusBadge>
                  </TableCell>
                  {/* Course (API 데이터 사용) */}
                  <TableCell title={`${lecture.name} (ID: ${lecture.id})`}>
                      {lecture.name} (Lecture ID {lecture.id})
                  </TableCell>
                  {/* Instructor Name (API에 없으므로 '-' 표시) */}
                  <TableCell>-</TableCell>
                  {/* Schedule (API에 없으므로 '-' 표시) */}
                  <TableCell>-</TableCell>
                  {/* Location (API에 없으므로 '-' 표시) */}
                  <TableCell>-</TableCell>
                  {/* Action Icon */}
                  <TableCell style={{ justifyContent: 'flex-end' }}>
                    <Icon className="material-symbols-outlined arrow-icon">chevron_right</Icon>
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

export default InstructorCourses;