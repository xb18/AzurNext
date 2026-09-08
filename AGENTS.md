# AGENTS.md

本文件是 Codex、Claude Code 等编码代理共用的仓库规范。只保留影响决策的项目约束；实现细节按任务查阅下方入口。

> **注意**：本文件为 AI Agent 与开发者在本仓库中工作时的**唯一权威核心规范与架构设计基准文档**。所有工程规范、架构速查、编码模式、命令与发版流程均统一在本文件中维护。

## 协作与完成标准

- 使用简体中文交流，新增注释、文档和提交说明也使用简体中文；代码标识符使用英文，翻译资源使用对应语言。
- 将用户请求推进到可交付结果：完成实现、必要的生成产物与相关验证，修复本次改动引入的问题后再交付。若请求包含运行或界面验收，将其纳入完成范围。
- 在已授权范围内，直接进行本地编辑、构建、隔离测试及失败修复，无需逐步确认。只有缺失信息会实质影响结果，或下一步超出授权范围时才询问；已有授权持续有效。
- 真实游戏任务可能消耗资源或改变账号状态。普通开发验证优先使用测试夹具、已有截图和模拟服务；实际账号操作按用户指定的实例与任务范围执行。
- 保留已有工作区修改。交付时说明结果、实际验证及剩余限制；遇到环境或权限阻塞，明确未完成的部分，不把初版或未验证结果当作完成。

## 项目与环境

AzurPilot 是面向安卓模拟器的碧蓝航线自动化框架，支持 CN/EN/JP/TW，按 7×24 小时运行设计。游戏识别基于 **1280×720** 截图，不支持真机；这一尺寸约束不适用于 WebUI 布局。

- Python 使用 `uv` 项目模式和仓库内 `.venv/`。版本要求以 [pyproject.toml](pyproject.toml) 为准；依赖声明与 `uv.lock` 配套维护，不维护 `requirements*.txt`。
- WebUI 使用 React、TypeScript、Vite，前端用 npm；Node.js 要求与脚本以 [frontend/package.json](frontend/package.json) 为准。
- 在仓库根目录运行下列命令，按需选择，不是每次任务的必跑清单。

| 用途 | 命令 |
| --- | --- |
| 同步 Python 依赖 | `uv sync --frozen` |
| 安装前端锁定依赖 | `npm ci --prefix frontend` |
| 启动 WebUI | `uv run python gui.py` |
| 启动游戏调度器 | `uv run python alas.py` |
| 启动独立 MCP SSE 服务 | `uv run python mcp_server_sse.py` |
| Python 单个测试模块（示例） | `uv run python -m unittest tests.test_api` |
| Python 全量单元测试 | `uv run python -m unittest discover -s tests` |
| Python 基础 CI lint | `uv run ruff check . --select E9,F63,F7,F82 --ignore F821,F722` |
| 前端类型检查 | `npm run typecheck --prefix frontend` |
| 前端单元测试 | `npm test --prefix frontend` |
| 前端生产构建 | `npm run build --prefix frontend` |
| 浏览器端到端测试 | `npm run test:e2e --prefix frontend` |
| 前端模拟服务端到端测试 | `npm run test:e2e:mock --prefix frontend` |
| Python 导入冒烟检查 | `uv run python -m dev_tools.import_smoke_test` |

## 按任务查阅

先定位相关实现；需要背景时再打开对应文档。小范围文案或局部修改不要求通读架构。模块文档位于 [docs/modules/](docs/modules/README.md)（按模块职责组织的 20 节标准文档，入口见其索引）；目录、依赖和行为以当前代码、清单及 CI 为准。`.agent/` 仅存历史分析，已由 docs/modules/ 取代；其中旧流程或固定格式要求与本文件冲突时，以本文件为准。

