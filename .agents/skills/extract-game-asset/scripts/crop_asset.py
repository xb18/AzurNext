"""
游戏资产提取全流程辅助脚本。
支持将任意尺寸的游戏截图缩放至标准 1280x720，按指定区域反选生成标准纯黑遮罩资产 PNG，
并支持一键多服务器同步分发、自动执行 button_extract 代码生成与原图匹配验证。

用法示例：
  # 方式 1：一键全流程（推荐，生成+多服分发+自动提取代码+原图匹配验证）
  uv run python .agents/skills/extract-game-asset/scripts/crop_asset.py \
    --input "path/to/screenshot.png" \
    --module reward \
    --name OIL_LIMIT \
    --area 550 311 710 338 \
    --all-servers \
    --extract \
    --verify

  # 方式 2：经典单文件输出（兼容旧参数）
  uv run python .agents/skills/extract-game-asset/scripts/crop_asset.py \
    --input "path/to/screenshot.png" \
    --output "assets/cn/reward/OIL_LIMIT.png" \
    --area 550 311 710 338
"""

import argparse
import importlib
import os
import sys
import time

# 自动将项目根目录加入 sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import cv2
import numpy as np


VALID_SERVERS = ['cn', 'en', 'jp', 'tw']


def create_masked_asset(
    input_path: str, output_path: str, area: tuple[int, int, int, int]
) -> np.ndarray:
    """缩放图片至 1280x720，将选区之外背景反选填充纯黑，并保存为标准资产。"""
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"输入截图文件不存在: {input_path}")

    img = cv2.imread(input_path)
    if img is None:
        raise ValueError(f"读取图片失败: {input_path}")

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

    # 2. 生成全黑遮罩画布并贴入目标区域 (反选填充纯黑 RGB: 0, 0, 0)
    masked = np.zeros_like(img)
    masked[y1:y2, x1:x2] = img[y1:y2, x1:x2]

    # 3. 确保目标目录存在并保存
    abs_out = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(abs_out), exist_ok=True)
    cv2.imwrite(abs_out, masked)
    avg_rgb = masked[y1:y2, x1:x2].mean(axis=(0, 1))[::-1].astype(int).tolist()
    print(f"[OK] 成功生成资产: {output_path}")
    print(f"     有效区域坐标 (1280x720): ({x1}, {y1}, {x2}, {y2}), 宽={x2-x1}, 高={y2-y1}")
    print(f"     区域平均颜色 RGB: {avg_rgb}")

    return img


def run_code_extract(module: str):
    """调用 dev_tools.button_extract.worker 刷新 module/<module>/assets.py"""
    print(f"\n[流水线] 正在提取资产定义到 module/{module}/assets.py ...")
    try:
        from dev_tools.button_extract import worker
        worker(module)
        print(f"[OK] 已成功更新 module/{module}/assets.py")
    except Exception as e:
        print(f"[ERROR] 提取代码失败: {e}", file=sys.stderr)


def run_verify(
    normalized_img: np.ndarray,
    module: str,
    name: str,
    area: tuple[int, int, int, int],
    offset: tuple[int, int] = (20, 20),
):
    """在归一化原截图上验证颜色检测与模板匹配效果及耗时"""
    print(f"\n[流水线] 正在执行资产匹配验证: {module}.assets.{name} ...")
    x1, y1, x2, y2 = area
    target_crop = normalized_img[y1:y2, x1:x2]

    # 1. 颜色相似度
    avg_rgb = target_crop.mean(axis=(0, 1))[::-1].astype(int)
    print(f"  - 选区颜色 RGB: {avg_rgb.tolist()}")

    # 2. 局部模板匹配测试
    start_time = time.perf_counter()
    res = cv2.matchTemplate(normalized_img, target_crop, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    elapsed_ms = (time.perf_counter() - start_time) * 1000

    match_success = max_val >= 0.85
    print(f"  - 模板匹配最佳置信度: {max_val * 100:.2f}% (匹配位置: {max_loc})")
    print(f"  - 模板匹配计算耗时: {elapsed_ms:.2f} ms")
    print(f"  - 判定结果: {'[通过 PASS]' if match_success else '[失败 FAIL]'}")

    # 3. 动态导入 assets.py 验证定义
    try:
        mod = importlib.import_module(f"module.{module}.assets")
        importlib.reload(mod)
        btn = getattr(mod, name, None)
        if btn is not None:
            print(f"  - assets.{name} 定义加载成功: area={btn.area}")
        else:
            print(f"  - [警告] assets.py 中未找到 {name} 变量")
    except Exception as e:
        print(f"  - 动态导入 assets 警告: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="AzurPilot 游戏资产提取全流程工具 (缩放+反选黑底+多服分发+提取+验证)"
    )
    parser.add_argument("--input", "-i", required=True, help="输入截图路径 (任意分辨率)")
    parser.add_argument(
        "--area",
        "-a",
        nargs=4,
        type=int,
        required=True,
        metavar=("X1", "Y1", "X2", "Y2"),
        help="目标有效区域坐标 (在1280x720标准画布下的 x1 y1 x2 y2)",
    )

    # 快捷全流程参数
    parser.add_argument("--module", "-m", help="目标功能模块名称 (如 reward, commission, handler)")
    parser.add_argument("--name", "-n", help="资产按钮名称 (如 OIL_LIMIT, CONFIRM)")
    parser.add_argument(
        "--servers",
        nargs="+",
        choices=VALID_SERVERS,
        help="目标服务器列表 (默认由 --all-servers 或仅 cn 决定)",
    )
    parser.add_argument(
        "--all-servers",
        action="store_true",
        help="一键同步生成至全部支持的服务器 (cn, en, jp, tw)",
    )
    parser.add_argument(
        "--extract",
        action="store_true",
        help="生成图片后自动调用 button_extract 提取到 assets.py",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="提取完成后在原截图上自动运行模板匹配与颜色打分验证",
    )

    # 兼容旧参数
    parser.add_argument(
        "--output",
        "-o",
        help="自定义单个输出资产路径 (如 assets/cn/handler/NAME.png)",
    )

    args = parser.parse_args()
    area = tuple(args.area)

    normalized_img = None

    if args.output:
        # 单文件模式
        normalized_img = create_masked_asset(args.input, args.output, area)
    elif args.module and args.name:
        # 模块化多服务器分发模式
        servers = VALID_SERVERS if args.all_servers else (args.servers or ['cn'])
        for s in servers:
            out_path = f"assets/{s}/{args.module}/{args.name}.png"
            normalized_img = create_masked_asset(args.input, out_path, area)
    else:
        parser.error("必须提供 --output 指定单个输出路径，或者同时提供 --module 与 --name 进行自动化生成。")

    # 自动执行代码提取
    if args.extract and args.module:
        run_code_extract(args.module)

    # 自动执行匹配打分验证
    if args.verify and args.module and args.name and normalized_img is not None:
        run_verify(normalized_img, args.module, args.name, area)


if __name__ == "__main__":
    main()
