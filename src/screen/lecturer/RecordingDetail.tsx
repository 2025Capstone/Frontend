import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';

// 스타일드 컴포넌트
const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 40px;
  margin-bottom: 20px;
`;

const VideoElement = styled.video`
  width: 600px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #1f6feb;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0d4db8;
  }
`;

const DownloadLink = styled.a`
  display: inline-block;
  margin-top: 20px;
  font-size: 16px;
  color: #1f6feb;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Message = styled.p`
  font-size: 16px;
  margin-top: 20px;
  color: #555;
`;


const RecordingDetail: React.FC = () => {
  // URL 파라미터에서 강의 id를 추출 (타입은 string)
  const { id } = useParams<{ id: string }>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEncoding, setIsEncoding] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // ffmpeg 인스턴스 생성
  const ffmpeg = createFFmpeg({ log: true });

  const loadFFmpeg = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
  };

  

  // stream 상태 변경 시 video element에 연결
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // 웹캠 활성화 및 녹화 시작
  const startRecording = async () => {
    setDownloadUrl(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setIsRecording(true);
      recordedChunksRef.current = [];

      const options = { mimeType: "video/webm" };
      const mediaRecorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });

        try {
          // ffmpeg 로드
          setIsEncoding(true);
          await loadFFmpeg();

          ffmpeg.FS("writeFile", "input.webm", await fetchFile(webmBlob));

          await ffmpeg.run("-i", "input.webm", "-c:v", "libx264", "-c:a", "aac", "output.mp4");

          const data = ffmpeg.FS("readFile", "output.mp4");

          const mp4Blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
          const url = URL.createObjectURL(mp4Blob);
          setDownloadUrl(url);
          console.log(url);
        } catch (error) {
          console.error("mp4 변환 오류", error);
        } finally {
          setIsEncoding(false);
        }

      };

      mediaRecorder.start();
    } catch (error) {
      console.error("웹캠 접근 오류:", error);
    }
  };

  // 녹화 종료: 스트림 정지 및 업로드 API 호출(여기서는 콘솔로 시뮬레이션)
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    console.log("녹화 종료 및 영상 업로드 (시뮬레이션)");
  };

  return (
    <Container>
      <Title>강의 {id} 녹화 페이지</Title>
      {isRecording ? (
        <>
          <VideoElement ref={videoRef} autoPlay playsInline />
          <Button onClick={stopRecording}>녹화 종료</Button>
        </>
      ) : (
        <>
          <Button onClick={startRecording}>강의 녹화 시작</Button>
          {isEncoding && <Message>영상 인코딩 중...</Message>}
          {downloadUrl && (
            <DownloadLink href={downloadUrl} download={`lecture-${id}.mp4`}>
            녹화 영상 다운로드
          </DownloadLink>
          )}
        </>
      )}
    </Container>
  );
};

export default RecordingDetail;
