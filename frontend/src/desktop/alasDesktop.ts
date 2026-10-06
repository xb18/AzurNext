/**
 * @fileoverview AzurNext 桌面客户端（Tauri Thin Shell）交互与能力桥接模块。
 *
 * 负责无边框窗口拖拽、顶栏控制按钮（检查启动器更新、最小化到托盘、最小化、最大化、关闭）、
 * 关闭行为确认弹窗以及 `window.alasDesktop` 原生能力命名空间挂载。
 * 仅在 Tauri 桌面客户端环境下自动激活，普通浏览器环境下保持静默。
 */

import './alas-desktop.css'

export interface LauncherInfo {
  version?: string
  platform?: string
}

export interface LauncherUpdateStatus {
  status?: 'Idle' | 'Checking' | 'Available' | 'Updating' | 'ReadyToRestart' | 'AlreadyLatest' | 'Failed' | string
  version?: string
  progress?: number
  title?: string
  detail?: string
}

export interface AlasDesktopModalOptions {
  title?: string
  message?: string
  okText?: string
  cancelText?: string
  type?: 'primary' | 'success' | 'warning'
}

export interface AlasDesktopAPI {
  isAvailable: boolean
  version?: string
  platform?: string
  minimize: () => Promise<unknown>
  toggleMaximize: () => Promise<unknown>
  isMaximized: () => Promise<boolean>
  minimizeToTray: () => Promise<unknown>
  close: () => Promise<unknown>
  exit: () => Promise<unknown>
  startDragging: () => Promise<unknown>
  checkUpdate: () => Promise<unknown>
  downloadUpdate: () => Promise<unknown>
  cancelUpdate: () => Promise<unknown>
  getUpdateStatus: () => Promise<LauncherUpdateStatus | string>
  getUpdateMethod: () => Promise<string>
  setUpdateMethod: (method: string) => Promise<unknown>
  confirm: (message: string, title?: string) => Promise<boolean>
  modal: (options?: AlasDesktopModalOptions) => Promise<boolean>
  getCloseAction: () => Promise<string>
  setCloseAction: (action: string) => Promise<unknown>
  downloadGuiLog: () => Promise<unknown>
  downloadLauncherLog: () => Promise<unknown>
  saveAs: (filename: string, data: string) => Promise<unknown>
  showNotification: (title: string, content: string) => Promise<unknown>
  toast: (message: string, type?: string, duration?: number) => {
    update: (newMsg: string, newType?: string, newDuration?: number) => void
    close: () => void
  }
  focus: () => Promise<unknown>
  openExternal: (url: string) => Promise<unknown>
  openFolder: (path: string) => Promise<unknown>
  getInfo: () => Promise<LauncherInfo | null>
  openClosePrompt: () => void
}

declare global {
  interface Window {
    __TAURI__?: {
      core?: {
        invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<any>
      }
      event?: {
        listen?: (event: string, handler: (event: {payload?: any}) => void) => Promise<() => void>
      }
    }
    __TAURI_INTERNALS__?: {
      invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<any>
    }
    alasDesktop?: AlasDesktopAPI
    alasDesktopMounted?: boolean
    alasDesktopShowModal?: (options?: AlasDesktopModalOptions) => Promise<boolean>
    saveAs?: (blob: Blob, filename: string) => void
  }
}

/**
 * 跨环境触发桌面原生系统通知（Thin Shell Notification）。
 * 若当前运行在 Tauri 桌面外壳中，则调用系统原生 Toast 通知（点击唤醒主窗口）；
 * 在普通浏览器环境下静默跳过（由调用方配合前端 UI Toast 使用）。
 */
export function notifyDesktop(title: string, content: string): boolean {
  if (typeof window !== 'undefined' && typeof window.alasDesktop?.showNotification === 'function') {
    void window.alasDesktop.showNotification(title, content).catch(err => {
      console.warn('调用桌面原生通知失败:', err)
    })
    return true
  }
  return false
}

let initialized = false

/**
 * 初始化桌面外壳集成（幂等）。
 */
