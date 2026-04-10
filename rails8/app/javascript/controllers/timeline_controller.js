import { Controller } from "@hotwired/stimulus"
import * as THREE from "three"
import { gsap } from "gsap"

export default class extends Controller {
  static values = {
    events: Array
  }

  connect() {
    this.boundHandleScroll = this.handleScroll.bind(this)
    this.boundResize = this.onWindowResize.bind(this)

    this.initThree()
    this.createTimeline()
    this.animate()
    this.boundHandleScroll()

    window.addEventListener("scroll", this.boundHandleScroll)
    window.addEventListener("resize", this.boundResize)
  }

  disconnect() {
    window.removeEventListener("scroll", this.boundHandleScroll)
    window.removeEventListener("resize", this.boundResize)

    if (this.renderer) this.renderer.dispose()
  }

  initThree() {
    this.container = document.getElementById("three-container")
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.9)
    pointLight.position.set(6, 8, 8)
    this.scene.add(pointLight)

    const fillLight = new THREE.PointLight(0xf4f0e8, 0.55)
    fillLight.position.set(-8, -2, 6)
    this.scene.add(fillLight)

    this.camera.position.z = 5
    this.camera.position.y = 0
  }

  createTimeline() {
    const material = new THREE.LineBasicMaterial({ color: 0x111111 })
    const points = []
    points.push(new THREE.Vector3(0, 10, 0))
    points.push(new THREE.Vector3(0, -100, 0))

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)
    this.scene.add(line)

    this.eventObjects = []
    this.eventsValue.forEach((event, index) => {
      const yPos = -index * 10

      const markerGeo = new THREE.SphereGeometry(0.14, 20, 20)
      const markerMat = new THREE.MeshStandardMaterial({
        color: event.category === "language" ? 0x111111 : 0x5f5f5f,
        roughness: 0.35,
        metalness: 0.05
      })
      const marker = new THREE.Mesh(markerGeo, markerMat)
      marker.position.set(0, yPos, 0)
      this.scene.add(marker)

      const boxGeo = new THREE.BoxGeometry(1.5, 0.8, 0.14)
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        roughness: 0.72,
        metalness: 0.02
      })
      const box = new THREE.Mesh(boxGeo, boxMat)

      const xOffset = event.side === "left" ? -2.1 : 2.1
      box.position.set(xOffset, yPos, 0)
      this.scene.add(box)

      this.eventObjects.push({
        mesh: box,
        marker,
        data: event,
        y: yPos,
        visible: false
      })
    })
  }

  handleScroll() {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
    const targetY = -scrollPercent * 100

    gsap.to(this.camera.position, {
      y: targetY,
      duration: 0.5,
      ease: "power2.out"
    })

    this.eventObjects.forEach((obj) => {
      const distance = Math.abs(this.camera.position.y - obj.y)
      if (distance < 5 && !obj.visible) {
        this.showEvent(obj)
      } else if (distance >= 5 && obj.visible) {
        this.hideEvent(obj)
      }
    })
  }

  showEvent(obj) {
    obj.visible = true
    gsap.to(obj.mesh.material, { opacity: 1, duration: 0.5 })
    gsap.to(obj.marker.scale, {
      x: 1.8,
      y: 1.8,
      z: 1.8,
      duration: 0.35,
      ease: "power2.out"
    })
    gsap.to(obj.mesh.position, {
      x: obj.data.side === "left" ? -1.35 : 1.35,
      duration: 0.5,
      ease: "back.out(1.7)"
    })

    this.updateHTMLLabel(obj)
  }

  hideEvent(obj) {
    obj.visible = false
    gsap.to(obj.mesh.material, { opacity: 0, duration: 0.5 })
    gsap.to(obj.marker.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: "power2.out"
    })
    gsap.to(obj.mesh.position, {
      x: obj.data.side === "left" ? -2.1 : 2.1,
      duration: 0.5
    })

    const label = document.getElementById(`label-${obj.data.year}-${obj.data.title.replace(/\s+/g, "-")}`)
    if (label) {
      gsap.to(label, { opacity: 0, duration: 0.3, onComplete: () => label.remove() })
    }
  }

  updateHTMLLabel(obj) {
    const labelContainer = document.getElementById("timeline-labels")
    const labelId = `label-${obj.data.year}-${obj.data.title.replace(/\s+/g, "-")}`

    if (!document.getElementById(labelId)) {
      const div = document.createElement("div")
      div.id = labelId
      div.className = `history-card ${obj.data.side === "left" ? "history-card--left" : "history-card--right"}`
      div.style.opacity = "0"
      div.innerHTML = `
        <p class="history-card__year">${obj.data.year}</p>
        <h3>${obj.data.title}</h3>
        <p>${obj.data.description}</p>
      `
      labelContainer.appendChild(div)
      gsap.to(div, { opacity: 1, duration: 0.3, ease: "power2.out" })
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.renderer.render(this.scene, this.camera)
  }
}