| 涉及的工作 | 实现与参考入口 |
| --- | --- |
| 服务边界、跨模块改动 | [目录与任务映射](docs/modules/overview/directory-map.md)、[编码规范与设计模式](docs/modules/overview/conventions.md)、[调度器](docs/modules/entry/alas.md) |
| 调度、失败恢复、任务派发 | `alas.py`、[调度器](docs/modules/entry/alas.md)、[运行时服务](docs/modules/webui/runtime.md) |
| 配置定义、迁移、热重载 | `module/config/`、[配置系统](docs/modules/config.md)，以及下方配置生成约束 |
| WebUI、接口、运行进程 | `gui.py`、[WebUI 总览](docs/modules/webui/index.md)、[API 服务](docs/modules/webui/api.md)、[运行时服务](docs/modules/webui/runtime.md)、[frontend/README.md](frontend/README.md)、[frontend/API.md](frontend/API.md) |
| MCP 集成 | `mcp_server_sse.py`、[MCP SSE 服务器](docs/modules/entry/mcp-server.md) |
| 游戏页面、弹窗、识别资源 | [UI 导航](docs/modules/ui.md)、[处理器层](docs/modules/handler.md)、[基础层](docs/modules/base/index.md) |
| 设备、截图或 OCR | [设备层](docs/modules/device.md)、[OCR 系统](docs/modules/ocr.md) |
| 战斗、地图、活动适配 | `campaign/` 下相近关卡、[战役执行](docs/modules/campaign.md)、[战斗系统](docs/modules/combat.md)、[地图系统与检测](docs/modules/map.md) |
| 大世界或具体游戏功能 | [大世界核心](docs/modules/os/index.md)、[大世界辅助模块](docs/modules/os/auxiliary.md)、[其他游戏功能](docs/modules/game/misc.md) |
| 构建、部署或 CI | `deploy/`、[.github/workflows/ci.yml](.github/workflows/ci.yml) |

## 游戏交互约束

游戏流程采用持续的「截图 → 识别 → 操作」状态循环。用当前画面的正向状态确认退出，点击后继续循环获取新截图；不要用固定休眠猜测界面已就绪。

```python
def some_function(self, skip_first_screenshot=True):
    while True:
        if skip_first_screenshot:
            skip_first_screenshot = False
        else:
            self.device.screenshot()

        if self.appear(END_CONDITION):
            break
        if self.appear_then_click(BUTTON_A, interval=2):
            continue
        if self.handle_popup():
            continue
```

- 退出检测用 `appear()`，不设 `interval`；`appear_then_click()` 用于操作，通常以 2–5 秒 `interval` 防止连击。
- 不在状态循环内调用 `sleep()`，不以负面识别条件控制循环，不嵌套状态循环；将状态分支合并到父循环。
- 游戏交互的 `handle_*()` 返回 `bool`：`True` 表示已操作、需要新截图，`False` 表示未操作。只有已有可用截图时才跳过首次截图。
- 复用 `GameStuckError`、`GameTooManyClickError` 等检测与上层恢复机制；不要用吞异常或无限重试绕过它们。异常语义见 `module/exception.py`。
- 页面跳转复用 `UI` / `Page` 导航。涉及界面前后置条件时，在 Google 风格 docstring 中用 `Pages:` 标注；注释解释状态和原因，不规定注释比例或为凑行数拆文件。
- 使用现有 `logger.hr()`、`logger.attr()` 记录阶段和状态。截图、日志、测试夹具中避免引入账号信息和密钥。

## 配置与生成文件

修改配置定义时，先改 `module/config/argument/` 下的源文件：

| 源文件 | 职责 |
| --- | --- |
| `task.yaml` | 任务、选项组映射与菜单 |
| `argument.yaml` | 参数类型、选项、默认值与校验 |
| `default.yaml` | 用户可修改的任务特定默认值 |
| `override.yaml` | 强制覆盖及隐藏等属性；与可修改默认值区分 |
| `gui.yaml` | GUI 翻译键 |
| `dashboard.yaml` | 仪表盘资源定义 |

修改相关 YAML 后运行 `uv run -m module.config.config_updater`。`args.json`、`menu.json`、`module/config/config_generated.py` 与 `config/template.json` 由生成器维护，不直接修改，也不把真实用户配置当作模板。

