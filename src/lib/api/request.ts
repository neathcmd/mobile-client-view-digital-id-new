import axios, { type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  // timeout: 1000,
});

interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
}

const refreshAndRetryQueue: RetryQueueItem[] = [];
let isRefreshing = false;

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    config.headers["Authorization"] = `${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalConfig: AxiosRequestConfig = error.config;
    if (error.response && error.response.status === 401) {
      if (!isRefreshing) {
        try {
          const response = await axiosInstance({
            method: "POST",
            url: `${BASE_URL}/auth/refresh-token`,
          });
          const { accessToken } = response.data;
          Cookies.set("accessToken", accessToken);
          error.config.headers["Authorization"] = `Bearer ${accessToken}`;

          // Retry all requests in the queue with the new token
          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            axiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err) => reject(err));
          });

          // Clear the queue
          refreshAndRetryQueue.length = 0;

          return await axiosInstance(originalConfig);
        } catch (refreshError: any) {
          if (refreshError.response && refreshError.response.data) {
            console.log("error 1");

            return Promise.reject(refreshError.response.data);
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      // Add the original request to the queue
      return new Promise<void>((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalConfig, resolve, reject });
      });
    }
    if (error.response && error.response.status === 403) {
      // Call the function to log out the user
      console.log("error 2");

      return Promise.reject(error.response.data);
    }
    // Handle specific error cases here if needed
    return Promise.reject(error);
  }
);

export default axiosInstance;
