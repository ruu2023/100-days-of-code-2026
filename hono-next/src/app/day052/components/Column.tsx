import { SortableContext, useSortable } from "@dnd-kit/sortable";
import type { Task, Column as ColumnType, Id } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";

interface Props {
  column: ColumnType;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
  selectedTaskId: Id | null;
  onSelectTask: (task: Task) => void;
}

function Column({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
  selectedTaskId,
  onSelectTask,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
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
        className="column-dragging"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="column"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="column-header"
      >
        <div className="column-title-container">
          <div className="column-badge">{tasks.length}</div>
          {!editMode && <div className="column-title">{column.title}</div>}
          {editMode && (
            <input
              className="column-title-input"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="delete-column-btn"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="column-content">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
              isSelected={task.id === selectedTaskId}
              onSelect={onSelectTask}
            />
          ))}
        </SortableContext>
      </div>
      <button
        className="add-task-btn"
        onClick={() => {
          createTask(column.id);
        }}
      >
        <Plus size={18} />
        Add content
      </button>
    </div>
  );
}

export default Column;
