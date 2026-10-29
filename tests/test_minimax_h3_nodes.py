"""
Unit Test Suite for Minimax H3 One-Node Video Interface
Tests backend node instantiation, workflow execution engine, parameter validation,
metadata sidecar JSON read/write, favorites tracking, and model setup manager endpoints.
Includes standalone mocks for ComfyUI environment modules (folder_paths, server, aiohttp, nodes).
"""

import os
import sys
import json
import types
import tempfile
import unittest

# Workspace root
SYS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SYS_DIR not in sys.path:
    sys.path.insert(0, SYS_DIR)

# Mock ComfyUI modules if running standalone outside ComfyUI environment
if "folder_paths" not in sys.modules:
    folder_paths_mock = types.ModuleType("folder_paths")
    folder_paths_mock.get_output_directory = lambda: os.path.join(SYS_DIR, "output")
    folder_paths_mock.get_input_directory = lambda: os.path.join(SYS_DIR, "input")
    folder_paths_mock.get_user_directory = lambda: os.path.join(SYS_DIR, "user")
    folder_paths_mock.models_dir = os.path.join(SYS_DIR, "models")
    sys.modules["folder_paths"] = folder_paths_mock

if "nodes" not in sys.modules:
    nodes_mock = types.ModuleType("nodes")
    nodes_mock.NODE_CLASS_MAPPINGS = {
        "PixaromaSaveMp4": object,
        "MiniMaxH3ImageToVideo": object,
        "MiniMaxH3ReferenceToVideo": object,
        "PixaromaH3AudioSync": object,
    }
    sys.modules["nodes"] = nodes_mock

if "aiohttp" not in sys.modules:
    aiohttp_mock = types.ModuleType("aiohttp")
    web_mock = types.ModuleType("web")
    
    class MockResponse:
        def __init__(self, body=None, status=200, text=None):
            self.body = body
            self.status = status
            self.text = text

    def json_response(data=None, status=200):
        return MockResponse(body=data, status=status)

    def Response(status=200, text=""):
        return MockResponse(status=status, text=text)

    def FileResponse(path, headers=None):
        return MockResponse(status=200, text=path)

    web_mock.json_response = json_response
    web_mock.Response = Response
    web_mock.FileResponse = FileResponse
    aiohttp_mock.web = web_mock
    sys.modules["aiohttp"] = aiohttp_mock
    sys.modules["aiohttp.web"] = web_mock

if "server" not in sys.modules:
    server_mock = types.ModuleType("server")
    class MockRoutes:
        def get(self, path):
            def decorator(f): return f
            return decorator
        def post(self, path):
            def decorator(f): return f
            return decorator

    class MockPromptServer:
        instance = types.SimpleNamespace(routes=MockRoutes())

    server_mock.PromptServer = MockPromptServer
    sys.modules["server"] = server_mock

import minimax_h3_video_nodes as mhn


class TestMinimaxH3NodeRegistration(unittest.TestCase):
    """Test node class mappings and export definitions"""

    def test_node_mappings(self):
        self.assertIn("MinimaxH3OneVideoNode", mhn.NODE_CLASS_MAPPINGS)
        self.assertIn("MinimaxH3OneVideoNode", mhn.NODE_DISPLAY_NAME_MAPPINGS)
        self.assertEqual(
            mhn.NODE_DISPLAY_NAME_MAPPINGS["MinimaxH3OneVideoNode"],
            "Minimax H3 One-Node Video"
        )

    def test_color_palette(self):
        self.assertEqual(mhn.COLORS["primary"], "#59FF00")
        self.assertEqual(mhn.COLORS["primary_hover"], "#95FF77")
        self.assertEqual(mhn.COLORS["bg_primary"], "#1A1C1B")


class TestMinimaxH3WorkflowEngine(unittest.TestCase):
    """Test dynamic workflow loading and prompt preparation"""

    def test_load_workflow_t2v(self):
        wf = mhn.load_workflow_json("text_to_video")
        self.assertIsNotNone(wf)
        self.assertIn("nodes", wf)

    def test_load_workflow_i2v(self):
        wf = mhn.load_workflow_json("image_to_video")
        self.assertIsNotNone(wf)
        self.assertIn("nodes", wf)

    def test_load_workflow_r2v(self):
        wf = mhn.load_workflow_json("reference_to_video")
        self.assertIsNotNone(wf)
        self.assertIn("nodes", wf)

    def test_prepare_workflow_prompt(self):
        prompt_dict = mhn.prepare_workflow_prompt(
            mode="text_to_video",
            prompt_text="Cinematic mountains",
            duration=4,
            fps=24,
            motion_strength=0.6,
            guidance_scale=7.5
        )
        self.assertIsInstance(prompt_dict, dict)
        self.assertGreater(len(prompt_dict), 0)


