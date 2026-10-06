"""多配置实例全局轮转调度服务模块。

提供多配置实例轮转调度的实时状态读取、全局任务看板聚合、参数保存以及一键启停控制。
"""

import json
import re
from datetime import datetime
from pathlib import Path

from deploy.atomic import atomic_write
from module.api import protocol as p
from module.config.utils import filepath_global_scheduler_status
from module.logger import logger
from module.runtime.process_manager import ProcessManager


class GlobalSchedulerService:
    """多配置全局调度控制服务。

    Attributes:
        configs: 配置管理服务实例。
        runtime: 运行时管理服务实例。
    """

    def __init__(self, configs, runtime):
        """初始化全局调度服务。

        Args:
            configs: 配置服务实例。
            runtime: 运行时服务实例。
        """
        self.configs = configs
        self.runtime = runtime

    def main_instance(self) -> str:
        """获取默认主配置实例名称（优先返回 'alas'，否则返回首个实例）。

        Returns:
            str: 主配置实例名称。

        Raises:
            p.ApiError: 当没有任何可用配置实例时抛出 NOT_FOUND。
        """
        names = self.configs.names()
        if not names:
            raise p.ApiError('NOT_FOUND', '当前没有任何配置实例，请先创建一个实例')
        if 'alas' in names:
            return 'alas'
        return names[0]

    def _status_file(self) -> Path:
        """获取全局调度状态 JSON 文件路径。"""
        cache_dir = self.configs.root / 'cache'
        cache_dir.mkdir(parents=True, exist_ok=True)
        return cache_dir / 'globalscheduler_status.json'

    def _read_status_data(self) -> dict:
        """读取全局调度状态文件数据。"""
        candidates = [self._status_file(), Path(filepath_global_scheduler_status())]
        for path in candidates:
            try:
                if path.is_file():
                    data = json.loads(path.read_text(encoding='utf-8'))
                    if isinstance(data, dict):
                        return data
            except Exception:
                continue
        return {
            'active': False,
            'status': 'idle',
            'current_config': '',
            'current_task': '',
            'current_index': 0,
            'total_configs': 0,
            'config_list': [],
            'next_run': '',
            'updated_at': '',
        }

    def _write_status_data(self, payload: dict) -> None:
        """将全局调度状态同步写入本地缓存文件。"""
        content = json.dumps(payload, ensure_ascii=False, indent=2)
        for path in {self._status_file().resolve(), Path(filepath_global_scheduler_status()).resolve()}:
            try:
                path.parent.mkdir(parents=True, exist_ok=True)
                atomic_write(str(path), content)
            except Exception:
                pass

    def _resolve_config_list(self, raw_value: str, all_names: list[str]) -> list[str]:
        """根据配置字符串解析顺序执行的配置列表。"""
        text = str(raw_value or '').strip()
        if not text or text.lower() in ('auto', 'null', 'none'):
            return list(all_names)
        items = [item.strip() for item in re.split(r'[,;\n\r\t]+', text) if item.strip()]
        valid = []
        for item in items:
            if item in all_names and item not in valid:
                valid.append(item)
        return valid if valid else list(all_names)

    def _translate_task(self, task_name: str) -> str:
        """将任务命令名转换为界面可读的中文名称。"""
        if not task_name or task_name in ('无', 'None', 'null'):
            return '无'
        special = {
            '启动中': '启动中',
            '切换配置': '正在切换配置...',
            '单轮已完成': '单轮所有配置已完成',
            '单轮结束(遇错跳过)': '单轮已结束（遇错跳过）',
        }
        if task_name in special:
            return special[task_name]
        translated = self.configs.translate(f'Task.{task_name}.name')
        if translated and translated != 'name':
            return translated
        return task_name

    def status(self) -> dict:
        """获取全局调度的完整实时状态、轮转队列进度及各实例任务看板。

        Returns:
            dict: 全局调度状态响应字典。
        """
        all_names = self.configs.names()
        if not all_names:
            return {
                'running': False,
                'status': 'idle',
                'mainInstance': '',
                'activeInstance': None,
                'currentConfig': '',
                'currentTask': '无',
                'currentTaskLabel': '无',
                'nextRun': '',
                'updatedAt': '',
                'allInstances': [],
                'configList': [],
                'queue': [],
                'settings': {
                    'configList': 'auto',
                    'runSingleCycle': False,
                    'whenTaskQueueEmpty': 'close_emulator',
                    'waitBetweenConfigs': 5,
                    'switchOnError': True,
                },
                'runningTasks': [],
                'pendingTasks': [],
                'waitingTasks': [],
            }

        main_inst = self.main_instance()
        main_data, _ = self.configs.read(main_inst)
        gs_cfg = main_data.get('Alas', {}).get('GlobalScheduler', {})

        settings = {
            'configList': str(gs_cfg.get('ConfigList', 'auto') or 'auto'),
            'runSingleCycle': bool(gs_cfg.get('RunSingleCycle', False)),
            'whenTaskQueueEmpty': str(gs_cfg.get('WhenTaskQueueEmpty', 'close_emulator') or 'close_emulator'),
            'waitBetweenConfigs': int(gs_cfg.get('WaitBetweenConfigs', 5) if gs_cfg.get('WaitBetweenConfigs') is not None else 5),
            'switchOnError': bool(gs_cfg.get('SwitchOnError', True)),
        }

        running_managers = [
            mgr for mgr in ProcessManager.running_instances()
            if getattr(mgr, 'is_global_scheduler', False)
        ]
        is_running = len(running_managers) > 0
        active_instance = running_managers[0].config_name if running_managers else None

        status_data = self._read_status_data()
        raw_status = str(status_data.get('status') or 'idle')
        if not is_running and raw_status in ('running', 'switching', 'waiting'):
            effective_status = 'idle'
        elif is_running and raw_status == 'idle':
            effective_status = 'running'
        else:
            effective_status = raw_status

        configured_list = self._resolve_config_list(settings['configList'], all_names)
        status_cfg_list = [c for c in (status_data.get('config_list') or []) if c in all_names]
        config_list = status_cfg_list if (is_running and status_cfg_list) else configured_list

        current_config = str(status_data.get('current_config') or '')
        if is_running and active_instance:
            if not current_config or current_config == '已停止':
                current_config = active_instance
        elif not is_running and current_config in ('', '已停止'):
            current_config = ''

        raw_task = str(status_data.get('current_task') or '')
        if is_running and active_instance:
            mgr_task = getattr(running_managers[0], 'current_task', None)
            if mgr_task:
                raw_task = str(mgr_task)
        if not raw_task:
            raw_task = '无'

        current_idx = config_list.index(current_config) if current_config in config_list else -1
        single_cycle_done = (not is_running) and raw_task == '单轮已完成'

        queue = []
        for idx, name in enumerate(config_list):
            if single_cycle_done:
                step_state = 'completed'
            elif is_running:
                if current_idx >= 0:
                    if idx < current_idx:
                        step_state = 'completed'
                    elif idx == current_idx:
                        step_state = 'running'
                    else:
                        step_state = 'pending'
                else:
                    step_state = 'running' if name == active_instance else 'pending'
            else:
                step_state = 'idle'
            queue.append({
                'index': idx + 1,
                'instance': name,
                'state': step_state,
            })

        running_tasks = []
        pending_tasks = []
        waiting_tasks = []

        if is_running and current_config and raw_task not in (
            '无', 'None', 'null', '', '切换配置', '单轮已完成', '单轮结束(遇错跳过)'
        ):
            running_tasks.append({
                'instance': current_config,
                'name': raw_task,
                'label': self._translate_task(raw_task),
                'nextRun': '执行中',
                'state': 'running',
            })

        for name in config_list:
            try:
                ov = self.runtime.overview(name)
                for item in ov.get('tasks', []):
                    t_name = item.get('name', '')
                    t_state = item.get('state', 'waiting')
                    t_next = item.get('nextRun', '')
                    if is_running and name == current_config and t_name == raw_task:
                        continue
                    entry = {
                        'instance': name,
                        'name': t_name,
                        'label': self._translate_task(t_name),
                        'nextRun': t_next,
                        'state': 'pending' if item.get('pending') else t_state,
                    }
                    if item.get('pending') or t_state == 'pending':
                        pending_tasks.append(entry)
                    else:
                        waiting_tasks.append(entry)
            except Exception as exc:
                logger.warning(f'[全局调度] 读取实例 {name} 任务总览失败: {exc}')

        waiting_tasks.sort(key=lambda item: item.get('nextRun') or '')

        return {
            'running': is_running,
            'status': effective_status,
            'mainInstance': main_inst,
            'activeInstance': active_instance,
            'currentConfig': current_config or '无',
            'currentTask': raw_task,
            'currentTaskLabel': self._translate_task(raw_task),
            'nextRun': str(status_data.get('next_run') or ''),
            'updatedAt': str(status_data.get('updated_at') or ''),
            'allInstances': all_names,
            'configList': config_list,
            'queue': queue,
            'settings': settings,
            'runningTasks': running_tasks,
            'pendingTasks': pending_tasks,
            'waitingTasks': waiting_tasks[:20],
        }

    def save(self, params: p.GlobalSchedulerSaveParams) -> dict:
        """保存全局调度参数至主配置实例，并同步至所有已创建实例以保持一致。

        Args:
            params: 全局调度设置修改参数。

        Returns:
            dict: 更新后的全局调度完整状态。
        """
        main_inst = self.main_instance()
        changes = []
        if params.config_list is not None:
            changes.append(p.ConfigChange(
                path='Alas.GlobalScheduler.ConfigList',
                value=params.config_list.strip() or 'auto',
            ))
        if params.run_single_cycle is not None:
            changes.append(p.ConfigChange(
                path='Alas.GlobalScheduler.RunSingleCycle',
                value=params.run_single_cycle,
            ))
        if params.when_task_queue_empty is not None:
            changes.append(p.ConfigChange(
                path='Alas.GlobalScheduler.WhenTaskQueueEmpty',
                value=params.when_task_queue_empty,
            ))
        if params.wait_between_configs is not None:
            changes.append(p.ConfigChange(
                path='Alas.GlobalScheduler.WaitBetweenConfigs',
                value=params.wait_between_configs,
            ))
        if params.switch_on_error is not None:
            changes.append(p.ConfigChange(
                path='Alas.GlobalScheduler.SwitchOnError',
                value=params.switch_on_error,
            ))
        if changes:
            self.configs.patch(main_inst, None, changes)
            for inst_name in self.configs.names():
                if inst_name != main_inst:
                    try:
                        self.configs.patch(inst_name, None, changes)
                    except Exception:
                        pass
        return self.status()

    def start(self) -> dict:
        """启动多配置全局轮转调度。

        Returns:
            dict: 启动后的全局调度完整状态。
        """
        all_names = self.configs.names()
        main_inst = self.main_instance()

        main_data, _ = self.configs.read(main_inst)
        gs_cfg = main_data.get('Alas', {}).get('GlobalScheduler', {})
        config_list = self._resolve_config_list(str(gs_cfg.get('ConfigList', 'auto')), all_names)
        start_config_name = config_list[0] if config_list else main_inst

        # 若已有实例正在运行，先停止以确保使用最新全局调度配置启动
        for running_mgr in ProcessManager.running_instances():
            with ProcessManager._get_lifecycle_lock(running_mgr.config_name):
                running_mgr.stop_by_user()

        payload = {
            'active': True,
            'status': 'running',
            'current_config': start_config_name,
            'current_task': '启动中',
            'current_index': 0,
            'total_configs': len(config_list),
            'config_list': config_list,
            'next_run': '',
            'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        self._write_status_data(payload)

        with ProcessManager._get_lifecycle_lock(start_config_name):
            manager = self.runtime.manager(start_config_name)
            from module.runtime.updater import updater
            manager.start('alas', ev=updater.event, is_global_scheduler=True)
            if not manager.alive:
                raise p.ApiError('START_FAILED', '全局调度启动失败，请检查服务是否正在重启')

        self.runtime._record_running_now()
        return self.status()

    def stop(self) -> dict:
        """停止全局调度及所有正在运行的实例进程。

        Returns:
            dict: 停止后的全局调度完整状态。
        """
        for running_mgr in ProcessManager.running_instances():
            with ProcessManager._get_lifecycle_lock(running_mgr.config_name):
                if not running_mgr.stop_by_user():
                    raise p.ApiError('STOP_FAILED', f'实例 {running_mgr.config_name} 尚未完全停止，请重试')

        payload = {
            'active': False,
            'status': 'idle',
            'current_config': '已停止',
            'current_task': '无',
            'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        self._write_status_data(payload)
        self.runtime._record_running_now()
        return self.status()
