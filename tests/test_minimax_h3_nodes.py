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

    def test_text_to_video_valid(self):
        res, meta_str = self.node.generate_video(
            mode="text_to_video",
            duration=4,
            fps="24",
            motion_strength=0.5,
            guidance_scale=7.5,
            prompt="A majestic lion roaring in slow motion"
        )
        self.assertIsInstance(res, dict)
        self.assertIn("metadata", res)
        self.assertEqual(res["metadata"]["prompt"], "A majestic lion roaring in slow motion")
        self.assertEqual(res["metadata"]["duration"], 4)
        self.assertEqual(res["metadata"]["fps"], 24)

    def test_image_to_video_valid(self):
        res, meta_str = self.node.generate_video(
            mode="image_to_video",
            duration=6,
            fps="30",
            motion_strength=0.7,
            guidance_scale=8.0,
            prompt="Camera panning right across portrait"
        )
        self.assertEqual(res["metadata"]["duration"], 6)
        self.assertEqual(res["metadata"]["fps"], 30)
        self.assertEqual(res["metadata"]["motion_strength"], 0.7)

    def test_reference_to_video_valid(self):
        res, meta_str = self.node.generate_video(
            mode="reference_to_video",
            duration=8,
            fps="24",
            motion_strength=0.4,
            guidance_scale=6.5,
            prompt="Character talking naturally"
        )
        self.assertEqual(res["metadata"]["duration"], 8)
        self.assertEqual(res["metadata"]["raw_mode"], "reference_to_video")


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


if __name__ == "__main__":
    unittest.main()
