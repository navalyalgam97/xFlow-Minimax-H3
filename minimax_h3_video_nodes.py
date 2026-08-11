"""
Minimax H3 One-Node Video Generation Interface
Mirrors xFlow One Image architecture but adapted for video output.

Architecture:
- Single UI node (MinimaxH3OneVideoNode) that handles all video generation modes
- Supports: Text-to-Video, Image-to-Video, Reference-to-Video with Audio Sync
- Models & Setup Manager: Integrated async downloader with pause, resume, delete, and live progress
- Stores video metadata in JSON sidecars (output/MinimaxH3/metadata/<filename>.json)
- Full REST API for gallery, metadata, video streaming, system validation, model downloading, and config patching
"""

import os
import json
import glob
import time
import subprocess
import shutil
import threading
import urllib.request
from pathlib import Path
from typing import Optional, Dict, Tuple, Any, List

import folder_paths
from aiohttp import web
from server import PromptServer

# ═══════════════════════════════════════════════════════════════════════════
# Constants & Paths Configuration
# ═══════════════════════════════════════════════════════════════════════════

NODE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(NODE_DIR, 'config.json')
SUBFOLDER = "MinimaxH3"

# User config directory outside node folder so it survives git pulls/reinstalls
USER_CONFIG_DIR = os.path.join(folder_paths.get_user_directory(), "default", "MinimaxH3OneVideo")
USER_CONFIG_PATH = os.path.join(USER_CONFIG_DIR, "config.json")

# Video defaults
DEFAULT_VIDEO_DURATION = 4  # seconds
DEFAULT_FPS = 24
DEFAULT_MOTION_STRENGTH = 0.5
DEFAULT_GUIDANCE_SCALE = 7.5

SUPPORTED_MODES = {
    "text_to_video": "Text-to-Video",
    "image_to_video": "Image-to-Video",
    "reference_to_video": "Reference Image + Audio"
}

# SimpliUI Color Palette Tokens
COLORS = {
    "primary": "#59FF00",          # Bright green primary
    "primary_hover": "#95FF77",    # Screamin' green hover
    "bg_primary": "#1A1C1B",       # Eerie black
    "bg_secondary": "#2A2E2E",     # Jet background
    "border": "#555D58",           # Ebony border
    "text_primary": "#dedede",
    "text_muted": "#565656",
    "status_generating": "#59FF00",
    "status_error": "#ff6767",
    "status_success": "#59FF00"
}

# ═══════════════════════════════════════════════════════════════════════════
# Required Models Registry & Downloader Manager
# ═══════════════════════════════════════════════════════════════════════════

REQUIRED_MODELS = {
    "fl2va": {
        "id": "fl2va",
        "name": "minimax_h3_fl2va_pruned_int8_convrot.safetensors",
        "title": "Minimax H3 FL2VA Diffusion Model",
        "type": "diffusion_models",
        "rel_folder": "diffusion_models/h3",
        "filename": "minimax_h3_fl2va_pruned_int8_convrot.safetensors",
        "url": "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors",
        "approx_size_gb": "19.5 GB"
    },
    "ref2va": {
        "id": "ref2va",
        "name": "minimax_h3_ref2va_pruned_int8_convrot.safetensors",
        "title": "Minimax H3 Ref2VA Reference Diffusion Model",
        "type": "diffusion_models",
        "rel_folder": "diffusion_models/h3",
        "filename": "minimax_h3_ref2va_pruned_int8_convrot.safetensors",
        "url": "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors",
        "approx_size_gb": "19.5 GB"
    },
    "clip": {
        "id": "clip",
        "name": "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
        "title": "Qwen3-VL 32B Text Encoder / CLIP",
        "type": "text_encoders",
        "rel_folder": "text_encoders",
        "filename": "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
        "url": "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
        "approx_size_gb": "14.6 GB"
    },
    "video_vae": {
        "id": "video_vae",
        "name": "minimax_h3_video_vae_fp16.safetensors",
        "title": "Minimax H3 Video VAE",
        "type": "vae",
        "rel_folder": "vae",
        "filename": "minimax_h3_video_vae_fp16.safetensors",
        "url": "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors",
        "approx_size_gb": "4.9 GB"
    },
    "audio_vae": {
        "id": "audio_vae",
        "name": "minimax_h3_audio_vae_fp32.safetensors",
        "title": "Minimax H3 Audio VAE (Audio Sync)",
        "type": "vae",
        "rel_folder": "vae",
        "filename": "minimax_h3_audio_vae_fp32.safetensors",
        "url": "https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors",
        "approx_size_gb": "577 MB"
    }
}

# Download tasks tracking
_download_state: Dict[str, Dict] = {}
_download_threads: Dict[str, threading.Thread] = {}
_download_cancel_events: Dict[str, threading.Event] = {}

