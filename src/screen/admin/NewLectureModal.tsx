// src/components/modal/NewLectureModal.tsx (새 파일 또는 CourseManage.tsx 내부에 상세 구현)
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import apiClient from '../../api/apiClient'; // 경로 확인

// --- Styled Components for Modal (기존 Modal 스타일 재사용 또는 확장) ---
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 550px; /* 모달 너비 조정 */
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px; padding-bottom: 15px;
  border-bottom: 1px solid ${(props) => props.theme.btnColor || '#eee'};
`;

const ModalTitle = styled.h2`
  margin: 0; font-size: 1.4rem; font-weight: 600;
  color: ${(props) => props.theme.textColor};
`;

const ModalSubtitle = styled.p` // 이미지의 "Service Introducing comment"와 유사한 스타일
  font-size: 0.9rem;
  color: ${(props) => props.theme.subTextColor};
  text-align: center;
  margin-top: -15px; /* 제목과의 간격 조정 */
  margin-bottom: 25px;
`;

const CloseButton = styled.button`
  background: none; border: none; font-size: 1.8rem; cursor: pointer;
  color: ${(props) => props.theme.subTextColor};
  padding: 0; line-height: 1;
  &:hover { color: ${(props) => props.theme.textColor}; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px; /* 입력 필드 간 간격 */
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column; /* 라벨과 인풋 수직 배치 */
  gap: 8px;
`;

// 입력 필드 아이콘과 함께 배치하기 위한 컨테이너
const InputWithIcon = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc; // 테마 적용 고려
  border-radius: 8px;
  padding: 0 10px;
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  transition: border-color 0.2s;

  &:focus-within { // 내부 input 포커스 시 테두리 변경
    border-color: ${(props) => props.theme.btnColor};
    box-shadow: 0 0 0 2px ${(props) => props.theme.btnColor}4D;
  }

  .material-symbols-outlined {
    color: ${(props) => props.theme.subTextColor};
    margin-right: 8px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.9rem 0.5rem; /* 좌우 패딩 아이콘 고려하여 조정 */
  border: none;
  border-radius: 0 8px 8px 0; /* 왼쪽 모서리는 InputWithIcon이 처리 */
  font-size: 1rem;
  background-color: transparent; /* 부모 배경색 사용 */
  color: ${(props) => props.theme.textColor};
  outline: none; /* 포커스 시 아웃라인 제거 */

  &::placeholder { color: ${(props) => props.theme.subTextColor}; }
`;

// 시간 선택을 위한 Flex 컨테이너
const TimeSelectionGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center; /* 아이콘과 드롭다운 정렬 */

  .material-symbols-outlined {
    color: ${(props) => props.theme.subTextColor};
  }
`;

// 시간 드롭다운 스타일
const TimeSelect = styled.select`
  padding: 0.9rem 1rem;
  border: 1px solid #ccc; // 테마 적용 고려
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${(props) => props.theme.formContainerColor || 'white'};
  color: ${(props) => props.theme.textColor};
  flex-grow: 1; /* 남는 공간 차지 */
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.btnColor};
  }
`;

const Label = styled.label` // 일반 라벨 (필요시)
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
`;

const CreateButton = styled.button`
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.9rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor || '#fcae5a'};
  }
  &:disabled {
    background-color: #cccccc; opacity: 0.7; cursor: not-allowed;
  }
`;
const ErrorMessage = styled.p` /* ... (기존 정의 사용) */ `;


// --- NewLectureModal Props ---
interface NewLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLectureCreated: () => void; // 강의 생성 성공 시 호출될 콜백
}

// --- NewLectureModal Component ---
const NewLectureModal: React.FC<NewLectureModalProps> = ({ isOpen, onClose, onLectureCreated }) => {
  const [lectureName, setLectureName] = useState("");
  const [instructorId, setInstructorId] = useState<string>(""); // API는 숫자지만, input은 문자열
  const [day, setDay] = useState<string>(""); // 예: "Mon", "Tue" ...
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [location, setLocationInput] = useState(""); // input은 locationInput, API는 classroom
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시간 옵션 생성 (예: 00:00 ~ 23:30, 30분 간격)
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // schedule 문자열 조합 (요일 + 시간)
    // API가 "09:00~13:00" 형식이면 요일 정보는 어떻게? 일단 시간만 조합
    // 실제로는 요일 선택 + 시간 조합이 필요함 -> API 명세의 schedule 형식이 "Mon 09:00~10:00" 와 같다면
    const schedule = `${day} ${startTime}~${endTime}`;


    if (!lectureName || !instructorId || !day || !location) {
        setError("All fields are required.");
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await apiClient.post('/admin/lectures', {
        name: lectureName,
        instructor_id: parseInt(instructorId, 10), // 숫자로 변환
        schedule: schedule,
        classroom: location, // API 필드명은 classroom
      });

      console.log("Lecture created successfully:", response.data);
      alert(response.data.message || "Lecture successfully created!");
      onLectureCreated(); // 부모 컴포넌트에 알림
      onClose(); // 모달 닫기
      // 폼 필드 초기화
      setLectureName(""); setInstructorId(""); setDay("");
      setStartTime("09:00"); setEndTime("10:00"); setLocationInput("");

    } catch (err: any) {
      console.error("Failed to create lecture:", err);
      setError(err.response?.data?.detail || err.message || "Failed to create lecture.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>New Course</ModalTitle>
          <CloseButton onClick={onClose} title="Close">&times;</CloseButton>
        </ModalHeader>
        <ModalSubtitle>Service Introducing comment</ModalSubtitle> {/* 이미지 참고 */}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputWithIcon>
              <span className="material-symbols-outlined">menu_book</span>
              <StyledInput
                type="text"
                placeholder="Course Name"
                value={lectureName}
                onChange={(e) => setLectureName(e.target.value)}
                required
              />
            </InputWithIcon>
          </InputGroup>
          <InputGroup>
             <InputWithIcon>
              <span className="material-symbols-outlined">person</span>
              <StyledInput
                type="number" // instructor_id는 숫자이므로
                placeholder="Instructor ID"
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                required
              />
            </InputWithIcon>
          </InputGroup>

          {/* 스케줄 (요일 + 시간) */}
          <InputGroup>
             <InputWithIcon>
                <span className="material-symbols-outlined">calendar_month</span>
                <TimeSelect value={day} onChange={(e) => setDay(e.target.value)} required>
                    <option value="" disabled>Select Day</option>
                    {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </TimeSelect>
            </InputWithIcon>
          </InputGroup>
          <TimeSelectionGroup>
             <InputWithIcon style={{ flex:1 }}>
                <span className="material-symbols-outlined">schedule</span>
                <TimeSelect value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
                    {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                </TimeSelect>
            </InputWithIcon>
             <span>-</span>
             <InputWithIcon style={{ flex:1 }}>
                <span className="material-symbols-outlined">schedule</span>
                <TimeSelect value={endTime} onChange={(e) => setEndTime(e.target.value)} required>
                    {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                </TimeSelect>
            </InputWithIcon>
          </TimeSelectionGroup>

          <InputGroup>
            <InputWithIcon>
              <span className="material-symbols-outlined">location_on</span>
              <StyledInput
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocationInput(e.target.value)}
                required
              />
            </InputWithIcon>
          </InputGroup>

          {error && <ErrorMessage style={{textAlign: 'center'}}>{error}</ErrorMessage>}

          <CreateButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </CreateButton>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NewLectureModal;