class TestMinimaxH3TurboLora(unittest.TestCase):
    """Test the optional turbo LoRA entry and its wiring in the T2V workflow"""

    def test_turbo_lora_registered(self):
        info = mhn.REQUIRED_MODELS.get("turbo_lora")
        self.assertIsNotNone(info)
        self.assertEqual(info["type"], "loras")
        self.assertEqual(info["rel_folder"], "loras")
        self.assertTrue(info["url"].endswith(info["filename"]))

    def test_turbo_lora_target_is_loras_folder(self):
        target_dir, target_path = mhn._get_model_target_path("turbo_lora")
        self.assertTrue(target_dir)
        self.assertTrue(target_path.endswith(
            "minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors"))

    def test_turbo_lora_never_blocks_a_run(self):
        """The LoRA is optional - validation must not report it as missing."""
        for mode in ("text_to_video", "reference_to_video"):
            report = mhn.validate_minimax_environment(mode)
            missing_ids = [m["id"] for m in report["missing_models"]]
            self.assertNotIn("turbo_lora", missing_ids)

    def test_t2v_lora_loader_feeds_the_sampler(self):
        """The LoRA loader's MODEL output must reach the KSampler, or the LoRA
        only ever touches CLIP and silently does nothing to the diffusion."""
        wf = mhn.load_workflow_json("text_to_video")
        nodes = {n["id"]: n for n in wf["nodes"]}
        lora = [n for n in wf["nodes"] if n["type"] == "PixaromaLoraLoader"]
        self.assertEqual(len(lora), 1)
        lora_id = lora[0]["id"]

        ksampler = [n for n in wf["nodes"] if n["type"] == "KSampler"][0]
        model_link = [i for i in ksampler["inputs"] if i["name"] == "model"][0]["link"]
        origin = [l for l in wf["links"] if l[0] == model_link][0][1]
        self.assertEqual(origin, lora_id)

    def test_t2v_lora_rows_ship_empty(self):
        """A filename baked into the template resolves on no other machine."""
        wf = mhn.load_workflow_json("text_to_video")
        lora = [n for n in wf["nodes"] if n["type"] == "PixaromaLoraLoader"][0]
        for row in lora["widgets_values"][0]["loras"]:
            self.assertEqual(row["name"], "")
        state = json.loads(lora["properties"]["loraLoaderState"])
        for row in state["loras"]:
            self.assertEqual(row["name"], "")


