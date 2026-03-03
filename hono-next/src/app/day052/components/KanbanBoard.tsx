"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Plus, FileText, Trash2, Copy, Check } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Column from "./Column";
import TaskCard from "./TaskCard";
import type { Column as ColumnType, Id, Task } from "../types";
import "../index.css";
import ConfirmModal from "./ConfirmModal";
// ── API helpers ──────────────────────────────────────────────
// Use local proxy route to forward cookies to Workers
const API_BASE = "/api/kanban";

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // Convert /api/kanban/columns -> columns for proxy route
  const proxyPath = path.replace("/api/kanban/", "");
  const url = `${API_BASE}/${proxyPath}`;
  return fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

const api = {
  async getAll(): Promise<{ columns: ColumnType[]; items: Task[] }> {
    const res = await apiFetch("/api/kanban/columns");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },
  async createColumn(title: string, position: number): Promise<ColumnType> {
    const res = await apiFetch("/api/kanban/columns", {
      method: "POST",
      body: JSON.stringify({ title, position }),
    });
    return res.json();
  },
  async updateColumn(id: Id, data: Partial<Pick<ColumnType, "title" | "position">>) {
    await apiFetch(`/api/kanban/columns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  async deleteColumn(id: Id) {
    await apiFetch(`/api/kanban/columns/${id}`, { method: "DELETE" });
  },
  async createItem(columnId: Id, content: string, position: number): Promise<Task> {
    const res = await apiFetch("/api/kanban/items", {
      method: "POST",
      body: JSON.stringify({ columnId, content, position }),
    });
    return res.json();
  },
  async updateItem(id: Id, data: Partial<Pick<Task, "content" | "columnId" | "position">>) {
    await apiFetch(`/api/kanban/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  async deleteItem(id: Id) {
    await apiFetch(`/api/kanban/items/${id}`, { method: "DELETE" });
  },
};

// ── コンポーネント ────────────────────────────────────────────
function KanbanBoard() {
  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorCopied, setEditorCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteColumnId, setPendingDeleteColumnId] = useState<Id | null>(null);
  const [showTaskConfirm, setShowTaskConfirm] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<Id | null>(null);

  // エディタ自動保存 debounce タイマー
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  // 初回: APIからデータ取得
  useEffect(() => {
    api.getAll()
      .then(({ columns, items }) => {
        setColumns(columns);
        setTasks(items);
      })
      .catch(console.error)
      .finally(() => setMounted(true));
  }, []);

  // selectedTask 削除時のクリア
  useEffect(() => {
    if (selectedTask) {
      const latest = tasks.find((t) => t.id === selectedTask.id);
      if (!latest) {
        setSelectedTask(null);
        setEditorContent("");
      }
    }
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  // ── カラム操作 ──────────────────────────────────────────────
  async function createColumn() {
    const position = columns.length;
    const col = await api.createColumn(`Column ${columns.length + 1}`, position);
    setColumns((prev) => [...prev, col]);
  }

  function deleteColumn(id: Id) {
    setPendingDeleteColumnId(id);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteColumnId) return;
    const id = pendingDeleteColumnId;
    await api.deleteColumn(id);
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.columnId !== id));
    if (selectedTask && tasks.find(t => t.id === selectedTask.id)?.columnId === id) {
      setSelectedTask(null);
      setEditorContent("");
    }
    setPendingDeleteColumnId(null);
    setShowConfirm(false);
  }

  async function updateColumn(id: Id, title: string) {
    setColumns((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
    await api.updateColumn(id, { title });
  }

  // ── アイテム操作 ────────────────────────────────────────────
  async function createTask(columnId: Id) {
    const colTasks = tasks.filter(t => t.columnId === columnId);
    const position = colTasks.length;
    const newTask = await api.createItem(columnId, `Content ${tasks.length + 1}`, position);
    setTasks((prev) => [...prev, newTask]);
    setSelectedTask(newTask);
    setEditorContent(newTask.content);
  }

  function deleteTask(id: Id) {
    setPendingDeleteTaskId(id);
    setShowTaskConfirm(true);
  }

  async function handleConfirmDeleteTask() {
    if (!pendingDeleteTaskId) return;
    const id = pendingDeleteTaskId;
    await api.deleteItem(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
      setEditorContent("");
    }
    setPendingDeleteTaskId(null);
    setShowTaskConfirm(false);
  }

  function updateTask(id: Id, content: string) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, content } : t));
  }

  // ── エディタ自動保存（500ms debounce） ──────────────────────
  function handleEditorChange(value: string) {
    setEditorContent(value);
    if (selectedTask) {
      updateTask(selectedTask.id, value);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api.updateItem(selectedTask.id, { content: value });
      }, 500);
    }
  }

  function handleSelectTask(task: Task) {
    setSelectedTask(task);
    const latest = tasks.find(t => t.id === task.id);
    setEditorContent(latest?.content ?? task.content);
  }

  // ── DnD ────────────────────────────────────────────────────
  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    } else if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveColumn = active.data.current?.type === "Column";
    if (isActiveColumn) {
      setColumns((prev) => {
        const from = prev.findIndex((c) => c.id === active.id);
        const to = prev.findIndex((c) => c.id === over.id);
        const next = arrayMove(prev, from, to);
        // position を一括更新
        next.forEach((col, i) => api.updateColumn(col.id, { position: i }));
        return next.map((col, i) => ({ ...col, position: i }));
      });
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const from = prev.findIndex((t) => t.id === active.id);
        const to = prev.findIndex((t) => t.id === over.id);
        if (prev[from].columnId !== prev[to].columnId) {
          prev[from].columnId = prev[to].columnId;
          api.updateItem(prev[from].id, { columnId: prev[to].columnId });
          return arrayMove(prev, from, to - 1);
        }
        return arrayMove(prev, from, to);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const from = prev.findIndex((t) => t.id === active.id);
        const newColumnId = over.id as string;
        prev[from].columnId = newColumnId;
        api.updateItem(prev[from].id, { columnId: newColumnId });
        return arrayMove(prev, from, from);
      });
    }
  }

  // ── JSX ────────────────────────────────────────────────────
  return (
    <div className="kanban-layout">
      {showConfirm && (
        <ConfirmModal
          title="カラムを削除しますか？"
          description="カラム内のコンテンツもすべて削除されます。この操作は元に戻せません。"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowConfirm(false); setPendingDeleteColumnId(null); }}
        />
      )}
      {showTaskConfirm && (
        <ConfirmModal
          title="コンテンツを削除しますか？"
          description="この操作は元に戻せません。"
          onConfirm={handleConfirmDeleteTask}
          onCancel={() => { setShowTaskConfirm(false); setPendingDeleteTaskId(null); }}
        />
      )}

      {/* 左パネル: コンテンツエディタ */}
      <div className="editor-panel">
        <div className="editor-panel-header">
          <FileText size={18} />
          <span>Editor</span>
          {selectedTask && (
            <button
              className="editor-delete-btn"
              title="Delete content"
              onClick={() => deleteTask(selectedTask.id)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        {selectedTask ? (
          <div className="editor-panel-body">
            <div className="editor-task-meta">
              <div className="editor-meta-left">
                <button
                  className="editor-copy-btn"
                  title="Copy content"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(editorContent);
                      setEditorCopied(true);
                      setTimeout(() => setEditorCopied(false), 2000);
                    } catch {}
                  }}
                >
                  {editorCopied ? <Check size={15} /> : <Copy size={15} />}
                </button>
                <span className="editor-char-count">{editorContent.length.toLocaleString()} chars</span>
              </div>
              <span className="editor-task-col">
                {columns.find(c => c.id === selectedTask.columnId)?.title ?? "—"}
              </span>
            </div>
            <textarea
              className="editor-textarea"
              value={editorContent}
              autoFocus
              placeholder="Content here..."
              onChange={(e) => handleEditorChange(e.target.value)}
            />
            <div className="editor-actions">
              <p className="editor-hint">✏️ 編集内容は自動保存されます</p>
            </div>
          </div>
        ) : (
          <div className="editor-empty">
            <FileText size={48} opacity={0.2} />
            <p>コンテンツを選択すると<br />ここで編集できます</p>
          </div>
        )}
      </div>

      {/* 右パネル: カンバンボード */}
      <div className="kanban-board">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <Column
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  selectedTaskId={selectedTask?.id ?? null}
                  onSelectTask={handleSelectTask}
                />
              ))}
            </SortableContext>
          </div>
          <button onClick={createColumn} className="add-column-btn">
            <Plus />
            Add Column
          </button>
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <Column
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                  selectedTaskId={selectedTask?.id ?? null}
                  onSelectTask={handleSelectTask}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  isSelected={false}
                  onSelect={handleSelectTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
}

export default KanbanBoard;