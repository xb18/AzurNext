# AzurNext 二次修改清单（防同步覆盖）

> 用途：`sync-upstream` 合并上游时对照本清单，冲突解决优先保留定制逻辑。
> 生成基准：上游 `wess09/AzurPilot` master @ `3a607a920`（Fix #1486，2026-11-08），
> 定制分支 `main` @ `b58a6c1b`（2026-11-11）。规模：16 提交 / 213 文件 / +23021 -318。

## 一、功能定制（按模块）

### 1. 桌面外壳与 Thin Shell 协议（最大定制，约 2400 行）
- `alas.py`（+400/-34）：桌面启动器外壳支持、Thin Shell 协议、多步更新交互
- `frontend/src/desktop/alasDesktop.ts`（+1251）、`alas-desktop.css`（+732）
- `frontend/src/app/updater.ts`、`background.ts`、`main.tsx`、`App.tsx` 配套改动
- `deploy/launcher/Alas.bat`、`deploy/Windows/config.py`

### 2. 全局调度中心（多配置实例）
- `module/api/global_scheduler_service.py`（+392，新文件）
- `frontend/src/pages/GlobalScheduler.tsx`（+451，新页面）
- `module/api/router.py`、`protocol.py`、`static.py` 注册接入
- `module/runtime/process_manager.py`：全局调度标志改位置传参
- `tests/test_global_scheduler_isolation.py`（+134）

### 3. 游戏功能增强
- `module/guild/logistics.py`（+89）：大舰队补给增强
- `module/raid/run.py`（+83）：共斗顺序
- `module/retire/retirement.py`（+233）：智能退役
- `module/reward/reward.py`、`assets.py`：奖励死循环保护
- `module/commission/commission.py`（+40）：委托石油自愈
- `module/handler/login.py`（+48）：4399 渠道服活动弹窗自动关闭
- `module/notify/notify.py`（+68）：通知扩展

### 4. 部署 / 更新器（高频冲突区）
- `deploy/git.py`（+41/-20）：Git 路径解析、私有仓库防国内网络检测改写成上游镜像、默认分支 main
- `deploy/frontend.py`（+23）：前端构建策略
- `deploy/utils.py`（+112）：ADB 多源下载、端口自适应分配
- `deploy/Windows/git.py`、`config.py`：Windows 安装器
- `deploy/uv.py`、`alas.py`、`patch.py`、`config.py`：启动与依赖策略
- `config/deploy.template*.yaml`（**8 个模板全部改过**，+7/-2 each）：默认分支 main 等
- `module/runtime/deploy_settings.py`、`updater.py`：部署配置事务语义
- `.gitignore`、`docker-compose.yml`、`deploy/docker/*`

### 5. WebUI / 品牌定制
- 默认网络策略、免密策略：`module/runtime/password_utils.py`
- 自定义背景：`frontend/src/app/background.ts`、`Wallpaper.tsx`
- 顶栏与品牌：`frontend/index.html`、`i18n.ts`、`theme-primitives.css`
- 静态缓存：`module/api/static.py`
- `frontend/src/api/contract.json`（+110）、`generated.ts`、`types.ts`：API 契约新增调度接口
- `frontend/src/pages/DevControls.tsx`、`TaskConfig.tsx`、`configVisibility.ts`

### 6. 配置项扩展
- `module/config/argument/args.json`（+120）、`argument.yaml`（+52）、`gui.yaml`、`task.yaml`
- `module/config/config.py`、`config_generated.py`、`config_updater.py`、`utils.py`、`time_source.py`
- `config/template.json`（+20）
- i18n 四语言：`module/config/i18n/{zh-CN,zh-TW,en-US,ja-JP}.json`（活动名生成器重产）

### 7. 网络与设备
- `module/device/connection_attr.py`（+49）：网络归属检测（get_country_code 恢复修复）

### 8. Agent 资产（非上游内容，同步时不会冲突，但注意保留）
- `.agents/skills/extract-game-asset/`（素材提取技能 + 脚本）
- `.agents/skills/sync-upstream/SKILL.md`（本技能）+ `CUSTOMIZATIONS.md`（本清单）
- `AGENTS.md`（+183 项目开发准则）
- `.github/workflows/ci.yml`（+2）
- `launcher/`（2026-11-12 新增）：Tauri Thin Shell 桌面客户端（启动器）源码，
  以 git subtree 方式从独立仓库 `AzurNext-Launcher` 合入（`--squash`）。
  独立开发时在该仓库改代码，用 `git subtree pull --prefix=launcher <仓库路径> master --squash`
  同步进来；反向 `git subtree push`。上游无此目录，sync 时不会冲突。

