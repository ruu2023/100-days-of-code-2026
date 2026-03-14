"use client"

import Link from "next/link"
import { useEffect, useId, useState, useSyncExternalStore } from "react"
import {
  CalendarClock,
  Clock3,
  Focus,
  GripVertical,
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
  id: string
  time: string
  label: string
  type: "event" | "break" | "focus"
  durationMinutes: number
}

type TaskSource = "Inbox" | "Project" | "Calendar"
type TaskEnergy = "High" | "Medium" | "Low"

type DraftTask = {
  title: string
  estimate: string
  source: TaskSource
  energy: TaskEnergy
  notes: string
}

type PlannerTask = DraftTask & {
  id: string
  createdAt: string
}

type ScheduledTask = {
  taskId: string
  startTime: string
}

type PlannerState = {
  tasks: PlannerTask[]
  scheduled: ScheduledTask[]
}

type ScheduledCalendarItem = {
  id: string
  title: string
  startTime: string
  durationMinutes: number
  type: "event" | "break" | "focus" | "task"
  meta: string
}

const storageKey = "day073-planner-state"
const storageEvent = "day073-planner-updated"
const dayStartHour = 8
const dayEndHour = 19
const slotMinutes = 30
const totalGridMinutes = (dayEndHour - dayStartHour) * 60
const pxPerMinute = 1.6
const gridHeight = totalGridMinutes * pxPerMinute
const timeSlots = Array.from(
  { length: totalGridMinutes / slotMinutes },
  (_, index) => {
    const totalMinutes = dayStartHour * 60 + index * slotMinutes
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
  }
)

const baseCalendar: CalendarBlock[] = [
  {
    id: "calendar-1",
    time: "08:30",
    label: "Morning planning",
    type: "focus",
    durationMinutes: 30,
  },
  {
    id: "calendar-2",
    time: "09:00",
    label: "Design review with product",
    type: "event",
    durationMinutes: 45,
  },
  {
    id: "calendar-3",
    time: "11:30",
    label: "Buffer / admin",
    type: "break",
    durationMinutes: 30,
  },
  {
    id: "calendar-4",
    time: "15:00",
    label: "Focus mode prototype",
    type: "focus",
    durationMinutes: 60,
  },
  {
    id: "calendar-5",
    time: "16:30",
    label: "Team sync",
    type: "event",
    durationMinutes: 30,
  },
]

