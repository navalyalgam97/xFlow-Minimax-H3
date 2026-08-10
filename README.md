# xFlowOne · Minimax H3 Video Generation Node for ComfyUI

<div align="center">

![xFlowOne Banner](https://img.shields.io/badge/xFlowOne-Minimax_H3-00ff66?style=for-the-badge&logo=comfyui&logoColor=black)
![Version](https://img.shields.io/badge/version-1.4.0-00ff66?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

*A single-node, 1:1 `xFlowOne` design system UI for Minimax H3 Video Generation in ComfyUI V2.*

</div>

---

## 🌟 Key Features

- 🟢 **1:1 xFlowOne UI Architecture**: Full-bleed dark mode UI with `#00ff66` neon lime accents, scoped `.fk-root` styling, and 0px-padding edge-to-edge canvas integration matching Image 2 (`xFlowOne · LTX-2.3`).
- 🎬 **3 Operational Generation Modes**:
  - **T2V (Text to Video)**: Generate high-fidelity videos directly from text prompts with Orientation & Size custom dropdowns.
  - **I2V (Image to Video)**: Dual Image Upload boxes (`START FRAME` & `END FRAME`) with automatic workflow switching (First Frame vs. First + Last Frame).
  - **R2V (Ref + Audio)**: Sync reference images with audio input files.
- 🖼 **Dual Image Upload Boxes & Full-Screen Preview Overlay**:
  - Upload `START FRAME` and optional `END FRAME` with file thumbnails, file names, and natural dimension badges (`864 × 480 px`).
  - Top right **Maximise Icon (`⤢`)** opens full-screen image preview modal.
- ⚙️ **Longest Side Selector & Gear Settings Drawer (I2V / R2V modes)**:
  - Interactive size tabs, aspect ratio shape chips, 3x3 crop alignment matrix, step rounding (`Off`, `8`, `16`, `32`, `64`), and resample mode controls.
- ⚡ **Visual Interactive Duration Slider (1s - 10s)**:
  - Neon green gradient fill bar with glowing handle thumb, default `4s`, and live frame calculation (`4s → 96 frames`).
- 🎲 **Interactive SEED Control Row**:
  - `[ — ] [ Seed Input ] [ 🔀 Shuffle ] [ + ]` with neon green shuffle button.
- 🎛 **CFG Scale Defaulted to 1.0**:
  - Matched font family & weight 1:1 with all UI controls.
- 🎨 **Add LoRA Models Manager**:
  - Interactive multi-slot LoRA stacker directly in the prompt area.
  - Real-time scan of local `ComfyUI/models/loras/` safetensors.
  - Adjustable model strength sliders (0.0 to 2.0).
- 🎨 **Minimal Vector SVG Icon Library**:
  - Custom vector SVG icons across all mode pills, tabs, actions, and controls for crisp retina rendering.
- 📺 **Interactive Media Preview Player**:
  - HTML5 video preview box with status bar, progress bar, audio chime completion sound (`🔊`), and Auto-save toggle.

---

## 🛠️ Required Model Weights

All required models can be managed and downloaded automatically via the built-in **⚙ Setup** overlay in the node:

| Model ID | File Name | Type | Folder | HuggingFace Link |
| :--- | :--- | :--- | :--- | :--- |
| `fl2va` | `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | Diffusion | `ComfyUI/models/diffusion_models/h3/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors) |
| `ref2va` | `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | Reference | `ComfyUI/models/diffusion_models/h3/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `clip` | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | CLIP / Text | `ComfyUI/models/text_encoders/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) |
| `video_vae` | `minimax_h3_video_vae_fp16.safetensors` | VAE | `ComfyUI/models/vae/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors) |
| `audio_vae` | `minimax_h3_audio_vae_fp32.safetensors` | Audio VAE | `ComfyUI/models/vae/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |

---

## 📜 Changelog

### Version 1.4.0 (Latest Release)

- 🖼 **Dual Image Upload Boxes**: Added `START FRAME (First Frame)` & `END FRAME (Last Frame - Optional)` upload controls.
- 🔍 **Maximise Image Preview (`⤢`)**: Full-screen modal viewer with dimensions badge (`Width × Height px`).
- 🔀 **Automatic Workflow Branching**: Auto-switches between **First Frame** (`image_to_video`) and **First Frame + Last Frame** (`image_to_video_fflf`) based on uploaded image count.
- 🔴 **Red Close Button Uniformity**: Styled `longestSideOverlay` close button identically to `Setup` overlay (`#ff4444`).
- 🎨 **Orientation & Size Custom Dropdowns**: Clean white resolution numbers with xFlow neon green hover glow.
- 🎞 **Custom FPS Dropdown**: xFlow styled 24 FPS / 30 FPS selection menu.
- ⚡ **Visual Duration Slider**: 1-10s range slider in neon green with live frame calculation.
- 🎲 **Interactive Seed Controls**: Minus, neon green shuffle button, and plus controls.

