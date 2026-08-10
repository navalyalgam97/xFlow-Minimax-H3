# Minimax H3 One-Node Video Interface - Deployment Guide

This guide provides step-by-step instructions for deploying and running the **Minimax H3 One-Node Video Interface** custom node in ComfyUI.

---

## 1. System Requirements & Prerequisites

- **ComfyUI**: Latest release installed and running.
- **Python**: Python 3.9+ with standard ComfyUI dependencies (`aiohttp`, `torch`, `Pillow`).
- **FFmpeg**: (Recommended) Installed on system or available via `ComfyUI-VideoHelperSuite` for video duration and metadata extraction.

---

## 2. Installation Steps

### Step 1: Clone or Copy Node Directory
Place the package folder into your ComfyUI `custom_nodes` directory:

```bash
cd /path/to/ComfyUI/custom_nodes/
git clone https://github.com/your-org/xFlow-Minimax-H3.join xFlow_Minimax_H3
# Or copy folder directly into custom_nodes/xFlow_Minimax_H3
```

Ensure the folder structure matches:
```
ComfyUI/custom_nodes/xFlow_Minimax_H3/
├── __init__.py
├── minimax_h3_video_nodes.py
├── config.json
├── web/
│   └── minimax_h3_video.js
├── workflows/
│   ├── text_to_video_workflow.json
│   ├── image_to_video_workflow.json
│   └── reference_to_video_workflow.json
├── tests/
│   └── test_minimax_h3_nodes.py
└── README.md
```

### Step 2: Download Minimax H3 Models
Ensure the required Minimax H3 model files are placed in their respective `ComfyUI/models/` directories:

1. **Diffusion Model**:
   - File: `minimax_h3_fl2va_pruned_int8_convrot.safetensors`
   - Location: `ComfyUI/models/diffusion_models/h3/`
2. **CLIP Model**:
   - File: `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`
   - Location: `ComfyUI/models/text_encoders/`
3. **Video VAE**:
   - File: `minimax_h3_video_vae_fp16.safetensors`
   - Location: `ComfyUI/models/vae/`
4. **Audio VAE** (Required for Reference + Audio mode):
   - File: `minimax_h3_audio_vae_fp32.safetensors`
   - Location: `ComfyUI/models/vae/`

---

## 3. Starting ComfyUI & Node Access

1. Start ComfyUI:
   ```bash
   python main.py
   ```
2. Open your web browser to `http://127.0.0.1:8188`.
3. Right-click on the graph canvas and select **Add Node** → **Minimax H3** → **Minimax H3 One-Node Video** (or double-click and type `Minimax H3 One-Node Video`).
4. The node will render with the custom **SimpliUI** green interface (`#59FF00`).

---

## 4. Operational Modes Usage

### Mode 1: Text to Video (T2V)
1. Select **Text to Video** mode button.
2. Enter your video scene description in the **Prompt Description** box or pick a preset from the **Insert Preset Template...** dropdown.
3. Adjust **Duration** (1–30s), **FPS** (24/30), **Motion Strength** (0.0–1.0), and **Guidance Scale** (1.0–20.0).
4. Click **⚡ GENERATE MINIMAX H3 VIDEO**.

### Mode 2: Image to Video (I2V)
1. Select **Image to Video** mode button.
2. Click **📁 Choose Image File** to select your initial frame image.
3. Describe desired camera motion/action in the prompt box.
4. Click **⚡ GENERATE MINIMAX H3 VIDEO**.

### Mode 3: Reference Image + Audio Sync (R2V)
1. Select **Reference + Audio** mode button.
2. Click **🖼️ Select Image** to upload the character/reference image.
3. Click **🎵 Select Audio** to upload speech or singing `.wav`/`.mp3` audio.
4. Click **⚡ GENERATE MINIMAX H3 VIDEO**.

---

## 5. Troubleshooting & Error Logging

- **Node Not Visible**: Check ComfyUI terminal output for `[MinimaxH3Video] Backend node loaded successfully.` Ensure `__init__.py` exists in the node folder.
- **Frontend UI Blank**: Open browser Developer Tools (F12) → Console. Ensure `web/minimax_h3_video.js` is loaded without network 404 errors.
- **Video Output Missing**: Generated videos are saved to `ComfyUI/output/MinimaxH3/` with sidecar metadata saved in `ComfyUI/output/MinimaxH3/metadata/`.
