import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { TaskSection } from "./TaskSection";
import { AddTaskModal } from "./AddTaskModal";
import { StatsPanel } from "./StatsPanel";

interface Profile {
  _id: string;
  displayName: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  progressXp: number;
  neededXp: number;
  progressPercent: number;
}

interface DashboardProps {
  profile: Profile;
}

export function Dashboard({ profile }: DashboardProps) {
  const { signOut } = useAuthActions();
  const today = new Date().toISOString().split("T")[0];

  const mainTasks = useQuery(api.tasks.getMainTasks) ?? [];
  const bonusTasks = useQuery(api.tasks.getBonusTasks) ?? [];
  const completions = useQuery(api.tasks.getTodayCompletions, { date: today }) ?? [];

  const completeTask = useMutation(api.tasks.completeTask);
  const uncompleteTask = useMutation(api.tasks.uncompleteTask);
  const addXp = useMutation(api.profiles.addXp);
  const updateStreak = useMutation(api.profiles.updateStreak);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<"main" | "bonus">("main");
  const [xpPopup, setXpPopup] = useState<{ amount: number; id: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const completedMainIds = new Set<string>(
    completions.filter((c: { taskType: string }) => c.taskType === "main").map((c: { taskId: string }) => c.taskId)
  );
  const completedBonusIds = new Set<string>(
    completions.filter((c: { taskType: string }) => c.taskType === "bonus").map((c: { taskId: string }) => c.taskId)
  );

  const allMainCompleted = mainTasks.length > 0 && mainTasks.every((t: { _id: string }) => completedMainIds.has(t._id));

  const todayXp = completions.reduce((sum: number, c: { xpEarned: number }) => sum + c.xpEarned, 0);

  const handleToggleTask = async (
    taskId: string,
    taskType: "main" | "bonus",
    xpReward: number,
    isCompleted: boolean
  ) => {
    try {
      if (isCompleted) {
        await uncompleteTask({ taskId, date: today });
        await addXp({ amount: -xpReward });
      } else {
        await completeTask({ taskId, taskType, date: today, xpReward });
        await addXp({ amount: xpReward });
        await updateStreak({ date: today });

        // Show XP popup
        setXpPopup({ amount: xpReward, id: taskId });
        setTimeout(() => setXpPopup(null), 800);
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const openAddModal = (type: "main" | "bonus") => {
    setAddModalType(type);
    setAddModalOpen(true);
  };

  // Format date for display
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-lavender-900/30">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">🎮</span>
              <div>
                <h1 className="font-pixel text-xs md:text-sm text-cyan-400 text-glow-cyan">
                  QUEST LOG
                </h1>
                <p className="font-body text-xs text-lavender-500 hidden sm:block">
                  {formatDate()}
                </p>
              </div>
            </div>

            {/* User Info - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="font-body text-sm text-lavender-300">
                  {profile.displayName}
                </p>
                <p className="font-pixel text-xs text-gold-400">
                  LVL {profile.level}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="btn-secondary px-4 py-2 rounded-lg font-body text-sm"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-lavender-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-lavender-900/30 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-lavender-300">
                    {profile.displayName}
                  </p>
                  <p className="font-pixel text-xs text-gold-400">
                    LVL {profile.level}
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary px-3 py-2 rounded-lg font-body text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 animate-fade-in-up">
          {/* XP Progress */}
          <div className="col-span-2 panel p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="level-badge px-2 py-1 rounded font-pixel text-xs">
                  LVL {profile.level}
                </span>
                <span className="font-body text-sm text-lavender-300">
                  {profile.totalXp.toLocaleString()} XP
                </span>
              </div>
              <span className="font-body text-xs text-lavender-500">
                {profile.progressXp} / {profile.neededXp} to next level
              </span>
            </div>
            <div className="h-3 bg-[#1a1a24] rounded-full overflow-hidden">
              <div
                className="xp-bar-fill h-full rounded-full transition-all duration-500"
                style={{ width: `${profile.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="panel p-4 md:p-5 flex items-center gap-3">
            <div className="streak-badge w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center">
              <span className="text-xl md:text-2xl">🔥</span>
            </div>
            <div>
              <p className="font-pixel text-lg md:text-xl text-white">
                {profile.currentStreak}
              </p>
              <p className="font-body text-xs text-lavender-500">Day Streak</p>
            </div>
          </div>

          {/* Today's XP */}
          <div className="panel p-4 md:p-5 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <span className="text-xl md:text-2xl">⚡</span>
            </div>
            <div>
              <p className="font-pixel text-lg md:text-xl text-cyan-400">
                +{todayXp}
              </p>
              <p className="font-body text-xs text-lavender-500">Today's XP</p>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Main Tasks */}
          <TaskSection
            title="DAILY QUESTS"
            subtitle="Complete all main tasks to unlock bonus quests"
            emoji="⚔️"
            tasks={mainTasks}
            completedIds={completedMainIds}
            taskType="main"
            onToggle={handleToggleTask}
            onAdd={() => openAddModal("main")}
            xpPopup={xpPopup}
            isLocked={false}
          />

          {/* Bonus Tasks */}
          <TaskSection
            title="BONUS QUESTS"
            subtitle={allMainCompleted ? "Earn extra XP!" : "Complete all daily quests first"}
            emoji="✨"
            tasks={bonusTasks}
            completedIds={completedBonusIds}
            taskType="bonus"
            onToggle={handleToggleTask}
            onAdd={() => openAddModal("bonus")}
            xpPopup={xpPopup}
            isLocked={!allMainCompleted}
          />
        </div>

        {/* Stats Panel */}
        <StatsPanel />
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-lavender-900/20">
        <p className="font-body text-xs text-lavender-600">
          Requested by @maxsofm · Built by @clonkbot
        </p>
      </footer>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        type={addModalType}
      />
    </div>
  );
}