### 9. 测试（同步后必跑）
- `tests/test_api.py`、`test_config_transaction.py`、`test_deploy_environment_ports.py`（新）
- `test_deploy_location.py`、`test_deploy_settings_transactions.py`、`test_frontend_build.py`
- `test_global_scheduler_isolation.py`（新）、`test_password_utils.py`

## 二、同步冲突重点文件（上游活跃区，逐个检查）

| 文件 | 定制量 | 说明 |
|---|---|---|
| `alas.py` | +400 | 上游改动频繁，Thin Shell/启动器逻辑 |
| `deploy/git.py` | +41 | 更新器核心，上游同期也在改分支/路径逻辑 |
| `deploy/frontend.py` | +23 | 前端构建策略 |
| `module/retire/retirement.py` | +233 | 智能退役 |
| `module/raid/run.py` | +83 | 共斗顺序 |
| `module/guild/logistics.py` | +89 | 舰队补给 |
| `module/config/argument/*.yaml` + `args.json` | +175 | 新配置项，上游若重排需手动合并 |
| `frontend/src/desktop/alasDesktop.ts` | +1251 | 上游若重构桌面层需重点比对 |
| `config/deploy.template*.yaml` | 8 份 | 改动必须同步到全部模板 |

## 三、同步操作守则（sync-upstream 技能）

1. **merge 追加**，禁止 `--squash` / `--no-commit`：保留合并提交，让 Git 记住共同祖先。
2. **冲突取舍**：优先保留本清单列出的定制逻辑，再适配上游新特性；不确定时对照上游 diff 判断意图。
3. **私有提交数量**：保持 5~10 个；`master..main` 达到 20 个时做模块级聚合（Squash Gate）。
4. **同步后动作**：`uv sync --frozen`（依赖变更时）→ `uv run -m module.config.config_updater`（配置变更时）→ 跑第九节全部测试。
5. **分支约定**（2026-11-12 起）：
   - `upstream`：纯上游镜像（原 master 改名），CI 自动对齐，禁止手改
   - `main`：二次修改分支，merge 追加同步
   - `dist-main`：CI 从 main 构建的预构建 dist 发布分支（force push），客户端更新源
6. **CI 链路**：push main → GitHub Actions `build-dist` → 发布 `dist-main`；
   客户端 `deploy.yaml` 指向 `https://github.com/xb18/AzurNext` + `Branch: dist-main`，更新免 Node 构建。

## 四、定制提交索引（16 个）

```
b58a6c1 2026-11-11 chore(config): 按生成器重产活动名 i18n，对齐上游 Readme 与回退优先级
5985f50 2026-11-11 chore(sync): 合并上游 master 最新更新
d996679 2026-11-11 docs(agent): sync-upstream 技能改用 merge 追加方式同步上游
9b43aef 2026-10-28 fix(runtime): 恢复部署配置事务语义并按 fork 判定基准适配并发用例
9b7ab27 2026-10-24 fix(deploy): 修复私有仓库被国内网络检测改写成上游镜像的问题
163dbcc 2026-10-24 fix(deploy): 统一部署默认主分支为 main 并优化 Git 路径解析
ad2f9fc 2026-10-24 fix(test): 兼容 Windows 无符号链接特权环境下的测试容错
dffa0ab 2026-10-16 fix(runtime): 全局调度标志改为位置传参，恢复工作子进程事件测试
1bd3298 2026-10-16 fix(deploy): 恢复 get_country_code 导入，修复网络归属检测崩溃
af916d9 2026-10-08 docs(agent): 规范项目开发准则，新增相关工具与技能规范及全局配置定义
2d87ab4 2026-10-08 feat(desktop): 接入桌面启动器外壳支持、Thin Shell 协议与多步更新交互
66de498 2026-10-08 feat(scheduler): 实现多配置实例全局调度控制中心与状态看板
2292f77 2026-10-08 feat(webui): 调整默认网络/免密策略、静态缓存、自定义背景及顶栏与品牌定制
ad50cef 2026-10-08 feat(deploy): 优化启动脚本、ADB 多源下载、端口自适应分配与更新策略
c130f32 2026-10-08 feat(login): 支持 4399 渠道服活动弹窗自动关闭与悬浮球配置联动
d06a327 2026-10-08 feat(game): 增强大舰队补给、共斗顺序、委托石油自愈、智能退役与奖励死循环保护
```
