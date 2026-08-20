# xFlowOne · Minimax H3 Video Generation Node for ComfyUI

<div align="center">

![xFlowOne Banner](https://img.shields.io/badge/xFlowOne-Minimax_H3-00ff66?style=for-the-badge&logo=comfyui&logoColor=black)
![Version](https://img.shields.io/badge/version-1.12.0-00ff66?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

*A single-node, 1:1 `xFlowOne` design system UI for Minimax H3 Video Generation in ComfyUI V2.*

</div>

---

## 🌟 Key Features

- 🟢 **1:1 xFlowOne UI Architecture**: Full-bleed dark mode UI with `#00ff66` neon lime accents, scoped `.fk-root` styling, and 0px-padding edge-to-edge canvas integration matching Image 2 (`xFlowOne · LTX-2.3`).
- 🎬 **3 Operational Generation Modes**:
  - **T2V (Text to Video)**: Generate high-fidelity videos directly from text prompts with Orientation & Size custom dropdowns.
  - **I2V (Image to Video)**: Symmetrical side-by-side square upload boxes (`START FRAME` & `END FRAME (OPT)`) with automatic workflow switching (First Frame vs. First + Last Frame).
  - **R2V (Ref + Audio)**: Sync reference images with audio input files with dynamic **SPEAK** (speech lip sync) and **SING** (singing audio sync) workflow routing.
- 🎛 **Web Audio API Waveform Cropper & Timeline Editor**:
  - Full-screen canvas editor with interactive bracket handles (`[` & `]`), timeline zoom (`1x` - `10x`, `Fit Selection`), crop length selector, 16-bit PCM WAV trimmer, and instant HTML5 audio reload.
- 📖 **Embedded Inline Help Panel & Social Hub**:
  - In-node user guide, Pixaroma credits, and community links for **Discord** (`https://discord.gg/dnfaGvcsE`) and **GitHub** (`https://github.com/navalyalgam97/xFlow-Minimax-H3`) with dynamic vector SVG icons.
- ⚙️ **Embedded Inline Setup Panel**:
  - In-node models downloader and manager with real-time download progress, MB/s speed badges, pause, resume, delete actions, and HuggingFace links.
- 📐 **Proportional Aspect Ratio Shape Icons**:
  - Ratio chips render exact visual shape outlines (`16:9` landscape, `9:16` tall portrait, `2:3` portrait, `1:1` square, `keep` dashed frame).
- 🖼 **Dual Square Upload Boxes & Maximise Preview Overlay**:
  - `START FRAME` & `END FRAME (OPT)` with file thumbnails, file names, natural dimension badges (`864 × 480 px`), and full-screen **Maximise Icon (`⤢`)** modal viewer.
- ⚙️ **Longest Side Selector & Gear Settings Drawer (I2V / R2V modes)**:
  - Interactive size tabs, aspect ratio shape chips, 3x3 crop alignment matrix, step rounding (`Off`, `8`, `16`, `32`, `64`), and resample mode controls.
- ⚡ **Visual Interactive Duration Slider (1s - 10s)**:
  - Neon green gradient fill bar with glowing handle thumb, default `4s`, and live frame calculation (`4s → 96 frames`).
- 🎲 **Interactive SEED Control Row**:
  - `[ — ] [ Seed Input ] [ 🔀 Shuffle ] [ + ]` with neon green shuffle button.
- 🎛 **CFG Scale Defaulted to 1.0**:
  - Matched font family & weight 1:1 with all UI controls.
- 🎨 **Add LoRA Models Manager**:
  - Interactive multi-slot LoRA stacker directly in the prompt area with strength sliders (0.0 to 2.0).
- 🎨 **Minimal Vector SVG Icon Library**:
  - Custom vector SVG icons across all mode pills, tabs, actions, and controls for crisp retina rendering.
- 📺 **Interactive Media Preview Player**:
  - HTML5 video preview box with status bar, progress bar, audio chime completion sound (`🔊`), and Auto-save toggle.

---

## 🛠️ Required Model Weights

All required models can be managed and downloaded automatically via the built-in **⚙ Setup** panel in the node:

| Model ID | File Name | Type | Folder | HuggingFace Link |
| :--- | :--- | :--- | :--- | :--- |
| `fl2va` | `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | Diffusion | `ComfyUI/models/diffusion_models/h3/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors) |
| `ref2va` | `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | Reference | `ComfyUI/models/diffusion_models/h3/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `clip` | `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | CLIP / Text | `ComfyUI/models/text_encoders/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) |
| `video_vae` | `minimax_h3_video_vae_fp16.safetensors` | VAE | `ComfyUI/models/vae/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors) |
| `audio_vae` | `minimax_h3_audio_vae_fp32.safetensors` | Audio VAE | `ComfyUI/models/vae/` | [Download](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |

---

## 📜 Changelog

### Version 1.12.0 (Latest Release)

> Turbo 8-step LoRA, one click in Setup, loaded by the T2V workflow.

- ⬇️ **Turbo LoRA in the Models & Setup Manager**: `minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors` (1.96 GB) downloads into `ComfyUI/models/loras/` with the same pause / resume / delete / progress as the weights. Optional — a missing copy never blocks a run.
- 🔗 **It loads in the LoRA loader itself**: once installed it takes a slot in the **Add LoRA** drawer, and the drawer's rows now reach the submitted prompt through the workflow's `PixaromaLoraLoader`.
- 🐛 **The LoRA loader's MODEL output went nowhere**: `KSampler` was still fed straight from `UNETLoader`, so a LoRA touched CLIP and left the diffusion model alone. Now rewired.

### Version 1.11.2

> Fixes "no usable sound file selected" on a fresh machine.

- 📁 **Sample filenames cleared from the workflow templates**: they shipped with Pixaroma's demo assets (`I can talk audio.wav`, `Pixa Bunny HipHop.jpeg`, …) as loader defaults, which only resolve on a machine that has those samples. Model `.safetensors` names are untouched.
- 🔑 **`loadAudioState.file` is now always assigned**: Pixaroma reads that state ahead of the widget, and it was only written when an audio file was chosen — so a template's saved filename survived into the run.

### Version 1.11.1

> Fixes a run-killing error when no audio file is set.

- 🔇 **Audio is optional**: the audio loader is pruned when unused. `PixaromaH3AudioSync` is *bypassed* rather than deleted, since model and latent pass through it to the sampler — so the pipeline stays connected and the mp4 is written without an audio track. (Nothing to lip-sync to, so SPEAK/SING give a silent clip.)
- 📁 **Missing input files no longer abort a run**: remembered filenames whose files aren't in ComfyUI's input folder — after moving to a cloud GPU box, say — are treated as unset and pruned, with a console warning, instead of failing the whole prompt.

### Version 1.11.0

> R2V gains a second reference image and a reference video, both optional.

- 🖼️ **Second Reference Image** (`REF IMAGE 2 (OPT)`) → `ref_image_1`. Output size still comes from reference image 1 only.
- 🎬 **Reference Video** (`REF VIDEO (OPT)`) → `ref_video_0`, with the video's own audio feeding `ref_audio_0`.
- ✂️ **Truly optional**: unused loaders are pruned from the submitted graph, so leaving both empty submits the same graph R2V always used. Clearing the video hands `ref_audio_0` back to your uploaded audio track.
- 🔀 **Slot routing now reads the graph**, not node titles — the R2V template has two loaders both titled "3. Load Image", which previously sent image 2's filename to slot 1.
- 🎙️ **Two-picture prompt presets** when a second reference is loaded.

> Needs a MiniMax H3 node build exposing `ref_image_1` / `ref_video_0`. Older builds work unchanged if the optional slots are left empty.

### Version 1.10.0

> Generation feedback and prompt helpers.

- ⏱️ **Seven-Segment Generation Timer**: Counts up while rendering, freezes on the total, holds ~3s, then fades off the picture. Drawn as SVG (ghosted unlit segments, black shadow) so it stays legible over a bright frame and needs no font file.
- 🛑 **Stop Generation Button**: Replaces the chime button beside Generate. Live only while **this node** is running, and cancels via both queue-delete and `/interrupt` — interrupt alone misses a prompt still waiting in the queue.
- ✨ **Generate Feedback**: Firefly glow while running, spinning sparkle icon, and no more permanent halo when idle.
- 🤖 **GPT Prompt Button**: Replaces "Director"; opens the prompt-writing GPT for the active mode (R2V has its own). The negative-prompt toggle keeps its own control.
- 🎙️ **Default R2V Prompts**: SPEAK and SING presets fill on entering R2V and swap when toggled, without ever overwriting text you wrote. **Reset** restores one deleted by accident.
- 🐛 **Panel Overflow Fixed**: The UI hung 24px past the node's right edge; it now fills the widget slot and holds a true 16:9 via `aspect-ratio`.

### Version 1.9.0

> Interface release: gallery rework, fullscreen mode, and a 16:9 node.

- 🖼️ **Gallery Thumbnail Grid**: Dense square tiles with the filename overlaid; hover previews the clip in place. Clicking a tile opens it **full view inside the node**, with a **Download** button so a cloud or remote ComfyUI can hand the file to your local machine.
- ⛶ **Fullscreen Mode**: Icon toggle at the right of the top bar, native Fullscreen API with a viewport-pinned fallback for embedded browsers. Esc exits.
- 📐 **Fixed 16:9 Node**: `1360 × 765`.
- 🔢 **`SIZE TABS` / `SHAPE CHIPS` Single-Select**: One size, one shape — and that choice is the resolution generated and the ratio cropped to. 1.8.0's five-at-once curation read as a broken radio group. Off-list picks swap onto the node row so the selection stays visible.
- 🐛 **`ROUND SIZES TO → Off` Now Sticks**: `Off` is `0` and was being read through `||`, so it snapped back to `x32`. Display only — the value was always sent correctly.
- 🐛 **SEED Reachable In I2V / R2V**: The left column's scroll area could not shrink and the Advanced Options card clipped its own tail, hiding SEED.
- 💅 **Settings Panel & Help Drawer**: Centred 880px settings panel with uniform rows; content-sized social buttons; installed version in the bottom-right corner.

### Version 1.8.0

> Bug-fix release. Before this, **R2V (Reference + Audio) and I2V never used your reference image or audio** — both silently ran the text-to-video workflow. If you are on 1.7.0 or earlier, upgrade.

- 🎯 **Correct Workflow Per Mode** *(root cause)*: `R2V` and `I2V` resolved to workflow names the dispatcher did not recognise, falling through to `text_to_video` — a graph with no `PixaromaLoadImageMini` and no `PixaromaLoadAudio`. The reference nodes were never submitted, so the model generated from the prompt alone. Unknown modes now throw instead of defaulting.
- 📦 **Pixaroma State Serialization**: Hidden `*State` inputs are JSON **strings**, not objects. Sending objects made `PixaromaLoadAudio` fail with *"no usable sound file selected"* while duration coincidentally still worked.
- 📐 **Longest Side Panel**: `SIZE TABS` / `SHAPE CHIPS` now curate which chips show on the node face (Pixaroma behaviour) instead of silently overwriting the chosen size and ratio — the reason 864/keep jobs came out 1024×1024. Adds **UPSCALING** and wires up **ROUND SIZES TO**.
- 💾 **Auto-Save Works**: **On** → `output/MinimaxH3/`, listed in the Gallery tab with a metadata sidecar. **Off** → `temp/`, cleared on restart. Previously the toggle did nothing and saved videos could never reach the Gallery.
- ▶️ **Player Controls & Replay**: Video elements had `controls` / `src` passed as CSS and silently dropped — no transport bar, and Gallery thumbnails had no source.
- 🔄 **Reliable Completion**: Completion is polled from `/history` as well as the websocket, so the node no longer sticks on *"Generating…"*; events are matched to the node's own `prompt_id` so another tab's run cannot drive its status.
- 🧩 **No Silent Model Substitution**: An unresolvable model name is no longer replaced with an arbitrary one (which had been assigning `pixel_space` to both VAEs).
- 💥 **`NameError` Fix**: `_last_output_by_node` was never defined, so executing the node raised before returning its outputs.

### Version 1.7.0

- 📖 **Embedded Inline Help Panel**: Step-by-step user guides for **T2V**, **I2V (FFLF)**, **R2V (SPEAK / SING)**, and **Advanced Options**.
- 🙏 **Pixaroma Credits & Thanks**: Dedicated acknowledgements section for Pixaroma open-source workflows.
- 💬 **Community & Social Links**: **Join Discord Server** (`https://discord.gg/dnfaGvcsE`) and **GitHub Repository** (`https://github.com/navalyalgam97/xFlow-Minimax-H3`) buttons with custom vector SVG icons (`discord`, `github`) using `window.open()`.
- ⚙️ **Embedded Inline Setup Panel**: Embedded inline Setup drawer panel matching the Help panel 1:1 in layout, topBar visibility, and bottom prompt bar visibility with full model cards, download progress, and speed badges.
- 🔄 **Mode Tab Auto-Close**: Switching mode tabs (`T2V`, `I2V`, `R2V`) automatically closes active Help or Setup drawers.

### Version 1.6.0

- 🎛 **Web Audio API Waveform Cropper & Timeline Editor Modal**: Full-screen canvas editor with interactive bracket handles (`[` & `]`), time ruler, timeline zoom & stretch (`1x` to `10x`, `Fit Selection`), duration selector presets, 16-bit PCM WAV trimmer, and HTML5 audio player reload.
- 🎙️ / 🎵 **Dynamic SPEAK vs SING Engine**: Added SPEAK vs SING pill selector in R2V mode, automatically routing to `reference_to_video` for speech lip-sync or `reference_to_video_sing` for singing video sync.

### Version 1.5.0

- 📐 **Proportional Aspect Ratio Icons**: Ratio chips render exact visual shape outlines.
- 🖼 **Side-by-Side Dual Square Upload Boxes**: Equal side-by-side squares (`START FRAME` & `END FRAME`).
- 🔍 **Maximise Image Preview (`⤢`)**: Full-screen modal viewer with dimension badge.

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
