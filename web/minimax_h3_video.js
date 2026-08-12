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
  sparkle: ["M12 3v3m0 12v3M3 12h3m12 0h3M5.637 5.637l2.122 2.122m8.485 8.485l2.122 2.122M5.637 18.363l2.122-2.122m8.485-8.485l2.122-2.122"],
  chevronDown: "M6 9l6 6 6-6",
  mic: ["M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z", "M19 10v2a7 7 0 01-14 0v-2", "M12 19v3"],
  music: ["M9 18V5l12-2v13", "M6 21a3 3 0 100-6 3 3 0 000 6z", "M18 19a3 3 0 100-6 3 3 0 000 6z"],
  github: ["M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"],
  discord: "M18.8 4.2c-1.3-.6-2.8-1-4.3-1.2 0 0-.2.4-.4.8-1.7-.2-3.4-.2-5.1 0-.2-.4-.4-.8-.4-.8-1.5.2-3 .6-4.3 1.2C1.7 8.1 1 12 1.3 15.8c1.8 1.3 3.5 2.1 5.1 2.6.4-.6.8-1.2 1.1-1.8-1.2-.4-1.7-.9-2.3-1.5.1.1.2.2.3.2 2.2 1 4.6 1.5 7.1 1.5 2.5 0 4.9-.5 7.1-1.5.1-.1.2-.2.3-.2-.5.6-1.1 1.1-2.3 1.5.3.6.7 1.2 1.1 1.8 1.7-.5 3.4-1.3 5.1-2.6.5-4.4-.8-8.2-3.1-11.6zM8.5 13.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"
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

const createAspectIcon = (chip, isSelected) => {
  const strokeColor = isSelected ? "#111" : C.text;
  let w = 10, h = 10, isDashed = false;

  if (chip === "keep") { w = 11; h = 9; isDashed = true; }
  else if (chip === "1:1") { w = 10; h = 10; }
  else if (chip === "16:9") { w = 14; h = 8; }
  else if (chip === "9:16") { w = 8; h = 14; }
  else if (chip === "4:3") { w = 12; h = 9; }
  else if (chip === "3:4") { w = 9; h = 12; }
  else if (chip === "3:2") { w = 13; h = 8.5; }
  else if (chip === "2:3") { w = 8.5; h = 13; }
  else if (chip === "5:4") { w = 11; h = 9; }
  else if (chip === "4:5") { w = 9; h = 11; }
  else if (chip === "21:9") { w = 15; h = 6.5; }
  else if (chip === "9:21") { w = 6.5; h = 15; }
  else if (chip === "2:1") { w = 14; h = 7; }
  else if (chip === "1:2") { w = 7; h = 14; }

  return mk("span", {
    display: "inline-block",
    width: `${w}px`,
    height: `${h}px`,
    border: `${isDashed ? "1px dashed" : "1px solid"} ${strokeColor}`,
    borderRadius: "1px",
    boxSizing: "border-box",
    flexShrink: "0",
  });
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Web Audio API Interactive Waveform Canvas Renderer with Timeline Zoom, Ruler & Bracket Handles
function drawAudioWaveform(canvas, audioBuffer, startTime = 0, endTime = null, zoomLevel = 1.0, viewOffset = 0.0) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!audioBuffer) return;

  const rawData = audioBuffer.getChannelData(0);
  const totalSamples = rawData.length;
  const duration = audioBuffer.duration;
  const et = endTime == null ? duration : endTime;

  const rulerHeight = 22;
  const waveTop = rulerHeight;
  const waveHeight = height - rulerHeight;

  // Calculate visible window based on zoomLevel and viewOffset
  const visibleDuration = duration / Math.max(1.0, zoomLevel);
  const viewStart = Math.max(0, Math.min(duration - visibleDuration, viewOffset));
  const viewEnd = viewStart + visibleDuration;

  // 1. BACKGROUND
  ctx.fillStyle = "#0c0d0d";
  ctx.fillRect(0, 0, width, height);

  // 2. TIMELINE SECONDS RULER (Top 22px)
  ctx.fillStyle = "#161817";
  ctx.fillRect(0, 0, width, rulerHeight);
  ctx.strokeStyle = "#2b2e2c";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, rulerHeight);
  ctx.lineTo(width, rulerHeight);
  ctx.stroke();

  // Draw Time Ticks & Labels for the visible viewport window
  const numTicks = 10;
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#888888";
  ctx.textAlign = "center";

  for (let i = 0; i <= numTicks; i++) {
    const x = (i / numTicks) * width;
    const tSec = viewStart + (i / numTicks) * visibleDuration;
    
    const mins = Math.floor(tSec / 60);
    const secs = (tSec % 60).toFixed(1);
    const label = mins > 0 ? `${mins}m${secs}s` : `${secs}s`;

    ctx.beginPath();
    ctx.moveTo(x, rulerHeight - 5);
    ctx.lineTo(x, rulerHeight);
    ctx.strokeStyle = "#3a3d3b";
    ctx.stroke();

    ctx.fillText(label, Math.max(16, Math.min(width - 16, x)), rulerHeight - 7);
  }

  // 3. WAVEFORM BARS FOR VISIBLE RANGE
  const startSample = Math.floor((viewStart / duration) * totalSamples);
  const endSample = Math.floor((viewEnd / duration) * totalSamples);
  const visibleSamples = endSample - startSample;

  const numBars = Math.floor(width / 3);
  const samplesPerBar = Math.max(1, Math.floor(visibleSamples / numBars));

  const cropStartSample = Math.floor((startTime / duration) * totalSamples);
  const cropEndSample = Math.min(totalSamples, Math.floor((et / duration) * totalSamples));

  for (let i = 0; i < numBars; i++) {
    const sampleIndex = startSample + i * samplesPerBar;
    if (sampleIndex >= totalSamples) break;

    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < samplesPerBar && (sampleIndex + j) < totalSamples; j++) {
      const val = rawData[sampleIndex + j] || 0;
      if (val < min) min = val;
      if (val > max) max = val;
    }

    const barHeight = Math.max(2, (max - min) * (waveHeight / 2) * 0.85);
    const x = i * 3;
    const y = waveTop + (waveHeight - barHeight) / 2;

    const isInCropRegion = sampleIndex >= cropStartSample && sampleIndex <= cropEndSample;

    ctx.fillStyle = isInCropRegion ? "#00ff66" : "#333333";
    ctx.fillRect(x, y, 2, barHeight);
  }

  // 4. SHADED OVERLAY FOR NON-SELECTED REGIONS
  const startX = ((startTime - viewStart) / visibleDuration) * width;
  const endX = ((et - viewStart) / visibleDuration) * width;

  // Left dimmed overlay
  if (startX > 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, waveTop, Math.min(width, startX), waveHeight);
  }

  // Right dimmed overlay
  if (endX < width) {
    const rx = Math.max(0, endX);
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(rx, waveTop, width - rx, waveHeight);
  }

  // Crop Region Border Box
  if (endX > 0 && startX < width) {
    const bx = Math.max(0, startX);
    const bw = Math.min(width - bx, endX - bx);
    ctx.strokeStyle = "#00ff66";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, waveTop, Math.max(2, bw), waveHeight);

    // 5. BRACKET HANDLES ([ and ])
    const handleW = 10;

    if (startX >= 0 && startX <= width) {
      ctx.fillStyle = "#00ff66";
      ctx.fillRect(startX - handleW / 2, waveTop, handleW, waveHeight);
      ctx.fillStyle = "#111111";
      ctx.fillRect(startX - 1, waveTop + waveHeight / 2 - 8, 2, 16);
    }

    if (endX >= 0 && endX <= width) {
      ctx.fillStyle = "#00ff66";
      ctx.fillRect(endX - handleW / 2, waveTop, handleW, waveHeight);
      ctx.fillStyle = "#111111";
      ctx.fillRect(endX - 1, waveTop + waveHeight / 2 - 8, 2, 16);
    }

    // 6. FLOATING TIME RANGE TOOLTIP
    const cropDurSec = (et - startTime).toFixed(1);
    const badgeTxt = `[ ${startTime.toFixed(1)}s  ──►  ${et.toFixed(1)}s  (${cropDurSec}s) ]`;
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.fillStyle = "#00ff66";
    ctx.textAlign = "center";

    const badgeX = Math.max(80, Math.min(width - 80, (startX + endX) / 2));
    ctx.fillText(badgeTxt, badgeX, waveTop + 14);
  }
}

