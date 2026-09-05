"""通知模块。"""

def handle_notify(*args, **kwargs):
    """处理推送通知请求。

    延迟导入 onepush 模块，避免在未使用通知功能时加载依赖。
    """
    from module.notify.notify import handle_notify
    return handle_notify(*args, **kwargs)


def notify_webui(*args, **kwargs):
    """推送通知到 WebUI 本地端口。

    延迟导入 notify 模块，将通知转发给 WebUI 启动器接收。
    """
    from module.notify.notify import notify_webui
    return notify_webui(*args, **kwargs)


def notify_cycle_completed(*args, **kwargs):
    """全局调度单轮结束时触发统一通知。"""
    from module.notify.notify import notify_cycle_completed
    return notify_cycle_completed(*args, **kwargs)

