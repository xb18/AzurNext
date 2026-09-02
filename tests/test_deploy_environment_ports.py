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
        """测试当前 AzurPilot 源码仓库在默认无环境变量时判定为开发环境。"""
        with patch.dict(os.environ, {}, clear=True):
            current_root = str(Path(__file__).resolve().parents[1])
            self.assertFalse(is_production_environment(current_root))
            self.assertEqual(get_default_webui_port(current_root), DEVELOPMENT_WEBUI_PORT)
            self.assertEqual(DEVELOPMENT_WEBUI_PORT, 25549)

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

        # 强制指定为 production
        with patch.dict(os.environ, {"AZURPILOT_ENV": "production"}, clear=True):
            self.assertTrue(is_production_environment(current_root))
            self.assertEqual(get_default_webui_port(current_root), 25548)

        # 强制指定为 development (即使处于包含 alas-launcher 的路径中)
        with patch.dict(os.environ, {"AZURPILOT_ENV": "development"}, clear=True):
            self.assertFalse(is_production_environment(r"F:\code\alas-launcher"))
            self.assertEqual(get_default_webui_port(r"F:\code\alas-launcher"), 25549)

    def test_sys_frozen_detection(self):
        """测试二进制打包环境判定为生产环境。"""
        with patch.dict(os.environ, {}, clear=True), patch.object(sys, "frozen", True, create=True):
            current_root = str(Path(__file__).resolve().parents[1])
            self.assertTrue(is_production_environment(current_root))

    def test_config_redirect_in_dev_environment(self):
        """测试在开发环境下未自定义的默认生产端口 (25548) 自动重定向为开发端口 (25549)。"""
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
                self.assertEqual(cfg.WebuiPort, DEVELOPMENT_WEBUI_PORT)
                self.assertEqual(cfg.config["WebuiPort"], DEVELOPMENT_WEBUI_PORT)

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


if __name__ == "__main__":
    unittest.main()
