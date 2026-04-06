import { Controller } from "@hotwired/stimulus";

const FORCE_GRAPH_URL = "https://cdn.jsdelivr.net/npm/3d-force-graph@1.79.0/+esm";
const SPRITE_TEXT_URL = "https://cdn.jsdelivr.net/npm/three-spritetext@1.10.0/+esm";

export default class extends Controller {
  static values = {
    graphUrl: String,
    positionBase: String,
  };

  async connect() {
    this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    this.abortController = new AbortController();

    try {
      const [{ default: ForceGraph3D }, { default: SpriteText }] = await Promise.all([
        import(FORCE_GRAPH_URL),
        import(SPRITE_TEXT_URL),
      ]);

      this.SpriteText = SpriteText;
      this.GraphFactory = ForceGraph3D;
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
    this.element.innerHTML = "";
    this.graph = this.GraphFactory()(this.element)
      .backgroundColor("#081121")
      .graphData(this.graphData)
      .nodeLabel((node) => this.nodeTooltip(node))
      .nodeOpacity(0.92)
      .linkOpacity(0.45)
      .linkWidth(1.4)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(1.4)
      .linkLabel((link) => `${link.cardinality}: ${link.label}`)
      .nodeThreeObject((node) => this.buildNodeObject(node))
      .onNodeDragEnd((node) => this.persistNodePosition(node))
      .cooldownTicks(120);

    this.handleResize = () => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.resizeGraph(), 120);
    };

    this.resizeGraph();
    window.addEventListener("resize", this.handleResize);
  }

  buildNodeObject(node) {
    const sprite = new this.SpriteText(node.label);
    sprite.color = "#e2e8f0";
    sprite.textHeight = 7;
    sprite.backgroundColor = "rgba(15, 23, 42, 0.82)";
    sprite.padding = 4;
    sprite.borderRadius = 6;
    return sprite;
  }

  nodeTooltip(node) {
    const columns = node.columns
      .map((column) => {
        const prefix = column.primary_key ? "PK " : "";
        const nullability = column.null_allowed ? "NULL" : "NOT NULL";
        return `${prefix}${column.name}: ${column.data_type} ${nullability}`;
      })
      .join("<br>");

    return `<strong>${node.name}</strong><br>${columns}`;
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

    const { width, height } = this.element.getBoundingClientRect();
    this.graph.width(width).height(height);
  }
}
