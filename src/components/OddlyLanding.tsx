"use client";

import React from "react";

/* Contact wiring — point these at the real backend / WhatsApp / privacy route when they exist.
   endpoint: null keeps the form in local mode (validates + confirms without a network call). */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const CONTACT_CONFIG: {
  endpoint: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string;
  privacyPath: string | null;
} = {
  // NEXT_PUBLIC_CONTACT_ENDPOINT wins; otherwise NEXT_PUBLIC_API_URL + /api/contact.
  // With neither set the form validates and confirms locally (no network call).
  endpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || (API_URL ? API_URL + "/api/contact" : null),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null,
  whatsappMessage: "Hola Oddly, quiero hablar de un proyecto.",
  privacyPath: process.env.NEXT_PUBLIC_PRIVACY_URL || null
};

type FormState = {
  name: string; company: string; email: string; whatsapp: string;
  businessStage: string; message: string; privacyAccepted: boolean;
};

type FormFieldValue = string | boolean;

type OddlyState = {
  open: number; active: number;
  form: FormState;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  status: "idle" | "submitting" | "success" | "error";
  statusMsg: string;
};

const FIELDS: (keyof FormState)[] = ["name", "company", "email", "whatsapp", "businessStage", "message", "privacyAccepted"];

type OddlyProps = { nodeDensity?: number; accent?: string; customCursor?: boolean };

type PhasePoint = { x: number; y: number };

type NodeItem = {
  kind: "core" | "support" | "new";
  c: number; r?: number; cluster: number; signal: boolean;
  depth: number; base: number;
  ph: PhasePoint[]; al: number[];
  seed: number; freq: number;
  onPath?: boolean;
};

type PosItem = { x: number; y: number; n: NodeItem; alpha: number };

export default class OddlyLanding extends React.Component<OddlyProps, OddlyState> {
  // The ported design keeps its original imperative canvas/scroll system intact,
  // so instance fields are addressed dynamically.
  [key: string]: any;

  state: OddlyState = {
    open: 0, active: 3,
    form: { name: "", company: "", email: "", whatsapp: "", businessStage: "", message: "", privacyAccepted: false },
    touched: {}, errors: {}, status: "idle", statusMsg: ""
  };

  fieldError(k: keyof FormState, v: FormFieldValue) {
    const s = typeof v === "string" ? v.trim() : v;
    if (k === "privacyAccepted") return v ? "" : "Debes aceptar la política de privacidad";
    if (!s) return k === "businessStage" ? "Selecciona una etapa" : "Campo obligatorio";
    if (k === "email" && typeof s === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "Correo no válido";
    if (k === "whatsapp" && typeof s === "string" && s.replace(/[^\d]/g, "").length < 7) return "Número no válido";
    return "";
  }

  setField(k: keyof FormState, v: FormFieldValue) {
    this.setState(s => {
      const form = Object.assign({}, s.form, { [k]: v });
      const errors = Object.assign({}, s.errors);
      if (s.touched[k] || k === "privacyAccepted") {
        const e = this.fieldError(k, v);
        if (e) errors[k] = e; else delete errors[k];
      }
      return { form, errors, status: s.status === "error" ? "idle" : s.status, statusMsg: s.status === "error" ? "" : s.statusMsg };
    });
  }

  touch(k: keyof FormState) {
    this.setState(s => {
      const errors = Object.assign({}, s.errors);
      const e = this.fieldError(k, s.form[k]);
      if (e) errors[k] = e; else delete errors[k];
      return { touched: Object.assign({}, s.touched, { [k]: true }), errors };
    });
  }

  async submitForm(ev?: React.SyntheticEvent) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (this.state.status === "submitting") return;
    const form = this.state.form;
    const errors: Record<string, string> = {};
    const touched: Record<string, boolean> = {};
    FIELDS.forEach(k => { touched[k] = true; const e = this.fieldError(k, form[k]); if (e) errors[k] = e; });
    if (Object.keys(errors).length) {
      this.setState({ errors, touched, status: "error", statusMsg: "Revisa los campos marcados" });
      return;
    }
    this.setState({ errors: {}, touched, status: "submitting", statusMsg: "Enviando…" });
    try {
      if (CONTACT_CONFIG.endpoint) {
        const res = await fetch(CONTACT_CONFIG.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
      } else {
        await new Promise(r => setTimeout(r, 900));
      }
      this.setState({ status: "success", statusMsg: "" });
    } catch (err) {
      this.setState({ status: "error", statusMsg: "No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp." });
    }
  }

  renderVals() {
    const rows = [
      ["001", "Analítica contradictoria"],
      ["002", "Feedback sin jerarquía"],
      ["003", "Roadmap heredado"],
      ["004", "Fricción real en onboarding"],
      ["005", "Intuición del equipo"],
      ["006", "Métricas heredadas de otro producto"]
    ];
    const act = this.state.active;
    const qs = [
      ["01", "¿Cómo empieza un proyecto con Oddly?", "Con una lectura del ruido: dos semanas de diagnóstico donde revisamos datos, entrevistas y decisiones pendientes. Al final entregamos el mapa de señales y una recomendación de foco."],
      ["02", "¿Trabajáis solo en diseño o también construís?", "Ambos. Diseño de producto e ingeniería en el mismo equipo, normalmente Next.js y React. El sistema que diseñamos es el que se entrega en producción."],
      ["03", "¿Qué tamaño de equipo o empresa encaja mejor?", "Equipos de producto entre 5 y 60 personas con un problema de dirección, no de manos. Si ya sabéis exactamente qué construir, probablemente no nos necesitéis."],
      ["04", "¿Cuánto dura un proyecto?", "Diagnóstico: 2 semanas. Estructura y diseño: 4 a 8 semanas. Construcción: por ciclos de 3 semanas con entregas medibles."],
      ["05", "¿Podéis trabajar sobre un producto ya existente?", "Es el caso más habitual. Partimos de lo que ya existe, identificamos qué sostiene el sistema y qué es deuda, y reordenamos sin tirar todo."]
    ];
    const st = this.state, fm = st.form, er = st.errors;
    type FieldEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    const on: Record<string, (e: FieldEvent) => void> = {};
    const blur: Record<string, () => void> = {};
    const err: Record<string, string> = {};
    const inv: Record<string, string> = {};
    const bd: Record<string, string> = {};
    const bg: Record<string, string> = {};
    FIELDS.forEach(k => {
      const bad = !!er[k];
      err[k] = er[k] || "";
      inv[k] = bad ? "true" : "false";
      bd[k] = bad ? "#EA571A" : "rgba(255,253,249,.14)";
      bg[k] = k === "privacyAccepted" ? (fm[k] ? "#EA571A" : "rgba(34,39,80,.4)") : "rgba(34,39,80,.34)";
      blur[k] = () => this.touch(k);
      on[k] = k === "privacyAccepted"
        ? (e) => this.setField(k, !!(e.target as HTMLInputElement).checked)
        : (e) => this.setField(k, e.target.value);
    });
    const wa = CONTACT_CONFIG.whatsappNumber;
    const busy = st.status === "submitting";

    return {
      canvasRef: (el: HTMLCanvasElement | null) => { this.canvas = el; this.tryBoot(); },
      form: fm, on, blur, err, inv, bd, bg,
      submit: (e: React.FormEvent) => this.submitForm(e),
      busy, btnOpacity: busy ? "0.6" : "1",
      btnLabel: busy ? "Enviando…" : "Enviar mi solicitud",
      sent: st.status === "success",
      notSent: st.status !== "success",
      statusText: st.statusMsg,
      statusColor: st.status === "error" ? "#EA571A" : "#777386",
      stageColor: fm.businessStage ? "#FFFDF9" : "#777386",
      checkMark: fm.privacyAccepted ? "inset 0 0 0 3px rgba(34,39,80,.9)" : "none",
      waHref: wa ? "https://wa.me/" + wa + "?text=" + encodeURIComponent(CONTACT_CONFIG.whatsappMessage) : "#contacto",
      privacyHref: CONTACT_CONFIG.privacyPath || "#contacto",
      cursorRef: (el: HTMLElement | null) => { this.cursorEl = el; },
      navRef: (el: HTMLElement | null) => { this.navEl = el; },
      processRef: (el: HTMLElement | null) => { this.processEl = el; },
      stageRailRef: (el: HTMLElement | null) => { this.railEl = el; },
      stagePanelsRef: (el: HTMLElement | null) => { this.panelsEl = el; },
      stageCounterRef: (el: HTMLElement | null) => { this.counterEl = el; },
      processMeterRef: (el: HTMLElement | null) => { this.meterWrap = el; },
      entropyWordRef: (el: HTMLElement | null) => { this.entropyWordEl = el; },
      patronRef: (el: HTMLElement | null) => { this.patronEl = el; },
      signalsRef: (el: HTMLElement | null) => { this.signalsEl = el; },
      ctaRef: (el: HTMLElement | null) => { this.ctaEl = el; },
      stateLabelRef: (el: HTMLElement | null) => { this.stateLabelEl = el; },
      footStateRef: (el: HTMLElement | null) => { this.footStateEl = el; },
      signalNote: act >= 0 ? "Patrón detectado — " + rows[act][0] : "Sin patrón — señales dispersas",
      signals: rows.map(([num, text], i) => {
        const on = act === i, dim = act >= 0 && !on;
        return {
          num, text,
          opacity: dim ? "0.34" : "1",
          color: on ? "#FFFDF9" : "rgba(255,253,249,.72)",
          bg: on ? "linear-gradient(90deg,rgba(234,87,26,.12),rgba(234,87,26,0))" : "transparent",
          pad: on ? "18px" : "12px",
          numColor: on ? "#EA571A" : "#777386",
          tickColor: on ? "#EA571A" : "rgba(255,253,249,.24)",
          tick: on ? "scale(1.5)" : "scale(1)",
          on: () => { this.setState({ active: i }); this.nodeBurst = 1; },
          off: () => {}
        };
      }),
      faqs: qs.map(([num, q, a], i) => {
        const open = this.state.open === i;
        return {
          num, q, a, rows: open ? "1fr" : "0fr",
          bodyOpacity: open ? "1" : "0",
          iconRotate: open ? "rotate(45deg)" : "rotate(0deg)",
          iconColor: open ? "#EA571A" : "#777386",
          toggle: () => this.setState((s: OddlyState) => ({ open: s.open === i ? -1 : i }))
        };
      })
    };
  }

  componentDidMount() { this.tryBoot(); }

  componentWillUnmount() {
    this.dead = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("scroll", this.onScroll, true);
    window.removeEventListener("pointermove", this.onMove);
    if (this.onOver) document.removeEventListener("pointerover", this.onOver);
    document.body.removeAttribute("data-hidecursor");
  }

  tryBoot() {
    if (this.started || !this.canvas) return;
    this.started = true;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.fine = window.matchMedia("(pointer: fine)").matches;
    this.phase = 0; this.phaseT = 0;
    this.mx = 0; this.my = 0; this.tmx = 0; this.tmy = 0;
    this.scrollY = this.sy();
    this.wireDom();
    this.onScroll();
    this.raf = requestAnimationFrame(this.tick.bind(this));
  }

  /* ---------- main loop ---------- */
  tick(now: number) {
    if (this.dead) return;
    try { this.frameBody(now); }
    catch (err) { if (!this.warned) { this.warned = 1; console.error("node system frame error", err); } }
    this.raf = requestAnimationFrame(this.tick.bind(this));
  }

  frameBody(now: number) {
    const cv = this.canvas;
    if (!cv) return;
    if (!this.W || this.W !== cv.clientWidth || this.H !== cv.clientHeight) {
      if (!cv.clientWidth || !cv.clientHeight) return;
      this.build(); this.measure();
    }
    const H = window.innerHeight;
    this.scrollY = this.sy();
    if (!this.marks || !this.marks.hero) this.measure();
    if (this.frame == null) this.frame = 0;
    this.frame++;
    if (this.frame % 90 === 0) this.measure();

    const m = this.marks || {}, y = this.scrollY, mid = y + H * 0.5;
    const kf: [number, number][] = [];
    const at = (k: string, fr: number, ph: number) => { if (m[k]) kf.push([m[k].top + m[k].h * fr, ph]); };
    at("hero", 0.42, 0); at("problema", 0.3, 0.9);
    if (m.proceso) {
      kf.push([m.proceso.top + H * 0.5, 1]);
      kf.push([m.proceso.top + m.proceso.h - H * 0.5, 5]);
    }
    at("patron", 0.45, 5.25); at("proyectos", 0.3, 5.5); at("estudio", 0.4, 5.7); at("contacto", 0.05, 6);
    let target = 0;
    if (kf.length > 1) {
      if (mid <= kf[0][0]) target = kf[0][1];
      else if (mid >= kf[kf.length - 1][0]) target = kf[kf.length - 1][1];
      else for (let i = 0; i < kf.length - 1; i++) {
        if (mid >= kf[i][0] && mid <= kf[i + 1][0]) {
          const tt = (mid - kf[i][0]) / (kf[i + 1][0] - kf[i][0] || 1);
          target = kf[i][1] + (kf[i + 1][1] - kf[i][1]) * tt; break;
        }
      }
    }
    this.phase += (target - this.phase) * (this.reduced ? 1 : 0.085);
    this.mx += (this.tmx - this.mx) * 0.06;
    this.my += (this.tmy - this.my) * 0.06;

    this.drawNodes(now);
    this.updateDom(target);

    if (this.pointer && this.ring && this.ctx2) {
      this.ctx2.x += (this.pointer.x - this.ctx2.x) * 0.22;
      this.ctx2.y += (this.pointer.y - this.ctx2.y) * 0.22;
      this.cursorEl.style.transform = "translate3d(" + this.ctx2.x.toFixed(1) + "px," + this.ctx2.y.toFixed(1) + "px,0)";
    }
  }

  /* ---------- node layout ---------- */
  build() {
    const cv = this.canvas;
    this.W = cv.clientWidth; this.H = cv.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = this.W * dpr; cv.height = this.H * dpr;
    this.ctx = cv.getContext("2d");
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = this.W, H = this.H;
    this.narrow = W < 760;
    this.midW = W >= 760 && W < 1180;
    let sd = 0x9e3779b9;
    const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };

    const cols = this.cols = this.narrow ? 3 : 4;
    const rows = this.rows = 4;
    const gw = this.narrow ? W * 0.8 : Math.min(W * 0.44, 660);
    const gh = this.narrow ? H * 0.42 : Math.min(H * 0.56, 560);
    const ox = this.narrow ? (W - gw) / 2 : W * 0.94 - gw;
    const oy = (H - gh) / 2 + (this.narrow ? H * 0.03 : 0);
    this.grid = { ox, oy, gw, gh };
    const gx = (c: number) => ox + gw * (0.1 + c * (0.8 / (cols - 1)));
    const gy = (r: number) => oy + gh * (0.12 + r * (0.76 / (rows - 1)));
    const cxs = [0.24, 0.74, 0.34, 0.82], cys = [0.3, 0.18, 0.8, 0.62];
    const cluster = (c: number) => ({ x: ox + gw * cxs[c % 4], y: oy + gh * cys[c % 4] });
    const chaos = () => ({ x: rnd() * W, y: rnd() * H });
    const loose = () => ({ x: ox - gw * 0.16 + rnd() * gw * 1.32, y: oy - gh * 0.2 + rnd() * gh * 1.4 });

    const dens = this.props.nodeDensity ?? 84;
    const supportN = Math.max(6, Math.round((this.narrow ? 9 : this.midW ? 18 : 28) * (dens / 84)));
    const nodes: NodeItem[] = [];
    this.sigCol = 0; this.sigRow = 2;

    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const cl = cluster(c), ch = chaos(), lo = loose();
      const s1 = { x: ch.x * 0.55 + lo.x * 0.45, y: ch.y * 0.55 + lo.y * 0.45 };
      const s2 = { x: cl.x + (rnd() - 0.5) * gw * 0.26, y: cl.y + (rnd() - 0.5) * gh * 0.26 };
      const s3 = { x: gx(c) + (rnd() - 0.5) * 30, y: gy(r) + (rnd() - 0.5) * 46 };
      const s4 = { x: gx(c), y: gy(r) };
      nodes.push({
        kind: "core", c, r, cluster: c,
        signal: c === this.sigCol && r === this.sigRow,
        depth: 0.5 + (rows - r) / rows * 0.45,
        base: r === 0 ? 2.9 : r === rows - 1 ? 1.9 : 2.4,
        ph: [ch, s1, s2, s3, s4, s4, s4],
        al: [0.85, 0.92, 1, 1, 1, 1, 1],
        seed: rnd() * 6.283, freq: 0.6 + rnd() * 0.9
      });
    }
    for (let i = 0; i < supportN; i++) {
      const c = i % cols, cl = cluster(c), ch = chaos(), lo = loose();
      const s1 = { x: ch.x * 0.6 + lo.x * 0.4, y: ch.y * 0.6 + lo.y * 0.4 };
      const s2 = { x: cl.x + (rnd() - 0.5) * gw * 0.4, y: cl.y + (rnd() - 0.5) * gh * 0.4 };
      const away = { x: cl.x + (cl.x > ox + gw / 2 ? 1 : -1) * gw * 0.34, y: cl.y + (rnd() - 0.5) * gh * 0.6 };
      nodes.push({
        kind: "support", c, cluster: c, signal: false,
        depth: 0.18 + rnd() * 0.3, base: 1.4,
        ph: [ch, s1, s2, away, away, away, away],
        al: [0.7, 0.78, 0.85, 0.3, 0, 0, 0],
        seed: rnd() * 6.283, freq: 0.6 + rnd() * 0.9
      });
    }
    for (let k = 0; k < 2; k++) {
      const edge = { x: k ? ox + gw * 1.3 : ox - gw * 0.3, y: gy(k ? 1 : 2) };
      const inn = { x: gx(k ? cols - 1 : 0) + (k ? 46 : -46), y: gy(k ? 0 : 3) };
      nodes.push({
        kind: "new", c: k ? cols - 1 : 0, cluster: k ? cols - 1 : 0, signal: false,
        depth: 0.5, base: 2,
        ph: [edge, edge, edge, edge, edge, inn, inn],
        al: [0, 0, 0, 0, 0, 0.8, 0.55],
        seed: rnd() * 6.283, freq: 0.8
      });
    }
    this.nodes = nodes;
    this.signalIdx = nodes.findIndex(n => n.signal);
    const idxOf = (c: number, r: number) => nodes.findIndex(n => n.kind === "core" && n.c === c && n.r === r);

