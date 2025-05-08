import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import apiClient from "../../../api/apiClient"; // 경로 확인 필요
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

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"}; // 테마 또는 기본값
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
      ? props.theme.highlightColor || props.theme.btnColor || "#1f6feb" // 테마 우선순위
      : "transparent"};
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: ${(props) => props.theme.textColor};
  }
`;

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
  border: 1px solid #ccc; // 테마 적용 고려
  border-radius: 6px;
  padding: 5px 10px;
  background-color: ${(props) => props.theme.formContainerColor || "white"}; // 테마 적용
  flex-grow: 1;
  max-width: 400px;

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
  border: 1px solid #ccc; // 테마 적용 고려
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: ${(props) => props.theme.formContainerColor || "white"}; // 테마 적용
  color: ${(props) => props.theme.textColor};
`;

const InstructorTableCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"}; // 테마 적용
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Thead = styled.thead`
  /* 헤더 배경색은 전체 배경과 다르게 할 수 있음 */
  background-color: ${(props) => props.theme.backgroundColor || "#f9f9f9"};
  color: ${(props) => props.theme.textColor}; // 헤더 텍스트 색상
  text-align: left;
  border-bottom: 2px solid ${(props) => props.theme.btnColor || "#ddd"}; // 테마 또는 기본값
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"}; // 테마 또는 기본값
  &:last-child {
    border-bottom: none;
  }
  /* 호버 효과 (선택 사항) */
  /* &:hover { background-color: ${(props) => props.theme.subTextColor}10; } */
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

const ActionButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333; // 버튼 색상 대비 고려
  border: none;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"}; // 테마 또는 기본값
  }
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;

// --- Instructor 타입 정의 (API 응답 기반) ---
interface AdminInstructor {
  name: string | null;
  email: string;
  id: number;
  is_approved: number | null; // 0: 미승인, 1: 승인 (정확한 값 확인 필요)
}

// --- AdminUnApprovedInstructorUserList Component ---
const AdminUnApprovedInstructorUserList = () => {
  const [instructors, setInstructors] = useState<AdminInstructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [approvingId, setApprovingId] = useState<number | null>(null); // 승인 처리 중 ID 저장

  const navigate = useNavigate();

  // --- 데이터 로딩 함수 ---
  const fetchUnapprovedInstructors = useCallback(async () => {
    // 초기 로딩 상태가 아니라면 로딩 표시 (새로고침 시)
    if(!loading) setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ instructors: AdminInstructor[] }>(
        "/admin/instructors/unapproved"
      );
      // API 응답에서 is_approved가 0인 강사만 필터링 (API가 정확히 미승인 목록만 주는지 확인 필요)
      // API 응답이 response.data.instructors 가 아니라 response.data 일 수도 있음
      const dataToFilter = response.data.instructors || response.data || [];
      const unapproved = Array.isArray(dataToFilter)
         ? dataToFilter.filter((instructor) => instructor.is_approved === 0)
         : [];
      setInstructors(unapproved);
    } catch (err: any) {
      console.error("Failed to fetch admin instructors:", err);
      setError(err.message || "Failed to load instructor list.");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, [loading]); // loading 상태를 의존성에 추가하여 불필요한 재호출 방지 고려 (혹은 빈 배열 유지)

  useEffect(() => {
    fetchUnapprovedInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 호출

  // --- 검색 필터링 ---
  const filteredInstructors = useMemo(() => {
    if (!searchTerm) return instructors;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return instructors.filter(
      (instructor) =>
        instructor.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        instructor.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        instructor.id.toString().includes(lowerCaseSearchTerm) // ID 검색 추가
    );
  }, [instructors, searchTerm]);

  // --- 승인 처리 함수 ---
  const handleAcceptUser = async (instructorId: number) => {
    setApprovingId(instructorId); // 승인 시작 표시
    setError(null); // 이전 에러 클리어

    const apiUrl = `/admin/approve-instructor/${instructorId}`;

    try {
      console.log(`Approving instructor with ID: ${instructorId}`);
      const response = await apiClient.post<{
        id: number; name: string | null; email: string; message: string;
      }>(apiUrl, null);

      console.log("Approval successful:", response.data);
      const instructorName = response.data.name || `Instructor (ID: ${response.data.id})`;
      alert(`${instructorName}의 승인이 정상적으로 처리되었습니다!`);

      // 승인 성공 후 목록 새로고침
      await fetchUnapprovedInstructors();

    } catch (error: any) {
      console.error(`Failed to approve instructor ${instructorId}:`, error);
      const errorMessage = error.response?.data?.detail || error.message || "승인 처리 중 오류 발생";
      alert(`오류: ${errorMessage}`);
      // setError(errorMessage); // 필요시 에러 상태 설정
    } finally {
       setApprovingId(null); // 승인 로딩 상태 종료
    }
  };

  return (
    <AdminPageContainer>
      <PageHeader>
        {/* Breadcrumb 및 Tab은 현재 페이지에 맞게 수정 필요 */}
        <Breadcrumb>&gt; User Manage / Instructor / Unauthorized</Breadcrumb>
        <TabContainer>
          <TabButton isActive={false} onClick={() => navigate("/admin/user/student")}>Student</TabButton>
          <TabButton isActive={false} onClick={() => navigate("/admin/user/instructor")}>Instructor</TabButton>
          <TabButton isActive={true} onClick={() => {}}>Unauthorized</TabButton>
        </TabContainer>
        <ControlBar>
          <SearchBox>
            <span className="material-symbols-outlined">search</span>
            <SearchInput
               type="text"
               placeholder="Search Unapproved Instructors..." // 플레이스홀더 수정
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          {/* 필터 드롭다운은 현재 기능 없음 */}
          {/* <FilterDropdown> <option>...</option> </FilterDropdown> */}
        </ControlBar>
      </PageHeader>

      <InstructorTableCard>
        <TableWrapper>
           {(loading && instructors.length === 0) && (
             <MessageContainer>Loading instructors...</MessageContainer>
           )}
           {(error && instructors.length === 0) && (
              <MessageContainer>Error: {error}</MessageContainer>
           )}
           {/* 데이터가 로드되었거나, 로딩 중이 아니면서 에러도 없는 경우 테이블 표시 */}
           {(!loading || instructors.length > 0) && !error && (
             <StyledTable>
                <Thead>
                  <Tr>
                    <Th>Instructor ID</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Accept</Th> {/* 승인 버튼 컬럼 */}
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
                            onClick={() => handleAcceptUser(instructor.id)}
                            disabled={approvingId === instructor.id} // 승인 중 비활성화
                          >
                             {approvingId === instructor.id ? 'Processing...' : 'Accept Register'}
                          </ActionButton>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      {/* 검색 결과 없을 때와 초기 데이터 없을 때 메시지 분기 */}
                      <Td colSpan={4} style={{ textAlign: "center" }}>
                         {instructors.length > 0 && searchTerm ? "No instructors match your search." : "No unapproved instructors found."}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
            </StyledTable>
            )}
        </TableWrapper>
        {/* 페이지네이션 UI TODO */}
      </InstructorTableCard>
    </AdminPageContainer>
  );
};

export default AdminUnApprovedInstructorUserList;