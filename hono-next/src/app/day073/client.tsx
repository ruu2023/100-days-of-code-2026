"use client"

import Link from "next/link"
import { useEffect, useId, useState, useSyncExternalStore } from "react"
import {
  CalendarClock,
  Focus,
  GripVertical,
  LogOut,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  X,
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
  date: string
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

type TaskCalendarItem = ScheduledCalendarItem & {
  type: "task"
}

type TokyoNowInfo = {
  dateKey: string
  minutes: number
}

const storageKey = "day073-planner-state"
const storageEvent = "day073-planner-updated"
const defaultSelectedDate = "2026-03-14"
const dayStartHour = 8
const dayEndHour = 23
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

const baseCalendar: CalendarBlock[] = []

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

const energyOptions: TaskEnergy[] = ["Low", "Medium", "High"]
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
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

function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function parseDateString(value: string) {
  return new Date(`${value}T00:00:00`)
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function shiftDate(value: string, offset: number) {
  const date = parseDateString(value)
  date.setDate(date.getDate() + offset)
  return formatDateKey(date)
}

function formatHeaderDate(value: string) {
  const date = parseDateString(value)
  return `${weekdayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`
}

function buildWeekdays(value: string) {
  return Array.from({ length: 5 }, (_, index) => {
    const date = parseDateString(shiftDate(value, index - 2))
    const dateKey = formatDateKey(date)

    return {
      key: dateKey,
      name: weekdayNames[date.getDay()],
      date: String(date.getDate()).padStart(2, "0"),
      state:
        dateKey === value ? "active" : dateKey < value ? "done" : "next",
    }
  })
}

function getTokyoNowInfo(): TokyoNowInfo | null {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date())
  const getValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value

  const year = getValue("year")
  const month = getValue("month")
  const day = getValue("day")
  const hour = getValue("hour")
  const minute = getValue("minute")

  if (!year || !month || !day || !hour || !minute) {
    return null
  }

  return {
    dateKey: `${year}-${month}-${day}`,
    minutes: Number(hour) * 60 + Number(minute),
  }
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
    const parsedValue: unknown = JSON.parse(rawValue)
    if (!isObjectRecord(parsedValue)) {
      return defaultPlannerState
    }

    if (
      !Array.isArray(parsedValue.tasks) ||
      !Array.isArray(parsedValue.scheduled)
    ) {
      return defaultPlannerState
    }

    const parsedTasks = parsedValue.tasks
    const parsedScheduled = parsedValue.scheduled

    const tasks = parsedTasks.filter(
      (task: unknown): task is PlannerTask => {
        if (!isObjectRecord(task)) {
          return false
        }

        return (
          typeof task.id === "string" &&
          typeof task.title === "string" &&
          typeof task.estimate === "string" &&
          typeof task.source === "string" &&
          typeof task.energy === "string" &&
          typeof task.notes === "string" &&
          typeof task.createdAt === "string"
        )
      }
    )

    const taskIds = new Set(tasks.map((task) => task.id))
    const scheduled = parsedScheduled.filter(
      (item: unknown): item is ScheduledTask => {
        if (!isObjectRecord(item)) {
          return false
        }

        return (
          typeof item.taskId === "string" &&
          (typeof item.date === "string" || typeof item.date === "undefined") &&
          typeof item.startTime === "string" &&
          taskIds.has(item.taskId)
        )
      }
    )

    return {
      tasks,
      scheduled: scheduled.map((item) => ({
        ...item,
        date: item.date || defaultSelectedDate,
      })),
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
  const [selectedDate, setSelectedDate] = useState(defaultSelectedDate)
  const [currentTime, setCurrentTime] = useState<TokyoNowInfo | null>(null)
  const [focusModeOpen, setFocusModeOpen] = useState(false)
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null)
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState(0)
  const [focusRunning, setFocusRunning] = useState(false)

  useEffect(() => {
    hasHydrated = true
    window.dispatchEvent(new Event(storageEvent))
  }, [])

  useEffect(() => {
    let intervalId: number | null = null
    const timerId = window.setTimeout(() => {
      setCurrentTime(getTokyoNowInfo())
      intervalId = window.setInterval(() => {
        setCurrentTime(getTokyoNowInfo())
      }, 60_000)
    }, 0)

    return () => {
      window.clearTimeout(timerId)
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  const scheduledTaskIds = new Set(scheduled.map((item) => item.taskId))
  const backlogTasks = tasks.filter((task) => !scheduledTaskIds.has(task.id))
  const scheduledTaskItems = scheduled.reduce<TaskCalendarItem[]>((items, item) => {
      if (item.date !== selectedDate) {
        return items
      }

      const task = tasks.find((candidate) => candidate.id === item.taskId)
      if (!task) {
        return items
      }

      items.push({
        id: task.id,
        title: task.title,
        startTime: clampSlotTime(item.startTime, parseEstimateToMinutes(task.estimate)),
        durationMinutes: parseEstimateToMinutes(task.estimate),
        type: "task" as const,
        meta: `${task.estimate} · ${task.source}`,
      })

      return items
    }, [])

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
  const weekdays = buildWeekdays(selectedDate)
  const showCurrentTimeLine =
    currentTime !== null && currentTime.dateKey === selectedDate
  const currentTimeOffset = showCurrentTimeLine
    ? (currentTime.minutes - dayStartHour * 60) * pxPerMinute
    : null

  const totalEstimatedMinutes = tasks.reduce(
    (total, task) => total + parseEstimateToMinutes(task.estimate),
    0
  )
  const elapsedScheduledMinutes =
    currentTime === null
      ? 0
      : scheduled.reduce((total, item) => {
          const task = tasks.find((candidate) => candidate.id === item.taskId)
          if (!task) {
            return total
          }

          const taskDuration = parseEstimateToMinutes(task.estimate)
          const taskEndMinutes = timeToMinutes(item.startTime) + taskDuration

          if (
            item.date < currentTime.dateKey ||
            (item.date === currentTime.dateKey && taskEndMinutes <= currentTime.minutes)
          ) {
            return total + taskDuration
          }

          return total
        }, 0)
  const scheduledMinutes = scheduledTaskItems.reduce(
    (total, item) => total + item.durationMinutes,
    0
  )
  const remainingEstimatedMinutes = Math.max(
    totalEstimatedMinutes - elapsedScheduledMinutes,
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
  const activeFocusTask =
    tasks.find((task) => task.id === activeFocusTaskId) ??
    (focusTask ? tasks.find((task) => task.id === focusTask.id) ?? null : null)
  const activeFocusDurationSeconds = activeFocusTask
    ? parseEstimateToMinutes(activeFocusTask.estimate) * 60
    : 0
  const focusProgress = activeFocusDurationSeconds
    ? 1 - focusSecondsRemaining / activeFocusDurationSeconds
    : 0

  function getTaskScheduledEndMinutes(taskId: string) {
    const scheduledItem = scheduled.find(
      (item) => item.taskId === taskId && item.date === selectedDate
    )
    if (!scheduledItem) {
      return null
    }

    const task = tasks.find((candidate) => candidate.id === taskId)
    if (!task) {
      return null
    }

    return (
      timeToMinutes(scheduledItem.startTime) +
      parseEstimateToMinutes(task.estimate)
    )
  }

  function getInitialFocusSeconds(task: PlannerTask) {
    const scheduledEndMinutes = getTaskScheduledEndMinutes(task.id)
    if (
      scheduledEndMinutes !== null &&
      currentTime !== null &&
      currentTime.dateKey === selectedDate
    ) {
      const remainingMinutes = scheduledEndMinutes - currentTime.minutes
      if (remainingMinutes > 0) {
        return remainingMinutes * 60
      }
    }

    return parseEstimateToMinutes(task.estimate) * 60
  }

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
          item.taskId === taskId
            ? { ...item, date: selectedDate, startTime: nextStartTime }
            : item
        )
      : [...scheduled, { taskId, date: selectedDate, startTime: nextStartTime }]

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

  function openFocusMode(taskId?: string) {
    const nextTask =
      tasks.find((task) => task.id === taskId) ??
      (focusTask ? tasks.find((task) => task.id === focusTask.id) : null) ??
      tasks[0] ??
      null

    if (!nextTask) {
      return
    }

    setActiveFocusTaskId(nextTask.id)
    setFocusSecondsRemaining(getInitialFocusSeconds(nextTask))
    setFocusRunning(true)
    setFocusModeOpen(true)
  }

  function closeFocusMode() {
    setFocusModeOpen(false)
    setFocusRunning(false)
  }

  function resetFocusTimer() {
    if (!activeFocusTask) {
      return
    }

    setFocusSecondsRemaining(getInitialFocusSeconds(activeFocusTask))
    setFocusRunning(false)
  }

  useEffect(() => {
    if (!focusModeOpen || !focusRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setFocusSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          setFocusRunning(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [focusModeOpen, focusRunning])

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
                {Math.floor(remainingEstimatedMinutes / 60)}h {remainingEstimatedMinutes % 60}m
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
                        onClick={() => openFocusMode(task.id)}
                      >
                        <Focus className="size-4" />
                        Focus
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

              <TaskComposer
                title="Post a task"
                description="Create a task locally, then drag it into the daily calendar."
                submitLabel="Post task"
                draft={newTaskDraft}
                onDraftChange={setNewTaskDraft}
                onSubmit={handleCreateTask}
              />
            </div>

          </div>

          <div className="grid gap-6">
            <Card className="overflow-hidden border-white/10 bg-white/[0.72] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
              <CardHeader className="border-b border-white/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CalendarClock className="size-5" />
                      {formatHeaderDate(selectedDate)}
                    </CardTitle>
                    <CardDescription>
                      Drag from the backlog and drop onto a 30-minute slot to place
                      tasks on the calendar.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedDate((current) => shiftDate(current, -1))}
                    >
                      Prev
                    </Button>
                    {weekdays.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        className={[
                          "flex min-w-14 flex-col items-center rounded-2xl border px-3 py-2 text-center transition-colors",
                          day.state === "active"
                            ? "border-sky-500/40 bg-sky-500/15"
                            : "border-white/10 bg-white/[0.08]",
                        ].join(" ")}
                        onClick={() => setSelectedDate(day.key)}
                      >
                        <span className="text-[11px] uppercase tracking-[0.24em] text-foreground/55">
                          {day.name}
                        </span>
                        <span className="mt-1 text-lg font-semibold">{day.date}</span>
                      </button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedDate((current) => shiftDate(current, 1))}
                    >
                      Next
                    </Button>
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
                        {showCurrentTimeLine &&
                        currentTimeOffset !== null &&
                        currentTimeOffset >= 0 &&
                        currentTimeOffset <= gridHeight ? (
                          <div
                            className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-sky-500"
                            style={{ top: `${currentTimeOffset}px` }}
                          >
                            <span className="absolute -left-1 -top-[5px] size-2.5 rounded-full bg-sky-500" />
                            <span className="absolute left-3 -top-5 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-medium text-white">
                              Now
                            </span>
                          </div>
                        ) : null}
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
                            onDragStart={() => {
                              if (item.type === "task") {
                                handleDragStart(item.id)
                                }
                              }}
                              onDragEnd={handleDragEnd}
                            className={[
                              "group absolute left-3 right-3 rounded-2xl border px-4 py-3 shadow-sm",
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
                                    {shortenLabel(item.title, 30)}
                                  </p>
                                </div>
                              </div>
                              <div className="pointer-events-none absolute -top-12 left-3 z-20 rounded-xl bg-slate-950 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-950">
                                <p className="whitespace-nowrap font-medium">{item.title}</p>
                                <p className="mt-1 whitespace-nowrap text-white/75 dark:text-slate-700">
                                  {item.meta}
                                </p>
                              </div>
                              {item.type === "task" ? (
                                <div className="flex gap-2">
                                  {tasks.find((task) => task.id === item.id) ? (
                                    <>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full bg-white/35 px-3 dark:bg-black/10"
                                        draggable={false}
                                        onPointerDown={(event) => event.stopPropagation()}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={() => openFocusMode(item.id)}
                                      >
                                        Focus
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full bg-white/35 px-3 dark:bg-black/10"
                                        draggable={false}
                                        onPointerDown={(event) => event.stopPropagation()}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={() => {
                                          const task = tasks.find((candidate) => candidate.id === item.id)
                                          if (task) {
                                            handleStartEditing(task)
                                          }
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    </>
                                  ) : null}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full bg-white/35 px-3 dark:bg-black/10"
                                    draggable={false}
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={() => unscheduleTask(item.id)}
                                  >
                                    Backlog
                                  </Button>
                                </div>
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
      {focusModeOpen && activeFocusTask ? (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.97),_rgba(15,23,42,0.98))] text-white">
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
            <div className="flex items-center justify-between">
              <Badge className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white">
                Focus Mode
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full bg-white/10 text-white hover:bg-white/15 hover:text-white"
                onClick={closeFocusMode}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm uppercase tracking-[0.32em] text-white/50">
                Active task
              </p>
              <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
                {activeFocusTask.title}
              </h2>
              <p className="mt-4 text-sm text-white/65 sm:text-base">
                {activeFocusTask.estimate} · {activeFocusTask.source}
              </p>

              <div className="mt-12 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
                <p className="text-7xl font-semibold tracking-tight sm:text-8xl">
                  {formatTimer(focusSecondsRemaining)}
                </p>
                <div className="mt-8 h-3 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-[width]"
                    style={{ width: `${Math.max(0, Math.min(focusProgress * 100, 100))}%` }}
                  />
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    className="rounded-full bg-sky-500 px-5 text-white hover:bg-sky-400"
                    onClick={() => setFocusRunning((current) => !current)}
                  >
                    {focusRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
                    {focusRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                    onClick={resetFocusTimer}
                  >
                    <RotateCcw className="size-4" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      const nextTask = tasks.find((task) => task.id !== activeFocusTask.id)
                      if (nextTask) {
                        setActiveFocusTaskId(nextTask.id)
                        setFocusSecondsRemaining(getInitialFocusSeconds(nextTask))
                        setFocusRunning(true)
                      }
                    }}
                  >
                    <Target className="size-4" />
                    Switch task
                  </Button>
                </div>
              </div>

              <p className="mt-8 max-w-xl text-sm leading-7 text-white/55">
                {activeFocusTask.notes || "Stay on one thing. When the timer ends, review progress and reschedule the next block."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
