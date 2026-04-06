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
    data.nodes = data.nodes.map((node) => ({
      ...node,
      fx: node.x,
      fy: node.y,
      fz: 0,
      z: 0,
    }));
    data.links = data.links.map((link) => ({ ...link, source: link.source, target: link.target }));
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
      .linkOpacity(0)
      .linkColor(() => "#0f172a")
      .linkWidth(0)
      .linkDirectionalArrowLength(0)
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
      .warmupTicks(0)
      .cooldownTicks(0);

    this.graph.d3Force("charge").strength(0);
    this.graph.d3Force("link").strength(0);
    this.graph.d3Force("center").strength(0);
    this.graph.d3Force("collision", this.forceCollide((node) => this.nodeRadius(node) + 20));

    this.handleResize = () => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.resizeGraph(), 120);
    };

    this.resizeGraph();
    this.graph.cameraPosition({ x: 0, y: 0, z: 820 }, { x: 0, y: 0, z: 0 }, 0);
    const controls = this.graph.controls?.();
    if (controls) {
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.screenSpacePanning = true;
      if (this.THREE?.MOUSE) {
        controls.mouseButtons.LEFT = this.THREE.MOUSE.PAN;
        controls.mouseButtons.RIGHT = this.THREE.MOUSE.PAN;
        controls.mouseButtons.MIDDLE = this.THREE.MOUSE.DOLLY;
      }
    }
    this.graph.showNavInfo?.(false);
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
    sprite.userData.nodeId = node.id;
    this.nodeObjects ||= new Map();
    this.nodeObjects.set(node.id, sprite);
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
    return `<strong>${link.cardinality_phrase}</strong><br>${link.direction_label}<br>${link.semantic_label}`;
  }

  buildLinkLabel(link) {
    const sprite = new this.SpriteText(`${link.cardinality_phrase}\n${link.direction_label}`);
    sprite.backgroundColor = "rgba(248, 250, 252, 0.95)";
    sprite.color = "#0f172a";
    sprite.textHeight = 4;
    sprite.padding = 2.5;
    sprite.borderRadius = 4;
    return sprite;
  }

  positionLinkLabel(sprite, start, end, route = null) {
    const link = sprite.userData.link;
    const path = route || this.linkRoute(link, start, end);
    const pivot = path.curve.getPoint(0.5);
    const offset = 16 + (link.target_link_order % 3) * 8;
    const middlePos = { x: pivot.x, y: pivot.y + offset, z: pivot.z + offset * 0.15 };

    Object.assign(sprite.position, middlePos);
  }

  buildLinkObject(link) {
    const group = new this.THREE.Group();
    const lineMaterial = new this.THREE.MeshBasicMaterial({
      color: "#0f172a",
      transparent: true,
      opacity: 0.94,
    });
    const line = new this.THREE.Mesh(
      new this.THREE.TubeGeometry(
        new this.THREE.LineCurve3(new this.THREE.Vector3(0, 0, 0), new this.THREE.Vector3(1, 0, 0)),
        2,
        1.8,
        12,
        false
      ),
      lineMaterial
    );
    group.add(line);

    const label = this.buildLinkLabel(link);
    label.userData.link = link;
    group.add(label);

    group.userData = { line, label, link };
    this.linkObjects ||= new Map();
    this.linkObjects.set(link.id, group);
    return group;
  }

  linkRoute(link, start, end) {
    const sourceYOffset = this.rowOffsetFor(link.source_row_index);
    const targetYOffset = this.rowOffsetFor(link.target_row_index);
    const horizontalDirection = end.x >= start.x ? 1 : -1;
    const sourceEdgeX = start.x + horizontalDirection * (CARD_WIDTH * CARD_WORLD_SCALE / 2);
    const targetEdgeX = end.x - horizontalDirection * (CARD_WIDTH * CARD_WORLD_SCALE / 2);
    const laneOffset = ((link.target_link_order % 5) - 2) * 8;
    const zOffset = ((link.target_link_order % 3) - 1) * 0.2;
    const startPoint = new this.THREE.Vector3(sourceEdgeX, start.y + sourceYOffset, zOffset);
    const endPoint = new this.THREE.Vector3(targetEdgeX, end.y + targetYOffset, zOffset);
    const deltaX = endPoint.x - startPoint.x;
    const curvePull = Math.max(Math.abs(deltaX) * 0.32, 42);
    const control1 = new this.THREE.Vector3(
      startPoint.x + horizontalDirection * curvePull,
      startPoint.y + laneOffset * 0.3,
      zOffset
    );
    const control2 = new this.THREE.Vector3(
      endPoint.x - horizontalDirection * curvePull,
      endPoint.y - laneOffset * 0.3,
      zOffset
    );

    return {
      startPoint,
      endPoint,
      curve: new this.THREE.CubicBezierCurve3(startPoint, control1, control2, endPoint),
    };
  }

  updateLinkObject(group, start, end) {
    const { line, label, link } = group.userData;
    const route = this.linkRoute(link, start, end);
    const nextGeometry = new this.THREE.TubeGeometry(route.curve, 28, 1.8, 12, false);
    line.geometry.dispose();
    line.geometry = nextGeometry;
    this.positionLinkLabel(label, start, end, route);
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
    this.emphasizeForNode(node.id);

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
    this.emphasizeForLink(link.id);

    if (this.hasDetailTarget) {
      this.detailTarget.innerHTML = `<strong>${link.cardinality_phrase}</strong><br>${link.direction_label}<br>${link.semantic_label}<br>FK: ${link.target_table_name}.${link.target_column}<br>PK: ${link.source_table_name}.${link.source_column}`;
    }
  }

  resetDetail() {
    this.clearEmphasis();
    if (this.hasDetailTarget) {
      this.detailTarget.innerHTML = "ノードや線にホバーすると詳細が表示されます。";
    }
  }

  emphasizeForNode(nodeId) {
    const connectedLinkIds = new Set(
      this.graphData.links
        .filter((link) => this.linkNodeId(link.source) === nodeId || this.linkNodeId(link.target) === nodeId)
        .map((link) => link.id)
    );

    this.applyEmphasis(connectedLinkIds, new Set([nodeId]));
  }

  emphasizeForLink(linkId) {
    const link = this.graphData.links.find((item) => item.id === linkId);
    if (!link) return;

    this.applyEmphasis(new Set([linkId]), new Set([this.linkNodeId(link.source), this.linkNodeId(link.target)]));
  }

  clearEmphasis() {
    this.applyEmphasis(null, null);
  }

  applyEmphasis(linkIds, nodeIds) {
    this.linkObjects?.forEach((group, id) => {
      const active = !linkIds || linkIds.has(id);
      group.userData.line.material.opacity = active ? 1 : 0.12;
      group.userData.line.material.color.set(active ? "#0f172a" : "#64748b");
      group.userData.label.material.opacity = active ? 1 : 0.12;
    });

    this.nodeObjects?.forEach((sprite, id) => {
      sprite.material.opacity = !nodeIds || nodeIds.has(id) ? 1 : 0.35;
    });
  }

  linkNodeId(nodeRef) {
    return typeof nodeRef === "object" ? nodeRef.id : nodeRef;
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