`module/config/i18n/*.json` 是例外：生成器保留已有翻译，新增名称和说明可能只是键路径（如 `Campaign.Event.name`）。生成后补齐 `zh-CN`、`zh-MIAO`、`en-US`、`ja-JP`、`zh-TW` 的新增翻译，选项文案也需检查；繁体用词需校对，不能假设生成器已完成翻译。

配置路径为 `<Task>.<Group>.<Argument>`，绑定任务后通过 `self.config.Group_Argument` 访问。涉及加载或迁移时注意 `AzurLaneConfig` 初始化可能保存配置，测试使用临时配置目录。

## 资源与接口生成

- 游戏图像资源位于 `assets/{cn,en,jp,tw}/`；按 1280×720 游戏画面的坐标约定提取，模板可以是局部裁剪。模板对象名称使用 `TEMPLATE_` 前缀。
- 修改按钮资源后运行 `uv run -m dev_tools.button_extract`，检查生成的 `assets.py`。切换服务器进行离线识别时，在导入游戏模块前设置 `module.config.server.server`，避免资源已按其他服务器加载。
- `campaign/` 下关卡主要是 Python 地图定义与战斗逻辑；活动适配参考相近活动及 [campaign/Readme.md](campaign/Readme.md)，不要套用统一 YAML 地图流程。
- WebUI 业务通信使用 `/api/v1/ws`；前端位于 `frontend/`，后端接口与运行服务分别位于 `module/api/`、`module/runtime/`。新增功能沿用这些边界。
- 修改后端 API 参数模型或方法注册后，运行 `uv run python -m dev_tools.export_api_schema`，同步 `frontend/src/api/generated.ts` 与 `frontend/src/api/contract.json`，不手改生成产物。
- CI 会重新生成按钮、配置和 API 契约并检查差异。相关源文件与生成产物应一并交付；生成器产生无关差异时先查明原因，保留原有工作区修改。

## 验证与交付

根据行为影响选择验证，不因修改一个文件就默认运行全部检查：

- 纯文档改动核对事实、链接及差异即可；生成规则改动需验证对应产物。
- Python 逻辑先运行受影响的 `unittest` 模块；跨模块、导入或运行时改动再扩大到相关集成检查、全量测试或导入冒烟。
- 前端改动按影响选择类型检查、相关单元测试和构建；交互或布局变化还需浏览器验证。Playwright 主配置使用 `tests/serve_frontend.py` 的临时配置并禁止真实游戏进程，运行前需有最新前端构建；模拟服务测试使用独立 mock。
- 本地隔离测试可以连续执行、修复并重跑，无需逐次确认。检查通过后，只有新的修改、失败或未解决风险才需要扩大或重复验证。
- 游戏识别改动优先使用已有截图离线验证；模拟器实测按本次授权执行。未实测时明确说明，不能用静态检查替代实测结论。

交付前审阅本次差异，重点检查需求完整性、兼容性、并发与状态、隐私及无关修改。可修复的问题直接修复；报告实际发现和验证结果，不要求每次输出固定审查模板。

提交前查看全部 staged、unstaged 和 untracked 修改，区分本次变更与已有工作，按功能目的组织提交。独立的格式、依赖或工程调整应分开；实现、必要配置、生成产物和回归测试可在同一功能提交中。排除缓存、构建产物和调试残留。提交信息采用中文 Conventional Commits，例如 `fix(config): 避免热重载覆盖并发配置更新`，说明为什么修改。

AI 自行创建 PR 或执行任何涉及提 PR 的操作时，必须按 [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) 模板填写：如实勾选变更类型与代码质量确认项（未执行的检查不勾选），并在描述中说明变更原因、验证结果与相关 Issue。

## 桌面外壳与 Web 交互规范（Thin Shell）

AzurNext 桌面端采用 **Thin Shell（瘦外壳）** 架构设计（外壳为 Tauri 2 + Rust 构建的 `alas-launcher`）：

