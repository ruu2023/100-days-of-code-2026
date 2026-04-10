"use client"

import React, { useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface LogoItem {
  label: string
  icon: React.ReactNode
  animationDelay: number
  animationDuration: number
  row: number
}

export interface LogoTimelineProps {
  items: LogoItem[]
  title?: string
  height?: string
  className?: string
  iconSize?: number
  showRowSeparator?: boolean
  animateOnHover?: boolean
}

export function LogoTimeline({
  items,
  title,
  height = "h-[400px] sm:h-[800px]",
  className,
  iconSize = 16,
  showRowSeparator = true,
  animateOnHover = false,
}: LogoTimelineProps) {
  const [isHovered, setIsHovered] = useState(false)

  const rowsMap = new Map<number, LogoItem[]>()
  items.forEach((item) => {
    if (!rowsMap.has(item.row)) {
      rowsMap.set(item.row, [])
    }
    rowsMap.get(item.row)?.push(item)
  })

  const rows = Array.from(rowsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, rowItems]) => rowItems)

  const animationPlayState = animateOnHover
    ? isHovered
      ? "running"
      : "paused"
    : "running"

  const renderIcon = (icon: React.ReactNode) => {
    if (React.isValidElement<{ className?: string; size?: number }>(icon)) {
      return React.cloneElement(icon, {
        size: iconSize,
        className: cn("shrink-0", icon.props.className),
      })
    }

    return <span className="shrink-0">{icon}</span>
  }

  return (
    <section className={cn("w-full", height, className)}>
      <motion.div
        aria-hidden="true"
        className="bg-background relative h-full w-full overflow-hidden py-24 ring-inset sm:py-32"
        onMouseEnter={() => animateOnHover && setIsHovered(true)}
        onMouseLeave={() => animateOnHover && setIsHovered(false)}
      >
        {title && (
          <div className="absolute top-1/2 left-1/2 mx-auto w-full max-w-[90%] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative z-10">
              <p className="text-foreground/10 mx-auto mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-pretty sm:text-5xl md:text-6xl">
                {title}
              </p>
            </div>
          </div>
        )}

        <div
          className="@container absolute inset-0 grid"
          style={{ gridTemplateRows: `repeat(${rows.length}, 1fr)` }}
        >
          {rows.map((rowItems, index) => (
            <div className="group relative flex items-center" key={index}>
              <div className="from-foreground/15 absolute inset-x-0 top-1/2 h-0.5 bg-linear-to-r from-[2px] to-[2px] bg-size-[12px_100%]" />

              {showRowSeparator && (
                <div className="from-foreground/5 absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-[2px] to-[2px] bg-size-[12px_100%] group-last:hidden" />
              )}

              {rowItems.map((logo) => (
                <div
                  key={`${logo.row}-${logo.label}`}
                  className={cn(
                    "absolute top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5",
                    "ring-background/10 rounded-full bg-linear-to-t from-white/50 from-50% to-white/50 ring-1 ring-inset backdrop-blur-sm dark:from-neutral-900 dark:to-gray-900 dark:ring-foreground/10",
                    "repeat-[infinite] [--move-x-from:-100%] [--move-x-to:calc(100%+100cqw)] [animation-name:move-x] [animation-timing-function:linear]",
                    "shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-none"
                  )}
                  style={{
                    animationDelay: `${logo.animationDelay}s`,
                    animationDuration: `${logo.animationDuration}s`,
                    animationPlayState,
                  }}
                >
                  {renderIcon(logo.icon)}
                  <span className="text-foreground text-sm/6 font-medium">
                    {logo.label}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
