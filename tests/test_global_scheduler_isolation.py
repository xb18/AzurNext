import argparse
import json
import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock

from alas import AzurLaneAutoScript
from module.config.utils import DEFAULT_CONFIG_NAME


class TestGlobalSchedulerIsolation(unittest.TestCase):
    """验证单实例调度器与多配置全局调度器的隔离性与防误判逻辑。"""

    def setUp(self):
        self.orig_env = os.environ.get("ALAS_GLOBAL_SCHEDULER")
        if "ALAS_GLOBAL_SCHEDULER" in os.environ:
            del os.environ["ALAS_GLOBAL_SCHEDULER"]

    def tearDown(self):
        if self.orig_env is not None:
            os.environ["ALAS_GLOBAL_SCHEDULER"] = self.orig_env
        elif "ALAS_GLOBAL_SCHEDULER" in os.environ:
            del os.environ["ALAS_GLOBAL_SCHEDULER"]

    def test_standalone_scheduler_not_enabled_by_default(self):
        """单独启动调度器时（默认参数），全局调度必须关闭。"""
        with patch.object(AzurLaneAutoScript, '__init__', lambda self, *args, **kwargs: None):
            script = AzurLaneAutoScript()
            script.config_name = 'alas'
            script._initial_config_name = 'alas'
            script._is_global_scheduler_explicit = None
            script._global_scheduler_active = None
            script._get_global_scheduler_attr = MagicMock(return_value=False)

            self.assertFalse(script.is_global_scheduler_enabled)

    def test_standalone_scheduler_ignores_dirty_status_file(self):
        """即使磁盘上存在残留的 active=true 状态文件，单独启动调度器也绝不误判为全局调度。"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as tf:
            json.dump({"active": True, "status": "running"}, tf)
            temp_status_path = tf.name

        try:
            with patch('alas.filepath_global_scheduler_status', return_value=temp_status_path):
                with patch.object(AzurLaneAutoScript, '__init__', lambda self, *args, **kwargs: None):
                    script = AzurLaneAutoScript()
                    script.config_name = 'alas'
                    script._initial_config_name = 'alas'
                    script._is_global_scheduler_explicit = False
                    script._global_scheduler_active = None
                    script._get_global_scheduler_attr = MagicMock(return_value=False)

                    # 显式或默认单实例，绝不受文件污染影响
                    self.assertFalse(script.is_global_scheduler_enabled)
        finally:
            if os.path.exists(temp_status_path):
                os.remove(temp_status_path)

    def test_standalone_scheduler_does_not_write_status(self):
        """单实例运行时调用 _update_global_scheduler_status 绝不执行文件写入。"""
        with patch.object(AzurLaneAutoScript, '__init__', lambda self, *args, **kwargs: None):
            script = AzurLaneAutoScript()
            script.config_name = 'alas'
            script._initial_config_name = 'alas'
            script._is_global_scheduler_explicit = False
            script._global_scheduler_active = False

            with patch('deploy.atomic.atomic_write') as mock_write:
                script._update_global_scheduler_status("running", task="Commission")
                mock_write.assert_not_called()

    def test_global_scheduler_explicit_true(self):
        """显式传入 is_global_scheduler=True 时，全局调度必须开启。"""
        with patch.object(AzurLaneAutoScript, '__init__', lambda self, *args, **kwargs: None):
            script = AzurLaneAutoScript()
            script.config_name = 'alas'
            script._initial_config_name = 'alas'
            script._is_global_scheduler_explicit = True
            script._global_scheduler_active = None

            self.assertTrue(script.is_global_scheduler_enabled)

    def test_global_scheduler_env_var(self):
        """环境变量 ALAS_GLOBAL_SCHEDULER=1 时，全局调度必须开启。"""
        os.environ["ALAS_GLOBAL_SCHEDULER"] = "1"
        with patch.object(AzurLaneAutoScript, '__init__', lambda self, *args, **kwargs: None):
            script = AzurLaneAutoScript()
            script.config_name = 'alas'
            script._initial_config_name = 'alas'
            script._is_global_scheduler_explicit = None
            script._global_scheduler_active = None

            self.assertTrue(script.is_global_scheduler_enabled)

    def test_command_line_parsing(self):
        """测试命令行参数解析逻辑：默认单独运行，仅在传 -g 时启用全局调度。"""
        parser = argparse.ArgumentParser(description="AzurNext 调度器")
        parser.add_argument(
            "-c", "--config",
            type=str,
            default=DEFAULT_CONFIG_NAME,
            help="指定运行的配置名称，默认为 alas",
        )
        parser.add_argument(
            "-g", "--global",
            dest="global_scheduler",
            action="store_true",
            default=False,
            help="以多配置全局调度模式运行",
        )

        # 1. 默认无参运行 (uv run python alas.py)
        args, _ = parser.parse_known_args([])
        self.assertEqual(args.config, DEFAULT_CONFIG_NAME)
        self.assertFalse(args.global_scheduler)

        # 2. 单独指定其他配置 (uv run python alas.py -c dev)
        args, _ = parser.parse_known_args(["-c", "dev"])
        self.assertEqual(args.config, "dev")
        self.assertFalse(args.global_scheduler)

        # 3. 显式开启全局调度 (uv run python alas.py -g)
        args, _ = parser.parse_known_args(["-g"])
        self.assertTrue(args.global_scheduler)

        # 4. 显式开启全局调度带配置 (uv run python alas.py -c alas --global)
        args, _ = parser.parse_known_args(["-c", "alas", "--global"])
        self.assertEqual(args.config, "alas")
        self.assertTrue(args.global_scheduler)


if __name__ == '__main__':
    unittest.main()
