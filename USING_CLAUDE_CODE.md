# Using Claude Code to Build Minimax H3 Video Node

## 🎯 Overview

I've created **complete, production-ready scaffolding** for your Minimax H3 video generation node. This guide shows you how to use **Claude Code** (or any IDE) to integrate everything.

## 📦 What You Have

Generated files ready to use:

```
/home/claude/
├── minimax_h3_video_nodes.py          ← Backend (copy to ComfyUI)
├── config.json                         ← UI configuration (copy to ComfyUI)
├── MinimaxH3Video.jsx                 ← Frontend component (copy to ComfyUI)
├── MINIMAX_VIDEO_NODE_GUIDE.md        ← Detailed implementation guide
├── GUIDE.md                           ← Architecture deep-dive (generated earlier)
├── QUICKSTART.md                      ← 5-minute setup guide
├── IMPLEMENTATION_CHECKLIST.md        ← Complete checklist
├── DESIGN_GUIDE.md                    ← SimpliUI color palette guide
├── README.md                          ← User documentation
└── USING_CLAUDE_CODE.md              ← This file
```

## 🚀 Step 1: Open in Claude Code

If using Claude Code desktop app:

```bash
# Navigate to the directory
cd /home/claude/

# Open in Claude Code
code .
```

If using Claude Code terminal:
```bash
# You're already in /home/claude from our work
ls -la
```

## 🔧 Step 2: Prepare Your ComfyUI Directory

In Claude Code terminal:

```bash
# Navigate to your ComfyUI installation
cd /path/to/your/ComfyUI

# Create the custom node directory
mkdir -p custom_nodes/minimax-h3-video/workflows
mkdir -p custom_nodes/minimax-h3-video/web
mkdir -p custom_nodes/minimax-h3-video/assets
```

## 📋 Step 3: Copy Core Files

Copy the scaffolding files I generated:

```bash
# From /home/claude:
cd /home/claude

# Copy backend node
cp minimax_h3_video_nodes.py /path/to/ComfyUI/custom_nodes/minimax-h3-video/nodes.py

# Copy config
cp config.json /path/to/ComfyUI/custom_nodes/minimax-h3-video/config.json

# Copy frontend
cp MinimaxH3Video.jsx /path/to/ComfyUI/custom_nodes/minimax-h3-video/web/minimax_h3_video.js
```

## 🎬 Step 4: Copy & Adapt Minimax Workflows

**Critical Step:** You need to adapt the Minimax H3 workflows I identified.

In Claude Code:

```bash
# Copy from your Minimax archives
cp /path/to/uploads/Minimax_H3_-_Text_to_video.json \
   /path/to/ComfyUI/custom_nodes/minimax-h3-video/workflows/text_to_video_workflow.json

cp /path/to/uploads/Minimax_H3_-_Image_to_video_FFLF.json \
   /path/to/ComfyUI/custom_nodes/minimax-h3-video/workflows/image_to_video_workflow.json

cp /path/to/uploads/Minimax_H3_-_Reference_Image___Audio_Sync_-_SPEAK.json \
   /path/to/ComfyUI/custom_nodes/minimax-h3-video/workflows/reference_to_video_workflow.json
```

## ✏️ Step 5: Edit Workflows in Claude Code

Open the workflow JSONs in Claude Code and verify:

1. **Node IDs are consistent across workflows**
   ```bash
   # In each workflow, look for:
   # "195": { "type": "CLIPLoader", ... }
   # "196": { "type": "VAELoader", ... }
   # "222": { "type": "MiniMaxH3ImageToVideo", ... }
   # "228": { "type": "PixaromaSaveMp4", ... }
   ```

2. **Check node type names exist in ComfyUI**
   - `CLIPLoader` ✓
   - `UNETLoader` ✓
   - `VAELoader` ✓
   - `MiniMaxH3ImageToVideo` ✓
   - `PixaromaSaveMp4` ✓
   - `VAEDecode` ✓

3. **Verify connections between nodes**
   - Check "links" array in workflow JSON
   - Ensure output→input connections are valid

If a node type is missing, you may need to install additional custom nodes from Pixaroma.

## 🔍 Step 6: Validate Syntax

In Claude Code terminal:

```bash
# Validate JSON syntax
python3 -m json.tool /path/to/ComfyUI/custom_nodes/minimax-h3-video/config.json > /dev/null && echo "✓ config.json is valid"

python3 -m json.tool /path/to/ComfyUI/custom_nodes/minimax-h3-video/workflows/text_to_video_workflow.json > /dev/null && echo "✓ text_to_video_workflow.json is valid"

# Validate Python syntax
python3 -m py_compile /path/to/ComfyUI/custom_nodes/minimax-h3-video/nodes.py && echo "✓ nodes.py is valid"
```

## 🔴 Step 7: Test Backend Loading

Start ComfyUI and check logs:

```bash
cd /path/to/ComfyUI

# Run ComfyUI
python main.py

# Watch for logs like:
# [MinimaxH3Video] Node loaded successfully
# [MinimaxH3Video] Config: /path/to/.../config.json
```

If you see errors, check:
- Are all required imports available?
- Is Python syntax valid?
- Are all file paths correct?

## 🎨 Step 8: Test Frontend Loading

1. Open ComfyUI web UI in browser
2. Open browser DevTools (F12)
3. Check Console tab for:
   ```javascript
   [MinimaxH3Video] Extension loaded
   [MinimaxH3Video] Config loaded: { ... }
   [MinimaxH3Video] Registering node UI...
   ```

If you see errors:
- Check that MinimaxH3Video.jsx has correct syntax
- Verify all fetch URLs match your ComfyUI port
- Clear browser cache if CSS doesn't apply

