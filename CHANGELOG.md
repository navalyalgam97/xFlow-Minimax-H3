# Changelog - xFlowOne · Minimax H3

All notable changes to the **xFlowOne · Minimax H3** single-node video interface for ComfyUI.

## [1.7.0] - 2026-08-10

### 🚀 Embedded Inline Drawers, Pixaroma Credits & Community Social Hub
- **📖 Embedded Inline Help Drawer Panel**:
  - Embedded inline Help drawer inside the node container positioned between `topBar` and `promptSection`.
  - Comprehensive step-by-step user guides for **T2V (Text-to-Video)**, **I2V (Image-to-Video & FFLF Interpolation)**, **R2V (SPEAK / SING Audio Sync)**, and **Advanced Options**.
  - **Pixaroma (`ComfyUI-Pixaroma`)** open-source acknowledgements with direct GitHub repo link button.
  - **Join Discord Community Server** button (`https://discord.gg/dnfaGvcsE`) and **GitHub Repository** button (`https://github.com/navalyalgam97/xFlow-Minimax-H3`) with custom vector SVG icons (`discord`, `github`).
  - Utilizes `window.open(url, "_blank")` event handlers to guarantee clean URL opening in new browser tabs.
- **⚙️ Embedded Inline Setup Drawer Panel**:
  - Embedded inline Setup panel matching the Help panel 1:1 in layout, topBar visibility, and bottom prompt bar visibility.
  - Houses all 5 Minimax H3 model cards (`fl2va`, `ref2va`, `clip`, `video_vae`, `audio_vae`) with real-time download progress bars, MB/s speed badges, pause, resume, delete actions, and direct HuggingFace links.
- **🔄 Mode Tab Auto-Close**:
  - Clicking any mode tab (`T2V`, `I2V`, `R2V`) automatically closes active Help or Setup drawers and restores the 2-column video generation layout.

---

## [1.6.0] - 2026-08-10

### 🚀 Web Audio Waveform Cropper & Dynamic SPEAK / SING Workflow Engine
- **🎛 Web Audio API Waveform Cropper & Timeline Editor Modal**:
  - Interactive top-right Gear button (`⚙`) on uploaded audio boxes opening a full-screen Web Audio API canvas editor.
  - **Interactive Selection Handles**: Left/Right bracket handles (`[` and `]`) with mouse drag selection and live start/end time ruler (`0s`, `30s`, `1m`...).
  - **Timeline Zoom & Stretch**: Multi-level zoom controls (`1x`, `2x`, `5x`, `10x`, `🔍 Fit Selection`) and mouse wheel horizontal panning across long audio tracks.
  - **Crop Duration Selector**: Preset selection (`Match Video (4s)`, `5s`, `10s`, `Full Audio`, custom input).
  - **16-bit PCM WAV Trimmer & Audio Reload**: Cuts audio buffer in memory, converts to WAV Blob, reloads HTML5 `<audio>` element (`audioPlayer.load()`), updates filename duration badge, and auto-closes on apply.
- **🎙️ / 🎵 Dynamic SPEAK vs SING Workflow Engine**:
  - Added **SPEAK** vs **SING** audio sync pill selector for R2V mode.
  - **SPEAK** selection $\rightarrow$ Automatically routes to `reference_to_video` workflow (`workflows/reference_to_video_workflow.json`) for speech lip-sync video generation.
  - **SING** selection $\rightarrow$ Automatically routes to `reference_to_video_sing` workflow (`workflows/reference_to_video_sing_workflow.json`) for singing audio sync video generation.
  - Dynamic backend pre-flight model validation for `ref2va` and `audio_vae` model weights.

---

### 🚀 Proportional Aspect Ratio Icons & Symmetrical Dual Square Upload Boxes
- **📐 Proportional Aspect Ratio Shape Icons**:
  - Replaced static square icons with dynamic proportional shape icons across all ratio chips (`16:9` landscape, `9:16` tall portrait, `2:3` portrait, `1:1` square, `keep` dashed frame).
- **🖼 Side-by-Side Symmetrical Square Upload Boxes**:
  - Rendered 2 side-by-side square boxes with matching headers: **`START FRAME`** and **`END FRAME (OPT)`**.
  - Attached hidden file input to `document.body` for 100% reliable native OS file picker triggering on click.
  - Added clear file extension labels **`(.png, .jpg, .webp)`** and drag-and-drop support.
- **🔍 Full-Screen Maximise Image Preview (`⤢`)**:
  - High-res image modal viewer overlay with backdrop blur, image dimensions (`Width × Height px`), and red close button (`#ff4444`).

---

## [1.4.0] - 2026-08-10

### 🚀 Dual Image Uploads, Maximise Preview & Automatic Workflow Branching
- **🖼 Dual Image Upload Boxes (`START FRAME` & `END FRAME`)**:
  - `START FRAME (First Frame)` box + `END FRAME (Last Frame - Optional)` box.
  - Image thumbnails with xFlow neon green border, file name, and natural image dimension badge (e.g. `864 × 480 px`).
- **🔍 Full-Screen Maximise Preview Overlay (`⤢`)**:
  - Added **Maximise icon button (`⤢`)** on top-right of uploaded image preview box.
  - Opens a high-res full-screen image viewer overlay with backdrop blur, exact image dimensions (`Width × Height px`), file name, and red close button (`#ff4444`).
