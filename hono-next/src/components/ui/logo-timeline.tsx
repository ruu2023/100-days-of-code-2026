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
  detailTitle?: string
  detailEyebrow?: string
  detailSections?: Array<{
    label: string
    value: string
  }>
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
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null)

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
        className="bg-background relative h-full w-full overflow-hidden py-24 ring-inset sm:py-32"
        onMouseEnter={() => animateOnHover && setIsHovered(true)}
        onMouseLeave={() => {
          if (animateOnHover) {
            setIsHovered(false)
          }
          setActiveItemKey(null)
        }}
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
                    "absolute top-1/2 [--move-x-from:-110%] [--move-x-to:calc(100vw+8rem)] [animation-iteration-count:infinite] [animation-name:move-x] [animation-timing-function:linear]"
                  )}
                  style={{
                    animationDelay: `${logo.animationDelay}s`,
                    animationDuration: `${logo.animationDuration}s`,
                    animationPlayState: activeItemKey === `${logo.row}-${logo.label}` ? "paused" : animationPlayState,
                  }}
                >
                  <div className="relative -translate-y-1/2">
                    <button
                      type="button"
                      className={cn(
                        "relative flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-left",
                        "ring-background/10 bg-linear-to-t from-white/70 from-50% to-white/60 ring-1 ring-inset backdrop-blur-sm dark:from-neutral-900 dark:to-gray-900 dark:ring-foreground/10",
                        "shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:outline-none dark:shadow-none"
                      )}
                      onMouseEnter={() => setActiveItemKey(`${logo.row}-${logo.label}`)}
                      onMouseLeave={() => setActiveItemKey((current) => (current === `${logo.row}-${logo.label}` ? null : current))}
                      onFocus={() => setActiveItemKey(`${logo.row}-${logo.label}`)}
                      onBlur={() => setActiveItemKey((current) => (current === `${logo.row}-${logo.label}` ? null : current))}
                    >
                      {renderIcon(logo.icon)}
                      <span className="text-foreground text-sm/6 font-medium">
                        {logo.label}
                      </span>
                    </button>

                    {logo.detailSections?.length && activeItemKey === `${logo.row}-${logo.label}` ? (
                      <div
                        className="absolute top-0 left-1/2 z-20 w-[min(22rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-[calc(100%+1rem)] rounded-2xl border border-border/70 bg-background/95 p-4 text-left shadow-xl backdrop-blur-md"
                        onMouseEnter={() => setActiveItemKey(`${logo.row}-${logo.label}`)}
                        onMouseLeave={() => setActiveItemKey((current) => (current === `${logo.row}-${logo.label}` ? null : current))}
                      >
                        <div className="space-y-1">
                          {logo.detailEyebrow ? (
                            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                              {logo.detailEyebrow}
                            </p>
                          ) : null}
                          {logo.detailTitle ? (
                            <p className="text-base font-semibold text-foreground">{logo.detailTitle}</p>
                          ) : null}
                        </div>
                        <div className="mt-3 space-y-3 text-sm">
                          {logo.detailSections.map((section) => (
                            <div key={`${logo.label}-${section.label}`} className="space-y-1">
                              <p className="font-medium text-foreground">{section.label}</p>
                              <p className="text-muted-foreground">{section.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