const defaultTasks: PlannerTask[] = [
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

const defaultPlannerState: PlannerState = {
  tasks: defaultTasks,
  scheduled: [],
}

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

const blockStyles: Record<
  ScheduledCalendarItem["type"],
  { card: string; dot: string }
> = {
  event: {
    card: "border-sky-500/25 bg-sky-500/[0.14] text-sky-950 dark:text-sky-100",
    dot: "bg-sky-500",
  },
  task: {
    card: "border-emerald-500/25 bg-emerald-500/[0.14] text-emerald-950 dark:text-emerald-100",
    dot: "bg-emerald-500",
  },
  break: {
    card: "border-slate-400/20 bg-white/[0.08] text-foreground/80",
    dot: "bg-slate-400",
  },
  focus: {
    card: "border-amber-500/25 bg-amber-500/[0.16] text-amber-950 dark:text-amber-100",
    dot: "bg-amber-500",
  },
}

const energyStyles: Record<TaskEnergy, string> = {
  High: "bg-rose-500/[0.15] text-rose-700 dark:text-rose-200",
  Medium: "bg-amber-500/[0.15] text-amber-700 dark:text-amber-200",
  Low: "bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-200",
}

const sourceOptions: TaskSource[] = ["Inbox", "Project", "Calendar"]
const energyOptions: TaskEnergy[] = ["Low", "Medium", "High"]
let cachedStorageValue: string | null | undefined
let cachedPlannerState: PlannerState = defaultPlannerState
let hasHydrated = false

function parseEstimateToMinutes(estimate: string) {
  const match = estimate.trim().match(/^(\d+)(m|h)$/i)
  if (!match) {
    return 30
  }

  const value = Number(match[1])
  return match[2].toLowerCase() === "h" ? value * 60 : value
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function shortenLabel(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

function clampSlotTime(time: string, durationMinutes: number) {
  const rawMinutes = timeToMinutes(time)
  const dayStartMinutes = dayStartHour * 60
  const dayEndMinutes = dayEndHour * 60
  const roundedMinutes =
    Math.round((rawMinutes - dayStartMinutes) / slotMinutes) * slotMinutes +
    dayStartMinutes
  const maxStartMinutes = dayEndMinutes - durationMinutes
  const clampedMinutes = Math.min(
    Math.max(roundedMinutes, dayStartMinutes),
    maxStartMinutes
  )

  return minutesToTime(clampedMinutes)
}

function parseStoredState(rawValue: string | null): PlannerState {
  if (!rawValue) {
    return defaultPlannerState
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      !Array.isArray(parsedValue.tasks) ||
      !Array.isArray(parsedValue.scheduled)
    ) {
      return defaultPlannerState
    }

    const tasks = parsedValue.tasks.filter(
      (task): task is PlannerTask =>
        typeof task?.id === "string" &&
        typeof task?.title === "string" &&
        typeof task?.estimate === "string" &&
        typeof task?.source === "string" &&
        typeof task?.energy === "string" &&
        typeof task?.notes === "string" &&
        typeof task?.createdAt === "string"
    )

    const taskIds = new Set(tasks.map((task) => task.id))
    const scheduled = parsedValue.scheduled.filter(
      (item): item is ScheduledTask =>
        typeof item?.taskId === "string" &&
        typeof item?.startTime === "string" &&
        taskIds.has(item.taskId)
    )

    return {
      tasks,
      scheduled,
    }
  } catch {
    return defaultPlannerState
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
    return defaultPlannerState
  }

  if (!hasHydrated) {
    return defaultPlannerState
  }

  const rawValue = window.localStorage.getItem(storageKey)
  if (rawValue === cachedStorageValue) {
    return cachedPlannerState
  }

  cachedStorageValue = rawValue
  cachedPlannerState = parseStoredState(rawValue)
  return cachedPlannerState
}

function getServerSnapshot() {
  return defaultPlannerState
}

function persistState(nextState: PlannerState) {
  if (typeof window === "undefined") {
    return
  }

  const nextValue = JSON.stringify(nextState)
  cachedStorageValue = nextValue
  cachedPlannerState = nextState
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
                energy: value as TaskEnergy,
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
              source: value as TaskSource,
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
  const plannerState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const { tasks, scheduled } = plannerState
  const [newTaskDraft, setNewTaskDraft] = useState<DraftTask>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<DraftTask>(emptyDraft)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [activeDropSlot, setActiveDropSlot] = useState<string | null>(null)

  useEffect(() => {
    hasHydrated = true
    window.dispatchEvent(new Event(storageEvent))
  }, [])

  const scheduledTaskIds = new Set(scheduled.map((item) => item.taskId))
  const backlogTasks = tasks.filter((task) => !scheduledTaskIds.has(task.id))
  const scheduledTaskItems = scheduled
    .map((item) => {
      const task = tasks.find((candidate) => candidate.id === item.taskId)
      if (!task) {
        return null
      }

      return {
        id: task.id,
        title: task.title,
        startTime: clampSlotTime(item.startTime, parseEstimateToMinutes(task.estimate)),
        durationMinutes: parseEstimateToMinutes(task.estimate),
        type: "task" as const,
        meta: `${task.estimate} · ${task.source}`,
      }
    })
    .filter((item): item is ScheduledCalendarItem => item !== null)

  const baseCalendarItems: ScheduledCalendarItem[] = baseCalendar.map((block) => ({
    id: block.id,
    title: block.label,
    startTime: block.time,
    durationMinutes: block.durationMinutes,
    type: block.type,
    meta: `${block.durationMinutes}m`,
  }))

  const calendarItems = [...baseCalendarItems, ...scheduledTaskItems].sort(
    (left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime)
  )

  const totalEstimatedMinutes = tasks.reduce(
    (total, task) => total + parseEstimateToMinutes(task.estimate),
    0
  )
  const scheduledMinutes = scheduledTaskItems.reduce(
    (total, item) => total + item.durationMinutes,
    0
  )
  const focusTask =
    scheduledTaskItems[0] ?? (backlogTasks[0] ? {
      id: backlogTasks[0].id,
      title: backlogTasks[0].title,
      startTime: "00:00",
      durationMinutes: parseEstimateToMinutes(backlogTasks[0].estimate),
      type: "task" as const,
      meta: `${backlogTasks[0].estimate} · ${backlogTasks[0].source}`,
    } : null)

  function handleCreateTask() {
    const title = newTaskDraft.title.trim()
    const estimate = newTaskDraft.estimate.trim()
    if (!title || !estimate) {
      return
    }

    const nextTask: PlannerTask = {
      ...newTaskDraft,
      title,
      estimate,
      notes: newTaskDraft.notes.trim(),
      id: createTaskId(),
      createdAt: new Date().toISOString(),
    }

    persistState({
      ...plannerState,
      tasks: [nextTask, ...tasks],
    })
    setNewTaskDraft(emptyDraft)
  }

  function handleDeleteTask(taskId: string) {
    persistState({
      tasks: tasks.filter((task) => task.id !== taskId),
      scheduled: scheduled.filter((item) => item.taskId !== taskId),
    })
    if (editingId === taskId) {
      setEditingId(null)
      setEditingDraft(emptyDraft)
    }
  }

  function handleStartEditing(task: PlannerTask) {
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

    persistState({
      ...plannerState,
      tasks: tasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              ...editingDraft,
              title,
              estimate,
              notes: editingDraft.notes.trim(),
            }
          : task
      ),
    })
    setEditingId(null)
    setEditingDraft(emptyDraft)
  }

  function handleCancelEditing() {
    setEditingId(null)
    setEditingDraft(emptyDraft)
  }

  function scheduleTask(taskId: string, slotTime: string) {
    const task = tasks.find((candidate) => candidate.id === taskId)
    if (!task) {
      return
    }

    const nextStartTime = clampSlotTime(
      slotTime,
      parseEstimateToMinutes(task.estimate)
    )
    const existingItem = scheduled.find((item) => item.taskId === taskId)
    const nextScheduled = existingItem
      ? scheduled.map((item) =>
          item.taskId === taskId ? { ...item, startTime: nextStartTime } : item
        )
      : [...scheduled, { taskId, startTime: nextStartTime }]

    persistState({
      ...plannerState,
      scheduled: nextScheduled,
    })
  }

  function unscheduleTask(taskId: string) {
    persistState({
      ...plannerState,
      scheduled: scheduled.filter((item) => item.taskId !== taskId),
    })
  }

  function handleDropOnSlot(slotTime: string) {
    if (!draggedTaskId) {
      return
    }

    scheduleTask(draggedTaskId, slotTime)
    setDraggedTaskId(null)
    setActiveDropSlot(null)
  }

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId)
  }

  function handleDragEnd() {
    setDraggedTaskId(null)
    setActiveDropSlot(null)
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
                Daily planner with a Google Calendar-style day view.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-foreground/70 sm:text-base">
                Drag tasks from the backlog into hourly slots, reschedule them on
                the grid, and persist the plan in localStorage.
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
              <CardDescription>Backlog tasks</CardDescription>
              <CardTitle className="text-3xl">{backlogTasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Total estimated work</CardDescription>
              <CardTitle className="text-3xl">
                {Math.floor(totalEstimatedMinutes / 60)}h {totalEstimatedMinutes % 60}m
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Scheduled on calendar</CardDescription>
              <CardTitle className="text-3xl">
                {Math.floor(scheduledMinutes / 60)}h {scheduledMinutes % 60}m
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(340px,0.95fr)_minmax(0,1.65fr)]">
          <div className="grid gap-6">
            <Card className="border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="size-5" />
                  Unified backlog
                </CardTitle>
                <CardDescription>
                  Drag a task into the calendar. Scheduled tasks disappear from
                  the backlog until you move them back.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4">
                {backlogTasks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.35] p-6 text-sm text-foreground/60 dark:bg-white/[0.03]">
                    All tasks are scheduled. Drag a calendar task back to backlog
                    if you want to re-prioritize it.
                  </div>
                ) : null}

                {backlogTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    className={[
                      "rounded-3xl border border-white/10 bg-white/[0.55] p-4 shadow-sm shadow-slate-950/5 dark:bg-white/[0.04]",
                      draggedTaskId === task.id ? "opacity-60" : "opacity-100",
                    ].join(" ")}
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-full border-white/10 bg-white/[0.5] dark:bg-white/[0.08]"
                        >
                          {task.estimate}
                        </Badge>
                        <GripVertical className="size-4 text-foreground/35" />
                      </div>
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
                        onClick={() =>
                          scheduleTask(task.id, clampSlotTime("13:00", parseEstimateToMinutes(task.estimate)))
                        }
                      >
                        <CalendarClock className="size-4" />
                        Add to 13:00
                      </Button>
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

            <div className="grid gap-6">
              <TaskComposer
                title="Post a task"
                description="Create a task locally, then drag it into the daily calendar."
                submitLabel="Post task"
                draft={newTaskDraft}
                onDraftChange={setNewTaskDraft}
                onSubmit={handleCreateTask}
              />

              <Card className="border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Focus className="size-5" />
                    Focus mode preview
                  </CardTitle>
                  <CardDescription>
                    The earliest scheduled task becomes the current focus target.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                      Active now
                    </p>
                    <h3 className="mt-3 text-xl font-semibold">
                      {focusTask?.title ?? "No task selected"}
                    </h3>
                    <p className="mt-2 text-sm text-foreground/65">
                      {focusTask?.meta ?? "Schedule a task on the calendar"}
                    </p>
                    <p className="mt-6 text-5xl font-semibold tracking-tight">48:12</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.5] p-4 dark:bg-white/[0.04]">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Clock3 className="size-4" />
                        Calendar load
                      </p>
                      <p className="mt-2 text-sm text-foreground/65">
                        {scheduledTaskItems.length} scheduled task blocks today
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.5] p-4 dark:bg-white/[0.04]">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="size-4" />
                        Ritual
                      </p>
                      <p className="mt-2 text-sm text-foreground/65">
                        Use drag-and-drop first, then refine details from the backlog.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {editingId ? (
              <TaskComposer
                title="Edit task"
                description="Update the selected task and persist the changes in localStorage."
                submitLabel="Save changes"
                draft={editingDraft}
                onDraftChange={setEditingDraft}
                onSubmit={handleSaveEdit}
                onCancel={handleCancelEditing}
              />
            ) : null}
          </div>

          <div className="grid gap-6">
            <Card className="overflow-hidden border-white/10 bg-white/[0.72] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
              <CardHeader className="border-b border-white/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CalendarClock className="size-5" />
                      Friday, March 14
                    </CardTitle>
                    <CardDescription>
                      Drag from the backlog and drop onto a 30-minute slot to place
                      tasks on the calendar.
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
              <CardContent className="p-3 sm:p-5">
                <div className="overflow-x-auto">
                  <div className="min-w-[640px] rounded-[2rem] border border-white/10 bg-white/[0.45] p-4 dark:bg-white/[0.03]">
                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-white/10 pb-3">
                      <div />
                      <div className="rounded-2xl border border-sky-500/15 bg-sky-500/[0.08] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.26em] text-foreground/50">
                          My calendar
                        </p>
                        <p className="mt-1 text-lg font-semibold">Tokyo time · 08:00 - 19:00</p>
                      </div>
                    </div>

                    <div className="relative mt-4 grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                      <div className="relative" style={{ height: `${gridHeight}px` }}>
                      {timeSlots.map((slot, index) => (
                        <div
                          key={slot}
                          className="absolute left-0 right-0 -translate-y-1/2 pr-2 text-right text-[11px] text-foreground/45"
                          style={{
                            top: `${index * slotMinutes * pxPerMinute}px`,
                          }}
                        >
                          {slot}
                        </div>
                      ))}
                      </div>

                      <div
                        className="relative rounded-3xl border border-white/10 bg-background/55 dark:bg-black/10"
                        style={{ height: `${gridHeight}px` }}
                      >
                        {timeSlots.map((slot, index) => (
                          <div
                            key={slot}
                            onDragOver={(event) => {
                              event.preventDefault()
                              setActiveDropSlot(slot)
                            }}
                            onDragLeave={() => {
                              if (activeDropSlot === slot) {
                                setActiveDropSlot(null)
                              }
                            }}
                            onDrop={(event) => {
                              event.preventDefault()
                              handleDropOnSlot(slot)
                            }}
                            className={[
                              "absolute inset-x-0 border-t transition-colors",
                              index % 2 === 0
                                ? "border-white/10"
                                : "border-dashed border-white/6",
                              activeDropSlot === slot
                                ? "bg-sky-500/[0.08]"
                                : "bg-transparent",
                            ].join(" ")}
                            style={{
                              top: `${index * slotMinutes * pxPerMinute}px`,
                              height: `${slotMinutes * pxPerMinute}px`,
                            }}
                          >
                        </div>
                      ))}

                        {calendarItems.map((item) => {
                          const startMinutes = timeToMinutes(item.startTime)
                          const offset = (startMinutes - dayStartHour * 60) * pxPerMinute
                          const height = Math.max(
                            item.durationMinutes * pxPerMinute,
                            44
                          )

                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            draggable={item.type === "task"}
                            title={`${item.title} · ${item.meta}`}
                            onDragStart={() => {
                              if (item.type === "task") {
                                handleDragStart(item.id)
                                }
                              }}
                              onDragEnd={handleDragEnd}
                              className={[
                                "absolute left-3 right-3 rounded-2xl border px-4 py-3 shadow-sm",
                                blockStyles[item.type].card,
                                item.type === "task" ? "cursor-grab active:cursor-grabbing" : "",
                              ].join(" ")}
                              style={{
                                top: `${offset}px`,
                                height: `${height}px`,
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`size-2 rounded-full ${blockStyles[item.type].dot}`}
                                  />
                                  <p className="truncate text-sm font-semibold leading-5">
                                    {shortenLabel(item.title, 15)}
                                  </p>
                                </div>
                              </div>
                                {item.type === "task" ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full bg-white/35 px-3 dark:bg-black/10"
                                    onClick={() => unscheduleTask(item.id)}
                                  >
                                    Backlog
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
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
