import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import apiClient from "../../api/apiClient";

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  min-height: 100vh;
`;

const UploadBox = styled.div`
  background-color: ${(props) => props.theme.formContainerColor};
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 15px 10px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.subTextColor};
  flex: 1;
`;

const FileIconButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  cursor: pointer;
  background-color: ${(props) => props.theme.subTextColor};
  color: ${(props) => props.theme.backgroundColor};
  border-radius: 8px;
  transition: background-color 0.3s;
  margin-left: 10px;

  &:hover {
    background-color: ${(props) => props.theme.textColor};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileName = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: ${(props) => props.theme.subTextColor};
  margin-bottom: 30px;
`;

const Button = styled.button`
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  background-color: ${(props) => props.theme.btnColor};
  color: ${(props) => props.theme.textColor};
  border: none;
  border-radius: 8px;
  transition: background-color 0.3s;
  width: 100%;

  &:hover {
    background-color: ${(props) => props.theme.hoverBtnColor};
  }

  &:disabled {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
  }
`;

// --- Loader Components ---

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  flex-direction: column;
`;

const Spinner = styled.div`
  border: 8px solid ${(props) => props.theme.formContainerColor};
  border-top: 8px solid ${(props) => props.theme.highlightColor};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1.5s linear infinite;
`;

const LoaderText = styled.p`
  color: white;
  font-size: 1.2rem;
  margin-top: 20px;
`;

// --- Component ---

const RecordingDetail: React.FC = () => {
  const { id: lectureId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim() || !lectureId) {
      alert("Please provide a title and select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);
    formData.append("lecture_id", lectureId);
    formData.append("title", videoTitle);

    setIsUploading(true);
    try {
      const response = await apiClient.post(
        "/instructors/upload-video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload successful!", response.data);
      alert("Upload successful!");
      navigate("/instructor/courses"); // Redirect after success
    } catch (error) {
      console.error("Upload failed!", error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const isButtonDisabled = !selectedFile || !videoTitle.trim() || isUploading;

  return (
    <>
      {isUploading && (
        <LoaderOverlay>
          <Spinner />
          <LoaderText>Uploading video...</LoaderText>
        </LoaderOverlay>
      )}
      <Container>
        <UploadBox>
          <Title>Upload Video</Title>
          <InputGroup>
            <Input
              type="text"
              placeholder="Enter video title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <FileIconButton
              htmlFor="file-upload"
              className="material-symbols-outlined"
            >
              videocam
            </FileIconButton>
          </InputGroup>
          <HiddenFileInput
            id="file-upload"
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
          />
          {selectedFile && <FileName>Selected: {selectedFile.name}</FileName>}
          <Button onClick={handleUpload} disabled={isButtonDisabled}>
            Upload Video
          </Button>
        </UploadBox>
      </Container>
    </>
  );
};

export default RecordingDetail;
