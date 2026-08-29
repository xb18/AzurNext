"""
OCR 文字识别测试辅助脚本。
支持在指定的截图区域上调用 RapidOCR / AlOcr 测试文字识别内容与耗时。

用法示例：
  uv run python .agent/skills/extract-game-asset/scripts/test_ocr.py --image screenshot.png --area 340 305 700 340 --lang cnocr
"""

import argparse
import os
import sys
import time

# 将项目根目录加入 sys.path
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
)

import cv2

from module.ocr.ocr import Ocr


def test_ocr(image_path: str, area: tuple[int, int, int, int], lang: str = "cnocr"):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to read image: {image_path}")

    if img.shape[:2] != (720, 1280):
        img = cv2.resize(img, (1280, 720))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    ocr = Ocr(buttons=area, lang=lang)

    print("================== OCR 文字识别测试 ==================")
    print(f"识别区域 (1280x720): {area}")
    print(f"语言模型: {lang}")

    t0 = time.perf_counter()
    result = ocr.ocr(img_rgb)
    dt = (time.perf_counter() - t0) * 1000

    print(f"识别结果: '{result}' (耗时: {dt:.2f} ms)")


def main():
    parser = argparse.ArgumentParser(
        description="Test OCR recognition on screenshot area"
    )
    parser.add_argument("--image", "-i", required=True, help="Screenshot path")
    parser.add_argument(
        "--area",
        "-a",
        nargs=4,
        type=int,
        required=True,
        metavar=("X1", "Y1", "X2", "Y2"),
        help="Area coordinates x1 y1 x2 y2",
    )
    parser.add_argument(
        "--lang",
        "-l",
        default="cnocr",
        help="OCR model lang (cnocr, azur_lane, jp, tw)",
    )
    args = parser.parse_args()

    test_ocr(args.image, tuple(args.area), args.lang)


if __name__ == "__main__":
    main()