# Last generated video metadata, keyed by node id. Written both by the node's
# own execute (so its VIDEO/metadata_json outputs survive to the next run) and
# by the /minimax_h3/set_output route the frontend reports into. It was
# referenced in both places but never actually created, so executing the node
# raised NameError before it could return anything.
_last_output_by_node: Dict[str, Dict] = {}


def _get_model_target_path(model_id: str) -> Tuple[str, str]:
    """Get target directory and full file path for a model safely without raising exceptions"""
    info = REQUIRED_MODELS.get(model_id)
    if not info:
        return "", ""

    rel_folder = info["rel_folder"]
    category = info["type"]
    filename = info["filename"]

    base_dir = ""
    try:
        if hasattr(folder_paths, "get_folder_paths"):
            paths = folder_paths.get_folder_paths(category)
            if paths and len(paths) > 0:
                base_dir = paths[0]
    except Exception:
        pass

    if not base_dir:
        try:
            out_dir = folder_paths.get_output_directory()
            base_dir = os.path.join(os.path.dirname(out_dir), "models", category)
        except Exception:
            base_dir = os.path.join(NODE_DIR, "..", "..", "models", category)

    if rel_folder.endswith("/h3") and not base_dir.endswith("h3"):
        target_dir = os.path.join(base_dir, "h3")
    else:
        target_dir = base_dir

    target_path = os.path.join(target_dir, filename)
    if os.path.exists(target_path):
        return target_dir, target_path

    # Check alternative candidate paths (e.g., direct base_dir, unet folder)
    candidates = [
        os.path.join(base_dir, filename),
        os.path.join(os.path.dirname(base_dir), "unet", "h3", filename),
        os.path.join(os.path.dirname(base_dir), "unet", filename),
        os.path.join(os.path.dirname(base_dir), "diffusion_models", filename),
        os.path.join(os.path.dirname(base_dir), "diffusion_models", "h3", filename),
    ]

    for cand in candidates:
        if os.path.exists(cand):
            return os.path.dirname(cand), cand

    return target_dir, target_path


def get_model_status_dict(model_id: str) -> Dict[str, Any]:
    """Get live download and installation status for a model"""
    info = REQUIRED_MODELS[model_id]
    target_dir, target_path = _get_model_target_path(model_id)
    
    is_installed = False
    file_size = 0
    if target_path and os.path.exists(target_path):
        try:
            file_size = os.path.getsize(target_path)
            if file_size > 1000:
                is_installed = True
        except Exception:
            pass

    state = _download_state.get(model_id, {
        "status": "completed" if is_installed else "idle",
        "downloaded_bytes": file_size if is_installed else 0,
        "total_bytes": file_size if is_installed else 0,
        "percent": 100.0 if is_installed else 0.0,
        "speed_mbps": 0.0,
        "error": None
    })

    if is_installed and state.get("status") not in ("downloading", "paused"):
        state["status"] = "completed"
        state["percent"] = 100.0
        state["downloaded_bytes"] = file_size
        state["total_bytes"] = file_size

    return {
        "id": model_id,
        "name": info["name"],
        "title": info["title"],
        "type": info["type"],
        "approx_size_gb": info["approx_size_gb"],
        "folder": target_dir,
        "path": target_path,
        "installed": is_installed,
        "url": info["url"],
        "status": state.get("status", "idle"),
        "downloaded_bytes": state.get("downloaded_bytes", 0),
        "total_bytes": state.get("total_bytes", 0),
        "percent": state.get("percent", 0.0),
        "speed_mbps": state.get("speed_mbps", 0.0),
        "error": state.get("error", None)
    }


