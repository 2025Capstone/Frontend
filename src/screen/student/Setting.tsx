// src/screen/student/Setting.tsx (새 파일 또는 기존 파일 수정)
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiClient from "../../api/apiClient"; // 경로 확인 필요

// --- Styled Components ---

const SettingsContainer = styled.div`
  width: 100%;
  max-width: 700px; /* 최대 너비 설정 */
  margin: 0 auto; /* 페이지 중앙 정렬 */
  padding: 20px;
`;

const Breadcrumb = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 30px; /* 하단 요소와의 간격 */
`;

const ProfileCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center; /* 내용 중앙 정렬 */
  gap: 30px; /* 이미지와 폼 사이 간격 */
`;

const ProfileImageContainer = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%; /* 원형 이미지 */
  overflow: hidden;
  background-color: #eee; /* 이미지 없을 때 배경색 */
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid white; /* 흰색 테두리 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지 비율 유지 */
`;

// 기본 아바타 아이콘 스타일
const DefaultAvatar = styled.span`
  font-size: 80px; /* 아이콘 크기 */
  color: #ccc; /* 아이콘 색상 */
`;

const ProfileForm = styled.form`
  width: 100%;
  max-width: 400px; /* 폼 너비 제한 */
  display: flex;
  flex-direction: column;
  gap: 20px; /* 폼 그룹 간 간격 */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 라벨과 인풋 사이 간격 */
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
`;

// 기존 Input 스타일 재사용 또는 약간 수정
const StyledInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  color: ${(props) => props.theme.textColor};
  transition: border-color 0.2s ease-in-out, background-color 0.3s ease;

  &::placeholder {
    color: ${(props) => props.theme.subTextColor};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.btnColor};
    box-shadow: 0 0 0 2px ${(props) => props.theme.btnColor}4D;
  }

  /* 읽기 전용 스타일 */
  &:read-only {
    background-color: #f0f0f0; /* 회색 배경 */
    cursor: not-allowed;
    opacity: 0.7;
  }
  &:disabled {
    /* 혹시 disabled 사용할 경우 대비 */
    background-color: #f0f0f0;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// 기존 버튼 스타일 재사용
const SaveButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px; /* 위 요소와의 간격 */
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor || "#fcae5a"};
    box-shadow: 0 4px 10px ${(props) => props.theme.btnColor}66;
  }
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const MessageContainer = styled.div`
  /* 로딩/에러 */
`;
const ErrorMessage = styled.p`
  /* 에러 메시지 */
`;

// --- Profile 데이터 타입 정의 ---
interface ProfileData {
  email: string;
  name: string | null;
  profile_image_url: string | null;
}

// --- Setting Component (Student) ---
const StudentSetting = () => {
  // 컴포넌트 이름 변경 (라우터 설정과 일치시키기 위해)
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [nameInput, setNameInput] = useState<string>(""); // 이름 입력 상태
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false); // 저장 로딩 상태

  // 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ProfileData>("/students/profile");
        setProfileData(response.data);
        // API에서 받은 이름으로 nameInput 초기화 (null이면 빈 문자열)
        setNameInput(response.data.name || "");
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 프로필 업데이트 핸들러 (API 명세 필요)
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 기본 제출 방지
    setIsSaving(true);
    setError(null);

    console.log("Attempting to update profile with name:", nameInput);
    alert("프로필 저장 API가 아직 정의되지 않았습니다."); // 임시 알림

    // TODO: 프로필 업데이트 API 호출 로직 구현 필요
    // try {
    //   await apiClient.patch('/students/profile', { // 예시: PATCH 메서드 사용
    //     name: nameInput,
    //     // profile_image_url 업데이트 로직은 별도 필요 (파일 업로드 등)
    //   });
    //   alert("Profile updated successfully!");
    //   // 성공 시 profileData 상태 업데이트 또는 다시 fetch
    //   setProfileData(prev => prev ? {...prev, name: nameInput} : null);
    // } catch (err: any) {
    //   console.error("Failed to update profile:", err);
    //   setError(err.message || "Failed to update profile.");
    // } finally {
    //   setIsSaving(false);
    // }

    // 임시로 로딩 상태 해제
    setTimeout(() => setIsSaving(false), 500);
  };

  if (loading) return <MessageContainer>Loading profile...</MessageContainer>;
  if (error)
    return (
      <MessageContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </MessageContainer>
    );
  if (!profileData)
    return <MessageContainer>No profile data found.</MessageContainer>;

  return (
    <SettingsContainer>
      <Breadcrumb>&gt; Profile</Breadcrumb>

      <ProfileCard>
        <ProfileImageContainer>
          {profileData.profile_image_url ? (
            <ProfileImage src={profileData.profile_image_url} alt="Profile" />
          ) : (
            // 프로필 이미지 없으면 기본 아바타 아이콘 표시
            <DefaultAvatar className="material-symbols-outlined">
              account_circle
            </DefaultAvatar>
          )}
          {/* TODO: 이미지 업로드 버튼/기능 추가 */}
        </ProfileImageContainer>

        <ProfileForm onSubmit={handleProfileUpdate}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <StyledInput
              id="username"
              type="text"
              placeholder="Enter Username"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <StyledInput
              id="email"
              type="email"
              value={profileData.email}
              readOnly // 이메일은 수정 불가 (readOnly 사용)
            />
          </FormGroup>

          {/* 저장 버튼 */}
          <SaveButton
            type="submit"
            disabled={isSaving || nameInput === (profileData.name || "")}
          >
            {isSaving ? "Saving..." : "Save"}
          </SaveButton>
          {/* 저장 실패 시 에러 메시지 표시 */}
          {error && !loading && (
            <ErrorMessage style={{ textAlign: "center", marginTop: "10px" }}>
              {error}
            </ErrorMessage>
          )}
        </ProfileForm>
      </ProfileCard>
    </SettingsContainer>
  );
};

// 컴포넌트 이름 확인 (라우터 설정과 일치 필요)
export default StudentSetting;
