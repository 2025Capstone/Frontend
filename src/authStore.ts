import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 로컬/세션 스토리지 연동 (선택 사항)

// 사용자 역할 타입 정의 (null 포함)
export type UserRole = 'student' | 'instructor' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  token: string | null; // Firebase 또는 API 토큰 저장
  setAuthState: (data: { isAuthenticated: boolean; userRole: UserRole; token: string | null }) => void;
  logout: () => void;
}

// persist 미들웨어 사용 예시 (localStorage에 저장)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userRole: null,
      token: null,
      setAuthState: (data) => set({
        isAuthenticated: data.isAuthenticated,
        userRole: data.userRole,
        token: data.token,
      }),
      logout: () => {
        // TODO: 필요시 Firebase 로그아웃 추가
        // import { signOut } from "firebase/auth";
        // import { auth } from "../firebase"; // 경로 주의
        // signOut(auth).catch(error => console.error("Firebase signout error:", error));
        set({ isAuthenticated: false, userRole: null, token: null });
        // TODO: 로그아웃 후 로그인 페이지로 이동 로직 추가 (컴포넌트 내에서 navigate 사용 권장)
      },
    }),
    {
      name: 'auth-storage', // localStorage에 저장될 때 사용될 키 이름
    }
  )
);