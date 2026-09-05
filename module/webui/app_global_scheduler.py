"""WebUI 全局调度控制中心与状态进度监控。"""

from datetime import datetime
import json
import os
import re

from module.config.config import AzurLaneConfig
from module.config.utils import alas_instance, filepath_config, filepath_global_scheduler_status, get_default_main_instance
from module.logger import logger
from module.webui.app_dependencies import (
    DEFAULT_CONFIG_NAME,
    ProcessManager,
    RichLog,
    clear,
    load_config,
    put_button,
    put_html,
    put_scope,
    put_text,
    run_js,
    t,
    toast,
    use_scope,
)
from module.webui.app_types import WebUIMixinBase
from module.webui.widgets import BinarySwitchButton


class GlobalSchedulerMixin(WebUIMixinBase):
    """WebUI 全局调度控制中心与状态进度监控"""

    _global_scheduler_log: RichLog | None = None
    _global_scheduler_last_status: dict | None = None

    @use_scope("content", clear=True)
    def dev_global_scheduler(self) -> None:
        """渲染全局调度控制中心页面。"""
        self.mount_shell()
        self._set_manage_mode(False)
        self._active_aside = "Home"
        self.init_aside(expand_menu=False, name="Home")
        self.dev_set_menu()
        self.init_menu(collapse_menu=False, name="GlobalScheduler")
        self.set_title(t("Gui.MenuDevelop.GlobalScheduler"))

        # 加载当前主配置 (以 alas 为主)
        all_inst = alas_instance()
        main_config_name = get_default_main_instance()
        try:
            config = load_config(main_config_name)
        except Exception:
            config = AzurLaneConfig(config_name=main_config_name)

        put_scope("global_scheduler_page", [
            put_scope("gs_header"),
            put_scope("gs_body", [
                put_scope("gs_left", [
                    put_scope("gs_controls"),
                    put_scope("gs_tasks"),
                    put_scope("gs_progress"),
                    put_scope("gs_settings"),
                ]),
                put_scope("gs_right", [
                    put_scope("gs_logs"),
                ]),
            ]),
        ])

        self._render_gs_header()
        self._render_gs_controls(config, main_config_name)
        self._render_gs_tasks(force=True)
        self._render_gs_progress()
        self._render_gs_settings(config, main_config_name)
        self._render_gs_logs(main_config_name)

        # 启动定时刷新
        # 1. 轻量级运行状态与进度监控（2s，轻量：仅检查进程与轻量状态文件，不读任务配置）
        self.task_handler.add(self._update_gs_live_status, 2.0, True)
        # 2. 任务看板按需轮询（10s，对齐单配置 overview 刷新周期；未运行时自动跳过查询）
        self.task_handler.add(self._update_gs_tasks_loop, 10.0, True)

    def _get_gs_status_data(self) -> dict:
        """读取全局调度实时状态 JSON。"""
        status_file = filepath_global_scheduler_status()
        if os.path.exists(status_file):
            try:
                with open(status_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def _is_gs_running(self) -> bool:
        """检查是否有任何调度器实例正在运行。"""
        running = ProcessManager.running_instances()
        return len(running) > 0

    def _get_active_running_instance_name(self) -> str | None:
        """获取当前正在运行的实例名称。"""
        running = ProcessManager.running_instances()
        if running:
            return running[0].config_name
        return None

    def _format_task_name(self, task_name: str) -> str:
        """将任务命令名称转换为本地化中文显示名。"""
        if not task_name or str(task_name).strip() in ("无", "None", "null", ""):
            return "无"
        special_map = {
            "Restart": "重启游戏",
            "Alas": "总调度",
            "General": "通用",
            "GotoMain": "前往主页",
            "AppStop": "关闭游戏",
        }
        if task_name in special_map:
            return special_map[task_name]
        try:
            translated = t(f"Task.{task_name}.name")
            if translated and translated != f"Task.{task_name}.name":
                return translated
        except Exception:
            pass
        return task_name

    @use_scope("gs_header", clear=True)
    def _render_gs_header(self) -> None:
        put_html("""
        <div class="gs-title" style="margin-bottom: 0.35rem;">
            <span>🌐</span> 全局调度控制中心 (Global Scheduler)
        </div>
        <div class="gs-desc">
            按顺序轮流执行已创建的所有配置实例（如官服、4399渠道服或多个小号）。单账号跑完到期任务后自动收尾换号，所有账号跑完后统一休眠等待最早到期任务。
        </div>
        """)

    @use_scope("gs_controls", clear=True)
    def _render_gs_controls(self, config: AzurLaneConfig, main_config_name: str) -> None:
        is_running = self._is_gs_running()
        status_data = self._get_gs_status_data()

        status_text = "未运行"
        badge_cls = "gs-badge-idle"
        dot_color = "#8e8e93"

        if is_running:
            raw_st = status_data.get("status", "running")
            if raw_st == "waiting":
                status_text = "等待任务中"
                badge_cls = "gs-badge-waiting"
                dot_color = "#ff9500"
            elif raw_st == "switching":
                status_text = "切换配置中"
                badge_cls = "gs-badge-switching"
                dot_color = "#007aff"
            else:
                status_text = "正在运行"
                badge_cls = "gs-badge-running"
                dot_color = "#34c759"

        current_cfg = status_data.get("current_config", self._get_active_running_instance_name() or "无")
        raw_task = status_data.get("current_task", "无")
        current_task = self._format_task_name(raw_task)
        next_run = status_data.get("next_run", "")

        control_html = f"""
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div style="font-size: 1.05rem; font-weight: 600;">运行状态:</div>
                <div class="gs-badge {badge_cls}">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: {dot_color};"></span>
                    <span>{status_text}</span>
                </div>
                {f'<div style="font-size: 0.95rem; opacity: 0.9;">下次唤醒: <strong>{next_run}</strong></div>' if next_run and not is_running else ''}
            </div>
            <div id="pywebio-scope-gs_btns"></div>
        </div>
        """
        put_html(control_html)

        with use_scope("gs_btns"):
            if is_running:
                put_button(
                    label="停止全局调度",
                    onclick=lambda: self._handle_gs_stop(main_config_name),
                    color="danger",
                )
            else:
                put_button(
                    label="启动全局调度",
                    onclick=lambda: self._handle_gs_start(main_config_name),
                    color="success",
                )

    def _handle_manual_refresh_tasks(self) -> None:
        """用户点击手动刷新任务看板。"""
        toast("正在刷新任务看板...", color="info", duration=1.0)
        self._render_gs_tasks(force=True)

    def _render_gs_tasks(self, force: bool = False) -> None:
        """渲染全局任务看板。类似单个配置的 overview，通过快照对比避免无谓重绘。"""
        status_data = self._get_gs_status_data()
        is_running = self._is_gs_running()
        all_instances = alas_instance()
        cfg_list = status_data.get("config_list", [])
        if not cfg_list:
            cfg_list = list(all_instances)

        current_cfg = status_data.get("current_config", self._get_active_running_instance_name() or "")
        current_raw_task = status_data.get("current_task", "")
        current_task_display = self._format_task_name(current_raw_task)

        # 收集各配置任务数据
        running_items = []
        pending_items = []
        waiting_items = []

        if is_running and current_cfg and current_raw_task not in ("无", "None", "null", "", "切换配置", "单轮已完成", "单轮结束(遇错跳过)"):
            running_items.append({
                "config": current_cfg,
                "name": current_task_display,
                "raw_task": current_raw_task,
                "time": "执行中",
            })

        for name in cfg_list:
            try:
                cfg = AzurLaneConfig(config_name=name)
                cfg.get_next_task()

                for t_obj in cfg.pending_task:
                    # 如果当前配置正在执行该任务，避免重复计入 pending
                    if is_running and name == current_cfg and (t_obj.command == current_raw_task or self._format_task_name(t_obj.command) == current_task_display):
                        continue
                    pending_items.append({
                        "config": name,
                        "name": self._format_task_name(t_obj.command),
                        "raw_task": t_obj.command,
                        "time": str(t_obj.next_run),
                    })

                for t_obj in cfg.waiting_task:
                    waiting_items.append({
                        "config": name,
                        "name": self._format_task_name(t_obj.command),
                        "raw_task": t_obj.command,
                        "time": str(t_obj.next_run),
                    })
            except Exception:
                pass

        waiting_items.sort(key=lambda x: x["time"])

        # 生成快照（包含运行状态、当前任务、以及各队列项目）
        snapshot = (
            is_running,
            current_cfg,
            current_raw_task,
            tuple((item["config"], item["raw_task"], item["time"]) for item in running_items),
            tuple((item["config"], item["raw_task"], item["time"]) for item in pending_items),
            tuple((item["config"], item["raw_task"], item["time"]) for item in waiting_items[:12]),
        )

        if not force and getattr(self, "_gs_tasks_snapshot", None) == snapshot:
            return
        self._gs_tasks_snapshot = snapshot

        def make_rows_html(items, is_active=False):
            if not items:
                if is_active:
                    hint = "暂无运行中任务（调度未运行）" if not is_running else "暂无运行中任务"
                    return f'<div class="gs-task-empty">{hint}</div>'
                return '<div class="gs-task-empty">暂无任务</div>'
            rows = []
            for item in items:
                active_style = 'border-color: rgba(52, 199, 89, 0.4); background: rgba(52, 199, 89, 0.08);' if is_active else ''
                time_badge = '<span style="color: #34c759; font-weight: 600;">🔥 运行中</span>' if is_active else f'<span class="gs-task-time">{item["time"]}</span>'
                rows.append(f"""
                <div class="gs-task-row" style="{active_style}">
                    <div style="display: flex; align-items: center;">
                        <span class="gs-task-cfg-tag">[{item['config']}]</span>
                        <strong style="font-size: 0.92rem;">{item['name']}</strong>
                        <span style="font-size: 0.78rem; opacity: 0.6; margin-left: 0.35rem;">({item['raw_task']})</span>
                    </div>
                    <div>
                        {time_badge}
                    </div>
                </div>
                """)
            return "".join(rows)

        running_html = make_rows_html(running_items, is_active=True)
        pending_html = make_rows_html(pending_items)
        waiting_html = make_rows_html(waiting_items[:12])  # 最多展示前 12 个等待任务

        clear("gs_tasks")
        with use_scope("gs_tasks"):
            put_html(f"""
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div class="gs-title" style="font-size: 1.1rem !important; margin-bottom: 0;">
                    <span>📊</span> 全局任务看板 (按状态分类)
                </div>
                <div id="pywebio-scope-gs_tasks_refresh_btn"></div>
            </div>
            <div class="gs-tasks-sections">
                <!-- 运行中 -->
                <div class="gs-task-block" style="border-left: 4px solid #34c759;">
                    <div class="gs-task-block-title" style="color: #34c759;">
                        <span>🔥</span> 运行中 ({len(running_items)})
                    </div>
                    <div class="gs-task-list">
                        {running_html}
                    </div>
                </div>

                <!-- 队列中 -->
                <div class="gs-task-block" style="border-left: 4px solid #007aff;">
                    <div class="gs-task-block-title" style="color: var(--alas-apple-accent, #007aff);">
                        <span>⚡</span> 队列中 ({len(pending_items)})
                    </div>
                    <div class="gs-task-list">
                        {pending_html}
                    </div>
                </div>

                <!-- 等待中 -->
                <div class="gs-task-block" style="border-left: 4px solid #ff9500;">
                    <div class="gs-task-block-title" style="color: #ff9500;">
                        <span>⏳</span> 等待中 ({len(waiting_items)})
                    </div>
                    <div class="gs-task-list">
                        {waiting_html}
                    </div>
                </div>
            </div>
            """)
            with use_scope("gs_tasks_refresh_btn"):
                put_button(
                    label="🔄 刷新",
                    onclick=self._handle_manual_refresh_tasks,
                    color="light",
                )

    @use_scope("gs_progress", clear=True)
    def _render_gs_progress(self) -> None:
        status_data = self._get_gs_status_data()
        is_running = self._is_gs_running()

        # 计算配置列表
        all_instances = alas_instance()
        cfg_list = status_data.get("config_list", [])
        if not cfg_list:
            cfg_list = list(all_instances)

        current_cfg = status_data.get("current_config", self._get_active_running_instance_name() or "")
        current_idx = cfg_list.index(current_cfg) if current_cfg in cfg_list else 0

        # 生成步骤条 HTML
        steps_html = []
        for idx, name in enumerate(cfg_list):
            is_active = is_running and (name == current_cfg)
            is_past = is_running and (idx < current_idx)

            if is_active:
                item_cls = "gs-step-item active"
                icon = "🔥"
                badge = "<span class='gs-step-badge' style='background: var(--alas-apple-accent, #007aff); color: #fff;'>执行中</span>"
            elif is_past:
                item_cls = "gs-step-item completed"
                icon = "✅"
                badge = "<span class='gs-step-badge' style='background: #34c759; color: #fff;'>已完成</span>"
            else:
                item_cls = "gs-step-item"
                icon = "⏳"
                badge = "<span class='gs-step-badge' style='background: #8e8e93; color: #fff;'>等待中</span>"

            steps_html.append(f"""
            <div class="{item_cls}">
                <div class="gs-step-name">
                    <span>{icon} {idx+1}. {name}</span>
            {badge}
                </div>
            </div>
            """)

        queue_str = " ".join(steps_html)

        put_html(f"""
        <div style="font-size: 1.05rem; font-weight: bold; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
            <span>📋 轮转队列执行进度</span>
            <span style="font-size: 0.85rem; font-weight: normal; opacity: 0.75;">共 {len(cfg_list)} 个配置实例</span>
        </div>
        <div class="gs-step-grid">
            {queue_str}
        </div>
        """)

    @use_scope("gs_settings", clear=True)
    def _render_gs_settings(self, config: AzurLaneConfig, main_config_name: str) -> None:
        cfg_list_val = str(getattr(config, "GlobalScheduler_ConfigList", "auto"))
        single_cycle_val = bool(getattr(config, "GlobalScheduler_RunSingleCycle", False))
        when_empty_val = str(getattr(config, "GlobalScheduler_WhenTaskQueueEmpty", "close_emulator"))
        wait_val = int(getattr(config, "GlobalScheduler_WaitBetweenConfigs", 5))
        switch_err_val = bool(getattr(config, "GlobalScheduler_SwitchOnError", True))

        put_html("""
        <div style="font-size: 1.15rem; font-weight: bold; margin-bottom: 1rem; border-bottom: 1px solid var(--alas-apple-border, rgba(0,0,0,0.08)); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚙️</span> 全局调度参数配置
        </div>
        """)

        from pywebio.pin import pin_on_change, put_checkbox, put_input, put_select, put_textarea

        put_textarea(
            "gs_config_list",
            label="配置列表 (留空或 auto 自动按顺序执行所有已创建的配置，也可手动填如 'alas, alas4399' 自定义顺序):",
            value=cfg_list_val,
            rows=2,
        )
        # 只执行一轮（默认关闭 False）
        single_cycle_opts = [{"label": "只执行一轮（跑完一整套任务后直接退出调度器；关闭则动态全局等待并循环）", "value": "true"}]
        if single_cycle_val:
            single_cycle_opts[0]["selected"] = True
        put_checkbox(
            "gs_single_cycle",
            options=single_cycle_opts,
            value=["true"] if single_cycle_val else [],
        )
        put_select(
            "gs_when_empty",
            label="单个配置完成动作 (每个账号当期任务做完后的收尾动作):",
            options=[
                {"label": "关闭模拟器 (close_emulator - 推荐释放完整模拟器资源)", "value": "close_emulator", "selected": when_empty_val == "close_emulator"},
                {"label": "关闭游戏 (app_stop)", "value": "app_stop", "selected": when_empty_val == "app_stop"},
                {"label": "返回游戏主界面 (goto_main)", "value": "goto_main", "selected": when_empty_val == "goto_main"},
                {"label": "停留在当前界面 (stay_there)", "value": "stay_there", "selected": when_empty_val == "stay_there"},
            ],
        )
        put_input(
            "gs_wait_between",
            label="配置切换缓冲时间 (秒):",
            type="number",
            value=str(wait_val),
        )
        switch_err_opts = [{"label": "遇错自动跳过（当某一配置卡死或连续失败时，自动记录并跳至下一配置，防止单账号异常阻塞全局）", "value": "true"}]
        if switch_err_val:
            switch_err_opts[0]["selected"] = True
        put_checkbox(
            "gs_switch_on_error",
            options=switch_err_opts,
            value=["true"] if switch_err_val else [],
        )

        # 监听输入改动，实时自动保存
        pin_on_change("gs_config_list", onchange=lambda val: self._auto_save_gs_config(main_config_name, "ConfigList", str(val).strip()))
        pin_on_change("gs_single_cycle", onchange=lambda val: self._auto_save_gs_config(main_config_name, "RunSingleCycle", bool(val and "true" in val)))
        pin_on_change("gs_when_empty", onchange=lambda val: self._auto_save_gs_config(main_config_name, "WhenTaskQueueEmpty", str(val)))
        pin_on_change("gs_wait_between", onchange=lambda val: self._auto_save_gs_config(main_config_name, "WaitBetweenConfigs", int(val or 5)))
        pin_on_change("gs_switch_on_error", onchange=lambda val: self._auto_save_gs_config(main_config_name, "SwitchOnError", bool(val and "true" in val)))

    @use_scope("gs_logs", clear=True)
    def _render_gs_logs(self, main_config_name: str) -> None:
        active_name = self._get_active_running_instance_name() or main_config_name
        put_html(f"""
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div class="gs-title" style="font-size: 1.15rem !important; margin-bottom: 0;">
                <span>📜</span> 实时调度控制台日志 <span style="font-size: 0.85rem; font-weight: normal; color: var(--alas-apple-text-secondary, #86868b); margin-left: 0.5rem;">({active_name})</span>
            </div>
            <div id="pywebio-scope-gs_log_bar_btns" style="display: flex; gap: 0.5rem;"></div>
        </div>
        """)

        put_scope("log-container", [
            put_scope("log", [put_html("")])
        ]).style("height: 440px; min-height: 320px; max-height: 520px; border-radius: 12px; overflow: hidden; margin-top: 0.25rem;")

        if self._global_scheduler_log is None or getattr(self._global_scheduler_log, "_gs_active_name", None) != active_name:
            self._global_scheduler_log = RichLog("log")
            self._global_scheduler_log._gs_active_name = active_name

        log = self._global_scheduler_log
        log.scope = "log"
        log.first_display = True
        log.last_display_time = {}
        log.console.width = log.get_width()
        self._log = log

        with use_scope("gs_log_bar_btns"):
            switch_log_scroll = BinarySwitchButton(
                label_on=t("Gui.Button.ScrollON"),
                label_off=t("Gui.Button.ScrollOFF"),
                onclick_on=lambda: log.set_scroll(False),
                onclick_off=lambda: log.set_scroll(True),
                get_state=lambda: log.keep_bottom,
                color_on="on",
                color_off="off",
                scope="gs_log_scroll_btn",
            )
            put_scope("gs_log_scroll_btn")
            self.task_handler.add(switch_log_scroll.g(), 1, True)

        mgr = ProcessManager.get_manager(active_name)
        if mgr is not None:
            self.task_handler.add(log.put_log(mgr), 0.25, True)

    def _auto_save_gs_config(self, main_config_name: str, attr_name: str, value: object) -> None:
        """自动保存单个全局调度配置项并实时生效，并同步至所有实例保持一致。"""
        try:
            config = load_config(main_config_name)
            setattr(config, f"GlobalScheduler_{attr_name}", value)
            config.save()

            # 同步更新到所有其他已创建的配置实例，保证多配置间全局调度参数完全统一
            for cfg_name in alas_instance():
                if cfg_name != main_config_name:
                    try:
                        other_cfg = load_config(cfg_name)
                        setattr(other_cfg, f"GlobalScheduler_{attr_name}", value)
                        other_cfg.save()
                    except Exception:
                        pass

            logger.info(f"[全局调度] 自动保存配置: GlobalScheduler_{attr_name} = {value}")
            toast(f"✅ 全局调度配置已更新", color="success", duration=1.2)
            if attr_name == "ConfigList":
                self._render_gs_progress()
                self._render_gs_tasks(force=True)
        except Exception as e:
            logger.exception(f"[全局调度] 自动保存配置失败: {e}")

    def _handle_gs_start(self, main_config_name: str) -> None:
        """启动全局调度。"""
        try:
            config = load_config(main_config_name)

            # 解析待运行的配置列表（兼容 auto、手动指定）
            cfg_list_raw = getattr(config, "GlobalScheduler_ConfigList", "auto")
            all_instances = alas_instance()
            if not cfg_list_raw or str(cfg_list_raw).strip().lower() in ("auto", "null", "none", ""):
                cfg_list = list(all_instances)
            else:
                items = [item.strip() for item in re.split(r"[,;\n\r\t]+", str(cfg_list_raw)) if item.strip()]
                cfg_list = [c for c in items if os.path.exists(filepath_config(c))]
                if not cfg_list:
                    cfg_list = list(all_instances)
                # 去重保持顺序
                cfg_list = list(dict.fromkeys(cfg_list))

            start_config_name = cfg_list[0] if cfg_list else main_config_name

            mgr = ProcessManager.get_manager(start_config_name)
            if not mgr.alive:
                self.alas_name = start_config_name
                try:
                    from deploy.atomic import atomic_write
                    payload = {
                        "active": True,
                        "status": "running",
                        "current_config": start_config_name,
                        "current_task": "启动中",
                        "config_list": cfg_list,
                        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    }
                    atomic_write(filepath_global_scheduler_status(), json.dumps(payload, ensure_ascii=False, indent=2))
                except Exception:
                    pass
                mgr.start(None)
                toast(f"🚀 全局调度已启动 (起始实例: {start_config_name})！", color="success")
            else:
                # 若已有实例运行，先停止再重新启动，以确保读取最新配置
                try:
                    from module.base.utils import del_cached_property
                    # 停止旧实例
                    mgr.stop()
                    # 删除可能的缓存（若同一进程复用）
                    del_cached_property(mgr, "config")
                except Exception as e:
                    logger.exception(f"停止旧全局调度实例时出错: {e}")
                # 重新获取管理器并启动新实例
                mgr = ProcessManager.get_manager(start_config_name)
                self.alas_name = start_config_name
                mgr.start(None)
                toast(f"🚀 已重新启动全局调度 (实例: {start_config_name})！", color="success")

            all_inst = alas_instance()
            main_cfg = get_default_main_instance()
            try:
                config = load_config(main_cfg)
            except Exception:
                config = AzurLaneConfig(config_name=main_cfg)
            self._render_gs_controls(config, main_cfg)
            self._render_gs_tasks(force=True)
            self._render_gs_progress()
            self._render_gs_logs(start_config_name)
        except Exception as e:
            logger.exception(f"启动全局调度失败: {e}")
            toast(f"❌ 启动失败: {e}", color="error")

    def _handle_gs_stop(self, main_config_name: str) -> None:
        """停止全局调度。"""
        try:
            all_instances = alas_instance()

            running = ProcessManager.running_instances()
            stopped = []
            for mgr in running:
                try:
                    cfg = load_config(mgr.config_name)
                    stop_action = getattr(cfg, "Optimization_WhenSchedulerStopped", None)
                except Exception:
                    stop_action = None
                mgr.stop_by_user(stop_action)
                stopped.append(mgr.config_name)

            # 更新状态为已停止
            try:
                from deploy.atomic import atomic_write
                payload = {
                    "active": False,
                    "status": "idle",
                    "current_config": "已停止",
                    "current_task": "无",
                    "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                }
                atomic_write(filepath_global_scheduler_status(), json.dumps(payload, ensure_ascii=False, indent=2))
            except Exception:
                pass

            toast(f"⏹️ 全局调度已停止 (已停止实例: {', '.join(stopped) if stopped else main_config_name})", color="info")

            all_inst = alas_instance()
            main_cfg = get_default_main_instance()
            try:
                config = load_config(main_cfg)
            except Exception:
                config = AzurLaneConfig(config_name=main_cfg)
            self._render_gs_controls(config, main_cfg)
            self._render_gs_tasks(force=True)
            self._render_gs_progress()
        except Exception as e:
            logger.exception(f"停止全局调度失败: {e}")
            toast(f"❌ 停止失败: {e}", color="error")

    def _check_and_update_gs_tasks(self) -> None:
        """增量检查并更新任务看板。"""
        self._render_gs_tasks(force=False)

    def _update_gs_tasks_loop(self) -> None:
        """
        定时更新全局任务看板（周期 10s，对齐单配置 overview 刷新频率）。
        关键优化：若调度器未在运行，直接跳过查询，避免后台无谓磁盘 IO 与计算。
        """
        if self.page != "GlobalScheduler":
            return
        if not getattr(self, "visible", True):
            return

        # 未运行时不进行后台全量配置查询
        if not self._is_gs_running():
            return

        # 运行中每 10s 进行增量比对与按需刷新
        self._render_gs_tasks(force=False)

    def _update_gs_live_status(self) -> None:
        """
        定时刷新实时运行状态、步骤进度和日志挂载（周期 2s）。
        极轻量：仅检查进程活跃状态及状态文件，绝不触发全量任务配置查询。
        """
        if self.page != "GlobalScheduler":
            return
        if not getattr(self, "visible", True):
            return

        status_data = self._get_gs_status_data()
        is_running = self._is_gs_running()
        active_name = self._get_active_running_instance_name()

        # 仅在状态变化时刷新控制台与进度条
        status_key = {
            "running": is_running,
            "status": status_data.get("status"),
            "current_config": status_data.get("current_config"),
            "current_task": status_data.get("current_task"),
            "next_run": status_data.get("next_run"),
            "active_name": active_name,
        }

        if status_key != self._global_scheduler_last_status:
            last_status = self._global_scheduler_last_status or {}
            last_active = last_status.get("active_name")
            last_running = last_status.get("running")
            self._global_scheduler_last_status = status_key

            main_config_name = get_default_main_instance()
            try:
                config = load_config(main_config_name)
            except Exception:
                config = AzurLaneConfig(config_name=main_config_name)
            self._render_gs_controls(config, main_config_name)
            self._render_gs_progress()

            # 当运行状态改变（启动/停止）或当前运行配置切换时，主动刷新一次任务看板
            if is_running != last_running or status_data.get("current_config") != last_status.get("current_config"):
                self._render_gs_tasks(force=True)

            # 当运行实例切换或从停止变为启动时，刷新日志容器挂载
            if active_name != last_active:
                self._render_gs_logs(main_config_name)
