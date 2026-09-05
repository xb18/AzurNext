"""推送通知（Push Notification）模块。

通过 onepush 库将任务执行结果推送到外部渠道（QQ、微信、Telegram 等）。
支持 YAML 格式的通知配置和 WebUI 本地推送。

主要函数：
    - handle_notify(): 解析 YAML 配置并通过指定渠道发送推送通知。
    - notify_webui(): 向本地 WebUI 服务发送 HTTP POST 通知。
"""

import os
import sys

import onepush.core
import yaml
from onepush import get_notifier
from onepush.core import Provider
from onepush.exceptions import OnePushException
from onepush.providers.custom import Custom
from requests import Response

from module.logger import logger

onepush.core.log = logger


def handle_notify(_config: str, **kwargs) -> bool:
    """处理推送通知请求。

    解析 YAML 格式的配置，选择通知渠道（如 QQ、微信等），
    并通过 onepush 库发送通知消息。

    Args:
        _config: YAML 格式的通知配置字符串，包含 provider 和渠道参数。
        **kwargs: 附加的通知参数，如 title、content 等。

    Returns:
        通知发送成功返回 True，失败返回 False。
    """
    try:
        config = {}
        for item in yaml.safe_load_all(_config):
            config.update(item)
    except Exception:
        logger.error("加载onepush配置失败，跳过发送")
        return False
    try:
        provider_name: str = config.pop("provider", None)
        if provider_name is None:
            logger.info("未指定推送提供者，跳过发送")
            return False
        notifier: Provider = get_notifier(provider_name)
        required: list[str] = notifier.params["required"]
        config.update(kwargs)

        # 参数预检查
        for key in required:
            if key not in config:
                logger.warning(
                    f"[通知] 推送渠道 {notifier.name} 缺少必需参数 '{key}'"
                )

        if isinstance(notifier, Custom):
            if "method" not in config or config["method"] == "post":
                config["datatype"] = "json"
            if not isinstance(config.get("data"), dict):
                config["data"] = {}
            if "title" in kwargs:
                config["data"]["title"] = kwargs["title"]
            if "content" in kwargs:
                config["data"]["content"] = kwargs["content"]
                if "data" in config and "message" in config["data"] and '${content}' in config["data"]["message"]:
                    config["data"]["message"] = config["data"]["message"].replace("${content}", config["data"]["content"])
                    
        if provider_name.lower() == "gocqhttp":
            access_token = config.get("access_token")
            if access_token:
                config["token"] = access_token

        resp = notifier.notify(**config)
        if isinstance(resp, Response):
            if resp.status_code != 200:
                logger.warning("推送通知失败!")
                logger.warning(f"[通知] HTTP状态码:{resp.status_code}")
                return False
            else:
                if provider_name.lower() == "gocqhttp":
                    return_data: dict = resp.json()
                    if return_data["status"] == "failed":
                        logger.warning("推送通知失败!")
                        logger.warning(
                            f"Return message:{return_data['wording']}")
                        return False
    except OnePushException:
        logger.error("推送通知失败")
        return False
    except Exception as e:
        # 不打印完整异常栈，避免暴露变量信息
        logger.error(e)
        return False

    logger.info("推送通知成功")
    return True


def notify_webui(instance: str, title: str, content: str, **kwargs) -> bool:
    """推送通知到 WebUI 本地端口，供启动器接收。

    向本地 WebUI 服务发送 HTTP POST 请求，传递实例名、标题和内容。
    优先感知环境变量 WEBUI_PORT 中的动态端口，回退使用配置文件端口或默认端口 25548。

    Args:
        instance: 触发通知的实例名称。
        title: 通知标题。
        content: 通知正文内容。
        **kwargs: 其他附加字段，合并到请求体中。

    Returns:
        推送成功返回 True，失败返回 False。
    """
    port = None
    if os.environ.get("WEBUI_PORT"):
        try:
            port = int(os.environ["WEBUI_PORT"])
        except Exception:
            port = None
    if port is None:
        try:
            from module.webui.setting import State
            port = int(State.deploy_config.WebuiPort)
        except Exception:
            port = None
    if port is None:
        try:
            from deploy.utils import get_default_webui_port
            port = get_default_webui_port()
        except Exception:
            port = 25548

    try:
        import requests
        payload = {"instance": instance, "title": title, "content": content}
        payload.update(kwargs)
        requests.post(
            f"http://127.0.0.1:{port}/api/notify",
            json=payload,
            timeout=2,
        )
        return True
    except Exception:
        return False


def notify_cycle_completed(
    title: str = "🌐 全局调度完成",
    content: str = "单轮多配置任务已全部完成，调度器已自动退出。",
    config_list: list[str] | None = None,
    config_name: str = "Alas",
) -> None:
    """全局调度单轮结束时触发统一通知。

    将通知推送到本地 WebUI：
    - 若在桌面启动器外壳中运行（有壳），启动器通过 SSE 接收后由 Rust 原生
      弹出带应用标识的 Windows 系统 Toast 通知（支持点击唤醒窗口）；
    - 若在纯浏览器中运行（无壳），由 WebUI 界面展示前端 UI 通知；
    - Python 端绝不直接调度操作系统级通知 API。
    若配置了 OnePush（微信/钉钉/邮件等），同时触发第三方推送。

    Args:
        title: 通知标题。
        content: 通知正文。
        config_list: 本轮涉及的配置实例列表。
        config_name: 当前正在执行收尾退出的实例名称。
    """
    full_content = content
    if config_list:
        cfg_str = ", ".join(config_list)
        if "已执行配置" not in full_content and "执行配置" not in full_content:
            full_content = f"{content} (已执行配置: {cfg_str})"

    logger.info(f"[全局调度通知] 标题: {title} | 内容: {full_content}")

    # 1. 统一推送到本地 WebUI 服务（有壳走壳通知，无壳走 Web 界面 UI 通知）
    notify_webui(instance=config_name, title=title, content=full_content)

    # 2. 尝试发送 OnePush 第三方推送（如微信、邮件、钉钉、Bark 等）
    try:
        from module.config.config import AzurLaneConfig
        from module.config.utils import get_default_main_instance
        main_name = config_name or get_default_main_instance()
        cfg = AzurLaneConfig(config_name=main_name)
        onepush_config = getattr(cfg, "Error_OnePushConfig", None)
        if onepush_config:
            handle_notify(onepush_config, title=title, content=full_content)
    except Exception:
        pass

