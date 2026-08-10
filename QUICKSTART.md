# Quick Start Guide: Minimax H3 One-Node Video

Get up and running in **5 minutes**.

## Step 1: Prepare ComfyUI

```bash
# Navigate to your ComfyUI installation
cd /path/to/ComfyUI

# Create custom node directory
mkdir -p custom_nodes/minimax-h3-video/workflows
mkdir -p custom_nodes/minimax-h3-video/web
```

## Step 2: Copy Files

```bash
# Backend
cp minimax_h3_video_nodes.py custom_nodes/minimax-h3-video/nodes.py

# Config
cp config.json custom_nodes/minimax-h3-video/config.json

# Frontend
cp MinimaxH3Video.jsx custom_nodes/minimax-h3-video/web/minimax_h3_video.js

# Workflows (copy from your Minimax archives)
cp Minimax_H3_-_Text_to_video.json custom_nodes/minimax-h3-video/workflows/text_to_video_workflow.json
cp Minimax_H3_-_Image_to_video_FFLF.json custom_nodes/minimax-h3-video/workflows/image_to_video_workflow.json
cp Minimax_H3_-_Reference_Image___Audio_Sync_-_SPEAK.json custom_nodes/minimax-h3-video/workflows/reference_to_video_workflow.json
```

## Step 3: Update Workflow References

**Important:** Edit each workflow JSON to ensure node IDs match the Python code.

For `text_to_video_workflow.json`, look for:
```json
{
  "195": {
    "type": "CLIPLoader",
    ...
  },
  "196": {
    "type": "VAELoader",
    ...
  },
  "222": {
    "type": "MiniMaxH3ImageToVideo",
    ...
  },
  "228": {
    "type": "PixaromaSaveMp4",
    ...
  }
}
```

These node IDs should remain consistent across all three workflows.

## Step 4: Verify Color Palette

Check `config.json` includes:
```json
{
  "colors": {
    "primary": "#59FF00",
    "primary_hover": "#95FF77",
    "bg_primary": "#1A1C1B",
    "bg_secondary": "#2A2E2E",
    "border": "#555D58",
    "text_primary": "#dedede",
    "text_muted": "#565656"
  }
}
```

## Step 5: Start ComfyUI

```bash
python main.py
```

Open browser to `http://localhost:8188`

## Step 6: Add Node

In the node browser:
1. Click **"Add Node"**
2. Navigate to **"Minimax H3"**
3. Select **"Minimax H3 One-Node Video"**

## Step 7: Test Generation

1. Select **"Text to Video"** mode
2. Enter prompt: *"A serene beach at sunset"*
3. Set duration: **4 seconds**
4. Click **GENERATE VIDEO**

Check ComfyUI logs for any errors.

---

## ✅ Checklist

- [ ] Files copied to correct locations
- [ ] Workflows in `custom_nodes/minimax-h3-video/workflows/`
- [ ] `config.json` has correct colors
- [ ] ComfyUI server running
- [ ] Node appears in node browser
- [ ] Can add node to canvas
- [ ] Parameters render in UI
- [ ] Generate button functional

---

## Troubleshooting

### Node doesn't appear
```bash
# Check Python syntax
python -m py_compile custom_nodes/minimax-h3-video/nodes.py

# Check logs
tail -f ComfyUI.log | grep -i minimax
```

### Workflow loading fails
```bash
# Verify JSON syntax
python -m json.tool custom_nodes/minimax-h3-video/workflows/text_to_video_workflow.json

# Check node type names match
grep '"type"' text_to_video_workflow.json | head -20
```

### UI doesn't load
```javascript
// In browser DevTools console
fetch('/minimax_h3/config').then(r => r.json()).then(console.log)
```

### Colors not applying
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS variables in DevTools Elements tab
- Verify config.json is valid

---

## Next Steps

1. **Customize Prompts**: Edit `config.json` to add your own video templates
2. **Add Workflows**: Include additional video workflow variants
3. **Fine-tune UI**: Adjust layout, sizing, and animations
4. **Test All Modes**: Try Text-to-Video, Image-to-Video, and Reference-to-Video

See [README.md](README.md) for detailed documentation.
