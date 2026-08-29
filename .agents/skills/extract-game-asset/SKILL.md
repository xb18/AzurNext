---
name: extract-game-asset
description: >-
  从游戏截图/用户图片中提取、生成、验证 AzurPilot 游戏 UI 元素资产（Button/Template/OCR）。当需要适配新界面、添加新按钮、处理渠道弹窗、测试图像匹配或生成 assets 时使用此技能。
---

# 游戏资产提取与测试技能 (Extract Game Asset Skill)

本技能为在 AzurPilot 项目中提取 UI 元素（按钮 Button、模板 Template、OCR 识别区）提供全流程标准化规范与自动化工具支持。

---

## 核心设计规范

1. **基准画布 1280×720**：所有截图在进行分析和裁剪前，必须归一化为 1280×720 分辨率。
2. **黑底遮罩规范**：
   - 按钮资源保存在 `assets/<server>/<module>/<NAME>.png`；
   - 整张图片尺寸保持 1280×720，**除了被框选的有效按钮区域保留原色彩外，其他所有背景区域必须全部填充为纯黑 (`RGB: 0, 0, 0`)**。
3. **命名规则**：
   - **普通按钮 (Button)**：全大写英文字符，如 `CONFIRM.png`、`M4399_HIDE_CONFIRM.png`；
   - **模板匹配 (Template)**：以 `TEMPLATE_` 为前缀，如 `TEMPLATE_MANJUU.png`；
   - **OCR 区域 (Ocr)**：以 `OCR_` 为前缀，如 `OCR_FUEL_MAXED.png`。
4. **生成器规则**：
   - 所有 `assets.py` 文件均由 `dev_tools/button_extract.py` 自动扫描生成，**绝不手动编辑 `assets.py`**。

---

## 🛠️ 自动化工具与快捷脚本

本技能内置了 3 个自动化 Python 脚本，位于 `.agent/skills/extract-game-asset/scripts/`：

### 1. 一键裁剪并生成黑底遮罩资产 (`crop_asset.py`)

输入截图路径与目标区域坐标 `(x1, y1, x2, y2)`，脚本会自动缩放至 1280×720 并生成符合规范的 PNG 资产：

```powershell
uv run python .agent/skills/extract-game-asset/scripts/crop_asset.py `
  --input "path/to/screenshot.png" `
  --output "assets/cn/handler/MY_BUTTON.png" `
  --area 720 540 790 582
```

### 2. 提取资产定义至代码 (`button_extract.py`)

生成完 PNG 图片后，运行提取器更新对应的 `assets.py`：

```powershell
# 推荐：快速单模块提取（如 handler 模块，避免多进程崩溃）
uv run python -c "from dev_tools.button_extract import worker; worker('handler')"

# 或全量提取
uv run -m dev_tools.button_extract
```

### 3. 本地验证资产识别与耗时 (`test_asset.py`)

在真实截图上验证颜色匹配（`appear_on`）和模板匹配（`match`）结果及耗时：

```powershell
uv run python .agent/skills/extract-game-asset/scripts/test_asset.py `
  --image "path/to/screenshot.png" `
  --module "module.handler.assets" `
  --button "MY_BUTTON" `
  --offset 20 20
```

### 4. 本地验证 OCR 识别与耗时 (`test_ocr.py`)

测试指定坐标区域的文字识别：

```powershell
uv run python .agent/skills/extract-game-asset/scripts/test_ocr.py `
  --image "path/to/screenshot.png" `
  --area 340 305 700 340 `
  --lang cnocr
```

---

## 🎨 手工 Photoshop 处理流程（可选）

如果你习惯使用 Photoshop 手工处理：

1. **打开原图**：在 PS 中打开 `1280×720` 的游戏截图原图；
2. **矩形选框 (M)**：框选出目标按钮的核心视觉特征区域；
3. **反选涂黑**：
   - 按 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>（选择反向）；
   - 按 <kbd>Shift</kbd> + <kbd>F5</kbd>（填充为纯黑色 #000000，不透明度 100%）；
4. **保存图片**：保存为 PNG 到对应 `assets/<server>/<module>/<NAME>.png`；
5. **提取资产**：运行 `uv run -m dev_tools.button_extract`。

---

## ⚠️ 关键陷阱与避坑指南

1. **选区黑色污染与颜色容差**：
   - 提取按钮时，选区边界务必留出 1~2 像素余量或严格对齐按钮边缘，**不要把黑色遮罩边缘的黑色羽化/抗锯齿像素算进按钮区域内**，否则会导致提取出来的特征平均色偏暗（例如偏离 20+ 色阶导致 `appear_on` 判定失败）。
2. **长按与拖拽手势时延**：
   - 安卓系统悬浮窗（如 4399、TapTap 悬浮球）需要长按停顿约 `0.2~0.3s` 才会进入拖动模式，普通极速滑动不会触发悬浮窗位移；
   - 拖拽起始点与边缘距离至少保持 5 像素以上（避免计算出 `y <= 0` 负坐标）。
3. **冷却时钟与时序闭环**：
   - 类似“拖拽后弹出确认框”的动作，应在拖拽完成后立即紧跟一个短暂的轮询检测（如 `sleep(0.3) + screenshot() + appear_then_click()`），避免因外部全局 Timer 冷却而错失弹窗。
