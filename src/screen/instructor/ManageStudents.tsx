// src/components/modal/ManageStudents.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import apiClient from "../../api/apiClient"; // 경로 확인

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
  background-color: ${(props) => props.theme.formContainerColor || "white"};
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
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
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
  background-color: ${(props) => props.theme.formContainerColor || "white"};
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
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
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
  background-color: ${(props) => props.theme.backgroundColor || "#f9f9f9"};
  color: ${(props) => props.theme.subTextColor};
  text-align: left;
`;

const TableHeaderCell = styled.th`
  padding: 10px 15px;
  font-weight: 600;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.btnColor || "#eee"};
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  color: ${(props) => props.theme.textColor};
  vertical-align: middle;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  cursor: pointer;
  width: 18px;
  height: 18px;
`;
const MessageContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
  font-size: 1rem;
`;
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
  const [allStudents, setAllStudents] = useState<Student[]>([]); // 강의자의 모든 학생
  const [initiallyEnrolledUids, setInitiallyEnrolledUids] = useState<
    Set<string>
  >(new Set());
  const [currentlySelectedUids, setCurrentlySelectedUids] = useState<
    Set<string>
  >(new Set());

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // 검색어 상태

  const fetchAllData = useCallback(async () => {
    if (!lectureId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. 강의자의 모든 학생 목록 가져오기
      const allStudentsResponse = await apiClient.get<{ students: Student[] }>(
        "/instructors/students"
      );
      const allStudentsData = allStudentsResponse.data.students || [];
      setAllStudents(allStudentsData);

      // 2. 현재 강의에 등록된 학생 UID 목록 가져오기
      const enrolledResponse = await apiClient.post<{
        students: { uid: string }[];
      }>("/instructors/lecture/students", { lecture_id: lectureId });
      const enrolledUids = new Set(
        (enrolledResponse.data.students || []).map((s) => s.uid)
      );

      setInitiallyEnrolledUids(enrolledUids);
      setCurrentlySelectedUids(new Set(enrolledUids)); // 초기 체크 상태는 현재 등록된 학생들
    } catch (err: any) {
      console.error("Failed to load student data for lecture management:", err);
      setError(err.message || "Failed to load student data.");
      setAllStudents([]);
      setInitiallyEnrolledUids(new Set());
      setCurrentlySelectedUids(new Set());
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    } else {
      setAllStudents([]);
      setInitiallyEnrolledUids(new Set());
      setCurrentlySelectedUids(new Set());
      setError(null);
      setSearchTerm("");
    }
  }, [isOpen, fetchAllData]);

  // 체크박스 변경 핸들러
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

      // 모든 학생 목록을 기준으로 변경 사항 파악
      allStudents.forEach((student) => {
        const wasInitiallyEnrolled = initiallyEnrolledUids.has(student.uid);
        const isCurrentlySelected = currentlySelectedUids.has(student.uid);

        if (!wasInitiallyEnrolled && isCurrentlySelected) {
          uidsToEnroll.push(student.uid); // 새로 체크된 학생 (등록 대상)
        } else if (wasInitiallyEnrolled && !isCurrentlySelected) {
          uidsToUnenroll.push(student.uid); // 체크 해제된 기존 등록 학생 (취소 대상)
        }
      });

      let success = true;
      const promises = [];

      if (uidsToEnroll.length > 0) {
        console.log("Enrolling students:", uidsToEnroll);
        promises.push(
          apiClient.post("/instructors/lecture/bulk-enroll", {
            lecture_id: lectureId,
            student_uid_list: uidsToEnroll,
          })
        );
      }

      if (uidsToUnenroll.length > 0) {
        console.log("Unenrolling students:", uidsToUnenroll);
        promises.push(
          apiClient.post("/instructors/lecture/unenroll", {
            lecture_id: lectureId,
            student_uid_list: uidsToUnenroll,
          })
        );
      }

      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        results.forEach((result) => {
          if (result.status === "rejected") {
            success = false;
            console.error("API call failed:", result.reason);
          }
        });
      } else {
        alert("No changes to save.");
        setIsSaving(false);
        return;
      }

      if (success) {
        alert("Student enrollments updated successfully!");
        // onEnrollmentUpdated?.(); // 부모 컴포넌트에 알림 (필요시)
        fetchAllData(); // 성공 후 목록 및 초기 상태 다시 로드
        // onClose(); // 자동으로 닫지 않고, 변경된 상태를 보여줄 수 있음
      } else {
        throw new Error(
          "One or more enrollment operations failed. Please check console."
        );
      }
    } catch (err: any) {
      console.error("Failed to update enrollments:", err);
      setError(err.message || "Failed to update enrollments.");
      // 실패 시, fetchAllData()를 호출하여 서버의 최신 상태로 UI를 되돌릴 수 있음
      await fetchAllData();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allStudents.filter(
      (student) =>
        student.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        student.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        student.uid.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allStudents, searchTerm]);

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

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
          <SearchBox>
            {" "}
            {/* 검색창 스타일 적용 */}
            <span className="material-symbols-outlined">search</span>
            <SearchInput
              type="text"
              placeholder="Search by Name, Email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <SaveButton
            onClick={handleSaveEnrollment}
            disabled={isSaving || loading}
          >
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
                  <TableHeaderCell style={{ textAlign: "center" }}>
                    Status
                  </TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => (
                    <TableRow key={student.uid}>
                      <TableCell>{student.uid}</TableCell>
                      <TableCell>{student.name || "-"}</TableCell>
                      <TableCell>{student.email}</TableCell>
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
                        ? "No students available for this instructor."
                        : "No students match your search."}
                    </TableCell>
                  </tr>
                )}
              </TableBody>
            </StudentTable>
          )}
        </StudentTableContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ManageStudents;
