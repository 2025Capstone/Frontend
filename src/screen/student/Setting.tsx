// src/screen/student/Setting.tsx (완성)
import React, { useState, useEffect, useRef } from "react"; // useRef 추가
import styled from "styled-components";
import apiClient from "../../api/apiClient"; // 경로 확인 필요

// --- Styled Components ---

const SettingsContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
`;

const Breadcrumb = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 30px;
`;

const ProfileCard = styled.div`
  background-color: ${(props) => props.theme.formContainerColor || "white"};
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

// 이미지 컨테이너를 label로 사용하여 클릭 시 파일 입력 트리거
const ProfileImageLabel = styled.label`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer; /* 클릭 가능 표시 */
  position: relative; /* 아이콘 오버레이 위함 */

  &:hover::after {
    /* 호버 시 수정 아이콘 표시 (선택 사항) */
    content: "edit"; /* Material Symbols 아이콘 이름 */
    font-family: "Material Symbols Outlined"; /* Material Symbols 폰트 적용 */
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    font-variation-settings: "FILL" 1; // 아이콘 채우기
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.span`
  font-size: 80px;
  color: #ccc;
`;

const ProfileForm = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => props.theme.textColor};
`;

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
  &:read-only {
    background-color: #f0f0f0;
    cursor: not-allowed;
    opacity: 0.7;
  }
  &:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

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
  margin-top: 10px;
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
  padding: 40px;
  text-align: center;
  color: ${(props) => props.theme.subTextColor};
`;
const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.85rem;
`;
const ImageUploadMessage = styled.p`
  font-size: 0.85rem;
  text-align: center;
  margin-top: 10px;
  color: ${(props) => props.theme.subTextColor};
`;

// --- Profile 데이터 타입 ---
interface ProfileData {
  email: string;
  name: string | null;
  profile_image_url: string | null;
}

// --- Setting Component (Student) ---
const StudentSetting = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [nameInput, setNameInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState<boolean>(false); // 이름 저장 로딩
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false); // 이미지 업로드 로딩
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // 이미지 미리보기 URL

  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 input 참조

  // 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ProfileData>("/students/profile");
        setProfileData(response.data);
        setNameInput(response.data.name || "");
        // 프로필 이미지 URL 초기화 (미리보기 제거)
        setImagePreviewUrl(null);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- 이름 업데이트 핸들러 ---
  const handleNameUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 변경 사항 없으면 실행 안 함
    if (nameInput === (profileData?.name || "")) return;

    setIsSavingName(true);
    setError(null);
    try {
      const response = await apiClient.patch<{ message: string; name: string }>(
        "/students/profile/name",
        { name: nameInput }
      );
      // 로컬 상태 업데이트
      setProfileData((prev) =>
        prev ? { ...prev, name: response.data.name } : null
      );
      alert(response.data.message || "Name updated successfully!");
    } catch (err: any) {
      console.error("Failed to update name:", err);
      setError(err.message || "Failed to update name.");
    } finally {
      setIsSavingName(false);
    }
  };

  // --- 파일 선택 핸들러 ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 이미지 업로드 즉시 실행
      uploadProfileImage(file);
    }
    // 파일 선택 취소 시 값 초기화 (중요)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- 이미지 업로드 함수 ---
  const uploadProfileImage = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file); // API가 요구하는 필드 이름 'file'

    try {
      const response = await apiClient.post<{ profile_image_url: string }>(
        "/students/profile/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } } // multipart 헤더 명시 (Axios가 자동 설정할 수도 있음)
      );

      // 성공 시 로컬 상태 업데이트
      setProfileData((prev) =>
        prev
          ? { ...prev, profile_image_url: response.data.profile_image_url }
          : null
      );
      setImagePreviewUrl(null); // 미리보기 제거
      alert("Profile image updated successfully!");
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      setError(err.message || "Failed to upload image.");
      setImagePreviewUrl(null); // 실패 시 미리보기 제거
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (loading) return <MessageContainer>Loading profile...</MessageContainer>;
  // 초기 로딩 실패 시 에러 표시
  if (error && !profileData)
    return (
      <MessageContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </MessageContainer>
    );
  if (!profileData)
    return <MessageContainer>No profile data found.</MessageContainer>;

  console.log("Profile Data State:", profileData); // <-- 2. 상태 값 확인
  // 표시할 이미지 URL 결정 (미리보기 > 프로필 데이터 > null)
  const displayImageUrl = imagePreviewUrl || profileData.profile_image_url;
  console.log("Display Image URL:", displayImageUrl);

  return (
    <SettingsContainer>
      <Breadcrumb>Setting &gt; Profile</Breadcrumb>
      <ProfileCard>
        <ProfileImageLabel htmlFor="fileInput">
          {displayImageUrl ? (
            <ProfileImage
              src={displayImageUrl}
              alt="Profile"
              crossOrigin="anonymous"
            />
          ) : (
            <DefaultAvatar className="material-symbols-outlined">
              account_circle
            </DefaultAvatar>
          )}
        </ProfileImageLabel>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        {isUploadingImage && (
          <ImageUploadMessage>Uploading Image...</ImageUploadMessage>
        )}

        <ProfileForm onSubmit={handleNameUpdate}>
          <FormGroup>
            <Label htmlFor="email">E-mail</Label>
            <StyledInput
              id="email"
              type="email"
              value={profileData.email}
              readOnly
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <StyledInput
              id="name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={isSavingName}
            />
          </FormGroup>

          <SaveButton type="submit" disabled={isSavingName}>
            {isSavingName ? "Saving..." : "Save"}
          </SaveButton>
        </ProfileForm>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ProfileCard>
    </SettingsContainer>
  );
};

export default StudentSetting;
