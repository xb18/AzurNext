import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from module.webui.fake_pil_module import remove_fake_pil_module

remove_fake_pil_module()

from module.webui.app_home import HomeMixin
from module.webui.base import Frame
from module.webui.utils import update_url


class RouteHalt(Exception):
    """用于在路由分支决策命中后安全终止后续无关联的后台循环。"""
    pass


class TestWebUIUrlRouting(unittest.TestCase):
    def test_update_url_invokes_run_js(self):
        with patch("module.webui.utils.run_js") as mock_run_js:
            update_url("alas", "Campaign")
            mock_run_js.assert_called_once()
            args, kwargs = mock_run_js.call_args
            self.assertEqual(kwargs.get("aside"), "alas")
            self.assertEqual(kwargs.get("menu"), "Campaign")

    def test_update_url_skips_when_no_aside(self):
        with patch("module.webui.utils.run_js") as mock_run_js:
            update_url(None, "Overview")
            mock_run_js.assert_not_called()

    def test_frame_init_aside_and_menu_updates_url(self):
        frame = Frame.__new__(Frame)
        frame.aside = "Home"
        frame.page = "Home"
        frame.task_handler = MagicMock()
        frame._page_lock = MagicMock()
        frame.expand_menu = MagicMock()
        frame.collapse_menu = MagicMock()
        frame.active_button = MagicMock()
        frame.set_statistics_content_visible = MagicMock()

        with (
            patch("module.webui.base.set_localstorage"),
            patch("module.webui.base.update_url") as mock_update_url,
            patch("module.webui.base.clear"),
        ):
            Frame.init_aside(frame, expand_menu=False, name="alas")
            self.assertEqual(frame.aside, "alas")

            Frame.init_menu(frame, collapse_menu=False, name="Campaign")
            self.assertEqual(frame.page, "Campaign")
            mock_update_url.assert_called_once_with("alas", "Campaign")

    def test_home_run_prioritizes_url_route_over_localstorage(self):
        def on_restore_home_menu(menu):
            raise RouteHalt(f"restore_home_menu:{menu}")

        gui = SimpleNamespace(
            theme="default",
            is_mobile=False,
            mount_shell=MagicMock(),
            ui_manage=MagicMock(),
            ui_alas=MagicMock(),
            restore_home_menu=MagicMock(side_effect=on_restore_home_menu),
            show_home=MagicMock(),
        )

        mock_localstorage = {
            "aside": "alas",
            "menu": "Overview",
            "url_aside": "Home",
            "url_menu": "Setting",
            "clarity_notice_shown": "1",
        }

        with (
            patch("module.webui.app_home.set_env"),
            patch("module.webui.app_home.load_webui_styles"),
            patch("module.webui.app_home.is_oobe_needed", return_value=False),
            patch(
                "module.webui.app_home.get_localstorage_values",
                return_value=mock_localstorage,
            ),
            patch("module.webui.app_home.alas_instance", return_value=["alas"]),
            self.assertRaises(RouteHalt) as ctx,
        ):
            HomeMixin.run(gui, initial_page="home", localstorage=mock_localstorage)

        self.assertEqual(str(ctx.exception), "restore_home_menu:Setting")

    def test_home_run_routes_to_instance_with_url_menu(self):
        def on_ui_alas(aside, initial_menu=None):
            raise RouteHalt(f"ui_alas:{aside}:{initial_menu}")

        gui = SimpleNamespace(
            theme="default",
            is_mobile=False,
            mount_shell=MagicMock(),
            ui_manage=MagicMock(),
            ui_alas=MagicMock(side_effect=on_ui_alas),
            restore_home_menu=MagicMock(),
            show_home=MagicMock(),
            _alas_thread_update_config=MagicMock(),
            state_switch=MagicMock(),
            set_aside_status=MagicMock(),
            task_handler=MagicMock(),
        )

        mock_localstorage = {
            "aside": "Home",
            "menu": "HomePage",
            "url_aside": "alas",
            "url_menu": "Campaign",
            "clarity_notice_shown": "1",
        }

        with (
            patch("module.webui.app_home.set_env"),
            patch("module.webui.app_home.load_webui_styles"),
            patch("module.webui.app_home.is_oobe_needed", return_value=False),
            patch(
                "module.webui.app_home.get_localstorage_values",
                return_value=mock_localstorage,
            ),
            patch("module.webui.app_home.alas_instance", return_value=["alas"]),
            patch("threading.Thread"),
            patch("module.webui.app_home.register_thread"),
            patch("module.webui.app_home.Switch"),
            self.assertRaises(RouteHalt) as ctx,
        ):
            HomeMixin.run(gui, initial_page="home", localstorage=mock_localstorage)

        self.assertEqual(str(ctx.exception), "ui_alas:alas:Campaign")

    def test_home_run_routes_to_manage_via_url(self):
        def on_ui_manage():
            raise RouteHalt("ui_manage")

        gui = SimpleNamespace(
            theme="default",
            is_mobile=False,
            mount_shell=MagicMock(),
            ui_manage=MagicMock(side_effect=on_ui_manage),
            ui_alas=MagicMock(),
            restore_home_menu=MagicMock(),
            show_home=MagicMock(),
        )

        mock_localstorage = {
            "aside": "alas",
            "menu": "Overview",
            "url_aside": "Manage",
            "url_menu": "ManageList",
            "clarity_notice_shown": "1",
        }

        with (
            patch("module.webui.app_home.set_env"),
            patch("module.webui.app_home.load_webui_styles"),
            patch("module.webui.app_home.is_oobe_needed", return_value=False),
            patch(
                "module.webui.app_home.get_localstorage_values",
                return_value=mock_localstorage,
            ),
            patch("module.webui.app_home.alas_instance", return_value=["alas"]),
            self.assertRaises(RouteHalt) as ctx,
        ):
            HomeMixin.run(gui, initial_page="home", localstorage=mock_localstorage)

        self.assertEqual(str(ctx.exception), "ui_manage")

    def test_home_run_falls_back_when_no_url_route(self):
        def on_ui_alas(aside, initial_menu=None):
            raise RouteHalt(f"ui_alas:{aside}:{initial_menu}")

        gui = SimpleNamespace(
            theme="default",
            is_mobile=False,
            mount_shell=MagicMock(),
            ui_manage=MagicMock(),
            ui_alas=MagicMock(side_effect=on_ui_alas),
            restore_home_menu=MagicMock(),
            show_home=MagicMock(),
            _alas_thread_update_config=MagicMock(),
            state_switch=MagicMock(),
            set_aside_status=MagicMock(),
            task_handler=MagicMock(),
        )

        mock_localstorage = {
            "aside": "alas",
            "menu": "Commission",
            "clarity_notice_shown": "1",
        }

        with (
            patch("module.webui.app_home.set_env"),
            patch("module.webui.app_home.load_webui_styles"),
            patch("module.webui.app_home.is_oobe_needed", return_value=False),
            patch(
                "module.webui.app_home.get_localstorage_values",
                return_value=mock_localstorage,
            ),
            patch("module.webui.app_home.alas_instance", return_value=["alas"]),
            patch("threading.Thread"),
            patch("module.webui.app_home.register_thread"),
            patch("module.webui.app_home.Switch"),
            self.assertRaises(RouteHalt) as ctx,
        ):
            HomeMixin.run(gui, initial_page="home", localstorage=mock_localstorage)

        self.assertEqual(str(ctx.exception), "ui_alas:alas:Commission")

    def test_home_run_falls_back_when_invalid_url_aside(self):
        def on_ui_alas(aside, initial_menu=None):
            raise RouteHalt(f"ui_alas:{aside}:{initial_menu}")

        gui = SimpleNamespace(
            theme="default",
            is_mobile=False,
            mount_shell=MagicMock(),
            ui_manage=MagicMock(),
            ui_alas=MagicMock(side_effect=on_ui_alas),
            restore_home_menu=MagicMock(),
            show_home=MagicMock(),
            _alas_thread_update_config=MagicMock(),
            state_switch=MagicMock(),
            set_aside_status=MagicMock(),
            task_handler=MagicMock(),
        )

        # 模拟 URL 传入了一个不存在的实例名 "non_existent_instance"
        mock_localstorage = {
            "aside": "alas",
            "menu": "Overview",
            "url_aside": "non_existent_instance",
            "url_menu": "Campaign",
            "clarity_notice_shown": "1",
        }

        with (
            patch("module.webui.app_home.set_env"),
            patch("module.webui.app_home.load_webui_styles"),
            patch("module.webui.app_home.is_oobe_needed", return_value=False),
            patch(
                "module.webui.app_home.get_localstorage_values",
                return_value=mock_localstorage,
            ),
            patch("module.webui.app_home.alas_instance", return_value=["alas"]),
            patch("threading.Thread"),
            patch("module.webui.app_home.register_thread"),
            patch("module.webui.app_home.Switch"),
            self.assertRaises(RouteHalt) as ctx,
        ):
            HomeMixin.run(gui, initial_page="home", localstorage=mock_localstorage)

        # 应平滑回退到 localStorage 中的 alas 实例
        self.assertEqual(str(ctx.exception), "ui_alas:alas:Overview")


if __name__ == "__main__":
    unittest.main()
