# Changelog - xFlowOne · Minimax H3

All notable changes to the **xFlowOne · Minimax H3** single-node video interface for ComfyUI.

## [1.12.1] - 2026-08-20

### 🐛 The LoRA Drawer Opened Into The Node's Bottom Edge

- **⬆️ Drawer Floats Above The Prompt Instead Of Pushing Layout**: the panel root is a fixed 16:9 box with `overflow: hidden`, so a drawer that grows downward ran straight past the node's bottom edge — half-drawn rows, a squeezed prompt box. It is now absolutely positioned above the prompt area, capped at 260px with its own scroll, and the prompt stays exactly where it was.
- **📏 Long Filenames No Longer Push The Row's Own Controls Out**: the LoRA `<select>` was `flex: 1` with no `min-width: 0`, so a long `.safetensors` name blew past the row and shoved the strength box and the remove button out of sight. The name truncates now.
- **🟩 No Lit-Up Border On Finished Downloads**: an installed model card keeps the neutral border — the "Installed" badge and the filled progress bar already carry that state, and a green outline on every completed card turned the whole Setup pile green.

---

## [1.12.0] - 2026-08-20

### ✨ Turbo 8-Step LoRA: One Click In Setup, Loaded By The Workflow

The T2V workflow now carries a `PixaromaLoraLoader`, and the LoRA it wants is a button in the Setup pile instead of a manual download.

- **⬇️ Turbo LoRA In The Models & Setup Manager**: `minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors` (1.96 GB, from `lightx2v/Minimax-h3-Turbo`) is now a card in Setup with the same download / pause / resume / delete / progress the weights get. It lands in `ComfyUI/models/loras/`. Deliberately **not** part of `validate_minimax_environment` — it is optional, so a missing copy never blocks a run.
- **🔗 It Loads In The LoRA Loader Itself**: the first time it reports installed, the filename is written into a slot in the **Add LoRA** drawer, so the next run actually uses it. A LoRA picked before the folder listing refreshes still shows in its row rather than reading "Select LoRA safetensors...".
- **🧩 LoRA Rows Reach The Submitted Prompt**: the payload builder now has a `PixaromaLoraLoader` branch and a `loraLoaderState` patcher. The node's state lives on `node.properties` as a **JSON string**, and the generic state carry only handles objects — so without this the loader ran with whatever the template was saved with, ignoring the drawer entirely.
- **🐛 The LoRA Loader's MODEL Output Went Nowhere**: in the updated T2V template the `KSampler` was still fed straight from `UNETLoader`, with only CLIP routed through the LoRA loader. Every LoRA would have tuned how trigger words are read and left the diffusion model untouched. `KSampler.model` now comes from the LoRA loader.
- **📁 Template Ships With Empty LoRA Rows**: same reason sample filenames were cleared in 1.11.2 — a name baked into a template resolves on no other machine.

---

## [1.11.2] - 2026-08-13

### 🐛 Workflow Templates Shipped With Sample Filenames Baked In

The real cause of *"[Pixaroma] Load Audio: no usable sound file selected"* on a machine that had never seen that file.

- **📁 Sample Filenames Cleared From All Templates**: the workflow JSONs carried Pixaroma's demo assets — `I can talk audio.wav`, `I am pixa bunny.mp3`, `Pixa Bunny HipHop.jpeg`, `WomanPortraitRed.png`, `BallerinaBunny.png`, `BunnySitting.jpg` — as loader defaults. They resolve on a machine with the Pixaroma samples installed and fail everywhere else, which is why a fresh cloud GPU box hit it immediately. Model loader filenames (the `.safetensors`) are untouched.
- **🔑 `loadAudioState.file` Is Now Assigned Unconditionally**: Pixaroma reads this state **in preference to the widget value**, and the patcher only wrote it `if (audio)`. With no audio selected, whatever filename the template had been saved with survived into the submitted run. It is now set to the chosen file or cleared outright.

> If you saved a workflow template from your own ComfyUI, it carries your local filenames in `properties.*State`. That is what leaked here.

---

## [1.11.1] - 2026-08-13

### 🐛 Audio Is Optional, And Stale Filenames No Longer Kill A Run

