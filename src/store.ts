import { create } from 'zustand';

// 스토어의 상태와 액션 타입을 정의 (선택 사항이지만 권장)
interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// 스토어 생성
export const useThemeStore = create<ThemeState>((set) => ({
  // 초기 상태 값
  isDark: false, // Recoil의 default와 동일
  // 상태를 변경하는 액션 함수
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));