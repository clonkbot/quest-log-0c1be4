import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import "./styles.css";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.getProfile);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="font-pixel text-cyan-400 text-sm animate-pulse">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  if (profile === null) {
    return <OnboardingScreen />;
  }

  return <Dashboard profile={profile} />;
}

export default App;
