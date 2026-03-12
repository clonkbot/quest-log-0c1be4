import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function OnboardingScreen() {
  const createProfile = useMutation(api.profiles.createProfile);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    try {
      await createProfile({ displayName: displayName.trim() });
    } catch (err) {
      console.error("Failed to create profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-pattern flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="animate-fade-in-up">
          <span className="text-6xl md:text-7xl block mb-4">⚔️</span>
          <h1 className="font-pixel text-xl md:text-2xl text-cyan-400 text-glow-cyan mb-2">
            WELCOME, HERO
          </h1>
          <p className="font-body text-lavender-300 mb-8">
            Before your quest begins, what shall we call you?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel p-6 md:p-8 animate-fade-in-up stagger-2">
          <label className="font-body text-sm text-lavender-300 block mb-2 text-left">
            Your Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-arcade w-full px-4 py-3 rounded-lg font-body text-white placeholder-lavender-500 mb-4"
            placeholder="Enter your hero name..."
            maxLength={30}
            required
          />

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="btn-primary w-full py-3 rounded-lg font-pixel text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING..." : "BEGIN ADVENTURE"}
          </button>
        </form>

        <p className="text-center mt-8 font-body text-xs text-lavender-600 animate-fade-in-up stagger-3">
          Requested by @maxsofm · Built by @clonkbot
        </p>
      </div>
    </div>
  );
}