class TestMinimaxH3NodeGeneration(unittest.TestCase):
    """Test MinimaxH3OneVideoNode generation input validation and metadata generation"""

    def setUp(self):
        self.node = mhn.MinimaxH3OneVideoNode()
        # Create mock model files so validation passes during testing
        self.models_dir = os.path.join(SYS_DIR, "models")
        for m_id, info in mhn.REQUIRED_MODELS.items():
            folder = os.path.join(self.models_dir, info["rel_folder"])
            os.makedirs(folder, exist_ok=True)
            path = os.path.join(folder, info["filename"])
            with open(path, "wb") as f:
                f.write(b"0" * 2000)

    def tearDown(self):
        mhn._last_output_by_node.clear()

    def _record_clip(self, node_id, filename):
        """Stand in for the frontend reporting a finished render via /set_output."""
        out_dir = os.path.join(mhn._get_output_dir(), mhn.SUBFOLDER)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, filename), "wb") as f:
            f.write(b"\x00" * 64)
        mhn._last_output_by_node[str(node_id)] = {
            "filename": filename,
            "subfolder": mhn.SUBFOLDER,
            "type": "output",
        }

    def test_generate_without_a_clip_refuses(self):
        """The VIDEO output used to be a path to a file that was never written.

        Nothing downstream could use it, and the failure surfaced far from the
        cause. With no recorded clip the node now refuses, by name.
        """
        with self.assertRaises(ValueError) as ctx:
            self.node.generate_video(
                unique_id="99",
                mode="text_to_video",
                duration=4,
                fps="24",
                prompt="nothing has been generated yet",
            )
        self.assertIn("Generate", str(ctx.exception))

    def test_generate_rejects_a_clip_that_is_gone(self):
        """A remembered filename whose file has been cleared out must not pass."""
        mhn._last_output_by_node["98"] = {
            "filename": "never_written.mp4",
            "subfolder": mhn.SUBFOLDER,
            "type": "output",
        }
        with self.assertRaises(ValueError) as ctx:
            self.node.generate_video(unique_id="98", mode="text_to_video", prompt="x")
        self.assertIn("no longer on disk", str(ctx.exception))

    def test_text_to_video_valid(self):
        self._record_clip("1", "t2v_clip.mp4")
        res, meta_str = self.node.generate_video(
            unique_id="1",
            mode="text_to_video",
            duration=4,
            fps="24",
            guidance_scale=7.5,
            prompt="A majestic lion roaring in slow motion",
        )
        self.assertTrue(str(res).endswith("t2v_clip.mp4"))
        meta = json.loads(meta_str)
        self.assertEqual(meta["prompt"], "A majestic lion roaring in slow motion")
        self.assertEqual(meta["duration"], 4)
        self.assertEqual(meta["fps"], 24)
        self.assertEqual(meta["filename"], "t2v_clip.mp4")

    def test_image_to_video_valid(self):
        self._record_clip("2", "i2v_clip.mp4")
        res, meta_str = self.node.generate_video(
            unique_id="2",
            mode="image_to_video",
            duration=6,
            fps="30",
            guidance_scale=8.0,
            prompt="Camera panning right across portrait",
        )
        meta = json.loads(meta_str)
        self.assertEqual(meta["duration"], 6)
        self.assertEqual(meta["fps"], 30)
        self.assertTrue(str(res).endswith("i2v_clip.mp4"))

    def test_reference_to_video_valid(self):
        self._record_clip("3", "r2v_clip.mp4")
        res, meta_str = self.node.generate_video(
            unique_id="3",
            mode="reference_to_video",
            duration=8,
            fps="24",
            guidance_scale=6.5,
            prompt="Character talking naturally",
        )
        meta = json.loads(meta_str)
        self.assertEqual(meta["duration"], 8)
        self.assertEqual(meta["raw_mode"], "reference_to_video")

    def test_returns_a_video_object_when_comfy_api_is_present(self):
        """The VIDEO socket must hand on a VideoInput, not a path string.

        Returning a path is only the fallback for a ComfyUI too old to have
        comfy_api; every current build takes this branch, and it is the whole
        point of the fix, so it cannot go untested.
        """
        from unittest import mock
        self._record_clip("5", "wrapped_clip.mp4")
        stub = mock.Mock()
        with mock.patch.object(mhn, "_ComfyInputImpl", stub):
            res, _ = self.node.generate_video(unique_id="5", mode="text_to_video", prompt="x")
        stub.VideoFromFile.assert_called_once()
        self.assertTrue(str(stub.VideoFromFile.call_args[0][0]).endswith("wrapped_clip.mp4"))
        self.assertIs(res, stub.VideoFromFile.return_value)

    # Value: protects=the set_output route is what makes the VIDEO socket work;
    #   fails_when=the route's node_id key or video_info shape changes;
    #   why_new=every other test seeds _last_output_by_node by hand; seam=none;
    #   no_claim=the JS side actually calling the route (no JS harness).
    def test_set_output_route_feeds_the_video_output(self):
        """The frontend reports a finished clip through /minimax_h3/set_output.

        Every other test seeds _last_output_by_node by hand, so a change to the
        route's key or payload shape would pass them all and still break every
        graph run with "No clip to hand on yet". This drives the real handler.
        """
        import asyncio
        from unittest import mock
        out_dir = os.path.join(mhn._get_output_dir(), mhn.SUBFOLDER)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "reported.mp4"), "wb") as f:
            f.write(b"\x00" * 64)

        req = mock.Mock()
        async def _json():
            return {
                "node_id": "7",
                "video_info": {
                    "filename": "reported.mp4",
                    "subfolder": mhn.SUBFOLDER,
                    "type": "output",
                },
            }
        req.json = _json
        res = asyncio.run(mhn.set_output(req))
        self.assertTrue(res.body.get("success"))

        video, meta_str = self.node.generate_video(
            unique_id="7", mode="text_to_video", prompt="reported clip"
        )
        self.assertTrue(str(video).endswith("reported.mp4"))
        self.assertEqual(json.loads(meta_str)["filename"], "reported.mp4")

    def test_video_url_escapes_the_filename(self):
        """An & or # in a filename used to truncate the gallery URL."""
        self._record_clip("4", "clip & test #1.mp4")
        _, meta_str = self.node.generate_video(unique_id="4", mode="text_to_video", prompt="x")
        meta = json.loads(meta_str)
        from urllib.parse import urlparse, parse_qs
        q = parse_qs(urlparse(meta["video_url"]).query)
        self.assertEqual(q["filename"], ["clip & test #1.mp4"])
        self.assertEqual(q["subfolder"], [mhn.SUBFOLDER])