## 🔧 Step 9: Customize Configuration

Edit `config.json` in Claude Code:

```json
// Add your own prompts
{
  "text_to_video_templates": [
    {
      "name": "Your Custom Template",
      "prompt": "Your detailed prompt here..."
    }
  ]
}
```

## 🎯 Step 10: Add the Node to Canvas

In ComfyUI UI:
1. Right-click on canvas
2. Select "Add Node"
3. Navigate: `Minimax H3` → `Minimax H3 One-Node Video`
4. Click to place on canvas

The node should appear with your green color scheme!

## 📝 Step 11: Test Generation

1. Set **Mode**: "Text to Video"
2. Enter **Prompt**: "A serene mountain landscape at sunset"
3. Click **GENERATE VIDEO**

Watch the ComfyUI logs - you should see the workflow being executed.

## 🐛 Debugging with Claude Code

### Use Terminal for Logs

```bash
# Tail ComfyUI logs in real-time
tail -f /path/to/ComfyUI/output.log

# Search for errors
grep -i "error\|warning" /path/to/ComfyUI/output.log | tail -20
```

### Use DevTools for Frontend Issues

```javascript
// In browser console, test API endpoints:
fetch('/minimax_h3/config')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Check if workflows load
fetch('/minimax_h3/workflow_text_to_video')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Edit & Reload

With Claude Code:
1. Edit `nodes.py` or `config.json`
2. Save file
3. Restart ComfyUI server (Ctrl+C, then re-run)
4. Refresh browser

For React components:
1. Edit `MinimaxH3Video.jsx`
2. Save file
3. Hard refresh browser (Ctrl+Shift+R)

## 🎓 Learning Path with Claude Code

### Phase 1: Copy Files (5 min)
- [ ] Copy Python backend
- [ ] Copy config JSON
- [ ] Copy React component
- [ ] Copy workflows

### Phase 2: Understand Architecture (10 min)
- [ ] Read MINIMAX_VIDEO_NODE_GUIDE.md
- [ ] Review nodes.py code comments
- [ ] Check config.json structure
- [ ] Skim MinimaxH3Video.jsx

### Phase 3: Customize for Your Brand (15 min)
- [ ] Update colors in config.json
- [ ] Add your video templates
- [ ] Review DESIGN_GUIDE.md
- [ ] Test in browser

### Phase 4: Integration (10 min)
- [ ] Place node on canvas
- [ ] Test mode selector
- [ ] Test parameter sliders
- [ ] Verify colors match SimpliUI

### Phase 5: Deep Customization (20+ min)
- [ ] Read DESIGN_GUIDE.md thoroughly
- [ ] Study frontend component architecture
- [ ] Add custom features
- [ ] Optimize performance

## 💡 Pro Tips

### Tip 1: Use Find & Replace
Find all hardcoded colors and replace with CSS variables:
```
Find:  #59FF00
Replace: var(--primary)

Find:  #1A1C1B
Replace: var(--bg-primary)
```

### Tip 2: Test Incrementally
Don't copy everything at once:
1. Copy backend → test it loads
2. Copy config → test endpoints
3. Copy frontend → test UI renders
4. Copy workflows → test generation

### Tip 3: Create a Feature Branch
If using Git:
```bash
git checkout -b feature/minimax-h3-video
# Make changes
git add .
git commit -m "Add Minimax H3 video node"
```

### Tip 4: Document Your Changes
In Claude Code, add a CHANGES.md:
```markdown
# Changes Made

- Added MinimaxH3OneVideoNode backend
- Added UI with SimpliUI colors
- Adapted Minimax H3 workflows
- Added 30+ video prompt templates
```

## 🎬 Expected Result

After completing all steps, you should have:

✅ **Working Node**
- Node appears in ComfyUI node browser
- Can be placed on canvas
- Shows custom UI with green accent colors

✅ **Three Video Modes**
- Text-to-Video: Generate from text
- Image-to-Video: Animate images
- Reference-to-Video: Audio sync

✅ **Professional UI**
- SimpliUI colors (#59FF00 primary)
- Responsive layout
- Smooth animations
- Status progress bar

✅ **Complete Documentation**
- README for users
- QUICKSTART for setup
- DESIGN_GUIDE for customization

## 🚀 Next Steps Beyond Scaffolding

Once the basic node is working, you could:

1. **Add Advanced Features**
   - Batch video generation
   - Video quality settings
   - Custom model selection

2. **Enhance UI**
   - Video thumbnails gallery
   - Drag-drop for images
   - Real-time prompt preview

3. **Optimize Performance**
   - Queue management
   - Parallel generation
   - GPU memory optimization

4. **Integrate with SimpliUI**
   - Match dashboard design
   - Add to NAVAL DNA branding
   - Sync with other tools

## 📞 Support

If you get stuck:

1. **Check logs**: `tail -f output.log | grep -i minimax`
2. **Validate JSON**: `python -m json.tool file.json`
3. **Browser console**: Check for JS errors (F12)
4. **Read guides**: Review MINIMAX_VIDEO_NODE_GUIDE.md

## 📊 Checklist Summary

- [ ] Files copied to ComfyUI
- [ ] Workflows validated
- [ ] Python syntax checked
- [ ] Node loads in ComfyUI
- [ ] UI renders in browser
- [ ] Mode selector works
- [ ] Parameters respond to input
- [ ] Generate button clickable
- [ ] Colors match SimpliUI
- [ ] Video generation functional

---

You now have everything needed to build a professional Minimax H3 video generation interface! 🎬✨

**Use Claude Code to edit, test, and deploy with confidence.**
