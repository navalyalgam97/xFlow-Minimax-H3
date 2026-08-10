# Changelog - xFlowOne · Minimax H3

All notable changes to the **xFlowOne · Minimax H3** single-node video interface for ComfyUI.

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
