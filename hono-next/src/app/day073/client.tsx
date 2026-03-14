"use client"

import Link from "next/link"
import { useId, useState, useSyncExternalStore } from "react"
import {
  CalendarClock,
  Clock3,
  Focus,
  LogOut,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type CalendarBlock = {
  time: string
  label: string
  type: "event" | "task" | "break" | "focus"
  duration: string
}

type DraftTask = {
  title: string
  estimate: string
  source: BacklogTask["source"]
  energy: BacklogTask["energy"]
  notes: string
}

type BacklogTask = DraftTask & {
  id: string
  createdAt: string
}

const storageKey = "day073-backlog-tasks"
const storageEvent = "day073-backlog-updated"

const todayPlan: CalendarBlock[] = [
  { time: "08:30", label: "Morning planning", type: "focus", duration: "30m" },
  { time: "09:00", label: "Design review with product", type: "event", duration: "45m" },
  { time: "10:00", label: "Finalize daily brief", type: "task", duration: "60m" },
  { time: "11:30", label: "Buffer / admin", type: "break", duration: "30m" },
  { time: "13:00", label: "Build drag-and-drop calendar shell", type: "task", duration: "90m" },
  { time: "15:00", label: "Focus mode prototype", type: "focus", duration: "50m" },
  { time: "16:30", label: "Team sync", type: "event", duration: "30m" },
]

const defaultBacklog: BacklogTask[] = [
  {
    id: "TSK-101",
    title: "Import Google Calendar blocks into daily plan",
    estimate: "2h",
    energy: "High",
    source: "Calendar",
    notes: "Start with a typed mock endpoint and normalize event durations.",
    createdAt: "2026-03-14T08:00:00.000Z",
  },
  {
    id: "TSK-102",
    title: "Draft unified backlog interactions",
    estimate: "45m",
    energy: "Medium",
    source: "Project",
    notes: "Clarify empty states and sorting before drag-and-drop.",
    createdAt: "2026-03-14T08:10:00.000Z",
  },
  {
    id: "TSK-103",
    title: "Write focus timer empty state",
    estimate: "30m",
    energy: "Low",
    source: "Inbox",
    notes: "Keep the language minimal and task-oriented.",
    createdAt: "2026-03-14T08:20:00.000Z",
  },
  {
    id: "TSK-104",
    title: "Define Hono RPC contract for planning board",
    estimate: "1h",
    energy: "High",
    source: "Project",
    notes: "Share payload types between hono-next and hono-api.",
    createdAt: "2026-03-14T08:30:00.000Z",
  },
]

const emptyDraft: DraftTask = {
  title: "",
  estimate: "30m",
  source: "Inbox",
  energy: "Medium",
  notes: "",
}

const weekdays = [
  { name: "Mon", date: "10", state: "done" },
  { name: "Tue", date: "11", state: "done" },
  { name: "Wed", date: "12", state: "active" },
  { name: "Thu", date: "13", state: "next" },
  { name: "Fri", date: "14", state: "next" },
]

const blockStyles: Record<CalendarBlock["type"], string> = {
  event:
    "border-sky-500/30 bg-sky-500/[0.12] text-sky-950 dark:text-sky-100",
  task:
    "border-emerald-500/30 bg-emerald-500/[0.12] text-emerald-950 dark:text-emerald-100",
  break: "border-white/10 bg-white/[0.06] text-foreground/80",
  focus:
    "border-amber-500/30 bg-amber-500/[0.14] text-amber-950 dark:text-amber-100",
}

const energyStyles: Record<BacklogTask["energy"], string> = {
  High: "bg-rose-500/[0.15] text-rose-700 dark:text-rose-200",
  Medium: "bg-amber-500/[0.15] text-amber-700 dark:text-amber-200",
  Low: "bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-200",
}

const sourceOptions: BacklogTask["source"][] = ["Inbox", "Project", "Calendar"]
const energyOptions: BacklogTask["energy"][] = ["Low", "Medium", "High"]
let cachedStorageValue: string | null | undefined
let cachedTasks: BacklogTask[] = defaultBacklog

function parseStoredTasks(rawValue: string | null): BacklogTask[] {
  if (!rawValue) {
    return defaultBacklog
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return defaultBacklog
    }

    return parsedValue.filter(
      (task): task is BacklogTask =>
        typeof task?.id === "string" &&
        typeof task?.title === "string" &&
        typeof task?.estimate === "string" &&
        typeof task?.source === "string" &&
        typeof task?.energy === "string" &&
        typeof task?.notes === "string" &&
        typeof task?.createdAt === "string"
    )
  } catch {
    return defaultBacklog
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  window.addEventListener("storage", callback)
  window.addEventListener(storageEvent, callback)

  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(storageEvent, callback)
  }
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return defaultBacklog
  }

  const rawValue = window.localStorage.getItem(storageKey)
  if (rawValue === cachedStorageValue) {
    return cachedTasks
  }

  cachedStorageValue = rawValue
  cachedTasks = parseStoredTasks(rawValue)
  return cachedTasks
}

