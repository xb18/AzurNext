"""
Web界面部署配置管理。

提供 DeployConfig 的 WebUI 子类，将配置变更实时写入部署文件。
通过 __setattr__ 拦截属性修改，自动同步到磁盘配置。
"""

from deploy.config import DeployConfig as _DeployConfig


class DeployConfig(_DeployConfig):
    def show_config(self):
        pass

    def __setattr__(self, key: str, value):
        """可保存字段通过完整事务更新，落盘失败时恢复属性。"""
        # 始终同步实例属性，确保内存即时可见
        super().__setattr__(key, value)

        # 仅针对大写可保存字段，在非内部同步、非事务活跃状态且值确实发生变化时才持久化
        if (
            key[0].isupper()
            and key in getattr(self, 'config', {})
            and not getattr(self, '_syncing_config', False)
            and not getattr(self, '_config_transaction_active', False)
        ):
            if self.config.get(key) != value:
                self.update_config({key: value})
