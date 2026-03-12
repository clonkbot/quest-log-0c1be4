import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-pattern flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="text-4xl md:text-5xl">🎮</span>
          </div>
          <h1 className="font-pixel text-xl md:text-2xl text-cyan-400 text-glow-cyan mb-2">
            QUEST LOG
          </h1>
          <p className="font-body text-lavender-300 text-sm md:text-base opacity-80">
            Level up your habits, one XP at a time
          </p>
        </div>

        {/* Auth Form */}
        <div className="panel p-6 md:p-8 animate-fade-in-up stagger-2">
          <h2 className="font-pixel text-sm text-gold-400 text-glow-gold mb-6 text-center">
            {flow === "signIn" ? "SIGN IN" : "CREATE ACCOUNT"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-sm text-lavender-300 block mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="input-arcade w-full px-4 py-3 rounded-lg font-body text-white placeholder-lavender-500"
                placeholder="hero@quest.log"
              />
            </div>

            <div>
              <label className="font-body text-sm text-lavender-300 block mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="input-arcade w-full px-4 py-3 rounded-lg font-body text-white placeholder-lavender-500"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="font-body text-sm text-red-400 text-center bg-red-400/10 py-2 rounded">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-lg font-pixel text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "LOADING..." : flow === "signIn" ? "START QUEST" : "JOIN ADVENTURE"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="font-body text-sm text-lavender-400 hover:text-cyan-400 transition-colors"
            >
              {flow === "signIn"
                ? "New player? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lavender-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#12121a] px-4 font-body text-xs text-lavender-500">
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={loading}
            className="btn-secondary w-full py-3 rounded-lg font-body text-sm disabled:opacity-50"
          >
            Continue as Guest
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 font-body text-xs text-lavender-600 animate-fade-in-up stagger-3">
          Requested by @maxsofm · Built by @clonkbot
        </p>
      </div>
    </div>
  );
}