- **🔇 Audio Track Optional** (`AUDIO FILE (OPT)`): with no audio, `PixaromaLoadAudio` failed the whole prompt with *"no usable sound file selected"*. The loader is now pruned when unused — but `PixaromaH3AudioSync` cannot simply go with it, since **model** and **latent** pass through it on the way to the KSampler. It is bypassed instead: consumers are re-pointed at whatever fed the input of the same name, and `PixaromaSaveMp4.audio` (an optional input) is dropped, so the mp4 is written without an audio track.
  - Verified across every combination in both R2V workflows: with audio the sync node stays and the sampler reads from it; without, the sampler reads `model` from `UNETLoader` and `latent` from `MiniMaxH3ReferenceToVideo` directly. No dangling links in any case.
  - With no audio there is nothing to lip-sync to, so SPEAK/SING produce a silent clip driven by the prompt and references alone.
- **📁 Missing Input Files Are Treated As Unset**: uploaded filenames persist across sessions, but the files live in ComfyUI's input folder — a different machine after moving to a cloud GPU box, or simply cleaned out. Submitting a remembered name whose file has gone failed the entire prompt. Optional inputs (audio, reference video, second reference image) are now checked against the input folder before submitting; anything missing is pruned and named in a console warning instead of aborting the run.

---

## [1.11.0] - 2026-08-13

### 🖼️ Second Reference Image & Reference Video For R2V

- **🖼️ Optional Second Reference Image** (`REF IMAGE 2 (OPT)`): feeds `ref_images.ref_image_1`. The output resolution is still driven by reference image 1 alone — the second image is deliberately not wired to the model's `width`/`height`.
- **🎬 Optional Reference Video** (`REF VIDEO (OPT)`): feeds `ref_videos.ref_video_0` via `PixaromaLoadVideo`. In this template the video's own audio track also supplies `ref_audios.ref_audio_0`.
- **✂️ Both Are Genuinely Optional**: an unset loader submits an empty filename and ComfyUI rejects the *entire* prompt, so anything unused is lifted back out of the submitted graph — loader, any intermediate resize node, and the model link. With neither in use, R2V submits exactly the 18-node graph it always did.
  - Dropping the video must not take the reference audio with it: `ref_audios.ref_audio_0` falls back to the uploaded audio track, which is what fed it before the video input existed. Lip-sync is unaffected either way — `PixaromaH3AudioSync.track` always comes from the audio file.
  - All four combinations (image 2 + video / image 2 / video / neither) were checked against both R2V workflows: valid graph, no dangling links, no empty filenames.
- **🔀 Image Slot Routing Reads The Graph, Not Titles**: the R2V template ships two `PixaromaLoadImageMini` nodes **both titled "3. Load Image"**, so the old title-based match sent the second image's filename to the first slot. Slots are now resolved by walking back from each `ref_images.ref_image_N` input to its loader, through any intermediate node. Titles remain the fallback for I2V's end frame, whose model node has no `ref_image_N` inputs.
- **📦 R2V Workflow Templates Updated**: both SPEAK and SING now carry the second image loader and the video loader.
- **🎙️ Two-Picture Prompt Presets**: loading a second reference switches the R2V preset to wording that references `<Picture 1>` and `<Picture 2>`, and reverts when it is cleared. Text you wrote yourself is still never overwritten.

> **Requires a MiniMax H3 node build exposing `ref_images.ref_image_1` and `ref_videos.ref_video_0`.** Older builds still work as before — leave the two optional slots empty and those inputs are pruned from the graph entirely.

---

## [1.10.0] - 2026-08-12

### ⏱️ Generation Timer, Stop Button, GPT Prompt Helper

- **⏱️ Seven-Segment Generation Timer**: Counts up under the preview caption from the moment Generate is pressed, freezes on the total when the clip lands, holds ~3s so it can be read, then fades off the picture. A deliberate play, scrub or click on the player clears it immediately; any failure hides it rather than stranding a frozen count.
  - Drawn as SVG rather than shipped as a font: a real LCD face needs the unlit segments ghosted behind the lit ones, and there is no external asset to load. Hard black drop-shadow first, lime bloom second, so the digits keep their edge over a bright frame.
  - The finished time nearly never survived: the player carries `autoplay`, so `load()` alone fires `play`/`seeking`. The suppression flag now goes up *before* `src` is touched.