def _async_download_worker(model_id: str):
    """Background worker thread that streams and saves model safetensors from HuggingFace"""
    info = REQUIRED_MODELS[model_id]
    target_dir, target_path = _get_model_target_path(model_id)
    temp_path = target_path + ".tmp"
    cancel_evt = _download_cancel_events[model_id]

    os.makedirs(target_dir, exist_ok=True)

    state = _download_state[model_id]
    state["status"] = "downloading"
    state["error"] = None

    existing_bytes = os.path.getsize(temp_path) if os.path.exists(temp_path) else 0

    req = urllib.request.Request(info["url"])
    if existing_bytes > 0:
        req.add_header("Range", f"bytes={existing_bytes}-")

    start_time = time.time()
    last_speed_time = start_time
    last_speed_bytes = existing_bytes

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content_len = resp.headers.get("Content-Length")
            if content_len:
                total_bytes = int(content_len) + existing_bytes
            else:
                total_bytes = existing_bytes + 100000000

            state["total_bytes"] = total_bytes
            state["downloaded_bytes"] = existing_bytes

            mode_str = "ab" if existing_bytes > 0 else "wb"
            with open(temp_path, mode_str) as out_f:
                chunk_size = 1024 * 1024  # 1 MB chunk
                while True:
                    if cancel_evt.is_set():
                        state["status"] = "paused"
                        print(f"[MinimaxH3Video] Download paused: {info['name']}")
                        return

                    chunk = resp.read(chunk_size)
                    if not chunk:
                        break

                    out_f.write(chunk)
                    existing_bytes += len(chunk)
                    state["downloaded_bytes"] = existing_bytes

                    if total_bytes > 0:
                        state["percent"] = round((existing_bytes / total_bytes) * 100, 1)

                    now = time.time()
                    elapsed = now - last_speed_time
                    if elapsed >= 0.5:
                        speed = (existing_bytes - last_speed_bytes) / (1024 * 1024 * elapsed)
                        state["speed_mbps"] = round(speed, 2)
                        last_speed_time = now
                        last_speed_bytes = existing_bytes

        if os.path.exists(temp_path):
            os.replace(temp_path, target_path)

        state["status"] = "completed"
        state["percent"] = 100.0
        state["speed_mbps"] = 0.0
        print(f"[MinimaxH3Video] Download completed successfully: {info['name']}")

    except Exception as e:
        if cancel_evt.is_set():
            state["status"] = "paused"
        else:
            state["status"] = "error"
            state["error"] = str(e)
            print(f"[MinimaxH3Video] Download error for {info['name']}: {e}")

# ═══════════════════════════════════════════════════════════════════════════
# Dynamic Workflow Engine
# ═══════════════════════════════════════════════════════════════════════════

WORKFLOW_MAP = {
    "text_to_video": "workflows/text_to_video_workflow.json",
    "image_to_video": "workflows/image_to_video_workflow.json",
    "image_to_video_fflf": "workflows/image_to_video_fflf_workflow.json",
    "reference_to_video": "workflows/reference_to_video_workflow.json",
    "reference_to_video_sing": "workflows/reference_to_video_sing_workflow.json"
}


def load_workflow_json(mode: str) -> Optional[Dict]:
    """Load and parse workflow JSON file for requested mode"""
    rel_path = WORKFLOW_MAP.get(mode, WORKFLOW_MAP["text_to_video"])
    abs_path = os.path.join(NODE_DIR, rel_path)
    if not os.path.exists(abs_path):
        print(f"[MinimaxH3Video] Workflow file missing: {abs_path}")
        return None
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[MinimaxH3Video] Error reading workflow file {abs_path}: {e}")
        return None


def prepare_workflow_prompt(
    mode: str,
    prompt_text: str,
    duration: int,
    fps: int,
    motion_strength: float,
    guidance_scale: float,
    image_name: Optional[str] = None,
    audio_name: Optional[str] = None
) -> Dict:
    """
    Prepare customized prompt structure by injecting node parameters
    into the selected Minimax H3 workflow template.
    """
    workflow_data = load_workflow_json(mode)
    if not workflow_data:
        return {}

    nodes = workflow_data.get("nodes", [])
    prompt_dict = {}

    for node in nodes:
        node_id = str(node["id"])
        node_type = node.get("type", "")

        inputs = {}

        if node_type == "PixaromaPrompt":
            inputs["text"] = prompt_text
        elif node_type == "PixaromaDuration":
            inputs["duration"] = duration
        elif node_type == "PixaromaSaveMp4":
            inputs["fps"] = fps
            inputs["filename_prefix"] = f"MinimaxH3_{mode}"
        elif node_type == "KSampler":
            inputs["cfg"] = guidance_scale
        elif node_type in ("MiniMaxH3ImageToVideo", "MiniMaxH3ReferenceToVideo"):
            inputs["prompt"] = prompt_text
            inputs["motion_strength"] = motion_strength
        elif node_type == "PixaromaLoadImageMini" and image_name:
            inputs["image"] = image_name
        elif node_type == "PixaromaLoadAudio" and audio_name:
            inputs["audio"] = audio_name

        prompt_dict[node_id] = {
            "class_type": node_type,
            "inputs": inputs
        }

    return prompt_dict

# ═══════════════════════════════════════════════════════════════════════════
# Pre-flight Environment & Model Validator
# ═══════════════════════════════════════════════════════════════════════════