class TestMinimaxH3MetadataAndFavorites(unittest.TestCase):
    """Test sidecar JSON metadata write/read and favorites system"""

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.test_video = os.path.join(self.temp_dir, "test_video.mp4")
        with open(self.test_video, "w") as f:
            f.write("dummy mp4 content")

    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_metadata_write_and_read(self):
        meta = {
            "mode": "Text-to-Video",
            "prompt": "Test prompt",
            "duration": 5,
            "fps": 24,
            "favorite": False
        }
        ok = mhn._write_json_meta(self.test_video, meta)
        self.assertTrue(ok)

        read_meta = mhn._read_json_meta(self.test_video)
        self.assertIsNotNone(read_meta)
        self.assertEqual(read_meta["prompt"], "Test prompt")
        self.assertEqual(read_meta["duration"], 5)

    def test_favorites_add_remove(self):
        fname = "test_fav_video.mp4"
        mhn._favorites_add(fname)
        favs = mhn._load_favorites()
        self.assertIn(fname, favs)

        mhn._favorites_remove(fname)
        favs_after = mhn._load_favorites()
        self.assertNotIn(fname, favs_after)


class TestPathContainment(unittest.TestCase):
    # Value: protects=output routes cannot reach a file outside the node's own subfolder;
    #   fails_when=_safe_resolve_path goes back to containment against the output root only;
    #   why_new=traversal was reachable via /delete with filename="../x.png"; seam=none;
    #   no_claim=ComfyUI's own auth (there is none by default).
    def test_parent_reference_in_filename_is_refused(self):
        base = tempfile.mkdtemp()
        with self.assertRaises(ValueError):
            mhn._safe_resolve_path(base, mhn.SUBFOLDER, "../escaped.png")

    def test_separator_in_subfolder_is_refused(self):
        base = tempfile.mkdtemp()
        with self.assertRaises(ValueError):
            mhn._safe_resolve_path(base, "../..", "clip.mp4")

    def test_plain_name_still_resolves(self):
        base = tempfile.mkdtemp()
        got = mhn._safe_resolve_path(base, mhn.SUBFOLDER, "clip.mp4")
        self.assertTrue(got.endswith(os.path.join(mhn.SUBFOLDER, "clip.mp4")))


class TestSetOutputValidation(unittest.TestCase):
    # Value: protects=the route refuses shapes generate_video would choke on or be misled by;
    #   fails_when=video_info is stored unvalidated again;
    #   why_new=the route accepted any JSON and now drives a disk read; seam=none;
    #   no_claim=what the browser actually posts (no JS harness).
    def _post(self, payload):
        import asyncio
        from unittest import mock
        req = mock.Mock()
        async def _json(): return payload
        req.json = _json
        return asyncio.run(mhn.set_output(req))

    def test_non_dict_video_info_is_refused(self):
        res = self._post({"node_id": "1", "video_info": "clip.mp4"})
        self.assertFalse(res.body.get("success"))

    def test_non_video_extension_is_refused(self):
        res = self._post({"node_id": "1", "video_info": {"filename": "secrets.json"}})
        self.assertFalse(res.body.get("success"))

    def test_bad_type_is_refused(self):
        res = self._post({"node_id": "1", "video_info": {"filename": "a.mp4", "type": "models"}})
        self.assertFalse(res.body.get("success"))

    def test_valid_payload_is_stored_normalised(self):
        self.addCleanup(mhn._last_output_by_node.clear)
        res = self._post({"node_id": "9", "video_info": {"filename": "a.mp4", "extra": "ignored"}})
        self.assertTrue(res.body.get("success"))
        self.assertEqual(
            mhn._last_output_by_node["9"],
            {"filename": "a.mp4", "subfolder": mhn.SUBFOLDER, "type": "output"},
        )


