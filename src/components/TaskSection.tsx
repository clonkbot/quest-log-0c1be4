import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Task {
  _id: Id<"mainTasks"> | Id<"bonusTasks">;
  title: string;
  description?: string;
  xpReward: number;
}

interface TaskSectionProps {
  title: string;
  subtitle: string;
  emoji: string;
  tasks: Task[];
  completedIds: Set<string>;
  taskType: "main" | "bonus";
  onToggle: (taskId: string, taskType: "main" | "bonus", xpReward: number, isCompleted: boolean) => void;
  onAdd: () => void;
  xpPopup: { amount: number; id: string } | null;
  isLocked: boolean;
}

export function TaskSection({
  title,
  subtitle,
  emoji,
  tasks,
  completedIds,
  taskType,
  onToggle,
  onAdd,
  xpPopup,
  isLocked,
}: TaskSectionProps) {
  const deleteMainTask = useMutation(api.tasks.deleteMainTask);
  const deleteBonusTask = useMutation(api.tasks.deleteBonusTask);

  const handleDelete = async (taskId: string) => {
    try {
      if (taskType === "main") {
        await deleteMainTask({ id: taskId as Id<"mainTasks"> });
      } else {
        await deleteBonusTask({ id: taskId as Id<"bonusTasks"> });
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const completedCount = tasks.filter((t) => completedIds.has(t._id)).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className={`panel p-4 md:p-6 animate-fade-in-up ${taskType === "main" ? "stagger-2" : "stagger-3"} ${isLocked ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl">{emoji}</span>
          <div>
            <h2 className={`font-pixel text-sm md:text-base ${taskType === "main" ? "text-cyan-400 text-glow-cyan" : "text-magenta-400 text-glow-magenta"}`}>
              {title}
            </h2>
            <p className="font-body text-xs text-lavender-500 mt-1">
              {subtitle}
            </p>
          </div>
        </div>
        <button
          onClick={onAdd}
          disabled={isLocked}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all ${
            isLocked
              ? "bg-lavender-900/30 text-lavender-600 cursor-not-allowed"
              : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-body text-lavender-500 mb-1">
          <span>{completedCount} / {tasks.length} completed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              taskType === "main"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400"
                : "bg-gradient-to-r from-magenta-500 to-magenta-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Lock overlay for bonus tasks */}
      {isLocked && (
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <span className="text-4xl mb-2 block">🔒</span>
            <p className="font-body text-sm text-lavender-500">
              Complete all daily quests to unlock
            </p>
          </div>
        </div>
      )}

      {/* Task list */}
      {!isLocked && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-body text-lavender-500 text-sm">
                No quests yet. Add your first one!
              </p>
            </div>
          ) : (
            tasks.map((task) => {
              const isCompleted = completedIds.has(task._id);
              return (
                <div
                  key={task._id}
                  className={`task-card p-3 md:p-4 rounded-lg relative ${isCompleted ? "completed" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggle(task._id, taskType, task.xpReward, isCompleted)}
                      className={`checkbox-custom flex-shrink-0 mt-0.5 ${isCompleted ? "checked" : ""}`}
                    >
                      {isCompleted && (
                        <svg className="w-4 h-4 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-body text-sm md:text-base ${isCompleted ? "text-lavender-500 line-through" : "text-white"}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="font-body text-xs text-lavender-600 mt-1 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* XP Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`font-pixel text-xs ${isCompleted ? "text-gold-400 text-glow-gold" : "text-cyan-400"}`}>
                        +{task.xpReward} XP
                      </span>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-1 text-lavender-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        style={{ opacity: 0.5 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* XP Popup */}
                  {xpPopup && xpPopup.id === task._id && (
                    <div className="xp-popup absolute -top-2 right-4 font-pixel text-sm text-gold-400 text-glow-gold">
                      +{xpPopup.amount} XP!
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
