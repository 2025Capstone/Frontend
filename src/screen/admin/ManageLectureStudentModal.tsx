// src/components/modal/ManageLectureStudentsModal.tsx (새 파일)
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import apiClient from "../../api/apiClient"; // 경로 확인

// --- Styled Components (기존 ManageStudents.tsx 또는 AdminStudentUserList 와 유사) ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px; /* 모바일 화면 여백 */
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  padding: 25px 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px; /* 모달 최대 너비 */
  max-height: 90vh; /* 모달 최대 높이 */
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background-color 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#e0e0e0"};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem; /* 제목 크기 */
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem; /* 닫기 버튼 크기 */
  cursor: pointer;
  color: ${(props) => props.theme.subTextColor};
  padding: 0;
  line-height: 1;
  &:hover {
    color: ${(props) => props.theme.textColor};
  }
`;

// --- 컨트롤 영역 (검색, 필터, 저장 버튼) ---
const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap; /* 작은 화면에서 줄바꿈 */
`;

const SearchAndFilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-grow: 1; /* 남는 공간 차지 */
`;

// 검색창 (기존 Admin 페이지 스타일 참조)
const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${(props) => props.theme.btnColor || "#ccc"};
  border-radius: 6px;
  padding: 8px 12px; /* 패딩 조정 */
  background-color: ${(props) =>
    props.theme.formContainerColor || props.theme.backgroundColor || "white"};
  flex-grow: 1;
  max-width: 350px;

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
  &::placeholder {
    color: ${(props) => props.theme.subTextColor}B3; // 약간 더 연하게
  }
`;

// 필터 드롭다운 (이미지의 'Student ID' 부분)
const FilterDropdown = styled.select`
  padding: 9px 12px; /* 높이 맞춤 */
  border: 1px solid ${(props) => props.theme.btnColor || "#ccc"};
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: ${(props) =>
    props.theme.formContainerColor || props.theme.backgroundColor || "white"};
  color: ${(props) => props.theme.textColor};
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333; /* 버튼 색상에 따라 조정 */
  border: none;
  border-radius: 6px;
  padding: 9px 20px; /* 높이 맞춤 */
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
  }
  &:disabled {
    background-color: #cccccc;
    color: #777777;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// --- 학생 목록 테이블 ---
const StudentTableContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(
    80vh - 200px
  ); /* 모달 헤더, 컨트롤, 패딩 제외한 높이 (대략적) */
  border: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  border-radius: 8px;
`;

const StudentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHead = styled.thead`
  background-color: ${(props) => props.theme.backgroundColor || "#f9f9f9"};
  color: ${(props) =>
    props.theme.textColor}; /* 헤더 텍스트는 일반 텍스트 색상 사용 */
  position: sticky; /* 스크롤 시 헤더 고정 */
  top: 0;
  z-index: 1; /* 다른 내용 위에 표시 */
`;

const TableHeaderCell = styled.th`
  padding: 12px 15px;
  font-weight: 600;
  text-align: left;
  border-bottom: 2px solid ${(props) => props.theme.btnColor || "#ddd"};
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  transition: background-color 0.15s ease;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: ${(props) =>
      props.theme.subTextColor}10; /* 약한 호버 효과 */
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  color: ${(props) => props.theme.textColor};
  vertical-align: middle;
  white-space: nowrap;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  cursor: pointer;
  width: 18px;
  height: 18px;
  vertical-align: middle; /* 다른 셀 내용과 정렬 */
`;

// --- 메시지 컨테이너 (로딩, 에러, 데이터 없음) ---
const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
  font-size: 1rem;
