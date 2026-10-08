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

本技能内置了自动化 Python 脚本，位于 `.agents/skills/extract-game-asset/scripts/`：

### 1. 一键全流程资产流水线 (`crop_asset.py`) ⭐ 推荐

**无需手动打开 Photoshop！** 脚本支持任意截图分辨率自动归一化到 1280×720，按指定选区反选填充纯黑遮罩 (`RGB: 0, 0, 0`)，一键同步分发至所有服务器目录，自动重新生成 `assets.py` 代码并现场执行匹配置信度验证：

```powershell
# 推荐：一键完成「缩放 -> 纯黑遮罩 -> 4服分发 -> 提取代码 -> 匹配验证」全流程
uv run python .agents/skills/extract-game-asset/scripts/crop_asset.py `
  --input "path/to/screenshot.png" `
  --module reward `
  --name OIL_LIMIT `
  --area 550 311 710 338 `
  --all-servers `
  --extract `
  --verify
```

参数说明：
- `--input, -i`：截图路径（自动按比例 Lanczos4/Area 缩放到 1280×720）；
- `--area, -a`：目标有效区域坐标 `x1 y1 x2 y2`（基于 1280×720 标准画布）；
- `--module, -m`：所属模块（如 `reward`, `commission`, `handler`）；
- `--name, -n`：资产名称（普通按钮大写如 `OIL_LIMIT`，模板匹配前缀如 `TEMPLATE_XX`）；
- `--all-servers`：一键自动生成并写入 `assets/{cn,en,jp,tw}/<module>/<NAME>.png`；
- `--extract`：生成图片后自动调用 `button_extract.py` 刷新对应模块的 `assets.py`；
- `--verify`：在原截图上自动运行模板匹配与颜色检测打分，输出相似度置信度与计算耗时。

亦可使用经典单文件模式：
```powershell
uv run python .agents/skills/extract-game-asset/scripts/crop_asset.py `
  --input "path/to/screenshot.png" `
  --output "assets/cn/reward/OIL_LIMIT.png" `
  --area 550 311 710 338
```

### 2. 独立资产定义提取器 (`button_extract.py`)

如只需单独重新扫描并生成 `assets.py`：

```powershell
# 快速单模块提取（如 reward 模块）
uv run python -c "from dev_tools.button_extract import worker; worker('reward')"

# 全量所有模块提取
uv run -m dev_tools.button_extract
```

### 3. 本地验证资产识别与耗时 (`test_asset.py`)

在指定截图上验证颜色匹配（`appear_on`）和模板匹配（`match`）结果及耗时：

```powershell
uv run python .agents/skills/extract-game-asset/scripts/test_asset.py `
  --image "path/to/screenshot.png" `
  --module "module.reward.assets" `
  --button "OIL_LIMIT" `
  --offset 20 20
```

### 4. 本地验证 OCR 识别与耗时 (`test_ocr.py`)

测试指定坐标区域的文字识别：

```powershell
uv run python .agents/skills/extract-game-asset/scripts/test_ocr.py `
  --image "path/to/screenshot.png" `
  --area 340 305 700 340 `
  --lang cnocr
```

---

## 🛡️ 拦截性 Toast 提示与防死循环设计范式 (Anti-Loop Pattern)

### 场景典型特征
在“全部领取”、“派遣委托”、“一键出击”等操作时，若玩家资源超出上限（如**石油达到上限**、**物资达到上限**、**船坞已满**），游戏**不会离开当前页面**进入结算弹窗，而是在屏幕中央弹出持续 2~3 秒的浮动半透明横幅（Toast，如“部分的奖励将超出资源上限，请手动领取”）。

### 常见致命陷阱
若代码仅依赖 `clicked and not self.ui_page_appear(page)` 退出，由于页面未跳转，退出条件永远不满足；按钮依然处于可点击状态，轮询计时器会每隔 1~2 秒持续重复点击，在连续点击 12 次后必定触发 `GameTooManyClickError` 进而引发整个框架或模拟器重启。

### 标准防护范式
1. **优先提取拦截性特征为 Button/Template**：
   使用 `crop_asset.py` 提取横幅核心文案（如 `OIL_LIMIT`、`DOCK_FULL`），并使用模板匹配检测 `self.appear(OIL_LIMIT, offset=(20, 20))`。
2. **在点击和弹窗轮询首位注入拦截判定**：
   ```python
   for _ in self.loop():
       # 核心：必须在检查点击间隔和跳转前优先检测拦截 Toast！
       if self.appear(OIL_LIMIT, offset=(20, 20)):
           logger.warning('[任务] 检测到资源达到上限拦截: OIL_LIMIT')
           raise OilMaxed

       if clicked and not self.ui_page_appear(page_target):
           return clicked
       ...
   ```
3. **外层状态机优雅自愈与退出限制**：
   - 捕获异常后，联动对应解决系统（如 `RewardDorm.dorm_food_run()` 前往后宅购买食物消耗石油、或调用退役系统）；
   - **绝不死循环重试**：设置最多重试 3 次，并在配置提供开关（如 `Reward_DormFoodOnOilMaxed`）；若重试达上限或用户关闭自动购买，必须 `break` 退出并记录警告，优雅结束本次流程。

---

## 🎨 手工 Photoshop 处理流程（可选备用）

若特殊复杂图案需要手工处理：

1. **打开原图**：在 PS 中打开 `1280×720` 的游戏截图原图；
2. **矩形选框 (M)**：框选出目标按钮的核心视觉特征区域；
3. **反选涂黑**：
   - 按 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>（选择反向）；
   - 按 <kbd>Shift</kbd> + <kbd>F5</kbd>（填充为纯黑色 #000000，不透明度 100%）；
4. **保存图片**：保存为 PNG 到对应 `assets/<server>/<module>/<NAME>.png`；
5. **提取资产**：运行 `uv run -m dev_tools.button_extract`。

---

## ⚠️ 关键避坑指南

1. **选区黑色污染与颜色容差**：
   - 提取按钮时，选区边界务必留出 1~2 像素余量或严格对齐按钮边缘，**不要把黑色遮罩边缘的黑色羽化/抗锯齿像素算进按钮区域内**，否则会导致提取出来的特征平均色偏暗（例如偏离 20+ 色阶导致 `appear_on` 判定失败）。
2. **半透明文字优选模板匹配 (offset=(20, 20))**：
   - 浮动横幅（Toast）或遮罩背景通常带有半透明度，背景透出的底色会导致平均 RGB 产生波动。因此检测文字横幅时，必须在调用 `appear` 时传入 `offset=(20, 20)` 启用模板匹配（卷积归一化相关系数），具有极高的抗底色干扰能力。
3. **多服务器同步与资产完整性**：
   - 使用 `crop_asset.py --all-servers` 确保 `cn`, `en`, `jp`, `tw` 四个目录同步更新，避免 CI 检查或在非国服环境运行时报缺少资产异常。
4. **冷却时钟与时序闭环**：
   - 类似“拖拽后弹出确认框”的动作，应在拖拽完成后立即紧跟一个短暂的轮询检测（如 `sleep(0.3) + screenshot() + appear_then_click()`），避免因外部全局 Timer 冷却而错失弹窗。