export function initAlasDesktop(): void {
  if (initialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const getTauriInvoke = () => {
    if (window.__TAURI__?.core && typeof window.__TAURI__.core.invoke === 'function') {
      return window.__TAURI__.core.invoke
    }
    if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
      return window.__TAURI_INTERNALS__.invoke
    }
    return null
  }

  const invoke = getTauriInvoke()
  if (!invoke) {
    // 非 Tauri 桌面客户端环境（普通浏览器/移动端），直接静默退出
    return
  }

  initialized = true
  document.body.classList.add('is-tauri-client')
  window.alasDesktopMounted = true

  // 清理壳端注入的旧标题栏 DOM、旧样式与旧弹窗，防止两套图标冲突
  const cleanupLegacyLauncherElements = () => {
    ;['#alas-launcher-titlebar', '#alas-launcher-titlebar-style', '#alas-close-menu'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove())
    })
    if (document.body?.dataset?.alasCustomTitlebar) {
      delete document.body.dataset.alasCustomTitlebar
    }
  }
  cleanupLegacyLauncherElements()

  // 桌面客户端环境下禁用默认右键菜单与 Ctrl+P 快捷键
  window.addEventListener('contextmenu', e => e.preventDefault(), {capture: true})
  window.addEventListener(
    'keydown',
    e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
      }
    },
    {capture: true},
  )

  // 重写 saveAs 函数，将文件导出路由至客户端原生文件保存对话框
  window.saveAs = function (blob: Blob, filename: string) {
    const reader = new FileReader()
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const data = result.split(',')[1] || ''
      try {
        await invoke('save_as', {filename, data})
      } catch (err) {
        console.error('Failed to invoke save_as', err)
      }
    }
    reader.readAsDataURL(blob)
  }

  // 桌面原生风格轻量 UI Toast 组件
  let toastContainer: HTMLElement | null = null
  const ensureToastContainer = () => {
    if (!toastContainer || !document.contains(toastContainer)) {
      toastContainer = document.getElementById('alas-desktop-toast-container')
      if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.id = 'alas-desktop-toast-container'
        document.body.appendChild(toastContainer)
      }
    }
    return toastContainer
  }

  const getToastIconSvg = (type: string) => {
    if (type === 'loading') {
      return '<svg class="alas-desktop-toast-spin" viewBox="0 0 16 16" width="14" height="14"><path d="M8 2a6 6 0 1 0 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    }
    if (type === 'success') {
      return '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><polyline points="5,8.5 7.2,10.7 11.5,5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    }
    if (type === 'error') {
      return '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    }
    return '<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="7" x2="8" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="4.5" r="0.75" fill="currentColor"/></svg>'
  }

  const showToast = (message: string, type = 'info', duration = 3500) => {
    const container = ensureToastContainer()
    const toast = document.createElement('div')
    toast.className = `alas-desktop-toast alas-desktop-toast-${type}`
    toast.innerHTML = `
      <span class="alas-desktop-toast-icon">${getToastIconSvg(type)}</span>
      <span class="alas-desktop-toast-msg"></span>
    `
    const msgEl = toast.querySelector('.alas-desktop-toast-msg')
    if (msgEl) msgEl.textContent = message

    container.appendChild(toast)
    requestAnimationFrame(() => {
      toast.classList.add('is-visible')
    })

    let timer: ReturnType<typeof setTimeout> | null = null
    const hide = () => {
      if (timer) clearTimeout(timer)
      toast.classList.remove('is-visible')
      setTimeout(() => {
        if (toast.parentNode) toast.remove()
      }, 250)
    }

    toast.addEventListener('click', hide)
    if (duration > 0) {
      timer = setTimeout(hide, duration)
    }

    return {
      update: (newMsg: string, newType?: string, newDuration = 3500) => {
        if (timer) clearTimeout(timer)
        const m = toast.querySelector('.alas-desktop-toast-msg')
        if (m) m.textContent = newMsg
        if (newType) {
          toast.className = `alas-desktop-toast alas-desktop-toast-${newType} is-visible`
          const iconEl = toast.querySelector('.alas-desktop-toast-icon')
          if (iconEl) iconEl.innerHTML = getToastIconSvg(newType)
        }
        if (newDuration > 0) {
          timer = setTimeout(hide, newDuration)
        }
      },
      close: hide,
    }
  }

  let askConfirm: ((message: string, title?: string) => Promise<boolean>) | null = null

  const I18N: Record<string, Record<string, string>> = {
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
      confirmDownloadTitle: '发现启动器新版本',
      confirmDownloadPrompt: '发现启动器新版本{version}，是否立即下载更新？',
      confirmDownloadOk: '立即下载',
      confirmDownloadCancel: '稍后',
      confirmRestartTitle: '启动器更新已就绪',
      confirmRestartPrompt: '启动器更新已下载完毕，是否立即重启启动器以完成更新？',
      confirmRestartPromptWithVer: '启动器更新{version}已下载就绪，是否立即重启启动器以完成更新？',
      confirmRestartOk: '立即重启',
      confirmRestartCancel: '稍后',
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
      confirmDownloadTitle: '發現啟動器新版本',
      confirmDownloadPrompt: '發現啟動器新版本{version}，是否立即下載更新？',
      confirmDownloadOk: '立即下載',
      confirmDownloadCancel: '稍後',
      confirmRestartTitle: '啟動器更新已就緒',
      confirmRestartPrompt: '啟動器更新已下載完畢，是否立即重新啟動啟動器以完成更新？',
      confirmRestartPromptWithVer: '啟動器更新{version}已下載就緒，是否立即重新啟動啟動器以完成更新？',
      confirmRestartOk: '立即重新啟動',
      confirmRestartCancel: '稍後',
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
    ja: {
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
      confirmDownloadTitle: 'ランチャーの新バージョン',
      confirmDownloadPrompt: 'ランチャーの新バージョン{version}が見つかりました。今すぐダウンロードしますか？',
      confirmDownloadOk: '今すぐダウンロード',
      confirmDownloadCancel: '後で',
      confirmRestartTitle: 'ランチャー更新準備完了',
      confirmRestartPrompt: 'ランチャーのアップデートが完了しました。今すぐ再起動して適用しますか？',
      confirmRestartPromptWithVer: 'ランチャーの更新{version}がダウンロードされました。今すぐ再起動して適用しますか？',
      confirmRestartOk: '今すぐ再起動',
      confirmRestartCancel: '後で',
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
    en: {
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
      confirmDownloadTitle: 'Launcher Update Available',
      confirmDownloadPrompt: 'Launcher update{version} is available. Download now?',
      confirmDownloadOk: 'Download Now',
      confirmDownloadCancel: 'Later',
      confirmRestartTitle: 'Launcher Update Ready',
      confirmRestartPrompt: 'Launcher update downloaded. Restart the launcher now to apply?',
      confirmRestartPromptWithVer: 'Launcher update{version} downloaded. Restart the launcher now to apply?',
      confirmRestartOk: 'Restart Now',
      confirmRestartCancel: 'Later',
      clientVersionLabel: 'Launcher',
      copiedLabel: 'Copied!',
      copyHint: 'Click to copy version',
      toastChecking: 'Checking for launcher updates...',
      toastUpdating: 'Downloading launcher update...',
      toastAvailable: 'Launcher update{version} is available for download.',
      toastAlreadyLatest: 'Launcher is already up to date.',
      toastUpdateReady: 'Launcher update is ready. Restart to apply.',
      toastUpdateFailed: 'Check launcher update failed: ',
    },
  }

  const getLang = () => {
    const lang = (document.documentElement.lang || navigator.language || 'zh-CN').toLowerCase()
    if (lang.includes('tw') || lang.includes('hk')) return 'zh-TW'
    if (lang.includes('ja')) return 'ja'
    if (lang.includes('en')) return 'en'
    return 'zh-CN'
  }

  const i18n = I18N[getLang()] || I18N['zh-CN']

  // 模态确认对话框
  let confirmModalBackdrop: HTMLElement | null = null
  let confirmModalResolver: ((value: boolean) => void) | null = null

  const ensureConfirmModal = () => {
    if (confirmModalBackdrop && document.contains(confirmModalBackdrop)) {
      return confirmModalBackdrop
    }
    const existing = document.getElementById('alas-desktop-confirm-modal')
    if (existing) {
      confirmModalBackdrop = existing
      return confirmModalBackdrop
    }

    confirmModalBackdrop = document.createElement('div')
    confirmModalBackdrop.id = 'alas-desktop-confirm-modal'
    confirmModalBackdrop.setAttribute('role', 'dialog')
    confirmModalBackdrop.setAttribute('aria-modal', 'true')
    confirmModalBackdrop.innerHTML = `
      <div class="alas-desktop-modal-card">
        <button type="button" class="alas-desktop-modal-close" aria-label="关闭">
          <svg viewBox="0 0 16 16" width="12" height="12"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="alas-desktop-modal-header">
          <span class="alas-desktop-modal-icon"></span>
          <h3 class="alas-desktop-modal-title"></h3>
        </div>
        <div class="alas-desktop-modal-body"></div>
        <div class="alas-desktop-modal-actions">
          <button type="button" class="alas-desktop-modal-btn alas-desktop-modal-cancel"></button>
          <button type="button" class="alas-desktop-modal-btn alas-desktop-modal-ok"></button>
        </div>
      </div>
    `

    const closeWith = (res: boolean) => {
      confirmModalBackdrop?.classList.remove('is-open')
      if (confirmModalResolver) {
        const fn = confirmModalResolver
        confirmModalResolver = null
        fn(res)
      }
    }

    confirmModalBackdrop.querySelector('.alas-desktop-modal-close')?.addEventListener('click', e => {
      e.stopPropagation()
      closeWith(false)
    })

    confirmModalBackdrop.querySelector('.alas-desktop-modal-cancel')?.addEventListener('click', e => {
      e.stopPropagation()
      closeWith(false)
    })

    confirmModalBackdrop.querySelector('.alas-desktop-modal-ok')?.addEventListener('click', e => {
      e.stopPropagation()
      closeWith(true)
    })

    confirmModalBackdrop.addEventListener('pointerdown', e => {
      if (e.target === confirmModalBackdrop) {
        closeWith(false)
      }
    })

    document.addEventListener('keydown', e => {
      if (confirmModalBackdrop && confirmModalBackdrop.classList.contains('is-open')) {
        if (e.key === 'Escape') {
          e.preventDefault()
          closeWith(false)
        } else if (e.key === 'Enter') {
          if (document.activeElement !== confirmModalBackdrop.querySelector('.alas-desktop-modal-cancel')) {
            e.preventDefault()
            closeWith(true)
          }
        }
      }
    })

    document.body.appendChild(confirmModalBackdrop)
    return confirmModalBackdrop
  }

  const showConfirmModal = ({
    title = '',
    message = '',
    okText = '',
    cancelText = '',
    type = 'primary',
  }: AlasDesktopModalOptions = {}): Promise<boolean> => {
    const modal = ensureConfirmModal()
    const titleEl = modal.querySelector('.alas-desktop-modal-title')
    const bodyEl = modal.querySelector('.alas-desktop-modal-body')
    const iconEl = modal.querySelector('.alas-desktop-modal-icon')
    const cancelBtn = modal.querySelector('.alas-desktop-modal-cancel') as HTMLButtonElement | null
    const okBtn = modal.querySelector('.alas-desktop-modal-ok') as HTMLButtonElement | null

    if (titleEl) titleEl.textContent = title || i18n.clientVersionLabel || 'AzurNext'
    if (bodyEl) bodyEl.textContent = message || ''
    if (cancelBtn) cancelBtn.textContent = cancelText || i18n.confirmDownloadCancel || '稍后'
    if (okBtn) okBtn.textContent = okText || i18n.confirmDownloadOk || '确定'

    let iconSvg = ''
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 16 16" width="18" height="18"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><polyline points="5,8.5 7.2,10.7 11.5,5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    } else if (type === 'warning') {
      iconSvg = '<svg viewBox="0 0 16 16" width="18" height="18"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="8" y1="4.5" x2="8" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.75" fill="currentColor"/></svg>'
    } else {
      iconSvg = '<svg viewBox="0 0 16 16" width="18" height="18"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5v5m0 0l-2-2m2 2l2-2M5.5 12h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    }
    if (iconEl) {
      iconEl.innerHTML = iconSvg
      iconEl.className = `alas-desktop-modal-icon is-${type}`
    }
    if (okBtn) {
      okBtn.className = `alas-desktop-modal-btn alas-desktop-modal-ok is-${type}`
    }

    if (confirmModalResolver) {
      confirmModalResolver(false)
      confirmModalResolver = null
    }

    return new Promise(resolve => {
      confirmModalResolver = resolve
      modal.classList.add('is-open')
      okBtn?.focus({preventScroll: true})
    })
  }

  askConfirm = (message, title) => showConfirmModal({title, message})
  window.alasDesktopShowModal = showConfirmModal

  let closeMenu: HTMLElement | null = null
  const setCloseMenuOpen = (open: boolean) => {
    if (!closeMenu) ensureCloseMenu()
    closeMenu?.classList.toggle('is-open', open)
    if (open) {
      ;(closeMenu?.querySelector('[data-close-action="minimize"]') as HTMLElement | null)?.focus({preventScroll: true})
    }
  }

  const ensureCloseMenu = () => {
    if (closeMenu || document.getElementById('alas-desktop-close-menu')) {
      closeMenu = closeMenu || document.getElementById('alas-desktop-close-menu')
      return
    }
    closeMenu = document.createElement('div')
    closeMenu.id = 'alas-desktop-close-menu'
    closeMenu.setAttribute('role', 'dialog')
    closeMenu.setAttribute('aria-modal', 'false')
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
    `
    const titleEl = closeMenu.querySelector('#alas-desktop-close-title')
    const minBtn = closeMenu.querySelector('[data-close-action="minimize"]')
    const exitBtn = closeMenu.querySelector('[data-close-action="exit"]')
    const remText = closeMenu.querySelector('.alas-desktop-close-remember-text')
    if (titleEl) titleEl.textContent = i18n.closePrompt
    if (minBtn) minBtn.textContent = i18n.minimizeToTrayAction
    if (exitBtn) exitBtn.textContent = i18n.exitAction
    if (remText) remText.textContent = i18n.rememberChoice

    closeMenu.addEventListener('pointerdown', e => e.stopPropagation())

    minBtn?.addEventListener('click', async () => {
      const remember = (closeMenu?.querySelector('#alas-desktop-close-remember-check') as HTMLInputElement | null)?.checked
      setCloseMenuOpen(false)
      if (remember) {
        try {
          await invoke('set_close_action', {action: 'minimize'})
        } catch (e) {
          console.error('Failed to set close action', e)
        }
      }
      try {
        await invoke('window_hide')
      } catch (error) {
        console.error('Failed to minimize window to tray', error)
      }
    })

    exitBtn?.addEventListener('click', async () => {
      const remember = (closeMenu?.querySelector('#alas-desktop-close-remember-check') as HTMLInputElement | null)?.checked
      if (remember) {
        try {
          await invoke('set_close_action', {action: 'exit'})
        } catch (e) {
          console.error('Failed to set close action', e)
        }
      }
      closeMenu?.querySelectorAll('button').forEach(b => {
        ;(b as HTMLButtonElement).disabled = true
      })
      try {
        await invoke('window_exit_application')
      } catch (error) {
        closeMenu?.querySelectorAll('button').forEach(b => {
          ;(b as HTMLButtonElement).disabled = false
        })
        console.error('Failed to exit application', error)
      }
    })

    document.body.appendChild(closeMenu)
  }

  document.addEventListener('pointerdown', event => {
    if (closeMenu && closeMenu.classList.contains('is-open') && !closeMenu.contains(event.target as Node)) {
      setCloseMenuOpen(false)
    }
  })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && closeMenu && closeMenu.classList.contains('is-open')) {
      setCloseMenuOpen(false)
    }
  })

  // 挂载全局 window.alasDesktop
  window.alasDesktop = {
    isAvailable: true,
    minimize: () => invoke('window_minimize'),
    toggleMaximize: () => invoke('window_toggle_maximize'),
    isMaximized: () => invoke('window_is_maximized'),
    minimizeToTray: () => invoke('window_hide'),
    close: () => invoke('window_close'),
    exit: () => invoke('window_exit_application'),
    startDragging: () => invoke('window_start_dragging'),
    checkUpdate: () => invoke('check_launcher_update'),
    downloadUpdate: () => invoke('start_download_launcher_update'),
    cancelUpdate: () => invoke('cancel_or_dismiss_update'),
    getUpdateStatus: () => invoke('get_update_status'),
    getUpdateMethod: () => invoke('get_update_method'),
    setUpdateMethod: (method: string) => invoke('set_update_method', {method}),
    confirm: (message: string, title?: string) => (askConfirm ? askConfirm(message, title) : Promise.resolve(false)),
    modal: (options?: AlasDesktopModalOptions) => (window.alasDesktopShowModal ? window.alasDesktopShowModal(options) : Promise.resolve(false)),
    getCloseAction: () => invoke('get_close_action'),
    setCloseAction: (action: string) => invoke('set_close_action', {action}),
    downloadGuiLog: () => invoke('download_today_gui_log'),
    downloadLauncherLog: () => invoke('download_today_launcher_log'),
    saveAs: (filename: string, data: string) => invoke('save_as', {filename, data}),
    showNotification: (title: string, content: string) => invoke('show_notification', {title, content}),
    toast: (message: string, type?: string, duration?: number) => showToast(message, type, duration),
    focus: () => invoke('focus_window'),
    openExternal: (url: string) => invoke('open_external', {url}),
    openFolder: (path: string) => invoke('open_folder', {path}),
    getInfo: () => invoke('get_launcher_info'),
    openClosePrompt: () => setCloseMenuOpen(true),
  }

  const syncMaximizeState = async (button: HTMLElement | null) => {
    if (!button) return
    try {
      const maximized = await invoke('window_is_maximized')
      button.dataset.maximized = maximized ? 'true' : 'false'
      button.title = maximized ? i18n.restoreTitle : i18n.maximizeActionTitle
      button.setAttribute('aria-label', maximized ? i18n.restoreLabel : i18n.maximizeLabelText)
      const svgMax = button.querySelector('.svg-maximize') as HTMLElement | null
      const svgRes = button.querySelector('.svg-restore') as HTMLElement | null
      if (svgMax) svgMax.style.display = maximized ? 'none' : ''
      if (svgRes) svgRes.style.display = maximized ? '' : 'none'
    } catch (e) {
      console.error('Failed to sync maximize state', e)
    }
  }

  let launcherInfoCache: LauncherInfo | null = null
  const getLauncherInfo = async (): Promise<LauncherInfo | null> => {
    if (launcherInfoCache) return launcherInfoCache
    try {
      launcherInfoCache = await invoke('get_launcher_info')
      if (launcherInfoCache && window.alasDesktop) {
        window.alasDesktop.version = launcherInfoCache.version
        window.alasDesktop.platform = launcherInfoCache.platform
      }
      return launcherInfoCache
    } catch (e) {
      console.warn('Failed to get launcher info', e)
      return null
    }
  }

  const initHeaderControls = (header: HTMLElement, isFloating = false) => {
    if (!header || header.querySelector(':scope > .alas-desktop-controls')) {
      return
    }

    if (!isFloating) {
      header.setAttribute('data-tauri-drag-region', 'true')
    }

    const controls = document.createElement('div')
    controls.className = isFloating ? 'alas-desktop-controls is-floating' : 'alas-desktop-controls'
    controls.setAttribute('data-tauri-drag-region', 'false')

    ;['pointerdown', 'mousedown', 'touchstart', 'dblclick'].forEach(evt => {
      controls.addEventListener(evt, e => e.stopPropagation())
    })

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
    `

    const maxBtn = controls.querySelector('[data-action="maximize"]') as HTMLElement | null
    void syncMaximizeState(maxBtn)

    const versionBadge = controls.querySelector('.alas-desktop-version-badge') as HTMLElement | null
    const applyVersion = (info: LauncherInfo | null) => {
      if (!info || !info.version || !versionBadge) return
      versionBadge.textContent = 'v' + info.version
      const platformText = info.platform ? ` (${info.platform})` : ''
      versionBadge.title = `${i18n.clientVersionLabel || '客户端'} v${info.version}${platformText} · ${i18n.copyHint || '点击复制'}`
      versionBadge.style.display = 'inline-flex'
    }

    if (launcherInfoCache) {
      applyVersion(launcherInfoCache)
    } else {
      void getLauncherInfo().then(info => applyVersion(info))
    }

    versionBadge?.addEventListener('click', async e => {
      e.stopPropagation()
      if (!launcherInfoCache?.version || !versionBadge) return
      const textToCopy = `v${launcherInfoCache.version}`
      try {
        await navigator.clipboard.writeText(textToCopy)
        const originalText = versionBadge.textContent
        versionBadge.textContent = i18n.copiedLabel || '已复制!'
        setTimeout(() => {
          versionBadge.textContent = originalText
        }, 1200)
      } catch (err) {
        console.warn('Failed to copy version', err)
      }
    })

    const badge = controls.querySelector('.alas-desktop-update-badge') as HTMLElement
    const updateBtn = controls.querySelector('.alas-desktop-btn-update') as HTMLElement
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let fadeTimer: ReturnType<typeof setTimeout> | null = null
    let isTriggeringUpdate = false
    let triggerTime = 0
    let activeToast: ReturnType<typeof showToast> | null = null
    let promptedDownloadVersion: string | null = null
    let isAskingDownloadConfirm = false
    let isAskingRestartConfirm = false

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }

    const startPolling = () => {
      stopPolling()
      pollTimer = setInterval(pollStatus, 600)
      setTimeout(stopPolling, 300000)
    }

    const applyStatus = (status: LauncherUpdateStatus | string | null | undefined) => {
      if (!status) return
      const obj: LauncherUpdateStatus = typeof status === 'string' ? {status} : status
      const s = obj.status
      if (!s) return

      if (fadeTimer) {
        clearTimeout(fadeTimer)
        fadeTimer = null
      }

      if (s === 'Checking') {
        updateBtn.classList.add('is-spinning')
        updateBtn.classList.remove('is-ready', 'is-available')
        updateBtn.title = i18n.checkingLabel
        badge.style.display = 'inline-flex'
        badge.className = 'alas-desktop-update-badge is-updating'
        badge.textContent = i18n.checkingLabel
        badge.title = i18n.checkingLabel
        badge.style.background = ''
        activeToast?.update(i18n.toastChecking, 'loading', 0)
      } else if (s === 'Available') {
        updateBtn.classList.remove('is-spinning', 'is-ready')
        updateBtn.classList.add('is-available')
        const version = obj.version || ''
        const verText = version ? ` v${version}` : ''
        const badgeText = `${i18n.updateAvailableBadge || '发现新版'}${verText}`
        const promptMsg = (i18n.confirmDownloadPrompt || '发现启动器新版本{version}，是否立即下载更新？').replace('{version}', verText)
        updateBtn.title = promptMsg
        badge.style.display = 'inline-flex'
        badge.className = 'alas-desktop-update-badge is-available'
        badge.textContent = `★ ${badgeText}`
        badge.title = promptMsg
        badge.style.background = ''

        if (activeToast) {
          const toastText = (i18n.toastAvailable || '发现启动器新版本{version}').replace('{version}', verText)
          activeToast.update(toastText, 'info', 6000)
          activeToast = null
        }

        if (Date.now() - triggerTime < 10000 && !isAskingDownloadConfirm && promptedDownloadVersion !== version) {
          promptedDownloadVersion = version
          isAskingDownloadConfirm = true
          setTimeout(async () => {
            try {
              if (badge.classList.contains('is-available')) {
                const confirmed = await showConfirmModal({
                  title: i18n.confirmDownloadTitle || '发现启动器新版本',
                  message: promptMsg,
                  okText: i18n.confirmDownloadOk || '立即下载',
                  cancelText: i18n.confirmDownloadCancel || '稍后',
                  type: 'primary',
                })
                if (confirmed && badge.classList.contains('is-available')) {
                  activeToast?.close()
                  activeToast = showToast(i18n.toastUpdating, 'loading', 0)
                  applyStatus({status: 'Updating', progress: 8})
                  startPolling()
                  invoke('start_download_launcher_update').catch(e => {
                    console.error('Failed to start launcher update download', e)
                    applyStatus({status: 'Failed', detail: e ? String(e) : ''})
                  })
                }
              }
            } finally {
              isAskingDownloadConfirm = false
            }
          }, 150)
        }
      } else if (s === 'Updating') {
        updateBtn.classList.add('is-spinning')
        updateBtn.classList.remove('is-ready', 'is-available')
        const progress = typeof obj.progress === 'number' ? obj.progress : 0
        const title = obj.title || i18n.updatingLabel
        const detail = obj.detail || ''
        badge.style.display = 'inline-flex'
        badge.className = 'alas-desktop-update-badge is-updating'
        badge.textContent = progress > 0 ? `${progress}%` : i18n.updatingLabel
        badge.style.background =
          progress > 0
            ? `linear-gradient(to right, rgba(59, 130, 246, .45) ${progress}%, rgba(59, 130, 246, .15) ${progress}%)`
            : ''
        const fullDesc = `[${title} ${progress}%] ${detail}`.trim()
        badge.title = fullDesc
        updateBtn.title = fullDesc
        const toastMsg = progress > 0 ? `${i18n.toastUpdating} (${progress}%)` : title || i18n.toastUpdating
        activeToast?.update(toastMsg, 'loading', 0)
      } else if (s === 'ReadyToRestart') {
        updateBtn.classList.remove('is-spinning', 'is-available')
        updateBtn.classList.add('is-ready')
        const version = obj.version || ''
        const verText = version ? ` v${version}` : ''
        const desc = `${i18n.clientUpdateReadyLabel || i18n.updateReadyLabel}${verText}`
        updateBtn.title = `${desc} · ${i18n.restartToApply}`
        badge.style.display = 'inline-flex'
        badge.className = 'alas-desktop-update-badge is-ready'
        badge.textContent = `✔ ${i18n.restartToApply}${verText}`
        badge.title = `${desc} · ${i18n.restartToApply}`
        badge.style.background = ''
        if (activeToast) {
          activeToast.update(i18n.toastUpdateReady, 'success', 6000)
          activeToast = null
        }
      } else if (s === 'AlreadyLatest') {
        updateBtn.classList.remove('is-spinning', 'is-ready', 'is-available')
        updateBtn.title = i18n.alreadyLatestLabel
        badge.style.display = 'inline-flex'
        badge.className = 'alas-desktop-update-badge is-latest'
        badge.textContent = `✔ ${i18n.alreadyLatestLabel}`
        badge.title = i18n.alreadyLatestLabel
        badge.style.background = ''
        if (activeToast) {
          activeToast.update(i18n.toastAlreadyLatest, 'success', 3500)
          activeToast = null
        }
        fadeTimer = setTimeout(() => {
          badge.style.display = 'none'
          updateBtn.title = i18n.checkUpdateLabel
        }, 3500)
      } else if (s === 'Failed') {
        updateBtn.classList.remove('is-spinning', 'is-ready', 'is-available')
        const detail = obj.detail || ''
        const fullDesc = `${i18n.updateFailedLabel}: ${detail}`.trim()
        updateBtn.title = fullDesc
        badge.style.display = 'inline-flex'
        badge.className = 'alas-desktop-update-badge is-failed'
        badge.textContent = `✖ ${i18n.updateFailedLabel}`
        badge.title = fullDesc
        badge.style.background = ''
        if (activeToast) {
          activeToast.update((i18n.toastUpdateFailed || '') + detail, 'error', 5000)
          activeToast = null
        }
        fadeTimer = setTimeout(() => {
          badge.style.display = 'none'
          updateBtn.title = i18n.checkUpdateLabel
        }, 5000)
      } else {
        if (Date.now() - triggerTime < 4000) return
        updateBtn.classList.remove('is-spinning', 'is-ready', 'is-available')
        updateBtn.title = i18n.checkUpdateLabel
        badge.style.display = 'none'
        badge.style.background = ''
        if (activeToast) {
          activeToast.close()
          activeToast = null
        }
      }
    }

    const pollStatus = async () => {
      try {
        const status = await invoke('get_update_status')
        applyStatus(status)
        const s = typeof status === 'string' ? status : status?.status
        if (Date.now() - triggerTime < 4000) return
        if (s !== 'Checking' && s !== 'Updating') {
          stopPolling()
        }
      } catch (e) {
        console.error('Failed to poll update status', e)
        if (Date.now() - triggerTime >= 4000) {
          stopPolling()
        }
      }
    }

    try {
      if (window.__TAURI__?.event && typeof window.__TAURI__.event.listen === 'function') {
        void window.__TAURI__.event.listen('update-status-changed', event => {
          if (event?.payload) {
            applyStatus(event.payload)
            const s = typeof event.payload === 'string' ? event.payload : event.payload?.status
            if (s !== 'Checking' && s !== 'Updating' && Date.now() - triggerTime >= 4000) {
              stopPolling()
            }
          }
        })
      }
    } catch (err) {
      console.warn('Tauri event listen not available', err)
    }

    badge.addEventListener('click', async e => {
      e.stopPropagation()
      if (badge.classList.contains('is-ready')) {
        if (isAskingRestartConfirm) return
        isAskingRestartConfirm = true
        try {
          const currentStatus = await invoke('get_update_status')
          const version = currentStatus?.version ? ` v${currentStatus.version}` : ''
          const prompt = (i18n.confirmRestartPromptWithVer || i18n.confirmRestartPrompt).replace('{version}', version)
          const confirmed = await showConfirmModal({
            title: i18n.confirmRestartTitle || '启动器更新已就绪',
            message: prompt,
            okText: i18n.confirmRestartOk || '立即重启',
            cancelText: i18n.confirmRestartCancel || '稍后',
            type: 'success',
          })
          if (confirmed) {
            await invoke('window_exit_application')
          }
        } finally {
          isAskingRestartConfirm = false
        }
        return
      }

      if (badge.classList.contains('is-available')) {
        if (isAskingDownloadConfirm) return
        isAskingDownloadConfirm = true
        try {
          const currentStatus = await invoke('get_update_status')
          const version = currentStatus?.version ? ` v${currentStatus.version}` : ''
          const prompt = (i18n.confirmDownloadPrompt || '发现启动器新版本{version}，是否立即下载更新？').replace('{version}', version)
          const confirmed = await showConfirmModal({
            title: i18n.confirmDownloadTitle || '发现启动器新版本',
            message: prompt,
            okText: i18n.confirmDownloadOk || '立即下载',
            cancelText: i18n.confirmDownloadCancel || '稍后',
            type: 'primary',
          })
          if (confirmed) {
            activeToast?.close()
            activeToast = showToast(i18n.toastUpdating, 'loading', 0)
            applyStatus({status: 'Updating', progress: 8})
            startPolling()
            await invoke('start_download_launcher_update')
          }
        } finally {
          isAskingDownloadConfirm = false
        }
      }
    })

    if (!isFloating) {
      header.addEventListener('dblclick', async event => {
        const target = event.target as HTMLElement | null
        if (target?.closest('button') || target?.closest('a') || target?.closest('input')) {
          return
        }
        try {
          await invoke('window_toggle_maximize')
          await syncMaximizeState(maxBtn)
        } catch (e) {
          console.error('Failed to toggle maximize', e)
        }
      })
    }

    controls.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', async event => {
        event.stopPropagation()
        const action = (btn as HTMLElement).dataset.action
        try {
          switch (action) {
            case 'update':
              if (isTriggeringUpdate) break
              isTriggeringUpdate = true
              setTimeout(() => {
                isTriggeringUpdate = false
              }, 2000)

              if (updateBtn.classList.contains('is-ready') || badge.classList.contains('is-ready')) {
                if (isAskingRestartConfirm) break
                isAskingRestartConfirm = true
                try {
                  const currentStatus = await invoke('get_update_status')
                  const version = currentStatus?.version ? ` v${currentStatus.version}` : ''
                  const prompt = (i18n.confirmRestartPromptWithVer || i18n.confirmRestartPrompt).replace('{version}', version)
                  const confirmed = await showConfirmModal({
                    title: i18n.confirmRestartTitle || '启动器更新已就绪',
                    message: prompt,
                    okText: i18n.confirmRestartOk || '立即重启',
                    cancelText: i18n.confirmRestartCancel || '稍后',
                    type: 'success',
                  })
                  if (confirmed) {
                    await invoke('window_exit_application')
                  }
                } finally {
                  isAskingRestartConfirm = false
                }
                break
              }

              if (updateBtn.classList.contains('is-available') || badge.classList.contains('is-available')) {
                if (isAskingDownloadConfirm) break
                isAskingDownloadConfirm = true
                try {
                  const currentStatus = await invoke('get_update_status')
                  const version = currentStatus?.version ? ` v${currentStatus.version}` : ''
                  const prompt = (i18n.confirmDownloadPrompt || '发现启动器新版本{version}，是否立即下载更新？').replace('{version}', version)
                  const confirmed = await showConfirmModal({
                    title: i18n.confirmDownloadTitle || '发现启动器新版本',
                    message: prompt,
                    okText: i18n.confirmDownloadOk || '立即下载',
                    cancelText: i18n.confirmDownloadCancel || '稍后',
                    type: 'primary',
                  })
                  if (confirmed) {
                    activeToast?.close()
                    activeToast = showToast(i18n.toastUpdating, 'loading', 0)
                    applyStatus({status: 'Updating', progress: 8})
                    startPolling()
                    await invoke('start_download_launcher_update')
                  }
                } finally {
                  isAskingDownloadConfirm = false
                }
                break
              }

              triggerTime = Date.now()
              activeToast?.close()
              activeToast = showToast(i18n.toastChecking, 'loading', 0)
              applyStatus({status: 'Checking'})
              startPolling()
              try {
                await invoke('check_launcher_update')
              } catch (e) {
                console.error('Failed to check launcher update', e)
                applyStatus({status: 'Failed', detail: e ? String(e) : ''})
              }
              break
            case 'hide':
              await invoke('window_hide')
              break
            case 'minimize':
              await invoke('window_minimize')
              break
            case 'maximize':
              await invoke('window_toggle_maximize')
              await syncMaximizeState(btn as HTMLElement)
              break
            case 'close':
              try {
                const closeAction = await invoke('get_close_action')
                if (closeAction === 'minimize') {
                  await invoke('window_hide')
                  break
                } else if (closeAction === 'exit') {
                  await invoke('window_exit_application')
                  break
                }
              } catch (e) {
                console.error('Failed to get close action', e)
              }
              setCloseMenuOpen(true)
              break
          }
        } catch (error) {
          console.error('Failed to handle ' + action + ' window action', error)
        }
      })
    })

    header.appendChild(controls)
    ensureCloseMenu()
    void pollStatus()
  }

  window.addEventListener('resize', () => {
    const maxBtn = document.querySelector('.alas-desktop-btn-maximize') as HTMLElement | null
    if (maxBtn) void syncMaximizeState(maxBtn)
  })

  const checkAndMount = () => {
    cleanupLegacyLauncherElements()
    // 适配新版 React 顶栏 (.topbar) 及旧版兼容选择器
    const header = (document.querySelector('header.topbar') || document.getElementById('pywebio-scope-header')) as HTMLElement | null
    if (header) {
      document.querySelectorAll('body > .alas-desktop-controls.is-floating').forEach(el => el.remove())
      initHeaderControls(header, false)
    } else if (document.body) {
      initHeaderControls(document.body, true)
    }
    const sidebarBrand = document.querySelector('.sidebar > .sidebar-brand') as HTMLElement | null
    if (sidebarBrand && !sidebarBrand.hasAttribute('data-tauri-drag-region')) {
      sidebarBrand.setAttribute('data-tauri-drag-region', 'true')
    }
  }

  const observer = new MutationObserver(() => {
    checkAndMount()
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })

  void getLauncherInfo()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndMount, {once: true})
  } else {
    checkAndMount()
  }
}
