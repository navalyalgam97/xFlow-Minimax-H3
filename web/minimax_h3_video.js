/**
 * xFlowOne · Minimax H3 Video Generation Widget
 * ===============================================
 * Production widget matching `xFlowOne · LTX-2.3` / `one_node_ltx23.js` 1:1.
 * Features full ComfyUI V2 CSS scoping (.fk-root), 0px top padding,
 * mode pills (T2V, I2V, R2V), video player preview, status progress bar,
 * Pixaroma Orientation & Size Selector (Portrait/Landscape dropdown list),
 * prompt editor with Director drawer, Add LoRA manager drawer, gallery overlay,
 * and sleek Models & Setup Manager overlay with custom vector SVG icons across all tabs and modes.
 *
 * Author: NAVAL
 */

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const LIME = "#00ff66";
const LIME_GRAD = "linear-gradient(135deg, #a3e635, #00ff66)";
const C = {
  lime: LIME,
  bg0: "#0b0b0b",
  bg1: "#111111",
  bg2: "#181818",
  bg3: "#222222",
  border: "#2a2a2a",
  borderH: "#3c3c3c",
  text: "#dedede",
  muted: "#777777",
  dim: "#2e2e2e",
  warn: "#ffb347",
  err: "#ff4444",
  accentOrange: "#ff6744"
};

const NODE_W = 980;
const NODE_H = 760;

const LS_KEY = "xflow_one_minimax_h3_state";
const DEFAULT_NEG_PROMPT = "low quality, deformed, blurry, watermark, ugly, bad anatomy, disfigured, mutated, extra limbs, poorly drawn face, bad proportions";

const MODES = {
  T2V: "Text to Video",
  I2V: "Image to Video",
  R2V: "Reference + Audio",
};

const RESOLUTIONS = {
  Portrait: [
    { label: "352 × 608", w: 352, h: 608 },
    { label: "416 × 736", w: 416, h: 736 },
    { label: "480 × 864", w: 480, h: 864 },
    { label: "544 × 960", w: 544, h: 960 },
    { label: "608 × 1056", w: 608, h: 1056 },
    { label: "640 × 1152", w: 640, h: 1152 },
    { label: "672 × 1216", w: 672, h: 1216 },
    { label: "736 × 1280", w: 736, h: 1280 },
    { label: "768 × 1344", w: 768, h: 1344 },
    { label: "768 × 1376", w: 768, h: 1376 },
    { label: "832 × 1504", w: 832, h: 1504 },
    { label: "928 × 1664", w: 928, h: 1664 },
    { label: "1024 × 1824", w: 1024, h: 1824 },
    { label: "1088 × 1920", w: 1088, h: 1920 },
  ],
  Landscape: [
    { label: "608 × 352", w: 608, h: 352 },
    { label: "736 × 416", w: 736, h: 416 },
    { label: "864 × 480", w: 864, h: 480 },
    { label: "960 × 544", w: 960, h: 544 },
    { label: "1056 × 608", w: 1056, h: 608 },
    { label: "1152 × 640", w: 1152, h: 640 },
    { label: "1216 × 672", w: 1216, h: 672 },
    { label: "1280 × 736", w: 1280, h: 736 },
    { label: "1344 × 768", w: 1344, h: 768 },
    { label: "1376 × 768", w: 1376, h: 768 },
    { label: "1504 × 832", w: 1504, h: 832 },
    { label: "1664 × 928", w: 1664, h: 928 },
    { label: "1824 × 1024", w: 1824, h: 1024 },
    { label: "1920 × 1088", w: 1920, h: 1088 },
  ]
};

const FALLBACK_MODELS = [
  {
    id: "fl2va",
    name: "minimax_h3_fl2va_pruned_int8_convrot.safetensors",
    title: "Minimax H3 FL2VA Diffusion Model",
    approx_size_gb: "19.5 GB",
    folder: "ComfyUI/models/diffusion_models/h3/",
    url: "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors",
    installed: false, status: "idle", downloaded_bytes: 0, total_bytes: 0, percent: 0, speed_mbps: 0
  },
  {
    id: "ref2va",
    name: "minimax_h3_ref2va_pruned_int8_convrot.safetensors",
    title: "Minimax H3 Ref2VA Reference Diffusion Model",
    approx_size_gb: "19.5 GB",
    folder: "ComfyUI/models/diffusion_models/h3/",
    url: "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors",
    installed: false, status: "idle", downloaded_bytes: 0, total_bytes: 0, percent: 0, speed_mbps: 0
  },
  {
    id: "clip",
    name: "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
    title: "Qwen3-VL 32B Text Encoder / CLIP",
    approx_size_gb: "14.6 GB",
    folder: "ComfyUI/models/text_encoders/",
    url: "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
    installed: false, status: "idle", downloaded_bytes: 0, total_bytes: 0, percent: 0, speed_mbps: 0
  },
  {
    id: "video_vae",
    name: "minimax_h3_video_vae_fp16.safetensors",
    title: "Minimax H3 Video VAE",
    approx_size_gb: "4.9 GB",
    folder: "ComfyUI/models/vae/",
    url: "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors",
    installed: false, status: "idle", downloaded_bytes: 0, total_bytes: 0, percent: 0, speed_mbps: 0
  },
  {
    id: "audio_vae",
    name: "minimax_h3_audio_vae_fp32.safetensors",
    title: "Minimax H3 Audio VAE (Audio Sync)",
    approx_size_gb: "577 MB",
    folder: "ComfyUI/models/vae/",
    url: "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors",
    installed: false, status: "idle", downloaded_bytes: 0, total_bytes: 0, percent: 0, speed_mbps: 0
  }
];

