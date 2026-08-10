# Changelog - xFlowOne · Minimax H3

All notable changes to the **xFlowOne · Minimax H3** single-node video interface for ComfyUI.

## [1.5.0] - 2026-08-10

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