- **🛑 Stop Generation Button**: Replaces the chime preview button beside Generate. Inert and dimmed unless a run of **this node** is in flight, so an idle node can never interrupt somebody else's queue item.
  - Sends `POST /queue {delete:[prompt_id]}` **and** `POST /interrupt`: interrupt only reaches the job ComfyUI is currently executing, so a prompt still waiting in the queue needs deleting by id. Which state it is in is a race, so it does both.
  - Clears `activePromptId`, so a late event from the killed run cannot drive the node afterwards.
- **✨ Generate Button Feedback**: Firefly glow on the button while a run is in flight — uneven beats rather than a symmetric pulse — and the sparkle icon beside "Generating..." now actually spins. Idle no longer glows: the button had carried a permanent halo since long before this release.
- **🤖 GPT Prompt Button**: Replaces "Director" in the prompt header, styled like Setup. Opens the prompt-writing GPT for the active mode in a new tab (R2V has its own; T2V and I2V share one), with `noopener,noreferrer`. The negative-prompt toggle that Director used to own survives as its own control, so the field stays reachable.
- **🎙️ Default R2V Prompts**: SPEAK and SING each get a full default prompt, filled on entering R2V and swapped when toggling between them. Only an empty box or the other preset is ever replaced — text you wrote yourself is never clobbered. Leaving R2V takes the preset with it (it is written for a reference image and an audio track), and a **Reset** button restores it if deleted by accident.
- **🐛 Panel Hung Past The Node's Right Edge**: `root` hardcoded `NODE_W`, but ComfyUI insets the DOM-widget slot ~12px each side, so the panel overflowed by 24px. It now fills the slot.
  - Fixing that exposed a second fault: the slot takes its height from **content**, not from `computeSize` — probing node heights from 760 to 900 left it at 870 every time — so `height: 100%` dropped the panel to 1.536. Height now derives from width via `aspect-ratio: 16 / 9`, holding a true 1.778 in all three modes.
- **🧹 Internal**: Three copy-pasted button-reset blocks collapsed into `resetGenerateButton()`. The duplication had already caused two defects here by being updated in some copies and not others.

---

## [1.9.0] - 2026-08-12

### 🖼️ Gallery Rework, Fullscreen Mode, 16:9 Node, Settings Panel Fixes