def validate_minimax_environment(mode: str = "text_to_video") -> Dict[str, Any]:
    """
    Rigorously scans ComfyUI model directories and node registries to report missing safetensors or nodes
    """
    missing_models = []
    missing_nodes = []

    is_r2v = mode.startswith("reference_to_video") or mode == "R2V"

    for m_id in ["ref2va" if is_r2v else "fl2va", "clip", "video_vae"]:
        st = get_model_status_dict(m_id)
        if not st["installed"]:
            missing_models.append(st)

    if is_r2v:
        st_audio = get_model_status_dict("audio_vae")
        if not st_audio["installed"]:
            missing_models.append(st_audio)

    try:
        import nodes as comfy_nodes
        registry = getattr(comfy_nodes, "NODE_CLASS_MAPPINGS", {})
    except Exception:
        registry = {}

    req_nodes = ["PixaromaSaveMp4"]
    if is_r2v:
        req_nodes.extend(["MiniMaxH3ReferenceToVideo", "PixaromaH3AudioSync"])
    else:
        req_nodes.extend(["MiniMaxH3ImageToVideo"])

    for rnode in req_nodes:
        if registry and rnode not in registry:
            missing_nodes.append(rnode)

    valid = len(missing_models) == 0 and len(missing_nodes) == 0

    return {
        "valid": valid,
        "missing_models": missing_models,
        "missing_nodes": missing_nodes,
        "mode": mode
    }

# ═══════════════════════════════════════════════════════════════════════════
# Output Path & Directory Helpers
# ═══════════════════════════════════════════════════════════════════════════

def _get_output_dir() -> str:
    """Get ComfyUI base output directory safely"""
    try:
        return str(Path(folder_paths.get_output_directory()).resolve())
    except Exception:
        return str(Path(os.path.join(os.path.dirname(NODE_DIR), "output")).resolve())


def _get_minimax_output_dir() -> str:
    """Get MinimaxH3 subfolder output directory"""
    out_dir = os.path.join(_get_output_dir(), SUBFOLDER)
    os.makedirs(out_dir, exist_ok=True)
    return out_dir


def _meta_dir(video_path: str) -> str:
    """Get metadata/ directory for a video file"""
    return os.path.join(os.path.dirname(video_path), "metadata")


def _meta_path(video_path: str) -> str:
    """Canonical sidecar path: <dir>/metadata/<basename>.json"""
    base = os.path.splitext(os.path.basename(video_path))[0]
    return os.path.join(_meta_dir(video_path), base + ".json")


def _meta_path_legacy(video_path: str) -> str:
    """Legacy sidecar path: <dir>/<basename>.json"""
    return os.path.splitext(video_path)[0] + ".json"


def _favorites_path() -> str:
    """Get path to favorites.json file"""
    return os.path.join(NODE_DIR, "favorites.json")


def _load_favorites() -> set:
    """Load favorite video filenames from JSON storage"""
    path = _favorites_path()
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return set(data) if isinstance(data, list) else set()
        except Exception as e:
            print(f"[MinimaxH3Video] Error loading favorites: {e}")
            return set()
    return set()


def _save_favorites(favset: set):
    """Save set of favorite video filenames to JSON storage"""
    path = _favorites_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(sorted(list(favset)), f, ensure_ascii=False, indent=2)


def _favorites_add(filename: str):
    """Add filename to favorites list"""
    favs = _load_favorites()
    favs.add(os.path.basename(filename))
    _save_favorites(favs)


def _favorites_remove(filename: str):
    """Remove filename from favorites list"""
    favs = _load_favorites()
    favs.discard(os.path.basename(filename))
    _save_favorites(favs)


def _safe_resolve_path(base_dir: str, subfolder: str = "", filename: str = "") -> str:
    """Prevent path traversal vulnerabilities by enforcing child paths within base_dir"""
    base = Path(base_dir).resolve()
    target = base
    if subfolder:
        target = target / subfolder
    if filename:
        target = target / filename
    target = target.resolve()
    try:
        target.relative_to(base)
    except Exception:
        raise ValueError(f"Security Warning: Invalid path traversal attempt: {target}")
    return str(target)

# ═══════════════════════════════════════════════════════════════════════════
# Metadata & Video Operations
# ═══════════════════════════════════════════════════════════════════════════

def _write_json_meta(video_path: str, meta_dict: Dict) -> bool:
    """Write sidecar metadata JSON file"""
    mp = _meta_path(video_path)
    tmp = mp + ".tmp"
    try:
        os.makedirs(os.path.dirname(mp), exist_ok=True)
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(meta_dict, f, ensure_ascii=False, indent=2)
        os.replace(tmp, mp)
        print(f"[MinimaxH3Video] Saved metadata sidecar: {os.path.basename(mp)}")
        return True
    except Exception as e:
        print(f"[MinimaxH3Video] Error writing metadata sidecar: {e}")
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except Exception:
                pass
        return False