// Minimal Vector SVG Path Library
const ICONS = {
  download: "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16",
  pause: ["M6 4h4v16H6z", "M14 4h4v16h-4z"],
  play: "M5 3l14 9-14 9V3z",
  trash: ["M3 6h18", "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6", "M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"],
  close: "M18 6L6 18M6 6l12 12",
  link: ["M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6", "M15 3h6v6", "M10 14L21 3"],
  gallery: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  settings: ["M12 15a3 3 0 100-6 3 3 0 000 6z", "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"],
  help: ["M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3", "M12 17h.01"],
  t2v: ["M4 7V4h16v3", "M9 20h6", "M12 4v16"],
  i2v: ["M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z", "M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z", "M21 15l-5-5L5 21"],
  r2v: ["M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z", "M19 10v2a7 7 0 01-14 0v-2", "M12 19v3"],
  random: ["M16 3h5v5", "M4 20L21 3", "M21 16v5h-5", "M15 15l6 6", "M4 4l5 5"],
  upload: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  video: ["M23 7l-7 5 7 5V7z", "M1 5h14v14H1z"],
  sound: ["M11 5L6 9H2v6h4l5 4V5z", "M19.07 4.93a10 10 0 010 14.14", "M15.54 8.46a5 5 0 010 7.07"],
  director: ["M4 19.5A2.5 2.5 0 016.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"],
  layers: ["M12 2L2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  expand: ["M15 3h6v6", "M9 21H3v-6", "M21 3l-7 7", "M3 21l7-7"],
  collapse: ["M4 14h6v6", "M20 10h-6V4", "M10 14L3 21", "M14 10l7-7"],
  check: "M20 6L9 17l-5-5",
  sparkle: ["M12 3v3m0 12v3M3 12h3m12 0h3M5.637 5.637l2.122 2.122m8.485 8.485l2.122 2.122M5.637 18.363l2.122-2.122m8.485-8.485l2.122-2.122"]
};

const svgIcon = (name, size = 14, color = "currentColor", strokeWidth = 2) => {
  const ns = "http://www.w3.org/2000/svg";
  const el = document.createElementNS(ns, "svg");
  el.setAttribute("width", size);
  el.setAttribute("height", size);
  el.setAttribute("viewBox", "0 0 24 24");
  el.setAttribute("fill", "none");
  el.setAttribute("stroke", color);
  el.setAttribute("stroke-width", strokeWidth);
  el.setAttribute("stroke-linecap", "round");
  el.setAttribute("stroke-linejoin", "round");
  el.style.display = "inline-block";
  el.style.verticalAlign = "middle";
  el.style.flexShrink = "0";

  const dData = ICONS[name] || ICONS.sparkle;
  if (Array.isArray(dData)) {
    dData.forEach(pathD => {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", pathD);
      el.appendChild(p);
    });
  } else {
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", dData);
    el.appendChild(p);
  }
  return el;
};

const mk = (tag, css = {}, props = {}) => {
  const e = document.createElement(tag);
  Object.assign(e.style, css);
  Object.assign(e, props);
  return e;
};
const tx = (e, t) => {
  e.textContent = t;
  return e;
};
const cap = (t) =>
  tx(
    mk("div", {
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color: C.muted,
      marginBottom: "4px",
    }),
    t
  );

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Inject CSS strictly scoped to nodes containing .fk-root (Matching Image 2 1:1)
(() => {
  if (document.getElementById("xflow-one-minimax-style")) return;
  const styleEl = document.createElement("style");
  styleEl.id = "xflow-one-minimax-style";
  styleEl.textContent = `
    .fk-root {
      margin: 0 !important;
      position: relative !important;
      box-sizing: border-box !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    .comfy-vue-node:has(.fk-root) .node-content-surface,
    .comfy-vue-node:has(.fk-root) [class*='node-content-surface'],
    .comfy-vue-node:has(.fk-root) [class*='node-component-surface'],
    .comfy-vue-node:has(.fk-root) [class*='bg-node-component-surface'],
    .comfy-vue-node:has(.fk-root) [class*='vue-node-surface'],
    .node:has(.fk-root) [class*='node-content-surface'],
    .node:has(.fk-root) [class*='node-component-surface'] {
      display: none !important;
      height: 0px !important;
      min-height: 0px !important;
      max-height: 0px !important;
      padding: 0px !important;
      margin: 0px !important;
      border: none !important;
    }

    .comfy-vue-node:has(.fk-root) [class*='node-inputs'],
    .comfy-vue-node:has(.fk-root) [class*='inputs-container'],
    .comfy-vue-node:has(.fk-root) .node-slot-input,
    .node:has(.fk-root) [class*='node-inputs'],
    .node:has(.fk-root) [class*='inputs-container'] {
      display: none !important;
      height: 0px !important;
      min-height: 0px !important;
    }

    .comfy-vue-node:has(.fk-root) > div:not(:has(.fk-root)),
    .comfy-vue-node:has(.fk-root) [class*='node-body'] > div:not(:has(.fk-root)),
    .comfy-vue-node:has(.fk-root) [class*='node-content'] > div:not(:has(.fk-root)) {
      display: none !important;
      height: 0px !important;
      min-height: 0px !important;
      padding: 0px !important;
      margin: 0px !important;
    }

    .comfy-vue-node:has(.fk-root),
    .node:has(.fk-root) {
      padding-top: 0px !important;
      padding-bottom: 0px !important;
    }

    .fk-pill-btn {
      transition: all 0.18s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .fk-pill-btn:hover {
      filter: brightness(1.2);
      transform: translateY(-1px);
    }
    .fk-root select option {
      background-color: #181818 !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      padding: 8px !important;
    }
    .fk-root input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: #222222;
      border-radius: 3px;
      outline: none;
      margin: 4px 0;
    }
    .fk-root input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #00ff66;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(0, 255, 102, 0.5);
      transition: transform 0.12s ease;
    }
    .fk-root input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.25);
    }
    .fk-root input[type=range]::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #00ff66;
      border: none;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(0, 255, 102, 0.5);
    }
  `;
  document.head.appendChild(styleEl);
})();

// Overlay Animation Helpers
const openOverlay = (ov) => {
  ov.style.display = "flex";
  requestAnimationFrame(() => {
    ov.style.opacity = "1";
    ov.style.transform = "translateY(0)";
  });
};

const closeOverlay = (ov) => {
  ov.style.opacity = "0";
  ov.style.transform = "translateY(6px)";
  setTimeout(() => {
    ov.style.display = "none";
  }, 220);
};

function playDone() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [[660, 0, 0.09], [990, 0.1, 0.07]].forEach(([freq, delay, vol]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.55);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.6);
    });
  } catch (e) { }
}

let CONFIG = null;
async function loadConfig() {
  try {
    const res = await fetch("/minimax_h3/config");
    CONFIG = await res.json();
  } catch (e) {
    CONFIG = {};
  }
}

async function checkSystemValidation(mode) {
  try {
    const modeKey = mode === "I2V" ? "image_to_video" : (mode === "R2V" ? "reference_to_video" : "text_to_video");
    const res = await fetch(`/minimax_h3/validate_system?mode=${modeKey}`);
    if (!res.ok) throw new Error("API HTTP error");
    return await res.json();
  } catch (e) {
    return { valid: true, missing_models: [], missing_nodes: [] };
  }
}

async function executePixaromaWorkflow(mode, params, statusLabel, progressBarInner) {
  const modeKey = mode === "I2V" ? "image_to_video" : (mode === "R2V" ? "reference_to_video" : "text_to_video");
  let endpoint = `/minimax_h3/workflow_${modeKey}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Could not load workflow JSON for mode: ${mode}`);
  const workflowJson = await res.json();
  if (!workflowJson || !workflowJson.nodes) throw new Error(`Failed to load workflow template for mode: ${mode}`);

  const promptPayload = {};

  workflowJson.nodes.forEach(node => {
    const nodeId = String(node.id);
    const classType = node.type;
    const inputs = {};

    if (node.widgets_values && Array.isArray(node.widgets_values)) {
      if (classType === "CLIPLoader") {
        inputs["clip_name"] = node.widgets_values[0] || "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors";
        inputs["type"] = node.widgets_values[1] || "minimax";
      } else if (classType === "VAELoader") {
        inputs["vae_name"] = node.widgets_values[0] || "minimax_h3_video_vae_fp16.safetensors";
      } else if (classType === "UNETLoader") {
        inputs["unet_name"] = node.widgets_values[0] || (mode === "R2V" ? "h3/minimax_h3_ref2va_pruned_int8_convrot.safetensors" : "h3/minimax_h3_fl2va_pruned_int8_convrot.safetensors");
      } else if (classType === "PixaromaPrompt") {
        inputs["text"] = params.prompt;
      } else if (classType === "PixaromaSizes") {
        inputs["width"] = parseInt(params.width || 864);
        inputs["height"] = parseInt(params.height || 480);
      } else if (classType === "PixaromaDuration") {
        inputs["duration"] = parseInt(params.duration);
      } else if (classType === "PixaromaSaveMp4") {
        inputs["fps"] = parseInt(params.fps);
        inputs["filename_prefix"] = `MinimaxH3_${mode}`;
      } else if (classType === "KSampler") {
        inputs["seed"] = params.seed === 0 ? Math.floor(Math.random() * 1000000000) : parseInt(params.seed);
        inputs["steps"] = 20;
        inputs["cfg"] = parseFloat(params.cfg);
        inputs["sampler_name"] = "euler";
        inputs["scheduler"] = "normal";
        inputs["denoise"] = 1.0;
      } else if (classType === "MiniMaxH3ImageToVideo" || classType === "MiniMaxH3ReferenceToVideo") {
        inputs["prompt"] = params.prompt;
        inputs["motion_strength"] = parseFloat(params.motion_strength);
        if (params.width) inputs["width"] = parseInt(params.width);
        if (params.height) inputs["height"] = parseInt(params.height);
      }
    }

    if (node.inputs && Array.isArray(node.inputs)) {
      node.inputs.forEach(inp => {
        if (inp.link != null) {
          const linkInfo = (workflowJson.links || []).find(l => l[0] === inp.link);
          if (linkInfo) {
            inputs[inp.name] = [String(linkInfo[1]), linkInfo[2]];
          }
        }
      });
    }

    promptPayload[nodeId] = { class_type: classType, inputs: inputs };
  });

  const response = await api.fetchApi("/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: promptPayload })
  });

  const promptResult = await response.json();
  if (promptResult.error) {
    throw new Error(promptResult.error.message || JSON.stringify(promptResult.error));
  }
  return promptResult;
}

