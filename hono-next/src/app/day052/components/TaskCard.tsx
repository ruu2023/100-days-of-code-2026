import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Id } from "../types";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  isSelected: boolean;
  onSelect: (task: Task) => void;
}

function TaskCard({ task, deleteTask, updateTask, isSelected, onSelect }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(task.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="task-card-dragging"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(task)}
      className={`task-card ${isSelected ? "task-card-selected" : ""}`}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <p className="task-content">{(() => { const s = task.content.replace(/\n/g, " "); return s.length > 15 ? s.slice(0, 15) + "..." : s; })()}</p>
      {mouseIsOver && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
          }}
          className="copy-task-btn"
          title="Copy content"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
  );
}

export default TaskCard;

