// src/components/modal/ManageStudents.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import apiClient from '../../api/apiClient'; // 경로 확인

// --- Styled Components for Modal ---

// 모달 배경 (화면 전체를 덮음)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명 검정 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 다른 요소 위에 표시 */
`;

// 모달 컨텐츠 컨테이너
const ModalContent = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px; /* 모달 최대 너비 */
  max-height: 80vh; /* 모달 최대 높이 */
  display: flex;
  flex-direction: column;
  position: relative; /* 닫기 버튼 위치 기준 */
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: ${(props) => props.theme.subTextColor};
  padding: 5px;
  line-height: 1;
  &:hover {
    color: ${(props) => props.theme.textColor};
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  flex-grow: 1; /* 검색창이 남는 공간 차지 */
  /* 테마 적용 */
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  color: ${(props) => props.theme.textColor};
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
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor || '#fcae5a'};
  }
  &:disabled {
    background-color: #cccccc; cursor: not-allowed;
  }
`;

// 학생 목록 테이블 스타일
const StudentTableContainer = styled.div`
  overflow-y: auto; /* 내용 많으면 스크롤 */
  flex-grow: 1; /* 남은 공간 차지 */
`;

const StudentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHead = styled.thead`
  background-color: ${(props) => props.theme.backgroundColor || '#f9f9f9'};
  color: ${(props) => props.theme.subTextColor};
  text-align: left;
`;

const TableHeaderCell = styled.th`
  padding: 10px 15px;
  font-weight: 600;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
  &:last-child { border-bottom: none; }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  color: ${(props) => props.theme.textColor};
  vertical-align: middle;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

// --- Student 타입 정의 ---
interface Student {
  uid: string;
  email: string;
  name: string | null;
  // is_enrolled?: boolean; // API 응답에 따라 필요할 수 있음
}

// --- 컴포넌트 Props 타입 정의 ---
interface ManageStudentsProps {
  lectureId: number;
  lectureName?: string; // 모달 제목 등에 사용
  isOpen: boolean;
  onClose: () => void;
}

// --- ManageStudents Component ---
const ManageStudents: React.FC<ManageStudentsProps> = ({
  lectureId,
  lectureName,
  isOpen,
  onClose,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  // 체크된 학생들의 UID를 관리하는 Set
  const [enrolledStudentUids, setEnrolledStudentUids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // 검색어 상태

  // 학생 목록 가져오기
  useEffect(() => {
    // 모달이 열려있고 lectureId가 유효할 때만 데이터 로드
    if (isOpen && lectureId) {
      setLoading(true);
      setError(null);
      apiClient.post<{ students: Student[] }>('/instructors/lecture/students', { lecture_id: lectureId })
        .then(response => {
          const fetchedStudents = response.data.students || [];
          setStudents(fetchedStudents);
          // API 응답으로 받은 학생들을 기본적으로 체크된 상태로 설정
          const initialEnrolledUids = new Set(fetchedStudents.map(s => s.uid));
          setEnrolledStudentUids(initialEnrolledUids);
        })
        .catch(err => {
          console.error("Failed to fetch students:", err);
          setError(err.message || "Failed to load student list.");
          setStudents([]); // 에러 시 빈 배열로 초기화
          setEnrolledStudentUids(new Set()); // 에러 시 초기화
        })
        .finally(() => setLoading(false));
    } else {
      // 모달 닫힐 때 상태 초기화 (선택 사항)
      setStudents([]);
      setEnrolledStudentUids(new Set());
      setError(null);
      setSearchTerm("");
    }
  }, [isOpen, lectureId]); // isOpen 또는 lectureId 변경 시 재실행

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (studentUid: string, isChecked: boolean) => {
    setEnrolledStudentUids(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(studentUid);
      } else {
        newSet.delete(studentUid);
      }
      return newSet;
    });
  };

  // 저장 버튼 핸들러
  const handleSaveEnrollment = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const studentUidList = Array.from(enrolledStudentUids); // Set을 배열로 변환
      await apiClient.post('/instructors/lecture/bulk-enroll', {
        lecture_id: lectureId,
        student_uid_list: studentUidList,
      });
      alert("Enrollment updated successfully!");
      onClose(); // 성공 시 모달 닫기
    } catch (err: any) {
      console.error("Failed to save enrollment:", err);
      setError(err.message || "Failed to save enrollment.");
    } finally {
      setIsSaving(false);
    }
  };

  // 검색어에 따라 학생 필터링
  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}> {/* 배경 클릭 시 닫기 */}
      <ModalContent onClick={(e) => e.stopPropagation()}> {/* 모달 내부 클릭 시 전파 방지 */}
        <ModalHeader>
          <ModalTitle>Manage Students{lectureName ? `: ${lectureName}` : ''}</ModalTitle>
          <CloseButton onClick={onClose} title="Close">&times;</CloseButton>
        </ModalHeader>

        <ControlsContainer>
          <SearchInput
             type="text"
             placeholder="Search by Name, Email, or ID..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* TODO: 드롭다운 필터 추가 (필요시) */}
          <SaveButton onClick={handleSaveEnrollment} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </SaveButton>
        </ControlsContainer>

        {/* 학생 목록 테이블 */}
        <StudentTableContainer>
          {loading && <p>Loading students...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {!loading && !error && (
            <StudentTable>
              <TableHead>
                <tr>
                  <TableHeaderCell>Student ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.uid}>
                      <TableCell>{student.uid}</TableCell>
                      <TableCell>{student.name || '-'}</TableCell> {/* 이름 없으면 '-' */}
                      <TableCell>{student.email}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <Checkbox
                          checked={enrolledStudentUids.has(student.uid)}
                          onChange={(e) => handleCheckboxChange(student.uid, e.target.checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                      {students.length === 0 ? "No students enrolled." : "No students match your search."}
                    </TableCell>
                  </tr>
                )}
              </TableBody>
            </StudentTable>
          )}
        </StudentTableContainer>
         {/* TODO: Pagination 구현 (필요시) */}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ManageStudents;