function getServerSnapshot() {
  return defaultBacklog
}

function persistTasks(nextTasks: BacklogTask[]) {
  if (typeof window === "undefined") {
    return
  }

  const nextValue = JSON.stringify(nextTasks)
  cachedStorageValue = nextValue
  cachedTasks = nextTasks
  window.localStorage.setItem(storageKey, nextValue)
  window.dispatchEvent(new Event(storageEvent))
}

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `task-${Date.now()}`
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const selectId = useId()

  return (
    <label htmlFor={selectId} className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/55">
        {label}
      </span>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.65] px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-white/[0.05]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TaskComposer({
  title,
  description,
  submitLabel,
  draft,
  onDraftChange,
  onSubmit,
  onCancel,
}: {
  title: string
  description: string
  submitLabel: string
  draft: DraftTask
  onDraftChange: (draft: DraftTask) => void
  onSubmit: () => void
  onCancel?: () => void
}) {
  const notesId = useId()

  return (
    <Card className="border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="size-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/55">
            Task title
          </span>
          <Input
            value={draft.title}
            placeholder="Write a typed planning endpoint"
            onChange={(event) =>
              onDraftChange({ ...draft, title: event.target.value })
            }
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/55">
              Estimate
            </span>
            <Input
              value={draft.estimate}
              placeholder="45m"
              onChange={(event) =>
                onDraftChange({ ...draft, estimate: event.target.value })
              }
            />
          </label>
          <SelectField
            label="Energy"
            value={draft.energy}
            options={energyOptions}
            onChange={(value) =>
              onDraftChange({
                ...draft,
                energy: value as BacklogTask["energy"],
              })
            }
          />
        </div>
        <SelectField
          label="Source"
          value={draft.source}
          options={sourceOptions}
          onChange={(value) =>
            onDraftChange({
              ...draft,
              source: value as BacklogTask["source"],
            })
          }
        />
        <label htmlFor={notesId} className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/55">
            Notes
          </span>
          <textarea
            id={notesId}
            value={draft.notes}
            placeholder="What should happen when this task moves into the plan?"
            onChange={(event) =>
              onDraftChange({ ...draft, notes: event.target.value })
            }
            className="min-h-28 w-full rounded-md border border-white/10 bg-white/[0.65] px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-white/[0.05]"
          />
        </label>
        <div className="flex gap-2">
          <Button type="button" className="rounded-full" onClick={onSubmit}>
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Day073Client() {
  const storedTasks = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const [newTaskDraft, setNewTaskDraft] = useState<DraftTask>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<DraftTask>(emptyDraft)

  const totalEstimatedHours = storedTasks.reduce((total, task) => {
    const match = task.estimate.match(/^(\d+)(m|h)$/i)
    if (!match) {
      return total
    }

    const value = Number(match[1])
    return total + (match[2].toLowerCase() === "h" ? value * 60 : value)
  }, 0)

  const focusTask = storedTasks[0] ?? defaultBacklog[0]

  function handleCreateTask() {
    const title = newTaskDraft.title.trim()
    const estimate = newTaskDraft.estimate.trim()
    if (!title || !estimate) {
      return
    }

    const nextTask: BacklogTask = {
      ...newTaskDraft,
      title,
      estimate,
      notes: newTaskDraft.notes.trim(),
      id: createTaskId(),
      createdAt: new Date().toISOString(),
    }

    persistTasks([nextTask, ...storedTasks])
    setNewTaskDraft(emptyDraft)
  }

  function handleDeleteTask(taskId: string) {
    persistTasks(storedTasks.filter((task) => task.id !== taskId))
    if (editingId === taskId) {
      setEditingId(null)
      setEditingDraft(emptyDraft)
    }
  }

  function handleStartEditing(task: BacklogTask) {
    setEditingId(task.id)
    setEditingDraft({
      title: task.title,
      estimate: task.estimate,
      source: task.source,
      energy: task.energy,
      notes: task.notes,
    })
  }

  function handleSaveEdit() {
    if (!editingId) {
      return
    }

    const title = editingDraft.title.trim()
    const estimate = editingDraft.estimate.trim()
    if (!title || !estimate) {
      return
    }

    persistTasks(
      storedTasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              ...editingDraft,
              title,
              estimate,
              notes: editingDraft.notes.trim(),
            }
          : task
      )
    )
    setEditingId(null)
    setEditingDraft(emptyDraft)
  }

  function handleCancelEditing() {
    setEditingId(null)
    setEditingDraft(emptyDraft)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.96))] text-foreground transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.96))]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-foreground/75"
              >
                Daily Planning
              </Badge>
              <Badge className="rounded-full bg-emerald-500/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white shadow-sm">
                In Flow
              </Badge>
            </div>
            <div className="space-y-2">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Sunsama-style planner with local drafts, posting, and editing.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-foreground/70 sm:text-base">
                Save tasks to localStorage, revise them inline, and keep a daily
                planning workspace entirely in the frontend for now.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <ThemeToggle />
            <Button
              variant="outline"
              className="rounded-full border-white/15 bg-white/10 backdrop-blur hover:bg-white/15 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
            >
              <Sparkles />
              Plan my day
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-white/15 bg-transparent hover:bg-white/10"
            >
              <Link href="/logout">
                <LogOut />
                Logout
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-3 py-6 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Saved tasks</CardDescription>
              <CardTitle className="text-3xl">{storedTasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Total estimated work</CardDescription>
              <CardTitle className="text-3xl">
                {Math.floor(totalEstimatedHours / 60)}h {totalEstimatedHours % 60}m
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Editing mode</CardDescription>
              <CardTitle className="text-3xl">
                {editingId ? "Active" : "Idle"}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
          <Card className="overflow-hidden border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CalendarClock className="size-5" />
                    Friday, March 14
                  </CardTitle>
                  <CardDescription>
                    Planning board preview. Right-side posted tasks persist in
                    localStorage.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {weekdays.map((day) => (
                    <div
                      key={day.name}
                      className={[
                        "flex min-w-14 flex-col items-center rounded-2xl border px-3 py-2 text-center transition-colors",
                        day.state === "active"
                          ? "border-sky-500/40 bg-sky-500/15"
                          : "border-white/10 bg-white/[0.08]",
                      ].join(" ")}
                    >
                      <span className="text-[11px] uppercase tracking-[0.24em] text-foreground/55">
                        {day.name}
                      </span>
                      <span className="mt-1 text-lg font-semibold">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 sm:p-6">
              {todayPlan.map((block) => (
                <div
                  key={`${block.time}-${block.label}`}
                  className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.45] p-3 shadow-sm shadow-slate-950/5 sm:grid-cols-[88px_minmax(0,1fr)] dark:bg-white/[0.04]"
                >
                  <div className="rounded-2xl border border-white/10 bg-background/70 px-3 py-3 text-center dark:bg-black/10">
                    <p className="text-lg font-semibold tracking-tight">{block.time}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
                      {block.duration}
                    </p>
                  </div>
                  <div
                    className={[
                      "flex items-start justify-between gap-4 rounded-2xl border px-4 py-4",
                      blockStyles[block.type],
                    ].join(" ")}
                  >
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.22em] text-current/60">
                        {block.type}
                      </p>
                      <h3 className="text-base font-semibold">{block.label}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full bg-white/35 px-3 dark:bg-black/10"
                    >
                      Move
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <TaskComposer
              title="Post a task"
              description="Create a new backlog item and keep it on this browser with localStorage."
              submitLabel="Post task"
              draft={newTaskDraft}
              onDraftChange={setNewTaskDraft}
              onSubmit={handleCreateTask}
            />

            {editingId ? (
              <TaskComposer
                title="Edit task"
                description="Update the selected task and save the changes back to localStorage."
                submitLabel="Save changes"
                draft={editingDraft}
                onDraftChange={setEditingDraft}
                onSubmit={handleSaveEdit}
                onCancel={handleCancelEditing}
              />
            ) : null}

            <Card className="border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="size-5" />
                  Unified backlog
                </CardTitle>
                <CardDescription>
                  Tasks posted from this page. Edit and delete actions update
                  localStorage immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4">
                {storedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.55] p-4 shadow-sm shadow-slate-950/5 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                          {task.id.slice(0, 8)}
                        </p>
                        <h3 className="text-sm font-semibold leading-6">
                          {task.title}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/[0.5] dark:bg-white/[0.08]"
                      >
                        {task.estimate}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        className={`rounded-full border-0 ${energyStyles[task.energy]}`}
                      >
                        {task.energy} energy
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/10 bg-transparent"
                      >
                        {task.source}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-foreground/70">
                      {task.notes || "No notes yet."}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleStartEditing(task)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Focus className="size-5" />
                  Focus mode preview
                </CardTitle>
                <CardDescription>
                  The first saved task becomes the current focus target in this
                  mock frontend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                    Active now
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">
                    {focusTask.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/65">
                    {focusTask.estimate} · {focusTask.source}
                  </p>
                  <p className="mt-6 text-5xl font-semibold tracking-tight">48:12</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.5] p-4 dark:bg-white/[0.04]">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Clock3 className="size-4" />
                      Next block
                    </p>
                    <p className="mt-2 text-sm text-foreground/65">
                      Team sync at 16:30
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.5] p-4 dark:bg-white/[0.04]">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="size-4" />
                      Ritual
                    </p>
                    <p className="mt-2 text-sm text-foreground/65">
                      Post tasks first, then refine them inline as the plan
                      changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
