import { motion } from "framer-motion";

export const MOODS = [
  { value: 1, label: "Awful", emoji: "😫", color: "bg-red-500" },
  { value: 2, label: "Bad", emoji: "😞", color: "bg-orange-400" },
  { value: 3, label: "Okay", emoji: "😐", color: "bg-yellow-400" },
  { value: 4, label: "Good", emoji: "🙂", color: "bg-lime-400" },
  { value: 5, label: "Great", emoji: "🤩", color: "bg-green-500" },
];

interface MoodSelectorProps {
  currentMood: number | null;
  onSelect: (mood: number) => void;
}

export const MoodSelector = ({ currentMood, onSelect }: MoodSelectorProps) => {
  return (
    <div className="flex justify-between items-center w-full max-w-sm mx-auto mb-8">
      {MOODS.map((mood) => (
        <div key={mood.value} className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(mood.value)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm transition-colors ${
              currentMood === mood.value
                ? `${mood.color} ring-4 ring-offset-2 ring-${mood.color}`
                : "bg-white/50 hover:bg-white"
            }`}
          >
            {mood.emoji}
          </motion.button>
          <span className="text-xs text-slate-500 font-medium">{mood.label}</span>
        </div>
      ))}
    </div>
  );
};
