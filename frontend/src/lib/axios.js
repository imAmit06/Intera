import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let interceptorId = null;

export const setupAxiosAuth = (getToken) => {
  // If an interceptor is already registered, remove it first
  if (interceptorId !== null) {
    axiosInstance.interceptors.request.eject(interceptorId);
  }

  interceptorId = axiosInstance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export default axiosInstance;
