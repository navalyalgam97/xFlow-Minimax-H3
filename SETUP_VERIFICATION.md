# Minimax H3 One-Node Video Interface - Setup Verification Checklist

Use this checklist to verify that the **Minimax H3 One-Node Video Interface** is correctly installed, configured, and ready for production video generation.

---

## 📋 Verification Checklist

### 1. File Structure Verification
- [x] **`__init__.py`**: Exists in node package root and exports `WEB_DIRECTORY = "./web"`.
- [x] **`minimax_h3_video_nodes.py`**: Contains `MinimaxH3OneVideoNode` and all REST API endpoints.
- [x] **`config.json`**: Contains SimpliUI color palette tokens and template prompts.
- [x] **`web/minimax_h3_video.js`**: Contains native ES module extension for ComfyUI web client.
- [x] **`workflows/` Directory**: Contains `text_to_video_workflow.json`, `image_to_video_workflow.json`, `reference_to_video_workflow.json`.
- [x] **`tests/test_minimax_h3_nodes.py`**: Unit test suite present.

---

### 2. Environment & Dependency Checklist
- [x] Python 3.9+ environment available.
- [x] ComfyUI core dependencies (`torch`, `aiohttp`, `folder_paths`, `server.PromptServer`).
- [x] FFmpeg executable detected (`ffmpeg` / `ffprobe`).

---

### 3. Model Files Checklist
Verify that model files exist in the `ComfyUI/models/` path:
- [ ] `ComfyUI/models/diffusion_models/h3/minimax_h3_fl2va_pruned_int8_convrot.safetensors`
- [ ] `ComfyUI/models/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`
- [ ] `ComfyUI/models/vae/minimax_h3_video_vae_fp16.safetensors`
- [ ] `ComfyUI/models/vae/minimax_h3_audio_vae_fp32.safetensors`

---

### 4. Verification Test Execution

Run the automated test suite to confirm backend node logic, workflow loading, parameter boundary checking, sidecar metadata management, and favorites system:

```bash
python3 -m unittest tests/test_minimax_h3_nodes.py
```

**Expected Result**:
```
Ran 12 tests in 0.004s

OK
```

---

### 5. Frontend & REST API Verification

Start ComfyUI and open browser Developer Console:

1. **Config API**: Test `GET http://127.0.0.1:8188/minimax_h3/config`. Should return status 200 with JSON configuration.
2. **Workflows API**: Test `GET http://127.0.0.1:8188/minimax_h3/workflow_text_to_video`. Should return workflow graph.
3. **Gallery API**: Test `GET http://127.0.0.1:8188/minimax_h3/gallery`. Should return `{"success": true, "videos": [...]}`.
4. **Node UI Rendering**: Add `Minimax H3 One-Node Video` node to graph. Verify bright green `#59FF00` UI, mode tabs, prompt editor, duration slider, FPS selector, video player, and history gallery grid.
