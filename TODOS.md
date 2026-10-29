# TODOS

## Frontend

### JavaScript test harness for the node UI

**What:** Set up a JS test environment (jsdom plus stubs for ComfyUI's `app.js` and `api`) and cover `web/minimax_h3_video.js`.

**Why:** The file is ~6,000 lines and carries most of the node's behaviour, with no automated test at all. The empty CFG and SEED boxes, the dead `.fk-root` stylesheet, and the audio player with no controls all survived several releases because nothing and nobody looked. A harness turns that class of defect into a failing test instead of a user report.

**Context:** Declared `[]` in `.gstack/pregate.json` so the pre-gate passes with the gap recorded rather than hidden. The file imports ComfyUI's own modules at the top (`../../scripts/app.js`), so it cannot be imported standalone — the work is in stubbing that import, probably through a loader hook or by extracting the pure helpers (`mk`, `patchPixaromaState`, the payload builder) into a module the page and the tests can both load. Start with the payload builder: it is pure data in, data out, and it is what decides what ComfyUI actually runs. Decided in the v1.13.0 ship that this release goes out with the gap recorded.

**Effort:** L
**Priority:** P1
**Depends on:** None

### Reference slot gap handling is untested

**What:** Cover the packing of optional reference images into consecutive `ref_image_N` slots.

**Why:** Filling REF IMAGE 1, skipping 2, then adding 3 used to leave a hole at `ref_image_1`, which renumbers what the model calls `<Picture 2>` against what the UI labels. Fixed in v1.13.0 by packing, but only proven by reading the code — ComfyUI was not running when the fix landed.

**Context:** `web/minimax_h3_video.js`, `refExtras` in `executePixaromaWorkflow`. The index math is `refExtras[0]` → the template's own loader at `ref_image_1`, then `refExtras[i]` → `ref_image_{i+1}` for the clones. Verify in a running ComfyUI with slots 1, 3 and 5 filled, and check the submitted payload has `ref_image_0..2` with no hole. Blocked on the harness above for an automated version.

**Effort:** S
**Priority:** P2
**Depends on:** JavaScript test harness for the node UI

## Backend

### Node id may not match between the browser and the node

**What:** Confirm the id the frontend posts to `/minimax_h3/set_output` matches the `unique_id` ComfyUI passes to `generate_video`.

**Why:** If they differ, the node raises "No clip to hand on yet" after a perfectly good render, and the VIDEO output never works for that user.

**Context:** Raised by the v1.13.0 adversarial review. The frontend posts litegraph's `self.id`; ComfyUI's `unique_id` can be a composite like `"12:3"` for nodes inside a subgraph or group node. Untested because the suite seeds `_last_output_by_node` directly. Also note the record is in-process only, so a ComfyUI restart loses it and the next graph run raises until the user presses Generate again. Reproduce by putting the node inside a group node.

**Effort:** M
**Priority:** P1
**Depends on:** None

### Queue runs fail until a clip exists

**What:** Decide what the node should do when someone presses ComfyUI's Run button before ever pressing Generate.

**Why:** `generate_video` now raises, so any graph containing this node errors on every queue press until a clip has been produced. That is deliberate — it replaced a fabricated path that broke downstream silently — but it is a behaviour change worth a product decision rather than an accident.

**Context:** `minimax_h3_video_nodes.py`, `generate_video`. Options: keep raising with the current message; return an empty VIDEO and let downstream decide; or make the node a no-op passthrough when nothing has been generated. Flagged by the v1.13.0 adversarial review.

**Effort:** S
**Priority:** P2
**Depends on:** None

### Unknown download size shows 0% then jumps to 100%

**What:** Handle `total_bytes == 0` in the Setup panel's progress display.

**Why:** When a server sends no `Content-Length`, the backend now reports `total_bytes: 0` honestly instead of inventing a total. The panel divides by it, so the bar sits at 0% for the whole download and then snaps to 100%.

**Context:** `minimax_h3_video_nodes.py` `_async_download_worker` sets the 0; the panel's progress rendering lives in `web/minimax_h3_video.js`. Show bytes downloaded and a moving indicator instead of a percentage when the total is unknown.

**Effort:** S
**Priority:** P3
**Depends on:** None

### `/minimax_h3/debug_payload` is unauthenticated

**What:** Gate the debug payload dump behind a flag or remove it.

**Why:** Any caller that can reach ComfyUI can overwrite `last_payload.json` in the user config directory, and the payload contains prompts.

**Context:** Raised by the v1.13.0 adversarial review. ComfyUI has no auth by default, so every custom route is as exposed as the server. The route exists to debug what the node actually submits, which is genuinely useful; an environment variable or a config toggle would keep it without leaving it on for everyone.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Testing

### Remaining Python coverage gaps

**What:** Cover `get_gallery`'s URL quoting, the `type == "temp"` clip branch, the favourites migration failure fallback, and `debug_payload`'s new location.

**Why:** Value-weighted coverage sat at 60% at the v1.13.0 ship, the minimum rather than the 80% target. These are the named gaps.

**Context:** Listed by the ship coverage audit. All are small and mirror tests that already exist in `tests/test_minimax_h3_nodes.py`; the temp-directory branch is the most valuable, since it is what Auto-save off uses.

**Effort:** S
**Priority:** P2
**Depends on:** None

## Completed
