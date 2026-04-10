"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { Badge } from "@/components/ui/badge"
import { programmingLanguageHistory } from "@/components/logo-timeline-demo"

type TimelineItem = (typeof programmingLanguageHistory)[number] & {
  year: number
}

export function Day100ThreeTimeline() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])
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
  const [visibleNames, setVisibleNames] = useState<Record<string, boolean>>({})

  const activeItem = items.find((item) => item.name === activeName) ?? items[0]
  const minYear = items[0]?.year ?? 1951
  const maxYear = items[items.length - 1]?.year ?? 2014

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 11)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    scene.add(new THREE.AmbientLight("#ffffff", 1.8))
    const directionalLight = new THREE.DirectionalLight("#ffffff", 1.1)
    directionalLight.position.set(3, 2, 6)
    scene.add(directionalLight)
    const rimLight = new THREE.PointLight("#7dd3fc", 6, 18, 2)
    rimLight.position.set(-3, -1, 4)
    scene.add(rimLight)

    const points = Array.from({ length: 12 }, (_, index) => {
      const progress = index / 11
      return new THREE.Vector3(
        Math.sin(progress * Math.PI * 2.2) * 1.2,
        4.6 - progress * 9.2,
        Math.cos(progress * Math.PI * 2.8) * 0.8
      )
    })
    const curve = new THREE.CatmullRomCurve3(points)

    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 300, 0.045, 12, false),
      new THREE.MeshPhysicalMaterial({
        color: "#0f172a",
        transparent: true,
        opacity: 0.12,
        roughness: 0.3,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
      })
    )
    rootGroup.add(ribbon)

    const ribbonGlow = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 300, 0.12, 12, false),
      new THREE.MeshPhysicalMaterial({
        color: "#38bdf8",
        transparent: true,
        opacity: 0.06,
        roughness: 0.5,
        metalness: 0,
        transmission: 0.2,
      })
    )
    rootGroup.add(ribbonGlow)

    const glassLayers = [-1.8, 1.9].map((xOffset, index) => {
      const layerCurve = curve.clone()
      const offsetPoints = layerCurve.points.map(
        (point, pointIndex) =>
          new THREE.Vector3(
            point.x + xOffset,
            point.y + Math.sin(pointIndex * 0.7) * 0.25,
            point.z - 1.2 - index * 0.8
          )
      )
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(offsetPoints), 220, 0.026, 10, false),
        new THREE.MeshPhysicalMaterial({
          color: index === 0 ? "#bae6fd" : "#cbd5e1",
          transparent: true,
          opacity: 0.12,
          roughness: 0.2,
          metalness: 0.05,
          transmission: 0.55,
          clearcoat: 1,
          clearcoatRoughness: 0.15,
        })
      )
      rootGroup.add(mesh)
      return mesh
    })

    const particleCount = 160
    const particlePositions = new Float32Array(particleCount * 3)
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: "#0f172a",
      size: 0.05,
      transparent: true,
      opacity: 0.18,
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
        const t = (index / particleCount + elapsed * 0.035) % 1
        const point = curve.getPointAt(t)
        particlePositions[index * 3] = point.x + Math.sin(elapsed + index) * 0.04
        particlePositions[index * 3 + 1] = point.y
        particlePositions[index * 3 + 2] = point.z + Math.cos(elapsed * 0.7 + index) * 0.28
      }

      particleGeometry.attributes.position.needsUpdate = true
      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, pointer.x * 0.1, 0.03)
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, pointer.y * 0.05, 0.03)
      rootGroup.position.y = Math.sin(elapsed * 0.35) * 0.12
      rimLight.position.x = Math.sin(elapsed * 0.8) * 4
      glassLayers.forEach((mesh, index) => {
        mesh.rotation.z = Math.sin(elapsed * 0.25 + index) * 0.06
      })
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
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleNames((current) => {
          const next = { ...current }
          let changed = false

          entries.forEach((entry) => {
            const name = entry.target.getAttribute("data-name")
            if (!name) {
              return
            }

            if (entry.isIntersecting && !next[name]) {
              next[name] = true
              changed = true
            }

            if (entry.isIntersecting) {
              setActiveName(name)
            }
          })

          return changed ? next : current
        })
      },
      {
        threshold: 0.35,
        rootMargin: "-10% 0px -25% 0px",
      }
    )

    itemRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <section className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      <div ref={containerRef} className="pointer-events-none absolute inset-0 opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_18%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.88)_24%,rgba(255,255,255,0.94)_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="border-slate-200/80 relative z-10 border-b pb-8">
          <Badge className="border-slate-200 bg-white font-mono text-slate-700">Day 100</Badge>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                プログラミング言語の歴史年表
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                上から下へ時代が進みます。Three.js は背景の流れだけに使い、年表自体は縦スクロールで前後関係を追いやすくしています。
                各項目にホバーすると右側の詳細が切り替わります。
              </p>
            </div>
            <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-md sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Range</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {minYear} - {maxYear}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Items</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{items.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Flow</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">Vertical</p>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
          <div className="relative pl-16 sm:pl-20">
            <div className="absolute top-0 bottom-0 left-5 w-px bg-gradient-to-b from-sky-200 via-slate-200 to-transparent sm:left-7" />
            {items.map((item, index) => {
              const isActive = item.name === activeItem.name

              return (
                <article
                  key={item.name}
                  ref={(element) => {
                    itemRefs.current[index] = element
                  }}
                  data-name={item.name}
                  className={[
                    "group relative pb-10 transition-all duration-700 ease-out last:pb-0",
                    visibleNames[item.name] ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
                  ].join(" ")}
                  onMouseEnter={() => setActiveName(item.name)}
                  onFocus={() => setActiveName(item.name)}
                >
                  <div className="absolute top-2 left-0 flex w-12 flex-col items-center sm:w-14">
                    <span
                      className={[
                        "h-4 w-4 rounded-full border-4 transition-colors duration-200",
                        isActive ? "border-sky-400 bg-white" : "border-slate-200 bg-white",
                      ].join(" ")}
                    />
                    {index < items.length - 1 ? <span className="mt-2 h-full w-px bg-slate-200" /> : null}
                  </div>

                  <button
                    type="button"
                    className={[
                      "w-full rounded-[1.75rem] border bg-white/92 p-5 text-left shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-sm transition duration-300",
                      isActive
                        ? "border-sky-300 shadow-[0_24px_60px_rgba(14,165,233,0.14)]"
                        : "border-slate-200 hover:border-sky-200 hover:shadow-[0_20px_56px_rgba(15,23,42,0.08)]",
                    ].join(" ")}
                    onMouseEnter={() => setActiveName(item.name)}
                    onFocus={() => setActiveName(item.name)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">{item.period}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{item.name}</h2>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-sm text-slate-700">
                        {item.yearLabel}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{item.purpose}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">作者</span>
                      <span>{item.creator}</span>
                    </div>
                  </button>
                </article>
              )
            })}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_72px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
                  {activeItem.period}
                </p>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-3xl font-semibold text-slate-950">{activeItem.name}</h2>
                  <span className="font-mono text-sky-700">{activeItem.yearLabel}</span>
                </div>
              </div>
              <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
                <div>
                  <p className="font-medium text-slate-950">作者</p>
                  <p>{activeItem.creator}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-950">目的</p>
                  <p>{activeItem.purpose}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-950">対抗馬・比較対象</p>
                  <p>{activeItem.comparison}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Day100ThreeTimeline
