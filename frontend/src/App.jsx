import {
  Show,
  UserButton,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/react";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import ProblemPage from "./pages/ProblemsPage.jsx";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />}
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />}
        />
      </Routes>
      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