- **🔀 Automatic Workflow Branching**:
  - **Single Image Uploaded (Start Frame)** $\rightarrow$ Automatically executes the **First Frame Image-to-Video Workflow** (`workflow_image_to_video.json`).
  - **Both Images Uploaded (Start Frame & End Frame)** $\rightarrow$ Automatically executes the **First Frame + Last Frame Image-to-Video Workflow** (`workflow_image_to_video_fflf.json`).
- **🔴 Red Close Button Uniformity**:
  - Styled `longestSideOverlay` close button identically to the `Setup` overlay with `#ff4444` background, white SVG cross icon, and white text.

---

## [1.3.0] - 2026-08-10

### 🚀 Major Features & UI Enhancements
- **🎨 Orientation & Size Custom Dropdown System**:
  - Custom floating xFlow menu popups with clean uniform white numbers (`#dedede`) and zero stars.
  - On hover, borders light up in **xFlow Neon Green (`#00ff66`)** with subtle glow.
- **🎞 Custom FPS Selector**:
  - Replaced native browser `<select>` with custom xFlow floating menu (`24 FPS`, `30 FPS`) featuring neon green hover highlights.
- **⚡ Visual Interactive Duration Slider (1s - 10s)**:
  - Replaced manual number input with custom visual drag slider bar featuring **xFlow Neon Green Gradient Fill (`#00ff66`)** and glowing handle thumb.
  - Default duration set to **`4s`** (`4s → 96 frames` live frame calculation display).
- **🎲 SEED Control System**:
  - Added interactive seed row: **`[ — ] [ Seed Value Input ] [ 🔀 Shuffle ] [ + ]`**.
  - Bright **xFlow Neon Green (`#00ff66`)** shuffle button that generates a fresh random integer seed instantly on click.
- **🎛 CFG Scale & Layout Optimization**:
  - CFG Scale defaulted strictly to **`1.0`** with font family, font weight (`700`), and line height matching all controls 1:1.
  - Swapped layout: **CFG SCALE** (half width) next to **FPS** on top, followed by full-width **DURATION** slider bar above **SEED**.
- **⚙️ Longest Side Selector & Gear Settings Drawer (I2V / R2V modes)**:
  - Added **Longest Side Selector** featuring `x32` step badge, **Gear Icon (`⚙`)**, size tabs (`864`, `1024`, `1216`, `1344`, `1536`), and aspect ratio shape chips (`keep`, `1:1`, `16:9`, `9:16`, `2:3`).
  - Clicking **Gear Icon (`⚙`)** opens a dynamic, reactive **Longest Side Settings Modal Drawer** in xFlow neon green styling:
    - **ROUND SIZES TO**: `Off`, `8`, `16`, `32`, `64`.
    - **SIZE TABS**: Grid selection for active size tabs + reset button.
    - **SHAPE CHIPS**: Aspect ratio chips (`keep`, `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`, `9:21`, `2:1`, `1:2`).
    - **CROP FROM**: Interactive **3x3 alignment matrix grid** (active cell highlighted in neon green `#00ff66`).
    - **RESAMPLE**: Algorithm selector (`auto`, `lanczos`, `bicubic`, `bilinear`, `nearest`).
  - Every option is 100% interactive, dynamically re-rendering live with event propagation isolation.
- **✨ Uncluttered Minimal UI**:
  - Removed `xFlowOne` and `created by NAVAL` footer text from the prompt section.
  - Removed unused `MOTION STRENGTH` input box.

---

## [1.1.0] - 2026-08-10

### 🚀 Added & Enhanced
- **1:1 xFlowOne Image 2 Interface System**:
  - Implemented full-bleed 0px padding styling matching `xFlowOne · LTX-2.3` (`one_node_ltx23.js`).
  - Added `.fk-root` scoped CSS rules to collapse default ComfyUI V2 Vue node surface containers.
- **Top Header & Mode Selector**:
  - Added `xFlowOne` · `Minimax H3` logo and mode pills: **`T2V`**, **`I2V`**, **`R2V`**.
  - Top action buttons: **Gallery**, **Setup**, **Help**.
- **Models & Setup Manager Overlay**:
  - Direct HuggingFace download buttons saving directly into target directories (`diffusion_models/h3/`, `text_encoders/`, `vae/`).
  - Real-time download progress tracking, pause/resume, and model deletion.
  - Bright red (`#ff4444`) close button and 100% box containment.
- **Add LoRA Manager Drawer**:
  - Interactive multi-slot LoRA manager attached to the prompt section header.
  - Real-time scanning of `ComfyUI/models/loras/` safetensors with adjustable model strength sliders (0.0 to 2.0).
- **Minimal Vector SVG Icon System**:
  - Integrated custom SVG vector icons across all mode pills, tabs, actions, and controls for retina rendering.
- **Zero-Native-Inputs Schema Architecture**:
  - Set `required: {}` and `optional: {}` in Python `INPUT_TYPES` so ComfyUI V2 generates 0 grey input boxes above the node.

---

## [1.0.0] - 2026-08-10

### Initial Release
- Initial release of Minimax H3 single-node video generation interface for ComfyUI.
- Integration of T2V, I2V, and R2V Pixaroma workflow execution templates.
- Sidecar metadata tracking and completion audio chime.
