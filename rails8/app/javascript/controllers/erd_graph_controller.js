import { Controller } from "@hotwired/stimulus";

const FORCE_GRAPH_URL = "https://cdn.jsdelivr.net/npm/3d-force-graph@1.79.0/+esm";
const SPRITE_TEXT_URL = "https://cdn.jsdelivr.net/npm/three-spritetext@1.10.0/+esm";
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";
const D3_FORCE_URL = "https://cdn.jsdelivr.net/npm/d3-force-3d@3/+esm";
const CARD_WIDTH = 620;
const HEADER_HEIGHT = 82;
const ROW_HEIGHT = 46;
const FOOTER_HEIGHT = 26;
const CARD_WORLD_SCALE = 0.24;

export default class extends Controller {
  static targets = ["detail"];

  static values = {
    graphUrl: String,
    positionBase: String,
  };

  async connect() {
    this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    this.abortController = new AbortController();

    try {
      const [
        { default: ForceGraph3D },
        { default: SpriteText },
        THREE,
        d3Force,
      ] = await Promise.all([
        import(FORCE_GRAPH_URL),
        import(SPRITE_TEXT_URL),
        import(THREE_URL),
        import(D3_FORCE_URL),
      ]);

      this.SpriteText = SpriteText;
      this.GraphFactory = ForceGraph3D;
      this.THREE = THREE;
      this.forceCollide = d3Force.forceCollide;
      await this.loadGraph();
    } catch (error) {
      console.error("Failed to load ER graph", error);
      this.element.innerHTML = '<div class="erd-graph-error">3D グラフの読み込みに失敗しました。</div>';
    }
  }

  disconnect() {
    this.abortController?.abort();
    window.clearTimeout(this.resizeTimer);
    window.removeEventListener("resize", this.handleResize);
  }

