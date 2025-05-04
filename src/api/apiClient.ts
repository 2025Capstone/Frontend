//api사용 시 apiClient.get이런식으로 호출해야 함
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../authStore"; // Zustand 스토어 import 경로 확인

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// --- 요청 인터셉터 (변경 없음) ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 응답 인터셉터 (수정) ---
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // 이제 일반 Error 타입도 받을 수 있음
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 재시도 요청이 아니며, 요청 설정이 있는 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest
    ) {
      if (isRefreshing) {
        // 갱신 중 큐잉 로직 (변경 없음)
        return new Promise((resolve, reject) => {
          /* ... */
        });
      }

      console.log(
        "Original request failed with 401. Attempting token refresh."
      );
      originalRequest._retry = true;
      isRefreshing = true;

      // !!! 역할(Role)과 리프레시 토큰 가져오기 !!!
      const { userRole, refreshToken, setTokens, logout } =
        useAuthStore.getState();

      if (!refreshToken) {
        console.error("Refresh token not found. Logging out.");
        logout();
        isRefreshing = false;
        processQueue(error, null);
        return Promise.reject(error);
      }

      // !!! 역할(Role)에 따라 Refresh URL 결정 !!!
      let refreshUrl = "";
      switch (userRole) {
        case "student":
          refreshUrl = "/auth/refresh"; // 학생용 갱신 URL (상대 경로)
          break;
        case "instructor":
          refreshUrl = "/instructors-auth/refresh"; // 강의자용 갱신 URL (상대 경로)
          break;
        case "admin":
          refreshUrl = "/auth/admin-refresh"; // 관리자용 갱신 URL (상대 경로)
          break;
        default:
          console.error(
            `Unknown user role (${userRole}) for token refresh. Logging out.`
          );
          logout();
          isRefreshing = false;
          processQueue(new Error("Unknown user role for refresh"), null);
          return Promise.reject(new Error("Unknown user role"));
      }

      try {
        console.log(
          `Attempting token refresh for role: ${userRole} at ${refreshUrl}`
        );

        // !!! 결정된 URL로 토큰 갱신 요청 !!!
        const refreshResponse = await axios.post(
          refreshUrl, // 동적으로 결정된 URL 사용
          { refresh_token: refreshToken },
          {
            baseURL: apiClient.defaults.baseURL, // apiClient의 baseURL 사용 확인
            headers: {
              // 필요한 헤더 명시
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        const { access_token: newAccessToken, refresh_token: newRefreshToken } =
          refreshResponse.data;

        if (!newAccessToken) {
          throw new Error("Refresh response did not contain new access token.");
        }

        console.log("Token refresh successful.");
        // 스토어에 새 토큰 저장
        setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        // 원래 요청 헤더에 새 토큰 설정
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken); // 큐 처리
        return apiClient(originalRequest); // 원래 요청 재시도
      } catch (refreshError: any) {
        console.error(
          "Failed to refresh token:",
          refreshError?.response?.data || refreshError.message
        );
        logout(); // 리프레시 실패 시 로그아웃
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 401 에러가 아니거나 이미 재시도한 경우
    return Promise.reject(error);
  }
);

export default apiClient;
