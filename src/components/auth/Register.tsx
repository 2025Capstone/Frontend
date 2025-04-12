import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../../src/firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pw
      );
      console.log("가입 성공:", userCredential.user);
    } catch (err) {
      console.error("가입 실패:", err);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
      />
      <input
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="비밀번호"
        type="password"
      />
      <button onClick={handleRegister}>가입하기</button>
    </div>
  );
}
