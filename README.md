# xFlowOne · Minimax H3 Video Generation Node for ComfyUI

<div align="center">

![xFlowOne Banner](https://img.shields.io/badge/xFlowOne-Minimax_H3-00ff66?style=for-the-badge&logo=comfyui&logoColor=black)
![Version](https://img.shields.io/badge/version-1.1.0-00ff66?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

*A single-node, 1:1 `xFlowOne` design system UI for Minimax H3 Video Generation in ComfyUI V2.*

</div>

---

## 🌟 Key Features

- 🟢 **1:1 xFlowOne UI Architecture**: Full-bleed dark mode UI with `#00ff66` neon lime accents, scoped `.fk-root` styling, and 0px-padding edge-to-edge canvas integration matching Image 2 (`xFlowOne · LTX-2.3`).
- 🎬 **3 Operational Generation Modes**:
  - **T2V (Text to Video)**: Generate high-fidelity videos directly from text prompts.
  - **I2V (Image to Video)**: Animate static images with motion controls.
  - **R2V (Ref + Audio)**: Sync reference images with audio input files.
- ⚙️ **Models & Setup Manager Overlay**:
  - Real-time status for all 5 required safetensors (`fl2va`, `ref2va`, `qwen3vl_clip`, `video_vae`, `audio_vae`).
  - Automatic download directly from HuggingFace to designated ComfyUI model directories.
  - Progress bar tracking, pause/resume, and model deletion options.
  - Sleek bright red (`#ff4444`) close button and 100% box containment.
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

All required models can be managed and downloaded automatically via the built-in **⚙️ Setup** overlay in the node:

| Model ID | File Name | Type | Folder | HuggingFace Link |
| :--- | :--- | :--- | :--- | :--- |
| `fl2va` | `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | Diffusion | `ComfyUI/models/diffusion_models/h3/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors) |
| `ref2va` | `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | Reference | `ComfyUI/models/diffusion_models/h3/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `clip` | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | CLIP / Text | `ComfyUI/models/text_encoders/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) |
| `video_vae` | `minimax_h3_video_vae_fp16.safetensors` | VAE | `ComfyUI/models/vae/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors) |
| `audio_vae` | `minimax_h3_audio_vae_fp32.safetensors` | Audio VAE | `ComfyUI/models/vae/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |

---

## 🚀 Quick Start & Installation

### Option 1: ComfyUI Custom Nodes Folder

1. Clone or extract this repository into your ComfyUI custom nodes directory:
   ```bash
   cd ComfyUI/custom_nodes/
   git clone https://github.com/naval-group/xFlow-Minimax-H3.git
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
