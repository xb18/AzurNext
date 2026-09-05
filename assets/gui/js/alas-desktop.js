/**
 * AzurPilot 桌面客户端（Tauri）专用交互脚本
 * 负责窗口拖拽、操作按钮（更新、托盘、最小化、最大化、关闭）与退出确认弹窗
 * 仅在 Tauri 客户端环境下自适应激活，普通浏览器环境下自动静默
 */
(function () {
    const getTauriInvoke = () => {
        if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
            return window.__TAURI__.core.invoke;
        }
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
            return window.__TAURI_INTERNALS__.invoke;
        }
        return null;
    };

    const invoke = getTauriInvoke();
    if (!invoke) {
        // 非 Tauri 桌面客户端环境（普通浏览器/移动端），直接退出
        return;
    }

    // 标记当前环境为桌面客户端
    document.body.classList.add('is-tauri-client');
    window.alasDesktopMounted = true;

    // 清理壳端注入的旧标题栏 DOM、旧样式与旧弹窗，防止两套图标冲突
    const cleanupLegacyLauncherElements = () => {
        ['#alas-launcher-titlebar', '#alas-launcher-titlebar-style', '#alas-close-menu'].forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });
        if (document.body && document.body.dataset && document.body.dataset.alasCustomTitlebar) {
            delete document.body.dataset.alasCustomTitlebar;
        }
    };
    cleanupLegacyLauncherElements();

    // 桌面客户端环境下禁用默认右键菜单与 Ctrl+P 快捷键
    window.addEventListener('contextmenu', e => e.preventDefault(), { capture: true });
    window.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
        }
    }, { capture: true });

    // 重写 saveAs 函数，将文件导出路由至客户端原生文件保存对话框
    window.saveAs = function (blob, filename) {
        const reader = new FileReader();
        reader.onload = async () => {
            const data = reader.result.split(',')[1];
            try {
                await invoke('save_as', { filename, data });
            } catch (err) {
                console.error('Failed to invoke save_as', err);
            }
        };
        reader.readAsDataURL(blob);
    };

    // 桌面原生风格轻量 UI Toast 组件
    let toastContainer = null;
    const ensureToastContainer = () => {
        if (!toastContainer || !document.contains(toastContainer)) {
            toastContainer = document.getElementById('alas-desktop-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'alas-desktop-toast-container';
                document.body.appendChild(toastContainer);
            }
        }
        return toastContainer;
    };

    const showToast = (message, type = 'info', duration = 3500) => {
        const container = ensureToastContainer();
        const toast = document.createElement('div');
        toast.className = `alas-desktop-toast alas-desktop-toast-${type}`;

        let iconSvg = '';
        if (type === 'loading') {
            iconSvg = '<svg class="alas-desktop-toast-spin" viewBox="0 0 16 16" width="14" height="14"><path d="M8 2a6 6 0 1 0 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        } else if (type === 'success') {
            iconSvg = '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><polyline points="5,8.5 7.2,10.7 11.5,5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        } else if (type === 'error') {
            iconSvg = '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
        } else {
            iconSvg = '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="7" x2="8" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="4.5" r="0.75" fill="currentColor"/></svg>';
        }

        toast.innerHTML = `
            <span class="alas-desktop-toast-icon">${iconSvg}</span>
            <span class="alas-desktop-toast-msg"></span>
        `;
        toast.querySelector('.alas-desktop-toast-msg').textContent = message;

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        let timer = null;
        const hide = () => {
            if (timer) clearTimeout(timer);
            toast.classList.remove('is-visible');
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 250);
        };

        toast.addEventListener('click', hide);
        if (duration > 0) {
            timer = setTimeout(hide, duration);
        }

        return {
            update: (newMsg, newType, newDuration = 3500) => {
                if (timer) clearTimeout(timer);
                toast.querySelector('.alas-desktop-toast-msg').textContent = newMsg;
                if (newType) {
                    toast.className = `alas-desktop-toast alas-desktop-toast-${newType} is-visible`;
                    let newIconSvg = '';
                    if (newType === 'loading') {
                        newIconSvg = '<svg class="alas-desktop-toast-spin" viewBox="0 0 16 16" width="14" height="14"><path d="M8 2a6 6 0 1 0 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
                    } else if (newType === 'success') {
                        newIconSvg = '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><polyline points="5,8.5 7.2,10.7 11.5,5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    } else if (newType === 'error') {
                        newIconSvg = '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
                    } else {
                        newIconSvg = '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="7" x2="8" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="4.5" r="0.75" fill="currentColor"/></svg>';
                    }
                    toast.querySelector('.alas-desktop-toast-icon').innerHTML = newIconSvg;
                }
                if (newDuration > 0) {
                    timer = setTimeout(hide, newDuration);
                }
            },
            close: hide,
        };
    };

    // 挂载全局 alasDesktop 客户端能力对象，方便 Web 前端任意模块直接调用
    window.alasDesktop = {
        isAvailable: true,
        // 窗口操作
        minimize: () => invoke('window_minimize'),
        toggleMaximize: () => invoke('window_toggle_maximize'),
        isMaximized: () => invoke('window_is_maximized'),
        minimizeToTray: () => invoke('window_hide'),
        close: () => invoke('window_close'),
        exit: () => invoke('window_exit_application'),
        startDragging: () => invoke('window_start_dragging'),
        // 软件更新
        triggerUpdate: () => invoke('trigger_update'),
        checkUpdate: () => invoke('check_launcher_update').catch(() => invoke('trigger_update')),
        downloadUpdate: () => invoke('start_download_launcher_update').catch(() => invoke('trigger_update')),
        cancelUpdate: () => invoke('cancel_or_dismiss_update').catch(() => {}),
        getUpdateStatus: () => invoke('get_update_status'),
        getUpdateMethod: () => invoke('get_update_method'),
        setUpdateMethod: (method) => invoke('set_update_method', { method }),
        // 关闭行为偏好 ("ask" / "minimize" / "exit")
        getCloseAction: () => invoke('get_close_action'),
        setCloseAction: (action) => invoke('set_close_action', { action }),
        // 日志与文件保存
        downloadGuiLog: () => invoke('download_today_gui_log'),
        downloadLauncherLog: () => invoke('download_today_launcher_log'),
        saveAs: (filename, data) => invoke('save_as', { filename, data }),
        // 常用桌面能力暴露
        // 原生系统通知（Windows Toast / 系统通知）
        showNotification: (title, content) => invoke('show_notification', { title, content }),
        // 界面轻量 Toast 提示
        toast: (message, type, duration) => showToast(message, type, duration),
        // 唤醒并聚焦主窗口
        focus: () => invoke('focus_window'),
        // 系统浏览器打开外部链接
        openExternal: (url) => invoke('open_external', { url }),
        // 系统资源管理器定位目录/文件
        openFolder: (path) => invoke('open_folder', { path }),
        // 获取启动器版本和系统平台信息
        getInfo: () => invoke('get_launcher_info'),
        // 退出提示框
        openClosePrompt: () => setCloseMenuOpen(true),
    };

    const I18N = {
        'zh-CN': {
            hideLabel: '最小化到托盘',
            minimizeLabel: '最小化窗口',
            minimizeTitle: '最小化',
            maximizeLabel: '最大化/还原窗口',
            maximizeTitle: '最大化',
            closeLabel: '关闭窗口',
            closeTitle: '关闭',
            restoreTitle: '还原',
            maximizeActionTitle: '最大化',
            restoreLabel: '还原窗口',
            maximizeLabelText: '最大化窗口',
            closePrompt: '确认要离开吗？您可以选择退出，或者让它在后台默默运行',
            exitAction: '退出',
            minimizeToTrayAction: '最小化到托盘',
            rememberChoice: '记住我的选择，下次不再询问',
            checkUpdateLabel: '检查启动器更新',
            updatingLabel: '正在更新启动器...',
            checkingLabel: '正在检查启动器更新...',
            restartToApply: '重启生效',
            alreadyLatestLabel: '启动器已是最新版本',
            updateFailedLabel: '检查更新失败',
            updateReadyLabel: '启动器更新已就绪，重启生效',
            clientUpdateReadyLabel: '启动器更新已就绪',
            updateAvailableBadge: '发现新版',
            confirmDownloadPrompt: '发现启动器新版本{version}，是否立即下载更新？',
            confirmRestartPrompt: '启动器更新已下载完毕，是否立即重启启动器以完成更新？',
            confirmRestartPromptWithVer: '启动器更新{version}已下载就绪，是否立即重启启动器以完成更新？',
            clientVersionLabel: '启动器',
            copiedLabel: '已复制!',
            copyHint: '点击复制版本号',
            toastChecking: '正在检查启动器更新...',
            toastUpdating: '正在下载启动器更新...',
            toastAvailable: '发现启动器新版本{version}，请点击确认下载。',
            toastAlreadyLatest: '启动器当前已是最新版本。',
            toastUpdateReady: '启动器更新已就绪，重启应用后生效。',
            toastUpdateFailed: '检查启动器更新失败：',
        },
        'zh-TW': {
            hideLabel: '最小化至系統匣',
            minimizeLabel: '最小化視窗',
            minimizeTitle: '最小化',
            maximizeLabel: '最大化/還原視窗',
            maximizeTitle: '最大化',
            closeLabel: '關閉視窗',
            closeTitle: '關閉',
            restoreTitle: '還原',
            maximizeActionTitle: '最大化',
            restoreLabel: '還原視窗',
            maximizeLabelText: '最大化視窗',
            closePrompt: '確認要離開嗎？您可以選擇結束，或者讓它在背景默默執行',
            exitAction: '結束',
            minimizeToTrayAction: '最小化至系統匣',
            rememberChoice: '記住我的選擇，下次不再詢問',
            checkUpdateLabel: '檢查啟動器更新',
            updatingLabel: '正在更新啟動器...',
            checkingLabel: '正在檢查啟動器更新...',
            restartToApply: '重新啟動生效',
            alreadyLatestLabel: '啟動器已是最新版本',
            updateFailedLabel: '檢查更新失敗',
            updateReadyLabel: '啟動器更新已就緒，重新啟動生效',
            clientUpdateReadyLabel: '啟動器更新已就緒',
            updateAvailableBadge: '發現新版',
            confirmDownloadPrompt: '發現啟動器新版本{version}，是否立即下載更新？',
            confirmRestartPrompt: '啟動器更新已下載完畢，是否立即重新啟動啟動器以完成更新？',
            confirmRestartPromptWithVer: '啟動器更新{version}已下載就緒，是否立即重新啟動啟動器以完成更新？',
            clientVersionLabel: '啟動器',
            copiedLabel: '已複製!',
            copyHint: '點擊複製版本號',
            toastChecking: '正在檢查啟動器更新...',
            toastUpdating: '正在下載啟動器更新...',
            toastAvailable: '發現啟動器新版本{version}，請點擊確認下載。',
            toastAlreadyLatest: '啟動器目前已經是最新版本。',
            toastUpdateReady: '啟動器更新已就緒，重新啟動應用程式後生效。',
            toastUpdateFailed: '檢查啟動器更新失敗：',
        },
        'ja': {
            hideLabel: 'トレイに最小化',
            minimizeLabel: 'ウィンドウを最小化',
            minimizeTitle: '最小化',
            maximizeLabel: 'ウィンドウの最大化/元に戻す',
            maximizeTitle: '最大化',
            closeLabel: 'ウィンドウを閉じる',
            closeTitle: '閉じる',
            restoreTitle: '元に戻す',
            maximizeActionTitle: '最大化',
            restoreLabel: 'ウィンドウを元に戻す',
            maximizeLabelText: 'ウィンドウを最大化',
            closePrompt: '終了しますか？完全に終了するか、バックグラウンドで実行を継続するかを選択できます',
            exitAction: '終了',
            minimizeToTrayAction: 'トレイに最小化',
            rememberChoice: '選択を記憶し、次回から確認しない',
            checkUpdateLabel: 'ランチャー更新を確認',
            updatingLabel: 'ランチャー更新中...',
            checkingLabel: 'ランチャー更新を確認中...',
            restartToApply: '再起動で適用',
            alreadyLatestLabel: 'ランチャーは最新バージョンです',
            updateFailedLabel: '更新確認失敗',
            updateReadyLabel: 'ランチャー更新準備完了、再起動で適用',
            clientUpdateReadyLabel: 'ランチャー更新準備完了',
            updateAvailableBadge: '新版あり',
            confirmDownloadPrompt: 'ランチャーの新バージョン{version}が見つかりました。今すぐダウンロードしますか？',
            confirmRestartPrompt: 'ランチャーのアップデートが完了しました。今すぐ再起動して適用しますか？',
            confirmRestartPromptWithVer: 'ランチャーの更新{version}がダウンロードされました。今すぐ再起動して適用しますか？',
            clientVersionLabel: 'ランチャー',
            copiedLabel: 'コピー完了!',
            copyHint: 'クリックしてバージョンをコピー',
            toastChecking: 'ランチャーの更新を確認中...',
            toastUpdating: 'ランチャーの更新をダウンロード中...',
            toastAvailable: 'ランチャーの新バージョン{version}が利用可能です。',
            toastAlreadyLatest: 'ランチャーはすでに最新バージョンです。',
            toastUpdateReady: 'ランチャーの更新が準備できました。再起動後に適用されます。',
            toastUpdateFailed: 'ランチャーの更新確認に失敗しました：',
        },
        'en': {
            hideLabel: 'Minimize to tray',
            minimizeLabel: 'Minimize window',
            minimizeTitle: 'Minimize',
            maximizeLabel: 'Maximize/Restore window',
            maximizeTitle: 'Maximize',
            closeLabel: 'Close window',
            closeTitle: 'Close',
            restoreTitle: 'Restore',
            maximizeActionTitle: 'Maximize',
            restoreLabel: 'Restore window',
            maximizeLabelText: 'Maximize window',
            closePrompt: 'Are you sure you want to leave? You can exit or keep it running in the background.',
            exitAction: 'Exit',
            minimizeToTrayAction: 'Minimize to tray',
            rememberChoice: 'Remember my choice, do not ask again',
            checkUpdateLabel: 'Check launcher update',
            updatingLabel: 'Updating launcher...',
            checkingLabel: 'Checking launcher update...',
            restartToApply: 'Restart to apply',
            alreadyLatestLabel: 'Launcher is up to date',
            updateFailedLabel: 'Update check failed',
            updateReadyLabel: 'Launcher update ready, restart to apply',
            clientUpdateReadyLabel: 'Launcher update ready',
            updateAvailableBadge: 'Update Available',
            confirmDownloadPrompt: 'Launcher update{version} is available. Download now?',
            confirmRestartPrompt: 'Launcher update downloaded. Restart the launcher now to apply?',
            confirmRestartPromptWithVer: 'Launcher update{version} downloaded. Restart the launcher now to apply?',
            clientVersionLabel: 'Launcher',
            copiedLabel: 'Copied!',
            copyHint: 'Click to copy version',
            toastChecking: 'Checking for launcher updates...',
            toastUpdating: 'Downloading launcher update...',
            toastAvailable: 'Launcher update{version} is available for download.',
            toastAlreadyLatest: 'Launcher is already up to date.',
            toastUpdateReady: 'Launcher update is ready. Restart to apply.',
            toastUpdateFailed: 'Check launcher update failed: ',
        }
    };

    const getLang = () => {
        const lang = (document.documentElement.lang || navigator.language || 'zh-CN').toLowerCase();
        if (lang.includes('tw') || lang.includes('hk')) return 'zh-TW';
        if (lang.includes('ja')) return 'ja';
        if (lang.includes('en')) return 'en';
        return 'zh-CN';
    };

    const i18n = I18N[getLang()] || I18N['zh-CN'];

    let closeMenu = null;
    const ensureCloseMenu = () => {
        if (closeMenu || document.getElementById('alas-desktop-close-menu')) {
            closeMenu = closeMenu || document.getElementById('alas-desktop-close-menu');
            return;
        }
        closeMenu = document.createElement('div');
        closeMenu.id = 'alas-desktop-close-menu';
        closeMenu.setAttribute('role', 'dialog');
        closeMenu.setAttribute('aria-modal', 'false');
        closeMenu.innerHTML = `
            <p id="alas-desktop-close-title"></p>
            <div id="alas-desktop-close-actions">
                <button type="button" data-close-action="minimize"></button>
                <button type="button" class="alas-desktop-close-confirm" data-close-action="exit"></button>
            </div>
            <label id="alas-desktop-close-remember">
                <input type="checkbox" id="alas-desktop-close-remember-check" checked>
                <i class="alas-desktop-checkbox-box" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="9" height="9"><path d="M2.5 6.5L4.8 8.8L9.5 3.5"/></svg>
                </i>
                <span class="alas-desktop-close-remember-text"></span>
            </label>
        `;
        closeMenu.querySelector('#alas-desktop-close-title').textContent = i18n.closePrompt;
        closeMenu.querySelector('[data-close-action="minimize"]').textContent = i18n.minimizeToTrayAction;
        closeMenu.querySelector('[data-close-action="exit"]').textContent = i18n.exitAction;
        closeMenu.querySelector('.alas-desktop-close-remember-text').textContent = i18n.rememberChoice;

        closeMenu.addEventListener('pointerdown', e => e.stopPropagation());

        // 最小化到托盘
        closeMenu.querySelector('[data-close-action="minimize"]').addEventListener('click', async () => {
            const remember = closeMenu.querySelector('#alas-desktop-close-remember-check')?.checked;
            setCloseMenuOpen(false);
            if (remember) {
                try { await invoke('set_close_action', { action: 'minimize' }); }
                catch (e) { console.error('Failed to set close action', e); }
            }
            try { await invoke('window_hide'); }
            catch (error) { console.error('Failed to minimize window to tray', error); }
        });

        // 完全退出
        closeMenu.querySelector('[data-close-action="exit"]').addEventListener('click', async () => {
            const remember = closeMenu.querySelector('#alas-desktop-close-remember-check')?.checked;
            if (remember) {
                try { await invoke('set_close_action', { action: 'exit' }); }
                catch (e) { console.error('Failed to set close action', e); }
            }
            closeMenu.querySelectorAll('button').forEach(b => { b.disabled = true; });
            try { await invoke('window_exit_application'); }
            catch (error) {
                closeMenu.querySelectorAll('button').forEach(b => { b.disabled = false; });
                console.error('Failed to exit application', error);
            }
        });

        document.body.appendChild(closeMenu);
    };

    const setCloseMenuOpen = open => {
        if (!closeMenu) ensureCloseMenu();
        closeMenu.classList.toggle('is-open', open);
        if (open) {
            closeMenu.querySelector('[data-close-action="minimize"]')?.focus({ preventScroll: true });
        }
    };

    document.addEventListener('pointerdown', event => {
        if (closeMenu && closeMenu.classList.contains('is-open') && !closeMenu.contains(event.target)) {
            setCloseMenuOpen(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && closeMenu && closeMenu.classList.contains('is-open')) {
            setCloseMenuOpen(false);
        }
    });

    const syncMaximizeState = async button => {
        if (!button) return;
        try {
            const maximized = await invoke('window_is_maximized');
            button.dataset.maximized = maximized ? 'true' : 'false';
            button.title = maximized ? i18n.restoreTitle : i18n.maximizeActionTitle;
            button.setAttribute('aria-label', maximized ? i18n.restoreLabel : i18n.maximizeLabelText);
            const svgMax = button.querySelector('.svg-maximize');
            const svgRes = button.querySelector('.svg-restore');
            if (svgMax) svgMax.style.display = maximized ? 'none' : '';
            if (svgRes) svgRes.style.display = maximized ? '' : 'none';
        } catch (e) {
            console.error('Failed to sync maximize state', e);
        }
    };

    let launcherInfoCache = null;
    const getLauncherInfo = async () => {
        if (launcherInfoCache) return launcherInfoCache;
        try {
            launcherInfoCache = await invoke('get_launcher_info');
            if (launcherInfoCache && window.alasDesktop) {
                window.alasDesktop.version = launcherInfoCache.version;
                window.alasDesktop.platform = launcherInfoCache.platform;
            }
            return launcherInfoCache;
        } catch (e) {
            console.warn('Failed to get launcher info', e);
            return null;
        }
    };

    const updateLogWatermark = () => {
        if (!launcherInfoCache || !launcherInfoCache.version) return;
        const logContainer = document.getElementById('pywebio-scope-log-container');
        if (logContainer) {
            const currentStyle = logContainer.getAttribute('style') || '';
            if (currentStyle.includes('--version:') && !currentStyle.includes('Client v')) {
                const newStyle = currentStyle.replace(
                    /--version:\s*'([^']*)';/,
                    `--version: '$1 · Client v${launcherInfoCache.version}';`
                );
                logContainer.setAttribute('style', newStyle);
            }
        }
    };

    const initHeaderControls = header => {
        if (!header || header.querySelector('.alas-desktop-controls')) {
            return;
        }

        // 设置 Tauri 窗口原生拖拽区域
        header.setAttribute('data-tauri-drag-region', 'true');

        const controls = document.createElement('div');
        controls.className = 'alas-desktop-controls';
        controls.setAttribute('data-tauri-drag-region', 'false');

        // 彻底阻断控制栏区域内的点击与指针事件向 header 拖拽区域冒泡，防止点击被 Windows/Tauri 拖拽捕获
        ['pointerdown', 'mousedown', 'touchstart', 'dblclick'].forEach(evt => {
            controls.addEventListener(evt, e => e.stopPropagation());
        });

        controls.innerHTML = `
            <span class="alas-desktop-version-badge" data-tauri-drag-region="false" style="display:none;" title=""></span>
            <span class="alas-desktop-update-badge" data-tauri-drag-region="false" style="display:none;" title=""></span>
            <button type="button" class="alas-desktop-btn alas-desktop-btn-update" data-tauri-drag-region="false" data-action="update" aria-label="${i18n.checkUpdateLabel}" title="${i18n.checkUpdateLabel}">
                <svg viewBox="0 0 16 16" data-tauri-drag-region="false"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
            </button>
            <button type="button" class="alas-desktop-btn alas-desktop-btn-hide" data-tauri-drag-region="false" data-action="hide" aria-label="${i18n.hideLabel}" title="${i18n.hideLabel}">
                <svg viewBox="0 0 6 6" data-tauri-drag-region="false"><rect x="1" y="1" width="4" height="4" rx="1"/><path d="M2 3h2"/></svg>
            </button>
            <button type="button" class="alas-desktop-btn alas-desktop-btn-minimize" data-tauri-drag-region="false" data-action="minimize" aria-label="${i18n.minimizeLabel}" title="${i18n.minimizeTitle}">
                <svg viewBox="0 0 6 6" data-tauri-drag-region="false"><line x1="1" y1="3" x2="5" y2="3"/></svg>
            </button>
            <button type="button" class="alas-desktop-btn alas-desktop-btn-maximize" data-tauri-drag-region="false" data-action="maximize" aria-label="${i18n.maximizeLabel}" title="${i18n.maximizeTitle}">
                <svg viewBox="0 0 6 6" class="svg-restore" data-tauri-drag-region="false" style="display:none"><polyline points="1,3 1,1 3,1"/><polyline points="3,5 5,5 5,3"/></svg>
                <svg viewBox="0 0 6 6" class="svg-maximize" data-tauri-drag-region="false"><polyline points="1,2.5 1,1 2.5,1"/><polyline points="3.5,5 5,5 5,3.5"/></svg>
            </button>
            <button type="button" class="alas-desktop-btn alas-desktop-btn-close" data-tauri-drag-region="false" data-action="close" aria-label="${i18n.closeLabel}" title="${i18n.closeTitle}">
                <svg viewBox="0 0 6 6" data-tauri-drag-region="false"><line x1="1" y1="1" x2="5" y2="5"/><line x1="5" y1="1" x2="1" y2="5"/></svg>
            </button>
        `;

        const maxBtn = controls.querySelector('[data-action="maximize"]');
        syncMaximizeState(maxBtn);

        // 客户端版本展示与点击复制
        const versionBadge = controls.querySelector('.alas-desktop-version-badge');
        const applyVersion = (info) => {
            if (!info || !info.version) return;
            versionBadge.textContent = 'v' + info.version;
            const platformText = info.platform ? ` (${info.platform})` : '';
            versionBadge.title = `${i18n.clientVersionLabel || '客户端'} v${info.version}${platformText} · ${i18n.copyHint || '点击复制'}`;
            versionBadge.style.display = 'inline-flex';
        };

        if (launcherInfoCache) {
            applyVersion(launcherInfoCache);
        } else {
            getLauncherInfo().then(info => {
                applyVersion(info);
                updateLogWatermark();
            });
        }

        versionBadge.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!launcherInfoCache || !launcherInfoCache.version) return;
            const textToCopy = `v${launcherInfoCache.version}`;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    const input = document.createElement('input');
                    input.value = textToCopy;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    input.remove();
                }
                const originalText = versionBadge.textContent;
                versionBadge.textContent = i18n.copiedLabel || '已复制!';
                setTimeout(() => {
                    versionBadge.textContent = originalText;
                }, 1200);
            } catch (err) {
                console.warn('Failed to copy version', err);
            }
        });

        // 更新状态控制器
        const badge = controls.querySelector('.alas-desktop-update-badge');
        const updateBtn = controls.querySelector('.alas-desktop-btn-update');
        let pollTimer = null;
        let fadeTimer = null;
        let isTriggeringUpdate = false;
        let triggerTime = 0;
        let activeToast = null;

        const applyStatus = (status, isEvent = false) => {
            if (!status) return;
            const s = (typeof status === 'string') ? status : (status && status.status);
            if (!s) return;

            if (fadeTimer) {
                clearTimeout(fadeTimer);
                fadeTimer = null;
            }

            if (s === 'Checking') {
                updateBtn.classList.add('is-spinning');
                updateBtn.classList.remove('is-ready');
                updateBtn.classList.remove('is-available');
                updateBtn.title = i18n.checkingLabel;
                badge.style.display = 'inline-flex';
                badge.className = 'alas-desktop-update-badge is-updating';
                badge.textContent = i18n.checkingLabel;
                badge.title = i18n.checkingLabel;
                badge.style.background = '';
                if (activeToast) {
                    activeToast.update(i18n.toastChecking, 'loading', 0);
                }
            } else if (s === 'Available') {
                updateBtn.classList.remove('is-spinning');
                updateBtn.classList.remove('is-ready');
                updateBtn.classList.add('is-available');
                const version = (status && status.version) ? status.version : '';
                const verText = version ? ` v${version}` : '';
                const badgeText = `${i18n.updateAvailableBadge || '发现新版'}${verText}`;
                const promptMsg = (i18n.confirmDownloadPrompt || '发现启动器新版本{version}，是否立即下载更新？').replace('{version}', verText);
                updateBtn.title = promptMsg;
                badge.style.display = 'inline-flex';
                badge.className = 'alas-desktop-update-badge is-available';
                badge.textContent = `★ ${badgeText}`;
                badge.title = promptMsg;
                badge.style.background = '';

                if (activeToast) {
                    const toastText = (i18n.toastAvailable || '发现启动器新版本{version}').replace('{version}', verText);
                    activeToast.update(toastText, 'info', 6000);
                    activeToast = null;
                }

                if (Date.now() - triggerTime < 10000) {
                    setTimeout(() => {
                        if (badge.classList.contains('is-available')) {
                            if (confirm(promptMsg)) {
                                if (activeToast) activeToast.close();
                                activeToast = showToast(i18n.toastUpdating, 'loading', 0);
                                applyStatus({ status: 'Updating', progress: 8 });
                                startPolling();
                                invoke('start_download_launcher_update').catch(() => invoke('trigger_update')).catch(e => {
                                    console.error('Failed to start launcher update download', e);
                                    applyStatus({ status: 'Failed', detail: e ? e.toString() : '' });
                                });
                            }
                        }
                    }, 150);
                }
            } else if (s === 'Updating') {
                updateBtn.classList.add('is-spinning');
                updateBtn.classList.remove('is-ready');
                updateBtn.classList.remove('is-available');
                const progress = (typeof status.progress === 'number') ? status.progress : 0;
                const title = status.title || i18n.updatingLabel;
                const detail = status.detail || '';
                badge.style.display = 'inline-flex';
                badge.className = 'alas-desktop-update-badge is-updating';
                badge.textContent = progress > 0 ? `${progress}%` : i18n.updatingLabel;
                if (progress > 0) {
                    badge.style.background = `linear-gradient(to right, rgba(59, 130, 246, .45) ${progress}%, rgba(59, 130, 246, .15) ${progress}%)`;
                } else {
                    badge.style.background = '';
                }
                const fullDesc = `[${title} ${progress}%] ${detail}`.trim();
                badge.title = fullDesc;
                updateBtn.title = fullDesc;

                const toastMsg = progress > 0 ? `${i18n.toastUpdating} (${progress}%)` : (title || i18n.toastUpdating);
                if (activeToast) {
                    activeToast.update(toastMsg, 'loading', 0);
                }
            } else if (s === 'ReadyToRestart') {
                updateBtn.classList.remove('is-spinning');
                updateBtn.classList.add('is-ready');
                updateBtn.classList.remove('is-available');
                const version = (status && status.version) ? status.version : '';
                const verText = version ? ` v${version}` : '';
                const desc = `${i18n.clientUpdateReadyLabel || i18n.updateReadyLabel}${verText}`;
                updateBtn.title = `${desc} · ${i18n.restartToApply}`;
                badge.style.display = 'inline-flex';
                badge.className = 'alas-desktop-update-badge is-ready';
                badge.textContent = `✔ ${i18n.restartToApply}${verText}`;
                badge.title = `${desc} · ${i18n.restartToApply}`;
                badge.style.background = '';

                if (activeToast) {
                    activeToast.update(i18n.toastUpdateReady, 'success', 6000);
                    activeToast = null;
                }
            } else if (s === 'AlreadyLatest') {
                updateBtn.classList.remove('is-spinning');
                updateBtn.classList.remove('is-ready');
                updateBtn.classList.remove('is-available');
                updateBtn.title = i18n.alreadyLatestLabel;
                badge.style.display = 'inline-flex';
                badge.className = 'alas-desktop-update-badge is-latest';
                badge.textContent = `✔ ${i18n.alreadyLatestLabel}`;
                badge.title = i18n.alreadyLatestLabel;
                badge.style.background = '';

                if (activeToast) {
                    activeToast.update(i18n.toastAlreadyLatest, 'success', 3500);
                    activeToast = null;
                }

                fadeTimer = setTimeout(() => {
                    badge.style.display = 'none';
                    updateBtn.title = i18n.checkUpdateLabel;
                }, 3500);
            } else if (s === 'Failed') {
                updateBtn.classList.remove('is-spinning');
                updateBtn.classList.remove('is-ready');
                updateBtn.classList.remove('is-available');
                const detail = status.detail || '';
                const fullDesc = `${i18n.updateFailedLabel}: ${detail}`.trim();
                updateBtn.title = fullDesc;
                badge.style.display = 'inline-flex';
                badge.className = 'alas-desktop-update-badge is-failed';
                badge.textContent = `✖ ${i18n.updateFailedLabel}`;
                badge.title = fullDesc;
                badge.style.background = '';

                if (activeToast) {
                    activeToast.update((i18n.toastUpdateFailed || '') + (detail ? detail : ''), 'error', 5000);
                    activeToast = null;
                }

                fadeTimer = setTimeout(() => {
                    badge.style.display = 'none';
                    updateBtn.title = i18n.checkUpdateLabel;
                }, 5000);
            } else {
                // Idle
                if (Date.now() - triggerTime < 4000) {
                    return;
                }
                updateBtn.classList.remove('is-spinning');
                updateBtn.classList.remove('is-ready');
                updateBtn.classList.remove('is-available');
                updateBtn.title = i18n.checkUpdateLabel;
                badge.style.display = 'none';
                badge.style.background = '';
                if (activeToast) {
                    activeToast.close();
                    activeToast = null;
                }
            }
        };

        const stopPolling = () => {
            if (pollTimer) {
                clearInterval(pollTimer);
                pollTimer = null;
            }
        };

        const pollStatus = async () => {
            try {
                const status = await invoke('get_update_status');
                applyStatus(status);
                const s = (typeof status === 'string') ? status : (status && status.status);
                if (Date.now() - triggerTime < 4000) {
                    return;
                }
                if (s !== 'Checking' && s !== 'Updating') {
                    stopPolling();
                }
            } catch (e) {
                console.error('Failed to poll update status', e);
                if (Date.now() - triggerTime >= 4000) {
                    stopPolling();
                }
            }
        };

        const startPolling = () => {
            stopPolling();
            pollTimer = setInterval(pollStatus, 600);
            setTimeout(stopPolling, 300000);
        };

        // 尝试监听 Tauri 事件（若可用则实现 0 延时实时同步）
        try {
            if (window.__TAURI__ && window.__TAURI__.event && typeof window.__TAURI__.event.listen === 'function') {
                window.__TAURI__.event.listen('update-status-changed', event => {
                    if (event && event.payload) {
                        applyStatus(event.payload, true);
                        const s = (typeof event.payload === 'string') ? event.payload : (event.payload && event.payload.status);
                        if (s !== 'Checking' && s !== 'Updating' && Date.now() - triggerTime >= 4000) {
                            stopPolling();
                        }
                    }
                });
            }
        } catch (err) {
            console.warn('Tauri event listen not available', err);
        }

        badge.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (badge.classList.contains('is-ready')) {
                try {
                    const currentStatus = await invoke('get_update_status');
                    const version = (currentStatus && currentStatus.version) ? ` v${currentStatus.version}` : '';
                    const prompt = (i18n.confirmRestartPromptWithVer || i18n.confirmRestartPrompt).replace('{version}', version);
                    if (confirm(prompt)) {
                        await invoke('window_exit_application');
                    }
                } catch (err) {
                    console.error('Failed to restart application', err);
                }
                return;
            }

            if (badge.classList.contains('is-available')) {
                try {
                    const currentStatus = await invoke('get_update_status');
                    const version = (currentStatus && currentStatus.version) ? ` v${currentStatus.version}` : '';
                    const prompt = (i18n.confirmDownloadPrompt || '发现启动器新版本{version}，是否立即下载更新？').replace('{version}', version);
                    if (confirm(prompt)) {
                        if (activeToast) activeToast.close();
                        activeToast = showToast(i18n.toastUpdating, 'loading', 0);
                        applyStatus({ status: 'Updating', progress: 8 });
                        startPolling();
                        await invoke('start_download_launcher_update').catch(() => invoke('trigger_update'));
                    }
                } catch (err) {
                    console.error('Failed to start launcher update download', err);
                }
                return;
            }
        });

        // 双击标题栏空白处最大化/还原
        header.addEventListener('dblclick', async event => {
            if (event.target.closest('button') || event.target.closest('a') || event.target.closest('input')) {
                return;
            }
            try {
                await invoke('window_toggle_maximize');
                await syncMaximizeState(maxBtn);
            } catch (e) {
                console.error('Failed to toggle maximize', e);
            }
        });

        // 按钮交互
        controls.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', async event => {
                event.stopPropagation();
                const action = btn.dataset.action;
                try {
                    switch (action) {
                        case 'update':
                            if (isTriggeringUpdate) {
                                break;
                            }
                            isTriggeringUpdate = true;
                            setTimeout(() => { isTriggeringUpdate = false; }, 2000);

                            // 如果已经是就绪状态，点击直接提示重启
                            if (updateBtn.classList.contains('is-ready') || badge.classList.contains('is-ready')) {
                                try {
                                    const currentStatus = await invoke('get_update_status');
                                    const version = (currentStatus && currentStatus.version) ? ` v${currentStatus.version}` : '';
                                    const prompt = (i18n.confirmRestartPromptWithVer || i18n.confirmRestartPrompt).replace('{version}', version);
                                    if (confirm(prompt)) {
                                        await invoke('window_exit_application');
                                    }
                                } catch (e) {
                                    console.error('Failed to restart on update button click', e);
                                }
                                break;
                            }

                            // 如果是有新版本可用状态，点击提示确认下载
                            if (updateBtn.classList.contains('is-available') || badge.classList.contains('is-available')) {
                                try {
                                    const currentStatus = await invoke('get_update_status');
                                    const version = (currentStatus && currentStatus.version) ? ` v${currentStatus.version}` : '';
                                    const prompt = (i18n.confirmDownloadPrompt || '发现启动器新版本{version}，是否立即下载更新？').replace('{version}', version);
                                    if (confirm(prompt)) {
                                        if (activeToast) activeToast.close();
                                        activeToast = showToast(i18n.toastUpdating, 'loading', 0);
                                        applyStatus({ status: 'Updating', progress: 8 });
                                        startPolling();
                                        await invoke('start_download_launcher_update').catch(() => invoke('trigger_update'));
                                    }
                                } catch (e) {
                                    console.error('Failed to start launcher update download on click', e);
                                }
                                break;
                            }

                            // 记录触发时间戳
                            triggerTime = Date.now();
                            if (activeToast) {
                                activeToast.close();
                            }
                            activeToast = showToast(i18n.toastChecking, 'loading', 0);

                            // 极速视觉响应：立刻呈现“正在检查更新...”与转动动画
                            applyStatus({ status: 'Checking' });
                            startPolling();

                            try {
                                await invoke('check_launcher_update');
                            } catch (e) {
                                console.warn('check_launcher_update not supported, falling back to trigger_update', e);
                                try {
                                    await invoke('trigger_update');
                                } catch (fallbackErr) {
                                    console.error('Failed to check launcher update', fallbackErr);
                                    applyStatus({ status: 'Failed', detail: fallbackErr ? fallbackErr.toString() : '' });
                                }
                            }
                            break;
                        case 'hide':
                            await invoke('window_hide');
                            break;
                        case 'minimize':
                            await invoke('window_minimize');
                            break;
                        case 'maximize':
                            await invoke('window_toggle_maximize');
                            await syncMaximizeState(btn);
                            break;
                        case 'close':
                            try {
                                const closeAction = await invoke('get_close_action');
                                if (closeAction === 'minimize') {
                                    await invoke('window_hide');
                                    break;
                                } else if (closeAction === 'exit') {
                                    await invoke('window_exit_application');
                                    break;
                                }
                            } catch (e) {
                                console.error('Failed to get close action', e);
                            }
                            setCloseMenuOpen(true);
                            break;
                    }
                } catch (error) {
                    console.error('Failed to handle ' + action + ' window action', error);
                }
            });
        });

        header.appendChild(controls);
        ensureCloseMenu();

        // 初始同步一次更新状态（处理后台更新正在进行或待重启情况）
        pollStatus();
    };

    // 窗口尺寸变动时同步最大化状态
    window.addEventListener('resize', () => {
        const maxBtn = document.querySelector('.alas-desktop-btn-maximize');
        if (maxBtn) syncMaximizeState(maxBtn);
    });

    // 监听 DOM 树变化，确保 #pywebio-scope-header 重新渲染时 controls 能够自动挂载与日志水印同步
    const checkAndMount = () => {
        cleanupLegacyLauncherElements();
        const header = document.getElementById('pywebio-scope-header');
        if (header) {
            initHeaderControls(header);
        }
        updateLogWatermark();
    };

    const observer = new MutationObserver(() => {
        checkAndMount();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    // 预拉取客户端版本信息并执行首次挂载
    getLauncherInfo().then(() => {
        updateLogWatermark();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndMount, { once: true });
    } else {
        checkAndMount();
    }
})();

