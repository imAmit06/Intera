import axiosInstance from "../lib/axios.js";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSession: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },

  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (sessionId) => {
    const response = await axiosInstance.get(`/sessions/${sessionId}`);
    return response.data;
  },

  joinSession: async (sessionId) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/join`);
    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await axiosInstance.post(`/sessions/${sessionId}/end`);
    return response.data;
  },

  getStreamToken: async () => {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
  },
};