1. **Rust 只暴露底层接口到 `window.alasDesktop`**：
   - Rust 外壳仅作为纯粹的底层系统能力提供者，所有能力必须统一收拢挂载在 `window.alasDesktop` 顶级命名空间下（严禁暴露分散的全局函数）；
   - Rust 端严禁承载业务调度判定、状态机逻辑，严禁 Rust 端后台轮询/SSE 读取 WebUI 业务数据；
   - 核心暴露接口包括：
     - `window.alasDesktop.showNotification(title, content)`：调用系统原生 Toast 通知（点击唤醒主窗口）；
     - `window.alasDesktop.focus()`：唤醒并置顶聚焦主窗口；
     - `window.alasDesktop.openExternal(url)`：使用系统默认浏览器打开外部链接；
     - `window.alasDesktop.openFolder(path)`：在系统文件资源管理器中定位目录或文件；
     - `window.alasDesktop.getInfo()`：获取启动器版本与系统平台信息；
     - `window.alasDesktop.minimize()` / `toggleMaximize()` / `minimizeToTray()` / `close()` / `exit()`：窗口与托盘管理；
     - `window.alasDesktop.triggerUpdate()` / `getUpdateStatus()`：软件更新管理。

2. **Web 端做业务逻辑开发**：
   - 全权由 Web 端（Python WebUI / 前端 JS）负责业务逻辑判断、流程状态推进与通知时机决策；
   - **通知设计原则**：有外壳（`window.alasDesktop?.showNotification` 可用）时走系统原生通知，无外壳（纯浏览器访问）时回退为 WebUI 界面 Toast（如使用 `notify_or_toast(...)`）；
   - **严禁用 Python 调度系统通知**：Python 端不直接调度操作系统级通知 API（如 powershell/winrt 等），所有系统原生通知统一由前端 Web 页面在有壳环境下通过 `window.alasDesktop.showNotification` 触发。

3. **全平台（Windows / macOS / Linux）支持要求**：
   - 桌面外壳与 Web 交互接口必须在 Windows、macOS 和 Linux 上均有完整的底层实现，严禁平台缺失；
   - 任何涉及外壳功能增强或接口调整，必须保证三端代码兼容，不可引入破坏其他平台的特定依赖。

## 版本发布流程与规范

### 1. 版本号与 Git Tag 规范

- **语义化版本号（SemVer）**：遵循 `Major.Minor.Patch` 规则。
  - **Patch（如 `v1.0.6` -> `v1.0.7`）**：日常 Bug 修复、日常任务适配微调、UI 资产修补；
  - **Minor（如 `v1.0.7` -> `v1.1.0`）**：新增重大功能模块（如新活动玩法、新系统架构集成）、配置系统重大升级；
  - **Major（如 `v1.x` -> `v2.0.0`）**：底层依赖/Python 大版本切换、整体架构重写等非向后兼容变更。
- **Git Tag 命名**：统一使用带 `v` 前缀的 SemVer 格式（如 **`v1.0.7`**），与 GitHub Release 及 Docker 自动发布工作流完全对齐。

### 2. 发布前强制自检清单（Pre-release Checklist）

发布新版本或打 Tag 前，必须逐项完成以下检查：

1. **语法与 Lint 检查**：
   ```bash
   uv run ruff check . --select E9,F63,F7,F82 --ignore F821,F722
   ```
   必须通过且无报错。
2. **配置更新与一致性检查（关键）**：
   ```bash
   uv run -m module.config.config_updater
   ```
   必须运行此命令，确保 `args.json`、`menu.json`、`config_generated.py`、`template.json` 和 `i18n/*.json` 完全更新。随后运行 `git status` 确保**没有未提交的配置 diff**（CI 会严格检查并阻断）。
3. **单元测试与模块加载验证**：
   ```bash
   uv run python -m unittest discover -s tests
   ```
   核心测试用例必须全数通过。
4. **工作区清洁度**：
   检查 `git status`，确认没有遗留的本地调试截图、临时测试脚本或缓存文件。

