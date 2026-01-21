import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { MOODS } from "./MoodSelector";

export interface Log {
  id: string;
  mood: number;
  note: string;
  timestamp: string;
}

interface TimelineProps {
  logs: Log[];
  onDelete: (id: string) => void;
}

export const Timeline = ({ logs, onDelete }: TimelineProps) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <p>No records yet.</p>
        <p className="text-sm">How are you feeling right now?</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <AnimatePresence mode="popLayout">
        {logs.map((log) => {
          const moodData = MOODS.find((m) => m.value === log.mood);
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${moodData?.color}`}
              >
                {moodData?.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-700">
                    {moodData?.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {format(new Date(log.timestamp), "MM/dd HH:mm")}
                  </span>
                </div>
                <p className="text-slate-600 text-sm break-words">{log.note}</p>
              </div>
              <button
                onClick={() => onDelete(log.id)}
                className="text-slate-300 hover:text-red-400 transition-colors p-1"
                aria-label="Delete log"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