- **🖼️ Gallery Thumbnail Grid**:
  - Replaced the padded video cards with a dense grid of square, edge-to-edge tiles. The filename is a translucent caption bar across the bottom of each tile; hovering previews the clip in place and reveals a corner delete button.
  - Clicking a tile opens it **full view inside the node** — scaled to fill, aspect ratio preserved, with native controls. Closing returns to the grid, and the tile you opened keeps a lime outline.
  - The full-view header carries a **Download** button (`<a download>` against the node's own `video_file` route), so a ComfyUI running on a remote or cloud box can hand the clip to the user's local machine. "Open Output Folder" only ever opened a folder on the server.
- **⛶ Fullscreen Mode**:
  - Icon-only toggle at the right of the node's top bar. Uses the native Fullscreen API, falling back to a viewport-pinned overlay where the browser refuses the request (embedded webviews, restricted hosts). Esc exits either path.
  - The element is parked on `<body>` for the fallback: litegraph transforms the widget's ancestors every frame, and a transformed ancestor makes `position: fixed` resolve against it rather than the viewport.
  - ComfyUI's DOM-widget pass sets `display: none` once the element stops matching a node on the canvas — a `MutationObserver` puts it back while the node owns the element, in both the native and fallback paths.
- **📐 Node Is Now A Fixed 16:9** — `1360 × 765`. Widened rather than shortened so the left control column still fits without reflowing.
- **🔢 `SIZE TABS` / `SHAPE CHIPS` Are Single-Select Again**:
  - 1.8.0 made these curate *which chips appear on the node face*, capped at five. Five lit buttons read as a broken radio group, so they are back to choosing one size and one shape — and that choice is the resolution the node generates and the ratio it crops to.
  - Picking a value outside the five node-face defaults swaps it onto the row, so the selection is always visible on the node. `keep` still means uncropped, so a workflow that never opens this panel is unaffected.
- **🐛 `ROUND SIZES TO → Off` Did Nothing** — `Off` is `0`, read back through `S.step_round || 32`, so it was written and instantly re-read as `32`. The selection snapped back and the node badge showed `x32`. Now `??`, and the badge reads `Off`. The value was always sent correctly; only the UI misreported it.
- **🐛 SEED Unreachable In I2V / R2V** — two stacked flexbox faults. The left column's scroll area lacked `min-height: 0`, so as a flex item it never shrank below its content and `overflow-y` never engaged. Worse, its cards shrink by default: the Advanced Options accordion has `overflow: hidden`, so it was squeezed below its natural height and clipped its own tail. Cards are now pinned with `flex-shrink: 0` and the column scrolls.
- **💅 Settings Panel Layout** — the Longest Side overlay is a centred 880px panel instead of controls stranded against the left edge of a 1360px node. Rows fill it uniformly, so every section shares the same left and right edges.
- **💬 Help Drawer** — social buttons were `flex: 1` and stretched into banners; they are content-sized now. The Discord button reads "For support join Discord Server", the GitHub Repository button is gone, and the installed version sits quietly in the bottom-right corner.

---

## [1.8.0] - 2026-08-11

### 🐛 Reference & Audio Generation Repaired, Gallery Auto-Save, Player Controls

This release fixes a set of defects that between them meant **R2V (Reference + Audio) and I2V never actually used your reference image or audio**. Every generation in those modes silently ran the text-to-video workflow instead.

- **🎯 Correct Workflow Per Mode** *(the root cause)*:
  - The Generate handler resolves the mode pill into a workflow name (`R2V` → `reference_to_video`), but `executePixaromaWorkflow` still tested for the raw pill ids (`"R2V"`, `"I2V"`). The resolved names matched no branch and fell through to `text_to_video` — a workflow that contains **no** `PixaromaLoadImageMini` and **no** `PixaromaLoadAudio`. The reference nodes were never in the submitted graph, so the model generated a stranger from the prompt alone.
  - Replaced the ternary chain with an explicit mode map covering both spellings. An unrecognised mode now **throws** instead of silently defaulting to `text_to_video`.
  - Only the `_fflf` and `_sing` paths were ever unaffected, because their resolved names happened to equal the strings being tested.
- **📦 Pixaroma State Serialization**:
  - Pixaroma nodes keep their real configuration in `node.properties.<xxx>State` as **hidden STRING inputs holding JSON**, injected by the frontend at `graphToPrompt` time — a path this node bypasses by posting to `/prompt` directly. States were being sent as nested objects.
  - `_longest_side_helpers.parse_state` and `_duration_helpers.parse_state` accept a dict, so duration appeared to work, but `node_load_audio._state` uses a bare `json.loads()` that raises `TypeError` on a dict and degrades to `{}` → *"no usable sound file selected"*.
  - States are now `JSON.stringify`'d with UI-only keys stripped, matching Pixaroma's own `strip_ui_keys`.
- **📐 Longest Side Settings Panel**:
  - `SIZE TABS` and `SHAPE CHIPS` in the settings overlay were wired to `S.longest_side` / `S.aspect_ratio`. In Pixaroma those rows choose **which chips appear on the node face** — so curating the row silently changed the output resolution. Selecting `1024` and `1:1` there turned an 864/keep portrait job into a 1024×1024 square one.
  - They now toggle list membership (max 5, never empty); the selection follows when its chip is removed; off-row persisted state is repaired on load.
  - Adds the **UPSCALING** toggle and routes `ROUND SIZES TO` (`step_round`) through — both change real output dimensions.
- **💾 Auto-Save Toggle Now Functional**:
  - The toggle only flipped a persisted boolean; nothing read it. Separately, the Gallery lists `output/MinimaxH3` while `PixaromaSaveMp4` always wrote to the output **root**, so saved videos could never appear there.
  - **On** → `output/MinimaxH3/` with `save_mode=save`, visible in the Gallery tab. **Off** → `temp/`, cleared on restart.
  - Completion writes the metadata sidecar (prompt, mode, size, duration, fps, seed) that Gallery cards read back.
- **▶️ Video Player Controls**:
  - `mk(tag, css, props)` assigns its second argument to `element.style`, so both video elements passed `controls` / `autoplay` / `loop` / `muted` — and, in Gallery cards, `src` — as CSS properties. They were silently dropped: no transport bar, no replay, and Gallery thumbnails had no source at all.
- **🔄 Reliable Completion Handling**:
  - The generate button and in-node player were driven solely by the `executed` websocket event, which can be missed on reconnect — leaving the node stuck on *"Generating…"* with no recovery.
  - Completion is now also polled from `/history` for the node's own `prompt_id`; whichever path arrives first finishes the run, plays the video, or surfaces the real execution error.
  - Execution events are matched against the node's own `prompt_id`, so a run queued from another tab no longer drives this node's status — previously a failed job here could look like somebody else's success.
- **🧩 Model Resolution No Longer Guesses**:
  - `resolveModelName` fell back to `choices[0]` when a name did not match, silently assigning `pixel_space` to **both** the video and audio VAE and producing a plausible-but-wrong video. It now keeps the requested name so ComfyUI rejects the prompt with a clear error, and logs what is installed.
- **💥 `NameError` on Node Execution**:
  - `_last_output_by_node` was written by `generate_video` and by `/minimax_h3/set_output` but **never defined**, so executing `MinimaxH3OneVideoNode` died with `NameError` before returning its `VIDEO` and `metadata_json` outputs.
- **🔍 Diagnostics**:
  - Submitted payloads are logged to the browser console and mirrored to `last_payload.json` next to the node via `/minimax_h3/debug_payload`, so a remote install can be diagnosed from a terminal.

---

## [1.7.0] - 2026-08-10

### 🚀 Embedded Inline Drawers, Pixaroma Credits & Community Social Hub
- **📖 Embedded Inline Help Drawer Panel**:
  - Embedded inline Help drawer inside the node container positioned between `topBar` and `promptSection`.
  - Comprehensive step-by-step user guides for **T2V (Text-to-Video)**, **I2V (Image-to-Video & FFLF Interpolation)**, **R2V (SPEAK / SING Audio Sync)**, and **Advanced Options**.
  - **Pixaroma (`ComfyUI-Pixaroma`)** open-source acknowledgements with direct GitHub repo link button.
  - **Join Discord Community Server** button (`https://discord.gg/dnfaGvcsE`) and **GitHub Repository** button (`https://github.com/navalyalgam97/xFlow-Minimax-H3`) with custom vector SVG icons (`discord`, `github`).
  - Utilizes `window.open(url, "_blank")` event handlers to guarantee clean URL opening in new browser tabs.
- **⚙️ Embedded Inline Setup Drawer Panel**:
  - Embedded inline Setup panel matching the Help panel 1:1 in layout, topBar visibility, and bottom prompt bar visibility.
  - Houses all 5 Minimax H3 model cards (`fl2va`, `ref2va`, `clip`, `video_vae`, `audio_vae`) with real-time download progress bars, MB/s speed badges, pause, resume, delete actions, and direct HuggingFace links.
- **🔄 Mode Tab Auto-Close**:
  - Clicking any mode tab (`T2V`, `I2V`, `R2V`) automatically closes active Help or Setup drawers and restores the 2-column video generation layout.

---

## [1.6.0] - 2026-08-10

### 🚀 Web Audio Waveform Cropper & Dynamic SPEAK / SING Workflow Engine
- **🎛 Web Audio API Waveform Cropper & Timeline Editor Modal**:
  - Interactive top-right Gear button (`⚙`) on uploaded audio boxes opening a full-screen Web Audio API canvas editor.
  - **Interactive Selection Handles**: Left/Right bracket handles (`[` and `]`) with mouse drag selection and live start/end time ruler (`0s`, `30s`, `1m`...).
  - **Timeline Zoom & Stretch**: Multi-level zoom controls (`1x`, `2x`, `5x`, `10x`, `🔍 Fit Selection`) and mouse wheel horizontal panning across long audio tracks.
  - **Crop Duration Selector**: Preset selection (`Match Video (4s)`, `5s`, `10s`, `Full Audio`, custom input).
  - **16-bit PCM WAV Trimmer & Audio Reload**: Cuts audio buffer in memory, converts to WAV Blob, reloads HTML5 `<audio>` element (`audioPlayer.load()`), updates filename duration badge, and auto-closes on apply.
- **🎙️ / 🎵 Dynamic SPEAK vs SING Workflow Engine**:
  - Added **SPEAK** vs **SING** audio sync pill selector for R2V mode.
  - **SPEAK** selection $\rightarrow$ Automatically routes to `reference_to_video` workflow (`workflows/reference_to_video_workflow.json`) for speech lip-sync video generation.
  - **SING** selection $\rightarrow$ Automatically routes to `reference_to_video_sing` workflow (`workflows/reference_to_video_sing_workflow.json`) for singing audio sync video generation.
  - Dynamic backend pre-flight model validation for `ref2va` and `audio_vae` model weights.

---

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
