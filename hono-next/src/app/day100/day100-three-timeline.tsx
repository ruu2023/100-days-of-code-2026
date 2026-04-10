"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { Badge } from "@/components/ui/badge"
import { programmingLanguageHistory } from "@/components/logo-timeline-demo"

type TimelineItem = (typeof programmingLanguageHistory)[number] & {
  year: number
}

const laneOffsets = [-30, 24, -16, 34, -38, 14]

export function Day100ThreeTimeline() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const items = useMemo<TimelineItem[]>(
    () =>
      [...programmingLanguageHistory]
        .map((item) => ({
          ...item,
          year: Number.parseInt(item.yearLabel, 10),
        }))
        .sort((a, b) => a.year - b.year),
    []
  )
  const [activeName, setActiveName] = useState(items[0]?.name ?? null)

  const activeItem = items.find((item) => item.name === activeName) ?? items[0]
  const minYear = items[0]?.year ?? 1950
  const maxYear = items[items.length - 1]?.year ?? 2015
  const yearSpan = Math.max(1, maxYear - minYear)
  const decadeMarks = Array.from(
    { length: Math.floor(maxYear / 10) - Math.ceil(minYear / 10) + 1 },
    (_, index) => (Math.ceil(minYear / 10) + index) * 10
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 18)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    const timelineWidth = 24
    const curvePoints = items.map((item, index) => {
      const x = -timelineWidth / 2 + ((item.year - minYear) / yearSpan) * timelineWidth
      const y = Math.sin(index * 0.72) * 0.9
      return new THREE.Vector3(x, y, 0)
    })

    const curve = new THREE.CatmullRomCurve3(curvePoints)
    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 320, 0.05, 12, false),
      new THREE.MeshBasicMaterial({ color: "#f8fafc", transparent: true, opacity: 0.9 })
    )
    rootGroup.add(ribbon)

    const ribbonGlow = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 320, 0.16, 12, false),
      new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.12 })
    )
    rootGroup.add(ribbonGlow)

    const nodePalette = ["#f97316", "#38bdf8", "#14b8a6", "#facc15", "#fb7185", "#a78bfa"]
    curvePoints.forEach((point, index) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 18, 18),
        new THREE.MeshBasicMaterial({ color: nodePalette[index % nodePalette.length] })
      )
      node.position.copy(point)
      rootGroup.add(node)

      const aura = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 18, 18),
        new THREE.MeshBasicMaterial({
          color: nodePalette[index % nodePalette.length],
          transparent: true,
          opacity: 0.16,
        })
      )
      aura.position.copy(point)
      rootGroup.add(aura)
    })

    const particleCount = 180
    const particlePositions = new Float32Array(particleCount * 3)
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: "#e2e8f0",
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    rootGroup.add(particles)

    const pointer = { x: 0, y: 0 }
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
    }

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }

    const clock = new THREE.Clock()
    const animate = () => {
      const elapsed = clock.getElapsedTime()

      for (let index = 0; index < particleCount; index += 1) {
        const t = (index / particleCount + elapsed * 0.028) % 1
        const point = curve.getPointAt(t)
        const normalOffset = Math.sin(elapsed * 2 + index) * 0.06
        particlePositions[index * 3] = point.x
        particlePositions[index * 3 + 1] = point.y + normalOffset
        particlePositions[index * 3 + 2] = Math.cos(elapsed + index) * 0.08
      }

      particleGeometry.attributes.position.needsUpdate = true

      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, -pointer.y * 0.08, 0.04)
      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, pointer.x * 0.16, 0.04)
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.6, 0.03)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.8, 0.03)
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    resize()
    renderer.setAnimationLoop(animate)
    window.addEventListener("resize", resize)
    container.addEventListener("pointermove", handlePointerMove)

    return () => {
      renderer.setAnimationLoop(null)
      window.removeEventListener("resize", resize)
      container.removeEventListener("pointermove", handlePointerMove)
      rootGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [items, maxYear, minYear, yearSpan])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_38%,#020617_100%)] text-slate-50">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:7rem_100%] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_55%,rgba(2,6,23,0.88)_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-6 sm:px-10 sm:py-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="w-fit border border-white/15 bg-white/8 font-mono text-slate-100">Day 100</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                プログラミング言語の歴史年表
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                左から右へ時代が進みます。年表上のノードにホバーすると、作者、目的、比較対象をその場で確認できます。
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-slate-300 backdrop-blur-md sm:grid-cols-3 lg:w-[28rem]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Range</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {minYear} - {maxYear}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Items</p>
              <p className="mt-1 text-lg font-semibold text-white">{items.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Focus</p>
              <p className="mt-1 text-lg font-semibold text-white">Chronology</p>
            </div>
          </div>
        </header>

        <div className="relative mt-10 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent" />

          {decadeMarks.map((year) => {
            const left = 8 + ((year - minYear) / yearSpan) * 84
            return (
              <div
                key={year}
                className="absolute top-[18%] bottom-[14%] w-px bg-white/10"
                style={{ left: `${left}%` }}
              >
                <span className="absolute top-[-1.75rem] left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-[0.24em] text-slate-500 uppercase sm:text-xs">
                  {year}s
                </span>
              </div>
            )
          })}

          {items.map((item, index) => {
            const left = 8 + ((item.year - minYear) / yearSpan) * 84
            const offset = laneOffsets[index % laneOffsets.length]
            const isAbove = offset < 0
            const connectorHeight = Math.abs(offset)

            return (
              <div key={item.name} className="absolute inset-y-[18%]" style={{ left: `${left}%` }}>
                <div className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.65)]" />
                <div
                  className="absolute left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-sky-300/80 to-white/0"
                  style={{
                    top: isAbove ? `calc(50% - ${connectorHeight}%)` : "50%",
                    height: `${connectorHeight}%`,
                  }}
                />
                <button
                  type="button"
                  className="absolute left-1/2 w-max max-w-[10rem] -translate-x-1/2 rounded-2xl border border-white/14 bg-slate-950/75 px-3 py-2 text-left shadow-xl backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-sky-300/60 focus-visible:-translate-y-1 focus-visible:border-sky-300/60 focus-visible:outline-none"
                  style={{ top: `calc(50% + ${offset}%)` }}
                  onMouseEnter={() => setActiveName(item.name)}
                  onFocus={() => setActiveName(item.name)}
                >
                  <p className="text-[10px] font-medium tracking-[0.22em] text-slate-400 uppercase">{item.yearLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.name}</p>
                </button>
              </div>
            )
          })}

          <aside className="absolute right-0 bottom-0 w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
                {activeItem.period}
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">{activeItem.name}</h2>
                <span className="text-sm font-medium text-sky-300">{activeItem.yearLabel}</span>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <div>
                <p className="font-medium text-white">作者</p>
                <p>{activeItem.creator}</p>
              </div>
              <div>
                <p className="font-medium text-white">目的</p>
                <p>{activeItem.purpose}</p>
              </div>
              <div>
                <p className="font-medium text-white">対抗馬・比較対象</p>
                <p>{activeItem.comparison}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Day100ThreeTimeline
