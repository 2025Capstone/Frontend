// src/components/Login.tsx
import { auth } from "../../../src/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // QR 코드 라이브러리 import
import axios from 'axios'; // 백엔드 통신을 위한 axios import (fetch 사용 가능)

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null); // Firebase ID 토큰 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태 추가

  // FastAPI 백엔드로 토큰을 전송하는 함수
  const sendTokenToBackend = async (token: string) => {
    // FastAPI 엔드포인트 URL을 실제 환경에 맞게 수정하세요.
    const backendUrl = "http://localhost:8000/verify-token"; // 예시 URL

    try {
      console.log("FastAPI 백엔드로 토큰 전송 시작:", token);
      // 헤더에 Bearer 토큰 형태로 전송하거나, body에 담아 전송할 수 있습니다.
      // FastAPI 구현 방식에 맞춰주세요. 여기서는 Authorization 헤더 사용 예시
      const response = await axios.post(
        backendUrl,
        {}, // FastAPI에서 body를 요구하지 않으면 빈 객체 전달
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // 필요시 설정
          },
        }
      );

      console.log("백엔드 응답:", response.data);
      // 백엔드로부터 받은 추가 데이터 처리 (예: 사용자 정보 업데이트 등)

    } catch (err) {
      console.error("백엔드 토큰 전송 실패:", err);
      setError("백엔드 처리 중 오류가 발생했습니다.");
      // 백엔드 통신 실패 시 QR 코드를 숨기거나 다른 처리를 할 수 있습니다.
      setFirebaseToken(null); // 예: 실패 시 QR 코드 숨김
    }
  };

  const handleLogin = async () => {
    setIsLoading(true); // 로딩 시작
    setError(null); // 이전 에러 초기화
    setFirebaseToken(null); // 이전 토큰/QR 코드 초기화

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pw);
      const token = await userCredential.user.getIdToken();
      console.log("Firebase 로그인 성공, ID Token:", token);

      // 1. 상태에 토큰 저장 (QR 코드 생성을 위해)
      setFirebaseToken(token);

      // 2. FastAPI 백엔드로 토큰 전송
    //   await sendTokenToBackend(token);

    } catch (err: any) { // 타입 명시 (FirebaseError 등)
      console.error("Firebase 로그인 실패:", err);
      // Firebase 에러 코드에 따라 구체적인 메시지 표시 가능
      setError(`로그인 실패: ${err.message || '알 수 없는 오류'}`);
      setFirebaseToken(null); // 실패 시 토큰 상태 초기화
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          type="email" // 타입 명시
          disabled={isLoading} // 로딩 중 비활성화
        />
      </div>
      <div>
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          type="password"
          disabled={isLoading} // 로딩 중 비활성화
        />
      </div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </button>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 로그인 성공 및 토큰 수신 시 QR 코드 표시 */}
      {firebaseToken && !isLoading && !error && ( // 로딩 중이 아니고 에러가 없을 때만 표시
        <div style={{ marginTop: "20px" }}>
          <h3>웨어러블 기기 로그인</h3>
          <p>아래 QR 코드를 웨어러블 기기로 스캔하여 로그인하세요.</p>
          <QRCodeCanvas
            value={firebaseToken} // QR 코드에 Firebase ID 토큰 포함
            size={256} // QR 코드 크기 조절
            level={"H"} // 에러 복원 레벨 (L, M, Q, H)
            includeMargin={true} // 여백 포함 여부
          />
          {/* <p style={{ wordBreak: 'break-all', marginTop: '10px', maxWidth: '256px' }}>토큰: {firebaseToken}</p> */}
          {/* 토큰 직접 표시는 보안상 좋지 않을 수 있으므로 주석 처리 */}
        </div>
      )}
    </div>
  );
}