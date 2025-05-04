// src/store/authStore.ts (수정)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'instructor' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  accessToken: string | null; // 백엔드 JWT Access Token
  refreshToken: string | null; // 백엔드 JWT Refresh Token
  // 토큰만 업데이트하는 액션 (토큰 갱신 시 사용)
  setTokens: (tokens: { accessToken: string | null; refreshToken: string | null }) => void;
  // 전체 인증 정보 설정 액션 (로그인 시 사용)
  setAuthInfo: (data: { isAuthenticated: boolean; userRole: UserRole; accessToken: string | null; refreshToken: string | null }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userRole: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (tokens) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
      setAuthInfo: (data) => set({
        isAuthenticated: data.isAuthenticated,
        userRole: data.userRole,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }),
      logout: () => {
        // TODO: 필요시 Firebase 로그아웃
        set({ isAuthenticated: false, userRole: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage', // 스토리지 키 이름
    }
  )
);