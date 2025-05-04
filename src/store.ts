import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // persist import 추가

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// persist 미들웨어를 사용하여 스토어 생성
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // 초기 상태 값 (이제 스토리지에서 로드됨)
      isDark: false, // 스토리지에 값이 없으면 이 기본값이 사용됨
      // 상태를 변경하는 액션 함수
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-preference-storage', // localStorage에 저장될 고유 키 이름
      // getStorage: () => sessionStorage, // sessionStorage를 사용하려면 이 주석 해제
    }
  )
);