### 3. 标准发版操作流程（Release Pipeline）

自检通过后，按以下步骤完成发版：

#### 步骤一：提交发版变更与更新日志
若涉及配置文件或版本信息变更，统一通过 Conventional Commits 提交：
```bash
git add .
git commit -m "chore(release): bump version to 1.0.7"
# 或按实际核心功能编写清晰的提交信息：
# git commit -m "Release 1.0.7: 适配最新活动关卡并修复已知调度问题"
```

#### 步骤二：创建带附注的 Git 发版标签
```bash
git tag -a v1.0.7 -m "Release v1.0.7: <版本说明与主要更新点>"
```

#### 步骤三：推送主分支与标签
```bash
git push origin main
git push origin v1.0.7
```

---

## Git 提交规范

### 提交前分析

提交代码前，必须分析当前 git 工作区中所有未提交的修改（staged、unstaged、untracked），按以下原则组织提交：

1. **理解修改目的**：主动理解每个修改的真实目的，不要简单粗暴地一次性提交
2. **合理聚合**：按功能目标 / 修复目的 / 重构范围 / 工程变更进行聚合
3. **语义边界**：避免把无关修改混在同一个 commit 中，拆分出具有明确语义边界的 commits
4. **区分变更类型**：
   - 格式化、重命名、类型修复、lint 修复 → 独立提交
   - 依赖变更、配置调整 → 独立提交
   - 核心逻辑变更 → 独立提交
5. **识别污染**：识别 AI 生成代码中常见的"顺手修改污染"（无关 import、无意义格式改动、调试代码、日志残留等）

### 提交前检查

检查是否存在以下不应提交的内容：
- 临时代码、console/debug 输出
- 注释掉的大段废弃逻辑
- 未使用文件
- cache/build/dist 产物
- prompt/debug/test residue
- accidentally committed artifacts

### 提交信息格式

使用 Conventional Commits 风格，中文撰写：

```
<type>(<scope>): <描述为什么改>
```

Type 类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构
- `perf`: 性能优化
- `chore`: 工程变更
- `docs`: 文档更新
- `test`: 测试相关
- `build`: 构建相关
- `ci`: CI 相关

要求：
- message 不要空泛，要体现"为什么改"
- 避免"修改代码""更新逻辑"这种低信息量描述
- 尽量体现真实意图、影响范围、架构意义

### 示例

```bash
git add module/base/base.py &&
git commit -m "feat(base): 引入任务级上下文隔离机制" && \
git add module/config/watcher.py &&
git commit -m "fix(config): 修复长期记忆污染导致的状态串扰问题" && \
git add alas.py module/daemon/ &&
git commit -m "refactor(runtime): 拆分 workspace 调度与 agent 生命周期管理"
```

### 强耦合说明

如果某些修改之间存在强耦合导致无法拆分，请在提交说明中注明原因。

---

## 代码审查原则（强制）

每次修改代码后，必须以代码审查者的视角进行自我审查：

### 审查清单

1. **完整性**：是否完整满足需求
2. **无关修改**：是否有无关修改（AI 生成代码常见"顺手修改污染"）
3. **兼容性**：是否破坏兼容性
4. **潜在 bug**：是否有潜在 bug
5. **并发/状态**：是否有并发、异步、缓存、状态同步问题
6. **安全隐私**：是否有安全或隐私风险
7. **测试覆盖**：是否缺少测试
8. **简化方案**：是否有更简单的实现方式
9. **命名/抽象**：是否有命名、抽象、边界不清的问题

### 输出格式

```markdown
## 发现的问题
...

## 建议修正
...

## 是否需要继续修改
...
```

---

## 维护这些指令

共享规范只在本文件维护，`CLAUDE.md` 仅负责导入。新增规则应针对实际工作流或已证实的陷阱；条件性细节放在相关文档并注明何时查阅。不要重新堆积完整 API 清单、易过期的数量或版本副本，也不要将单次任务的偏好扩展为所有任务的固定流程。
