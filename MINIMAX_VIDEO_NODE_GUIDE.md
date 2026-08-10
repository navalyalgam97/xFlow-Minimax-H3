# Build Minimax H3 Video Generation Node with xFlow Architecture

## Overview
You're building a **single-node video generation interface** mirroring xFlow One Image, but adapted for Minimax H3 video workflows. The architecture uses:

- **Backend**: Python node in ComfyUI (similar to FluxKleinOneNode)
- **Frontend**: React/JS with your SimpliUI color palette (#59FF00 bright green)
- **Workflows**: Minimax H3 workflows (text-to-video, image-to-video, reference-to-video)
- **Output**: MP4 video files with metadata

## Key Differences from xFlow One Image

| Aspect | Image (xFlow) | Video (Minimax H3) |
|--------|---------------|--------------------|
| **Output Type** | PNG image | MP4 video |
| **Duration** | N/A | 1-30 seconds (configurable) |
| **FPS** | N/A | 24/30 fps |
| **Preview** | Image canvas | Video player |
| **Metadata** | Embedded in PNG | Sidecar JSON |
| **Key Nodes** | MiniMaxH3ImageToVideo | MiniMaxH3ImageToVideo + PixaromaSaveMp4 |

## Architecture Layers

### Layer 1: Backend (Python) - `nodes.py`
```
┌─────────────────────────────────────────────────┐
│ MinimaxH3OneVideoNode                           │
│ - INPUT_TYPES: prompt, video_params             │
│ - generate_video: Calls Minimax API             │
│ - Returns: VIDEO tensor                         │
└─────────────────────────────────────────────────┘
         ↓ (via REST API)
┌─────────────────────────────────────────────────┐
│ Minimax H3 Workflow Engine                      │
│ - Text-to-Video                                 │
│ - Image-to-Video                                │
│ - Reference-to-Video with Audio Sync            │
└─────────────────────────────────────────────────┘
```

### Layer 2: Frontend (React) - `web/MinimaxH3Video.jsx`
```
┌────────────────────────────────────────────────────┐
│ MinimaxH3VideoUI                                   │
├────────────────────────────────────────────────────┤
│ [Mode Selector]  [Prompt Input]  [Generate]       │
│ ┌──────────────────────────────────────────────┐  │
│ │ Video Preview (MP4 player)                   │  │
│ │ - Duration control (1-30s)                   │  │
│ │ - FPS selector (24/30)                       │  │
│ └──────────────────────────────────────────────┘  │
│ [Settings] [Queue] [Download Video]              │
└────────────────────────────────────────────────────┘
```

### Layer 3: Workflows (JSON) - `workflows/`
- `text_to_video_workflow.json` - Text → Video
- `image_to_video_workflow.json` - Image → Video
- `reference_to_video_workflow.json` - Reference Image + Audio → Video

## Step-by-Step Implementation

### Step 1: Backend Setup

**Create `nodes.py`** (ComfyUI custom node)
- Define `MinimaxH3OneVideoNode` class
- Inherit workflow loading from xFlow pattern
- Handle video output differently (save MP4 instead of PNG)
- Support Minimax-specific parameters:
  - `video_duration` (1-30 seconds)
  - `fps` (24 or 30)
  - `motion_strength` (0.0-1.0)
  - `guidance_scale` (1-10)

**Key differences from xFlow:**
- Output: `("VIDEO",)` instead of `("IMAGE",)`
- Store video metadata in JSON sidecars (not PNG chunks)
- Handle MP4 files with duration/codec metadata
- Queue videos differently (video processing is slower)

### Step 2: Config File

**Create `config.json`** (UI templates & presets)
```json
{
  "video_modes": {
    "t2v": "Text-to-Video",
    "i2v": "Image-to-Video", 
    "r2v": "Reference-to-Video with Audio"
  },
  "duration_presets": [1, 4, 8, 16, 30],
  "fps_presets": [24, 30],
  "motion_strength_templates": [
    {"label": "Static", "value": 0.0},
    {"label": "Subtle", "value": 0.3},
    {"label": "Balanced", "value": 0.6},
    {"label": "Dynamic", "value": 0.9}
  ],
  "prompt_templates": {
    "cinematic": "Cinematic scene with...",
    "product": "Product showcase video...",
    "travel": "Travel vlog establishing shot..."
  }
}
```

### Step 3: Frontend Setup

**Create `web/MinimaxH3Video.jsx`** (React component)
- Use SimpliUI palette: `#59FF00` (bright green), `#555D58` (ebony)
- Layout: Based on xFlow but with video-specific controls
- Video player: HTML5 `<video>` tag with controls
- Progress indicator: Show generation status + ETA

**UI Components:**
```jsx
<MinimaxH3Video>
  ├── ModeSelector (T2V / I2V / R2V)
  ├── PromptEditor
  ├── VideoParametersPanel
  │   ├── DurationSlider (1-30s)
  │   ├── FpsSelector (24/30)
  │   ├── MotionStrengthSlider
  │   └── GuidanceScale
  ├── VideoPreview (HTML5 player)
  ├── GenerateButton
  ├── HistoryPanel (thumbnail grid of past videos)
  └── ExportPanel (download MP4 + metadata)
```

### Step 4: Workflow Adaptation

**Copy Minimax workflows**, then modify:**
1. Add your custom node between Minimax nodes and SaveImage
2. Embed video duration/fps in workflow parameters
3. Use PixaromaSaveMp4 or custom SaveVideoNode for output

**Workflow structure:**
```
[Prompt Input] → [MiniMaxH3ImageToVideo] → [VAEDecode] → [PixaromaSaveMp4] → [Your Node]
[Duration, FPS settings configured in Your Node]
```

## Color Palette Integration

Your SimpliUI colors:
```
#59FF00 - Bright Green (primary accent, buttons, progress)
#95FF77 - Screamin' Green (hover states, highlights)
#555D58 - Ebony (secondary text, borders)
#2A2E2E - Jet (backgrounds)
#1A1C1B - Eerie Black (main background)
```

CSS Variables:
```css
--primary: #59FF00;
--primary-hover: #95FF77;
--bg-primary: #1A1C1B;
--bg-secondary: #2A2E2E;
--border: #555D58;
--text-primary: #dedede;
--text-muted: #565656;
```

## Implementation Checklist

- [ ] **Backend**
  - [ ] Create `nodes.py` with `MinimaxH3OneVideoNode`
  - [ ] Implement workflow loader (copy from xFlow)
  - [ ] Add video output handler (MP4 + metadata)
  - [ ] Create REST endpoints for video preview/download
  - [ ] Implement favorites system (optional)

- [ ] **Config**
  - [ ] Create `config.json` with video presets
  - [ ] Add prompt templates for each video mode
  - [ ] Define motion strength templates
  - [ ] Add guidance scale recommendations

- [ ] **Frontend**
  - [ ] Create React component (or vanilla JS if preferred)
  - [ ] Implement video player with controls
  - [ ] Build parameter sliders (duration, fps, motion, guidance)
  - [ ] Add mode selector
  - [ ] Implement progress/status display
  - [ ] Build history/favorites panel
  - [ ] Add export/download functionality

- [ ] **Workflows**
  - [ ] Adapt T2V workflow with your node
  - [ ] Adapt I2V workflow with your node
  - [ ] Adapt R2V workflow with audio sync
  - [ ] Test workflow loading and execution

- [ ] **Styling**
  - [ ] Apply SimpliUI color palette
  - [ ] Create Visura-inspired dashboard layout
  - [ ] Add smooth animations
  - [ ] Responsive design for mobile

## File Structure
```
minimax-h3-video/
├── nodes.py                          (Backend)
├── config.json                       (UI config)
├── web/
│   ├── MinimaxH3Video.jsx           (React component)
│   ├── styles.css                    (Styling)
│   └── colors.js                     (Color palette)
├── workflows/
│   ├── text_to_video_workflow.json
│   ├── image_to_video_workflow.json
│   └── reference_to_video_workflow.json
├── assets/
│   └── previews/                     (Thumbnail gifs)
└── README.md
```

## Key Learnings from xFlow Architecture

1. **Single-Node Pattern**: Everything runs through ONE custom node; logic lives in JS
2. **Workflow Templates**: Load different workflows (T2I/Edit/Inpaint) based on mode
3. **Metadata Handling**: Store generation params as JSON sidecars + PNG chunks
4. **Favorites System**: Track user-created variations in favorites.json
5. **REST API**: JS communicates via POST/GET for video preview, download, metadata
6. **Progress Tracking**: Use WebSocket or polling for real-time status updates

## Next Steps
1. Copy the complete code scaffolding (below)
2. Adapt Minimax workflow JSONs (replace node references)
3. Run in Claude Code terminal
4. Test with sample prompts
5. Refine UI/UX based on feedback
