// src/screen/admin/course/CourseManage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import apiClient from "../../api/apiClient"; // 경로 확인
import { useNavigate } from "react-router-dom"; // 필요시 사용
import NewLectureModal from "./NewLectureModal";

// --- Styled Components (AdminStudentUserList.tsx 와 유사한 스타일 재사용/참조) ---
const AdminPageContainer = styled.div`
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: 20px;
`;

const Breadcrumb = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.subTextColor};
  margin-bottom: 15px;
`;

// 상단 컨트롤 바 (New 버튼, 검색 등)
const TopControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const NewButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;

  .material-symbols-outlined {
    font-size: 1.2rem;
  }

  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 5px 10px;
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  flex-grow: 1; /* 검색창이 공간 차지 */
  max-width: 400px; /* 최대 너비 */

  .material-symbols-outlined {
    color: ${(props) => props.theme.subTextColor};
    font-size: 1.2rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
  color: ${(props) => props.theme.textColor};
  width: 100%;
`;

// 강의 목록 테이블 카드
const CourseTableCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto; /* 작은 화면에서 테이블 가로 스크롤 */
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Thead = styled.thead`
  background-color: ${(props) => props.theme.backgroundColor || "#f9f9f9"};
  color: ${(props) => props.theme.textColor};
  text-align: left;
  border-bottom: 2px solid ${(props) => props.theme.btnColor || "#ddd"}; /* 헤더 구분선 강화 */
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  &:last-child {
    border-bottom: none;
  }
`;

const Th = styled.th`
  padding: 12px 15px;
  font-weight: 600;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px 15px;
  color: ${(props) => props.theme.textColor};
  vertical-align: middle;
  white-space: nowrap;
`;

// 액션 버튼 스타일
const ActionButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 8px; /* 버튼 간 간격 */

  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
  }
`;
const SettingsIcon = styled.button`
  // 설정 아이콘 버튼
  background: none;
  border: none;
  color: ${(props) => props.theme.subTextColor};
  cursor: pointer;
  padding: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: ${(props) => props.theme.textColor};
  }
  .material-symbols-outlined {
    font-size: 1.3rem;
  }
`;

const MessageContainer = styled.div`
  /* AdminStudentUserList 와 동일 */
`;

// --- Lecture 타입 정의 (API 응답 기반) ---
interface AdminLecture {
  id: number;
  name: string;
  instructor_name: string;
  // API에 없는 필드는 필요시 추가
  // schedule?: string;
  // location?: string;
}

// --- CourseManage Component ---
const CourseManage = () => {
  const [lectures, setLectures] = useState<AdminLecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isNewLectureModalOpen, setIsNewLectureModalOpen] = useState(false); // 모달 상태

  const navigate = useNavigate();

  // useCallback으로 fetchLectures 함수 감싸기
  const fetchLectures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ lectures: AdminLecture[] }>('/admin/lectures/all');
      setLectures(response.data.lectures || []);
    } catch (err: any) {
      console.error("Failed to fetch admin lectures:", err);
      setError(err.message || "Failed to load lecture list.");
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열 비워둠 (컴포넌트 마운트 시에만 생성)

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]); // fetchLectures가 변경될 때만 (즉, 마운트 시 한 번) 실행

  const filteredLectures = useMemo(() => {
    if (!searchTerm) return lectures;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return lectures.filter(
      (lecture) =>
        lecture.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        lecture.instructor_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        lecture.id.toString().includes(lowerCaseSearchTerm)
    );
  }, [lectures, searchTerm]);

  const handleManageStudents = (lectureId: number) => {
    alert(`Manage students for lecture ${lectureId} - Navigation or Modal`);
    // 예: navigate(`/admin/course/${lectureId}/students`);
  };

  const handleLectureSettings = (lectureId: number) => {
    alert(`Settings for lecture ${lectureId} - Navigation or Modal`);
    // 예: navigate(`/admin/course/${lectureId}/settings`);
  };

  const handleLectureCreated = () => {
    setIsNewLectureModalOpen(false);
    fetchLectures(); // 새 강의 생성 후 목록 다시 불러오기
  };

  return (
    <AdminPageContainer>
      <PageHeader>
        <Breadcrumb>&gt; Course Manage</Breadcrumb>
        <TopControlBar>
          <NewButton onClick={() => setIsNewLectureModalOpen(true)}>
            <span className="material-symbols-outlined">add_circle</span>
            New
          </NewButton>
          <SearchAndFilter>
            <SearchBox>
              <span className="material-symbols-outlined">search</span>
              <SearchInput
                type="text"
                placeholder="Search Courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
          </SearchAndFilter>
        </TopControlBar>
      </PageHeader>

      <CourseTableCard>
        <TableWrapper>
          {loading && <MessageContainer>Loading lectures...</MessageContainer>}
          {error && <MessageContainer>Error: {error}</MessageContainer>}
          {!loading && !error && (
            <StyledTable>
              <Thead>
                <Tr>
                  <Th>Course ID</Th>
                  <Th>Course Name</Th>
                  <Th>Professor</Th>
                  <Th>Schedule</Th>
                  <Th>Location</Th>
                  <Th>Students</Th>
                  <Th></Th> {/* Settings Icon Column */}
                </Tr>
              </Thead>
              <Tbody>
                {filteredLectures.length > 0 ? (
                  filteredLectures.map((lecture) => (
                    <Tr key={lecture.id}>
                      <Td>{lecture.id}</Td>
                      <Td>{lecture.name}</Td>
                      <Td>{lecture.instructor_name}</Td>
                      <Td>-</Td> {/* API에 Schedule 정보 없음 */}
                      <Td>-</Td> {/* API에 Location 정보 없음 */}
                      <Td>
                        <ActionButton
                          onClick={() => handleManageStudents(lecture.id)}
                        >
                          Manage Students
                        </ActionButton>
                      </Td>
                      <Td>
                        <SettingsIcon
                          onClick={() => handleLectureSettings(lecture.id)}
                          title="Lecture Settings"
                        >
                          <span className="material-symbols-outlined">
                            settings
                          </span>
                        </SettingsIcon>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} style={{ textAlign: "center" }}>
                      {lectures.length === 0
                        ? "No lectures found."
                        : "No lectures match your search."}
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </StyledTable>
          )}
        </TableWrapper>
        {/* TODO: Pagination UI 렌더링 */}
      </CourseTableCard>

      {/* 강의 개설 모달 */}
      <NewLectureModal
        isOpen={isNewLectureModalOpen}
        onClose={() => setIsNewLectureModalOpen(false)}
        onLectureCreated={handleLectureCreated} // 콜백 전달
      />
    </AdminPageContainer>
  );
};

export default CourseManage;
