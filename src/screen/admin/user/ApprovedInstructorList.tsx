import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import apiClient from "../../../api/apiClient"; // 경로 확인
import { useNavigate } from "react-router-dom";

// --- Styled Components ---

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

// 탭 컨테이너 (Student, Instructor 등)
const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 10px 15px;
  border: none;
  border-bottom: 3px solid transparent;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) =>
    props.isActive ? props.theme.textColor : props.theme.subTextColor};
  border-bottom-color: ${(props) =>
    props.isActive
      ? props.theme.highlightColor || props.theme.btnColor || "#1f6feb"
      : "transparent"};
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: ${(props) => props.theme.textColor};
  }
`;

// 검색 및 필터 영역
const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

const FilterDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  color: ${(props) => props.theme.textColor};
`;

// 학생 목록 테이블 카드
const InstructorTableCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden; /* 테이블 모서리 */
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

const BlockButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c; /* 빨간색 */
  cursor: pointer;
  padding: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 1.3rem;
  }
  &:hover {
    color: #c0392b; /* 더 진한 빨간색 */
  }
`;

// 페이지네이션 스타일
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  gap: 8px;
`;

const MessageContainer = styled.div`
  /* 로딩/에러 메시지 */
`;

// --- Instructor 타입 정의 (API 응답 기반) ---
interface AdminInstructor {
  name: string | null;
  email: string;
  id: number;
  is_approved: number | null;
}

const AdminInstructorUserList = () => {
  const [instructors, setInstructors] = useState<AdminInstructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  // TODO: 페이지네이션 상태 추가
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructors = async () => {
      setLoading(true);
      setError(null);
      try {
        // 관리자용 학생 목록 API 호출
        const response = await apiClient.get<{
          instructors: AdminInstructor[];
        }>("/admin/instructors");
        const approvedInstructors = (response.data.instructors || []).filter(
          (instructor) => instructor.is_approved === 1
        );
        setInstructors(approvedInstructors);
      } catch (err: any) {
        console.error("Failed to fetch admin instructors:", err);
        setError(err.message || "Failed to load instructor list.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  // 검색 필터링 로직
  const filteredInstructors = useMemo(() => {
    if (!searchTerm) return instructors;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return instructors.filter(
      (instructor) =>
        instructor.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        instructor.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        instructor.id.toString().includes(lowerCaseSearchTerm)
    );
  }, [instructors, searchTerm]);

  const handleManageCourses = (instructorId: number) => {
    alert(`Manage courses for instructor ${instructorId} - Navigation needed`);
  };

  const handleBlockInstructor = (instructorId: number) => {
    if (
      window.confirm(
        `Are you sure you want to block instructor ${instructorId}?`
      )
    ) {
      alert(`Block instructor ${instructorId} - API call needed`);
      // TODO: 차단 API 호출 로직 구현
    }
  };

  return (
    <AdminPageContainer>
      <PageHeader>
        <Breadcrumb>&gt; User Manage / Instructor</Breadcrumb>
        <TabContainer>
          <TabButton
            isActive={false}
            onClick={() => navigate("/admin/user/student")}
          >
            Student
          </TabButton>
          <TabButton isActive={true} onClick={() => {}}>
            Instructor
          </TabButton>
          <TabButton
            isActive={false}
            onClick={() => navigate("/admin/user/unauthorized")}
          >
            Unauthorized
          </TabButton>
        </TabContainer>
        <ControlBar>
          <SearchBox>
            <span className="material-symbols-outlined">search</span>
            <SearchInput
              type="text"
              placeholder="Search Instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
        </ControlBar>
      </PageHeader>

      <InstructorTableCard>
        <TableWrapper>
          {loading && (
            <MessageContainer>Loading instructors...</MessageContainer>
          )}
          {error && <MessageContainer>Error: {error}</MessageContainer>}
          {!loading && !error && (
            <StyledTable>
              <Thead>
                <Tr>
                  <Th>Instructor ID *</Th>
                  <Th>Name *</Th>
                  <Th>Email *</Th>
                  <Th>Courses</Th>
                  <Th>Block</Th> {/* Block 컬럼 추가 */}
                </Tr>
              </Thead>
              <Tbody>
                {filteredInstructors.length > 0 ? (
                  filteredInstructors.map((instructor) => (
                    <Tr key={instructor.id}>
                      <Td>{instructor.id}</Td>
                      <Td>{instructor.name || "-"}</Td>
                      <Td>{instructor.email}</Td>
                      <Td>
                        <ActionButton
                          onClick={() => handleManageCourses(instructor.id)}
                        >
                          Manage Courses
                        </ActionButton>
                      </Td>
                      <Td>
                        <BlockButton
                          onClick={() => handleBlockInstructor(instructor.id)}
                          title={`Block ${instructor.email}`}
                        >
                          <span className="material-symbols-outlined">
                            block
                          </span>
                        </BlockButton>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6} style={{ textAlign: "center" }}>
                      {instructors.length === 0
                        ? "No instructors found."
                        : "No instructors match your search."}
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </StyledTable>
          )}
        </TableWrapper>
        {/* TODO: Pagination UI 렌더링 */}
        {/* <PaginationContainer> ... </PaginationContainer> */}
      </InstructorTableCard>
    </AdminPageContainer>
  );
};

export default AdminInstructorUserList;