def _read_json_meta(video_path: str) -> Optional[Dict]:
    """Read metadata JSON sidecar for video file"""
    for mp in (_meta_path(video_path), _meta_path_legacy(video_path)):
        if not os.path.exists(mp):
            continue
        try:
            with open(mp, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict):
                return data
        except Exception as e:
            print(f"[MinimaxH3Video] Error reading metadata sidecar ({mp}): {e}")
    return None

# ═══════════════════════════════════════════════════════════════════════════
# Configuration Storage & Merging Engine
# ═══════════════════════════════════════════════════════════════════════════

def _load_builtin_config() -> Dict:
    """Load default read-only config.json shipped with the node package"""
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[MinimaxH3Video] Error loading builtin config: {e}")
    return {}


def _load_user_config() -> Dict:
    """Load user configuration overrides from USER_CONFIG_PATH"""
    if os.path.exists(USER_CONFIG_PATH):
        try:
            with open(USER_CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[MinimaxH3Video] Error loading user config: {e}")
    return {}


def _load_config() -> Dict:
    """Deep-merge built-in and user configuration"""
    builtin = _load_builtin_config()
    user = _load_user_config()
    merged = dict(builtin)
    merged.update(user)
    return merged


def _save_config(patch: Dict) -> Dict:
    """Save user settings patch to USER_CONFIG_PATH"""
    user = _load_user_config()
    user.update(patch)
    os.makedirs(USER_CONFIG_DIR, exist_ok=True)
    with open(USER_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(user, f, ensure_ascii=False, indent=2)
    return _load_config()

# ═══════════════════════════════════════════════════════════════════════════
# REST API Endpoints
# ═══════════════════════════════════════════════════════════════════════════

def _serve_json(filename: str):
    """Factory creating route handlers that serve static JSON configuration/workflow files"""
    async def handler(request):
        path = os.path.join(NODE_DIR, filename)
        if not os.path.exists(path):
            return web.Response(status=404, text=f"{filename} not found")
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return web.json_response(data)
        except Exception as e:
            return web.json_response({"error": str(e)}, status=500)
    return handler


# Workflow Template Endpoints
PromptServer.instance.routes.get("/minimax_h3/workflow_text_to_video")(
    _serve_json("workflows/text_to_video_workflow.json")
)
PromptServer.instance.routes.get("/minimax_h3/workflow_image_to_video")(
    _serve_json("workflows/image_to_video_workflow.json")
)
PromptServer.instance.routes.get("/minimax_h3/workflow_image_to_video_fflf")(
    _serve_json("workflows/image_to_video_fflf_workflow.json")
)
PromptServer.instance.routes.get("/minimax_h3/workflow_reference_to_video")(
    _serve_json("workflows/reference_to_video_workflow.json")
)
PromptServer.instance.routes.get("/minimax_h3/workflow_reference_to_video_sing")(
    _serve_json("workflows/reference_to_video_sing_workflow.json")
)


# Model Download & Setup Manager Endpoints
@PromptServer.instance.routes.get("/minimax_h3/models_status")
async def get_all_models_status(request):
    """Return live status of all required Minimax H3 model safetensors"""
    try:
        statuses = [get_model_status_dict(m_id) for m_id in REQUIRED_MODELS.keys()]
        return web.json_response({"success": True, "models": statuses})
    except Exception as e:
        print(f"[MinimaxH3Video] Error in models_status endpoint: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.post("/minimax_h3/download_model")
async def start_download_model(request):
    """Start background download of a required model safetensors"""
    try:
        data = await request.json()
        model_id = data.get("model_id")
        if not model_id or model_id not in REQUIRED_MODELS:
            return web.json_response({"success": False, "error": "Invalid model_id"}, status=400)

        if model_id not in _download_state:
            _download_state[model_id] = {"status": "idle", "downloaded_bytes": 0, "total_bytes": 0, "percent": 0.0, "speed_mbps": 0.0, "error": None}

        cancel_evt = threading.Event()
        _download_cancel_events[model_id] = cancel_evt

        t = threading.Thread(target=_async_download_worker, args=(model_id,), daemon=True)
        _download_threads[model_id] = t
        t.start()

        return web.json_response({"success": True, "status": get_model_status_dict(model_id)})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.post("/minimax_h3/pause_download")
async def pause_download_model(request):
    """Pause an active background model download"""
    try:
        data = await request.json()
        model_id = data.get("model_id")
        if model_id in _download_cancel_events:
            _download_cancel_events[model_id].set()
            if model_id in _download_state:
                _download_state[model_id]["status"] = "paused"
        return web.json_response({"success": True, "status": get_model_status_dict(model_id)})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.post("/minimax_h3/delete_model")
async def delete_model_file(request):
    """Delete local model safetensors file"""
    try:
        data = await request.json()
        model_id = data.get("model_id")
        if not model_id or model_id not in REQUIRED_MODELS:
            return web.json_response({"success": False, "error": "Invalid model_id"}, status=400)

        target_dir, target_path = _get_model_target_path(model_id)
        temp_path = target_path + ".tmp" if target_path else ""

        if model_id in _download_cancel_events:
            _download_cancel_events[model_id].set()

        deleted = []
        if target_path and os.path.exists(target_path):
            os.remove(target_path)
            deleted.append(target_path)
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            deleted.append(temp_path)

        if model_id in _download_state:
            _download_state[model_id] = {"status": "idle", "downloaded_bytes": 0, "total_bytes": 0, "percent": 0.0, "speed_mbps": 0.0, "error": None}

        print(f"[MinimaxH3Video] Deleted model file for {model_id}: {target_path}")
        return web.json_response({"success": True, "deleted": deleted, "status": get_model_status_dict(model_id)})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.get("/minimax_h3/validate_system")
async def validate_system_endpoint(request):
    """Scan ComfyUI environment and return missing models and node dependencies"""
    mode = request.query.get("mode", "text_to_video")
    report = validate_minimax_environment(mode)
    return web.json_response(report)


@PromptServer.instance.routes.get("/minimax_h3/config")
async def get_config(request):
    """Return merged system and user configuration settings"""
    config = _load_config()
    return web.json_response(config)


@PromptServer.instance.routes.post("/minimax_h3/config")
async def save_config_endpoint(request):
    """Save patch to user configuration overrides"""
    try:
        patch = await request.json()
        updated = _save_config(patch)
        return web.json_response({"success": True, "config": updated})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)


@PromptServer.instance.routes.post("/minimax_h3/debug_payload")
async def debug_payload(request):
    """Write the exact prompt the node is about to submit to last_payload.json.

    The node builds its payload by hand and POSTs straight to /prompt, bypassing
    the frontend's graphToPrompt, so this file is the only server-side record of
    what the nodes actually received. Inspect it with:
        cat <node_dir>/last_payload.json
    """
    try:
        payload = await request.json()
        out_path = os.path.join(NODE_DIR, "last_payload.json")
        with open(out_path, "w") as f:
            json.dump(payload, f, indent=1)

        # Summarise the inputs that decide what the video looks like.
        summary = []
        for nid, node in sorted((payload.get("prompt") or {}).items()):
            ctype = node.get("class_type", "")
            if ctype not in ("PixaromaLoadImageMini", "PixaromaLoadAudio",
                             "PixaromaLongestSide", "PixaromaDuration", "PixaromaPrompt"):
                continue
            for key in ("image", "LoadAudioState", "LongestSideState", "DurationState", "PromptState"):
                if key in node.get("inputs", {}):
                    val = str(node["inputs"][key])
                    summary.append("  {} {}.{} = {}".format(nid, ctype, key, val[:160]))
        print("[MinimaxH3Video] Submitted payload ->", out_path)
        for line in summary:
            print("[MinimaxH3Video]" + line)

        return web.json_response({"success": True, "path": out_path})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)


@PromptServer.instance.routes.get("/minimax_h3/gallery")
async def get_gallery(request):
    """
    List past generated videos from output/MinimaxH3 subfolder
    """
    try:
        fav_only = request.query.get("favorites", "false").lower() == "true"
        page = int(request.query.get("page", "1"))
        limit = int(request.query.get("limit", "50"))
        
        out_dir = _get_minimax_output_dir()
        favset = _load_favorites()
        
        video_extensions = ("*.mp4", "*.webm", "*.mov")
        files = []
        for ext in video_extensions:
            files.extend(glob.glob(os.path.join(out_dir, ext)))
        
        files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        
        items = []
        for filepath in files:
            fname = os.path.basename(filepath)
            is_fav = fname in favset
            if fav_only and not is_fav:
                continue
                
            meta = _read_json_meta(filepath) or {}
            mtime = os.path.getmtime(filepath)
            
            items.append({
                "filename": fname,
                "subfolder": SUBFOLDER,
                "type": "output",
                "mtime": mtime,
                "favorite": is_fav,
                "video_url": f"/minimax_h3/video_file?filename={fname}&subfolder={SUBFOLDER}",
                "metadata": meta
            })
            
        total = len(items)
        start = (page - 1) * limit
        end = start + limit
        paginated_items = items[start:end]
        
        return web.json_response({
            "success": True,
            "total": total,
            "page": page,
            "limit": limit,
            "videos": paginated_items
        })
    except Exception as e:
        print(f"[MinimaxH3Video] Gallery endpoint error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.get("/minimax_h3/video_file")
async def serve_video_file(request):
    """
    Stream video files safely from output directory with Range header support
    """
    try:
        filename = request.query.get("filename", "")
        subfolder = request.query.get("subfolder", SUBFOLDER)
        
        if not filename:
            return web.Response(status=400, text="Filename required")
            
        base_dir = _get_output_dir()
        target_path = _safe_resolve_path(base_dir, subfolder, filename)
        
        if not os.path.exists(target_path):
            return web.Response(status=404, text="Video file not found")
            
        return web.FileResponse(
            target_path,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Type": "video/mp4" if filename.endswith(".mp4") else "video/webm"
            }
        )
    except Exception as e:
        return web.Response(status=500, text=str(e))


@PromptServer.instance.routes.get("/minimax_h3/meta")
async def get_meta(request):
    """Get metadata for specific video file"""
    try:
        filename = request.query.get("filename", "")
        if not filename:
            return web.json_response({"success": False, "error": "Filename required"}, status=400)
            
        base_dir = _get_output_dir()
        target_path = _safe_resolve_path(base_dir, SUBFOLDER, filename)
        
        meta = _read_json_meta(target_path)
        if meta is None:
            return web.json_response({"success": False, "error": "Metadata not found"}, status=404)
            
        favset = _load_favorites()
        meta["favorite"] = filename in favset
        return web.json_response({"success": True, "metadata": meta})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.get("/minimax_h3/loras")
async def get_loras(request):
    """Return list of available LoRA safetensors models"""
    try:
        loras = folder_paths.get_filename_list("loras") or []
        return web.json_response({"success": True, "loras": loras})
    except Exception as e:
        return web.json_response({"success": False, "loras": [], "error": str(e)})


@PromptServer.instance.routes.post("/minimax_h3/save_meta")
async def save_meta(request):
    """Write or overwrite metadata sidecar JSON"""
    try:
        data = await request.json()
        filename = data.get("filename", "")
        metadata = data.get("metadata", {})
        
        if not filename:
            return web.json_response({"success": False, "error": "Filename required"}, status=400)
            
        base_dir = _get_output_dir()
        target_path = _safe_resolve_path(base_dir, SUBFOLDER, filename)
        
        ok = _write_json_meta(target_path, metadata)
        return web.json_response({"success": ok})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)


