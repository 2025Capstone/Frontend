// src/screen/admin/user/StudentList.tsx (새 파일)
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
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
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
  color: ${(props) => props.isActive ? props.theme.textColor : props.theme.subTextColor};
  border-bottom-color: ${(props) => props.isActive ? (props.theme.highlightColor || props.theme.btnColor || '#1f6feb') : 'transparent'};
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
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
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
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  color: ${(props) => props.theme.textColor};
`;

// 학생 목록 테이블 카드
const StudentTableCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
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
  background-color: ${(props) => props.theme.backgroundColor || '#f9f9f9'};
  color: ${(props) => props.theme.textColor};
  text-align: left;
  border-bottom: 2px solid ${(props) => props.theme.btnColor || '#ddd'}; /* 헤더 구분선 강화 */
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
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
    background-color: ${(props) => props.theme.hoverBtnColor || '#fcae5a'};
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

const PageButton = styled.button<{ isActive?: boolean }>`
  background: ${(props) => props.isActive ? (props.theme.btnColor || '#fcae5a') : 'none'};
  color: ${(props) => props.isActive ? '#333' : props.theme.subTextColor};
  border: 1px solid ${(props) => props.isActive ? 'transparent' : '#ccc'};
  border-radius: 4px;
  padding: 5px 10px;
  min-width: 30px;
  cursor: pointer;
  font-weight: ${(props) => props.isActive ? '600' : '400'};
  transition: all 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &:hover:not(:disabled):not(:active) {
     background-color: ${(props) => props.theme.subTextColor}1A;
     border-color: #aaa;
  }
`;


const MessageContainer = styled.div` /* 로딩/에러 메시지 */ `;

// --- Student 타입 정의 (API 응답 기반) ---
interface AdminStudent {
  name: string | null;
  email: string;
  uid: string;
  profile_image_url: string | null;
}

// --- AdminStudentUserList Component ---
const AdminStudentUserList = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  // TODO: 페이지네이션 상태 추가
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        // 관리자용 학생 목록 API 호출
        const response = await apiClient.get<{ students: AdminStudent[] }>('/admin/students');
        setStudents(response.data.students || []);
      } catch (err: any) {
        console.error("Failed to fetch admin students:", err);
        setError(err.message || "Failed to load student list.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // 검색 필터링 로직
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return students.filter(student =>
      student.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.uid.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [students, searchTerm]);

  // TODO: 페이지네이션 로직 추가 (예: 현재 페이지에 맞는 데이터 슬라이싱)
  // const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleManageCourses = (studentUid: string) => {
    alert(`Manage courses for student ${studentUid} - Navigation needed`);
    // navigate(`/admin/user/student/${studentUid}/courses`); // 예시 경로
  };

  const handleBlockStudent = (studentUid: string) => {
    if (window.confirm(`Are you sure you want to block student ${studentUid}?`)) {
       alert(`Block student ${studentUid} - API call needed`);
       // TODO: 차단 API 호출 로직 구현
    }
  };

  return (
    <AdminPageContainer>
      <PageHeader>
        <Breadcrumb>&gt; User Manage / Student</Breadcrumb>
        <TabContainer>
          <TabButton isActive={true} onClick={() => { /* 현재 페이지이므로 동작 없음 */}}>Student</TabButton>
          <TabButton isActive={false} onClick={() => navigate('/admin/user/instructor')}>Instructor</TabButton>
          <TabButton isActive={false} onClick={() => navigate('/admin/user/unauthorized')}>Unauthorized</TabButton>
        </TabContainer>
        <ControlBar>
          <SearchBox>
             <span className="material-symbols-outlined">search</span>
             <SearchInput
               type="text"
               placeholder="Search Students..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </SearchBox>
          <FilterDropdown>
            <option value="studentId">Student ID</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
          </FilterDropdown>
        </ControlBar>
      </PageHeader>

      <StudentTableCard>
        <TableWrapper>
           {loading && <MessageContainer>Loading students...</MessageContainer>}
           {error && <MessageContainer>Error: {error}</MessageContainer>}
           {!loading && !error && (
             <StyledTable>
                <Thead>
                  <Tr>
                    <Th>Student ID *</Th>
                    <Th>Name *</Th>
                    <Th>Email *</Th>
                    <Th>Courses</Th>
                    <Th>Block</Th> {/* Block 컬럼 추가 */}
                  </Tr>
                </Thead>
                <Tbody>
                  {/* TODO: paginatedStudents 사용 */}
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <Tr key={student.uid}>
                        <Td>{student.uid}</Td>
                        <Td>{student.name || "-"}</Td>
                        <Td>{student.email}</Td>
                        <Td>
                           <ActionButton onClick={() => handleManageCourses(student.uid)}>
                               Manage Courses
                           </ActionButton>
                        </Td>
                         <Td>
                           <BlockButton onClick={() => handleBlockStudent(student.uid)} title={`Block ${student.email}`}>
                               <span className="material-symbols-outlined">block</span>
                           </BlockButton>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={6} style={{ textAlign: 'center' }}>
                         {students.length === 0 ? "No students found." : "No students match your search."}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
            </StyledTable>
            )}
        </TableWrapper>
        {/* TODO: Pagination UI 렌더링 */}
        {/* <PaginationContainer> ... </PaginationContainer> */}
      </StudentTableCard>
    </AdminPageContainer>
  );
};

export default AdminStudentUserList;