`;

// --- 타입 정의 ---
interface Student {
  // 전체 학생 목록용
  uid: string;
  email: string;
  name: string | null;
  profile_image_url?: string | null; // API 응답에 포함되어 있음
}

interface EnrolledStudentInfo {
  // 특정 강의에 등록된 학생 정보 (현재 API로는 UID만 알 수 있음)
  uid: string;
  // 필요시 다른 정보 추가
}

interface ManageLectureStudentsModalProps {
  lectureId: number;
  lectureName?: string;
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentUpdated: () => void; // 부모 컴포넌트의 목록 새로고침용 콜백
}

const ManageLectureStudentsModal: React.FC<ManageLectureStudentsModalProps> = ({
  lectureId,
  lectureName,
  isOpen,
  onClose,
  onEnrollmentUpdated,
}) => {
  const [allStudents, setAllStudents] = useState<Student[]>([]); // 시스템의 모든 학생
  const [initiallyEnrolledUids, setInitiallyEnrolledUids] = useState<
    Set<string>
  >(new Set()); // 초기 등록 상태
  const [currentlySelectedUids, setCurrentlySelectedUids] = useState<
    Set<string>
  >(new Set()); // 현재 UI에서 체크된 학생들

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 1. 모든 학생 목록 가져오기 & 2. 현재 강의에 등록된 학생 목록 가져오기
  useEffect(() => {
    if (isOpen && lectureId) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // 1. 모든 학생 목록 가져오기
          const allStudentsResponse = await apiClient.get<{
            students: Student[];
          }>("/admin/students");
          setAllStudents(allStudentsResponse.data.students || []);

          // 2. 현재 강의에 등록된 학생 UID 목록 가져오기
          // 이 API는 /instructors/lecture/students 와 동일한 요청/응답 구조를 가진다고 가정합니다.
          // 관리자용 API가 있다면 해당 API로 대체해야 합니다.
          // 임시로 학생용과 동일한 API를 사용 (관리자 권한으로도 동작한다고 가정)
          const enrolledResponse = await apiClient.post<{
            students: { uid: string }[];
          }>("/instructors/lecture/students", { lecture_id: lectureId });
          const enrolledUids = new Set(
            (enrolledResponse.data.students || []).map((s) => s.uid)
          );

          setInitiallyEnrolledUids(enrolledUids);
          setCurrentlySelectedUids(new Set(enrolledUids)); // 초기 체크 상태 설정
        } catch (err: any) {
          console.error("Failed to load student data:", err);
          setError(err.message || "Failed to load data.");
          setAllStudents([]);
          setInitiallyEnrolledUids(new Set());
          setCurrentlySelectedUids(new Set());
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // 모달 닫힐 때 상태 초기화
      setAllStudents([]);
      setInitiallyEnrolledUids(new Set());
      setCurrentlySelectedUids(new Set());
      setError(null);
      setSearchTerm("");
    }
  }, [isOpen, lectureId]);

  const handleCheckboxChange = (studentUid: string, isChecked: boolean) => {
    setCurrentlySelectedUids((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(studentUid);
      } else {
        newSet.delete(studentUid);
      }
      return newSet;
    });
  };

  const handleSaveEnrollment = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const uidsToEnroll: string[] = [];
      const uidsToUnenroll: string[] = [];

      allStudents.forEach((student) => {
        const isInitiallyEnrolled = initiallyEnrolledUids.has(student.uid);
        const isCurrentlySelected = currentlySelectedUids.has(student.uid);

        if (!isInitiallyEnrolled && isCurrentlySelected) {
          uidsToEnroll.push(student.uid); // 새로 등록할 학생
        } else if (isInitiallyEnrolled && !isCurrentlySelected) {
          uidsToUnenroll.push(student.uid); // 등록 취소할 학생
        }
      });

      let enrollSuccess = true;
      let unenrollSuccess = true;

      if (uidsToEnroll.length > 0) {
        console.log("Enrolling students:", uidsToEnroll);
        const enrollResponse = await apiClient.post("/admin/lecture/enroll", {
          lecture_id: lectureId,
          student_uid_list: uidsToEnroll,
        });
        if (!enrollResponse.data) {
          // API 응답 구조에 따라 성공 여부 판단
          enrollSuccess = false;
          throw new Error("Enrollment API did not return success.");
        }
        console.log("Enrollment successful:", enrollResponse.data);
      }

      if (uidsToUnenroll.length > 0) {
        console.log("Unenrolling students:", uidsToUnenroll);
        const unenrollResponse = await apiClient.post(
          "/admin/lecture/unenroll",
          {
            lecture_id: lectureId,
            student_uid_list: uidsToUnenroll,
          }
        );
        if (!unenrollResponse.data) {
          // API 응답 구조에 따라 성공 여부 판단
          unenrollSuccess = false;
          throw new Error("Unenrollment API did not return success.");
        }
        console.log("Unenrollment successful:", unenrollResponse.data);
      }

      if (enrollSuccess && unenrollSuccess) {
        alert("Student enrollments updated successfully!");
        onEnrollmentUpdated(); // 부모 컴포넌트 목록 새로고침
        onClose();
      }
    } catch (err: any) {
      console.error("Failed to update enrollments:", err);
      setError(err.message || "Failed to update enrollments.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = allStudents.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            Manage Students{lectureName ? `: ${lectureName}` : ""}
          </ModalTitle>
          <CloseButton onClick={onClose} title="Close">
            &times;
          </CloseButton>
        </ModalHeader>

        <ControlsContainer>
          <SearchInput
            type="text"
            placeholder="Search by Name, Email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1, maxWidth: "400px" }} // 스타일 조정
          />
          {/* Student ID 드롭다운은 이미지에 있지만 기능 명세는 없음 */}
          {/* <FilterDropdown><option>Student ID</option></FilterDropdown> */}
          <SaveButton onClick={handleSaveEnrollment} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </SaveButton>
        </ControlsContainer>

        <StudentTableContainer>
          {loading && <MessageContainer>Loading students...</MessageContainer>}
          {error && (
            <MessageContainer style={{ color: "red" }}>
              Error: {error}
            </MessageContainer>
          )}
          {!loading && !error && (
            <StudentTable>
              <TableHead>
                <tr>
                  <TableHeaderCell>Student ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>???</TableHeaderCell>{" "}
                  {/* 이미지의 ??? 컬럼 */}
                  <TableHeaderCell style={{ textAlign: "center" }}>
                    Status
                  </TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.uid}>
                      <TableCell>{student.uid}</TableCell>
                      <TableCell>{student.name || "-"}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>?</TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <Checkbox
                          checked={currentlySelectedUids.has(student.uid)}
                          onChange={(e) =>
                            handleCheckboxChange(student.uid, e.target.checked)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <TableCell colSpan={5} style={{ textAlign: "center" }}>
                      {allStudents.length === 0
                        ? "No students in system."
                        : "No students match your search."}
                    </TableCell>
                  </tr>
                )}
              </TableBody>
            </StudentTable>
          )}
        </StudentTableContainer>
        {/* TODO: Pagination */}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ManageLectureStudentsModal;

// --- 아래 Styled Components 정의를 Modal 파일 또는 공통 styles 파일에 추가/수정 ---
// ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton,
// ControlsContainer, SearchInput, SaveButton, StudentTableContainer,
// StudentTable, TableHead, TableHeaderCell, TableBody, TableRow, TableCell,
// Checkbox, MessageContainer 등
// 이전 답변의 ManageStudents.tsx 또는 AdminStudentUserList.tsx에서 가져오거나 유사하게 정의합니다.