@PromptServer.instance.routes.post("/minimax_h3/update_meta")
async def update_meta(request):
    """Update metadata patch for a specific video"""
    try:
        data = await request.json()
        filename = data.get("filename", "")
        patch = data.get("patch", {})
        
        if not filename:
            return web.json_response({"success": False, "error": "Filename required"}, status=400)
            
        base_dir = _get_output_dir()
        target_path = _safe_resolve_path(base_dir, SUBFOLDER, filename)
        
        existing = _read_json_meta(target_path) or {}
        existing.update(patch)
        
        if "favorite" in patch:
            if patch["favorite"]:
                _favorites_add(filename)
            else:
                _favorites_remove(filename)
                
        ok = _write_json_meta(target_path, existing)
        return web.json_response({"success": ok, "metadata": existing})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)


@PromptServer.instance.routes.post("/minimax_h3/add_favorite")
async def add_favorite_endpoint(request):
    """Add video to favorites list"""
    try:
        data = await request.json()
        filename = data.get("filename")
        if filename:
            _favorites_add(filename)
        return web.json_response({"success": True})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)


@PromptServer.instance.routes.post("/minimax_h3/remove_favorite")
async def remove_favorite_endpoint(request):
    """Remove video from favorites list"""
    try:
        data = await request.json()
        filename = data.get("filename")
        if filename:
            _favorites_remove(filename)
        return web.json_response({"success": True})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)


