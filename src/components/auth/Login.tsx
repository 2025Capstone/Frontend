// src/components/Login.tsx
import { auth } from "../../../src/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pw);
      const token = await userCredential.user.getIdToken();
      console.log("로그인 성공:", token); // 이 토큰을 FastAPI로 보내면 돼
    } catch (err) {
      console.error("로그인 실패:", err);
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" />
      <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" type="password" />
      <button onClick={handleLogin}>로그인</button>
    </div>
  );
}