    this.weak = [];
    for (let i = 0; i < nodes.length; i++) {
      let n = 0;
      for (let j = i + 1; j < nodes.length && n < 3; j++) {
        const a = nodes[i].ph[1], b = nodes[j].ph[1];
        if (Math.hypot(a.x - b.x, a.y - b.y) < Math.min(W, H) * 0.24) { this.weak.push([i, j]); n++; }
      }
    }
    this.clusterPairs = [];
    for (let c = 0; c < cols; c++) {
      const ids = nodes.map((n, i): [NodeItem, number] => [n, i]).filter(p => p[0].cluster === c && p[0].kind !== "new")
        .sort((a, b) => a[0].ph[2].y - b[0].ph[2].y).map(p => p[1]);
      for (let k = 0; k < ids.length - 1; k++) this.clusterPairs.push([ids[k], ids[k + 1]]);
    }
    this.axisPairs = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows - 1; r++) this.axisPairs.push([idxOf(c, r), idxOf(c, r + 1)]);
    this.modulePairs = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (c < cols - 1) this.modulePairs.push([idxOf(c, r), idxOf(c + 1, r)]);
      if (r < rows - 1) this.modulePairs.push([idxOf(c, r), idxOf(c, r + 1)]);
    }
    const route = cols > 3
      ? [[0, 2], [1, 2], [1, 1], [2, 1], [2, 0], [3, 0], [3, 2]]
      : [[0, 2], [1, 2], [1, 1], [2, 1], [2, 0]];
    this.pathIdx = route.map(p => idxOf(p[0], p[1])).filter(i => i >= 0);
    this.pathIdx.forEach((i: number) => { nodes[i].onPath = true; });
    this.sigLinks = [idxOf(1, 2), idxOf(1, 1)].filter(i => i >= 0);
    this.sigAxis = [idxOf(0, 1), idxOf(0, 3), idxOf(1, 2)].filter(i => i >= 0);
    this.adaptPairs = [[idxOf(cols - 1, 2), idxOf(cols - 2, 3)], [idxOf(1, 0), idxOf(cols - 1, 1)]]
      .filter(p => p[0] >= 0 && p[1] >= 0);
    this.pulseT = 0;
  }

  drawNodes(now: number) {
    const ctx = this.ctx, W = this.W, H = this.H;
    if (!ctx || !this.nodes || !this.nodes.length) return;
    ctx.clearRect(0, 0, W, H);
    // once the sticky process section leaves, the visualization leaves with it
    let vis = 1;
    if (this.marks && this.marks.proceso) {
      const mk = this.marks.proceso;
      const past = this.scrollY - (mk.top + mk.h - H);
      if (past > 0) vis = Math.max(0, 1 - past / (H * 0.5));
    }
    if (vis <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = vis;
    const acc = this.hexRgb(this.props.accent ?? "#EA571A");
    const p = Math.max(0, Math.min(6, this.phase));
    const sg = (a: number, b: number) => { const t = Math.max(0, Math.min(1, (p - a) / (b - a))); return t * t * (3 - 2 * t); };
    const i0 = Math.min(5, Math.floor(p));
    const ft = (() => { const t = Math.max(0, Math.min(1, p - i0)); return t * t * (3 - 2 * t); })();
    const t = now / 1000;

    const wWeak = sg(0.3, 1.0) * (1 - sg(1.8, 2.9));
    const wCluster = sg(1.5, 2.2) * (1 - sg(3.0, 3.9));
    const wAxis = sg(2.55, 3.25) * (1 - sg(4.15, 4.75));
    const wModule = sg(3.45, 4.2);
    const wPath = sg(3.65, 4.35);
    const adapt = sg(4.45, 5.0);
    const resolve = sg(5.3, 6);
    const structure = sg(3.3, 4.3);
    const wobble = this.reduced ? 0 : (1 - structure) + adapt * 0.34;

    let pr = null;
    if (this.patronEl && p > 5.0 && p < 5.75) {
      const rr = this.patronEl.getBoundingClientRect();
      if (rr.bottom > 0 && rr.top < H) pr = rr;
    }

    const pos: PosItem[] = [];
    for (const n of this.nodes) {
      const a = n.ph[i0], b = n.ph[Math.min(6, i0 + 1)];
      let x = a.x + (b.x - a.x) * ft, y = a.y + (b.y - a.y) * ft;
      const a0 = n.al[i0], a1 = n.al[Math.min(6, i0 + 1)];
      let alpha = a0 + (a1 - a0) * ft;
      x += Math.sin(t * 0.2 * n.freq + n.seed) * 10 * wobble * n.depth;
      y += Math.cos(t * 0.17 * n.freq + n.seed * 1.7) * 8 * wobble * n.depth;
      if (!this.narrow) { x += this.mx * 18 * n.depth; y += this.my * 12 * n.depth; }
      if (pr) {
        const px = Math.max(pr.left, Math.min(x, pr.right)), py = Math.max(pr.top, Math.min(y, pr.bottom));
        const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
        if (d < 130) { const k = (1 - d / 130) * 15; x += (dx / (d || 1)) * k; y += (dy / (d || 1)) * k; }
      }
      if (resolve > 0.01 && !n.onPath) alpha *= 1 - resolve * 0.76;
      pos.push({ x, y, n, alpha });
    }

    ctx.lineWidth = 1;
    const link = (a: { x: number; y: number }, b: { x: number; y: number }, col: string) => { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const white = (v: number) => "rgba(255,253,249," + v.toFixed(3) + ")";
    const orange = (v: number) => "rgba(" + acc + "," + v.toFixed(3) + ")";

    if (wWeak > 0.01) for (const pr2 of this.weak) {
      const a = pos[pr2[0]], b = pos[pr2[1]]; if (!a || !b) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) > Math.min(W, H) * 0.3) continue;
      const al = wWeak * 0.075 * a.alpha * b.alpha; if (al < 0.004) continue;
      link(a, b, white(al));
    }
    if (wCluster > 0.01) for (const q of this.clusterPairs) {
      const a = pos[q[0]], b = pos[q[1]]; if (!a || !b) continue;
      const al = wCluster * 0.2 * a.alpha * b.alpha; if (al < 0.004) continue;
      link(a, b, white(al));
    }
    if (wAxis > 0.01) for (const q of this.axisPairs) {
      const a = pos[q[0]], b = pos[q[1]]; if (!a || !b) continue;
      const al = wAxis * 0.2 * (0.6 + a.n.depth * 0.4); if (al < 0.004) continue;
      link(a, b, white(al));
    }
    if (wModule > 0.01) for (const q of this.modulePairs) {
      const a = pos[q[0]], b = pos[q[1]]; if (!a || !b) continue;
      const al = wModule * 0.15 * (1 - resolve * 0.65); if (al < 0.004) continue;
      link(a, b, white(al));
    }
    const sig = pos[this.signalIdx];
    if (sig && wCluster > 0.02) for (const j of this.sigLinks) { if (pos[j]) link(sig, pos[j], orange(wCluster * 0.5)); }
    if (sig && wAxis > 0.02) for (const j of this.sigAxis) { if (pos[j]) link(sig, pos[j], orange(wAxis * 0.42)); }

    let pts: PosItem[] | null = null;
    if (wPath > 0.01) {
      pts = this.pathIdx.map((i: number) => pos[i]).filter(Boolean) as PosItem[];
      if (pts.length > 1) {
        ctx.strokeStyle = orange(0.18 + wPath * 0.62 + resolve * 0.2);
        ctx.beginPath();
        pts.forEach((q, k) => { if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
        ctx.stroke();
        if (adapt > 0.02) {
          ctx.save(); ctx.setLineDash([3, 6]);
          ctx.strokeStyle = orange(adapt * 0.34);
          ctx.beginPath(); ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y); ctx.lineTo(pts[0].x, pts[0].y); ctx.stroke();
          ctx.restore();
        }
      }
    }
    if (adapt > 0.02) this.adaptPairs.forEach((q: number[], k: number) => {
      const a = pos[q[0]], b = pos[q[1]]; if (!a || !b) return;
      const osc = 0.5 + 0.5 * Math.sin(t * 0.45 + k * 2.1);
      const al = adapt * 0.26 * osc; if (al < 0.01) return;
      ctx.save(); ctx.setLineDash([2, 5]); link(a, b, white(al)); ctx.restore();
    });

    if (!this.reduced && pts && pts.length > 1 && wPath > 0.15) {
      const closed = adapt > 0.25;
      const list = closed ? pts.concat([pts[0]]) : pts;
      this.pulseT += 0.0016 * (1 + adapt * 0.9 + resolve * 0.6);
      if (this.pulseT > (closed ? 1 : 1.3)) this.pulseT = 0;
      if (this.pulseT <= 1) {
        const u = this.pulseT * (list.length - 1);
        const i = Math.min(list.length - 2, Math.floor(u)), fr = u - i;
        const px = list[i].x + (list[i + 1].x - list[i].x) * fr;
        const py = list[i].y + (list[i + 1].y - list[i].y) * fr;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 24);
        g.addColorStop(0, orange(0.5 * wPath)); g.addColorStop(1, orange(0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 24, 0, 6.2832); ctx.fill();
        ctx.fillStyle = orange(0.9 * wPath); ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 6.2832); ctx.fill();
      }
    }

    if (resolve > 0.15 && pts && pts.length && this.ctaEl) {
      const rr = this.ctaEl.getBoundingClientRect();
      if (rr.top < H * 1.2 && rr.bottom > -100) {
        const end = pts[pts.length - 1];
        const tx = rr.left + rr.width * 0.5, ty = rr.top - 24;
        ctx.save(); ctx.setLineDash([2, 6]);
        link(end, { x: tx, y: ty }, orange(resolve * 0.45));
        ctx.restore();
        ctx.fillStyle = orange(resolve); ctx.fillRect(tx - 2.5, ty - 2.5, 5, 5);
      }
    }

    const sigOn = 0.4 + sg(0.7, 2.2) * 0.6;
    for (const q of pos) {
      const n = q.n;
      const r = n.base * (0.55 + n.depth * 0.6);
      if (n.signal) {
        const a = Math.min(1, sigOn) * Math.max(0.25, q.alpha);
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 22 * a);
        g.addColorStop(0, orange(0.3 * a)); g.addColorStop(1, orange(0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, 22 * a, 0, 6.2832); ctx.fill();
        ctx.fillStyle = orange(a); ctx.beginPath(); ctx.arc(q.x, q.y, r * 1.05, 0, 6.2832); ctx.fill();
        continue;
      }
      const a = q.alpha * (0.14 + n.depth * 0.44);
      if (a < 0.01) continue;
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 6.2832);
      ctx.fillStyle = white(a); ctx.fill();
    }
    this.sigPos = sig ? { x: sig.x, y: sig.y } : null;
    this.drawTraveler(ctx, acc, t);
    ctx.restore();
  }

  drawTraveler(ctx: CanvasRenderingContext2D, acc: string, t: number) {
    const p = this.phase;
    if (!this.originEl) return;
    const r = this.originEl.getBoundingClientRect();
    this.originEl.style.opacity = String(Math.max(0, 1 - Math.max(0, p) * 3.4));
    if (p < 0.05 || p > 1.25 || !this.sigPos) return;
    const from = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const k = Math.max(0, Math.min(1, p / 1.05));
    const e = k * k * (3 - 2 * k);
    const x = from.x + (this.sigPos.x - from.x) * e;
    const y = from.y + (this.sigPos.y - from.y) * e;
    const fade = Math.max(0, Math.min(1, (1.25 - p) / 0.45));
    const puls = this.reduced ? 1 : 0.85 + Math.sin(t * 2.2) * 0.15;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 32 * puls);
    g.addColorStop(0, "rgba(" + acc + "," + (0.36 * fade).toFixed(3) + ")");
    g.addColorStop(1, "rgba(" + acc + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 32 * puls, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "rgba(" + acc + "," + fade.toFixed(3) + ")";
    ctx.fillRect(x - 3, y - 3, 6, 6);
  }

  wireDom() {
    const root = this.canvas.parentElement;
    this.root = root;
    this.anchors = Array.from(root.querySelectorAll("[data-anchor]"));
    this.reveals = Array.from(root.querySelectorAll("[data-mask],[data-shift],[data-line],[data-par],[data-edge],[data-count],[data-thread]"));
    this.navLinks = Array.from(root.querySelectorAll("[data-nav]"));
    this.stageRows = this.railEl ? Array.from(this.railEl.querySelectorAll("[data-stage-row]")) : [];
    this.stagePanels = this.panelsEl ? Array.from(this.panelsEl.querySelectorAll("[data-stage-panel]")) : [];
    this.meterEl = this.meterWrap ? this.meterWrap.querySelector("[data-meter]") : null;
    this.originEl = root.querySelector("[data-signal-origin]");

    if (this.fine && !this.reduced) {
      root.querySelectorAll("[data-project]").forEach((card: HTMLElement) => {
        const media = card.querySelector<HTMLElement>("[data-proj-media]");
        const title = card.querySelector<HTMLElement>("[data-proj-title]");
        const line = card.querySelector<HTMLElement>("[data-proj-line]");
        const metas = Array.from(card.querySelectorAll<HTMLElement>("[data-proj-meta]"));
        card.addEventListener("pointerenter", () => {
          if (media) media.style.transform = "scale(1.045)";
          if (title) title.style.transform = "translateX(8px)";
          if (line) line.style.transform = "scaleX(1)";
          metas.forEach(m => { m.style.transform = "translateY(-3px)"; m.style.color = "rgba(255,253,249,.7)"; });
        });
        card.addEventListener("pointerleave", () => {
          if (media) media.style.transform = "scale(1)";
          if (title) title.style.transform = "translateX(0)";
          if (line) line.style.transform = "scaleX(0)";
          metas.forEach(m => { m.style.transform = "translateY(0)"; m.style.color = "#777386"; });
        });
        card.addEventListener("pointermove", e => {
          if (!media) return;
          const r = card.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top) / r.height - 0.5;
          media.style.transform = "scale(1.045) translate(" + (dx * -14).toFixed(2) + "px," + (dy * -10).toFixed(2) + "px)";
        });
      });
      root.querySelectorAll("[data-depth]").forEach((box: HTMLElement) => {
        const inner = box.querySelector<HTMLElement>("[data-depth-inner]");
        box.addEventListener("pointermove", e => {
          const r = box.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top) / r.height - 0.5;
          if (inner) inner.style.transform = "translate(" + (dx * -10).toFixed(2) + "px," + (dy * -8).toFixed(2) + "px) scale(1.02)";
        });
        box.addEventListener("pointerleave", () => { if (inner) inner.style.transform = "translate(0,0) scale(1)"; });
      });
      root.querySelectorAll("[data-cta]").forEach((btn: HTMLElement) => {
        const arrow = btn.querySelector<HTMLElement>("[data-arrow]");
        btn.addEventListener("pointerenter", () => { if (arrow) arrow.style.transform = "translateX(5px)"; });
        btn.addEventListener("pointerleave", () => { if (arrow) arrow.style.transform = "translateX(0)"; });
      });
    }

    if (this.fine && !this.reduced && (this.props.customCursor ?? true) && this.cursorEl) {
      document.body.setAttribute("data-hidecursor", "1");
      this.ring = this.cursorEl.querySelector("[data-cursor-ring]");
      this.cdot = this.cursorEl.querySelector("[data-cursor-dot]");
      this.clabel = this.cursorEl.querySelector("[data-cursor-label]");
      this.ctx2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      this.setCursorState = (mode: string) => {
        if (this.cmode === mode) return;
        this.cmode = mode;
        const big = mode === "ver";
        this.ring.style.width = big ? "62px" : mode === "arrow" ? "40px" : "26px";
        this.ring.style.height = big ? "62px" : mode === "arrow" ? "40px" : "26px";
        this.ring.style.left = big ? "-31px" : mode === "arrow" ? "-20px" : "-13px";
        this.ring.style.top = big ? "-31px" : mode === "arrow" ? "-20px" : "-13px";
        this.ring.style.background = big ? "rgba(234,87,26,.92)" : "transparent";
        this.ring.style.borderColor = mode === "arrow" ? "rgba(234,87,26,.9)" : big ? "rgba(234,87,26,0)" : "rgba(255,253,249,.5)";
        this.cdot.style.opacity = mode === "dot" || !mode ? "1" : "0";
        this.clabel.textContent = big ? "Ver" : mode === "arrow" ? "\u2192" : "";
        this.clabel.style.opacity = big || mode === "arrow" ? "1" : "0";
        this.clabel.style.color = big ? "#FFFDF9" : "#EA571A";
      };
      this.onOver = (e: PointerEvent) => {
        const target = e.target as Element | null;
        const t = target && target.closest ? target.closest("[data-cursor]") : null;
        this.setCursorState(t ? t.getAttribute("data-cursor") : "");
      };
      document.addEventListener("pointerover", this.onOver);
    }

    this.onMove = (e: PointerEvent) => {
      this.tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      this.tmy = (e.clientY / window.innerHeight - 0.5) * 2;
      if (this.cursorEl && this.ring) { this.pointer = { x: e.clientX, y: e.clientY }; this.cursorEl.style.opacity = "1"; }
    };
    this.onResize = () => { if (this.canvas && this.canvas.clientWidth) this.build(); this.measure(); };
    this.onScroll = () => { this.scrollY = this.sy(); };
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("scroll", this.onScroll, { passive: true, capture: true });
    if (this.fine && !this.reduced) window.addEventListener("pointermove", this.onMove, { passive: true });
    this.measure();
  }

  sy() {
    const d = document.documentElement, b = document.body;
    return Math.max(window.scrollY || 0, d ? d.scrollTop || 0 : 0, b ? b.scrollTop || 0 : 0);
  }

  measure() {
    if (!this.anchors) return;
    const y = this.sy();
    const m: Record<string, { top: number; h: number }> = {};
    for (const el of this.anchors) {
      const r = el.getBoundingClientRect();
      m[el.getAttribute("data-anchor")] = { top: r.top + y, h: r.height };
    }
    this.marks = m;
  }

  /* ---------- DOM reactions ---------- */
  updateDom(rawPhase: number) {
    const H = window.innerHeight;
    for (const el of this.reveals) {
      const r = el.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, (H * 0.92 - r.top) / (H * 0.42)));
      const e = this.reduced ? 1 : t * t * (3 - 2 * t);
      if (el.hasAttribute("data-mask")) el.style.clipPath = "inset(0 " + ((1 - e) * 100).toFixed(2) + "% 0 0)";
      if (el.hasAttribute("data-shift")) { el.style.opacity = (0.15 + e * 0.85).toFixed(3); el.style.transform = "translateY(" + ((1 - e) * 16).toFixed(2) + "px)"; }
      if (el.hasAttribute("data-line")) el.style.transform = "scaleX(" + e.toFixed(3) + ")";
      if (el.hasAttribute("data-thread")) el.style.transform = "scaleY(" + e.toFixed(3) + ")";
      if (el.hasAttribute("data-edge")) el.style.transform = "scaleY(" + e.toFixed(3) + ")";
      if (el.hasAttribute("data-par") && !this.narrow) {
        const k = parseFloat(el.getAttribute("data-par")) || 0;
        el.style.transform = "translateY(" + ((H * 0.5 - r.top) * k * -0.14).toFixed(2) + "px)";
      }
      if (el.hasAttribute("data-count") && !el.dataset.done) {
        if (e > 0.02) {
          const goal = parseFloat(el.getAttribute("data-count"));
          const dec = parseInt(el.getAttribute("data-dec") || "0", 10);
          const v = goal * e;
          el.textContent = v.toFixed(dec) + (el.getAttribute("data-suffix") || "");
          if (e > 0.995) el.dataset.done = "1";
        }
      }
    }

    // process sticky sequence — counter, rail, panels, entropy all read one value
    if (this.processEl && this.marks && this.marks.proceso) {
      if ((!this.stageRows || !this.stageRows.length) && this.railEl) this.stageRows = Array.from(this.railEl.querySelectorAll("[data-stage-row]"));
      if ((!this.stagePanels || !this.stagePanels.length) && this.panelsEl) this.stagePanels = Array.from(this.panelsEl.querySelectorAll("[data-stage-panel]"));
      if (!this.meterEl && this.meterWrap) this.meterEl = this.meterWrap.querySelector("[data-meter]");
      const mk = this.marks.proceso;
      const local = Math.max(0, Math.min(1, (this.scrollY - mk.top) / Math.max(1, mk.h - H)));
      const fi = local * 4;
      const ai = Math.max(0, Math.min(4, Math.round(fi)));
      this.stageRows.forEach((row: HTMLElement, i: number) => {
        const on = i === ai;
        row.style.color = on ? "#FFFDF9" : "#777386";
        row.style.opacity = on ? "1" : i < ai ? "0.52" : "0.26";
        const bar = row.querySelector<HTMLElement>("[data-stage-bar]");
        if (bar) { bar.style.transform = "scaleX(" + (on ? 1 : i < ai ? 0.5 : 0.3) + ")"; bar.style.opacity = on ? "1" : "0.5"; }
      });
      this.stagePanels.forEach((pl: HTMLElement, i: number) => {
        const d = fi - i;
        const vis = Math.max(0, 1 - Math.abs(d) * 1.7);
        pl.style.opacity = vis.toFixed(3);
        pl.style.transform = "translateY(" + (d * -24).toFixed(2) + "px)";
        pl.style.pointerEvents = vis > 0.6 ? "auto" : "none";
      });
      if (this.counterEl) {
        const txt = "0" + (ai + 1) + " / 05";
        if (this.counterEl.textContent !== txt) this.counterEl.textContent = txt;
      }
      const ev = [1, 0.78, 0.5, 0.24, 0.36];
      const ew = ["Alta", "Media-alta", "Media-baja", "Baja", "Controlada"];
      const f0 = Math.min(4, Math.floor(fi)), fr = Math.max(0, Math.min(1, fi - f0));
      const val = ev[f0] + (ev[Math.min(4, f0 + 1)] - ev[f0]) * fr;
      if (this.meterEl) this.meterEl.style.transform = "scaleX(" + val.toFixed(3) + ")";
      if (this.entropyWordEl && this.entropyWordEl.textContent !== ew[ai]) this.entropyWordEl.textContent = ew[ai];
    }

    // nav compact + active
    if (this.navEl) {
      const past = this.scrollY > H * 0.7;
      this.navEl.style.padding = past ? "13px clamp(20px,4.5vw,64px)" : "22px clamp(20px,4.5vw,64px)";
      this.navEl.style.backgroundColor = past ? "rgba(22,19,41,.72)" : "rgba(22,19,41,0)";
      this.navEl.style.backdropFilter = past ? "blur(9px)" : "none";
      this.navEl.style.webkitBackdropFilter = past ? "blur(9px)" : "none";
      this.navEl.style.borderColor = past ? "rgba(255,253,249,.07)" : "rgba(255,253,249,0)";
      let cur = "";
      for (const el of this.anchors) {
        const r = el.getBoundingClientRect();
        if (r.top <= H * 0.34 && r.bottom > H * 0.34) cur = el.getAttribute("data-anchor");
      }
      if (cur === "patron") cur = "proceso";
      for (const a of this.navLinks) {
        const on = a.getAttribute("data-nav") === cur;
        if (a.hasAttribute("data-cta") === false && !a.style.border) {
          a.style.color = on ? "#FFFDF9" : "#777386";
        }
        const dot = a.querySelector("[data-navdot]");
        if (dot) dot.style.opacity = on ? "1" : "0";
      }
    }

    const labels = ["Nodos dispersos / sin patrón", "Señales sin significado", "Relaciones visibles", "Patrón reconocible", "Sistema construido", "Adaptación", "Señal única"];
    const li = Math.max(0, Math.min(6, Math.round(this.phase)));
    if (this.stateLabelEl && this.stateLabelEl.textContent !== labels[li]) this.stateLabelEl.textContent = labels[li];
    if (this.footStateEl) {
      const txt = "Estado del sistema: " + (this.phase > 5.3 ? "señal" : this.phase > 4.3 ? "adaptación" : this.phase > 3.4 ? "sistema" : "en proceso");
      if (this.footStateEl.textContent !== txt) this.footStateEl.textContent = txt;
    }
    if (this.patronEl) {
      const k = Math.max(0, Math.min(1, (this.phase - 5.0) / 0.6));
      this.patronEl.style.color = "rgba(255,253,249," + (0.028 + k * 0.045).toFixed(3) + ")";
      if (!this.narrow) this.patronEl.style.transform = "translateX(" + (k * 22 - 22).toFixed(1) + "px)";
    }
  }

  hexRgb(h: string) {
    const s = String(h).replace("#", "");
    const v = s.length === 3 ? s.split("").map(c => c + c).join("") : s;
    const n = parseInt(v, 16);
    if (isNaN(n)) return "234,87,26";
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",");
  }

  render() {
    const v: any = this.renderVals();
    return (
      <div style={{ position: "relative", background: "#161329", backgroundImage: "radial-gradient(80% 55% at 72% 8%,rgba(34,39,80,.85) 0%,rgba(22,19,41,0) 70%),radial-gradient(60% 40% at 8% 62%,rgba(34,39,80,.55) 0%,rgba(22,19,41,0) 72%)" }}>
      
        <canvas ref={v.canvasRef} style={{ position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "0" }}></canvas>
      
        <div ref={v.cursorRef} style={{ position: "fixed", left: "0", top: "0", zIndex: "60", pointerEvents: "none", opacity: "0", transform: "translate3d(-100px,-100px,0)", willChange: "transform" }}>
          <div data-cursor-ring="" style={{ position: "absolute", left: "-13px", top: "-13px", width: "26px", height: "26px", border: "1px solid rgba(255,253,249,.5)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "width .3s cubic-bezier(.22,.7,.2,1),height .3s cubic-bezier(.22,.7,.2,1),left .3s cubic-bezier(.22,.7,.2,1),top .3s cubic-bezier(.22,.7,.2,1),background .3s,border-color .3s" }}>
            <span data-cursor-dot="" style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#FFFDF9", transition: "opacity .25s" }}></span>
            <span data-cursor-label="" style={{ position: "absolute", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", opacity: "0", transition: "opacity .25s", color: "#FFFDF9" }}></span>
          </div>
        </div>
      
        <nav ref={v.navRef} style={{ position: "fixed", top: "0", left: "0", right: "0", zIndex: "40", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", padding: "22px clamp(20px,4.5vw,64px)", background: "linear-gradient(180deg,rgba(22,19,41,.82) 0%,rgba(22,19,41,0) 100%)", transition: "padding .45s cubic-bezier(.22,.7,.2,1),background-color .45s,backdrop-filter .45s,border-color .45s", borderBottom: "1px solid rgba(255,253,249,0)" }}>
          <a href="#top" data-cursor="dot" style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EA571A", display: "block" }}></span>
            <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: ".24em" }}>ODDLY</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px,2.4vw,34px)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <a href="#problema" data-nav="problema" data-cursor="dot" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", color: "#777386", transition: "color .3s" }}>
              <span data-navdot="" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#EA571A", opacity: "0", transition: "opacity .35s", display: "block" }}></span><span>Problema</span>
            </a>
            <a href="#proceso" data-nav="proceso" data-cursor="dot" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", color: "#777386", transition: "color .3s" }}>
              <span data-navdot="" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#EA571A", opacity: "0", transition: "opacity .35s", display: "block" }}></span><span>Proceso</span>
            </a>
            <a href="#proyectos" data-nav="proyectos" data-cursor="dot" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", color: "#777386", transition: "color .3s" }}>
              <span data-navdot="" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#EA571A", opacity: "0", transition: "opacity .35s", display: "block" }}></span><span>Proyectos</span>
            </a>
            <a href="#estudio" data-nav="estudio" data-cursor="dot" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", color: "#777386", transition: "color .3s" }}>
              <span data-navdot="" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#EA571A", opacity: "0", transition: "opacity .35s", display: "block" }}></span><span>Estudio</span>
            </a>
            <a href="#faq" data-nav="faq" data-cursor="dot" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", color: "#777386", transition: "color .3s" }}>
              <span data-navdot="" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#EA571A", opacity: "0", transition: "opacity .35s", display: "block" }}></span><span>FAQ</span>
            </a>
            <a href="#contacto" data-nav="contacto" data-cursor="arrow" style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "40px", padding: "11px 18px", border: "1px solid rgba(234,87,26,.5)", color: "#EA571A", letterSpacing: ".14em", transition: "background-color .3s,border-color .3s" }} data-h="h1">
              <span>Hablemos</span>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#EA571A", display: "block" }}></span>
            </a>
          </div>
        </nav>
      
        {/* ============ HERO ============ */}
        <section id="top" data-anchor="hero" data-screen-label="Hero" style={{ position: "relative", zIndex: "1", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "140px clamp(20px,4.5vw,64px) 48px", maxWidth: "1560px", margin: "0 auto", boxSizing: "border-box" }}>
          <div data-par="0.05" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386", display: "flex", alignItems: "center", gap: "14px", marginBottom: "clamp(24px,4vh,48px)", willChange: "transform" }}>
            <span data-line="" style={{ width: "36px", height: "1px", background: "#EA571A", display: "block", transformOrigin: "left center" }}></span>
            <span>01 — Señal</span>
            <span style={{ color: "rgba(119,115,134,.6)" }}>Estudio de tecnología digital</span>
          </div>
      
          <h1 data-par="0.12" style={{ margin: "0", fontSize: "clamp(56px,11.2vw,186px)", lineHeight: ".86", letterSpacing: "-.05em", fontWeight: "500", textWrap: "balance", maxWidth: "15ch", willChange: "transform" }}>
            Deja de<br />adivinar<span data-signal-origin="" style={{ display: "inline-block", width: ".16em", height: ".16em", background: "#EA571A", marginLeft: ".05em", verticalAlign: "baseline", transition: "opacity .5s" }}></span>
          </h1>
      
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,5vw,80px)", alignItems: "flex-end", justifyContent: "space-between", marginTop: "clamp(36px,6vh,72px)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
              <a href="#contacto" data-cursor="arrow" data-cta="" style={{ display: "inline-flex", alignItems: "center", gap: "12px", minHeight: "52px", padding: "16px 26px", background: "#EA571A", color: "#FFFDF9", fontSize: "14px", fontWeight: "500", transition: "transform .35s cubic-bezier(.22,.7,.2,1),background-color .3s" }} data-h="h2">
                <span>Empezar un proyecto</span>
                <span data-arrow="" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px", display: "block", transition: "transform .35s cubic-bezier(.22,.7,.2,1)" }}>→</span>
              </a>
              <a href="#proceso" data-cursor="dot" style={{ display: "inline-flex", alignItems: "center", gap: "10px", minHeight: "52px", padding: "16px 22px", border: "1px solid rgba(255,253,249,.14)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: "#777386", transition: "border-color .35s,color .35s" }} data-h="h3">Ver el proceso</a>
            </div>
            <p data-shift="" style={{ margin: "0", maxWidth: "42ch", fontSize: "clamp(15px,1.15vw,18px)", lineHeight: "1.6", color: "#777386", textWrap: "pretty", willChange: "transform,opacity" }}>
              Convertimos información dispersa, intuiciones y complejidad en productos digitales con una estructura visible. Primero el patrón. Después el diseño.
            </p>
          </div>
      
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", marginTop: "clamp(48px,9vh,110px)", paddingTop: "20px", borderTop: "1px solid rgba(255,253,249,.08)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(119,115,134,.85)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}><span data-scrollmark="" style={{ width: "8px", height: "8px", border: "1px solid rgba(255,253,249,.3)", display: "block" }}></span>Scroll — Caos</span>
            <span ref={v.stateLabelRef}>Nodos dispersos / sin patrón</span>
          </div>
        </section>
      
        <div style={{ position: "relative", zIndex: "1", height: "clamp(90px,14vh,170px)", marginLeft: "clamp(20px,4.5vw,64px)" }}>
          <div data-thread="" style={{ position: "absolute", top: "0", bottom: "0", left: "0", width: "1px", background: "linear-gradient(180deg,rgba(255,253,249,.02),rgba(255,253,249,.16))", transformOrigin: "top center" }}></div>
          <div style={{ position: "absolute", bottom: "0", left: "-3px", width: "7px", height: "7px", borderRadius: "50%", background: "#EA571A" }}></div>
        </div>
      
        {/* ============ PROBLEMA ============ */}
        <section id="problema" data-anchor="problema" data-screen-label="Problema" style={{ position: "relative", zIndex: "1", maxWidth: "1560px", margin: "0 auto", padding: "clamp(40px,7vh,90px) clamp(20px,4.5vw,64px) clamp(80px,12vh,160px)", boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: "clamp(40px,6vw,96px)", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 440px", minWidth: "min(100%,340px)" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386", marginBottom: "clamp(24px,4vh,44px)" }}>02 — Ruido</div>
            <h2 data-mask="" style={{ margin: "0", fontSize: "clamp(34px,4.6vw,72px)", lineHeight: "1.02", letterSpacing: "-.035em", fontWeight: "500", maxWidth: "20ch", willChange: "clip-path" }}>No falta información. Falta el patrón.</h2>
            <p data-shift="" style={{ margin: "clamp(24px,3.5vh,40px) 0 0", maxWidth: "46ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.65", color: "#777386", textWrap: "pretty", willChange: "transform,opacity" }}>
              La mayoría de los equipos deciden con fragmentos: analítica sin contexto, feedback contradictorio, roadmaps heredados, opiniones que pesan más que la evidencia. El resultado no es falta de trabajo, es trabajo sin dirección.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px,3vw,44px)", marginTop: "clamp(32px,5vh,56px)" }}>
              <div style={{ minWidth: "120px" }}>
                <div data-count="72" data-suffix="%" style={{ fontSize: "clamp(28px,3vw,44px)", letterSpacing: "-.03em", lineHeight: "1" }}>72%</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#777386", marginTop: "8px" }}>Decisiones sin evidencia</div>
              </div>
              <div style={{ minWidth: "120px" }}>
                <div data-count="3.4" data-suffix="x" data-dec="1" style={{ fontSize: "clamp(28px,3vw,44px)", letterSpacing: "-.03em", lineHeight: "1" }}>3.4x</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#777386", marginTop: "8px" }}>Retrabajo evitable</div>
              </div>
            </div>
          </div>
      
          <div ref={v.signalsRef} data-par="-0.04" style={{ flex: "1 1 420px", minWidth: "min(100%,320px)", border: "1px solid rgba(255,253,249,.08)", background: "linear-gradient(180deg,rgba(34,39,80,.45),rgba(34,39,80,.18))", padding: "clamp(20px,2.4vw,34px)", willChange: "transform" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#777386", paddingBottom: "16px", borderBottom: "1px solid rgba(255,253,249,.08)" }}>
              <span>Entrada / sin ordenar</span><span data-signal-readout="">08 señales</span>
            </div>
            {(v.signals || []).map((s: any, sIndex: number) => (<React.Fragment key={sIndex}>
              <div onMouseEnter={s.on} onFocus={s.on} onMouseLeave={s.off} onClick={s.on} tabIndex={0} data-cursor="dot" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 12px", margin: "0 -12px", borderBottom: "1px solid rgba(255,253,249,.06)", fontSize: "14px", cursor: "pointer", transition: "opacity .35s,color .35s,background .45s,padding-left .35s", opacity: `${s.opacity}`, color: `${s.color}`, background: `${s.bg}`, paddingLeft: `${s.pad}` }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".14em", transition: "color .35s", color: `${s.numColor}` }}>{s.num}</span>
                <span style={{ flex: "1" }}>{s.text}</span>
                <span style={{ width: "5px", height: "5px", display: "block", transition: "background .35s,transform .35s", background: `${s.tickColor}`, transform: `${s.tick}` }}></span>
              </div>
            </React.Fragment>))}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#EA571A" }}>
              <span style={{ width: "24px", height: "1px", background: "#EA571A", display: "block" }}></span><span>{v.signalNote}</span>
            </div>
          </div>
        </section>
      
        {/* ============ PROCESO (sticky sequence) ============ */}
        <section id="proceso" data-anchor="proceso" data-screen-label="Proceso" ref={v.processRef} style={{ position: "relative", zIndex: "1", height: "460vh" }}>
          <div style={{ position: "sticky", top: "0", height: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ width: "100%", maxWidth: "1560px", margin: "0 auto", padding: "clamp(70px,11vh,96px) clamp(20px,4.5vw,64px) clamp(24px,5vh,56px)", boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: "clamp(16px,3vw,64px)", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 380px", minWidth: "min(100%,300px)", maxWidth: "620px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "20px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386", marginBottom: "clamp(20px,3.5vh,40px)" }}>
                  <span>03 — Estructura</span>
                  <span ref={v.stageCounterRef} style={{ color: "rgba(255,253,249,.8)" }}>01 / 05</span>
                </div>
      
                <div ref={v.stageRailRef} style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "clamp(16px,3.4vh,44px)" }}>
                  <div data-stage-row="0" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "9px 0", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", transition: "color .4s,opacity .4s" }}>
                    <span data-stage-bar="" style={{ width: "clamp(28px,4vw,64px)", height: "1px", background: "currentColor", display: "block", transformOrigin: "left center", transition: "transform .5s cubic-bezier(.22,.7,.2,1),opacity .4s" }}></span>
                    <span data-stage-num="">01</span><span data-stage-name="" style={{ letterSpacing: ".14em" }}>Entender</span>
                  </div>
                  <div data-stage-row="1" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "9px 0", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", transition: "color .4s,opacity .4s" }}>
                    <span data-stage-bar="" style={{ width: "clamp(28px,4vw,64px)", height: "1px", background: "currentColor", display: "block", transformOrigin: "left center", transition: "transform .5s cubic-bezier(.22,.7,.2,1),opacity .4s" }}></span>
                    <span data-stage-num="">02</span><span data-stage-name="" style={{ letterSpacing: ".14em" }}>Conectar</span>
                  </div>
                  <div data-stage-row="2" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "9px 0", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", transition: "color .4s,opacity .4s" }}>
                    <span data-stage-bar="" style={{ width: "clamp(28px,4vw,64px)", height: "1px", background: "currentColor", display: "block", transformOrigin: "left center", transition: "transform .5s cubic-bezier(.22,.7,.2,1),opacity .4s" }}></span>
                    <span data-stage-num="">03</span><span data-stage-name="" style={{ letterSpacing: ".14em" }}>Estructurar</span>
                  </div>
                  <div data-stage-row="3" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "9px 0", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", transition: "color .4s,opacity .4s" }}>
                    <span data-stage-bar="" style={{ width: "clamp(28px,4vw,64px)", height: "1px", background: "currentColor", display: "block", transformOrigin: "left center", transition: "transform .5s cubic-bezier(.22,.7,.2,1),opacity .4s" }}></span>
                    <span data-stage-num="">04</span><span data-stage-name="" style={{ letterSpacing: ".14em" }}>Construir</span>
                  </div>
                  <div data-stage-row="4" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "9px 0", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", transition: "color .4s,opacity .4s" }}>
                    <span data-stage-bar="" style={{ width: "clamp(28px,4vw,64px)", height: "1px", background: "currentColor", display: "block", transformOrigin: "left center", transition: "transform .5s cubic-bezier(.22,.7,.2,1),opacity .4s" }}></span>
                    <span data-stage-num="">05</span><span data-stage-name="" style={{ letterSpacing: ".14em" }}>Evolucionar</span>
                  </div>
                </div>
      
                <div ref={v.stagePanelsRef} style={{ position: "relative", minHeight: "clamp(150px,24vh,260px)" }}>
                  <div data-stage-panel="0" style={{ position: "absolute", inset: "0", willChange: "transform,opacity" }}>
                    <h3 style={{ margin: "0", fontSize: "clamp(28px,3.6vw,56px)", lineHeight: "1.02", letterSpacing: "-.035em", fontWeight: "500" }}>Entender</h3>
                    <p style={{ margin: "18px 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.62", color: "#777386", textWrap: "pretty" }}>Recogemos todo lo disperso sin filtrarlo todavía: datos, entrevistas, tickets, contradicciones. Aceptamos la entropía antes de reducirla.</p>
                    <div style={{ marginTop: "22px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.8)" }}>Estado del sistema — caos</div>
                  </div>
                  <div data-stage-panel="1" style={{ position: "absolute", inset: "0", opacity: "0", pointerEvents: "none", willChange: "transform,opacity" }}>
                    <h3 style={{ margin: "0", fontSize: "clamp(28px,3.6vw,56px)", lineHeight: "1.02", letterSpacing: "-.035em", fontWeight: "500" }}>Conectar</h3>
                    <p style={{ margin: "18px 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.62", color: "#777386", textWrap: "pretty" }}>Buscamos relaciones: qué señal explica a otra, qué se repite, qué es anécdota. Aparecen las primeras líneas entre puntos.</p>
                    <div style={{ marginTop: "22px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.8)" }}>Estado del sistema — relaciones</div>
                  </div>
                  <div data-stage-panel="2" style={{ position: "absolute", inset: "0", opacity: "0", pointerEvents: "none", willChange: "transform,opacity" }}>
                    <h3 style={{ margin: "0", fontSize: "clamp(28px,3.6vw,56px)", lineHeight: "1.02", letterSpacing: "-.035em", fontWeight: "500" }}>Estructurar</h3>
                    <p style={{ margin: "18px 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.62", color: "#777386", textWrap: "pretty" }}>Las relaciones se convierten en jerarquía: modelo de información, flujos, prioridades. Aquí la decisión deja de ser una opinión.</p>
                    <div style={{ marginTop: "22px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.8)" }}>Estado del sistema — patrón</div>
                  </div>
                  <div data-stage-panel="3" style={{ position: "absolute", inset: "0", opacity: "0", pointerEvents: "none", willChange: "transform,opacity" }}>
                    <h3 style={{ margin: "0", fontSize: "clamp(28px,3.6vw,56px)", lineHeight: "1.02", letterSpacing: "-.035em", fontWeight: "500" }}>Construir</h3>
                    <p style={{ margin: "18px 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.62", color: "#777386", textWrap: "pretty" }}>Diseño e ingeniería en el mismo movimiento. Interfaces, sistema de diseño y producto en Next.js, listos para crecer sin deuda visual.</p>
                    <div style={{ marginTop: "22px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.8)" }}>Estado del sistema — sistema</div>
                  </div>
                  <div data-stage-panel="4" style={{ position: "absolute", inset: "0", opacity: "0", pointerEvents: "none", willChange: "transform,opacity" }}>
                    <h3 style={{ margin: "0", fontSize: "clamp(28px,3.6vw,56px)", lineHeight: "1.02", letterSpacing: "-.035em", fontWeight: "500" }}>Evolucionar</h3>
                    <p style={{ margin: "18px 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.62", color: "#777386", textWrap: "pretty" }}>El sistema se mide y se corrige. Cada ciclo devuelve una señal nueva y el patrón se vuelve más nítido.</p>
                    <div style={{ marginTop: "22px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#EA571A" }}>Estado del sistema — adaptación</div>
                  </div>
                </div>
              </div>
      
              <div style={{ flex: "1 1 300px", minWidth: "min(100%,240px)", alignSelf: "stretch", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <div ref={v.processMeterRef} style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.75)", textAlign: "right" }}>
                  <span style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}><span>Entropía</span><span ref={v.entropyWordRef} style={{ color: "rgba(255,253,249,.82)" }}>Alta</span></span>
                  <div style={{ width: "clamp(120px,14vw,200px)", height: "1px", background: "rgba(255,253,249,.12)", position: "relative" }}>
                    <span data-meter="" style={{ position: "absolute", inset: "0", background: "#EA571A", transformOrigin: "right center", display: "block" }}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        {/* ============ PATRÓN ============ */}
        <section data-anchor="patron" data-screen-label="Patrón" style={{ position: "relative", zIndex: "1", overflow: "hidden", borderTop: "1px solid rgba(255,253,249,.07)", borderBottom: "1px solid rgba(255,253,249,.07)", background: "linear-gradient(180deg,rgba(34,39,80,.32),rgba(22,19,41,.1))" }}>
          <div data-patron="" aria-hidden="true" ref={v.patronRef} style={{ position: "absolute", left: "-4vw", bottom: "-3vh", fontSize: "26vw", lineHeight: ".8", letterSpacing: "-.06em", fontWeight: "600", color: "rgba(255,253,249,.028)", pointerEvents: "none", whiteSpace: "nowrap", willChange: "transform,color" }}>PATRÓN</div>
          <div style={{ position: "relative", maxWidth: "1560px", margin: "0 auto", padding: "clamp(70px,11vh,150px) clamp(20px,4.5vw,64px)", boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: "clamp(36px,5vw,90px)" }}>
            <div style={{ flex: "1 1 460px", minWidth: "min(100%,320px)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386", marginBottom: "clamp(24px,4vh,44px)" }}>04 — Claridad</div>
              <h2 data-mask="" style={{ margin: "0", fontSize: "clamp(32px,4.4vw,68px)", lineHeight: "1.02", letterSpacing: "-.038em", fontWeight: "500", maxWidth: "18ch", willChange: "clip-path" }}>No diseñamos pantallas. Hacemos visible el sistema.</h2>
              <p data-shift="" style={{ margin: "clamp(24px,3.5vh,40px) 0 0", maxWidth: "48ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.65", color: "#777386", textWrap: "pretty", willChange: "transform,opacity" }}>Trabajamos con equipos que ya tienen demasiada información y muy poca dirección. Nuestro trabajo empieza antes de la interfaz y no termina en el handoff.</p>
            </div>
            <div style={{ flex: "1 1 380px", minWidth: "min(100%,300px)", display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,253,249,.07)" }}>
              <div data-cursor="dot" style={{ position: "relative", background: "rgba(22,19,41,.6)", padding: "clamp(20px,2.2vw,30px)", transition: "background-color .4s" }} data-h="h4">
                <span data-edge="" style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "1px", background: "#EA571A", transform: "scaleY(0)", transformOrigin: "top center", transition: "transform .5s cubic-bezier(.22,.7,.2,1)" }}></span>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386", marginBottom: "12px" }}>A / Evidencia</div>
                <div style={{ fontSize: "clamp(17px,1.35vw,21px)", lineHeight: "1.35", letterSpacing: "-.015em" }}>Ninguna decisión de diseño sin una señal que la respalde.</div>
              </div>
              <div data-cursor="dot" style={{ position: "relative", background: "rgba(22,19,41,.6)", padding: "clamp(20px,2.2vw,30px)", transition: "background-color .4s" }} data-h="h5">
                <span data-edge="" style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "1px", background: "#EA571A", transform: "scaleY(0)", transformOrigin: "top center", transition: "transform .5s cubic-bezier(.22,.7,.2,1)" }}></span>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386", marginBottom: "12px" }}>B / Sistema</div>
                <div style={{ fontSize: "clamp(17px,1.35vw,21px)", lineHeight: "1.35", letterSpacing: "-.015em" }}>Entregamos estructura reutilizable, no pantallas sueltas.</div>
              </div>
              <div data-cursor="dot" style={{ position: "relative", background: "rgba(22,19,41,.6)", padding: "clamp(20px,2.2vw,30px)", transition: "background-color .4s" }} data-h="h6">
                <span data-edge="" style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "1px", background: "#EA571A", transform: "scaleY(0)", transformOrigin: "top center", transition: "transform .5s cubic-bezier(.22,.7,.2,1)" }}></span>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", textTransform: "uppercase", color: "#EA571A", marginBottom: "12px" }}>C / Señal</div>
                <div style={{ fontSize: "clamp(17px,1.35vw,21px)", lineHeight: "1.35", letterSpacing: "-.015em" }}>Un solo foco por ciclo. Lo importante nunca compite.</div>
              </div>
            </div>
          </div>
        </section>
      
        {/* ============ PROYECTOS ============ */}
        <section id="proyectos" data-anchor="proyectos" data-screen-label="Proyectos" style={{ position: "relative", zIndex: "1", maxWidth: "1560px", margin: "0 auto", padding: "clamp(80px,12vh,150px) clamp(20px,4.5vw,64px)", boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "baseline", justifyContent: "space-between", marginBottom: "clamp(32px,5vh,60px)" }}>
            <h2 data-mask="" style={{ margin: "0", fontSize: "clamp(30px,3.6vw,58px)", lineHeight: "1.04", letterSpacing: "-.035em", fontWeight: "500", willChange: "clip-path" }}>Evidencia del sistema</h2>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386" }}>05 — Proyectos / 2024–2026</div>
          </div>
      
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(48px,8vh,110px)" }}>
            <article data-project="" data-cursor="ver" style={{ display: "flex", flexDirection: "column", gap: "clamp(18px,2.4vh,28px)", cursor: "pointer" }}>
              <div data-mask="" style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,253,249,.08)", aspectRatio: "16/7", minHeight: "220px", willChange: "clip-path" }}>
                <div data-proj-media="" style={{ position: "absolute", inset: "-6%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.75) 0 10px,rgba(34,39,80,.4) 10px 20px)", transition: "transform .8s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div>
                <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(119,115,134,.9)", background: "rgba(22,19,41,.75)", padding: "10px 16px" }}>Imagen del proyecto — 16:7</span>
                <span style={{ position: "absolute", left: "20px", top: "20px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", color: "#EA571A" }}>01</span>
                <span data-proj-line="" style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "1px", background: "#EA571A", transform: "scaleX(0)", transformOrigin: "left center", transition: "transform .6s cubic-bezier(.22,.7,.2,1)" }}></span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px,3vw,60px)", alignItems: "flex-start" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <h3 data-proj-title="" style={{ margin: "0", fontSize: "clamp(22px,2.4vw,38px)", fontWeight: "500", letterSpacing: "-.028em", transition: "transform .5s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}>Meridian — plataforma de riesgo</h3>
                  <p style={{ margin: "14px 0 0", maxWidth: "56ch", fontSize: "15px", lineHeight: "1.6", color: "#777386", textWrap: "pretty" }}>Once dashboards heredados reducidos a un modelo de información único. El equipo pasó de reportar a decidir.</p>
                </div>
                <div style={{ display: "flex", gap: "clamp(20px,2.6vw,44px)", flexWrap: "wrap", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#777386" }}>
                  <div data-proj-meta="" style={{ transition: "transform .5s cubic-bezier(.22,.7,.2,1),color .4s" }}><div style={{ color: "rgba(119,115,134,.6)", marginBottom: "7px" }}>Categoría</div><div style={{ color: "rgba(255,253,249,.8)" }}>Fintech</div></div>
                  <div data-proj-meta="" style={{ transition: "transform .5s cubic-bezier(.22,.7,.2,1) 40ms,color .4s" }}><div style={{ color: "rgba(119,115,134,.6)", marginBottom: "7px" }}>Año</div><div style={{ color: "rgba(255,253,249,.8)" }}>2026</div></div>
                  <div data-proj-meta="" style={{ transition: "transform .5s cubic-bezier(.22,.7,.2,1) 80ms,color .4s" }}><div style={{ color: "rgba(119,115,134,.6)", marginBottom: "7px" }}>Rol</div><div style={{ color: "rgba(255,253,249,.8)" }}>Estrategia · UI · Build</div></div>
                </div>
              </div>
            </article>
      
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,4vw,64px)" }}>
              <article data-project="" data-cursor="ver" style={{ flex: "1 1 340px", minWidth: "min(100%,300px)", display: "flex", flexDirection: "column", gap: "18px", cursor: "pointer" }}>
                <div data-mask="" style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,253,249,.08)", aspectRatio: "4/3", willChange: "clip-path" }}>
                  <div data-proj-media="" style={{ position: "absolute", inset: "-6%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.6) 0 10px,rgba(34,39,80,.3) 10px 20px)", transition: "transform .8s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div>
                  <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(119,115,134,.9)", background: "rgba(22,19,41,.75)", padding: "10px 16px" }}>Imagen del proyecto — 4:3</span>
                  <span style={{ position: "absolute", left: "18px", top: "18px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", color: "rgba(255,253,249,.5)" }}>02</span>
                  <span data-proj-line="" style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "1px", background: "#EA571A", transform: "scaleX(0)", transformOrigin: "left center", transition: "transform .6s cubic-bezier(.22,.7,.2,1)" }}></span>
                </div>
                <div>
                  <div data-proj-meta="" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#777386", marginBottom: "10px", transition: "transform .5s cubic-bezier(.22,.7,.2,1),color .4s" }}>Logística · 2025 · Producto</div>
                  <h3 data-proj-title="" style={{ margin: "0", fontSize: "clamp(19px,1.7vw,26px)", fontWeight: "500", letterSpacing: "-.022em", transition: "transform .5s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}>Verso — operaciones en tiempo real</h3>
                  <p style={{ margin: "12px 0 0", fontSize: "14.5px", lineHeight: "1.6", color: "#777386", maxWidth: "44ch" }}>Un panel operativo donde cada alerta tiene una acción asociada. Cero decoración.</p>
                </div>
              </article>
              <article data-project="" data-cursor="ver" style={{ flex: "1 1 340px", minWidth: "min(100%,300px)", display: "flex", flexDirection: "column", gap: "18px", cursor: "pointer" }}>
                <div data-mask="" style={{ position: "relative", overflow: "hidden", border: "1px solid rgba(255,253,249,.08)", aspectRatio: "4/3", willChange: "clip-path" }}>
                  <div data-proj-media="" style={{ position: "absolute", inset: "-6%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.6) 0 10px,rgba(34,39,80,.3) 10px 20px)", transition: "transform .8s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div>
                  <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(119,115,134,.9)", background: "rgba(22,19,41,.75)", padding: "10px 16px" }}>Imagen del proyecto — 4:3</span>
                  <span style={{ position: "absolute", left: "18px", top: "18px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".2em", color: "rgba(255,253,249,.5)" }}>03</span>
                  <span data-proj-line="" style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "1px", background: "#EA571A", transform: "scaleX(0)", transformOrigin: "left center", transition: "transform .6s cubic-bezier(.22,.7,.2,1)" }}></span>
                </div>
                <div>
                  <div data-proj-meta="" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "#777386", marginBottom: "10px", transition: "transform .5s cubic-bezier(.22,.7,.2,1),color .4s" }}>Salud · 2024 · Sistema de diseño</div>
                  <h3 data-proj-title="" style={{ margin: "0", fontSize: "clamp(19px,1.7vw,26px)", fontWeight: "500", letterSpacing: "-.022em", transition: "transform .5s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}>Cadence — historia clínica</h3>
                  <p style={{ margin: "12px 0 0", fontSize: "14.5px", lineHeight: "1.6", color: "#777386", maxWidth: "44ch" }}>Un sistema de 42 componentes que redujo el tiempo de registro en 38%.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      
        {/* ============ ESTUDIO ============ */}
        <section id="estudio" data-anchor="estudio" data-screen-label="Estudio" style={{ position: "relative", zIndex: "1", borderTop: "1px solid rgba(255,253,249,.07)", maxWidth: "1560px", margin: "0 auto", padding: "clamp(70px,10vh,130px) clamp(20px,4.5vw,64px)", boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: "clamp(36px,5vw,80px)" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386", marginBottom: "24px" }}>06 — Estudio</div>
            <h2 data-mask="" style={{ margin: "0", fontSize: "clamp(28px,3.2vw,48px)", lineHeight: "1.06", letterSpacing: "-.032em", fontWeight: "500", maxWidth: "16ch", willChange: "clip-path" }}>Seis personas. Un solo criterio.</h2>
            <p data-shift="" style={{ margin: "22px 0 0", maxWidth: "42ch", fontSize: "15px", lineHeight: "1.65", color: "#777386", willChange: "transform,opacity" }}>Equipo pequeño y senior. Sin capas intermedias entre quien investiga, quien diseña y quien construye.</p>
          </div>
          <div style={{ flex: "2 1 480px", minWidth: "min(100%,300px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1px", background: "rgba(255,253,249,.07)" }}>
            <div data-cursor="dot" style={{ background: "#161329", padding: "18px" }}>
              <div data-mask="" data-depth="" style={{ position: "relative", overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(255,253,249,.06)", marginBottom: "14px", willChange: "clip-path" }}><div data-depth-inner="" style={{ position: "absolute", inset: "-8%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.7) 0 8px,rgba(34,39,80,.35) 8px 16px)", transition: "transform .7s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div></div>
              <div style={{ fontSize: "15px" }}>Ana Ferrán</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#777386", marginTop: "6px" }}>Dirección</div>
            </div>
            <div data-cursor="dot" style={{ background: "#161329", padding: "18px" }}>
              <div data-mask="" data-depth="" style={{ position: "relative", overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(255,253,249,.06)", marginBottom: "14px", willChange: "clip-path" }}><div data-depth-inner="" style={{ position: "absolute", inset: "-8%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.7) 0 8px,rgba(34,39,80,.35) 8px 16px)", transition: "transform .7s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div></div>
              <div style={{ fontSize: "15px" }}>Luis Otero</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#777386", marginTop: "6px" }}>Estrategia</div>
            </div>
            <div data-cursor="dot" style={{ background: "#161329", padding: "18px" }}>
              <div data-mask="" data-depth="" style={{ position: "relative", overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(255,253,249,.06)", marginBottom: "14px", willChange: "clip-path" }}><div data-depth-inner="" style={{ position: "absolute", inset: "-8%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.7) 0 8px,rgba(34,39,80,.35) 8px 16px)", transition: "transform .7s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div></div>
              <div style={{ fontSize: "15px" }}>Mara Ruiz</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#777386", marginTop: "6px" }}>Diseño de producto</div>
            </div>
            <div data-cursor="dot" style={{ background: "#161329", padding: "18px" }}>
              <div data-mask="" data-depth="" style={{ position: "relative", overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(255,253,249,.06)", marginBottom: "14px", willChange: "clip-path" }}><div data-depth-inner="" style={{ position: "absolute", inset: "-8%", backgroundImage: "repeating-linear-gradient(135deg,rgba(34,39,80,.7) 0 8px,rgba(34,39,80,.35) 8px 16px)", transition: "transform .7s cubic-bezier(.22,.7,.2,1)", willChange: "transform" }}></div></div>
              <div style={{ fontSize: "15px" }}>Iván Sala</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#777386", marginTop: "6px" }}>Ingeniería</div>
            </div>
          </div>
        </section>
      
        {/* ============ FAQ ============ */}
        <section id="faq" data-anchor="faq" data-screen-label="FAQ" style={{ position: "relative", zIndex: "1", borderTop: "1px solid rgba(255,253,249,.07)", maxWidth: "1560px", margin: "0 auto", padding: "clamp(70px,10vh,130px) clamp(20px,4.5vw,64px)", boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: "clamp(36px,5vw,90px)" }}>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#777386", marginBottom: "24px" }}>07 — Preguntas</div>
            <h2 data-mask="" style={{ margin: "0", fontSize: "clamp(28px,3.2vw,48px)", lineHeight: "1.06", letterSpacing: "-.032em", fontWeight: "500", maxWidth: "14ch", willChange: "clip-path" }}>Lo que suelen preguntarnos</h2>
          </div>
          <div style={{ flex: "2 1 460px", minWidth: "min(100%,300px)" }}>
            {(v.faqs || []).map((item: any, itemIndex: number) => (<React.Fragment key={itemIndex}>
              <div style={{ borderTop: "1px solid rgba(255,253,249,.09)" }}>
                <div onClick={item.toggle} role="button" tabIndex={0} data-cursor="dot" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "clamp(20px,2.6vh,28px) 0", cursor: "pointer", minHeight: "44px", transition: "color .3s" }} data-h="h7">
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".16em", color: "#777386", flex: "none" }}>{item.num}</span>
                  <span style={{ flex: "1", fontSize: "clamp(16px,1.35vw,20px)", letterSpacing: "-.014em" }}>{item.q}</span>
                  <span style={{ flex: "none", width: "14px", height: "14px", position: "relative", transition: "transform .38s cubic-bezier(.22,.7,.2,1)", transform: `${item.iconRotate}` }}>
                    <span style={{ position: "absolute", left: "0", top: "6.5px", width: "14px", height: "1px", background: `${item.iconColor}`, transition: "background .3s", display: "block" }}></span>
                    <span style={{ position: "absolute", left: "6.5px", top: "0", width: "1px", height: "14px", background: `${item.iconColor}`, transition: "background .3s", display: "block" }}></span>
                  </span>
                </div>
                <div style={{ display: "grid", overflow: "hidden", transition: "grid-template-rows .42s cubic-bezier(.22,.7,.2,1),opacity .3s", gridTemplateRows: `${item.rows}`, opacity: `${item.bodyOpacity}` }}>
                  <p style={{ margin: "0", padding: "0 40px clamp(22px,3vh,30px) 46px", fontSize: "15px", lineHeight: "1.65", color: "#777386", maxWidth: "58ch", textWrap: "pretty", minHeight: "0" }}>{item.a}</p>
                </div>
              </div>
            </React.Fragment>))}
          </div>
        </section>
      
        {/* ============ CONTACTO ============ */}
        <section id="contacto" data-anchor="contacto" data-screen-label="Contacto" style={{ position: "relative", zIndex: "1", overflow: "hidden", borderTop: "1px solid rgba(255,253,249,.07)", background: "radial-gradient(70% 90% at 78% 15%,rgba(34,39,80,.7),rgba(22,19,41,0) 70%)" }}>
          <div style={{ maxWidth: "1560px", margin: "0 auto", padding: "clamp(64px,9vh,120px) clamp(20px,4.5vw,64px) clamp(56px,8vh,104px)", boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: "clamp(40px,5vw,96px)", alignItems: "flex-start" }}>
      
            <div style={{ flex: "1 1 42%", minWidth: "min(100%,340px)", maxWidth: "660px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".24em", textTransform: "uppercase", color: "#EA571A", marginBottom: "clamp(22px,3.4vh,40px)" }}>
                <span data-line="" style={{ width: "36px", height: "1px", background: "#EA571A", display: "block", transformOrigin: "left center" }}></span><span>08 — El siguiente paso</span>
              </div>
              <h2 data-mask="" style={{ margin: "0", fontSize: "clamp(34px,5.2vw,88px)", lineHeight: ".96", letterSpacing: "-.042em", fontWeight: "500", maxWidth: "15ch", textTransform: "uppercase", willChange: "clip-path" }}>¿Seguimos adivinando o construimos tu marca?</h2>
              <p data-shift="" style={{ margin: "clamp(22px,3.2vh,36px) 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.05vw,17px)", lineHeight: "1.65", color: "#777386", textWrap: "pretty", willChange: "transform,opacity" }}>Cuéntanos dónde está tu negocio y qué necesitas resolver. Te responderemos para coordinar una primera conversación y definir el punto correcto para comenzar.</p>
              <a href={v.waHref} target="_blank" rel="noopener" data-cursor="arrow" data-cta="" style={{ display: "inline-flex", alignItems: "center", gap: "12px", minHeight: "52px", marginTop: "clamp(26px,4vh,44px)", padding: "15px 24px", border: "1px solid rgba(234,87,26,.5)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "#EA571A", transition: "background-color .3s,border-color .3s" }} data-h="h8">
                <span>Hablemos</span><span data-arrow="" style={{ display: "block", fontSize: "12px", transition: "transform .35s cubic-bezier(.22,.7,.2,1)" }}>↗</span>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "clamp(30px,5vh,56px)", paddingTop: "18px", borderTop: "1px solid rgba(255,253,249,.08)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.8)" }}>
                <span style={{ width: "6px", height: "6px", background: "#EA571A", display: "block" }}></span><span>Señal recibida — acción</span>
              </div>
            </div>
      
            <div data-shift="" style={{ flex: "1 1 50%", minWidth: "min(100%,320px)", willChange: "transform,opacity" }}>
              {v.sent ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "clamp(28px,3vw,44px)", border: "1px solid rgba(234,87,26,.35)", background: "rgba(34,39,80,.42)" }}>
                  <span style={{ width: "7px", height: "7px", background: "#EA571A", display: "block" }}></span>
                  <div style={{ fontSize: "clamp(22px,2.2vw,32px)", lineHeight: "1.1", letterSpacing: "-.028em" }}>Solicitud recibida.</div>
                  <p style={{ margin: "0", maxWidth: "40ch", fontSize: "15px", lineHeight: "1.6", color: "#777386" }}>Nos pondremos en contacto contigo para coordinar la primera conversación.</p>
                </div>
              </>) : null}
              {v.notSent ? (<>
                <form onSubmit={v.submit} noValidate style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(18px,1.8vw,26px)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label htmlFor="c-name" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386" }}>Nombre</label>
                  <input id="c-name" name="name" type="text" autoComplete="name" value={v.form.name} onChange={v.on.name} onBlur={v.blur.name} aria-invalid={v.inv.name} aria-describedby="c-name-err" style={{ width: "100%", boxSizing: "border-box", minHeight: "52px", padding: "15px 16px", background: `${v.bg.name}`, border: `1px solid ${v.bd.name}`, color: "#FFFDF9", fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", letterSpacing: "-.005em", outline: "none", borderRadius: "0", transition: "border-color .3s,background-color .3s" }} />
                  <span id="c-name-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label htmlFor="c-company" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386" }}>Empresa o marca</label>
                  <input id="c-company" name="company" type="text" autoComplete="organization" value={v.form.company} onChange={v.on.company} onBlur={v.blur.company} aria-invalid={v.inv.company} aria-describedby="c-company-err" style={{ width: "100%", boxSizing: "border-box", minHeight: "52px", padding: "15px 16px", background: `${v.bg.company}`, border: `1px solid ${v.bd.company}`, color: "#FFFDF9", fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", letterSpacing: "-.005em", outline: "none", borderRadius: "0", transition: "border-color .3s,background-color .3s" }} />
                  <span id="c-company-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.company}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label htmlFor="c-email" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386" }}>Correo electrónico</label>
                  <input id="c-email" name="email" type="email" autoComplete="email" inputMode="email" value={v.form.email} onChange={v.on.email} onBlur={v.blur.email} aria-invalid={v.inv.email} aria-describedby="c-email-err" style={{ width: "100%", boxSizing: "border-box", minHeight: "52px", padding: "15px 16px", background: `${v.bg.email}`, border: `1px solid ${v.bd.email}`, color: "#FFFDF9", fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", letterSpacing: "-.005em", outline: "none", borderRadius: "0", transition: "border-color .3s,background-color .3s" }} />
                  <span id="c-email-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.email}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label htmlFor="c-wa" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386" }}>WhatsApp</label>
                  <input id="c-wa" name="whatsapp" type="tel" autoComplete="tel" inputMode="tel" value={v.form.whatsapp} onChange={v.on.whatsapp} onBlur={v.blur.whatsapp} aria-invalid={v.inv.whatsapp} aria-describedby="c-wa-err" style={{ width: "100%", boxSizing: "border-box", minHeight: "52px", padding: "15px 16px", background: `${v.bg.whatsapp}`, border: `1px solid ${v.bd.whatsapp}`, color: "#FFFDF9", fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", letterSpacing: "-.005em", outline: "none", borderRadius: "0", transition: "border-color .3s,background-color .3s" }} />
                  <span id="c-wa-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.whatsapp}</span>
                </div>
                  <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "9px" }}>
                    <label htmlFor="c-stage" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386" }}>¿En qué etapa está tu negocio?</label>
                    <select id="c-stage" name="businessStage" value={v.form.businessStage} onChange={v.on.businessStage} onBlur={v.blur.businessStage} aria-invalid={v.inv.businessStage} aria-describedby="c-stage-err" style={{ width: "100%", boxSizing: "border-box", minHeight: "52px", padding: "15px 16px", background: `${v.bg.businessStage}`, border: `1px solid ${v.bd.businessStage}`, color: `${v.stageColor}`, fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", outline: "none", borderRadius: "0", appearance: "none", transition: "border-color .3s,background-color .3s" }}>
                      <option value="" style={{ background: "#161329", color: "#777386" }}>Selecciona una opción</option>
                      <option value="sin-marca" style={{ background: "#161329", color: "#FFFDF9" }}>Todavía no tengo marca.</option>
                      <option value="mejorar-marca" style={{ background: "#161329", color: "#FFFDF9" }}>Tengo una marca, pero necesita mejorar.</option>
                      <option value="estrategia-posicionamiento" style={{ background: "#161329", color: "#FFFDF9" }}>Necesito estrategia y posicionamiento.</option>
                      <option value="contenido-audiovisual" style={{ background: "#161329", color: "#FFFDF9" }}>Necesito contenido o producción audiovisual.</option>
                      <option value="web-tecnologia" style={{ background: "#161329", color: "#FFFDF9" }}>Necesito una página web o solución tecnológica.</option>
                      <option value="orientacion" style={{ background: "#161329", color: "#FFFDF9" }}>No estoy seguro; necesito orientación.</option>
                    </select>
                    <span id="c-stage-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.businessStage}</span>
                  </div>
                  <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "9px" }}>
                    <label htmlFor="c-msg" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: "#777386" }}>Cuéntanos brevemente qué quieres resolver</label>
                    <textarea id="c-msg" name="message" rows={5} value={v.form.message} onChange={v.on.message} onBlur={v.blur.message} aria-invalid={v.inv.message} aria-describedby="c-msg-err" style={{ width: "100%", boxSizing: "border-box", padding: "15px 16px", background: `${v.bg.message}`, border: `1px solid ${v.bd.message}`, color: "#FFFDF9", fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", lineHeight: "1.6", outline: "none", borderRadius: "0", resize: "vertical", transition: "border-color .3s,background-color .3s" }}></textarea>
                    <span id="c-msg-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.message}</span>
                  </div>
                  <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: "9px" }}>
                    <label htmlFor="c-privacy" data-cursor="dot" style={{ display: "flex", alignItems: "flex-start", gap: "14px", minHeight: "44px", padding: "11px 0", cursor: "pointer", fontSize: "14.5px", lineHeight: "1.5", color: "rgba(255,253,249,.82)" }}>
                      <input id="c-privacy" name="privacyAccepted" type="checkbox" checked={v.form.privacyAccepted} onChange={v.on.privacyAccepted} aria-invalid={v.inv.privacyAccepted} aria-describedby="c-privacy-err" style={{ appearance: "none", flex: "none", width: "18px", height: "18px", margin: "2px 0 0", background: `${v.bg.privacyAccepted}`, border: `1px solid ${v.bd.privacyAccepted}`, outline: "none", cursor: "pointer", transition: "border-color .3s,background-color .3s", boxShadow: `${v.checkMark}` }} />
                      <span>Acepto la <a href={v.privacyHref} data-cursor="dot" style={{ color: "#EA571A", textDecoration: "none", borderBottom: "1px solid rgba(234,87,26,.4)" }}>política de privacidad</a>.</span>
                    </label>
                    <span id="c-privacy-err" role="alert" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#EA571A", minHeight: "12px", lineHeight: "12px" }}>{v.err.privacyAccepted}</span>
                  </div>
                  <div style={{ gridColumn: "1/-1", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>
                    <button type="submit" ref={v.ctaRef} disabled={v.busy} data-cursor="arrow" data-cta="" style={{ display: "inline-flex", alignItems: "center", gap: "14px", minHeight: "56px", padding: "18px 30px", border: "none", background: "#EA571A", color: "#FFFDF9", fontFamily: "'Manrope',Helvetica,sans-serif", fontSize: "15px", fontWeight: "500", cursor: "pointer", opacity: `${v.btnOpacity}`, transition: "transform .35s cubic-bezier(.22,.7,.2,1),background-color .3s,opacity .3s" }} data-h="h9">
                      <span>{v.btnLabel}</span><span data-arrow="" style={{ display: "block", fontFamily: "'IBM Plex Mono',monospace", fontSize: "13px", transition: "transform .35s cubic-bezier(.22,.7,.2,1)" }}>↗</span>
                    </button>
                    <span role="status" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: `${v.statusColor}`, maxWidth: "34ch", lineHeight: "1.5" }}>{v.statusText}</span>
                  </div>
                </form>
              </>) : null}
            </div>
          </div>
        </section>
      
        <footer data-screen-label="Footer" style={{ position: "relative", zIndex: "1", borderTop: "1px solid rgba(255,253,249,.07)", maxWidth: "1560px", margin: "0 auto", padding: "clamp(40px,6vh,70px) clamp(20px,4.5vw,64px) clamp(28px,4vh,44px)", boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,5vw,80px)", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 240px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EA571A", display: "block" }}></span>
                <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: ".24em" }}>ODDLY</span>
              </div>
              <p style={{ margin: "0", maxWidth: "32ch", fontSize: "14px", lineHeight: "1.6", color: "#777386" }}>Estudio de tecnología digital. Estructura antes de interfaz.</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,4vw,64px)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ color: "rgba(119,115,134,.6)" }}>Sitio</span>
                <a href="#problema" data-cursor="dot" style={{ color: "#777386", transition: "color .3s" }} data-h="h10">Problema</a>
                <a href="#proceso" data-cursor="dot" style={{ color: "#777386", transition: "color .3s" }} data-h="h11">Proceso</a>
                <a href="#proyectos" data-cursor="dot" style={{ color: "#777386", transition: "color .3s" }} data-h="h12">Proyectos</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ color: "rgba(119,115,134,.6)" }}>Contacto</span>
                <a href="mailto:hola@oddly.studio" data-cursor="dot" style={{ color: "#777386", transition: "color .3s" }} data-h="h13">Email</a>
                <a href="#contacto" data-cursor="dot" style={{ color: "#777386", transition: "color .3s" }} data-h="h14">LinkedIn</a>
                <a href="#contacto" data-cursor="dot" style={{ color: "#777386", transition: "color .3s" }} data-h="h15">Instagram</a>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", marginTop: "clamp(32px,5vh,56px)", paddingTop: "20px", borderTop: "1px solid rgba(255,253,249,.06)", fontFamily: "'IBM Plex Mono',monospace", fontSize: "10.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(119,115,134,.75)" }}>
            <span>© 2026 Oddly Studio</span>
            <span>Madrid — Remoto</span>
            <span ref={v.footStateRef}>Estado del sistema: claridad</span>
          </div>
        </footer>
      </div>
    );
  }
}