@PromptServer.instance.routes.post("/minimax_h3/delete")
async def delete_video(request):
    """Safely delete video file and associated metadata sidecar"""
    try:
        data = await request.json()
        filename = data.get("filename", "")
        if not filename:
            return web.json_response({"success": False, "error": "Filename required"}, status=400)
            
        base_dir = _get_output_dir()
        video_path = _safe_resolve_path(base_dir, SUBFOLDER, filename)
        
        deleted = []
        if os.path.exists(video_path):
            os.remove(video_path)
            deleted.append(video_path)
            
        meta_p = _meta_path(video_path)
        if os.path.exists(meta_p):
            os.remove(meta_p)
            deleted.append(meta_p)
            
        legacy_p = _meta_path_legacy(video_path)
        if os.path.exists(legacy_p):
            os.remove(legacy_p)
            deleted.append(legacy_p)
            
        _favorites_remove(filename)
        print(f"[MinimaxH3Video] Deleted video and sidecars for: {filename}")
        return web.json_response({"success": True, "deleted": deleted})
    except Exception as e:
        print(f"[MinimaxH3Video] Error deleting video: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.post("/minimax_h3/open_folder")
async def open_output_folder(request):
    """Open output folder in OS system file explorer"""
    try:
        out_dir = _get_minimax_output_dir()
        if os.name == "nt":
            os.startfile(out_dir)
        elif os.uname().sysname == "Darwin":
            subprocess.Popen(["open", out_dir])
        else:
            subprocess.Popen(["xdg-open", out_dir])
        return web.json_response({"success": True, "path": out_dir})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.post("/minimax_h3/set_output")
async def set_output(request):
    """Frontend reports generated video output metadata"""
    try:
        data = await request.json()
        node_id = str(data.get("node_id"))
        video_info = data.get("video_info", {})
        
        global _last_output_by_node
        _last_output_by_node[node_id] = video_info
        return web.json_response({"success": True})
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=400)

