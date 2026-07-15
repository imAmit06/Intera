import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react";
import WelcomeSection from "../components/WelcomeSection.jsx";
import StatsCards from "../components/StatsCards.jsx";
import ActiveSessions from "../components/ActiveSessions.jsx";
import CreateSessionModal from "../components/CreateSessionModal.jsx";
import RecentSessions from "../components/RecentSessions.jsx";
import {
  useCreateSession,
  useActiveSession,
  useMyRecentSessions,
} from "../hooks/useSessions.js";
import { toast } from "react-hot-toast";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

  const createSessionMutation = useCreateSession();
  const { data: activeSessionData, isLoading: loadingActiveSessions } =
    useActiveSession();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } =
    useMyRecentSessions();

  const handleCreateSession = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) {
      toast.error("One or more fields are empty");
      return;
    }

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      },
    );
  };

  const activeSession = activeSessionData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;
    return (
      session.host?.clerkId === user.id ||
      session.participant?.clerkId === user.id
    );
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* GRID LAYOUT */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSession.length}
              recentSessionsCount={recentSessions.length}
            />
            <ActiveSessions
              sessions={activeSession}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>
          <RecentSessions
            sessions={recentSessions}
            isLoading={loadingRecentSessions}
          />
        </div>
      </div>
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateSession}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
};

export default DashboardPage;
