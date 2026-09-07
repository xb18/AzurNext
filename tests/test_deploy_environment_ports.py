import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from deploy.utils import (
    DEVELOPMENT_WEBUI_PORT,
    PRODUCTION_WEBUI_PORT,
    get_default_webui_port,
    is_production_environment,
)
from deploy.config import DeployConfig


class TestDeployEnvironmentPorts(unittest.TestCase):
    def test_production_path_detection(self):
        """测试路径中包含 alas-launcher 或 azurnext 时判定为生产环境。"""
        with patch.dict(os.environ, {}, clear=True):
            self.assertTrue(is_production_environment(r"F:\code\alas-launcher"))
            self.assertTrue(is_production_environment(r"F:\code\alas-launcher\src"))
            self.assertTrue(is_production_environment(r"C:\Program Files\AzurNext"))
            self.assertTrue(is_production_environment(r"/opt/alas-launcher/app"))

    def test_current_repo_is_development(self):
        """测试当前 AzurPilot 源码仓库在默认无环境变量时判定为开发环境，但使用生产端口。"""
        with patch.dict(os.environ, {}, clear=True):
            current_root = str(Path(__file__).resolve().parents[1])
            self.assertFalse(is_production_environment(current_root))
            self.assertEqual(get_default_webui_port(current_root), PRODUCTION_WEBUI_PORT)
            self.assertEqual(DEVELOPMENT_WEBUI_PORT, 25548)

    def test_launcher_pid_environment_variable(self):
        """测试由 alas-launcher 启动时存在 ALAS_LAUNCHER_PID 判定为生产环境。"""
        with patch.dict(os.environ, {"ALAS_LAUNCHER_PID": "12345"}, clear=True):
            current_root = str(Path(__file__).resolve().parents[1])
            self.assertTrue(is_production_environment(current_root))
            self.assertEqual(get_default_webui_port(current_root), PRODUCTION_WEBUI_PORT)
            self.assertEqual(PRODUCTION_WEBUI_PORT, 25548)

    def test_explicit_env_override(self):
        """测试通过显式环境变量覆盖环境判断。"""
        current_root = str(Path(__file__).resolve().parents[1])

        # 强制指定为 production (AZURNEXT_ENV)
        with patch.dict(os.environ, {"AZURNEXT_ENV": "production"}, clear=True):
            self.assertTrue(is_production_environment(current_root))
            self.assertEqual(get_default_webui_port(current_root), 25548)

        # 强制指定为 production (AZURPILOT_ENV 兼容)
        with patch.dict(os.environ, {"AZURPILOT_ENV": "production"}, clear=True):
            self.assertTrue(is_production_environment(current_root))
            self.assertEqual(get_default_webui_port(current_root), 25548)

        # 强制指定为 development (开发环境同样使用生产端口 25548)
        with patch.dict(os.environ, {"AZURNEXT_ENV": "development"}, clear=True):
            self.assertFalse(is_production_environment(r"F:\code\alas-launcher"))
            self.assertEqual(get_default_webui_port(r"F:\code\alas-launcher"), 25548)

    def test_sys_frozen_detection(self):
        """测试二进制打包环境判定为生产环境。"""
        with patch.dict(os.environ, {}, clear=True), patch.object(sys, "frozen", True, create=True):
            current_root = str(Path(__file__).resolve().parents[1])
            self.assertTrue(is_production_environment(current_root))

    def test_config_redirect_in_dev_environment(self):
        """测试在开发环境下使用生产端口 (25548)。"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            deploy_yaml = os.path.join(tmp_dir, "deploy.yaml")
            with open(deploy_yaml, "w", encoding="utf-8") as f:
                f.write(
                    "Deploy:\n"
                    "  Webui:\n"
                    "    WebuiHost: 127.0.0.1\n"
                    "    WebuiPort: 25548\n"
                )

            with patch("deploy.config.is_production_environment", return_value=False):
                cfg = DeployConfig(file=deploy_yaml)
                self.assertEqual(cfg.WebuiPort, PRODUCTION_WEBUI_PORT)
                self.assertEqual(cfg.config["WebuiPort"], PRODUCTION_WEBUI_PORT)

    def test_config_redirect_preserves_custom_port(self):
        """测试若用户显式配置了自定义端口 (如 8080)，在开发环境下不被覆盖。"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            deploy_yaml = os.path.join(tmp_dir, "deploy.yaml")
            with open(deploy_yaml, "w", encoding="utf-8") as f:
                f.write(
                    "Deploy:\n"
                    "  Webui:\n"
                    "    WebuiHost: 127.0.0.1\n"
                    "    WebuiPort: 8080\n"
                )

            with patch("deploy.config.is_production_environment", return_value=False):
                cfg = DeployConfig(file=deploy_yaml)
                self.assertEqual(cfg.WebuiPort, 8080)
                self.assertEqual(cfg.config["WebuiPort"], 8080)

    def test_config_redirect_in_prod_environment(self):
        """测试在生产环境下保持生产端口 (25548)。"""
        with tempfile.TemporaryDirectory() as tmp_dir:
            deploy_yaml = os.path.join(tmp_dir, "deploy.yaml")
            with open(deploy_yaml, "w", encoding="utf-8") as f:
                f.write(
                    "Deploy:\n"
                    "  Webui:\n"
                    "    WebuiHost: 127.0.0.1\n"
                    "    WebuiPort: 25548\n"
                )

            with patch("deploy.config.is_production_environment", return_value=True):
                cfg = DeployConfig(file=deploy_yaml)
                self.assertEqual(cfg.WebuiPort, PRODUCTION_WEBUI_PORT)
                self.assertEqual(cfg.config["WebuiPort"], PRODUCTION_WEBUI_PORT)

    def test_find_available_port_selects_free_port(self):
        """测试自动使用空闲端口函数。"""
        import socket
        from deploy.utils import find_available_port, is_port_available

        # 占用一个临时端口
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("127.0.0.1", 0))
            occupied = s.getsockname()[1]
            self.assertFalse(is_port_available(occupied))

            # 寻找可用端口时应该避开被占用的端口
            available = find_available_port(occupied)
            self.assertNotEqual(available, occupied)
            self.assertTrue(is_port_available(available))


if __name__ == "__main__":
    unittest.main()