# ═══════════════════════════════════════════════════════════════════════════
# Main Custom Node Class: MinimaxH3OneVideoNode
# ═══════════════════════════════════════════════════════════════════════════

class MinimaxH3OneVideoNode:
    """
    Minimax H3 One-Node Video Interface
    
    Single ComfyUI node handling all three Minimax H3 video modes:
    1. Text-to-Video (T2V)
    2. Image-to-Video (I2V)
    3. Reference Image + Audio Sync (R2V)
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {},
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "prompt_info": "PROMPT",
            },
        }

    RETURN_TYPES = ("VIDEO", "STRING",)
    RETURN_NAMES = ("video", "metadata_json",)
    FUNCTION = "generate_video"
    CATEGORY = "Minimax H3"
    OUTPUT_NODE = True

    def generate_video(
        self,
        unique_id: str = None,
        prompt_info = None,
        **kwargs
    ) -> Tuple[Dict, str]:
        """
        Main video generation handler with environment pre-flight verification
        """
        mode = kwargs.get("mode", "text_to_video")
        duration = int(kwargs.get("duration", DEFAULT_VIDEO_DURATION))
        fps = str(kwargs.get("fps", "24"))
        motion_strength = float(kwargs.get("motion_strength", DEFAULT_MOTION_STRENGTH))
        guidance_scale = float(kwargs.get("guidance_scale", DEFAULT_GUIDANCE_SCALE))
        prompt = kwargs.get("prompt", "")
        negative_prompt = kwargs.get("negative_prompt", "")
        image = kwargs.get("image", None)
        reference_image = kwargs.get("reference_image", None)
        audio_file = kwargs.get("audio_file", None)
        report = validate_minimax_environment(mode)
        if not report["valid"]:
            msg_lines = ["⚠️ [MinimaxH3Video] Missing Required Models / Custom Nodes:"]
            if report["missing_models"]:
                msg_lines.append("\n  Missing Required Safetensors Models:")
                for m in report["missing_models"]:
                    msg_lines.append(f"    • {m['name']} ({m['type']})\n      --> Save to: {m['folder']}\n      --> Download: {m['url']}")
            if report["missing_nodes"]:
                msg_lines.append("\n  Missing Custom Node Dependencies:")
                for n in report["missing_nodes"]:
                    msg_lines.append(f"    • {n} --> Install 'Pixaroma' from ComfyUI Manager")
            err_text = "\n".join(msg_lines)
            print(err_text)
            raise ValueError(err_text)

        fps_int = int(fps) if fps else 24

        timestamp = time.time()
        time_str = time.strftime("%Y%m%d_%H%M%S", time.localtime(timestamp))
        filename = f"MinimaxH3_{mode}_{time_str}.mp4"
        out_dir = _get_minimax_output_dir()

        output_metadata = {
            "mode": SUPPORTED_MODES.get(mode, mode),
            "raw_mode": mode,
            "duration": duration,
            "fps": fps_int,
            "motion_strength": motion_strength,
            "guidance_scale": guidance_scale,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "timestamp": timestamp,
            "favorite": False,
            "filename": filename,
            "subfolder": SUBFOLDER,
            "video_url": f"/minimax_h3/video_file?filename={filename}&subfolder={SUBFOLDER}"
        }

        if unique_id:
            _last_output_by_node[str(unique_id)] = output_metadata

        video_output = {
            "filename": filename,
            "subfolder": SUBFOLDER,
            "type": "output",
            "metadata": output_metadata
        }

        meta_json_str = json.dumps(output_metadata, ensure_ascii=False, indent=2)

        return (video_output, meta_json_str,)

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

# ═══════════════════════════════════════════════════════════════════════════
# ComfyUI Registration
# ═══════════════════════════════════════════════════════════════════════════

NODE_CLASS_MAPPINGS = {
    "MinimaxH3OneVideoNode": MinimaxH3OneVideoNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "MinimaxH3OneVideoNode": "Minimax H3 One-Node Video",
}

print("[MinimaxH3Video] Backend node loaded successfully.")