class TestFavoritesMigration(unittest.TestCase):
    # Value: protects=favourites survive the move from NODE_DIR to USER_CONFIG_DIR;
    #   fails_when=_favorites_path stops copying the legacy file or overwrites a newer one;
    #   why_new=no existing test touches _favorites_path paths; seam=none (patches module dirs);
    #   no_claim=real filesystem perms/read-only mounts (tempdirs only).
    def test_legacy_favorites_migrate_once_and_new_wins(self):
        import shutil
        from unittest import mock
        root = tempfile.mkdtemp()
        try:
            node_dir, cfg = os.path.join(root, "node"), os.path.join(root, "cfg")
            os.makedirs(node_dir)
            with open(os.path.join(node_dir, "favorites.json"), "w") as f:
                json.dump(["old.mp4"], f)
            with mock.patch.object(mhn, "NODE_DIR", node_dir), mock.patch.object(mhn, "USER_CONFIG_DIR", cfg):
                self.assertIn("old.mp4", mhn._load_favorites())
                self.assertTrue(os.path.exists(os.path.join(cfg, "favorites.json")))
                mhn._favorites_add("new.mp4")
                # legacy copy is not re-imported over the newer file
                self.assertEqual(mhn._favorites_path(), os.path.join(cfg, "favorites.json"))
                self.assertIn("new.mp4", mhn._load_favorites())
        finally:
            shutil.rmtree(root, ignore_errors=True)


class _FakeResp:
    def __init__(self, status, body, length=True):
        import io
        self.status, self._b = status, io.BytesIO(body)
        self.headers = {"Content-Length": str(len(body))} if length else {}
    def read(self, n=-1): return self._b.read(n)
    def getcode(self): return self.status
    def __enter__(self): return self
    def __exit__(self, *a): return False


class TestDownloadWorker(unittest.TestCase):
    # Value: protects=resume only appends on 206, restarts on 200, unknown length gives total 0;
    #   fails_when=worker appends a full 200 body onto the partial (corrupt safetensors);
    #   why_new=worker had zero coverage; seam=none (urlopen mocked);
    #   no_claim=real HuggingFace/CDN behaviour (fake response object).
    def _run(self, status, body, length=True):
        import shutil
        from unittest import mock
        import threading
        mid = next(iter(mhn.REQUIRED_MODELS))
        root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, root, ignore_errors=True)
        target = os.path.join(root, "m.safetensors")
        with open(target + ".tmp", "wb") as f:
            f.write(b"AAAA")
        mhn._download_state[mid] = {"status": "idle", "downloaded_bytes": 0, "total_bytes": 0,
                                    "percent": 0.0, "speed_mbps": 0.0, "error": None}
        mhn._download_cancel_events[mid] = threading.Event()
        with mock.patch.object(mhn, "_get_model_target_path", return_value=(root, target)), \
             mock.patch.object(mhn.urllib.request, "urlopen", return_value=_FakeResp(status, body, length)):
            mhn._async_download_worker(mid)
        with open(target, "rb") as f:
            return f.read(), mhn._download_state[mid]

    def test_206_appends_to_partial(self):
        data, st = self._run(206, b"BBBB")
        self.assertEqual(data, b"AAAABBBB")
        self.assertEqual(st["total_bytes"], 8)

    def test_200_restarts_from_zero(self):
        data, st = self._run(200, b"BBBBBB")
        self.assertEqual(data, b"BBBBBB")

    def test_unknown_length_reports_zero_total(self):
        data, st = self._run(200, b"BB", length=False)
        self.assertEqual(st["total_bytes"], 0)
        self.assertEqual(st["status"], "completed")


class TestStartDownloadGuard(unittest.TestCase):
    # Value: protects=second start while a worker lives does not spawn another thread;
    #   fails_when=the is_alive guard is removed (two workers corrupt one .tmp);
    #   why_new=endpoint untested; seam=none; no_claim=real concurrent downloads (fake thread).
    def test_second_start_is_refused_while_alive(self):
        import asyncio, threading
        from unittest import mock
        mid = next(iter(mhn.REQUIRED_MODELS))
        gate = threading.Event()
        t = threading.Thread(target=gate.wait, daemon=True)
        t.start()
        self.addCleanup(gate.set)
        req = mock.Mock()
        async def _json(): return {"model_id": mid}
        req.json = _json
        with mock.patch.dict(mhn._download_threads, {mid: t}), \
             mock.patch.object(mhn.threading, "Thread") as th:
            res = asyncio.run(mhn.start_download_model(req))
        th.assert_not_called()
        self.assertTrue(res.body.get("already_running"))


if __name__ == "__main__":
    unittest.main()
