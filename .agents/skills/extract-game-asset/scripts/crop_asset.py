"""
游戏资产提取辅助脚本。
支持将任意尺寸的游戏截图缩放至标准 1280x720，并按指定区域生成标准黑色遮罩资产 PNG。

用法示例：
  uv run python .agent/skills/extract-game-asset/scripts/crop_asset.py --input screenshot.png --output assets/cn/handler/MY_BUTTON.png --area 800 150 850 200
"""

import argparse
import os

import cv2
import numpy as np


def create_masked_asset(
    input_path: str, output_path: str, area: tuple[int, int, int, int]
):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    img = cv2.imread(input_path)
    if img is None:
        raise ValueError(f"Failed to read image: {input_path}")

    # 1. 归一化到标准 1280x720 分辨率
    if img.shape[:2] != (720, 1280):
        img = cv2.resize(
            img,
            (1280, 720),
            interpolation=cv2.INTER_AREA if img.shape[1] > 1280 else cv2.INTER_LANCZOS4,
        )

    x1, y1, x2, y2 = area
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(1280, x2), min(720, y2)

    # 2. 生成全黑遮罩画布并贴入目标区域
    masked = np.zeros_like(img)
    masked[y1:y2, x1:x2] = img[y1:y2, x1:x2]

    # 3. 确保目标目录存在并保存
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    cv2.imwrite(output_path, masked)
    print(f"[OK] 成功生成资产: {output_path}")
    print(f"     区域坐标 (1280x720): ({x1}, {y1}, {x2}, {y2})")
    print(
        f"     区域平均颜色 RGB: {masked[y1:y2, x1:x2].mean(axis=(0, 1))[::-1].astype(int).tolist()}"
    )


def main():
    parser = argparse.ArgumentParser(description="Crop and mask 1280x720 game asset")
    parser.add_argument("--input", "-i", required=True, help="Input screenshot path")
    parser.add_argument(
        "--output",
        "-o",
        required=True,
        help="Output asset path (e.g. assets/cn/module/NAME.png)",
    )
    parser.add_argument(
        "--area",
        "-a",
        nargs=4,
        type=int,
        required=True,
        metavar=("X1", "Y1", "X2", "Y2"),
        help="Bounding box coordinates x1 y1 x2 y2",
    )
    args = parser.parse_args()

    create_masked_asset(args.input, args.output, tuple(args.area))


if __name__ == "__main__":
    main()