  async loadGraph() {
    const response = await fetch(this.graphUrlValue, {
      headers: { Accept: "application/json" },
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch graph: ${response.status}`);
    }

    const data = await response.json();
    this.graphData = data;
    this.renderGraph();
  }

  renderGraph() {
    this.canvasElement = this.element.querySelector(".erd-canvas");
    this.canvasElement.innerHTML = "";
    this.graph = this.GraphFactory()(this.canvasElement)
      .backgroundColor("#8793a1")
      .graphData(this.graphData)
      .nodeLabel((node) => this.nodeTooltip(node))
      .nodeOpacity(0.92)
      .linkOpacity(0.06)
      .linkColor(() => "#0f172a")
      .linkWidth(7)
      .linkDirectionalArrowLength(8)
      .linkDirectionalArrowRelPos(0.15)
      .linkDirectionalArrowColor(() => "#0f172a")
      .linkDirectionalParticles(0)
      .linkDirectionalParticleWidth(2.2)
      .linkDirectionalParticleColor(() => "#f97316")
      .linkLabel((link) => this.linkTooltip(link))
      .nodeThreeObject((node) => this.buildNodeObject(node))
      .linkThreeObjectExtend(true)
      .linkThreeObject((link) => this.buildLinkObject(link))
      .linkPositionUpdate((group, { start, end }) => this.updateLinkObject(group, start, end))
      .onNodeHover((node) => this.showNodeDetail(node))
      .onLinkHover((link) => this.showLinkDetail(link))
      .onBackgroundClick(() => this.resetDetail())
      .onNodeDragEnd((node) => this.persistNodePosition(node))
      .warmupTicks(160)
      .cooldownTicks(220);

    this.graph.d3Force("charge").strength(-180);
    this.graph.d3Force("link").distance(240).strength(0.15);
    this.graph.d3Force("center").strength(0.12);
    this.graph.d3Force("collision", this.forceCollide((node) => this.nodeRadius(node) + 55));

    this.handleResize = () => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.resizeGraph(), 120);
    };

    this.resizeGraph();
    this.graph.cameraPosition({ x: 0, y: 120, z: 540 }, { x: 0, y: 0, z: 0 }, 0);
    this.resetDetail();
    window.addEventListener("resize", this.handleResize);
  }

  buildNodeObject(node) {
    const canvas = document.createElement("canvas");
    const width = CARD_WIDTH;
    const height = HEADER_HEIGHT + node.columns.length * ROW_HEIGHT + FOOTER_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);

    this.drawRoundedRect(context, 0, 0, width, height, 28, "#f8fafc");
    this.drawRoundedRect(context, 0, 0, width, HEADER_HEIGHT, 28, "#0f172a", true);
    context.fillStyle = "#e2e8f0";
    context.font = "bold 34px SFMono-Regular, Consolas, monospace";
    context.fillText(node.name, 28, 50);

    context.fillStyle = "#94a3b8";
    context.font = "18px SFMono-Regular, Consolas, monospace";
    context.fillText(node.description || "No description", 28, 74);

    node.columns.forEach((column, index) => {
      const top = HEADER_HEIGHT + index * ROW_HEIGHT;
      context.fillStyle = index % 2 === 0 ? "#f8fafc" : "#f1f5f9";
      context.fillRect(0, top, width, ROW_HEIGHT);
      context.strokeStyle = "rgba(148, 163, 184, 0.35)";
      context.beginPath();
      context.moveTo(0, top);
      context.lineTo(width, top);
      context.stroke();

      if (column.badge) {
        const badgeColor = column.primary_key ? "#b45309" : "#0369a1";
        this.drawRoundedRect(context, 24, top + 8, 64, 28, 14, badgeColor);
        context.fillStyle = "#fff";
        context.font = "bold 18px SFMono-Regular, Consolas, monospace";
        context.fillText(column.badge, 40, top + 28);
      }

      context.fillStyle = column.primary_key ? "#7c2d12" : (column.foreign_key ? "#075985" : "#0f172a");
      context.font = "bold 22px SFMono-Regular, Consolas, monospace";
      context.fillText(column.name, 104, top + 26);

      context.fillStyle = "#475569";
      context.font = "18px SFMono-Regular, Consolas, monospace";
      context.fillText(column.data_type, 104, top + 42);

      context.fillStyle = column.null_allowed ? "#64748b" : "#b91c1c";
      context.font = "bold 18px SFMono-Regular, Consolas, monospace";
      const nullability = column.null_allowed ? "NULL" : "NOT NULL";
      const metrics = context.measureText(nullability);
      context.fillText(nullability, width - metrics.width - 24, top + 30);
    });

    const texture = new this.THREE.CanvasTexture(canvas);
    texture.colorSpace = this.THREE.SRGBColorSpace;
    const material = new this.THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new this.THREE.Sprite(material);
    sprite.scale.set(width * CARD_WORLD_SCALE, height * CARD_WORLD_SCALE, 1);
    sprite.center.set(0.5, 0.5);
    return sprite;
  }

  nodeTooltip(node) {
    const columns = node.columns
      .map((column) => {
        const markers = [column.primary_key ? "PK" : null, column.foreign_key ? "FK" : null].filter(Boolean).join("/");
        const nullability = column.null_allowed ? "NULL" : "NOT NULL";
        return `${markers ? `[${markers}] ` : ""}${column.name}: ${column.data_type} ${nullability}`;
      })
      .join("<br>");

    return `<strong>${node.name}</strong><br>${node.description || "説明なし"}<br><br>${columns}`;
  }

  linkTooltip(link) {
    return `<strong>[${link.cardinality_badge}] ${link.direction_label}</strong><br>${link.semantic_label}<br>${link.cardinality}`;
  }

  buildLinkLabel(link) {
    const sprite = new this.SpriteText(`${link.cardinality_badge}\n${link.direction_label}`);
    sprite.backgroundColor = "rgba(248, 250, 252, 0.95)";
    sprite.color = "#0f172a";
    sprite.textHeight = 4;
    sprite.padding = 2.5;
    sprite.borderRadius = 4;
    return sprite;
  }

  positionLinkLabel(sprite, start, end) {
    const link = sprite.userData.link;
    const points = this.linkPoints(link, start, end);
    const pivot = points[Math.floor(points.length / 2)];
    const offset = 16 + (link.target_link_order % 3) * 8;
    const middlePos = { x: pivot.x, y: pivot.y + offset, z: pivot.z + offset * 0.15 };

    Object.assign(sprite.position, middlePos);
  }

  buildLinkObject(link) {
    const group = new this.THREE.Group();
    const lineMaterial = new this.THREE.LineBasicMaterial({ color: "#0f172a", transparent: true, opacity: 0.88 });
    const geometry = new this.THREE.BufferGeometry();
    const line = new this.THREE.Line(geometry, lineMaterial);
    group.add(line);

    const fkBadge = new this.SpriteText("N");
    fkBadge.color = "#7c2d12";
    fkBadge.backgroundColor = "rgba(255,255,255,0.96)";
    fkBadge.textHeight = 4.4;
    fkBadge.padding = 1.6;
    fkBadge.borderRadius = 4;
    group.add(fkBadge);

    const pkBadge = new this.SpriteText("1");
    pkBadge.color = "#075985";
    pkBadge.backgroundColor = "rgba(255,255,255,0.96)";
    pkBadge.textHeight = 4.4;
    pkBadge.padding = 1.6;
    pkBadge.borderRadius = 4;
    group.add(pkBadge);

    const label = this.buildLinkLabel(link);
    label.userData.link = link;
    group.add(label);

    group.userData = { line, fkBadge, pkBadge, label, link };
    return group;
  }

  linkPoints(link, start, end) {
    const sourceYOffset = this.rowOffsetFor(link.source_row_index);
    const targetYOffset = this.rowOffsetFor(link.target_row_index);
    const sourceShift = this.sideOffsetFor(link.source_link_order);
    const targetShift = this.sideOffsetFor(link.target_link_order);
    const startPoint = new this.THREE.Vector3(start.x + sourceShift, start.y + sourceYOffset, start.z);
    const endPoint = new this.THREE.Vector3(end.x - targetShift, end.y + targetYOffset, end.z);
    const deltaX = endPoint.x - startPoint.x;
    const bendX = startPoint.x + deltaX * 0.5;

    return [
      startPoint,
      new this.THREE.Vector3(startPoint.x + Math.sign(deltaX || 1) * 34, startPoint.y, startPoint.z),
      new this.THREE.Vector3(bendX, startPoint.y, startPoint.z),
      new this.THREE.Vector3(bendX, endPoint.y, endPoint.z),
      new this.THREE.Vector3(endPoint.x - Math.sign(deltaX || 1) * 34, endPoint.y, endPoint.z),
      endPoint
    ];
  }

  updateLinkObject(group, start, end) {
    const { line, fkBadge, pkBadge, label, link } = group.userData;
    const points = this.linkPoints(link, start, end);
    line.geometry.setFromPoints(points);

    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const beforeLast = points[points.length - 2];
    fkBadge.position.set(first.x + (second.x - first.x) * 0.55, first.y + 8, first.z);
    pkBadge.position.set(last.x + (beforeLast.x - last.x) * 0.55, last.y + 8, last.z);
    this.positionLinkLabel(label, start, end);
  }

  rowOffsetFor(rowIndex) {
    const topPadding = 54;
    const pixelOffset = topPadding + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
    return (HEADER_HEIGHT / 2 - pixelOffset) * CARD_WORLD_SCALE;
  }

  sideOffsetFor(orderIndex) {
    return (orderIndex % 5) * 8;
  }

  showNodeDetail(node) {
    if (!node) return this.resetDetail();

    const columnLines = node.columns
      .map((column) => {
        const tags = [column.primary_key ? "PK" : null, column.foreign_key ? "FK" : null]
          .filter(Boolean)
          .join("/");
        return `${tags ? `[${tags}] ` : ""}${column.name} : ${column.data_type} ${column.null_allowed ? "NULL" : "NOT NULL"}`;
      })
      .join("<br>");

    if (this.hasDetailTarget) {
      this.detailTarget.innerHTML = `<strong>${node.name}</strong><br>${node.description || "説明なし"}<br><br>${columnLines}`;
    }
  }

  showLinkDetail(link) {
    if (!link) return this.resetDetail();

    if (this.hasDetailTarget) {
      this.detailTarget.innerHTML = `<strong>[${link.cardinality_badge}] ${link.direction_label}</strong><br>${link.semantic_label}<br>多重度: ${link.cardinality_badge}<br>参照元(FK): ${link.target_table_name}.${link.target_column}<br>参照先(PK): ${link.source_table_name}.${link.source_column}`;
    }
  }

  resetDetail() {
    if (this.hasDetailTarget) {
      this.detailTarget.innerHTML = "ノードや線にホバーすると詳細が表示されます。";
    }
  }

  drawRoundedRect(context, x, y, width, height, radius, fillStyle, topOnly = false) {
    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    if (topOnly) {
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
    } else {
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
    }
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
    context.restore();
  }

  nodeRadius(node) {
    return 82 + node.columns.length * 10;
  }

  async persistNodePosition(node) {
    Object.assign(node, { fx: node.x, fy: node.y, fz: node.z });

    const response = await fetch(`${this.positionBaseValue}/${node.record_id}/position`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify({
        erd_table: {
          x: node.x,
          y: node.y,
          z: node.z,
        },
      }),
    });

    if (!response.ok) {
      console.error("Failed to persist node position", await response.text());
    }
  }

  resizeGraph() {
    if (!this.graph) return;

    const { width, height } = this.canvasElement.getBoundingClientRect();
    this.graph.width(width).height(height);
  }
}
