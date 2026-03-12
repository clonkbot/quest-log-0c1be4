import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "main" | "bonus";
}

export function AddTaskModal({ isOpen, onClose, type }: AddTaskModalProps) {
  const createMainTask = useMutation(api.tasks.createMainTask);
  const createBonusTask = useMutation(api.tasks.createBonusTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(type === "main" ? 50 : 25);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (type === "main") {
        await createMainTask({
          title: title.trim(),
          description: description.trim() || undefined,
          xpReward,
        });
      } else {
        await createBonusTask({
          title: title.trim(),
          description: description.trim() || undefined,
          xpReward,
        });
      }

      setTitle("");
      setDescription("");
      setXpReward(type === "main" ? 50 : 25);
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="panel p-6 w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-pixel text-sm ${type === "main" ? "text-cyan-400" : "text-magenta-400"}`}>
            {type === "main" ? "NEW DAILY QUEST" : "NEW BONUS QUEST"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-lavender-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-sm text-lavender-300 block mb-2">
              Quest Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-arcade w-full px-4 py-3 rounded-lg font-body text-white placeholder-lavender-500"
              placeholder="e.g., Morning workout"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="font-body text-sm text-lavender-300 block mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-arcade w-full px-4 py-3 rounded-lg font-body text-white placeholder-lavender-500"
              placeholder="e.g., 30 minutes of cardio"
              maxLength={200}
            />
          </div>

          <div>
            <label className="font-body text-sm text-lavender-300 block mb-2">
              XP Reward
            </label>
            <div className="flex gap-2">
              {[10, 25, 50, 75, 100].map((xp) => (
                <button
                  key={xp}
                  type="button"
                  onClick={() => setXpReward(xp)}
                  className={`flex-1 py-2 rounded-lg font-pixel text-xs transition-all ${
                    xpReward === xp
                      ? "bg-cyan-500 text-[#0a0a0f]"
                      : "bg-[#1a1a24] text-lavender-400 hover:bg-[#222230]"
                  }`}
                >
                  {xp}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 rounded-lg font-body text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary flex-1 py-3 rounded-lg font-pixel text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ADDING..." : "ADD QUEST"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