// Trims AudioBuffer from startTime to endTime and encodes to 16-bit PCM WAV Blob
async function audioBufferToWavBlob(audioBuffer, startTime, endTime) {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(audioBuffer.length, Math.floor(endTime * sampleRate));
  const frameCount = endSample - startSample;

  const offlineCtx = new OfflineAudioContext(numChannels, frameCount, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0, startTime, endTime - startTime);

  const renderedBuffer = await offlineCtx.startRendering();

  const bufferLength = renderedBuffer.length * numChannels * 2 + 44;
  const outBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(outBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + renderedBuffer.length * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, renderedBuffer.length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < renderedBuffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = renderedBuffer.getChannelData(channel)[i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([outBuffer], { type: 'audio/wav' });
}

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
    }
    /* xFlow Custom Webkit Scrollbars */
    ::-webkit-scrollbar,
    *::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }
    ::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track {
      background: #111111 !important;
      border-radius: 4px !important;
    }
    ::-webkit-scrollbar-thumb,
    *::-webkit-scrollbar-thumb {
      background: #2a2a2a !important;
      border-radius: 4px !important;
      border: 1px solid #00ff66 !important;
    }
    ::-webkit-scrollbar-thumb:hover,
    *::-webkit-scrollbar-thumb:hover {
      background: #00ff66 !important;
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

let _objectInfoCache = {};
async function resolveModelName(classType, inputName, rawPreferred) {
  const normPreferred = String(rawPreferred || "").replace(/\\/g, "/").trim();
  const basePreferred = normPreferred.split("/").pop().toLowerCase();

  try {
    if (!_objectInfoCache[classType]) {
      const res = await api.fetchApi(`/object_info/${classType}`);
      if (res && res.ok) {
        _objectInfoCache[classType] = await res.json();
      }
    }
    const info = _objectInfoCache[classType] && _objectInfoCache[classType][classType];
    if (info && info.input && info.input.required && info.input.required[inputName]) {
      const choices = info.input.required[inputName][0];
      if (Array.isArray(choices) && choices.length > 0) {
        // 1. Exact match with normalized slashes
        const exact = choices.find(c => String(c).replace(/\\/g, "/").toLowerCase() === normPreferred.toLowerCase());
        if (exact) return exact;

        // 2. Match basename
        const baseMatch = choices.find(c => String(c).replace(/\\/g, "/").toLowerCase().endsWith(basePreferred));
        if (baseMatch) return baseMatch;

        // No match: return the requested name so ComfyUI rejects the prompt with
        // a clear "value not in list" error. Falling back to choices[0] used to
        // substitute an arbitrary model - e.g. both VAE loaders silently became
        // "pixel_space" - which generates a plausible but wrong video instead of
        // failing.
        console.warn(`[MinimaxH3] ${classType}.${inputName}: "${normPreferred}" not installed. Available:`, choices);
      }
    }
  } catch (e) {
    console.warn(`[MinimaxH3] Could not query /object_info/${classType}:`, e);
  }

  return normPreferred;
}

let _allObjectInfo = null;
async function fetchAllObjectInfo() {
  if (!_allObjectInfo) {
    try {
      const res = await api.fetchApi("/object_info");
      if (res && res.ok) {
        _allObjectInfo = await res.json();
      }
    } catch (e) {
      console.warn("[MinimaxH3] Could not fetch /object_info:", e);
    }
  }
  return _allObjectInfo || {};
}

// Pixaroma nodes keep their real configuration in `node.properties.<xxx>State`,
// NOT in widgets_values (which is usually empty). The API prompt must carry the
// patched state object or the node silently falls back to the template defaults
// (bundled demo image/audio, 864px, 4s, template prompt) - which is why the UI
// size / duration / prompt used to be ignored.
function patchPixaromaState(stateKey, state, params) {
  const num = (v, d) => (v === undefined || v === null || v === "" || isNaN(parseFloat(v)) ? d : parseFloat(v));

  switch (stateKey) {
    case "durationState":
      state.seconds = num(params.duration, state.seconds ?? 4);
      state.fps = parseInt(num(params.fps, state.fps ?? 24));
      break;

    case "longestSideState":
      state.size = parseInt(num(params.longest_side, state.size ?? 864));
      state.step = parseInt(num(params.step_round, state.step ?? 32));
      if (params.aspect_ratio) state.ratio = params.aspect_ratio;
      if (params.crop_from) state.anchor = params.crop_from;
      if (typeof params.upscale_small === "boolean") state.allow_upscale = params.upscale_small;
      if (params.resample_mode) state.resample = params.resample_mode;
      break;

    case "sizesState":
      state.w = parseInt(num(params.width, state.w ?? 864));
      state.h = parseInt(num(params.height, state.h ?? 480));
      break;

    case "loadAudioState": {
      const audio = params.audio_name || "";
      if (audio) state.file = audio;
      state.start = 0;
      state.length = num(params.duration, state.length ?? 5);
      break;
    }

    case "promptState": {
      const text = params.prompt || "";
      if (text) {
        state.text = text;
        state.lastRun = text;
      }
      break;
    }

    default:
      break;
  }
  return state;
}

// Cosmetic keys that let the node face draw itself. Pixaroma's strip_ui_keys
// keeps them out of the injected state: a change to one would otherwise
// invalidate ComfyUI's cache and re-run the node for nothing.
const UI_ONLY_STATE_KEYS = ["sizes", "ratios", "values"];

// Assign a state under every key spelling the backend might expect: the
// property name, its PascalCase variant, and any declared input matching
// case-insensitively. Extra keys are ignored by validation.
//
// The value MUST be a JSON *string*, not an object. These are `hidden` STRING
// inputs that the Pixaroma frontend injects at graphToPrompt time - a path we
// bypass entirely by POSTing to /prompt ourselves. PixaromaLoadAudio parses it
// with a bare json.loads(), which raises TypeError on a dict and silently
// degrades to {} -> "no usable sound file selected".
function assignState(inputs, stateKey, state, nodeDef) {
  const clean = {};
  Object.keys(state).forEach(k => {
    if (!UI_ONLY_STATE_KEYS.includes(k)) clean[k] = state[k];
  });
  const serialized = JSON.stringify(clean);

  const capKey = stateKey.charAt(0).toUpperCase() + stateKey.slice(1);
  inputs[stateKey] = serialized;
  inputs[capKey] = serialized;

  const declared = nodeDef && nodeDef.input;
  ["required", "optional", "hidden"].forEach(section => {
    const keys = declared && declared[section];
    if (!keys) return;
    Object.keys(keys).forEach(k => {
      if (k.toLowerCase() === stateKey.toLowerCase()) inputs[k] = serialized;
    });
  });
}

// Both the pill ids and the resolved workflow names have to map here. The
// caller converts R2V -> "reference_to_video" before calling, which matched no
// branch of the old ternary chain and fell through to text_to_video - so R2V
// and I2V silently ran the text-to-video workflow, which has no reference image
// or audio node at all, and generated a stranger from the prompt alone.
// Must match SUBFOLDER in minimax_h3_video_nodes.py - the Gallery route only
// scans output/<this>.
const GALLERY_SUBFOLDER = "MinimaxH3";

const WORKFLOW_MODES = {
  T2V: "text_to_video",
  I2V: "image_to_video",
  R2V: "reference_to_video",
  text_to_video: "text_to_video",
  image_to_video: "image_to_video",
  image_to_video_fflf: "image_to_video_fflf",
  reference_to_video: "reference_to_video",
  reference_to_video_sing: "reference_to_video_sing",
};

async function executePixaromaWorkflow(mode, params, statusLabel, progressBarInner) {
  const modeKey = WORKFLOW_MODES[mode];
  if (!modeKey) {
    // Never silently fall back - that is exactly how this went unnoticed.
    throw new Error(`Unknown generation mode "${mode}" - cannot pick a workflow`);
  }
  let endpoint = `/minimax_h3/workflow_${modeKey}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Could not load workflow JSON for mode: ${mode}`);
  const workflowJson = await res.json();
  if (!workflowJson || !workflowJson.nodes) throw new Error(`Failed to load workflow template for mode: ${mode}`);

  const allObjInfo = await fetchAllObjectInfo();
  const promptPayload = {};

  for (const node of workflowJson.nodes) {
    const nodeId = String(node.id);
    const classType = node.type;
    const inputs = {};
    const wv = node.widgets_values || [];

    // 1. Pre-fill required widget inputs from /object_info.
    // widgets_values is positional over EVERY widget-backed input, including
    // ones that were converted to links - so the cursor must advance for those
    // too, otherwise every widget after a converted one reads a shifted value.
    const nodeDef = allObjInfo[classType];
    if (nodeDef && nodeDef.input && nodeDef.input.required) {
      const WIDGET_TYPES = new Set(["INT", "FLOAT", "STRING", "BOOLEAN", "COMBO"]);
      let widgetIdx = 0;
      Object.entries(nodeDef.input.required).forEach(([key, spec]) => {
        const type = spec && spec[0];
        const isWidget = Array.isArray(type) || WIDGET_TYPES.has(type);
        if (!isWidget) return;

        const isLinked = node.inputs && node.inputs.some(i => i.name === key && i.link != null);
        if (!isLinked && widgetIdx < wv.length) {
          inputs[key] = wv[widgetIdx];
        }
        widgetIdx++;
      });
    }

    // 2. Specific parameter overrides & dynamic model resolutions
    if (classType === "CLIPLoader") {
      const raw = inputs["clip_name"] || wv[0] || "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors";
      inputs["clip_name"] = await resolveModelName("CLIPLoader", "clip_name", raw);
      if (!inputs["type"]) inputs["type"] = wv[1] || "minimax";
      if (!inputs["device"]) inputs["device"] = "default";
    } else if (classType === "VAELoader") {
      const raw = inputs["vae_name"] || wv[0] || "minimax_h3_video_vae_fp16.safetensors";
      inputs["vae_name"] = await resolveModelName("VAELoader", "vae_name", raw);
    } else if (classType === "UNETLoader") {
      const fallback = (mode.includes("reference") || mode === "R2V" ? "h3/minimax_h3_ref2va_pruned_int8_convrot.safetensors" : "h3/minimax_h3_fl2va_pruned_int8_convrot.safetensors");
      const raw = inputs["unet_name"] || wv[0] || fallback;
      inputs["unet_name"] = await resolveModelName("UNETLoader", "unet_name", raw);
      if (!inputs["weight_dtype"]) inputs["weight_dtype"] = "default";
    } else if (classType === "PixaromaPrompt") {
      inputs["text"] = params.prompt || "";
    } else if (classType === "PixaromaSizes") {
      // sizesState lives in widgets_values[0] for this node, unlike the others
      const sizesStateVal = wv[0] ? JSON.parse(JSON.stringify(wv[0])) : { version: 1, sizes: [] };
      if (typeof sizesStateVal === "object" && sizesStateVal !== null) {
        patchPixaromaState("sizesState", sizesStateVal, params);
      }
      assignState(inputs, "sizesState", sizesStateVal, nodeDef);
    } else if (classType === "PixaromaSaveMp4") {
      inputs["fps"] = parseInt(params.fps || 24);
      // Auto-save on  -> output/MinimaxH3/, where the Gallery route looks.
      // Auto-save off -> temp/, which ComfyUI clears on restart and the Gallery
      // never scans. filename_prefix takes a "/" subfolder; save_mode picks the
      // destination root.
      const autoSave = params.auto_save !== false;
      inputs["filename_prefix"] = autoSave
        ? `${GALLERY_SUBFOLDER}/MinimaxH3_${mode}`
        : `MinimaxH3_${mode}`;
      inputs["save_mode"] = autoSave ? "save" : "preview";
    } else if (classType === "KSampler") {
      inputs["seed"] = params.seed === 0 ? Math.floor(Math.random() * 1000000000) : parseInt(params.seed);
      inputs["control_after_generate"] = wv[1] || "randomize";
      inputs["steps"] = parseInt(wv[2] || 20);
      inputs["cfg"] = parseFloat(params.cfg || 1.0);
      inputs["sampler_name"] = wv[4] || "euler";
      inputs["scheduler"] = wv[5] || "normal";
      inputs["denoise"] = parseFloat(wv[6] || 1.0);
    } else if (classType === "MiniMaxH3ImageToVideo" || classType === "MiniMaxH3ReferenceToVideo") {
      inputs["prompt"] = params.prompt || "";
      inputs["motion_strength"] = parseFloat(params.motion_strength || 0.5);
      if (params.width) inputs["width"] = parseInt(params.width);
      if (params.height) inputs["height"] = parseInt(params.height);
      if (wv[4]) inputs["match_mode"] = wv[4];
    } else if (classType === "PixaromaLoadImageMini") {
      const title = node.title || "";
      const chosenImg = (title.includes("Last Frame") || title.includes("2."))
        ? (params.image_name_2 || params.image_name_1 || wv[0] || "")
        : (params.image_name_1 || wv[0] || "");

      inputs["image"] = chosenImg;
      inputs["image_path"] = chosenImg;
      inputs["file"] = chosenImg;
      inputs["upload"] = chosenImg;
    } else if (classType === "PixaromaLoadAudio") {
      const chosenAudio = params.audio_name || wv[0] || "";
      inputs["audio"] = chosenAudio;
      inputs["file"] = chosenAudio;
      inputs["audio_file"] = chosenAudio;
      inputs["path"] = chosenAudio;
      params = Object.assign({}, params, { audio_name: chosenAudio });
    } else if (classType === "PixaromaLabel" || classType === "PixaromaNote") {
      inputs["text"] = wv[0] || "";
    }

    // 2b. Carry patched Pixaroma state objects (durationState, longestSideState,
    // loadAudioState, promptState, ...) from node.properties into the payload.
    if (node.properties) {
      Object.keys(node.properties).forEach(propKey => {
        const val = node.properties[propKey];
        if (!propKey.toLowerCase().endsWith("state") || typeof val !== "object" || val === null) return;
        const state = patchPixaromaState(propKey, JSON.parse(JSON.stringify(val)), params);
        assignState(inputs, propKey, state, nodeDef);
      });
    }

    // 3. Connect linked inputs (overrides widget values if linked)
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
  }

  // Diagnostic: the exact state each Pixaroma node will run with. We build the
  // payload by hand instead of going through graphToPrompt, so this is the only
  // place the real values are visible.
  console.log("[MinimaxH3] Submitting payload:", JSON.parse(JSON.stringify(promptPayload)));
  Object.entries(promptPayload).forEach(([nid, n]) => {
    Object.entries(n.inputs).forEach(([k, v]) => {
      if (/state$/i.test(k) && typeof v === "string") {
        console.log(`[MinimaxH3]   node ${nid} ${n.class_type}.${k} = ${v}`);
      }
    });
  });

  // Mirror it to the server too - reading a file over ssh is a lot easier than
  // asking someone to find the right DevTools tab.
  try {
    await fetch("/minimax_h3/debug_payload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptPayload, mode: mode, params: params }),
    });
  } catch (e) { /* diagnostics only */ }

  const response = await api.fetchApi("/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: promptPayload })
  });

  const promptResult = await response.json();
  if (promptResult.error) {
    console.error("[MinimaxH3] Detailed Prompt Error:", promptResult);
    let errMsg = promptResult.error.message || "Prompt outputs failed validation";
    if (promptResult.node_errors && Object.keys(promptResult.node_errors).length > 0) {
      const errDetails = Object.entries(promptResult.node_errors).map(([nid, err]) => {
        const msgs = (err.errors || []).map(e => e.message).join("; ");
        return `Node ${nid}: ${msgs}`;
      }).join(" | ");
      errMsg += ` (${errDetails})`;
    } else if (promptResult.error.details) {
      errMsg += ` (${promptResult.error.details})`;
    }
    throw new Error(errMsg);
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
        longest_side: 864,
        step_round: 32,
        aspect_ratio: "keep",
        crop_from: "center",
        upscale_small: true,
        resample_mode: "auto",
        active_size_tabs: [864, 1024, 1216, 1344, 1536],
        active_shape_chips: ["keep", "1:1", "16:9", "9:16", "2:3"],
        duration: 4,
        fps: 24,
        cfg: 1.0,
        seed: 0,
        prompt: "",
        negativePrompt: DEFAULT_NEG_PROMPT,
        autoSave: true,
        generating: false,
        loras: [],
      };

      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.cfg === 7.5 || !parsed.cfg) parsed.cfg = 1.0;
          Object.assign(S, parsed);
          // The settings overlay used to write the selection instead of the
          // chip list, so a persisted size/ratio may be one the user only meant
          // to add to the row. Pull anything off-row back onto it.
          if (Array.isArray(S.active_size_tabs) && !S.active_size_tabs.includes(S.longest_side)) {
            S.longest_side = S.active_size_tabs[0];
          }
          if (Array.isArray(S.active_shape_chips) && !S.active_shape_chips.includes(S.aspect_ratio)) {
            S.aspect_ratio = S.active_shape_chips[0];
          }
        }
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

      // ── INLINE HELP DRAWER PANEL (Embedded inside Node UI - No Popup Window!) ──
      const helpInlineDrawer = mk("div", {
        display: "none",
        flexDirection: "column",
        gap: "14px",
        background: C.bg1,
        border: `1px solid ${LIME}`,
        borderRadius: "8px",
        padding: "16px",
        boxSizing: "border-box",
        width: "100%",
        marginBottom: "10px",
      });

      const helpHdr = mk("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "8px",
        borderBottom: `1px solid ${C.border}`,
      });

      const helpTitleGroup = mk("div", { display: "flex", alignItems: "center", gap: "8px" });
      const helpTitleIcon = svgIcon("help", 16, LIME);
      const helpTitleText = mk("span", { fontSize: "14px", fontWeight: "900", color: "#fff", letterSpacing: ".04em" }, { textContent: "xFlow Minimax H3 - User Guide & Credits" });
      helpTitleGroup.append(helpTitleIcon, helpTitleText);
      helpHdr.appendChild(helpTitleGroup);
      helpInlineDrawer.appendChild(helpHdr);

      // Section 1: How to Use Guide Cards
      const secUse = mk("div", { display: "flex", flexDirection: "column", gap: "8px" });
      secUse.appendChild(cap("📖 HOW TO USE XFLOW MINIMAX H3"));

      const guideGrid = mk("div", { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" });

      const createInlineHelpCard = (title, items, iconName) => {
        const card = mk("div", {
          background: C.bg2, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "10px",
          display: "flex", flexDirection: "column", gap: "4px"
        });
        const cardHdr = mk("div", { display: "flex", alignItems: "center", gap: "6px", color: LIME, fontSize: "11px", fontWeight: "800" });
        cardHdr.append(svgIcon(iconName, 13, LIME), document.createTextNode(title));
        card.appendChild(cardHdr);

        const list = mk("ul", { margin: "0", paddingLeft: "14px", fontSize: "10px", color: C.text, lineHeight: "1.4" });
        items.forEach(it => {
          const li = mk("li", {}, { textContent: it });
          list.appendChild(li);
        });
        card.appendChild(list);
        return card;
      };

      const cardT2V = createInlineHelpCard("Text-to-Video (T2V)", [
        "Select T2V tab in top bar.",
        "Enter prompt in bottom prompt box.",
        "Set Resolution, Duration, and Seed.",
        "Click Generate to render video."
      ], "t2v");

      const cardI2V = createInlineHelpCard("Image-to-Video (I2V)", [
        "Select I2V tab in top bar.",
        "Upload Start Frame image (and optional End Frame).",
        "Tweak CFG Scale under Advanced Options.",
        "Click Generate to animate image."
      ], "i2v");

      const cardR2V = createInlineHelpCard("Ref + Audio Sync (R2V)", [
        "Select R2V tab in top bar.",
        "Upload Reference Image & Audio file.",
        "Choose SPEAK (speech) or SING (singing).",
        "Click Gear (⚙) to trim audio length.",
        "Click Generate for sync video."
      ], "r2v");

      const cardAdv = createInlineHelpCard("Advanced Options & LoRAs", [
        "Expand ⚙ ADVANCED OPTIONS for sizes.",
        "Set CFG Scale, FPS (24/30), and Seed.",
        "Click '+ Add LoRA' to attach LoRAs."
      ], "settings");

      guideGrid.append(cardT2V, cardI2V, cardR2V, cardAdv);
      secUse.appendChild(guideGrid);
      helpInlineDrawer.appendChild(secUse);

      // Section 2: Acknowledgements & Credits
      const secAck = mk("div", {
        background: C.bg2, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: "6px"
      });
      const ackHdr = mk("div", { fontSize: "11px", fontWeight: "800", color: LIME, letterSpacing: ".04em" }, { textContent: "🙏 ACKNOWLEDGEMENTS & SPECIAL THANKS" });
      const ackTxt = mk("div", { fontSize: "10px", color: C.text, lineHeight: "1.4" }, {
        textContent: "Special thanks to Pixaroma (ComfyUI-Pixaroma) for their open-source ComfyUI nodes, audio sync workflows, and architecture inspiration."
      });

      const pixaromaBtn = mk("button", {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 10px",
        fontSize: "10px",
        fontWeight: "800",
        background: C.bg1,
        color: LIME,
        border: `1px solid ${LIME}`,
        borderRadius: "4px",
        cursor: "pointer",
        width: "fit-content",
        transition: "all 0.15s ease",
      });
      pixaromaBtn.append(svgIcon("link", 12, LIME), document.createTextNode("Visit ComfyUI-Pixaroma GitHub"));
      pixaromaBtn.onclick = (e) => {
        e.stopPropagation();
        window.open("https://github.com/Pixaroma/ComfyUI-Pixaroma", "_blank");
      };
      secAck.append(ackHdr, ackTxt, pixaromaBtn);
      helpInlineDrawer.appendChild(secAck);

      // Section 3: Community & Social Links (Discord + GitHub Profile)
      const secSocial = mk("div", { display: "flex", flexDirection: "column", gap: "6px" });
      secSocial.appendChild(cap("💬 JOIN COMMUNITY & SOCIAL LINKS"));

      const socialRow = mk("div", { display: "flex", gap: "8px" });

      // Discord Button with window.open()
      const discordBtn = mk("button", {
        flex: "1",
        padding: "8px 12px",
        background: "#5865F2",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "11px",
        fontWeight: "800",
        boxShadow: "0 3px 10px rgba(88, 101, 242, 0.35)",
        transition: "all 0.15s ease",
      });
      const discordIcon = svgIcon("discord", 15, "#ffffff");
      discordBtn.append(discordIcon, document.createTextNode("Join Discord Server"));

      discordBtn.onclick = (e) => {
        e.stopPropagation();
        window.open("https://discord.gg/dnfaGvcsE", "_blank");
      };

      // GitHub Profile Button with window.open()
      const githubBtn = mk("button", {
        flex: "1",
        padding: "8px 12px",
        background: C.bg2,
        color: "#ffffff",
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "11px",
        fontWeight: "800",
        transition: "all 0.15s ease",
      });
      const githubIcon = svgIcon("github", 15, "#ffffff");
      githubBtn.append(githubIcon, document.createTextNode("GitHub Repository"));

      githubBtn.onclick = (e) => {
        e.stopPropagation();
        window.open("https://github.com/navalyalgam97/xFlow-Minimax-H3", "_blank");
      };

      socialRow.append(discordBtn, githubBtn);
      secSocial.appendChild(socialRow);
      helpInlineDrawer.appendChild(secSocial);
      pad.appendChild(helpInlineDrawer);

      // ── INLINE SETUP & MODELS MANAGER DRAWER PANEL (Embedded inside Node UI) ──
      const setupInlineDrawer = mk("div", {
        display: "none",
        flexDirection: "column",
        gap: "14px",
        background: C.bg1,
        border: `1px solid ${LIME}`,
        borderRadius: "8px",
        padding: "16px",
        boxSizing: "border-box",
        width: "100%",
        marginBottom: "10px",
      });

      const setHeader = mk("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "10px",
        marginBottom: "12px",
        borderBottom: `1px solid ${C.border}`,
        width: "100%",
        boxSizing: "border-box",
      });

      const setNavTitleGroup = mk("div", { display: "flex", alignItems: "center", gap: "8px" });
      const setNavIcon = svgIcon("settings", 18, LIME);
      const setNavText = mk("span", { fontSize: "15px", fontWeight: "900", color: "#fff", letterSpacing: ".04em" }, { textContent: "xFlow Minimax H3 - Models & Setup Manager" });
      setNavTitleGroup.append(setNavIcon, setNavText);
      setHeader.appendChild(setNavTitleGroup);
      setupInlineDrawer.appendChild(setHeader);

      const modelsGrid = mk("div", {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        maxHeight: "450px",
        overflowY: "auto",
        boxSizing: "border-box",
        paddingRight: "4px",
      });
      setupInlineDrawer.appendChild(modelsGrid);
      pad.appendChild(setupInlineDrawer);

      // Alias for backwards compatibility
      const settingsOverlay = setupInlineDrawer;

      // Drawer Switching Logic
      let isHelpDrawerOpen = false;
      let isSetupDrawerOpen = false;

      const toggleHelpDrawer = (forceState = null) => {
        isHelpDrawerOpen = forceState !== null ? forceState : !isHelpDrawerOpen;
        if (isHelpDrawerOpen) {
          if (isSetupDrawerOpen) {
            isSetupDrawerOpen = false;
            setupInlineDrawer.style.display = "none";
            modelsBtn.style.borderColor = C.border;
            modelsBtn.style.color = C.text;
          }
          helpInlineDrawer.style.display = "flex";
          mainRow.style.display = "none";
          helpBtn.style.borderColor = LIME;
          helpBtn.style.color = LIME;
        } else {
          helpInlineDrawer.style.display = "none";
          mainRow.style.display = "flex";
          helpBtn.style.borderColor = C.border;
          helpBtn.style.color = C.text;
        }
      };

      const toggleSetupDrawer = (forceState = null) => {
        isSetupDrawerOpen = forceState !== null ? forceState : !isSetupDrawerOpen;
        if (isSetupDrawerOpen) {
          if (isHelpDrawerOpen) {
            isHelpDrawerOpen = false;
            helpInlineDrawer.style.display = "none";
            helpBtn.style.borderColor = C.border;
            helpBtn.style.color = C.text;
          }
          setupInlineDrawer.style.display = "flex";
          mainRow.style.display = "none";
          modelsBtn.style.borderColor = LIME;
          modelsBtn.style.color = LIME;
          fetchAndRenderModels();
        } else {
          setupInlineDrawer.style.display = "none";
          mainRow.style.display = "flex";
          modelsBtn.style.borderColor = C.border;
          modelsBtn.style.color = C.text;
        }
      };

      helpBtn.onclick = (e) => { e.stopPropagation(); toggleHelpDrawer(); };
      modelsBtn.onclick = (e) => { e.stopPropagation(); toggleSetupDrawer(); };

      // ── MAIN CONTENT ROW (2 Columns: Left Controls + Right Preview) ────────
      const mainRow = mk("div", {
        display: "flex",
        gap: "14px",
        flex: "1",
        minHeight: "0",
        width: "100%",
        boxSizing: "border-box",
      });

      // LEFT COLUMN CONTROLS (with pinned Generate button and internal scroll area)
      const leftCol = mk("div", {
        width: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flexShrink: "0",
        boxSizing: "border-box",
        height: "100%",
      });

      const leftScrollArea = mk("div", {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flex: "1",
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: "4px",
        boxSizing: "border-box",
      });
      leftCol.appendChild(leftScrollArea);

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

      // Custom Dropdown Menu Floating Popup (with forced visible custom scrollbar)
      const sizeMenu = mk("div", {
        position: "absolute",
        top: "100%",
        left: "0",
        width: "100%",
        maxHeight: "180px",
        background: "#161817",
        border: `1px solid ${LIME}`,
        borderRadius: "8px",
        marginTop: "4px",
        display: "none",
        flexDirection: "column",
        overflowY: "scroll",
        overflowX: "hidden",
        zIndex: "9999",
        boxShadow: "0 8px 24px rgba(0,0,0,0.9), 0 0 12px rgba(0, 255, 102, 0.25)",
        boxSizing: "border-box",
        paddingRight: "2px",
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

      // ── LONGEST SIDE SELECTOR (for I2V & R2V modes, matching Screenshots 1, 2, 3) ──
      const longestSideBox = mk("div", {
        background: C.bg2,
        padding: "10px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        display: "none",
        flexDirection: "column",
        gap: "8px",
        boxSizing: "border-box",
      });

      // Top Row: Badge x32 + Gear Icon Button + "864 long side" label
      const lsTopRow = mk("div", { display: "flex", alignItems: "center", justifyContent: "space-between" });
      
      const lsBadge = mk("span", {
        background: LIME,
        color: "#111",
        fontSize: "10px",
        fontWeight: "900",
        padding: "2px 6px",
        borderRadius: "4px",
        boxShadow: "0 0 6px rgba(0, 255, 102, 0.4)",
      }, { textContent: `x${S.step_round || 32}` });

      const lsGearBtnGroup = mk("div", { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" });
      
      const lsGearBtn = mk("button", {
        background: "transparent",
        border: "none",
        color: C.text,
        cursor: "pointer",
        padding: "2px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      });
      const gearIconSvg = svgIcon("settings", 13, C.text);
      lsGearBtn.appendChild(gearIconSvg);

      const lsTitleLbl = mk("span", { fontSize: "11px", fontWeight: "700", color: C.muted, fontStyle: "italic" }, {
        textContent: `${S.longest_side || 864} long side`
      });

      lsGearBtnGroup.append(lsGearBtn, lsTitleLbl);
      lsTopRow.append(lsBadge, lsGearBtnGroup);
      longestSideBox.appendChild(lsTopRow);

      // Row 1: Longest Side Tabs (864, 1024, 1216, 1344, 1536)
      const lsTabsRow = mk("div", { display: "flex", gap: "4px", width: "100%", boxSizing: "border-box" });
      
      const renderLsTabs = () => {
        lsTabsRow.innerHTML = "";
        const tabsList = S.active_size_tabs || [864, 1024, 1216, 1344, 1536];
        tabsList.forEach(val => {
          const isSelected = S.longest_side === val;
          const btn = mk("button", {
            flex: "1",
            padding: "5px 0",
            fontSize: "11px",
            fontWeight: "800",
            borderRadius: "4px",
            border: `1px solid ${isSelected ? LIME : C.border}`,
            background: isSelected ? LIME : C.bg1,
            color: isSelected ? "#111" : C.text,
            cursor: "pointer",
            outline: "none",
            transition: "all 0.12s ease",
            textAlign: "center",
          }, { textContent: String(val) });

          btn.onmouseover = () => { if (!isSelected) btn.style.borderColor = LIME; };
          btn.onmouseout = () => { if (!isSelected) btn.style.borderColor = C.border; };

          btn.onclick = () => {
            S.longest_side = val;
            lsTitleLbl.textContent = `${val} long side`;
            persist();
            renderLsTabs();
          };

          lsTabsRow.appendChild(btn);
        });
      };
      renderLsTabs();
      longestSideBox.appendChild(lsTabsRow);

      // Row 2: Aspect Ratio Shape Chips (keep, 1:1, 16:9, 9:16, 2:3)
      const shapeChipsRow = mk("div", { display: "flex", gap: "4px", width: "100%", boxSizing: "border-box" });
      
      const renderShapeChips = () => {
        shapeChipsRow.innerHTML = "";
        const chipsList = S.active_shape_chips || ["keep", "1:1", "16:9", "9:16", "2:3"];
        chipsList.forEach(chip => {
          const isSelected = S.aspect_ratio === chip;
          const btn = mk("button", {
            flex: "1",
            padding: "5px 0",
            fontSize: "10px",
            fontWeight: "700",
            borderRadius: "4px",
            border: `1px solid ${isSelected ? LIME : C.border}`,
            background: isSelected ? LIME : C.bg1,
            color: isSelected ? "#111" : C.text,
            cursor: "pointer",
            outline: "none",
            transition: "all 0.12s ease",
            textAlign: "center",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
          });

          const chipIcon = createAspectIcon(chip, isSelected);
          btn.append(chipIcon, document.createTextNode(chip));

          btn.onmouseover = () => { if (!isSelected) btn.style.borderColor = LIME; };
          btn.onmouseout = () => { if (!isSelected) btn.style.borderColor = C.border; };

          btn.onclick = () => {
            S.aspect_ratio = chip;
            persist();
            renderShapeChips();
          };

          shapeChipsRow.appendChild(btn);
        });
      };
      renderShapeChips();
      longestSideBox.appendChild(shapeChipsRow);

      // CFG Scale & FPS Row (2 Columns: CFG SCALE on left, FPS on right)
      const cfgFpsRow = mk("div", { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" });

      // CFG Scale Box (Half width, Default 1.0)
      const cfgBox = mk("div", { background: C.bg2, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${C.border}` });
      cfgBox.appendChild(cap("CFG SCALE"));
      const cfgInput = mk("input", {
        type: "number",
        min: "1.0",
        max: "20.0",
        step: "0.5",
        value: S.cfg != null ? S.cfg : 1.0,
        width: "100%",
        background: C.bg1,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        padding: "6px 8px",
        fontSize: "11px",
        fontWeight: "700",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
      });
      cfgInput.oninput = () => { S.cfg = parseFloat(cfgInput.value) || 1.0; persist(); };
      cfgBox.appendChild(cfgInput);
      
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
      cfgFpsRow.append(cfgBox, fpsBox);

      // Duration Box with Custom Visual Interactive Drag Slider (1-10s, default 4s, Full Width)
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

      // SEED Control Box (Matching Screenshot 2 1:1 with xFlow Neon Green Shuffle Button)
      const seedBox = mk("div", {
        background: C.bg2,
        padding: "8px 10px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        boxSizing: "border-box",
      });

      const seedHdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
      seedHdr.appendChild(cap("SEED"));
      seedBox.appendChild(seedHdr);

      // Interactive Control Row: [ - ]  [ Seed Input Display ]  [ 🔀 Shuffle ]  [ + ]
      const seedCtrlRow = mk("div", {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: C.bg1,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "3px 6px",
        boxSizing: "border-box",
      });

      const minusBtn = mk("button", {
        width: "26px",
        height: "26px",
        borderRadius: "4px",
        background: "transparent",
        color: C.text,
        border: "none",
        fontSize: "14px",
        fontWeight: "800",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.12s ease",
      }, { textContent: "—" });

      const seedInputEl = mk("input", {
        type: "number",
        value: S.seed || 0,
        flex: "1",
        width: "60px",
        background: "transparent",
        color: C.text,
        border: "none",
        fontSize: "12px",
        fontWeight: "700",
        outline: "none",
        textAlign: "center",
        boxSizing: "border-box",
      });

      const randomizerBtn = mk("button", {
        padding: "4px 10px",
        borderRadius: "14px",
        background: LIME,
        color: "#111",
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 8px rgba(0, 255, 102, 0.4)",
        transition: "all 0.15s ease",
      });
      randomizerBtn.appendChild(svgIcon("random", 13, "#111"));

      const plusBtn = mk("button", {
        width: "26px",
        height: "26px",
        borderRadius: "4px",
        background: "transparent",
        color: C.text,
        border: "none",
        fontSize: "14px",
        fontWeight: "800",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.12s ease",
      }, { textContent: "+" });

      minusBtn.onmouseover = () => (minusBtn.style.color = LIME);
      minusBtn.onmouseout = () => (minusBtn.style.color = C.text);

      plusBtn.onmouseover = () => (plusBtn.style.color = LIME);
      plusBtn.onmouseout = () => (plusBtn.style.color = C.text);

      minusBtn.onclick = () => {
        let val = parseInt(seedInputEl.value) || 0;
        val = Math.max(0, val - 1);
        S.seed = val;
        seedInputEl.value = val;
        persist();
      };

      plusBtn.onclick = () => {
        let val = parseInt(seedInputEl.value) || 0;
        val = val + 1;
        S.seed = val;
        seedInputEl.value = val;
        persist();
      };

      randomizerBtn.onclick = () => {
        const newSeed = Math.floor(Math.random() * 1000000000);
        S.seed = newSeed;
        seedInputEl.value = newSeed;
        persist();
      };

      seedInputEl.oninput = () => {
        S.seed = parseInt(seedInputEl.value) || 0;
        persist();
      };

      seedCtrlRow.append(minusBtn, seedInputEl, randomizerBtn, plusBtn);
      seedBox.appendChild(seedCtrlRow);

      // ── MEDIA INPUT SLOT CARD (Dynamic for I2V & R2V modes) ──
      const slotCard = mk("div", {
        display: "none",
        flexDirection: "column",
        gap: "6px",
        background: C.bg2,
        padding: "8px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        boxSizing: "border-box",
      });

      let imgData1 = null;
      let imgData2 = null;
      let audioData = null;

      // Audio Sync Mode Pill Switch Bar for R2V mode (SPEAK vs SING with vector icons)
      const r2vSwitchRow = mk("div", {
        display: "none",
        alignItems: "center",
        gap: "4px",
        background: C.bg1,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "2px",
        boxSizing: "border-box",
        width: "100%",
        marginBottom: "2px",
      });

      const speakBtn = mk("button", {
        flex: "1", padding: "5px 0", fontSize: "11px", fontWeight: "800",
        borderRadius: "4px", border: "none", cursor: "pointer", transition: "all 0.15s ease",
        background: LIME, color: "#111",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px"
      });
      const speakIcon = svgIcon("mic", 13, "#111");
      speakBtn.append(speakIcon, document.createTextNode("SPEAK"));

      const singBtn = mk("button", {
        flex: "1", padding: "5px 0", fontSize: "11px", fontWeight: "800",
        borderRadius: "4px", border: "none", cursor: "pointer", transition: "all 0.15s ease",
        background: "transparent", color: C.text,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px"
      });
      const singIcon = svgIcon("music", 13, C.text);
      singBtn.append(singIcon, document.createTextNode("SING"));

      const updateR2vSwitch = (type) => {
        S.r2v_type = type === "SING" ? "SING" : "SPEAK";
        persist();
        if (S.r2v_type === "SPEAK") {
          speakBtn.style.background = LIME;
          speakBtn.style.color = "#111";
          speakIcon.setAttribute("stroke", "#111");

          singBtn.style.background = "transparent";
          singBtn.style.color = C.text;
          singIcon.setAttribute("stroke", C.text);
        } else {
          singBtn.style.background = LIME;
          singBtn.style.color = "#111";
          singIcon.setAttribute("stroke", "#111");

          speakBtn.style.background = "transparent";
          speakBtn.style.color = C.text;
          speakIcon.setAttribute("stroke", C.text);
        }
      };

      speakBtn.onclick = (e) => { e.stopPropagation(); updateR2vSwitch("SPEAK"); };
      singBtn.onclick = (e) => { e.stopPropagation(); updateR2vSwitch("SING"); };

      r2vSwitchRow.append(speakBtn, singBtn);
      slotCard.appendChild(r2vSwitchRow);

      const createImgUploadBox = (headerNode, slotKey) => {
        const box = mk("div", {
          background: C.bg1,
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          boxSizing: "border-box",
          position: "relative",
          minHeight: "135px",
          minWidth: "0",
          width: "100%",
          overflow: "hidden",
        });

        const hdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
        if (typeof headerNode === "string") {
          hdr.appendChild(cap(headerNode));
        } else {
          hdr.appendChild(headerNode);
        }
        box.appendChild(hdr);

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/png, image/jpeg, image/jpg, image/webp";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);

        const emptyArea = mk("div", {
          flex: "1",
          border: `1px dashed ${C.border}`,
          borderRadius: "4px",
          padding: "10px 4px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          cursor: "pointer",
          background: C.bg2,
          transition: "all 0.15s ease",
          textAlign: "center",
          boxSizing: "border-box",
        });

        const uploadIcon = svgIcon("upload", 16, LIME);
        const uploadTxt = mk("span", { fontSize: "11px", fontWeight: "800", color: LIME }, { textContent: "Upload Image" });
        const extTxt = mk("span", { fontSize: "9px", fontWeight: "600", color: C.muted }, { textContent: "(.png, .jpg, .webp)" });

        emptyArea.append(uploadIcon, uploadTxt, extTxt);

        emptyArea.onmouseover = () => { emptyArea.style.borderColor = LIME; emptyArea.style.background = "#222b24"; };
        emptyArea.onmouseout = () => { emptyArea.style.borderColor = C.border; emptyArea.style.background = C.bg2; };
        emptyArea.onclick = (e) => { e.stopPropagation(); e.preventDefault(); fileInput.click(); };

        const previewArea = mk("div", {
          display: "none",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          flex: "1",
          borderRadius: "4px",
          overflow: "hidden",
          border: `1px solid ${LIME}`,
          boxSizing: "border-box",
        });

        const thumbImg = mk("img", { width: "100%", height: "90px", objectFit: "cover", display: "block" });
        const actionGroup = mk("div", { position: "absolute", top: "4px", right: "4px", display: "flex", alignItems: "center", gap: "4px", zIndex: "5" });

        const maxBtn = mk("button", {
          background: "rgba(10, 10, 10, 0.8)", border: `1px solid ${C.border}`, borderRadius: "4px", color: "#fff", cursor: "pointer", padding: "3px 5px", display: "inline-flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        });
        const maxIcon = svgIcon("expand", 11, "#fff");
        maxBtn.appendChild(maxIcon);

        const clearBtn = mk("button", {
          background: "rgba(10, 10, 10, 0.8)", border: `1px solid ${C.border}`, borderRadius: "4px", color: "#ff6666", cursor: "pointer", padding: "3px 5px", display: "inline-flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        });
        clearBtn.appendChild(svgIcon("close", 11, "#ff6666"));

        actionGroup.append(maxBtn, clearBtn);
        const dimBadge = mk("div", {
          position: "absolute", bottom: "0", left: "0", right: "0", background: "rgba(10, 10, 10, 0.85)", color: LIME, fontSize: "9px", fontWeight: "800", padding: "3px 6px", textAlign: "center", backdropFilter: "blur(4px)", borderTop: `1px solid ${C.border}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }, { textContent: "" });

        previewArea.append(thumbImg, actionGroup, dimBadge);
        box.append(emptyArea, previewArea);

        const handleFileSelect = async (file) => {
          if (!file) return;
          const formData = new FormData();
          formData.append("image", file);
          formData.append("overwrite", "true");
          try {
            const res = await fetch("/upload/image", { method: "POST", body: formData });
            const data = await res.json();
            const serverFileName = data.name || file.name;
            const objectUrl = URL.createObjectURL(file);
            const tempImg = new Image();
            tempImg.onload = () => {
              const w = tempImg.naturalWidth;
              const h = tempImg.naturalHeight;
              const imgObj = { name: serverFileName, url: objectUrl, width: w, height: h };
              if (slotKey === 1) { imgData1 = imgObj; S.imgData1 = imgObj; }
              else { imgData2 = imgObj; S.imgData2 = imgObj; }
              thumbImg.src = objectUrl;
              dimBadge.textContent = `${w} × ${h} px • ${serverFileName}`;
              emptyArea.style.display = "none";
              previewArea.style.display = "flex";
              maxBtn.onclick = (e) => { e.stopPropagation(); openImagePreview(objectUrl, typeof headerNode === "string" ? headerNode : headerNode.textContent, w, h); };
            };
            tempImg.src = objectUrl;
          } catch (e) { console.error("Image upload failed:", e); }
        };

        fileInput.onchange = () => { if (fileInput.files && fileInput.files[0]) handleFileSelect(fileInput.files[0]); };
        clearBtn.onclick = (e) => {
          e.stopPropagation();
          fileInput.value = "";
          if (slotKey === 1) { imgData1 = null; S.imgData1 = null; }
          else { imgData2 = null; S.imgData2 = null; }
          previewArea.style.display = "none";
          emptyArea.style.display = "flex";
        };
        return box;
      };

      const createAudioUploadBox = () => {
        const box = mk("div", {
          background: C.bg1,
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          boxSizing: "border-box",
          position: "relative",
          minHeight: "135px",
          minWidth: "0",
          width: "100%",
          overflow: "hidden",
        });

        const hdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
        hdr.appendChild(cap("AUDIO FILE"));
        box.appendChild(hdr);

        const audioInput = document.createElement("input");
        audioInput.type = "file";
        audioInput.accept = "audio/mp3, audio/wav, audio/mpeg, audio/flac, audio/m4a, audio/x-wav";
        audioInput.style.display = "none";
        document.body.appendChild(audioInput);

        const emptyArea = mk("div", {
          flex: "1",
          border: `1px dashed ${C.border}`,
          borderRadius: "4px",
          padding: "10px 4px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          cursor: "pointer",
          background: C.bg2,
          transition: "all 0.15s ease",
          textAlign: "center",
          boxSizing: "border-box",
        });

        const uploadIcon = svgIcon("sparkle", 16, LIME);
        const uploadTxt = mk("span", { fontSize: "11px", fontWeight: "800", color: LIME }, { textContent: "Upload Audio" });
        const extTxt = mk("span", { fontSize: "9px", fontWeight: "600", color: C.muted }, { textContent: "(.mp3, .wav, .flac)" });

        emptyArea.append(uploadIcon, uploadTxt, extTxt);

        emptyArea.onmouseover = () => { emptyArea.style.borderColor = LIME; emptyArea.style.background = "#222b24"; };
        emptyArea.onmouseout = () => { emptyArea.style.borderColor = C.border; emptyArea.style.background = C.bg2; };
        emptyArea.onclick = (e) => { e.stopPropagation(); e.preventDefault(); audioInput.click(); };

        const previewArea = mk("div", {
          display: "none",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          minWidth: "0",
          flex: "1",
          borderRadius: "4px",
          overflow: "hidden",
          border: `1px solid ${LIME}`,
          background: C.bg2,
          padding: "6px",
          boxSizing: "border-box",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
        });

        const nameLbl = mk("span", {
          fontSize: "10px",
          fontWeight: "700",
          color: LIME,
          width: "100%",
          maxWidth: "100%",
          minWidth: "0",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
          textAlign: "left",
          boxSizing: "border-box",
          paddingRight: "36px",
        });
        const audioPlayer = mk("audio", { controls: true, style: "width: 100%; max-width: 100%; min-width: 0; height: 26px; outline: none; box-sizing: border-box;" });

        let currentUploadedAudioFile = null;

        const actionGroup = mk("div", { position: "absolute", top: "4px", right: "4px", display: "flex", alignItems: "center", gap: "4px", zIndex: "5" });

        const gearBtn = mk("button", {
          background: "rgba(10, 10, 10, 0.8)", border: `1px solid ${C.border}`, borderRadius: "4px", color: LIME, cursor: "pointer", padding: "3px 5px", display: "inline-flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        });
        const gearIcon = svgIcon("settings", 11, LIME);
        gearBtn.appendChild(gearIcon);

        const clearBtn = mk("button", {
          background: "rgba(10, 10, 10, 0.8)", border: `1px solid ${C.border}`, borderRadius: "4px", color: "#ff6666", cursor: "pointer", padding: "3px 5px", display: "inline-flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
        });
        clearBtn.appendChild(svgIcon("close", 11, "#ff6666"));

        actionGroup.append(gearBtn, clearBtn);

        previewArea.append(actionGroup, nameLbl, audioPlayer);
        box.append(emptyArea, previewArea);

        const handleAudioSelect = async (file) => {
          if (!file) return;
          currentUploadedAudioFile = file;
          const formData = new FormData();
          formData.append("image", file);
          formData.append("overwrite", "true");
          try {
            const res = await fetch("/upload/image", { method: "POST", body: formData });
            const data = await res.json();
            const serverFileName = data.name || file.name;
            const objectUrl = URL.createObjectURL(file);
            audioData = { name: serverFileName, url: objectUrl, file: file };
            S.audioData = audioData;
            audioPlayer.src = objectUrl;
            nameLbl.textContent = serverFileName;
            emptyArea.style.display = "none";
            previewArea.style.display = "flex";

            gearBtn.onclick = (e) => {
              e.stopPropagation();
              openAudioEditor({
                file: currentUploadedAudioFile || file,
                fileName: serverFileName,
                onCropSuccess: (newFileName, newUrl, newFile, durationSec) => {
                  currentUploadedAudioFile = newFile;
                  audioData = { name: newFileName, url: newUrl, file: newFile };
                  S.audioData = audioData;
                  audioPlayer.src = newUrl;
                  try { audioPlayer.load(); } catch(err){}
                  nameLbl.textContent = `${newFileName} (${durationSec}s)`;
                }
              });
            };
          } catch (e) { console.error("Audio upload failed:", e); }
        };

        audioInput.onchange = () => { if (audioInput.files && audioInput.files[0]) handleAudioSelect(audioInput.files[0]); };
        clearBtn.onclick = (e) => {
          e.stopPropagation();
          audioInput.value = "";
          audioData = null;
          S.audioData = null;
          audioPlayer.src = "";
          previewArea.style.display = "none";
          emptyArea.style.display = "flex";
        };
        return box;
      };

      const slotGrid = mk("div", {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        width: "100%",
        minWidth: "0",
        boxSizing: "border-box",
      });

      const box1HeaderLbl = cap("START FRAME");
      const box1 = createImgUploadBox(box1HeaderLbl, 1);
      const box2Img = createImgUploadBox("END FRAME (OPT)", 2);
      const box2Audio = createAudioUploadBox();

      slotGrid.append(box1, box2Img, box2Audio);
      slotCard.appendChild(slotGrid);

      // ── ADVANCED OPTIONS EXPANDABLE ACCORDION CARD ──────────────────────
      const advAccordion = mk("div", {
        background: C.bg2,
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
      });

      const advHeader = mk("div", {
        padding: "8px 10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        background: C.bg2,
        transition: "all 0.15s ease",
      });

      const advTitleGroup = mk("div", { display: "flex", alignItems: "center", gap: "6px" });
      const advGearIcon = svgIcon("settings", 13, C.muted);
      const advTitle = mk("span", { fontSize: "11px", fontWeight: "800", letterSpacing: ".08em", color: C.muted, textTransform: "uppercase" }, { textContent: "Advanced Options" });
      advTitleGroup.append(advGearIcon, advTitle);

      const advChevron = svgIcon("chevronDown", 13, C.muted);
      advChevron.style.transition = "transform 0.2s ease";

      advHeader.append(advTitleGroup, advChevron);

      const advBody = mk("div", {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px",
        borderTop: `1px solid ${C.border}`,
        background: C.bg1,
      });

      let isAdvOpen = true;
      advHeader.onclick = (e) => {
        e.stopPropagation();
        isAdvOpen = !isAdvOpen;
        advBody.style.display = isAdvOpen ? "flex" : "none";
        advChevron.style.transform = isAdvOpen ? "rotate(180deg)" : "rotate(0deg)";
        advHeader.style.background = isAdvOpen ? C.bg1 : C.bg2;
        advTitle.style.color = isAdvOpen ? LIME : C.muted;
        advGearIcon.setAttribute("stroke", isAdvOpen ? LIME : C.muted);
        advChevron.setAttribute("stroke", isAdvOpen ? LIME : C.muted);
      };

      advHeader.onmouseover = () => {
        if (!isAdvOpen) {
          advTitle.style.color = LIME;
          advGearIcon.setAttribute("stroke", LIME);
          advChevron.setAttribute("stroke", LIME);
        }
      };
      advHeader.onmouseout = () => {
        if (!isAdvOpen) {
          advTitle.style.color = C.muted;
          advGearIcon.setAttribute("stroke", C.muted);
          advChevron.setAttribute("stroke", C.muted);
        }
      };

      advAccordion.append(advHeader, advBody);
      advBody.append(longestSideBox, cfgFpsRow, seedBox);

      // Append items to leftScrollArea in exact requested order:
      // 1. Upload Images / Media Input Card
      // 2. Duration Box
      // 3. Advanced Options Accordion
      leftScrollArea.append(orientSizeBox, slotCard, durBox, advAccordion);

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

      // controls/autoplay/loop are element properties, not CSS - passing them in
      // the style object silently dropped them, which is why the player had no
      // transport bar and no way to replay a finished clip.
      const videoPlayer = mk("video", {
        width: "100%",
        height: "100%",
        display: "none",
        backgroundColor: "#000",
        objectFit: "contain",
      }, {
        controls: true,
        autoplay: true,
        loop: false,
        playsInline: true,
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

      promptSection.append(promptHdr, loraDrawer, promptTA, negCollapse);
      pad.appendChild(promptSection);
      root.appendChild(pad);

      // ── MODELS MANAGER & SETUP (POLL & RENDER) ────────────────────────
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

      // ── FULLSCREEN IMAGE PREVIEW OVERLAY (Maximise Button) ───────────────────
      const imagePreviewOverlay = mk("div", {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100%",
        height: "100%",
        background: "rgba(10, 10, 10, 0.95)",
        backdropFilter: "blur(10px)",
        zIndex: "120",
        display: "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        borderRadius: "12px",
        opacity: "0",
        transform: "scale(0.96)",
        transition: "opacity .22s ease, transform .22s ease",
      });

      const imgPrevHdr = mk("div", {
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"
      });
      const imgPrevTitle = mk("span", { fontSize: "13px", fontWeight: "800", color: LIME });
      const imgPrevDimensions = mk("span", { fontSize: "11px", fontWeight: "800", color: C.text, background: C.bg2, padding: "4px 10px", borderRadius: "4px", border: `1px solid ${C.border}` });
      imgPrevHdr.append(imgPrevTitle, imgPrevDimensions);

      const closeImgPrevBtn = mk("button", {
        background: "#ff4444", color: "#fff", border: "none", borderRadius: "6px",
        padding: "6px 16px", fontSize: "12px", fontWeight: "800", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 10px rgba(255, 68, 68, 0.4)"
      });
      closeImgPrevBtn.appendChild(svgIcon("close", 12, "#fff"));
      closeImgPrevBtn.appendChild(document.createTextNode("Close"));
      closeImgPrevBtn.onclick = (e) => {
        e.stopPropagation();
        closeOverlay(imagePreviewOverlay);
      };
      imgPrevHdr.appendChild(closeImgPrevBtn);

      const imgPrevTag = mk("img", {
        maxWidth: "100%", maxHeight: "calc(100% - 60px)", objectFit: "contain", borderRadius: "8px", border: `1px solid ${LIME}`, boxShadow: "0 8px 32px rgba(0, 255, 102, 0.25)"
      });

      imagePreviewOverlay.append(imgPrevHdr, imgPrevTag);
      root.appendChild(imagePreviewOverlay);

      const openImagePreview = (src, title, width, height) => {
        imgPrevTitle.textContent = title;
        imgPrevDimensions.textContent = `${width} × ${height} px`;
        imgPrevTag.src = src;
        openOverlay(imagePreviewOverlay);
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
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gridAutoRows: "min-content",
        alignContent: "start",
        gap: "10px",
        flex: "1",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        boxSizing: "border-box",
        paddingRight: "4px",
      });
      galleryOverlay.appendChild(galGrid);
      root.appendChild(galleryOverlay);

      // Filename of the clip most recently loaded from the gallery, so the tile
      // it came from keeps a lime outline the next time the overlay opens.
      let galSelected = null;

      const renderGalleryItems = (items) => {
        galGrid.innerHTML = "";
        if (!items || items.length === 0) {
          galGrid.appendChild(mk("div", { fontSize: "12px", color: C.muted, padding: "20px", gridColumn: "1 / -1" }, { textContent: "No output videos generated yet." }));
          return;
        }

        items.forEach(vid => {
          const selected = vid.filename === galSelected;

          const card = mk("div", {
            position: "relative",
            aspectRatio: "1 / 1",
            background: "#000",
            borderRadius: "6px",
            border: `2px solid ${selected ? LIME : "transparent"}`,
            overflow: "hidden",
            cursor: "pointer",
            boxSizing: "border-box",
          });

          const vidBox = mk("video", {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            background: "#000",
          }, {
            src: vid.video_url,
            controls: false,
            loop: true,
            muted: true,
            playsInline: true,
            preload: "metadata",
          });

          // Caption bar pinned to the bottom of the thumbnail.
          const fnLabel = mk("div", {
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            padding: "4px 6px",
            fontSize: "10px",
            fontWeight: "700",
            color: "#ffffff",
            background: "rgba(0,0,0,0.62)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pointerEvents: "none",
          }, { textContent: vid.filename });

          const delBtn = mk("button", {
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "22px",
            height: "22px",
            padding: "0",
            background: "rgba(0,0,0,0.65)",
            border: `1px solid ${C.err}`,
            borderRadius: "4px",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
          }, { title: `Delete ${vid.filename}` });
          delBtn.appendChild(svgIcon("trash", 11, C.err));
          delBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`Delete ${vid.filename}?`)) {
              await fetch("/minimax_h3/delete", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: vid.filename })
              });
              fetchAndRenderGallery();
            }
          };

          // Hover previews the clip in place; clicking loads it into the player.
          card.onmouseenter = () => {
            if (!selected) card.style.borderColor = C.border;
            delBtn.style.display = "flex";
            vidBox.play().catch(() => {});
          };
          card.onmouseleave = () => {
            if (!selected) card.style.borderColor = "transparent";
            delBtn.style.display = "none";
            vidBox.pause();
            vidBox.currentTime = 0;
          };

          card.onclick = () => {
            galSelected = vid.filename;
            placeholder.style.display = "none";
            videoPlayer.style.display = "block";
            videoPlayer.src = vid.video_url;
            videoPlayer.load();
            videoPlayer.play().catch(() => {});
            closeOverlay(galleryOverlay);
          };

          card.append(vidBox, fnLabel, delBtn);
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

      // ── LONGEST SIDE SETTINGS MODAL OVERLAY (Screenshots 2 & 3) ──────────────
      const longestSideOverlay = mk("div", {
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100%",
        height: "100%",
        background: C.bg0,
        zIndex: "105",
        display: "none",
        flexDirection: "column",
        padding: "16px",
        boxSizing: "border-box",
        borderRadius: "12px",
        opacity: "0",
        transform: "translateY(6px)",
        transition: "opacity .22s, transform .22s",
        overflowY: "auto",
      });

      const lsOverlayHeader = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexShrink: "0" });
      lsOverlayHeader.appendChild(cap("Longest Side settings"));
      
      // SLEEK MINIMAL BRIGHT RED CLOSE BUTTON (Matching Setup option 1:1)
      const closeLsBtn = mk("button", {
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
      closeLsBtn.appendChild(svgIcon("close", 12, "#fff"));
      closeLsBtn.appendChild(document.createTextNode("Close"));

      closeLsBtn.onmouseover = () => (closeLsBtn.style.background = "#ff6666");
      closeLsBtn.onmouseout = () => (closeLsBtn.style.background = "#ff4444");
      closeLsBtn.onclick = (e) => {
        e.stopPropagation();
        closeOverlay(longestSideOverlay);
      };
      lsOverlayHeader.appendChild(closeLsBtn);
      longestSideOverlay.appendChild(lsOverlayHeader);

      const overlayBodyContainer = mk("div", { display: "flex", flexDirection: "column", gap: "10px", width: "100%", boxSizing: "border-box" });
      longestSideOverlay.appendChild(overlayBodyContainer);

      const renderLongestSideOverlay = () => {
        overlayBodyContainer.innerHTML = "";

        // Section 1: ROUND SIZES TO (Off, 8, 16, 32, 64)
        const sec1 = mk("div", { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" });
        sec1.appendChild(cap("ROUND SIZES TO"));
        const roundGroup = mk("div", { display: "flex", gap: "6px" });
        [0, 8, 16, 32, 64].forEach(val => {
          const isSelected = (S.step_round || 32) === val;
          const btn = mk("button", {
            flex: "1", padding: "6px 0", fontSize: "11px", fontWeight: "800",
            borderRadius: "4px", border: `1px solid ${isSelected ? LIME : C.border}`,
            background: isSelected ? LIME : C.bg2, color: isSelected ? "#111" : C.text,
            cursor: "pointer", outline: "none", transition: "all 0.12s ease"
          }, { textContent: val === 0 ? "Off" : String(val) });

          btn.onclick = (e) => {
            e.stopPropagation();
            S.step_round = val;
            lsBadge.textContent = val === 0 ? "Off" : `x${val}`;
            persist();
            renderLsTabs();
            renderLongestSideOverlay();
          };
          roundGroup.appendChild(btn);
        });
        sec1.appendChild(roundGroup);
        sec1.appendChild(mk("div", { fontSize: "10px", color: C.muted, marginTop: "2px" }, {
          textContent: "Most models want sizes in steps like these. This node only, and the small button on the node does the same thing."
        }));
        overlayBodyContainer.appendChild(sec1);

        // Section 2: SIZE TABS (864, 1024, 1216, 1344, 1536)
        const sec2 = mk("div", { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" });
        const sec2Hdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
        sec2Hdr.appendChild(cap("SIZE TABS"));
        const resetSizesBtn = mk("button", { background: "transparent", border: "none", color: C.muted, fontSize: "10px", fontWeight: "700", cursor: "pointer" }, { textContent: "reset" });
        resetSizesBtn.onclick = (e) => {
          e.stopPropagation();
          S.active_size_tabs = [864, 1024, 1216, 1344, 1536];
          persist();
          renderLsTabs();
          renderLongestSideOverlay();
        };
        sec2Hdr.appendChild(resetSizesBtn);
        sec2.appendChild(sec2Hdr);

        // These buttons pick which sizes appear on the node face - they are NOT
        // the chosen size. Selecting here used to overwrite S.longest_side, so
        // curating the row silently changed the generated resolution.
        const ALL_SIZE_TABS = [864, 1024, 1216, 1344, 1536, 1728, 1920, 2048];
        const MAX_ROW = 5;
        const sizeTabsGrid = mk("div", { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" });
        ALL_SIZE_TABS.forEach(sizeVal => {
          const active = (S.active_size_tabs || []).includes(sizeVal);
          const btn = mk("button", {
            padding: "8px", fontSize: "12px", fontWeight: "800", borderRadius: "6px",
            border: `1px solid ${active ? LIME : C.border}`, background: active ? LIME : C.bg2,
            color: active ? "#111" : C.text, cursor: "pointer", transition: "all 0.12s ease"
          }, { textContent: String(sizeVal) });

          btn.onclick = (e) => {
            e.stopPropagation();
            const list = (S.active_size_tabs || []).slice();
            const at = list.indexOf(sizeVal);
            if (at >= 0) {
              if (list.length <= 1) return;      // never empty the row
              list.splice(at, 1);
            } else {
              if (list.length >= MAX_ROW) return; // row is full
              list.push(sizeVal);
              list.sort((a, b) => a - b);
            }
            S.active_size_tabs = list;
            // Keep the chosen size on the row, otherwise nothing looks selected.
            if (!list.includes(S.longest_side)) {
              S.longest_side = list[0];
              lsTitleLbl.textContent = `${list[0]} long side`;
            }
            persist();
            renderLsTabs();
            renderLongestSideOverlay();
          };
          sizeTabsGrid.appendChild(btn);
        });
        sec2.appendChild(sizeTabsGrid);
        sec2.appendChild(mk("div", { fontSize: "10px", color: C.muted, marginTop: "2px" }, {
          textContent: (S.active_size_tabs || []).length >= MAX_ROW
            ? "The row is full. Click one that is on to take it off, then add another."
            : "Pick up to 5 to show on the node. Choose the size itself on the node row."
        }));
        overlayBodyContainer.appendChild(sec2);

        // Section 3: SHAPE CHIPS (Aspect Ratios)
        const sec3 = mk("div", { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" });
        const sec3Hdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center" });
        sec3Hdr.appendChild(cap("SHAPE CHIPS"));
        const resetChipsBtn = mk("button", { background: "transparent", border: "none", color: C.muted, fontSize: "10px", fontWeight: "700", cursor: "pointer" }, { textContent: "reset" });
        resetChipsBtn.onclick = (e) => {
          e.stopPropagation();
          S.active_shape_chips = ["keep", "1:1", "16:9", "9:16", "2:3"];
          if (!S.active_shape_chips.includes(S.aspect_ratio)) S.aspect_ratio = "keep";
          persist();
          renderShapeChips();
          renderLongestSideOverlay();
        };
        sec3Hdr.appendChild(resetChipsBtn);
        sec3.appendChild(sec3Hdr);

        // Same as SIZE TABS: this picks which shapes appear on the node face,
        // it does not choose the ratio. Clicking here used to set S.aspect_ratio,
        // which is how a "keep" workflow ended up cropping to 1:1.
        const shapeGrid = mk("div", { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" });
        ["keep", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9", "9:21", "2:1", "1:2"].forEach(chip => {
          const active = (S.active_shape_chips || []).includes(chip);
          const btn = mk("button", {
            padding: "6px 2px", fontSize: "10px", fontWeight: "700", borderRadius: "4px",
            border: `1px solid ${active ? LIME : C.border}`, background: active ? LIME : C.bg2,
            color: active ? "#111" : C.text, cursor: "pointer", textAlign: "center",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px"
          });

          const chipIcon = createAspectIcon(chip, active);
          btn.append(chipIcon, document.createTextNode(chip));

          btn.onclick = (e) => {
            e.stopPropagation();
            const list = (S.active_shape_chips || []).slice();
            const at = list.indexOf(chip);
            if (at >= 0) {
              if (list.length <= 1) return;
              list.splice(at, 1);
            } else {
              if (list.length >= MAX_ROW) return;
              list.push(chip);
            }
            S.active_shape_chips = list;
            if (!list.includes(S.aspect_ratio)) S.aspect_ratio = list[0];
            persist();
            renderShapeChips();
            renderLongestSideOverlay();
          };
          shapeGrid.appendChild(btn);
        });
        sec3.appendChild(shapeGrid);
        sec3.appendChild(mk("div", { fontSize: "10px", color: C.muted, marginTop: "2px" }, {
          textContent: (S.active_shape_chips || []).length >= MAX_ROW
            ? "The row is full. Click one that is on to take it off, then add another."
            : "Pick up to 5 to show on the node. Choose the shape itself on the node row."
        }));
        overlayBodyContainer.appendChild(sec3);

        // Section 3b: UPSCALING (Pixaroma parity - affects the real output size)
        const sec3b = mk("div", { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" });
        sec3b.appendChild(cap("UPSCALING"));
        const upRow = mk("div", { display: "flex", gap: "8px", alignItems: "center", cursor: "pointer" });
        const upBox = mk("div", {
          width: "16px", height: "16px", borderRadius: "3px", flexShrink: "0",
          border: `1px solid ${S.upscale_small ? LIME : C.border}`,
          background: S.upscale_small ? LIME : C.bg2,
        });
        upRow.append(upBox, mk("div", { fontSize: "11px", color: C.text }, {
          textContent: "Let small pictures grow to the size above."
        }));
        upRow.onclick = (e) => {
          e.stopPropagation();
          S.upscale_small = !S.upscale_small;
          persist();
          renderLongestSideOverlay();
        };
        sec3b.appendChild(upRow);
        overlayBodyContainer.appendChild(sec3b);

        // Section 4: CROP FROM (3x3 Grid)
        const sec4 = mk("div", { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" });
        sec4.appendChild(cap("CROP FROM"));
        const cropRow = mk("div", { display: "flex", gap: "12px", alignItems: "center" });
        const cropGrid = mk("div", { display: "grid", gridTemplateColumns: "repeat(3, 24px)", gap: "3px", background: "#111", padding: "3px", borderRadius: "6px", border: `1px solid ${C.border}` });
        const alignments = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"];
        alignments.forEach(align => {
          const isSelected = (S.crop_from || "center") === align;
          const cell = mk("div", {
            width: "24px", height: "24px", background: isSelected ? LIME : "#222",
            borderRadius: "3px", cursor: "pointer", transition: "all 0.12s ease"
          });

          cell.onclick = (e) => {
            e.stopPropagation();
            S.crop_from = align;
            persist();
            renderLongestSideOverlay();
          };
          cropGrid.appendChild(cell);
        });
        cropRow.append(cropGrid, mk("div", { fontSize: "10px", color: C.muted }, { textContent: "Which part of the picture to keep when a shape crops it." }));
        sec4.appendChild(cropRow);
        overlayBodyContainer.appendChild(sec4);

        // Section 5: RESAMPLE (auto, lanczos, bicubic, bilinear, nearest)
        const sec5 = mk("div", { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" });
        sec5.appendChild(cap("RESAMPLE"));
        const resampleGroup = mk("div", { display: "flex", gap: "4px" });
        ["auto", "lanczos", "bicubic", "bilinear", "nearest"].forEach(resMode => {
          const isSelected = (S.resample_mode || "auto") === resMode;
          const btn = mk("button", {
            flex: "1", padding: "5px 0", fontSize: "10px", fontWeight: "700", borderRadius: "4px",
            border: `1px solid ${isSelected ? LIME : C.border}`, background: isSelected ? LIME : C.bg2,
            color: isSelected ? "#111" : C.text, cursor: "pointer"
          }, { textContent: resMode });

          btn.onclick = (e) => {
            e.stopPropagation();
            S.resample_mode = resMode;
            persist();
            renderLongestSideOverlay();
          };
          resampleGroup.appendChild(btn);
        });
        sec5.appendChild(resampleGroup);
        overlayBodyContainer.appendChild(sec5);
      };

      renderLongestSideOverlay();
      root.appendChild(longestSideOverlay);

      // ── AUDIO WAVEFORM & CROP EDITOR OVERLAY ────────────────────────────
      const audioEditorOverlay = mk("div", {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: "99999",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      });

      const audioEditorContainer = mk("div", {
        width: "660px",
        background: C.bg0,
        border: `1px solid ${LIME}`,
        borderRadius: "12px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,255,102,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      });

      const aeHeader = mk("div", {
        padding: "14px 18px",
        background: C.bg2,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      });

      const aeTitleGroup = mk("div", { display: "flex", alignItems: "center", gap: "8px" });
      const aeTitleIcon = svgIcon("music", 16, LIME);
      const aeTitleText = mk("span", { fontSize: "14px", fontWeight: "900", color: "#fff", letterSpacing: ".05em" }, { textContent: "Audio Waveform & Crop Editor" });
      aeTitleGroup.append(aeTitleIcon, aeTitleText);

      const aeCloseBtn = mk("button", {
        padding: "6px 12px",
        fontSize: "11px",
        fontWeight: "700",
        background: "#ff4444",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.15s ease",
      });
      aeCloseBtn.append(svgIcon("close", 12, "#fff"), document.createTextNode("Close"));

      aeHeader.append(aeTitleGroup, aeCloseBtn);

      const aeBody = mk("div", {
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxSizing: "border-box",
      });

      const aeInfoBar = mk("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: C.bg2,
        padding: "8px 12px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
        fontSize: "11px",
        fontWeight: "700",
      });
      const aeFileNameLbl = mk("span", { color: LIME, maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
      const aeDurationBadge = mk("span", { color: C.text });
      aeInfoBar.append(aeFileNameLbl, aeDurationBadge);

      // Timeline Stretch & Zoom Control Bar
      const aeZoomBar = mk("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: C.bg2,
        padding: "6px 12px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
      });

      const aeZoomLabelGroup = mk("div", { display: "flex", alignItems: "center", gap: "6px" });
      const aeZoomTitle = mk("span", { fontSize: "11px", fontWeight: "800", color: C.text }, { textContent: "TIMELINE STRETCH / ZOOM" });
      const aeZoomLevelBadge = mk("span", { fontSize: "11px", fontWeight: "800", color: LIME }, { textContent: "1.0x" });
      aeZoomLabelGroup.append(aeZoomTitle, aeZoomLevelBadge);

      const aeZoomPillsGroup = mk("div", { display: "flex", gap: "4px", alignItems: "center" });

      const zoom1x = mk("button", { padding: "3px 7px", fontSize: "10px", fontWeight: "700", borderRadius: "4px", border: `1px solid ${C.border}`, background: C.bg1, color: C.text, cursor: "pointer" }, { textContent: "1x (Full)" });
      const zoom2x = mk("button", { padding: "3px 7px", fontSize: "10px", fontWeight: "700", borderRadius: "4px", border: `1px solid ${C.border}`, background: C.bg1, color: C.text, cursor: "pointer" }, { textContent: "2x" });
      const zoom5x = mk("button", { padding: "3px 7px", fontSize: "10px", fontWeight: "700", borderRadius: "4px", border: `1px solid ${C.border}`, background: C.bg1, color: C.text, cursor: "pointer" }, { textContent: "5x" });
      const zoom10x = mk("button", { padding: "3px 7px", fontSize: "10px", fontWeight: "700", borderRadius: "4px", border: `1px solid ${C.border}`, background: C.bg1, color: C.text, cursor: "pointer" }, { textContent: "10x" });
      const fitSelectionBtn = mk("button", { padding: "3px 9px", fontSize: "10px", fontWeight: "800", borderRadius: "4px", border: `1px solid ${LIME}`, background: C.bg1, color: LIME, cursor: "pointer" }, { textContent: "🔍 Fit Selection" });

      aeZoomPillsGroup.append(zoom1x, zoom2x, zoom5x, zoom10x, fitSelectionBtn);
      aeZoomBar.append(aeZoomLabelGroup, aeZoomPillsGroup);

      const aeCanvasBox = mk("div", {
        position: "relative",
        width: "100%",
        height: "130px",
        background: C.bg1,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const aeCanvas = mk("canvas", { width: "624", height: "130", style: "width: 100%; height: 100%; display: block;" });
      aeCanvasBox.appendChild(aeCanvas);

      const aeControlsGrid = mk("div", {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: C.bg2,
        padding: "12px",
        borderRadius: "6px",
        border: `1px solid ${C.border}`,
      });

      // 1. Crop Start Position Slider
      const startBox = mk("div", { display: "flex", flexDirection: "column", gap: "4px" });
      const startHdr = mk("div", { display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "800", color: C.text });
      const startValLbl = mk("span", { color: LIME }, { textContent: "0.0s" });
      startHdr.append(document.createTextNode("CROP START POSITION"), startValLbl);
      const startSlider = mk("input", { type: "range", min: "0", max: "100", step: "0.1", value: "0", style: "width: 100%; cursor: pointer;" });
      startBox.append(startHdr, startSlider);

      // 2. Crop Length / Duration Selector
      const lenBox = mk("div", { display: "flex", flexDirection: "column", gap: "6px" });
      const lenHdr = mk("div", { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: "800", color: C.text });
      const lenValLbl = mk("span", { color: LIME }, { textContent: "4.0s" });
      lenHdr.append(document.createTextNode("CROP DURATION / LENGTH"), lenValLbl);

      const lenPillsRow = mk("div", { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" });

      const createLenPill = (label, valSec) => {
        const btn = mk("button", {
          padding: "4px 8px", fontSize: "10px", fontWeight: "700", borderRadius: "4px",
          border: `1px solid ${C.border}`, background: C.bg1, color: C.text, cursor: "pointer",
          transition: "all 0.12s ease"
        }, { textContent: label });
        btn.onclick = (e) => {
          e.stopPropagation();
          setCropLength(valSec);
        };
        return btn;
      };

      const matchVideoBtn = createLenPill(`Match Video (${S.duration || 4}s)`, parseFloat(S.duration) || 4.0);
      const pill5s = createLenPill("5.0s", 5.0);
      const pill10s = createLenPill("10.0s", 10.0);
      const pillFull = createLenPill("Full Audio", null);

      const lenNumInput = mk("input", {
        type: "number", min: "0.5", max: "600", step: "0.1", value: "4.0",
        style: "width: 65px; padding: 3px 6px; font-size: 11px; font-weight: 800; background: #111; color: #00ff66; border: 1px solid #2a2a2a; border-radius: 4px; text-align: center; outline: none;"
      });

      lenPillsRow.append(matchVideoBtn, pill5s, pill10s, pillFull, mk("span", { fontSize: "10px", color: C.muted }, { textContent: "Custom (sec):" }), lenNumInput);
      lenBox.append(lenHdr, lenPillsRow);

      aeControlsGrid.append(startBox, lenBox);
      aeBody.append(aeInfoBar, aeZoomBar, aeCanvasBox, aeControlsGrid);

      const aeFooter = mk("div", {
        padding: "12px 18px",
        background: C.bg2,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      });

      const aeLeftActions = mk("div", { display: "flex", gap: "8px" });

      const aePlayBtn = mk("button", {
        padding: "8px 14px", fontSize: "12px", fontWeight: "800",
        background: C.bg1, color: LIME, border: `1px solid ${LIME}`, borderRadius: "6px",
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px"
      });
      const aePlayIcon = svgIcon("play", 13, LIME);
      aePlayBtn.append(aePlayIcon, document.createTextNode("Play Selection"));

      const aeResetBtn = mk("button", {
        padding: "8px 14px", fontSize: "12px", fontWeight: "700",
        background: C.bg1, color: C.text, border: `1px solid ${C.border}`, borderRadius: "6px",
        cursor: "pointer"
      }, { textContent: "↺ Reset" });

      aeLeftActions.append(aePlayBtn, aeResetBtn);

      const aeApplyBtn = mk("button", {
        padding: "8px 18px", fontSize: "13px", fontWeight: "900",
        background: LIME_GRAD, color: "#111", border: "none", borderRadius: "6px",
        cursor: "pointer", boxShadow: "0 4px 14px rgba(0, 255, 102, 0.3)",
        display: "inline-flex", alignItems: "center", gap: "6px"
      });
      aeApplyBtn.append(svgIcon("check", 14, "#111"), document.createTextNode("Apply Crop"));

      aeFooter.append(aeLeftActions, aeApplyBtn);
      audioEditorContainer.append(aeHeader, aeBody, aeFooter);
      audioEditorOverlay.appendChild(audioEditorContainer);
      document.body.appendChild(audioEditorOverlay);

      let currentAudioBuffer = null;
      let currentRawAudioFile = null;
      let previewAudioCtx = null;
      let previewSourceNode = null;

      // Zoom & Viewport Offset State
      let zoomLevel = 1.0;
      let viewOffset = 0.0;

      // Mouse Drag State for Waveform Bracket Handles & Pan
      let activeDragMode = null; // "left", "right", "center", "pan"
      let dragStartMouseX = 0;
      let dragStartSt = 0;
      let dragStartViewOffset = 0;

      const setZoomLevel = (lvl) => {
        zoomLevel = Math.max(1.0, Math.min(50.0, lvl));
        aeZoomLevelBadge.textContent = `${zoomLevel.toFixed(1)}x`;
        if (currentAudioBuffer) {
          const totalDur = currentAudioBuffer.duration;
          const visibleDur = totalDur / zoomLevel;
          let st = parseFloat(startSlider.value) || 0;
          viewOffset = Math.max(0, Math.min(totalDur - visibleDur, st - visibleDur * 0.15));
        }
        updateCropView();
      };

      const fitSelectionToView = () => {
        if (!currentAudioBuffer) return;
        const totalDur = currentAudioBuffer.duration;
        let cropLen = parseFloat(lenNumInput.value) || 4.0;
        let st = parseFloat(startSlider.value) || 0;
        const desiredVisibleDur = Math.max(cropLen * 1.6, 3.0);
        zoomLevel = Math.max(1.0, Math.min(50.0, totalDur / desiredVisibleDur));
        viewOffset = Math.max(0, Math.min(totalDur - desiredVisibleDur, st - cropLen * 0.3));
        aeZoomLevelBadge.textContent = `${zoomLevel.toFixed(1)}x`;
        updateCropView();
      };

      zoom1x.onclick = (e) => { e.stopPropagation(); setZoomLevel(1.0); };
      zoom2x.onclick = (e) => { e.stopPropagation(); setZoomLevel(2.0); };
      zoom5x.onclick = (e) => { e.stopPropagation(); setZoomLevel(5.0); };
      zoom10x.onclick = (e) => { e.stopPropagation(); setZoomLevel(10.0); };
      fitSelectionBtn.onclick = (e) => { e.stopPropagation(); fitSelectionToView(); };

      const setCropLength = (valSec) => {
        const totalDur = currentAudioBuffer ? currentAudioBuffer.duration : 100;
        let targetL = valSec == null ? totalDur : valSec;
        targetL = Math.min(totalDur, Math.max(0.5, targetL));
        lenNumInput.value = targetL.toFixed(1);
        updateCropView();
      };

      const updateCropView = () => {
        if (!currentAudioBuffer) return;
        const totalDur = currentAudioBuffer.duration;
        let cropLen = parseFloat(lenNumInput.value) || 4.0;
        cropLen = Math.min(totalDur, Math.max(0.5, cropLen));

        startSlider.max = Math.max(0, totalDur - cropLen).toFixed(1);
        let st = parseFloat(startSlider.value) || 0;
        if (st > totalDur - cropLen) {
          st = Math.max(0, totalDur - cropLen);
          startSlider.value = st.toFixed(1);
        }
        const et = Math.min(totalDur, st + cropLen);

        startValLbl.textContent = `${st.toFixed(1)}s`;
        lenValLbl.textContent = `${(et - st).toFixed(1)}s (Range: ${st.toFixed(1)}s ──► ${et.toFixed(1)}s)`;

        drawAudioWaveform(aeCanvas, currentAudioBuffer, st, et, zoomLevel, viewOffset);
      };

      // Canvas Time Conversion Helpers
      const getCanvasTimeFromMouse = (e) => {
        const rect = aeCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const width = rect.width || aeCanvas.width;
        const duration = currentAudioBuffer ? currentAudioBuffer.duration : 1;
        const visibleDuration = duration / Math.max(1.0, zoomLevel);
        const vStart = Math.max(0, Math.min(duration - visibleDuration, viewOffset));
        return Math.max(0, Math.min(duration, vStart + (mouseX / width) * visibleDuration));
      };

      // Mouse Wheel Pan / Scroll & Zoom
      aeCanvas.onwheel = (e) => {
        e.preventDefault();
        if (!currentAudioBuffer) return;
        const duration = currentAudioBuffer.duration;
        const visibleDur = duration / Math.max(1.0, zoomLevel);

        if (e.ctrlKey || e.metaKey) {
          // Zoom In / Out with Ctrl + Scroll
          const zoomDelta = e.deltaY < 0 ? 1.25 : 0.8;
          setZoomLevel(zoomLevel * zoomDelta);
        } else {
          // Pan Viewport Horizontally with Scroll
          const panSens = (visibleDur / aeCanvas.width) * 2.5;
          const deltaSec = (e.deltaX || e.deltaY) * panSens;
          viewOffset = Math.max(0, Math.min(duration - visibleDur, viewOffset + deltaSec));
          updateCropView();
        }
      };

      aeCanvas.onmousedown = (e) => {
        if (!currentAudioBuffer) return;
        const duration = currentAudioBuffer.duration;
        const visibleDuration = duration / Math.max(1.0, zoomLevel);
        const vStart = Math.max(0, Math.min(duration - visibleDuration, viewOffset));

        const rect = aeCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const width = rect.width || aeCanvas.width;

        let st = parseFloat(startSlider.value) || 0;
        let cropLen = parseFloat(lenNumInput.value) || 4.0;
        let et = Math.min(duration, st + cropLen);

        const startX = ((st - vStart) / visibleDuration) * width;
        const endX = ((et - vStart) / visibleDuration) * width;

        const handleThreshold = 14;

        if (Math.abs(mouseX - startX) <= handleThreshold) {
          activeDragMode = "left";
        } else if (Math.abs(mouseX - endX) <= handleThreshold) {
          activeDragMode = "right";
        } else if (mouseX >= startX && mouseX <= endX) {
          activeDragMode = "center";
          dragStartMouseX = mouseX;
          dragStartSt = st;
        } else {
          // Jump Start Position to click position
          const clickTime = getCanvasTimeFromMouse(e);
          let newSt = Math.min(duration - cropLen, clickTime);
          startSlider.value = newSt.toFixed(1);
          activeDragMode = "center";
          dragStartMouseX = mouseX;
          dragStartSt = newSt;
          updateCropView();
        }
      };

      window.addEventListener("mousemove", (e) => {
        if (!activeDragMode || !currentAudioBuffer || audioEditorOverlay.style.display === "none") return;
        const duration = currentAudioBuffer.duration;
        const visibleDuration = duration / Math.max(1.0, zoomLevel);
        const vStart = Math.max(0, Math.min(duration - visibleDuration, viewOffset));

        const rect = aeCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const width = rect.width || aeCanvas.width;

        let st = parseFloat(startSlider.value) || 0;
        let cropLen = parseFloat(lenNumInput.value) || 4.0;
        let et = Math.min(duration, st + cropLen);

        if (activeDragMode === "left") {
          const clickTime = getCanvasTimeFromMouse(e);
          const newSt = Math.min(et - 0.5, clickTime);
          const newLen = et - newSt;
          startSlider.value = newSt.toFixed(1);
          lenNumInput.value = newLen.toFixed(1);
          updateCropView();
        } else if (activeDragMode === "right") {
          const clickTime = getCanvasTimeFromMouse(e);
          const newEt = Math.max(st + 0.5, clickTime);
          const newLen = newEt - st;
          lenNumInput.value = newLen.toFixed(1);
          updateCropView();
        } else if (activeDragMode === "center") {
          const deltaX = mouseX - dragStartMouseX;
          const deltaTime = (deltaX / width) * visibleDuration;
          let newSt = Math.max(0, Math.min(duration - cropLen, dragStartSt + deltaTime));
          startSlider.value = newSt.toFixed(1);
          updateCropView();
        }
      });

      window.addEventListener("mouseup", () => {
        activeDragMode = null;
      });

      let currentOnCropSuccess = null;

      const openAudioEditor = async (params) => {
        let file = params;
        let fileName = "";
        if (params && typeof params === "object" && params.file) {
          file = params.file;
          fileName = params.fileName || file.name;
          currentOnCropSuccess = params.onCropSuccess || null;
        } else {
          fileName = arguments[1] || (file ? file.name : "");
          currentOnCropSuccess = null;
        }

        currentRawAudioFile = file;
        aeFileNameLbl.textContent = fileName || (file ? file.name : "audio_file.wav");
        openOverlay(audioEditorOverlay);

        try {
          const arrayBuffer = await file.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          currentAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

          const totalDur = currentAudioBuffer.duration;
          const initialCropLen = Math.min(totalDur, parseFloat(S.duration) || 4.0);

          aeDurationBadge.textContent = `Total Length: ${totalDur.toFixed(1)}s | Video Target: ${parseFloat(S.duration) || 4.0}s`;

          startSlider.max = Math.max(0, totalDur - initialCropLen).toFixed(1);
          startSlider.value = "0";
          lenNumInput.value = initialCropLen.toFixed(1);

          updateCropView();

          startSlider.oninput = updateCropView;
          lenNumInput.oninput = updateCropView;

          aeResetBtn.onclick = () => {
            startSlider.value = "0";
            lenNumInput.value = Math.min(totalDur, parseFloat(S.duration) || 4.0).toFixed(1);
            updateCropView();
          };

          let isPlayingSelection = false;
          aePlayBtn.onclick = () => {
            if (isPlayingSelection && previewSourceNode) {
              try { previewSourceNode.stop(); } catch(e){}
              isPlayingSelection = false;
              aePlayBtn.style.background = C.bg1;
              aePlayBtn.style.color = LIME;
              aePlayIcon.setAttribute("stroke", LIME);
              aePlayBtn.lastChild.textContent = "Play Selection";
              return;
            }

            const st = parseFloat(startSlider.value) || 0;
            const cropLen = parseFloat(lenNumInput.value) || 4.0;
            const et = Math.min(totalDur, st + cropLen);
            const dur = et - st;

            if (previewAudioCtx) previewAudioCtx.close();
            previewAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            previewSourceNode = previewAudioCtx.createBufferSource();
            previewSourceNode.buffer = currentAudioBuffer;
            previewSourceNode.connect(previewAudioCtx.destination);
            previewSourceNode.start(0, st, dur);

            isPlayingSelection = true;
            aePlayBtn.style.background = LIME;
            aePlayBtn.style.color = "#111";
            aePlayIcon.setAttribute("stroke", "#111");
            aePlayBtn.lastChild.textContent = "Stop";

            previewSourceNode.onended = () => {
              isPlayingSelection = false;
              aePlayBtn.style.background = C.bg1;
              aePlayBtn.style.color = LIME;
              aePlayIcon.setAttribute("stroke", LIME);
              aePlayBtn.lastChild.textContent = "Play Selection";
            };
          };

          aeApplyBtn.onclick = async () => {
            const st = parseFloat(startSlider.value) || 0;
            const cropLen = parseFloat(lenNumInput.value) || 4.0;
            const et = Math.min(totalDur, st + cropLen);

            aeApplyBtn.disabled = true;
            aeApplyBtn.lastChild.textContent = "Cropping...";

            try {
              const croppedBlob = await audioBufferToWavBlob(currentAudioBuffer, st, et);
              const croppedFile = new File([croppedBlob], `cropped_${fileName || "audio.wav"}`, { type: "audio/wav" });

              const formData = new FormData();
              formData.append("image", croppedFile);
              formData.append("overwrite", "true");

              const res = await fetch("/upload/image", { method: "POST", body: formData });
              const data = await res.json();
              const serverFileName = data.name || croppedFile.name;
              const objectUrl = URL.createObjectURL(croppedBlob);

              if (currentOnCropSuccess) {
                currentOnCropSuccess(serverFileName, objectUrl, croppedFile, (et - st).toFixed(1));
              }

              if (previewSourceNode) try { previewSourceNode.stop(); } catch(e){}
              closeOverlay(audioEditorOverlay);
            } catch (err) {
              console.error("Failed to crop audio:", err);
              alert("Audio crop failed: " + (err.message || err));
            } finally {
              aeApplyBtn.disabled = false;
              aeApplyBtn.lastChild.textContent = "Apply Crop";
            }
          };

        } catch (e) {
          console.error("Failed to load audio buffer for waveform rendering:", e);
        }
      };

      aeCloseBtn.onclick = () => {
        if (previewSourceNode) try { previewSourceNode.stop(); } catch(e){}
        closeOverlay(audioEditorOverlay);
      };

      lsGearBtnGroup.onclick = (e) => {
        e.stopPropagation();
        renderLongestSideOverlay();
        openOverlay(longestSideOverlay);
      };

      // Mode Switcher logic with Vector Icon state updates
      function setMode(m) {
        S.mode = m;
        persist();

        if (typeof isHelpDrawerOpen !== "undefined" && isHelpDrawerOpen) toggleHelpDrawer(false);
        if (typeof isSetupDrawerOpen !== "undefined" && isSetupDrawerOpen) toggleSetupDrawer(false);

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
          orientSizeBox.style.display = "flex";
          longestSideBox.style.display = "none";
          slotCard.style.display = "none";
        } else if (m === "I2V") {
          orientSizeBox.style.display = "none";
          longestSideBox.style.display = "flex";
          slotCard.style.display = "flex";
          r2vSwitchRow.style.display = "none";
          box1HeaderLbl.textContent = "START FRAME";
          box2Img.style.display = "flex";
          box2Audio.style.display = "none";
        } else if (m === "R2V") {
          orientSizeBox.style.display = "none";
          longestSideBox.style.display = "flex";
          slotCard.style.display = "flex";
          r2vSwitchRow.style.display = "flex";
          updateR2vSwitch(S.r2v_type === "SING" ? "SING" : "SPEAK");
          box1HeaderLbl.textContent = "REF IMAGE";
          box2Img.style.display = "none";
          box2Audio.style.display = "flex";
        }

        self.setSize([NODE_W, NODE_H + 50]);
        if (self.graph) self.setDirtyCanvas(true, true);
      }

      setMode(S.mode);

      // Generate Action Handler
      let activePromptId = null;
      let ourRunActive = false;
      genBtn.onclick = async () => {
        let activeWorkflowMode = S.mode;
        if (S.mode === "I2V") {
          if (imgData1 && imgData2) {
            activeWorkflowMode = "image_to_video_fflf";
          } else {
            activeWorkflowMode = "image_to_video";
          }
        } else if (S.mode === "R2V") {
          if (S.r2v_type === "SING") {
            activeWorkflowMode = "reference_to_video_sing";
          } else {
            activeWorkflowMode = "reference_to_video";
          }
        }

        const report = await checkSystemValidation(activeWorkflowMode);
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

        ourRunActive = true;
        try {
          const queued = await executePixaromaWorkflow(activeWorkflowMode, {
            prompt: S.prompt,
            negative_prompt: S.negativePrompt,
            duration: S.duration,
            fps: S.fps,
            cfg: S.cfg,
            seed: S.seed,
            loras: S.loras,
            width: S.width,
            height: S.height,
            longest_side: S.longest_side,
            aspect_ratio: S.aspect_ratio,
            step_round: S.step_round,
            auto_save: S.autoSave,
            crop_from: S.crop_from,
            upscale_small: S.upscale_small,
            resample_mode: S.resample_mode,
            image_name_1: imgData1 ? imgData1.name : null,
            image_name_2: imgData2 ? imgData2.name : null,
            audio_name: audioData ? audioData.name : null,
          }, statusLabel, progressBarInner);
          activePromptId = (queued && queued.prompt_id) || null;
          pollRunUntilDone(activePromptId);
        } catch (err) {
          ourRunActive = false;
          genBtn.disabled = false;
          genBtn.innerHTML = "";
          genBtn.appendChild(svgIcon("play", 16, "#111"));
          genBtn.appendChild(document.createTextNode("Generate"));

          tx(statusLabel, `Error: ${err.message}`);
          statusLabel.style.color = C.err;
        }
      };

      const handleExecutionError = (e) => {
        if (!isOurs(e && e.detail)) return;
        ourRunActive = false;
        genBtn.disabled = false;
        genBtn.innerHTML = "";
        genBtn.appendChild(svgIcon("play", 16, "#111"));
        genBtn.appendChild(document.createTextNode("Generate"));

        statusRow.style.display = "flex";
        let detailMsg = "Execution failed";
        let nodeType = "";
        if (e && e.detail) {
          detailMsg = e.detail.exception_message || e.detail.message || e.detail.error || (typeof e.detail === "string" ? e.detail : JSON.stringify(e.detail));
          if (e.detail.node_type) nodeType = ` [${e.detail.node_type}]`;
        }
        tx(statusLabel, `Error${nodeType}: ${detailMsg}`);
        statusLabel.style.color = C.err;
      };

      api.addEventListener("execution_start", (e) => {
        if (!ourRunActive) return;
        statusRow.style.display = "flex";
        tx(statusLabel, "Executing workflow...");
        statusLabel.style.color = C.text;
        progressBarInner.style.width = "20%";
      });

      api.addEventListener("execution_error", handleExecutionError);
      api.addEventListener("exec_error", handleExecutionError);
      api.addEventListener("execution_interrupted", handleExecutionError);

      api.addEventListener("progress", (e) => {
        if (!ourRunActive) return;
        if (e.detail && e.detail.max) {
          const pct = Math.round((e.detail.value / e.detail.max) * 100);
          tx(statusLabel, `Rendering frame ${e.detail.value}/${e.detail.max}`);
          statusLabel.style.color = C.text;
          progressBarInner.style.width = `${pct}%`;
        }
      });

      // PixaromaSaveMp4 does not publish its result under the conventional
      // gifs/images/videos UI keys, so scan every list in the output dict for
      // something that looks like a playable video file.
      const VIDEO_EXT = /\.(mp4|webm|mov|m4v|mkv)$/i;
      const findVideoItem = (out) => {
        if (!out || typeof out !== "object") return null;
        for (const val of Object.values(out)) {
          const list = Array.isArray(val) ? val : [val];
          for (const item of list) {
            if (item && typeof item === "object" && typeof item.filename === "string" && VIDEO_EXT.test(item.filename)) {
              return item;
            }
          }
        }
        return null;
      };

      const playVideoItem = (item) => {
        if (!item) return false;
        const fn = encodeURIComponent(item.filename || "");
        const sf = encodeURIComponent(item.subfolder || "");
        const tp = encodeURIComponent(item.type || "output");
        const url = api.apiURL(`/view?filename=${fn}&subfolder=${sf}&type=${tp}`);

        placeholder.style.display = "none";
        videoPlayer.style.display = "block";
        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.play().catch(() => {});
        return true;
      };

      // Fallback: the mp4 is written after the UI event in some Pixaroma
      // versions, so poll /history for the finished prompt.
      const playFromHistory = async (promptId, attempt = 0) => {
        if (!promptId) return;
        try {
          const res = await api.fetchApi(`/history/${promptId}`);
          if (res && res.ok) {
            const hist = await res.json();
            const entry = hist[promptId];
            const outputs = (entry && entry.outputs) || {};
            for (const nodeOut of Object.values(outputs)) {
              if (playVideoItem(findVideoItem(nodeOut))) return;
            }
          }
        } catch (err) {
          console.warn("[MinimaxH3] history lookup failed:", err);
        }
        if (attempt < 10) setTimeout(() => playFromHistory(promptId, attempt + 1), 1000);
      };

      // ComfyUI broadcasts execution events for every prompt, including ones
      // queued from another tab or the Run button. Without this the node shows
      // "Generating..." and a progress bar for somebody else's run, which makes
      // a failed job here look like a successful one.
      const isOurs = (detail) => {
        const pid = detail && detail.prompt_id;
        if (!pid || !activePromptId) return true;   // can't tell - assume ours
        return pid === activePromptId;
      };

      const resetGenerateButton = () => {
        genBtn.disabled = false;
        genBtn.innerHTML = "";
        genBtn.appendChild(svgIcon("play", 16, "#111"));
        genBtn.appendChild(document.createTextNode("Generate"));
      };

      // Record what produced the clip, so Gallery cards can show it later.
      const writeSidecar = async (item) => {
        if (!item || !S.autoSave) return;
        try {
          await fetch("/minimax_h3/save_meta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: item.filename,
              metadata: {
                prompt: S.prompt || "",
                mode: S.mode,
                width: S.width, height: S.height,
                longest_side: S.longest_side, aspect_ratio: S.aspect_ratio,
                duration: S.duration, fps: S.fps,
                cfg: S.cfg, seed: S.seed,
                created: new Date().toISOString(),
              },
            }),
          });
        } catch (e) { /* the video is saved either way */ }
      };

      const finishRun = (item, promptId) => {
        if (!ourRunActive) return;   // already finished by whichever got here first
        ourRunActive = false;
        resetGenerateButton();

        tx(statusLabel, S.autoSave ? "Generation Complete - saved to Gallery" : "Generation Complete!");
        statusLabel.style.color = LIME;
        progressBarInner.style.width = "100%";
        playDone();

        if (!playVideoItem(item)) playFromHistory(promptId || activePromptId);
        writeSidecar(item);
      };

      const handleExecutedEvent = (e) => {
        if (!isOurs(e && e.detail)) return;
        const detail = (e && e.detail) || {};
        finishRun(findVideoItem(detail.output), detail.prompt_id);
      };

      api.addEventListener("executed", handleExecutedEvent);
      api.addEventListener("execution_success", handleExecutedEvent);

      // Websocket events are not a reliable completion signal: they can be
      // missed on reconnect, and a run queued from another tab is filtered out
      // by design, which would otherwise leave this node stuck on
      // "Generating..." forever. Poll our own prompt in /history as a backstop.
      const pollRunUntilDone = async (promptId) => {
        if (!promptId) return;
        for (let i = 0; i < 1200 && ourRunActive; i++) {
          await new Promise(r => setTimeout(r, 2000));
          if (!ourRunActive) return;
          try {
            const res = await api.fetchApi(`/history/${promptId}`);
            if (!res || !res.ok) continue;
            const entry = (await res.json())[promptId];
            if (!entry) continue;   // still queued or running

            const status = entry.status || {};
            if (status.status_str === "error") {
              ourRunActive = false;
              resetGenerateButton();
              const msgs = (status.messages || [])
                .filter(msg => msg[0] === "execution_error")
                .map(msg => (msg[1] || {}).exception_message)
                .filter(Boolean);
              tx(statusLabel, `Error: ${msgs[0] || "execution failed"}`);
              statusLabel.style.color = C.err;
              return;
            }

            for (const nodeOut of Object.values(entry.outputs || {})) {
              const item = findVideoItem(nodeOut);
              if (item) { finishRun(item, promptId); return; }
            }
            if (status.completed) { finishRun(null, promptId); return; }
          } catch (err) { /* keep polling */ }
        }
      };

      if (api.socket) {
        try {
          api.socket.addEventListener("message", (event) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === "executed" || msg.type === "execution_success") {
                handleExecutedEvent({ detail: msg.data });
              } else if (msg.type === "execution_error" || msg.type === "exec_error") {
                handleExecutionError({ detail: msg.data });
              }
            } catch (err) {}
          });
        } catch (err) {}
      }

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
