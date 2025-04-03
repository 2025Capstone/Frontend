import React, { useState, ChangeEvent } from "react";
import axios from "axios";

const UploadVideo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lectureId, setLectureId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleLectureIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLectureId(e.target.value);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !lectureId || !title) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lecture_id", lectureId);
    formData.append("title", title);

    try {
      const response = await axios.post("http://localhost:8000/videos/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      setResult({ error: (error as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>비디오 업로드</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Lecture ID: </label>
        <input type="text" value={lectureId} onChange={handleLectureIdChange} placeholder="예: 1" />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Title: </label>
        <input type="text" value={title} onChange={handleTitleChange} placeholder="강의 제목" />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>File: </label>
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </div>
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "업로드 중..." : "업로드"}
      </button>
      {uploading && <p>업로드 진행: {uploadProgress}%</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <h3>업로드 결과</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