app.registerExtension({
  name: "MinimaxH3.VideoNode",

  async setup() {
    await loadConfig();
    console.log("[MinimaxH3Video] Extension initialized.");
  },

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "MinimaxH3OneVideoNode") return;

    const origOnNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (origOnNodeCreated) {
        try {
          origOnNodeCreated.apply(this, arguments);
        } catch (e) {}
      }

      const self = this;
      this.color = C.bg0;
      this.bgcolor = C.bg0;
      this.resizable = false;
      this.setSize([NODE_W, NODE_H + 50]);

      // Hide default auto-generated widgets
      if (this.widgets && Array.isArray(this.widgets)) {
        for (const w of this.widgets) {
          w.hidden = true;
          w.type = "hidden";
        }
      }

      // State persistence
      let S = {
        mode: "T2V",
        orientation: "Landscape",
        width: 864,
        height: 480,
        duration: 4,
        fps: 24,
        motion_strength: 0.5,
        cfg: 7.5,
        seed: 0,
        prompt: "",
        negativePrompt: DEFAULT_NEG_PROMPT,
        autoSave: true,
        generating: false,
        loras: [],
      };

      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) Object.assign(S, JSON.parse(saved));
      } catch (e) {}

      const persist = () => {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(S));
        } catch (e) {}
      };

      // Root Element (Matching Image 2 1:1 with visible header top bar)
      const root = mk("div", {
        className: "fk-root",
        width: `${NODE_W}px`,
        height: `${NODE_H}px`,
        background: C.bg0,
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        color: C.text,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        userSelect: "none",
        position: "relative",
      });

      const pad = mk("div", {
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        boxSizing: "border-box",
      });

      // ── TOP NAVIGATION BAR (Matching Image 2 1:1 with Vector SVG Icons) ─────
      const topBar = mk("div", {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        flexShrink: "0",
        paddingBottom: "8px",
        borderBottom: `1px solid ${C.border}`,
        boxSizing: "border-box",
      });

      const titleGroup = mk("div", { display: "flex", alignItems: "center", gap: "8px" });
      const titleLogo = mk("span", {
        fontSize: "14px",
        fontWeight: "900",
        background: LIME_GRAD,
        webkitBackgroundClip: "text",
        webkitTextFillColor: "transparent",
        letterSpacing: ".02em",
      }, { textContent: "xFlowOne" });

      const titleDot = mk("span", { fontSize: "12px", color: C.muted }, { textContent: "·" });
      const titleSub = mk("span", { fontSize: "13px", fontWeight: "700", color: C.text }, { textContent: "Minimax H3" });
      titleGroup.append(titleLogo, titleDot, titleSub);

      // Mode Pills: T2V | I2V | R2V with Vector Icons
      const pillsContainer = mk("div", { display: "flex", gap: "8px" });

      const createPill = (id, iconName, label) => {
        const btn = mk("button", {
          className: "fk-pill-btn",
          padding: "5px 16px",
          fontSize: "11px",
          fontWeight: "700",
          borderRadius: "14px",
          border: `1px solid ${C.border}`,
          background: C.bg2,
          color: C.text,
          cursor: "pointer",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        });

        const iconEl = svgIcon(iconName, 13, C.text);
        btn.appendChild(iconEl);
        btn.appendChild(document.createTextNode(label));

        btn.onclick = () => setMode(id);
        return { btn, iconEl };
      };

      const pillT2V = createPill("T2V", "t2v", "T2V (Text to Video)");
      const pillI2V = createPill("I2V", "i2v", "I2V (Image to Video)");
      const pillR2V = createPill("R2V", "r2v", "R2V (Ref + Audio)");

      pillsContainer.append(pillT2V.btn, pillI2V.btn, pillR2V.btn);

      // Top Right Buttons: Gallery, Setup, Help with Vector Icons
      const topActions = mk("div", { display: "flex", alignItems: "center", gap: "8px" });

      const galleryBtn = mk("button", {
        padding: "6px 14px", fontSize: "11px", fontWeight: "800",
        background: LIME, color: "#111", border: "none", borderRadius: "6px",
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px"
      });
      galleryBtn.appendChild(svgIcon("gallery", 13, "#111"));
      galleryBtn.appendChild(document.createTextNode("Gallery"));

      const modelsBtn = mk("button", {
        padding: "6px 12px", fontSize: "11px", fontWeight: "700",
        background: C.bg2, color: LIME, border: `1px solid ${LIME}`, borderRadius: "6px",
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px"
      });
      modelsBtn.appendChild(svgIcon("settings", 13, LIME));
      modelsBtn.appendChild(document.createTextNode("Setup"));

      const helpBtn = mk("button", {
        padding: "6px 12px", fontSize: "11px", fontWeight: "600",
        background: C.bg2, color: C.text, border: `1px solid ${C.border}`, borderRadius: "6px",
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px"
      });
      helpBtn.appendChild(svgIcon("help", 13, C.text));
      helpBtn.appendChild(document.createTextNode("Help"));

      topActions.append(galleryBtn, modelsBtn, helpBtn);
      topBar.append(titleGroup, pillsContainer, topActions);
      pad.appendChild(topBar);

      // ── MAIN CONTENT ROW (2 Columns: Left Controls + Right Preview) ────────
      const mainRow = mk("div", {
        display: "flex",
        gap: "14px",
        flex: "1",
        minHeight: "0",
        width: "100%",
        boxSizing: "border-box",
      });

      // LEFT COLUMN CONTROLS
      const leftCol = mk("div", {
        width: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flexShrink: "0",
        boxSizing: "border-box",
      });

      // ── ORIENTATION & SIZE SELECTOR (xFlow Custom UI) ─────────────────
      const orientSizeBox = mk("div", {
        background: C.bg2,
        padding: "10px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        boxSizing: "border-box",
        position: "relative",
      });

      const orientHdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
      orientHdr.appendChild(cap("ORIENTATION & SIZE"));

      // Orientation Pills: Portrait | Landscape
      const orientPillGroup = mk("div", { display: "flex", gap: "6px" });

      const portraitBtn = mk("button", {
        padding: "5px 12px",
        fontSize: "11px",
        fontWeight: S.orientation === "Portrait" ? "800" : "600",
        borderRadius: "6px",
        border: `1px solid ${S.orientation === "Portrait" ? LIME : C.border}`,
        background: S.orientation === "Portrait" ? LIME : C.bg1,
        color: S.orientation === "Portrait" ? "#111" : C.text,
        cursor: "pointer",
        flex: "1",
        outline: "none",
        transition: "all 0.15s ease",
      }, { textContent: "Portrait" });

      const landscapeBtn = mk("button", {
        padding: "5px 12px",
        fontSize: "11px",
        fontWeight: S.orientation === "Landscape" ? "800" : "600",
        borderRadius: "6px",
        border: `1px solid ${S.orientation === "Landscape" ? LIME : C.border}`,
        background: S.orientation === "Landscape" ? LIME : C.bg1,
        color: S.orientation === "Landscape" ? "#111" : C.text,
        cursor: "pointer",
        flex: "1",
        outline: "none",
        transition: "all 0.15s ease",
      }, { textContent: "Landscape" });

      portraitBtn.onmouseover = () => { if (S.orientation !== "Portrait") portraitBtn.style.borderColor = LIME; };
      portraitBtn.onmouseout = () => { if (S.orientation !== "Portrait") portraitBtn.style.borderColor = C.border; };

      landscapeBtn.onmouseover = () => { if (S.orientation !== "Landscape") landscapeBtn.style.borderColor = LIME; };
      landscapeBtn.onmouseout = () => { if (S.orientation !== "Landscape") landscapeBtn.style.borderColor = C.border; };

      orientPillGroup.append(portraitBtn, landscapeBtn);
      orientHdr.appendChild(orientPillGroup);
      orientSizeBox.appendChild(orientHdr);

      // Custom Dropdown Trigger Box
      const sizeTrigger = mk("div", {
        width: "100%",
        background: C.bg1,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "12px",
        fontWeight: "800",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transition: "all 0.15s ease",
      });

      const sizeTriggerLabel = mk("span", {}, { textContent: `${S.width} × ${S.height}` });
      const sizeTriggerArrow = svgIcon("expand", 11, C.muted);
      sizeTrigger.append(sizeTriggerLabel, sizeTriggerArrow);

      // Hover Effect: xFlow Neon Green Border!
      sizeTrigger.onmouseover = () => {
        sizeTrigger.style.borderColor = LIME;
        sizeTrigger.style.boxShadow = `0 0 10px rgba(0, 255, 102, 0.3)`;
        sizeTriggerArrow.setAttribute("stroke", LIME);
      };
      sizeTrigger.onmouseout = () => {
        if (sizeMenu.style.display !== "flex") {
          sizeTrigger.style.borderColor = C.border;
          sizeTrigger.style.boxShadow = "none";
          sizeTriggerArrow.setAttribute("stroke", C.muted);
        }
      };

      // Custom Dropdown Menu Floating Popup
      const sizeMenu = mk("div", {
        position: "absolute",
        top: "100%",
        left: "0",
        width: "100%",
        maxHeight: "240px",
        background: "#161817",
        border: `1px solid ${LIME}`,
        borderRadius: "8px",
        marginTop: "4px",
        display: "none",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: "9999",
        boxShadow: "0 8px 24px rgba(0,0,0,0.9), 0 0 12px rgba(0, 255, 102, 0.25)",
        boxSizing: "border-box",
      });

      const updateCustomSizeMenu = (orient) => {
        sizeMenu.innerHTML = "";
        const list = RESOLUTIONS[orient] || RESOLUTIONS.Landscape;

        let currentFound = false;

        list.forEach(resItem => {
          const isSelected = resItem.w === S.width && resItem.h === S.height;
          if (isSelected) {
            currentFound = true;
            sizeTriggerLabel.textContent = resItem.label;
          }

          const itemEl = mk("div", {
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "700",
            color: isSelected ? "#111" : C.text,
            background: isSelected ? LIME : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.12s ease",
            borderLeft: isSelected ? `3px solid ${LIME}` : "3px solid transparent",
          });

          itemEl.appendChild(document.createTextNode(resItem.label));
          if (isSelected) {
            itemEl.appendChild(svgIcon("check", 12, "#111"));
          }

          itemEl.onmouseover = () => {
            if (!isSelected) {
              itemEl.style.background = "#222b24";
              itemEl.style.color = LIME;
              itemEl.style.borderLeftColor = LIME;
            }
          };

          itemEl.onmouseout = () => {
            if (!isSelected) {
              itemEl.style.background = "transparent";
              itemEl.style.color = C.text;
              itemEl.style.borderLeftColor = "transparent";
            }
          };

          itemEl.onclick = (evt) => {
            evt.stopPropagation();
            S.width = resItem.w;
            S.height = resItem.h;
            sizeTriggerLabel.textContent = resItem.label;
            sizeMenu.style.display = "none";
            sizeTrigger.style.borderColor = C.border;
            sizeTrigger.style.boxShadow = "none";
            persist();
            updateCustomSizeMenu(S.orientation);
          };

          sizeMenu.appendChild(itemEl);
        });

        if (!currentFound && list.length > 0) {
          S.width = list[0].w;
          S.height = list[0].h;
          sizeTriggerLabel.textContent = list[0].label;
        }
      };

      sizeTrigger.onclick = (evt) => {
        evt.stopPropagation();
        const isOpen = sizeMenu.style.display === "flex";
        sizeMenu.style.display = isOpen ? "none" : "flex";
        sizeTrigger.style.borderColor = isOpen ? LIME : C.border;
        sizeTrigger.style.boxShadow = isOpen ? `0 0 10px rgba(0, 255, 102, 0.3)` : "none";
      };

      document.addEventListener("click", () => {
        sizeMenu.style.display = "none";
        sizeTrigger.style.borderColor = C.border;
        sizeTrigger.style.boxShadow = "none";
      });

      portraitBtn.onclick = () => {
        S.orientation = "Portrait";
        portraitBtn.style.background = LIME;
        portraitBtn.style.borderColor = LIME;
        portraitBtn.style.color = "#111";
        portraitBtn.style.fontWeight = "800";

        landscapeBtn.style.background = C.bg1;
        landscapeBtn.style.borderColor = C.border;
        landscapeBtn.style.color = C.text;
        landscapeBtn.style.fontWeight = "600";

        S.width = 480;
        S.height = 864;
        updateCustomSizeMenu("Portrait");
        persist();
      };

      landscapeBtn.onclick = () => {
        S.orientation = "Landscape";
        landscapeBtn.style.background = LIME;
        landscapeBtn.style.borderColor = LIME;
        landscapeBtn.style.color = "#111";
        landscapeBtn.style.fontWeight = "800";

        portraitBtn.style.background = C.bg1;
        portraitBtn.style.borderColor = C.border;
        portraitBtn.style.color = C.text;
        portraitBtn.style.fontWeight = "600";

        S.width = 864;
        S.height = 480;
        updateCustomSizeMenu("Landscape");
        persist();
      };

      updateCustomSizeMenu(S.orientation || "Landscape");
      orientSizeBox.append(sizeTrigger, sizeMenu);
      leftCol.appendChild(orientSizeBox);

      // Duration & FPS Row
      const durFpsRow = mk("div", { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" });
      
      // Duration Box with Custom Visual Interactive Drag Slider (1-10s, default 4s)
      const durBox = mk("div", {
        background: C.bg2,
        padding: "8px 10px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        boxSizing: "border-box",
      });

      const durHeader = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
      durHeader.appendChild(cap("DURATION"));
      let curDur = parseInt(S.duration) || 4;
      if (curDur < 1) curDur = 1;
      if (curDur > 10) curDur = 10;
      S.duration = curDur;

      const durValueLbl = mk("span", { fontSize: "11px", fontWeight: "800", color: LIME }, { textContent: `${curDur}s` });
      durHeader.appendChild(durValueLbl);
      durBox.appendChild(durHeader);

      // Custom Interactive Slider Track Container
      const sliderTrackContainer = mk("div", {
        width: "100%",
        height: "18px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        cursor: "pointer",
        userSelect: "none",
        boxSizing: "border-box",
      });

      const sliderTrackBg = mk("div", {
        width: "100%",
        height: "8px",
        background: "#222222",
        borderRadius: "4px",
        position: "relative",
        border: `1px solid ${C.border}`,
        overflow: "visible",
        transition: "border-color 0.15s ease",
      });

      const sliderFill = mk("div", {
        height: "100%",
        width: `${((curDur - 1) / 9) * 100}%`,
        background: LIME_GRAD,
        borderRadius: "4px",
        position: "absolute",
        left: "0",
        top: "0",
      });

      const sliderThumb = mk("div", {
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        background: LIME,
        position: "absolute",
        top: "-3px",
        left: `calc(${((curDur - 1) / 9) * 100}% - 7px)`,
        boxShadow: "0 0 8px rgba(0, 255, 102, 0.6)",
        cursor: "grab",
        transition: "transform 0.1s ease",
      });

      sliderTrackBg.append(sliderFill, sliderThumb);
      sliderTrackContainer.appendChild(sliderTrackBg);

      const calcFramesText = (sec, fps) => {
        const frames = Math.round(sec * fps);
        return `${sec}s → ${frames} frames`;
      };

      const durInfoLbl = mk("div", { fontSize: "10px", color: C.muted, fontWeight: "600", marginTop: "2px" }, {
        textContent: calcFramesText(curDur, parseInt(S.fps) || 24)
      });

      let isDraggingDuration = false;

      const updateDurationFromMouse = (evt) => {
        const rect = sliderTrackContainer.getBoundingClientRect();
        let offsetX = evt.clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;

        let pct = rect.width > 0 ? offsetX / rect.width : 0;
        let val = Math.round(pct * 9) + 1;
        if (val < 1) val = 1;
        if (val > 10) val = 10;

        S.duration = val;
        const fillPct = ((val - 1) / 9) * 100;
        sliderFill.style.width = `${fillPct}%`;
        sliderThumb.style.left = `calc(${fillPct}% - 7px)`;
        durValueLbl.textContent = `${val}s`;
        durInfoLbl.textContent = calcFramesText(val, parseInt(S.fps) || 24);
        persist();
      };

      sliderTrackContainer.onmousedown = (evt) => {
        isDraggingDuration = true;
        sliderThumb.style.cursor = "grabbing";
        sliderThumb.style.transform = "scale(1.2)";
        sliderTrackBg.style.borderColor = LIME;
        updateDurationFromMouse(evt);

        const onMouseMove = (moveEvt) => {
          if (isDraggingDuration) updateDurationFromMouse(moveEvt);
        };

        const onMouseUp = () => {
          isDraggingDuration = false;
          sliderThumb.style.cursor = "grab";
          sliderThumb.style.transform = "scale(1)";
          sliderTrackBg.style.borderColor = C.border;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      };

      sliderTrackContainer.onmouseover = () => {
        sliderTrackBg.style.borderColor = LIME;
        sliderThumb.style.transform = "scale(1.15)";
      };
      sliderTrackContainer.onmouseout = () => {
        if (!isDraggingDuration) {
          sliderTrackBg.style.borderColor = C.border;
          sliderThumb.style.transform = "scale(1)";
        }
      };

      durBox.append(sliderTrackContainer, durInfoLbl);
      durFpsRow.appendChild(durBox);

      // FPS Custom Dropdown (Matching xFlow Style 1:1)
      const fpsBox = mk("div", {
        background: C.bg2,
        padding: "8px 10px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        position: "relative",
      });
      fpsBox.appendChild(cap("FPS"));

      const fpsTrigger = mk("div", {
        width: "100%",
        background: C.bg1,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        padding: "6px 8px",
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transition: "all 0.15s ease",
      });

      const fpsTriggerLabel = mk("span", {}, { textContent: `${S.fps} FPS` });
      const fpsTriggerArrow = svgIcon("expand", 10, C.muted);
      fpsTrigger.append(fpsTriggerLabel, fpsTriggerArrow);

      fpsTrigger.onmouseover = () => {
        fpsTrigger.style.borderColor = LIME;
        fpsTrigger.style.boxShadow = `0 0 8px rgba(0, 255, 102, 0.25)`;
        fpsTriggerArrow.setAttribute("stroke", LIME);
      };
      fpsTrigger.onmouseout = () => {
        if (fpsMenu.style.display !== "flex") {
          fpsTrigger.style.borderColor = C.border;
          fpsTrigger.style.boxShadow = "none";
          fpsTriggerArrow.setAttribute("stroke", C.muted);
        }
      };

      const fpsMenu = mk("div", {
        position: "absolute",
        top: "100%",
        left: "0",
        width: "100%",
        background: "#161817",
        border: `1px solid ${LIME}`,
        borderRadius: "6px",
        marginTop: "4px",
        display: "none",
        flexDirection: "column",
        zIndex: "9999",
        boxShadow: "0 6px 18px rgba(0,0,0,0.9)",
        overflow: "hidden",
        boxSizing: "border-box",
      });

      const renderFpsMenu = () => {
        fpsMenu.innerHTML = "";
        ["24", "30"].forEach(fVal => {
          const isSelected = String(S.fps) === fVal;
          const itemEl = mk("div", {
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: "700",
            color: isSelected ? "#111" : C.text,
            background: isSelected ? LIME : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.12s ease",
          }, { textContent: `${fVal} FPS` });

          itemEl.onmouseover = () => {
            if (!isSelected) {
              itemEl.style.background = "#222b24";
              itemEl.style.color = LIME;
            }
          };
          itemEl.onmouseout = () => {
            if (!isSelected) {
              itemEl.style.background = "transparent";
              itemEl.style.color = C.text;
            }
          };

          itemEl.onclick = (evt) => {
            evt.stopPropagation();
            S.fps = parseInt(fVal);
            fpsTriggerLabel.textContent = `${fVal} FPS`;
            fpsMenu.style.display = "none";
            fpsTrigger.style.borderColor = C.border;
            fpsTrigger.style.boxShadow = "none";
            fpsTriggerArrow.setAttribute("stroke", C.muted);
            persist();
            renderFpsMenu();
          };

          fpsMenu.appendChild(itemEl);
        });
      };

      renderFpsMenu();

      fpsTrigger.onclick = (evt) => {
        evt.stopPropagation();
        const isOpen = fpsMenu.style.display === "flex";
        fpsMenu.style.display = isOpen ? "none" : "flex";
        fpsTrigger.style.borderColor = isOpen ? LIME : C.border;
        fpsTrigger.style.boxShadow = isOpen ? `0 0 8px rgba(0, 255, 102, 0.25)` : "none";
        fpsTriggerArrow.setAttribute("stroke", isOpen ? LIME : C.muted);
      };

      document.addEventListener("click", () => {
        fpsMenu.style.display = "none";
        fpsTrigger.style.borderColor = C.border;
        fpsTrigger.style.boxShadow = "none";
        fpsTriggerArrow.setAttribute("stroke", C.muted);
      });

      fpsBox.append(fpsTrigger, fpsMenu);
      durFpsRow.appendChild(fpsBox);
      leftCol.appendChild(durFpsRow);

      // Motion & CFG Scale Row
      const motCfgRow = mk("div", { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" });

      const motBox = mk("div", { background: C.bg2, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${C.border}` });
      motBox.appendChild(cap("MOTION STRENGTH"));
      const motInput = mk("input", { type: "number", min: "0.0", max: "1.0", step: "0.1", value: S.motion_strength, width: "100%", background: C.bg1, color: C.text, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "4px 8px", fontSize: "11px", outline: "none", boxSizing: "border-box" });
      motInput.oninput = () => { S.motion_strength = motInput.value; persist(); };
      motBox.appendChild(motInput);
      motCfgRow.appendChild(motBox);

      const cfgBox = mk("div", { background: C.bg2, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${C.border}` });
      cfgBox.appendChild(cap("CFG SCALE"));
      const cfgInput = mk("input", { type: "number", min: "1", max: "20", step: "0.5", value: S.cfg, width: "100%", background: C.bg1, color: C.text, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "4px 8px", fontSize: "11px", outline: "none", boxSizing: "border-box" });
      cfgInput.oninput = () => { S.cfg = cfgInput.value; persist(); };
      cfgBox.appendChild(cfgInput);
      motCfgRow.appendChild(cfgBox);
      leftCol.appendChild(motCfgRow);

      // Seed Box with Shuffle Vector Icon
      const seedBox = mk("div", { background: C.bg2, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${C.border}` });
      const seedHeader = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
      seedHeader.appendChild(cap("SEED (0 = RANDOM)"));
      
      const diceBtn = mk("button", { background: C.bg3, border: `1px solid ${C.border}`, borderRadius: "4px", cursor: "pointer", fontSize: "11px", padding: "3px 6px", color: C.text, display: "inline-flex", alignItems: "center" });
      diceBtn.appendChild(svgIcon("random", 12, C.text));
      seedHeader.appendChild(diceBtn);
      seedBox.appendChild(seedHeader);

      const seedInput = mk("input", { type: "number", value: S.seed, width: "100%", background: C.bg1, color: C.text, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "4px 8px", fontSize: "11px", outline: "none", boxSizing: "border-box" });
      seedInput.oninput = () => { S.seed = seedInput.value; persist(); };
      diceBtn.onclick = () => { S.seed = 0; seedInput.value = 0; persist(); };
      seedBox.appendChild(seedInput);
      leftCol.appendChild(seedBox);

      // Media Input Slot Card (for I2V & R2V modes)
      const slotCard = mk("div", {
        display: "none",
        flexDirection: "column",
        gap: "6px",
        background: C.bg2,
        padding: "10px",
        borderRadius: "6px",
        border: `1px dashed ${C.border}`,
        boxSizing: "border-box",
      });
      slotCard.appendChild(cap("INPUT MEDIA FILE"));

      const imageFileInput = mk("input", { type: "file", accept: "image/*", display: "none" });
      const uploadImgBtn = mk("button", {
        padding: "6px 12px", fontSize: "11px", fontWeight: "700",
        background: C.bg1, color: LIME, border: `1px solid ${LIME}`, borderRadius: "4px", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: "6px"
      });
      uploadImgBtn.appendChild(svgIcon("upload", 13, LIME));
      uploadImgBtn.appendChild(document.createTextNode("Upload Image File"));
      uploadImgBtn.onclick = () => imageFileInput.click();
      const imgLabel = mk("div", { fontSize: "10px", color: C.muted, marginTop: "2px" });
      imageFileInput.onchange = () => { if (imageFileInput.files[0]) imgLabel.textContent = imageFileInput.files[0].name; };
      slotCard.append(uploadImgBtn, imageFileInput, imgLabel);
      leftCol.appendChild(slotCard);

      // BIG GREEN GENERATE BUTTON with Sparkle Vector Icon
      const genBtnGroup = mk("div", { display: "flex", gap: "8px", marginTop: "auto" });
      const genBtn = mk("button", {
        flex: "1",
        height: "46px",
        background: LIME_GRAD,
        color: "#111",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "900",
        cursor: "pointer",
        letterSpacing: ".03em",
        boxShadow: "0 4px 14px rgba(0, 255, 102, 0.3)",
        transition: "all .2s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      });
      genBtn.appendChild(svgIcon("play", 16, "#111"));
      genBtn.appendChild(document.createTextNode("Generate"));

      const chimeBtn = mk("button", {
        width: "46px",
        height: "46px",
        background: C.bg2,
        color: LIME,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      });
      chimeBtn.appendChild(svgIcon("sound", 16, LIME));
      chimeBtn.onclick = () => playDone();

      genBtnGroup.append(genBtn, chimeBtn);
      leftCol.appendChild(genBtnGroup);

      mainRow.appendChild(leftCol);

      // RIGHT COLUMN (LARGE VIDEO PREVIEW BOX - Sleek Vector Camera Illustration)
      const rightCol = mk("div", {
        flex: "1",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: C.bg1,
        borderRadius: "8px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        boxSizing: "border-box",
      });

      const videoPlayer = mk("video", {
        width: "100%",
        height: "100%",
        controls: true,
        autoplay: true,
        loop: true,
        display: "none",
        backgroundColor: "#000",
        objectFit: "contain",
      });
      rightCol.appendChild(videoPlayer);

      const placeholder = mk("div", {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: C.muted,
        gap: "10px",
      });
      
      const camIconWrap = mk("div", {
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: C.bg2,
        border: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(0, 255, 102, 0.08)"
      });
      camIconWrap.appendChild(svgIcon("video", 24, LIME));
      
      placeholder.append(camIconWrap, mk("div", { fontSize: "12px", fontWeight: "600", color: C.text }, { textContent: "Generated video will appear here" }));
      rightCol.appendChild(placeholder);

      // Status progress bar at bottom of video box
      const statusRow = mk("div", {
        position: "absolute",
        bottom: "12px",
        left: "12px",
        right: "110px",
        display: "none",
        flexDirection: "column",
        gap: "4px",
        background: "rgba(0,0,0,0.85)",
        padding: "6px 10px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
      });
      const statusLabel = mk("div", { fontSize: "10px", fontWeight: "700", color: LIME }, { textContent: "Ready" });
      const progressBarWrap = mk("div", { width: "100%", height: "4px", background: C.bg3, borderRadius: "2px", overflow: "hidden" });
      const progressBarInner = mk("div", { width: "0%", height: "100%", background: LIME, transition: "width 0.2s" });
      progressBarWrap.appendChild(progressBarInner);
      statusRow.append(statusLabel, progressBarWrap);
      rightCol.appendChild(statusRow);

      // Auto-save toggle bottom right
      const autoSaveWrap = mk("div", {
        position: "absolute",
        bottom: "12px",
        right: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(0,0,0,0.8)",
        padding: "4px 8px",
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
      });
      const autoSaveLbl = mk("span", { fontSize: "10px", color: C.text, fontWeight: "600" }, { textContent: "Auto-save" });
      const autoSaveTrack = mk("div", { width: "28px", height: "16px", borderRadius: "8px", background: S.autoSave ? LIME : C.dim, cursor: "pointer", position: "relative" });
      const autoSaveThumb = mk("div", { position: "absolute", top: "2px", left: S.autoSave ? "14px" : "2px", width: "12px", height: "12px", borderRadius: "50%", background: S.autoSave ? "#111" : "#888" });
      autoSaveTrack.appendChild(autoSaveThumb);
      autoSaveTrack.onclick = () => {
        S.autoSave = !S.autoSave;
        autoSaveTrack.style.background = S.autoSave ? LIME : C.dim;
        autoSaveThumb.style.left = S.autoSave ? "14px" : "2px";
        autoSaveThumb.style.background = S.autoSave ? "#111" : "#888";
        persist();
      };
      autoSaveWrap.append(autoSaveLbl, autoSaveTrack);
      rightCol.appendChild(autoSaveWrap);

      mainRow.appendChild(rightCol);
      pad.appendChild(mainRow);

      // ── BOTTOM PROMPT AREA & ADD LORA DRAWER (Matching Image 2 1:1) ──────────
      const promptSection = mk("div", {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
        flexShrink: "0",
        borderTop: `1px solid ${C.border}`,
        paddingTop: "8px",
        marginTop: "auto",
        boxSizing: "border-box",
      });

      const promptHdr = mk("div", { display: "flex", alignItems: "center", gap: "8px", flexShrink: "0", width: "100%", boxSizing: "border-box" });
      const promptLabel = cap("PROMPT");
      promptLabel.style.marginBottom = "0";

      const negToggleBtn = mk("button", {
        background: "transparent", border: "none", color: C.muted, fontSize: "10px",
        fontWeight: "700", cursor: "pointer", outline: "none", letterSpacing: ".05em",
        display: "inline-flex", alignItems: "center", gap: "4px"
      });
      negToggleBtn.appendChild(svgIcon("director", 11, C.muted));
      negToggleBtn.appendChild(document.createTextNode("Director"));

      const promptHdrSpacer = mk("div", { flex: "1" });

      // BRIGHT LIME "Add LoRA" BUTTON with Vector Layers Icon
      const addLoraBtn = mk("button", {
        background: LIME,
        border: "none",
        borderRadius: "6px",
        color: "#111",
        fontSize: "11px",
        fontWeight: "800",
        padding: "5px 12px",
        cursor: "pointer",
        letterSpacing: ".03em",
        boxShadow: "0 2px 8px rgba(0, 255, 102, 0.25)",
        transition: "all .15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px"
      });
      addLoraBtn.appendChild(svgIcon("layers", 12, "#111"));
      addLoraBtn.appendChild(document.createTextNode("Add LoRA"));

      const expandBtn = mk("button", {
        background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px",
        color: C.muted, fontSize: "10px", fontWeight: "700", padding: "4px 10px", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: "4px"
      });
      const expIcon = svgIcon("expand", 11, C.muted);
      expandBtn.appendChild(expIcon);
      const expTxt = document.createTextNode("Expand");
      expandBtn.appendChild(expTxt);

      promptHdr.append(promptLabel, negToggleBtn, promptHdrSpacer, addLoraBtn, expandBtn);

      // Collapsible LoRA Manager Drawer
      const loraDrawer = mk("div", {
        display: "none",
        flexDirection: "column",
        gap: "8px",
        background: C.bg2,
        border: `1px solid ${LIME}`,
        borderRadius: "8px",
        padding: "10px 12px",
        marginTop: "4px",
        boxSizing: "border-box",
        width: "100%",
      });

      const loraHdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
      loraHdr.appendChild(cap("Active LoRA Models Manager"));

      const addSlotBtn = mk("button", {
        padding: "3px 8px", fontSize: "10px", fontWeight: "700",
        background: LIME, color: "#111", border: "none", borderRadius: "4px", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: "4px"
      });
      addSlotBtn.appendChild(svgIcon("layers", 10, "#111"));
      addSlotBtn.appendChild(document.createTextNode("+ Add LoRA"));
      loraHdr.appendChild(addSlotBtn);
      loraDrawer.appendChild(loraHdr);

      const loraSlotsList = mk("div", { display: "flex", flexDirection: "column", gap: "6px", width: "100%", boxSizing: "border-box" });
      loraDrawer.appendChild(loraSlotsList);

      let availableLoras = [];
      const fetchLoras = async () => {
        try {
          const res = await fetch("/minimax_h3/loras");
          const data = await res.json();
          if (data && data.loras) availableLoras = data.loras;
        } catch (e) {}
      };
      fetchLoras();

      const renderLoraSlots = () => {
        loraSlotsList.innerHTML = "";
        if (S.loras.length === 0) {
          loraSlotsList.appendChild(mk("div", { fontSize: "11px", color: C.muted }, { textContent: "No LoRAs attached. Click '+ Add LoRA' above to attach a model." }));
          return;
        }

        S.loras.forEach((slot, idx) => {
          const slotRow = mk("div", { display: "flex", gap: "8px", alignItems: "center", background: C.bg1, padding: "6px 8px", borderRadius: "6px", border: `1px solid ${C.border}`, width: "100%", boxSizing: "border-box" });
          
          const sel = mk("select", { flex: "1", background: C.bg2, color: C.text, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "4px", fontSize: "11px", outline: "none", cursor: "pointer" });
          const defOpt = mk("option", { value: "", textContent: "Select LoRA safetensors..." });
          sel.appendChild(defOpt);
          availableLoras.forEach(l => {
            const opt = mk("option", { value: l, textContent: l });
            if (l === slot.name) opt.selected = true;
            sel.appendChild(opt);
          });
          sel.onchange = () => { S.loras[idx].name = sel.value; persist(); };
          slotRow.appendChild(sel);

          const strWrap = mk("div", { display: "flex", alignItems: "center", gap: "4px" });
          strWrap.appendChild(mk("span", { fontSize: "10px", color: C.muted }, { textContent: "Str:" }));
          const strInp = mk("input", { type: "number", min: "0.0", max: "2.0", step: "0.1", value: slot.strength || 1.0, width: "50px", background: C.bg2, color: C.text, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "2px 4px", fontSize: "10px", outline: "none" });
          strInp.oninput = () => { S.loras[idx].strength = parseFloat(strInp.value); persist(); };
          strWrap.appendChild(strInp);
          slotRow.appendChild(strWrap);

          const delBtn = mk("button", { background: "none", border: "none", color: C.err, cursor: "pointer", padding: "2px", display: "inline-flex", alignItems: "center" });
          delBtn.appendChild(svgIcon("close", 12, C.err));
          delBtn.onclick = () => { S.loras.splice(idx, 1); persist(); renderLoraSlots(); };
          slotRow.appendChild(delBtn);

          loraSlotsList.appendChild(slotRow);
        });
      };

      addSlotBtn.onclick = () => {
        S.loras.push({ name: "", strength: 1.0 });
        persist();
        renderLoraSlots();
      };

      let loraOpen = false;
      addLoraBtn.onclick = async () => {
        loraOpen = !loraOpen;
        loraDrawer.style.display = loraOpen ? "flex" : "none";
        addLoraBtn.style.background = loraOpen ? "#95FF77" : LIME;
        if (loraOpen) {
          await fetchLoras();
          renderLoraSlots();
        }
      };

      const promptTA = mk("textarea", {
        width: "100%",
        height: "68px",
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "8px 12px",
        color: C.text,
        fontSize: "12px",
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
        transition: "height .2s ease",
      }, { placeholder: "Describe what you want to generate with Minimax H3..." });
      promptTA.value = S.prompt;
      promptTA.oninput = () => { S.prompt = promptTA.value; persist(); };

      let promptExpanded = false;
      expandBtn.onclick = () => {
        promptExpanded = !promptExpanded;
        promptTA.style.height = promptExpanded ? "130px" : "68px";
        expTxt.textContent = promptExpanded ? "Collapse" : "Expand";
      };

      // Collapsible Negative Prompt Drawer
      const negCollapse = mk("div", { display: "none", width: "100%", boxSizing: "border-box" });
      const negTA = mk("textarea", {
        width: "100%", height: "40px", background: C.bg2, border: `1px solid ${C.border}`,
        borderRadius: "8px", padding: "6px 10px", color: C.text, fontSize: "11px", outline: "none",
        resize: "none", boxSizing: "border-box", fontFamily: "inherit", marginTop: "3px"
      }, { placeholder: "Negative prompt (things to avoid)..." });
      negTA.value = S.negativePrompt;
      negTA.oninput = () => { S.negativePrompt = negTA.value; persist(); };
      negCollapse.appendChild(negTA);

      let negOpen = false;
      negToggleBtn.onclick = () => {
        negOpen = !negOpen;
        negCollapse.style.display = negOpen ? "block" : "none";
        negToggleBtn.style.color = negOpen ? LIME : C.muted;
      };

      // Footer Row (Matching Image 2 1:1)
      const footerRow = mk("div", {
        display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px", flexShrink: "0", width: "100%", boxSizing: "border-box"
      });
      const footerLeft = mk("div", { fontSize: "10px", color: C.dim, fontWeight: "600", letterSpacing: ".05em" }, { textContent: "xFlowOne" });
      const footerRight = mk("div", { fontSize: "10px", color: C.dim, fontWeight: "600", letterSpacing: ".05em" }, { textContent: "created by NAVAL" });
      footerRow.append(footerLeft, footerRight);

      promptSection.append(promptHdr, loraDrawer, promptTA, negCollapse, footerRow);
      pad.appendChild(promptSection);
      root.appendChild(pad);

      // ── OVERLAYS (Models & Setup Manager + Gallery) ────────────────────────
      const settingsOverlay = mk("div", {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100%",
        height: "100%",
        background: C.bg0,
        zIndex: "100",
        display: "none",
        flexDirection: "column",
        padding: "16px",
        boxSizing: "border-box",
        borderRadius: "12px",
        opacity: "0",
        transform: "translateY(6px)",
        transition: "opacity .22s, transform .22s",
        overflow: "hidden",
      });

      const setHeader = mk("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        flexShrink: "0",
        width: "100%",
        boxSizing: "border-box",
      });
      setHeader.appendChild(cap("MINIMAX H3 REQUIRED MODEL SAFETENSORS & SETUP MANAGER"));

      // SLEEK MINIMAL BRIGHT RED CLOSE BUTTON with Vector SVG Cross
      const closeSetBtn = mk("button", {
        background: "#ff4444",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "800",
        padding: "6px 16px",
        boxShadow: "0 2px 10px rgba(255, 68, 68, 0.4)",
        transition: "all .15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      });
      closeSetBtn.appendChild(svgIcon("close", 12, "#fff"));
      closeSetBtn.appendChild(document.createTextNode("Close"));

      closeSetBtn.onmouseover = () => (closeSetBtn.style.background = "#ff6666");
      closeSetBtn.onmouseout = () => (closeSetBtn.style.background = "#ff4444");
      closeSetBtn.onclick = () => closeOverlay(settingsOverlay);
      setHeader.appendChild(closeSetBtn);
      settingsOverlay.appendChild(setHeader);

      const modelsGrid = mk("div", {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flex: "1",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box",
        paddingRight: "4px",
      });
      settingsOverlay.appendChild(modelsGrid);
      root.appendChild(settingsOverlay);

      modelsBtn.onclick = () => { fetchAndRenderModels(); openOverlay(settingsOverlay); };

      let pollInterval = null;
      const startPollingModels = () => {
        if (!pollInterval) {
          pollInterval = setInterval(fetchAndRenderModels, 1000);
        }
      };

      const renderModelCards = (list) => {
        modelsGrid.innerHTML = "";
        let anyDl = false;

        list.forEach(m => {
          if (m.status === "downloading") anyDl = true;

          const card = mk("div", {
            background: C.bg2,
            borderRadius: "8px",
            border: `1px solid ${m.installed ? LIME : C.border}`,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            boxSizing: "border-box",
          });

          const top = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", boxSizing: "border-box" });
          top.appendChild(mk("div", { fontWeight: "700", fontSize: "12px", color: C.text }, { textContent: `${m.title} (${m.approx_size_gb})` }));

          let badgeText = "Missing";
          let badgeColor = "#ffaaaa";
          let badgeBg = "#3d1b1b";

          if (m.installed) {
            badgeText = "Installed";
            badgeColor = LIME;
            badgeBg = "#1b3d1b";
          } else if (m.status === "downloading") {
            badgeText = `Downloading (${m.percent || 0}%)`;
            badgeColor = "#77ccff";
            badgeBg = "#1b2b3d";
          } else if (m.status === "paused") {
            badgeText = "Paused";
            badgeColor = "#ffee77";
            badgeBg = "#3d3b1b";
          }

          top.appendChild(mk("span", {
            fontSize: "10px", fontWeight: "700", padding: "3px 8px",
            borderRadius: "4px", color: badgeColor, background: badgeBg,
            border: `1px solid ${badgeColor}`,
          }, { textContent: badgeText }));
          card.appendChild(top);

          // Path detail
          const pathDetail = mk("div", { fontSize: "10px", color: C.muted });
          pathDetail.innerHTML = `Folder: <code style="color:${LIME};">${m.folder || 'ComfyUI/models/'}</code> | File: <code style="color:#fff;">${m.name}</code>`;
          card.appendChild(pathDetail);

          // Download Progress Bar if downloading or paused
          if (m.status === "downloading" || m.status === "paused" || (m.percent && m.percent > 0)) {
            const progWrap = mk("div", {
              width: "100%", height: "5px", background: C.bg0, borderRadius: "3px", overflow: "hidden", boxSizing: "border-box"
            });
            const progBar = mk("div", {
              height: "100%", width: `${m.percent || 0}%`, background: m.status === "paused" ? "#ffee77" : LIME, transition: "width 0.3s ease"
            });
            progWrap.appendChild(progBar);
            card.appendChild(progWrap);

            const progInfo = mk("div", { display: "flex", justifyContent: "space-between", fontSize: "9px", color: C.muted, marginTop: "2px" });
            const bytesText = `${formatBytes(m.downloaded_bytes || 0)} / ${formatBytes(m.total_bytes || 0)}`;
            const speedText = m.status === "downloading" ? `${m.speed_mbps || 0} MB/s` : (m.status === "paused" ? "Paused" : "Complete");
            progInfo.appendChild(mk("span", {}, { textContent: bytesText }));
            progInfo.appendChild(mk("span", {}, { textContent: speedText }));
            card.appendChild(progInfo);
          }

          // Bottom Action Row: VECTOR SVG BUTTONS (Download, Pause, Resume, Delete)
          const row = mk("div", { display: "flex", gap: "8px", alignItems: "center", marginTop: "4px", width: "100%", boxSizing: "border-box" });

          if (!m.installed && m.status !== "downloading" && m.status !== "paused") {
            const dl = mk("button", {
              padding: "6px 14px",
              fontSize: "11px",
              fontWeight: "800",
              background: LIME,
              color: "#111",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(0, 255, 102, 0.3)",
            });
            dl.appendChild(svgIcon("download", 13, "#111"));
            dl.appendChild(document.createTextNode("Download"));

            dl.onclick = async () => {
              try {
                await fetch("/minimax_h3/download_model", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ model_id: m.id })
                });
              } catch (e) {}
              fetchAndRenderModels();
              startPollingModels();
            };
            row.appendChild(dl);
          }

          if (m.status === "downloading") {
            const pauseBtn = mk("button", {
              padding: "6px 14px", fontSize: "11px", fontWeight: "700",
              background: "#ffee77", color: "#000", border: "none", borderRadius: "6px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: "6px"
            });
            pauseBtn.appendChild(svgIcon("pause", 13, "#000"));
            pauseBtn.appendChild(document.createTextNode("Pause"));
            pauseBtn.onclick = async () => {
              await fetch("/minimax_h3/pause_download", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model_id: m.id })
              });
              fetchAndRenderModels();
            };
            row.appendChild(pauseBtn);
          }

          if (m.status === "paused") {
            const resumeBtn = mk("button", {
              padding: "6px 14px", fontSize: "11px", fontWeight: "800",
              background: LIME, color: "#111", border: "none", borderRadius: "6px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: "6px"
            });
            resumeBtn.appendChild(svgIcon("play", 13, "#111"));
            resumeBtn.appendChild(document.createTextNode("Resume"));
            resumeBtn.onclick = async () => {
              try {
                await fetch("/minimax_h3/download_model", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ model_id: m.id })
                });
              } catch (e) {}
              fetchAndRenderModels();
              startPollingModels();
            };
            row.appendChild(resumeBtn);
          }

          if (m.installed || m.status === "paused" || (m.percent && m.percent > 0)) {
            const del = mk("button", {
              padding: "5px 12px", fontSize: "11px", fontWeight: "700",
              background: "transparent", color: C.err, border: `1px solid ${C.err}`, borderRadius: "6px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: "5px"
            });
            del.appendChild(svgIcon("trash", 12, C.err));
            del.appendChild(document.createTextNode("Delete"));
            del.onclick = async () => {
              if (confirm(`Delete ${m.name}?`)) {
                await fetch("/minimax_h3/delete_model", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ model_id: m.id })
                });
                fetchAndRenderModels();
              }
            };
            row.appendChild(del);
          }

          // Embedded Minimal Vector HuggingFace Direct URL Link
          const hfLink = mk("a", {
            fontSize: "11px",
            color: LIME,
            marginLeft: "auto",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          });
          hfLink.appendChild(svgIcon("link", 12, LIME));
          hfLink.appendChild(document.createTextNode("HuggingFace"));
          hfLink.href = m.url;
          hfLink.target = "_blank";
          row.appendChild(hfLink);

          card.appendChild(row);
          modelsGrid.appendChild(card);
        });

        if (!anyDl && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      };

      const fetchAndRenderModels = async () => {
        try {
          const res = await fetch("/minimax_h3/models_status");
          const data = await res.json();
          if (data && data.models) renderModelCards(data.models);
          else renderModelCards(FALLBACK_MODELS);
        } catch (e) {
          renderModelCards(FALLBACK_MODELS);
        }
      };

      // ── GALLERY OVERLAY SYSTEM ──────────────────────────────────────────
      const galleryOverlay = mk("div", {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100%",
        height: "100%",
        background: C.bg0,
        zIndex: "100",
        display: "none",
        flexDirection: "column",
        padding: "16px",
        boxSizing: "border-box",
        borderRadius: "12px",
        opacity: "0",
        transform: "translateY(6px)",
        transition: "opacity .22s, transform .22s",
        overflow: "hidden",
      });

      const galHeader = mk("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        flexShrink: "0",
        width: "100%",
        boxSizing: "border-box",
      });
      galHeader.appendChild(cap("GENERATED VIDEO OUTPUT GALLERY"));

      const galActions = mk("div", { display: "flex", alignItems: "center", gap: "8px" });

      const openFolderBtn = mk("button", {
        background: C.bg2,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "700",
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      });
      openFolderBtn.appendChild(svgIcon("upload", 12, LIME));
      openFolderBtn.appendChild(document.createTextNode("Open Output Folder"));
      openFolderBtn.onclick = async () => {
        try {
          await fetch("/minimax_h3/open_folder", { method: "POST" });
        } catch (e) {}
      };

      const closeGalBtn = mk("button", {
        background: "#ff4444",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "800",
        padding: "6px 16px",
        boxShadow: "0 2px 10px rgba(255, 68, 68, 0.4)",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      });
      closeGalBtn.appendChild(svgIcon("close", 12, "#fff"));
      closeGalBtn.appendChild(document.createTextNode("Close"));
      closeGalBtn.onclick = () => closeOverlay(galleryOverlay);

      galActions.append(openFolderBtn, closeGalBtn);
      galHeader.appendChild(galActions);
      galleryOverlay.appendChild(galHeader);

      const galGrid = mk("div", {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
        flex: "1",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box",
        paddingRight: "4px",
      });
      galleryOverlay.appendChild(galGrid);
      root.appendChild(galleryOverlay);

      const renderGalleryItems = (items) => {
        galGrid.innerHTML = "";
        if (!items || items.length === 0) {
          galGrid.appendChild(mk("div", { fontSize: "12px", color: C.muted, padding: "20px", gridColumn: "1 / -1" }, { textContent: "No output videos generated yet." }));
          return;
        }

        items.forEach(vid => {
          const card = mk("div", {
            background: C.bg2,
            borderRadius: "8px",
            border: `1px solid ${C.border}`,
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            boxSizing: "border-box",
          });

          const vidBox = mk("video", {
            width: "100%",
            height: "130px",
            src: vid.video_url,
            controls: true,
            loop: true,
            muted: true,
            objectFit: "cover",
            borderRadius: "6px",
            background: "#000",
          });

          const fnLabel = mk("div", { fontSize: "10px", fontWeight: "700", color: C.text, wordBreak: "break-all" }, { textContent: vid.filename });

          const row = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });

          const playBtn = mk("button", {
            padding: "4px 8px", fontSize: "10px", fontWeight: "700",
            background: LIME, color: "#111", border: "none", borderRadius: "4px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: "4px"
          });
          playBtn.appendChild(svgIcon("play", 10, "#111"));
          playBtn.appendChild(document.createTextNode("Load"));
          playBtn.onclick = () => {
            placeholder.style.display = "none";
            videoPlayer.style.display = "block";
            videoPlayer.src = vid.video_url;
            videoPlayer.load();
            videoPlayer.play().catch(() => {});
            closeOverlay(galleryOverlay);
          };

          const delBtn = mk("button", {
            padding: "4px 8px", fontSize: "10px", fontWeight: "600",
            background: C.bg1, color: C.err, border: `1px solid ${C.err}`, borderRadius: "4px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: "4px"
          });
          delBtn.appendChild(svgIcon("trash", 10, C.err));
          delBtn.appendChild(document.createTextNode("Delete"));
          delBtn.onclick = async () => {
            if (confirm(`Delete ${vid.filename}?`)) {
              await fetch("/minimax_h3/delete", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: vid.filename })
              });
              fetchAndRenderGallery();
            }
          };

          row.append(playBtn, delBtn);
          card.append(vidBox, fnLabel, row);
          galGrid.appendChild(card);
        });
      };

      const fetchAndRenderGallery = async () => {
        try {
          const res = await fetch("/minimax_h3/gallery");
          const data = await res.json();
          if (data && data.videos) renderGalleryItems(data.videos);
          else renderGalleryItems([]);
        } catch (e) {
          renderGalleryItems([]);
        }
      };

      galleryBtn.onclick = () => {
        fetchAndRenderGallery();
        openOverlay(galleryOverlay);
      };

      // Mode Switcher logic with Vector Icon state updates
      function setMode(m) {
        S.mode = m;
        persist();

        [pillT2V, pillI2V, pillR2V].forEach((pillObj, idx) => {
          const modeId = ["T2V", "I2V", "R2V"][idx];
          const isActive = modeId === m;
          pillObj.btn.style.background = isActive ? LIME : C.bg2;
          pillObj.btn.style.color = isActive ? "#111" : C.text;
          pillObj.btn.style.borderColor = isActive ? LIME : C.border;
          pillObj.btn.style.fontWeight = isActive ? "800" : "600";
          pillObj.iconEl.setAttribute("stroke", isActive ? "#111" : C.text);
        });

        if (m === "T2V") {
          slotCard.style.display = "none";
        } else {
          slotCard.style.display = "flex";
        }

        self.setSize([NODE_W, NODE_H + 50]);
        if (self.graph) self.setDirtyCanvas(true, true);
      }

      setMode(S.mode);

      // Generate Action Handler
      genBtn.onclick = async () => {
        const report = await checkSystemValidation(S.mode);
        if (!report || !report.valid) {
          alert(`⚠️ MISSING REQUIRED MINIMAX H3 MODELS!\nPlease click 'Setup' to download missing weights.`);
          fetchAndRenderModels();
          openOverlay(settingsOverlay);
          return;
        }

        genBtn.disabled = true;
        genBtn.innerHTML = "";
        genBtn.appendChild(svgIcon("sparkle", 16, "#111"));
        genBtn.appendChild(document.createTextNode("Generating..."));

        statusRow.style.display = "flex";
        tx(statusLabel, "Queuing workflow...");
        progressBarInner.style.width = "15%";

        try {
          await executePixaromaWorkflow(S.mode, {
            prompt: S.prompt,
            negative_prompt: S.negativePrompt,
            duration: S.duration,
            fps: S.fps,
            motion_strength: S.motion_strength,
            cfg: S.cfg,
            seed: S.seed,
            loras: S.loras,
            width: S.width,
            height: S.height,
          }, statusLabel, progressBarInner);
        } catch (err) {
          genBtn.disabled = false;
          genBtn.innerHTML = "";
          genBtn.appendChild(svgIcon("play", 16, "#111"));
          genBtn.appendChild(document.createTextNode("Generate"));

          tx(statusLabel, `Error: ${err.message}`);
          statusLabel.style.color = C.err;
        }
      };

      api.addEventListener("progress", (e) => {
        if (e.detail && e.detail.max) {
          const pct = Math.round((e.detail.value / e.detail.max) * 100);
          tx(statusLabel, `Rendering frame ${e.detail.value}/${e.detail.max}`);
          progressBarInner.style.width = `${pct}%`;
        }
      });

      api.addEventListener("executed", (e) => {
        if (e.detail && e.detail.output) {
          genBtn.disabled = false;
          genBtn.innerHTML = "";
          genBtn.appendChild(svgIcon("play", 16, "#111"));
          genBtn.appendChild(document.createTextNode("Generate"));

          tx(statusLabel, "Generation Complete!");
          progressBarInner.style.width = "100%";
          playDone();

          if (e.detail.output.gifs && e.detail.output.gifs[0]) {
            const url = api.apiURL(`/view?filename=${e.detail.output.gifs[0].filename}&subfolder=${e.detail.output.gifs[0].subfolder}&type=${e.detail.output.gifs[0].type}`);
            placeholder.style.display = "none";
            videoPlayer.style.display = "block";
            videoPlayer.src = url;
            videoPlayer.load();
            videoPlayer.play().catch(() => {});
          }
        }
      });

      // Mount widget strictly using addDOMWidget with root & fk-root scoping
      this.addDOMWidget("minimax_h3_ui", "div", root, {
        getValue() { return null; },
        setValue() {},
        serialize: false,
        canvasOnly: false,
        computeSize() {
          return [NODE_W, NODE_H];
        },
      });
    };
  },
});

console.log("[MinimaxH3Video] Extension web loaded.");
