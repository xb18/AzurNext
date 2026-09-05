import os
import re
import sys
from pathlib import Path
from typing import Callable, Generic, Optional, TypeVar

from deploy.atomic import atomic_read_text, atomic_write

T = TypeVar("T")

DEPLOY_CONFIG = './config/deploy.yaml'
DEPLOY_TEMPLATE = './deploy/template'

PRODUCTION_WEBUI_PORT: int = 25548
DEVELOPMENT_WEBUI_PORT: int = 25548


def is_production_environment(root_dir: Optional[str] = None) -> bool:
    """判断当前运行环境是否为生产环境。

    判断依据与优先级：
    1. 环境变量显式指定 (AZURPILOT_ENV / ALAS_ENV):
       - 'prod' 或 'production' -> True (生产环境)
       - 'dev' 或 'development' -> False (开发环境)
    2. 启动器环境：
       - 存在 ALAS_LAUNCHER_PID 环境变量 (由 alas-launcher / AzurNext 进程启动) -> True
    3. 运行路径特征：
       - 路径中包含 'alas-launcher' (如 F:\\code\\alas-launcher) 或 'azurnext' -> True
       - 同级或父级目录存在 'alas-launcher.exe' 或 'AzurNext.exe' -> True
    4. 二进制打包环境：
       - sys.frozen 为 True -> True
    5. 开发工作区与安全兜底：
       - 若处于包含 .git 的开发工作区且未命中上述生产特征 -> False (开发环境)
       - 其余未识别环境默认安全回退到生产环境 -> True

    Args:
        root_dir (Optional[str]): 待检测的根目录路径。若为 None 则使用当前工作目录。

    Returns:
        bool: True 表示生产环境，False 表示开发环境。
    """
    env = (
        os.environ.get("AZURNEXT_ENV")
        or os.environ.get("AZURPILOT_ENV")
        or os.environ.get("ALAS_ENV")
    )
    if env:
        env_lower = env.strip().lower()
        if env_lower in ("dev", "development"):
            return False
        if env_lower in ("prod", "production"):
            return True

    if os.environ.get("ALAS_LAUNCHER_PID"):
        return True

    if getattr(sys, "frozen", False):
        return True

    try:
        target_path = Path(root_dir if root_dir else os.getcwd()).resolve()
    except Exception:
        target_path = Path(os.getcwd()).resolve()

    target_str = str(target_path).lower().replace("\\", "/")
    if "alas-launcher" in target_str or "azurnext" in target_str:
        return True

    search_parents = [target_path, *target_path.parents]
    for p in search_parents:
        if (p / "alas-launcher.exe").is_file() or (p / "AzurNext.exe").is_file():
            return True

    for p in search_parents:
        if (p / ".git").exists():
            return False

    return True


def get_default_webui_port(root_dir: Optional[str] = None) -> int:
    """获取当前环境下 WebUI 默认监听端口。

    开发环境与生产环境默认均使用端口 25548。
    """
    return PRODUCTION_WEBUI_PORT


def is_port_available(port: int, host: str = "127.0.0.1") -> bool:
    """检查指定端口在 host 上是否可用。"""
    if port <= 0 or port > 65535:
        return False
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((host, port))
            return True
    except OSError:
        return False


def find_available_port(preferred_port: int = 25548, host: str = "127.0.0.1") -> int:
    """自动使用空闲端口。优先使用 preferred_port，若被占用则自动寻找可用空闲端口。"""
    if is_port_available(preferred_port, host):
        return preferred_port

    import socket
    # 优先在 preferred_port + 1 .. preferred_port + 100 寻找
    for p in range(preferred_port + 1, preferred_port + 101):
        if is_port_available(p, host):
            return p

    # 若邻近端口均被占用，由系统动态分配一个空闲端口
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, 0))
        return s.getsockname()[1]



def get_deploy_template():
    if sys.platform == 'win32':
        return './config/deploy.template.yaml'
    if sys.platform == 'darwin':
        return './config/deploy.template-linux.yaml'
    if sys.platform.startswith('linux'):
        return './config/deploy.template-linux.yaml'
    return DEPLOY_TEMPLATE


class cached_property(Generic[T]):
    """带类型支持的缓存属性描述符。

    属性只在首次访问时计算一次，之后替换为普通属性。
    删除属性后会重新计算。来源：bottlepy/bottle。
    """

    def __init__(self, func: Callable[..., T]):
        self.func = func

    def __get__(self, obj, cls) -> T:
        if obj is None:
            return self

        value = obj.__dict__[self.func.__name__] = self.func(obj)
        return value


def iter_folder(folder, is_dir=False, ext=None):
    """遍历目录下的文件或子目录。

    Args:
        folder (str): 目录路径。
        is_dir (bool): True 时只遍历子目录。
        ext (str): 文件扩展名过滤，如 '.yaml'。

    Yields:
        str: 文件或目录的绝对路径。
    """
    for file in os.listdir(folder):
        sub = os.path.join(folder, file)
        if is_dir:
            if os.path.isdir(sub):
                yield sub.replace('\\\\', '/').replace('\\', '/')
        elif ext is not None:
            if not os.path.isdir(sub):
                _, extension = os.path.splitext(file)
                if extension == ext:
                    yield os.path.join(folder, file).replace('\\\\', '/').replace('\\', '/')
        else:
            yield os.path.join(folder, file).replace('\\\\', '/').replace('\\', '/')


def poor_yaml_read(file):
    """简易 YAML 读取，不依赖 pyyaml，使用正则解析。

    仅支持简单的 key: value 格式，不支持嵌套结构。

    Args:
        file (str): YAML 文件路径。

    Returns:
        dict: 解析后的键值对。
    """
    content = atomic_read_text(file)
    data = {}
    regex = re.compile(r'^(.*?):(.*?)$')
    for line in content.splitlines():
        line = line.strip('\n\r\t ').replace('\\', '/')
        if line.startswith('#'):
            continue
        result = re.match(regex, line)
        if result:
            k, v = result.group(1), result.group(2).strip('\n\r\t\' ')
            if v:
                if v.lower() == 'null':
                    v = None
                elif v.lower() == 'false':
                    v = False
                elif v.lower() == 'true':
                    v = True
                elif v.isdigit():
                    v = int(v)
                data[k] = v

    return data


def poor_yaml_write(data, file, template_file=DEPLOY_TEMPLATE):
    """简易 YAML 写入，基于模板文件替换键值。

    Args:
        data (dict): 要写入的键值对。
        file (str): 输出文件路径。
        template_file (str): 模板文件路径。
    """
    text = atomic_read_text(template_file)
    text = text.replace('\\', '/')

    for key, value in data.items():
        if value is None:
            value = 'null'
        elif value is True:
            value = "true"
        elif value is False:
            value = "false"
        text = re.sub(f'{key}:.*?\n', f'{key}: {value}\n', text)

    atomic_write(file, text)
