import Link from "next/link"
import {
  CalendarClock,
  Clock3,
  Focus,
  LogOut,
  Sparkles,
  Target,
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

type CalendarBlock = {
  time: string
  label: string
  type: "event" | "task" | "break" | "focus"
  duration: string
}

type BacklogTask = {
  id: string
  title: string
  estimate: string
  energy: "High" | "Medium" | "Low"
  source: "Calendar" | "Inbox" | "Project"
}

const todayPlan: CalendarBlock[] = [
  { time: "08:30", label: "Morning planning", type: "focus", duration: "30m" },
  { time: "09:00", label: "Design review with product", type: "event", duration: "45m" },
  { time: "10:00", label: "Finalize daily brief", type: "task", duration: "60m" },
  { time: "11:30", label: "Buffer / admin", type: "break", duration: "30m" },
  { time: "13:00", label: "Build drag-and-drop calendar shell", type: "task", duration: "90m" },
  { time: "15:00", label: "Focus mode prototype", type: "focus", duration: "50m" },
  { time: "16:30", label: "Team sync", type: "event", duration: "30m" },
]

const backlog: BacklogTask[] = [
  {
    id: "TSK-101",
    title: "Import Google Calendar blocks into daily plan",
    estimate: "2h",
    energy: "High",
    source: "Calendar",
  },
  {
    id: "TSK-102",
    title: "Draft unified backlog interactions",
    estimate: "45m",
    energy: "Medium",
    source: "Project",
  },
  {
    id: "TSK-103",
    title: "Write focus timer empty state",
    estimate: "30m",
    energy: "Low",
    source: "Inbox",
  },
  {
    id: "TSK-104",
    title: "Define Hono RPC contract for planning board",
    estimate: "1h",
    energy: "High",
    source: "Project",
  },
]

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
  break:
    "border-white/10 bg-white/[0.06] text-foreground/80",
  focus:
    "border-amber-500/30 bg-amber-500/[0.14] text-amber-950 dark:text-amber-100",
}

const energyStyles: Record<BacklogTask["energy"], string> = {
  High: "bg-rose-500/[0.15] text-rose-700 dark:text-rose-200",
  Medium: "bg-amber-500/[0.15] text-amber-700 dark:text-amber-200",
  Low: "bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-200",
}

export default function Day073Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.96))] text-foreground transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.96))]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-foreground/75">
                Daily Planning
              </Badge>
              <Badge className="rounded-full bg-emerald-500/80 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white shadow-sm">
                In Flow
              </Badge>
            </div>
            <div className="space-y-2">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Sunsama-style planner for calendar-aware task execution.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-foreground/70 sm:text-base">
                Import calendar commitments, pull from a unified backlog, and
                time-box the day with a calm two-column workspace.
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
              <CardDescription>Today&apos;s capacity</CardDescription>
              <CardTitle className="text-3xl">5h 55m</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Calendar commitments</CardDescription>
              <CardTitle className="text-3xl">2h 45m</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-white/[0.65] shadow-xl shadow-slate-950/5 backdrop-blur dark:bg-white/[0.05] dark:shadow-black/20">
            <CardHeader className="gap-1">
              <CardDescription>Focused blocks</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
          <Card className="overflow-hidden border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <CalendarClock className="size-5" />
                    Friday, March 14
                  </CardTitle>
                  <CardDescription>
                    Daily plan view with calendar imports and time-boxed task slots.
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
            <Card className="border-white/10 bg-white/[0.7] shadow-2xl shadow-slate-950/10 backdrop-blur dark:bg-white/[0.06] dark:shadow-black/20">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="size-5" />
                  Unified backlog
                </CardTitle>
                <CardDescription>
                  Tasks waiting to be dragged into the calendar.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4">
                {backlog.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.55] p-4 shadow-sm shadow-slate-950/5 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                          {task.id}
                        </p>
                        <h3 className="text-sm font-semibold leading-6">
                          {task.title}
                        </h3>
                      </div>
                      <Badge variant="outline" className="rounded-full border-white/10 bg-white/[0.5] dark:bg-white/[0.08]">
                        {task.estimate}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className={`rounded-full border-0 ${energyStyles[task.energy]}`}>
                        {task.energy} energy
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-white/10 bg-transparent">
                        {task.source}
                      </Badge>
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
                  Minimal timer surface for the currently active task.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                    Active now
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">
                    Build drag-and-drop calendar shell
                  </h3>
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
                      Capture wins and reschedule unfinished work.
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