### Version 1.3.0

- 🎨 **Orientation & Size Custom Dropdowns**: Clean white resolution numbers with xFlow neon green hover glow.
- 🎞 **Custom FPS Dropdown**: xFlow styled 24 FPS / 30 FPS selection menu.
- ⚡ **Visual Duration Slider**: 1-10s range slider in neon green with live frame calculation.
- 🎲 **Interactive Seed Controls**: Minus, neon green shuffle button, and plus controls.
- ⚙️ **Longest Side Selector & Gear Drawer**: Full interactive settings overlay for I2V/R2V modes (Round sizes, Size tabs, Shape chips, 3x3 Crop matrix, Resample modes).
- 🎛 **CFG Scale 1.0 Default**: Matched typography and default value.
- 🎨 **1:1 xFlowOne UI Design**: Scoped `.fk-root` dark mode canvas integration with neon lime accents (`#00ff66`) matching `xFlowOne · LTX-2.3`.
- ⚙️ **Models & Setup Manager**: Added overlay downloader with direct HuggingFace model downloading, live progress bars, pause/resume, deletion, red close button (`#ff4444`), and 100% box containment.
- 🎨 **Add LoRA Stacker**: Added interactive multi-slot LoRA manager directly in prompt header with strength controls.
- 📐 **Vector SVG Icons**: Replaced generic OS emojis with custom vector SVG icons across all tabs, mode pills, action buttons, and setup controls.

### Version 1.1.0

- 🎨 **1:1 xFlowOne UI Design**: Scoped `.fk-root` dark mode canvas integration with neon lime accents (`#00ff66`) matching `xFlowOne · LTX-2.3`.
- ⚙️ **Models & Setup Manager**: Added overlay downloader with direct HuggingFace model downloading, live progress bars, pause/resume, deletion, red close button (`#ff4444`), and 100% box containment.
- 🎨 **Add LoRA Stacker**: Added interactive multi-slot LoRA manager directly in prompt header with strength controls.
- 📐 **Vector SVG Icons**: Replaced generic OS emojis with custom vector SVG icons across all tabs, mode pills, action buttons, and setup controls.
- ⚡ **Zero-Native-Inputs Fix**: Updated `INPUT_TYPES` in Python to `required: {}` and `optional: {}` so ComfyUI V2 renders 0 native grey input boxes above the node.

### Version 1.0.0

- 🚀 Initial release of Minimax H3 single-node video interface for ComfyUI.
- 🎬 Integration of Text-to-Video, Image-to-Video, and Reference + Audio Sync workflows.

---

## 🚀 Quick Start & Installation

### Option 1: ComfyUI Custom Nodes Folder

1. Clone or extract this repository into your ComfyUI custom nodes directory:
   ```bash
   cd ComfyUI/custom_nodes/
   git clone https://github.com/navalyalgam97/xFlow-Minimax-H3.git
   ```
2. Restart ComfyUI.
3. Search and spawn **`Minimax H3 One-Node Video`** from the node search menu.

---

## 💻 Architecture

- **Backend**: `minimax_h3_video_nodes.py` (Python ComfyUI Node & Async REST Server Routes)
- **Frontend**: `web/minimax_h3_video.js` (xFlowOne Scoped CSS & Canvas Widget Engine)
- **Workflows**: `workflows/` (Standard Pixaroma graph templates for T2V, I2V, R2V)

---

## 📄 License

MIT License. Developed by **NAVAL**.
