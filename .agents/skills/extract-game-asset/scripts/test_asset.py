"""
游戏资产识别测试辅助脚本。
支持在指定的截图上测试 Button/Template 的颜色匹配 (appear_on) 与模板匹配 (match) 结果。

用法示例：
  uv run python .agent/skills/extract-game-asset/scripts/test_asset.py --image screenshot.png --module module.handler.assets --button M4399_HIDE_CONFIRM
"""

import argparse
import importlib
import os
import sys
import time

# 将项目根目录加入 sys.path
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
)

import cv2

from module.base.base import ModuleBase
from module.base.button import Button


class MockAgent(ModuleBase):
    def __init__(self):
        pass


class MockDevice:
    def __init__(self, image_rgb):
        self.image = image_rgb

    def stuck_record_add(self, *args, **kwargs):
        pass


def test_asset(
    image_path: str,
    module_path: str,
    asset_name: str,
    offset: tuple[int, int] = (20, 20),
):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to read image: {image_path}")

    if img.shape[:2] != (720, 1280):
        img = cv2.resize(img, (1280, 720))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    mod = importlib.import_module(module_path)
    if not hasattr(mod, asset_name):
        raise AttributeError(f"Asset '{asset_name}' not found in {module_path}")
    asset = getattr(mod, asset_name)

    agent = MockAgent()
    agent.device = MockDevice(img_rgb)

    print(f"================== 资产识别测试: {asset_name} ==================")
    print(f"资产类型: {type(asset).__name__}")
    print(f"定义信息: {asset}")

    # 1. 颜色匹配测试 (仅 Button)
    if isinstance(asset, Button):
        t0 = time.perf_counter()
        appear_color = agent.appear(asset, offset=0)
        dt_color = (time.perf_counter() - t0) * 1000
        print(
            f"【颜色匹配 appear(offset=0)】: {appear_color} (耗时: {dt_color:.2f} ms)"
        )

    # 2. 模板匹配测试 (Button 和 Template)
    t1 = time.perf_counter()
    appear_match = agent.appear(asset, offset=offset)
    dt_match = (time.perf_counter() - t1) * 1000
    print(
        f"【模板匹配 appear(offset={offset})】: {appear_match} (耗时: {dt_match:.2f} ms)"
    )


def main():
    parser = argparse.ArgumentParser(
        description="Test button/template detection on screenshot"
    )
    parser.add_argument("--image", "-i", required=True, help="Screenshot path")
    parser.add_argument(
        "--module",
        "-m",
        required=True,
        help="Assets module (e.g. module.handler.assets)",
    )
    parser.add_argument("--button", "-b", required=True, help="Button or Template name")
    parser.add_argument(
        "--offset",
        "-o",
        nargs=2,
        type=int,
        default=[20, 20],
        help="Search offset (dx, dy)",
    )
    args = parser.parse_args()

    test_asset(args.image, args.module, args.button, tuple(args.offset))


if __name__ == "__main__":
    main()
