import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const result = useMutation({
    queryKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => {
      toast.success("Session created successfully");
    },
    onError: (error) => {
      toast.error(`${error.response?.data?.msg || "Failed to create session"}`);
    },
  });
  return result;
};

export const useActiveSession = () => {
  const result = useQuery({
    queryKey: ["activeSession"],
    queryFn: sessionApi.getActiveSession,
  });
  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });
  return result;
};

export const useSessionById = (sessionId) => {
  const result = useQuery({
    queryKey: ["sessionById", sessionId],
    queryFn: () => sessionApi.getSessionById(sessionId),
    enabled: !!sessionId,
    refetchInterval: 5000,
  });
  return result;
};

export const useJoinSession = () => {
  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully"),
    onError: (error) =>
      toast.error(`${error.response?.data?.msg || "Failed to join session"}`),
  });
  return result;
};

export const useEndSession = () => {
  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully"),
    onError: (error) =>
      toast.error(`${error.response?.data?.msg || "Failed to end session"}`),
  });
  return result;
};
