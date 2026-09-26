var e=`/* 旧版主题：MD3 靛紫配色，还原旧 WebUI 的平面观感。
   与简约主题一样复用共享骨架，但不导入玻璃、壁纸与外部 theme.css。
   结构性规则（布局、尺寸、层级）必须自带 —— 共享层不提供，平时由 apple.css 承担。 */

@font-face {
  font-family: 'JetBrains Mono';
  src: local('JetBrains Mono'), local('JetBrains Mono NL'), url('./JetBrainsMonoNL-Regular.ttf') format('truetype');
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono NL';
  src: local('JetBrains Mono NL'), local('JetBrains Mono'), url('./JetBrainsMonoNL-Regular.ttf') format('truetype');
  font-display: swap;
}

:root {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #1d1d1f; background: #f5f5f7; font-synthesis: none; text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --bg: #f5f5f7; --surface: #fff; --surface-muted: #f5f5f7; --text: #1d1d1f; --muted: #6e6e73;
  --border: #e5e5ea; --accent: #0071e3; --accent-hover: #0062c4; --accent-soft: #e8f2ff;
  --navy: #111f2e; --red: #c9342c; --radius: 20px; --shadow: 0 4px 24px #1d1d1f05;
  --sidebar: #fff; --sidebar-width: 240px; --right-rail-width: 320px;
  --topbar-height: 69px;
  --ui-scale: 1; --viewport-height: 100dvh;
  --syntax-key: #126c9a; --syntax-string: #237342; --syntax-value: #96509e;
  --syntax-comment: #72818a; --syntax-punctuation: #657581;
  --theme-font-mono: "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace;
  font-size: 14px;
}

* {box-sizing: border-box}
body {margin: 0; color: var(--text); background: var(--bg)}
button, input, select, textarea {font: inherit}
code, kbd, samp {font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace)}
button, a, input, select, textarea {-webkit-tap-highlight-color: transparent}
button, a {touch-action: manipulation}
button {cursor: pointer; color: inherit}
button:disabled {cursor: not-allowed; opacity: .5}
a {color: inherit; text-decoration: none}
button {border: 0; background: none}
button:focus-visible, a:focus-visible, summary:focus-visible {outline: 2px solid var(--accent); outline-offset: 4px}
input, select, textarea {border: 1px solid var(--border); border-radius: 7px; padding: 10px 12px; color: var(--text); background: var(--surface); min-width: 0; transition: border-color .15s}
input:focus, select:focus, textarea:focus {outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent)}
input::placeholder {color: var(--muted)}
input[type='checkbox'] {accent-color: var(--accent); width: 14px; height: 14px}
h1, h2, h3, p {margin: 0}
h1 {font-size: 30px; letter-spacing: -.8px; font-weight: 700; line-height: 1.3}
h2 {font-size: 14px; font-weight: 650}
small {font-size: 11px}
svg {flex-shrink: 0; vertical-align: middle}
::selection {background: #6ed4bc45}
::-webkit-scrollbar {width: 5px; height: 5px}
::-webkit-scrollbar-thumb {background: #95a5b73c; border-radius: 8px}
.muted, .small-label {color: var(--muted)}
.small-label {font-size: 11px}
.spin {animation: spin 1.2s linear infinite}
@keyframes spin {to {transform: rotate(360deg)}}

/* 实例分页的两种活动动画：运行中的实例常亮呼吸，被切到的标签页闪一下再落回静态高亮。 */
@keyframes instance-pulse {0%, 100% {opacity: 1} 50% {opacity: .35}}
@keyframes instance-highlight {from {background: var(--accent); color: #fff; box-shadow: 0 0 0 4px var(--accent-soft)} to {background: var(--accent-soft); color: var(--accent); box-shadow: none}}
@keyframes instance-rise {from {transform: translateY(4px); opacity: .6} to {transform: translateY(0); opacity: 1}}
@media (prefers-reduced-motion: reduce) {*, *::before, *::after {animation: none !important; transition: none !important; scroll-behavior: auto !important}}
.app-shell {display: grid; grid-template-columns: var(--sidebar-width) minmax(0, 1fr); min-height: var(--viewport-height)}
.app-shell.with-rail {grid-template-columns: var(--sidebar-width) minmax(0, 1fr) var(--right-rail-width)}
.brand-mark {color: #77dec7; display: grid; place-items: center; width: 39px; height: 39px; margin-bottom: 39px}
.sidebar {position: sticky; top: 0; height: var(--viewport-height); background: var(--sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 0 15px; z-index: 20}
.sidebar-transition-wrap {display: flex; flex-direction: column; min-height: 0; flex: 1; width: 100%; position: relative}
.sidebar-transition-pane {display: flex; flex-direction: column; min-height: 0; flex: 1; width: 100%}
.sidebar-brand {height: 72px; flex-shrink: 0; padding: 24px 9px 0; display: flex; align-items: center; justify-content: space-between}
.brand-title {display: inline-flex; align-items: center; gap: 9px; font-size: 22px; font-weight: 750; letter-spacing: -.8px}
.brand-logo {width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0}
.instance-picker {position: relative; margin: 2px 0 26px; flex-shrink: 0}
.instance-switcher {display: flex; width: 100%; gap: 10px; align-items: center; text-align: left; padding: 12px 9px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: 9px}
.instance-switcher:hover, .instance-switcher[aria-expanded='true'] {border-color: var(--accent)}
.instance-icon {width: 31px; height: 34px; display: grid; place-items: center; color: var(--accent); background: var(--accent-soft); border-radius: 7px; flex-shrink: 0}
.instance-caption {flex: 1; min-width: 0}
.instance-caption small {font-size: 10px; color: var(--muted); display: block; margin-bottom: 3px}
.instance-caption strong {display: block; font-size: 13px; font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.instance-switcher > svg {color: var(--muted)}
.instance-menu {position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 40; padding: 5px; border: 1px solid var(--border); border-radius: 9px; background: var(--surface); box-shadow: 0 8px 30px #132b4826}
.instance-options {max-height: min(280px, 40dvh); overflow-y: auto}
.instance-menu button {display: flex; align-items: center; gap: 9px; padding: 11px 8px; width: 100%; text-align: left; border-radius: 5px}
.instance-menu button span {flex: 1; overflow-wrap: anywhere; min-width: 0}
.instance-menu button:hover, .instance-menu button:focus-visible, .instance-menu button[aria-checked='true'] {background: var(--accent-soft); color: var(--accent)}
.instance-menu .instance-create {justify-content: center; color: var(--accent); border-top: 1px solid var(--border); margin-top: 4px; border-radius: 0 0 5px 5px}
.sidebar-label {display: flex; align-items: center; justify-content: space-between; color: #97a4af; font-size: 10px; padding: 0 10px; letter-spacing: 1px; margin-bottom: 12px}
.sidebar-label button {padding: 0; color: #82929e; display: grid; place-items: center}
.sidebar-label > span {font: 10px "Segoe UI", sans-serif; letter-spacing: 0; background: var(--surface-muted); padding: 1px 5px; border-radius: 3px}
.primary-nav {position: relative; display: grid; gap: 4px; margin-bottom: 28px}
.primary-nav a {display: flex; align-items: center; gap: 11px; padding: 11px 12px; color: #768593; border-radius: 7px; font-size: 12px; font-weight: 500}
.primary-nav a:hover {background: var(--surface-muted)}
.primary-nav a.active {color: var(--accent); background: var(--accent-soft); font-weight: 600}
.nav-pill {margin-left: auto; font-size: 8px; background: var(--surface); border-radius: 4px; padding: 2px 5px; color: var(--accent)}
.nav-search {display: flex; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid var(--border); border-radius: 6px; color: #91a0ad; margin: 0 3px 12px}
.nav-search input {width: 100%; padding: 8px 0; background: none; border: 0; font-size: 11px; box-shadow: none}
.task-nav-container {position: relative; display: flex; flex-direction: column; min-height: 0; flex: 1}
.task-nav {overflow-y: auto; padding: 0 2px 15px; min-height: 0; flex: 1; display: flex; flex-direction: column; gap: 2px}
.task-group-button {display: flex; align-items: center; gap: 10px; padding: 10px 9px; width: 100%; text-align: left; border-radius: 7px; color: #71818e; font-size: 12px; font-weight: 500; background: none; border: 1px solid transparent; transition: all .15s ease; user-select: none}
.task-group-button:hover {background: var(--surface-muted); color: var(--text)}
.task-group-button.active {color: var(--accent); font-weight: 600}
.task-group-button.expanded {background: var(--accent-soft); color: var(--accent); border-color: #138b7830}
[data-theme='dark'] .task-group-button.expanded {border-color: #6bd4ba30}
.task-group-icon {flex-shrink: 0; color: inherit}
.task-group-title {flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.task-group-arrow {flex-shrink: 0; color: var(--muted); transition: transform .15s ease, color .15s ease}
.task-group-button:hover .task-group-arrow, .task-group-button.expanded .task-group-arrow {color: var(--accent); transform: translateX(2px)}
.task-submenu-flyout {position: fixed; width: 210px; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; box-shadow: 0 10px 30px #132b4822, 0 2px 8px #132b4810; padding: 6px; z-index: 100; height: auto; max-height: calc(var(--viewport-height) - 32px); overflow-y: auto; display: flex; flex-direction: column; gap: 2px; animation: submenu-flyout-in .15s cubic-bezier(0.16, 1, 0.3, 1)}
[data-theme='dark'] .task-submenu-flyout {box-shadow: 0 12px 35px #050b1260, 0 2px 10px #050b1240}
@media (min-width: 951px) {
  .task-submenu-flyout::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -22px;
    width: 22px;
  }
}
@keyframes submenu-flyout-in {from {opacity: 0; transform: translateX(-6px)} to {opacity: 1; transform: translateX(0)}}
.task-submenu-list {display: flex; flex-direction: column; gap: 2px}
.task-submenu-item {display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font-size: 11px; color: #728290; line-height: 1.4; transition: all .12s ease}
.task-submenu-item:hover {background: var(--surface-muted); color: var(--accent)}
.task-submenu-item.active {background: var(--accent-soft); color: var(--accent); font-weight: 600}
.task-submenu-dot {width: 5px; height: 5px; border-radius: 50%; background: #9aa7b2; flex-shrink: 0; transition: all .12s ease}
.task-submenu-item:hover .task-submenu-dot {background: var(--accent); transform: scale(1.2)}
.task-submenu-item.active .task-submenu-dot {background: var(--accent); box-shadow: 0 0 0 2px #138b7825}
.task-submenu-item-text {flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
/* 长标题灯带：放得下就沿用省略号截断，放不下才滚动，两份文案首尾相接。 */
.marquee-track {display: contents}
[data-marquee='on'] > .marquee-track {display: inline-flex; align-items: center; gap: var(--marquee-gap); animation: marquee-scroll var(--marquee-duration, 8s) linear infinite}
@keyframes marquee-scroll {from {transform: translateX(0)} to {transform: translateX(calc(-1 * var(--marquee-shift, 0px)))}}
/* 主题快捷切换：调色盘按钮的悬停判定区就是它本身的大小，悬停时向右展开主题浮窗。 */
.theme-quick-slot {--theme-quick-size: 24px; position: absolute; top: 100%; left: 0; z-index: 2; width: var(--theme-quick-size); height: var(--theme-quick-size)}
.theme-quick {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity .15s ease;
}
.theme-quick-slot:hover .theme-quick, .theme-quick-slot:has(:focus-visible) .theme-quick, .theme-quick:focus-visible {opacity: 1}
.theme-quick:hover {color: var(--accent); border-color: var(--accent)}
/* 浮窗挂在 body 上：侧栏是 z-index: 20 的层叠上下文，子元素超不出它。 */
.theme-quick-menu {
  position: fixed;
  z-index: 130;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 132px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  box-shadow: 0 10px 30px #132b481f;
  animation: theme-quick-in .15s ease;
}
@keyframes theme-quick-in {from {opacity: 0} to {opacity: 1}}
.theme-quick-menu button {
  display: block;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--muted);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.theme-quick-menu button:hover {background: var(--surface-muted); color: var(--accent)}
.theme-quick-menu button.active {background: var(--accent-soft); color: var(--accent); font-weight: 600}
/* 触屏没有悬停，按钮常显，点一下开合。 */
@media (hover: none) {.theme-quick {opacity: 1}}
.sidebar-footer {margin-top: auto; border-top: 1px solid var(--border); padding: 19px 9px; display: flex; align-items: center; gap: 10px; font-size: 10px}
.connection-dot {background: #d2ab67; width: 6px; height: 6px; border-radius: 50%}
.connection-dot.online {background: #40b594; box-shadow: 0 0 0 3px #40b59412}
.main-shell {min-width: 0; display: flex; flex-direction: column}
/* 桌面配置页只让内容列滚动，长参数列表不能把外壳和浏览器页面撑高。 */
@media (min-width: 951px) {
  .app-shell.task-config-shell:not(.legacy-shell) {height: var(--viewport-height); overflow: hidden}
  .app-shell.task-config-shell:not(.legacy-shell) .main-shell {min-height: 0}
  .app-shell.task-config-shell:not(.legacy-shell) .main-shell > main {min-height: 0; overflow-y: auto}
  .app-shell.task-config-shell:not(.legacy-shell) .group-nav {top: 16px}
}
.topbar {height: var(--topbar-height, 69px); border-bottom: none; display: flex; align-items: center; justify-content: space-between; padding: 0 31px; background: var(--surface); flex-shrink: 0}
.breadcrumb {font-size: 11px; color: var(--muted); display: flex; gap: 13px; align-items: center}
.breadcrumb span {color: #c5cdd4}
.breadcrumb strong {font-weight: 500; color: var(--text)}
.breadcrumb a {color: var(--muted); text-decoration: none; transition: color .15s}
.breadcrumb a:hover {color: var(--accent)}
.breadcrumb a strong {color: var(--text); font-weight: 500; transition: color .15s}
.breadcrumb a:hover strong {color: var(--accent)}
/* 顶栏模式开关：开着时所有实例铺成一行分页，关着时仍收在下拉里。 */
.topbar-mode-toggle {flex-shrink: 0}
.breadcrumb.with-tabs {min-width: 0; flex: 1}
.instance-tabs {display: flex; align-items: center; gap: 2px; min-width: 0; overflow-x: auto; scrollbar-width: none}
.instance-tabs::-webkit-scrollbar {display: none}
.instance-tab {display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid transparent; border-radius: 5px; background: transparent; color: var(--theme-muted); font-size: 11px; white-space: nowrap; cursor: pointer; transition: color .15s, background .15s, border-color .15s}
.instance-tab:hover {background: var(--theme-surface-muted); color: var(--theme-text)}
.instance-tab.current {background: var(--theme-accent-soft); border-color: var(--theme-accent); color: var(--theme-accent); animation: instance-tab-in .22s ease-out}
.instance-tab.running {color: var(--theme-success)}
.instance-tab.error {color: var(--theme-danger)}
.instance-tab-name {max-width: 9rem; overflow: hidden; text-overflow: ellipsis}
.instance-tab-icon {flex-shrink: 0}
.instance-tab.running .instance-tab-icon {animation: instance-tab-pulse 1.6s ease-in-out infinite}
.instance-tab.updating .instance-tab-icon {animation: instance-tab-spin 1.1s linear infinite}
.instance-tab-create {display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 22px; height: 22px; border-radius: 5px; background: transparent; color: var(--theme-muted); cursor: pointer}
.instance-tab-create:hover {background: var(--theme-surface-muted); color: var(--theme-accent)}
@keyframes instance-tab-in {from {opacity: .4; transform: scale(.94)} to {opacity: 1; transform: none}}
@keyframes instance-tab-pulse {0%, 100% {opacity: 1} 50% {opacity: .35}}
@keyframes instance-tab-spin {to {transform: rotate(360deg)}}
/* 动效只是强化：关掉后状态仍靠图标形状与颜色区分。 */
@media (prefers-reduced-motion: reduce) {
  .instance-tab.current, .instance-tab.running .instance-tab-icon, .instance-tab.updating .instance-tab-icon {animation: none}
}
@media (max-width: 950px) {
  .instance-tab-name {max-width: 5rem}
}
.topbar-right {display: flex; align-items: center; gap: 20px; color: var(--muted); font-size: 10px}
.connection-label {display: flex; align-items: center; gap: 6px; color: var(--accent)}
.topbar-divider {width: 1px; height: 14px; background: var(--border)}
main {padding: 32px 32px 16px; flex: 1}
.page-title {display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 26px}
.page-title h1 {font-size: 34px; font-weight: 700; letter-spacing: -.9px; line-height: 1.25}
.title-actions {display: flex; gap: 10px; flex-wrap: wrap}
.connection-banner {padding: 10px 32px; display: flex; gap: 9px; align-items: center; background: #fbf2db; color: #8f6d25; font-size: 11px}
.right-rail {position: sticky; top: 0; height: var(--viewport-height); min-width: 0; display: flex; flex-direction: column; background: var(--surface); border-left: 1px solid var(--border); z-index: 18; overflow: hidden}
.right-rail-header {height: 72px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 0}
.right-rail-header > div {min-width: 0}
.right-rail-header strong {display: block; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px}
.right-rail-eyebrow {display: block; color: var(--muted); font-size: 9px; letter-spacing: .9px; text-transform: uppercase}
.scheduler-widget {flex-shrink: 0; margin: 14px 14px 12px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface-muted)}
.scheduler-widget-heading, .scheduler-widget-heading > div, .rail-section-heading, .rail-section-heading > div {display: flex; align-items: center}
.scheduler-widget-heading {justify-content: space-between; gap: 10px; margin-bottom: 13px}
.scheduler-widget-heading > div {gap: 7px; font-size: 12px; font-weight: 650}
.scheduler-status {display: inline-flex; align-items: center; gap: 5px; font-size: 9px; color: var(--muted)}
.scheduler-status.running {color: var(--text)}
.scheduler-stats {display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px}
.scheduler-stats > div {padding: 9px 8px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border)}
.scheduler-stats span {display: block; margin-bottom: 3px; color: var(--muted); font-size: 9px}
.scheduler-stats strong {font-size: 15px; font-variant-numeric: tabular-nums}
.scheduler-toggle {width: 100%; justify-content: center; min-height: 36px}
.rail-schedule {flex: 1; min-height: 0; display: flex; flex-direction: column; border-top: 1px solid var(--border); padding: 12px 14px 10px}
.rail-section-heading {justify-content: space-between; gap: 8px; margin-bottom: 8px; color: var(--muted); font-size: 10px}
.rail-section-heading > div {gap: 7px; color: var(--text); font-weight: 600}
.rail-section-heading > span {min-width: 20px; padding: 1px 6px; text-align: center; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-muted); font-size: 9px}
.rail-task-list {flex: 1; min-height: 0; overflow-y: auto}
.rail-task-item {display: grid; grid-template-columns: minmax(0, 1fr) auto 13px; gap: 8px; align-items: center; min-height: 46px; padding: 8px 4px; border-bottom: 1px solid var(--border)}
.rail-task-item:last-child {border-bottom: 0}
.rail-task-item:hover {color: var(--text)}
.rail-task-item > div {min-width: 0}
.rail-task-item strong, .rail-task-item small {display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.rail-task-item strong {font-size: 10px; font-weight: 600}
.rail-task-item small {margin-top: 2px; color: var(--muted); font-size: 9px}
.rail-task-item .task-state {font-size: 9px; white-space: nowrap}
.rail-empty {padding: 18px 8px; color: var(--muted); font-size: 10px; text-align: center}
.mobile-toggle, .mobile-close, .mobile-rail-toggle, .mobile-rail-close {display: none !important}
.login-page {min-height: var(--viewport-height); display: grid; grid-template-columns: 1fr 1fr; background: var(--surface)}
.login-art {background: #142d3a; color: #72c6b4; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 60px; position: relative; overflow: hidden}

.login-art > span {font-size: 15px; letter-spacing: 4px; color: #bdd2d8}
.login-card {width: 360px; max-width: calc(100% - 40px); margin: auto; display: flex; flex-direction: column; gap: 18px}
.login-card .brand-mark {background: var(--navy); border-radius: 10px; margin-bottom: 20px; width: 48px; height: 48px}
.login-card h1 {font-size: 27px}
.login-card p {margin-bottom: 20px}
.login-card small {color: var(--muted); line-height: 1.8}
.welcome {padding: 110px 20px; display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center}
.welcome > svg {color: var(--accent); margin-bottom: 10px}
.welcome p {color: var(--muted)}
@media (min-width: 2000px) {main {padding: 40px 44px 20px}.page-title {margin-bottom: 32px}.page-title h1 {font-size: 38px}}
@media (max-width: 1562.5px) {:root {--sidebar-width: 194px; --right-rail-width: 292px}main {padding: 25px 24px 15px}.topbar {padding: 0 24px}.sidebar {padding: 0 11px}.resource-value {font-size: 23px !important}.page-title h1 {font-size: 29px}}
@media (max-width: 1275px) {.overview-grid {grid-template-columns: 1fr !important}.preview-screen {max-height: 360px}.page-title {align-items: flex-start}.title-actions {justify-content: flex-end}.config-layout {grid-template-columns: 1fr !important}.config-layout .group-nav {display: none !important}.resource-grid {gap: 7px !important}.resource-card {padding: 8px 14px 7px !important}.resource-foot {font-size: 8px !important}}
@media (max-width: 950px) {.app-shell {display: block}.sidebar {position: fixed; width: 220px; left: -230px; transition: left .2s; box-shadow: 20px 0 60px #10243730}.mobile-open .sidebar {left: 0}.right-rail {position: fixed; top: 0; right: calc(-1 * min(360px, 92vw)); width: min(360px, 92vw); height: var(--viewport-height); transition: right .2s; box-shadow: -20px 0 60px #10243730; z-index: 30}.rail-open .right-rail {right: 0}.mobile-toggle, .mobile-close, .mobile-rail-toggle, .mobile-rail-close {display: inline-flex !important}.sidebar-brand {height: var(--topbar-height, 58px); padding: 0; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 6px}.sidebar-brand-left {display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1}.sidebar-brand .brand-title {font-size: 16px; gap: 6px; min-width: 0; letter-spacing: -.3px}.sidebar-brand .brand-title .brand-logo {width: 22px; height: 22px; flex-shrink: 0}.sidebar-brand .brand-title span {overflow: hidden; text-overflow: ellipsis; white-space: nowrap}.update-notice.sidebar-update-notice {padding: 2px 6px; font-size: 10px; flex-shrink: 0}.sidebar-brand .mobile-close {position: static; margin-left: auto; flex-shrink: 0; width: 30px; height: 30px}.topbar {height: 58px; padding: 0 15px; gap: 12px}.breadcrumb {margin-right: auto; font-size: 10px; gap: 7px}.topbar-right .version, .topbar-divider {display: none}main {padding: 24px 17px 12px}.page-title {flex-wrap: wrap; gap: 17px}.page-title h1 {font-size: 26px}.title-actions {justify-content: flex-start}.resource-grid {grid-template-columns: 1fr 1fr !important}.field-row {flex-wrap: wrap; gap: 16px !important}.field-label {min-width: 100% !important}.field-control {width: 100% !important}.panel-heading {padding: 16px !important}.login-page {grid-template-columns: 1fr}.login-art {display: none}.config-toolbar > span {display: none}.task-row {grid-template-columns: 22px 1fr 50px 80px 10px !important}.log-filters {flex-wrap: wrap}.chart-metrics strong {font-size: 22px !important}.panel-heading > div {gap: 8px !important}.task-submenu-flyout {width: min(200px, calc(100vw - 235px)); box-shadow: 0 10px 30px #0c1c2e40}}
@media (max-width: 480px) {.task-submenu-flyout {left: 8px; right: 8px; width: auto; top: auto !important; bottom: 12px; max-height: 60vh; box-shadow: 0 10px 40px #00000050}}
.button {height: 37px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 7px; font-size: 11px; font-weight: 550; padding: 0 15px; white-space: nowrap; border: 1px solid transparent; transition: background-color var(--dur-2) var(--ease-standard), color var(--dur-2) var(--ease-standard), border-color var(--dur-2) var(--ease-standard), box-shadow var(--dur-2) var(--ease-standard), transform var(--dur-1) var(--ease-standard)}
.button.primary {background: var(--accent); color: white; box-shadow: 0 3px 7px #118b7820}
.button.primary:hover:not(:disabled) {background: var(--accent-hover); transform: translateY(-1px)}
[data-theme='dark'] .button.primary {color: #102d29}
.button.secondary {background: var(--surface); border-color: var(--border); color: #6c7d8b}
.button.secondary:hover {border-color: #b6c7c5; color: var(--accent)}
.button.danger {background: #bb5259; color: white}
.button.danger.subtle {background: #bd555510; color: var(--red); border-color: #bd555525}
/* 删除实例的三次确认：每档抖动幅度递增，末档转强调红，明示这一步不可逆。 */
.tab-delete-confirm.armed {animation: delete-nudge .22s ease-in-out}
.tab-delete-confirm.danger {animation: delete-shake .3s ease-in-out; color: var(--red)}
.tab-delete-confirm.execute {animation: delete-lurch .4s ease-in-out; background: var(--red); color: #fff}
@keyframes delete-nudge {0%, 100% {transform: translateX(0)} 25% {transform: translateX(-2px)} 75% {transform: translateX(2px)}}
@keyframes delete-shake {0%, 100% {transform: translateX(0)} 20% {transform: translateX(-5px)} 40% {transform: translateX(5px)} 60% {transform: translateX(-3px)} 80% {transform: translateX(3px)}}
@keyframes delete-lurch {0%, 100% {transform: translateX(0)} 15% {transform: translateX(-9px)} 30% {transform: translateX(9px)} 45% {transform: translateX(-6px)} 60% {transform: translateX(6px)} 80% {transform: translateX(-2px)}}
@media (prefers-reduced-motion: reduce) {.tab-delete-confirm.armed, .tab-delete-confirm.danger, .tab-delete-confirm.execute {animation: none}}
.icon-button {display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; color: var(--muted); border-radius: 5px; transition: background-color var(--dur-2) var(--ease-standard), color var(--dur-2) var(--ease-standard), transform var(--dur-1) var(--ease-standard)}
.icon-button:hover {background: var(--surface-muted); color: var(--accent)}
.text-button {display: inline-flex; gap: 6px; align-items: center; color: var(--accent); font-size: 10px; padding: 5px; transition: color var(--dur-2) var(--ease-standard), transform var(--dur-1) var(--ease-standard)}
.panel {background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden}
.panel-heading {padding: 19px 21px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--border)}
.panel-heading > div {display: flex; align-items: center; gap: 10px}
.panel-heading > div > svg {color: #8596a3}
.status {font-size: 10px; border-radius: 5px; display: inline-flex; gap: 5px; align-items: center; padding: 4px 7px; font-weight: 450; white-space: nowrap}
.status i, .tiny-dot {width: 5px; height: 5px; border-radius: 50%; display: inline-block; background: currentColor; flex-shrink: 0}
.status.running {background: var(--accent-soft); color: var(--accent)}
.status.stopped {background: #e7edf350; color: #899baa}
.status.error {background: #c95e6212; color: var(--red)}
.status.updating {background: #d9b25a16; color: #b2954a}
.tiny-dot.teal {color: #269a81}
.resource-grid {display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px}
.resource-card {padding: 9px 16px 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); box-shadow: var(--shadow)}
.resource-heading {display: flex; justify-content: space-between; align-items: center; color: #81919c; font-size: 10px; margin-bottom: 3px}
.resource-heading > div {border-radius: 8px; width: 32px; height: 32px; display: grid; place-items: center; background: #eaf5fa; color: #6d9cbb}
.resource-heading > div.resource-image-wrap {width:26px;height:26px;background:transparent !important;color:inherit;overflow:visible}
.resource-icon-image {display:block;width:24px;height:24px;max-width:100%;max-height:100%;object-fit:contain}
.resource-1 .resource-heading > div {background: #faf4e8; color: #c6a45b}
.resource-2 .resource-heading > div {background: #eef0fb; color: #8b91bc}
.resource-3 .resource-heading > div {background: #e9f6f3; color: #63a58f}
[data-theme='dark'] .resource-heading > div {background: #ffffff08}
.resource-value {font-size: 24px; line-height: 1.05; letter-spacing: -.7px; font-weight: 600; font-variant-numeric: tabular-nums; min-height: 25px}
.resource-value small {color: #9daab3; font-size: 10px; font-weight: 400; margin-left: 5px; letter-spacing: 0}
.resource-value-content {display: inline-flex; align-items: baseline; gap: .22em; width: max-content; white-space: nowrap; letter-spacing: -.03em}
.resource-value-content small {font-size: .435em; margin-left: 0}
.resource-foot {display: flex; align-items: center; gap: 5px; color: #a0adb7; font-size: 8px; margin-top: 5px; border-top: 1px solid var(--border); padding-top: 5px}
.resource-foot > svg {margin-left: auto; color: #b9c5cc}
.overview-grid {display: grid; grid-template-columns: minmax(260px, .45fr) minmax(0, 1.55fr); gap: 21px; margin-bottom: 22px; align-items: stretch}
.count-badge {font-size: 9px; padding: 1px 5px; color: #8d9daa; background: var(--surface-muted); border: 1px solid var(--border); border-radius: 4px}
.schedule-summary {display: flex; align-items: center; gap: 18px; padding: 15px 21px; font-size: 10px; color: var(--muted); background: var(--surface-muted); border-bottom: 1px solid var(--border)}
.schedule-summary > div {display: flex; align-items: center; gap: 6px}
.schedule-summary strong {font-weight: 500; color: var(--text)}
.schedule-summary > span {margin-left: auto; font-size: 9px}
.task-table {padding: 0 19px; max-height: 327px; overflow-y: auto}
.task-row {display: grid; grid-template-columns: 22px minmax(70px, 1fr) 49px 83px 10px; align-items: center; gap: 9px; padding: 13px 0; border-bottom: 1px solid var(--border); font-size: 11px}
.task-row:last-child {border-bottom: 0}
.task-row:hover .task-row-name strong {color: var(--accent)}
.task-order {font-size: 9px; color: #abb7c1; font-variant-numeric: tabular-nums}
.task-row-name strong {font-size: 14px; font-weight: 600; line-height: 1.4}
.task-state {font-size: 8px; color: #93a3b0; display: block; background: var(--surface-muted); text-align: center; border-radius: 3px; padding: 3px}
.task-state.pending {color: var(--accent); background: var(--accent-soft)}
.task-row time {font-size: 9px; text-align: right; font-variant-numeric: tabular-nums; color: #94a4b1}
.task-row > svg {color: #b0bdc6}
.preview-panel {display: flex; flex-direction: column}
.checkbox-label {display: inline-flex; align-items: center; gap: 5px; color: var(--muted); font-size: 10px; cursor: pointer}
.preview-screen {background: var(--theme-preview-bg); margin: 16px 16px 0; aspect-ratio: 16/9; min-height: 196px; position: relative; border-radius: 7px; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #adc3cc; flex: 1}
.preview-screen > img {width: 100%; height: 100%; object-fit: contain; position: absolute; inset: 0}
.preview-screen > strong {margin-top: 10px; font-size: 12px; font-weight: 450; z-index: 1}
.preview-screen > span {font-size: 9px; color: #718c99; margin-top: 8px; z-index: 1}
.preview-screen > .preview-resolution {font-size: 7px; letter-spacing: 2px; position: absolute; bottom: 14px; color: #547582}
.radar {width: 98px; height: 98px; display: grid; place-items: center; color: #729f9d; position: relative; margin-top: -12px}
.radar > div {position: absolute; width: 98px; height: 98px; border: 1px solid #b5f9e415; border-radius: 50%}
.radar > div:nth-child(2) {width: 150px; height: 150px; border-color: #b5f9e409}
.radar::before, .radar::after {content: ''; position: absolute; width: 194px; height: 1px; background: #b5f9e407}
.radar::after {transform: rotate(90deg)}
.preview-toolbar {padding: 13px 18px 15px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: var(--muted)}
.preview-toolbar > span {display: flex; gap: 6px; align-items: center}
.preview-error {padding: 9px 18px 0; color: var(--red); font-size: 10px; line-height: 1.7}
.live-label {font-size: 8px; letter-spacing: .5px; display: flex; align-items: center; gap: 5px; color: #7c9d91; border: 1px solid #65b89922; border-radius: 4px; padding: 3px 6px}
.live-label i {width: 4px; height: 4px; border-radius: 50%; background: #6aba9e}
.log-panel {display: flex; flex-direction: column}
.log-panel .panel-heading {padding-top: 14px; padding-bottom: 14px; flex-shrink: 0}
.log-content {background: var(--surface-muted); padding: 13px 17px; height: 62vh; min-height: 220px; overflow: auto; font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Courier New", monospace); font-size: 11px; line-height: 1.6; color: var(--text)}
.compact .log-content {height: 178px; min-height: 0}
.log-entry-line {display: flex; gap: 8px; padding: 2px 0; white-space: pre-wrap; word-break: break-all}
.log-entry-line.log-raw {display: block}
.log-lvl {font-weight: 600; min-width: 60px; flex-shrink: 0}
.lvl-debug {color: #85929e}
.lvl-info {color: #0ea5e9}
.lvl-warning {color: #eab308}
.lvl-error {color: #ef4444}
.lvl-critical {color: #f43f5e; font-weight: 700}
.log-ts {color: #06b6d4; flex-shrink: 0}
.log-divider {color: var(--border); user-select: none; flex-shrink: 0}
.log-msg {flex: 1; min-width: 0}
.log-rule {display: flex; align-items: center; gap: 12px; margin: 8px 0; color: var(--muted); font-size: 11px}
.log-rule .rule-bar {flex: 1; height: 1px; background: currentColor; opacity: .35}
.log-rule.rule-double .rule-bar {height: 2px; border-top: 1px solid currentColor; border-bottom: 1px solid currentColor; background: transparent; opacity: .45}
.log-rule .rule-title {font-weight: 700; color: var(--text); padding: 0 4px; letter-spacing: .5px}
.log-line.log-center-title {display: flex; justify-content: center; align-items: center; padding: 3px 0; text-align: center}
.log-line.log-center-title .center-title-text {font-weight: 700; color: var(--text); padding: 0 4px; letter-spacing: .5px; font-size: 11px}
.hl-bool-true {color: #22c55e; font-style: italic; font-weight: 550}
.hl-bool-false {color: #ef4444; font-style: italic; font-weight: 550}
.hl-none {color: #d946ef; font-style: italic}
.hl-brace {font-weight: 700; color: var(--text)}
.hl-path {color: #a855f7}
.hl-time {color: #06b6d4}
.hl-attr {color: #14b8a6; font-weight: 550}
.hl-title {font-weight: 700; color: var(--accent)}
.log-search-match {background: #fbbf2445; color: inherit; border-radius: 2px; padding: 0 1px}
.log-filters {display: flex; align-items: center; gap: 12px; padding: 14px 20px; font-size: 11px; color: var(--muted); flex-shrink: 0}
.log-filters .input-icon {flex: 1}
.empty {flex: 0 1 auto; min-height: 160px; padding: 35px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--muted); gap: 12px; text-align: center; line-height: 1.8; font-family: "Segoe UI", "Microsoft YaHei", sans-serif; font-size: 11px}
.empty > svg {color: #a7b9c1; margin-bottom: 3px}
.empty strong {font-weight: 500; font-size: 12px; color: #8398a5}
.loading {min-height: 230px; display: flex; gap: 10px; align-items: center; justify-content: center; color: var(--muted)}
.error-box {display: flex; gap: 10px; align-items: center; padding: 14px 17px; border: 1px solid #d7767520; background: #d7767510; border-radius: 8px; margin-bottom: 16px; color: var(--red); font-size: 12px; line-height: 1.7}
.error-box button {margin-left: auto; text-decoration: underline; white-space: nowrap}
.toast {position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 100; max-width: 90vw; padding: 14px 23px; border-radius: 9px; color: white; background: #1c7466; box-shadow: 0 5px 25px #102b4e30; font-size: 12px}
.toast.error {background: #a45159}
.modal {background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 14px; padding: 24px; width: 440px; max-width: calc(100vw / var(--ui-scale) - 30px); box-shadow: 0 20px 80px #132b4830}
.modal::backdrop {background: #1323301a}
.modal .panel-heading {padding: 0 0 17px; margin-bottom: 18px}
.modal > p {line-height: 1.9; margin-bottom: 20px; color: var(--muted)}
.form-stack {display: flex; flex-direction: column; gap: 19px}
.form-stack label {display: flex; flex-direction: column; gap: 9px; font-size: 12px}
.form-stack p {font-size: 12px; line-height: 1.8}
.toggle {background: #cdd7de; width: 34px; height: 20px; border-radius: 12px; padding: 3px; display: inline-flex; align-items: center; flex-shrink: 0; transition: background .2s}
.toggle > span {display: block; width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px #0002; transition: transform .2s}
.toggle.on {background: var(--accent)}
.toggle.on > span {transform: translateX(14px)}
.input-icon {display: flex; align-items: center; padding: 0 11px; gap: 8px; border: 1px solid var(--border); border-radius: 7px; color: #98a7b2; background: var(--surface)}
.input-icon > input {border: 0; background: transparent; box-shadow: none; flex: 1; width: 100%; padding-left: 0; font-size: 11px}
.config-toolbar {display: flex; gap: 16px; align-items: center; margin-bottom: 22px; font-size: 10px; color: var(--muted)}
.config-toolbar .input-icon {flex: 1; max-width: 440px}
.config-toolbar > span {display: flex; align-items: center; gap: 7px}
.config-toolbar > button {margin-left: auto}
.tool-log-panel {margin-top: 22px}
.tool-log-panel .panel-heading {padding-bottom: 13px}
.config-layout {display: grid; grid-template-columns: 145px minmax(0, 1fr); gap: 22px; align-items: start}
.group-nav {position: sticky; top: calc(var(--topbar-height, 69px) + 16px); display: flex; flex-direction: column; border-left: 1px solid var(--border); padding-left: 8px; font-size: 11px; max-height: calc(var(--viewport-height) - var(--topbar-height, 69px) - 32px); overflow-y: auto}
.group-nav a {padding: 10px; color: var(--muted); border-radius: 5px; line-height: 1.7}
.group-nav a:hover {color: var(--accent); background: var(--accent-soft)}
.config-group {margin-bottom: 19px; scroll-margin-top: calc(var(--topbar-height, 69px) + 16px)}
.group-indicator {width: 4px; height: 15px; border-radius: 3px; background: #74bda8}
.field-row {padding: 19px 22px; display: flex; align-items: center; justify-content: space-between; gap: 25px; border-bottom: 1px solid var(--border)}
.field-row:last-child {border-bottom: 0}
.field-label {flex: 1; min-width: 120px}
.field-label label, .field-label .field-name {font-size: 14px; font-weight: 550; line-height: 1.7}
.field-label label > span {margin-left: 6px}
.field-label p {font-size: 12px; color: var(--muted); line-height: 1.9; white-space: pre-line; overflow-wrap: anywhere; margin-top: 5px}
.field-control {width: 260px; flex-shrink: 0; text-align: right}
.field-control > input, .field-control > select, .field-control > textarea {width: 100%; font-size: 13px}
.field-control textarea {resize: none; overflow-y: hidden; min-height: 0; line-height: 1.9}
.field-actions {display: flex; justify-content: flex-end; margin-top: 7px}
/* 控件行内带动作按钮时：整行改成 flex，输入框在前、按钮在后。 */
.field-control:has(> .field-actions) {display: flex; align-items: center; gap: 7px}
.field-control > .field-actions {margin-top: 0; flex-shrink: 0}
/* 保存状态占原按钮那个位子（输入框左侧），脱流所以不挤输入框、也不推按钮。
   那个位子比文案窄，超出就省略，全文看 title；flex-wrap 要显式关掉，否则图标与文字会折成两行。 */
.field-control:has(> .edit-status) {position: relative}
.field-control > .edit-status {position: absolute; right: 100%; top: 50%; transform: translateY(-50%); order: 0; margin: 0 7px 0 0; max-width: 160px; padding: 0; flex-wrap: nowrap; white-space: nowrap; overflow: hidden; text-overflow: ellipsis}
.field-control > .edit-status > .edit-status-text {overflow: hidden; text-overflow: ellipsis}
/* 纯图标按钮：宽度收成与自身高度相等，不靠固定尺寸。 */
.field-control > .field-actions .icon-only {aspect-ratio: 1; padding: 0; gap: 0}
/* 按下「立刻运行」时按钮回弹一下；颜色取自各主题的 accent，形状对各主题都成立。 */
@keyframes run-button-press {40% {transform: scale(.88)} 100% {transform: none}}
.field-control > .field-actions .icon-only:active:not(:disabled) {animation: run-button-press .2s ease-out}
.settings-notice {font-size: 11px; color: var(--muted); line-height: 1.9; margin: 24px 0 16px}
.panel-note {font-size: 10px; color: var(--muted); padding: 13px 20px; border-top: 1px solid var(--border)}
.chart-panel .empty {height: 350px}
.chart-panel select {font-size: 11px; padding: 7px 10px}
.chart-metrics {padding: 27px 30px 15px; display: flex; gap: 60px}
.chart-metrics span {display: block; font-size: 11px; color: var(--muted); margin-bottom: 10px}
.chart-metrics strong {font-size: 27px; font-weight: 550; letter-spacing: -.5px}
.resource-chart {width: calc(100% - 30px); margin: 15px; overflow: visible}
.resource-chart text {fill: var(--muted); font-size: 10px; font-family: "Segoe UI", sans-serif}
.data-table {padding: 18px 25px; border-top: 1px solid var(--border); font-size: 11px}
.data-table summary {cursor: pointer; color: var(--accent); margin-bottom: 15px}
.data-table table {width: 100%; border-collapse: collapse}
.data-table th, .data-table td {padding: 10px; text-align: left; border-bottom: 1px solid var(--border)}
.data-table p {color: var(--muted); margin: 14px 0}
.fleet-data {padding: 25px}.fleet-data pre {white-space: pre-wrap; line-height: 2; overflow-wrap: anywhere}
.multi-options {display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end}
.multi-options label {display: flex; gap: 5px; align-items: center; font-size: 11px}
.fleet-grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px}
.fleet-column {padding: 18px 22px; border-bottom: 1px solid var(--border)}
.fleet-column h3 {font-size: 10px; color: var(--muted); font-weight: 500; margin-bottom: 13px}
.fleet-column > div {display: flex; justify-content: space-between; padding: 9px 0; font-size: 12px}
.fleet-column small, .fleet-column p {font-size: 10px; color: var(--muted)}
.config-group .panel-heading h2 {font-size: 16px}
.config-group .small-label, .group-nav {font-size: 12px}
.config-groups {min-width: 0}
.field-row-multiline {flex-direction: column; align-items: stretch; gap: 13px}
.field-row-multiline .field-control {width: 100%; min-width: 0; text-align: left}
/* 控件占满整行时，提示浮在标题行右上角：进流会触发换行撑高整行，把输入框顶下去。 */
.field-row-multiline .field-label {position: relative}
/* 提示浮在标题行右上角：它进了流就会触发换行、把整行撑高，输入框跟着往下走。 */
.field-row-multiline .field-label > .edit-status {position: absolute; top: 0; right: 0; margin: 0; max-width: 100px; transform: none; text-align: right}
@media (max-width: 950px) {
  /* 窄屏下所有控件都撑满整行，同样要给提示腾一行。 */
  .field-control:has(> .edit-status) {position: static; display: flex; flex-direction: column; align-items: flex-start; gap: 6px}
  .field-control > .edit-status {position: static; order: -1; margin: 0; max-width: 100%; transform: none}
}
.field-row-multiline textarea {padding: 10px 14px; background: var(--surface-muted); font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace)}
.yaml-editor {border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--surface-muted); text-align: left}
.yaml-editor:focus-within {border-color: var(--accent)}
.editor-heading {padding: 8px 14px; border-bottom: 1px solid var(--border); color: var(--muted); font-size: 11px; letter-spacing: 1px}
.yaml-editor .cm-editor {background: var(--surface-muted); color: var(--text); outline: none; font-size: 13px}
.yaml-editor .cm-scroller {max-height: 480px; overflow: auto; font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); line-height: 1.9}
.yaml-editor .cm-content {padding: 12px 0; caret-color: var(--text)}
.yaml-editor .cm-line {padding: 0 14px}
.yaml-editor .cm-gutters {background: var(--surface-muted); color: var(--muted); border-right: 1px solid var(--border)}
.yaml-editor .cm-activeLine {background: var(--accent-soft)}
.yaml-editor .cm-cursor {border-left-color: var(--text)}
.yaml-editor.is-disabled {opacity: .65}
.restricted-lua-editor .editor-heading {letter-spacing: 0}
.restricted-lua-actions {display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--border)}
.restricted-lua-status {display: flex; flex-wrap: wrap; gap: 7px; padding: 0 14px 10px; color: var(--muted); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere}
.restricted-lua-status.is-error {color: var(--red)}
.restricted-lua-diagnostics {display: grid; gap: 6px; margin: 0; padding: 0 14px 12px; list-style: none}
.restricted-lua-diagnostics li {display: grid; grid-template-columns: 14px auto minmax(0, 1fr); align-items: start; gap: 7px; color: var(--muted); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere}
.restricted-lua-diagnostics li.is-error {color: var(--red)}
.restricted-lua-diagnostics li.is-warning {color: var(--theme-warning, #a56d16)}
.restricted-lua-diagnostics strong {font-weight: 500}
.shop-strategy-help {border-top: 1px solid var(--border)}
.shop-strategy-help details {border-bottom: 1px solid var(--border)}
.shop-strategy-help summary {display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 20px; color: var(--text); cursor: pointer; font-size: 13px; font-weight: 600; list-style: none}
.shop-strategy-help summary::-webkit-details-marker {display: none}
.shop-strategy-help summary::after {content: '+'; margin-left: auto; color: var(--muted); font-size: 18px; font-weight: 400}
.shop-strategy-help details[open] summary::after {content: '−'}
.shop-strategy-help-body {display: grid; gap: 14px; padding: 4px 20px 20px; color: var(--muted); font-size: 13px; line-height: 1.75}
.shop-strategy-help-body > * {margin: 0}
.shop-strategy-help-body h3 {color: var(--text); font-size: 14px; font-weight: 600}
.shop-strategy-help-body ul {display: grid; gap: 6px; padding-left: 20px}
.shop-strategy-help-body code, .shop-strategy-help-body pre {font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace)}
.shop-strategy-help-body pre {max-width: 100%; padding: 12px 14px; overflow: auto; border: 1px solid var(--border); border-radius: 6px; background: var(--surface-muted); color: var(--text); font-size: 12px; line-height: 1.7; white-space: pre}
.shop-strategy-api {display: grid; gap: 8px}
.shop-strategy-api > div {display: grid; grid-template-columns: minmax(250px, 1fr) minmax(0, 1fr); gap: 14px; align-items: baseline}
.shop-strategy-api dt {color: var(--text); overflow-wrap: anywhere}
.shop-strategy-api dd {margin: 0}
.shop-strategy-table-wrap {max-width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: 6px}
.shop-strategy-table-wrap table {width: 100%; min-width: 650px; border-collapse: collapse; color: var(--muted); font-size: 12px}
.shop-strategy-table-wrap th, .shop-strategy-table-wrap td {padding: 9px 11px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; overflow-wrap: anywhere}
.shop-strategy-table-wrap th {color: var(--text); font-weight: 600; background: var(--surface-muted)}
.shop-strategy-table-wrap tr:last-child td {border-bottom: 0}
.shop-strategy-table-wrap .is-current td {background: var(--accent-soft); color: var(--text)}
.shop-strategy-current {color: var(--text)}
@media (max-width: 700px) {.shop-strategy-help summary, .shop-strategy-help-body {padding-left: 14px; padding-right: 14px}.shop-strategy-api > div {grid-template-columns: 1fr; gap: 2px}.shop-strategy-help-body pre {font-size: 11px}}
.storage-field {display: grid; gap: 12px}
.storage-field pre {margin: 0; padding: 12px 14px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-muted); font: 13px/1.9 var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); white-space: pre-wrap; overflow-wrap: anywhere; max-height: 480px; overflow-y: auto}
.storage-field .button {justify-self: start}
.edit-status { margin-top: 6px; font-size: 12px; color: var(--muted); }
.edit-error { color: var(--red); }
.remote-address {display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 18px 21px}
.remote-address code {flex: 1 1 260px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-muted); font: 13px/1.7 var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); overflow-wrap: anywhere; user-select: all}
.remote-hint {margin: 0; padding: 0 21px 16px; font-size: 12px}
.remote-badge {padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 550; white-space: nowrap}
.remote-badge-ready {background: #269a8120; color: #269a81}
.remote-badge-starting {background: #b8860b20; color: #a97b0a}
.remote-badge-failed {background: #bd555520; color: var(--red)}
.remote-badge-disabled {background: var(--surface-muted); color: var(--muted)}

/* 配置管理：一行一份配置，右侧依次是状态徽章与操作按钮。 */
.config-list {display: grid; gap: 12px}
.config-row {display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 16px; padding: 18px 22px}
.config-row-main {min-width: 0}
.config-row-main h3 {font-size: 16px; font-weight: 650; overflow-wrap: anywhere}
.config-row-meta {display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; color: var(--muted); font-size: 12px}
.config-row-actions {display: flex; flex-wrap: wrap; gap: 8px}
@media (max-width: 950px) {
  .config-row {grid-template-columns: minmax(0, 1fr); gap: 12px}
  .config-row-actions .button {flex: 1 1 auto; justify-content: center}
}

/* 指挥喵评分报告：面板、每只猫的卡片、档位徽章、天赋标签与评分口径区块。 */
.meow-panel {margin-bottom: 22px}
/* 旧版版式的设置列是固定高度的 flex 滚动容器，面板不能被压缩，否则卡片正文会被裁掉。 */
.task-config-legacy .meow-panel {margin-bottom: 0; flex: 0 0 auto}
.meow-panel .panel-heading {flex-wrap: wrap; gap: 12px}
.meow-panel-actions {flex-wrap: wrap; justify-content: flex-end}
.meow-summary {font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums}
.meow-body {padding: 18px 21px}
.meow-body .error-box, .meow-body .empty {margin-bottom: 0}
.meow-cats {display: grid; gap: 14px; padding: 16px 18px}
.meow-card {border: 1px solid var(--border); border-radius: 10px; background: var(--surface); overflow: hidden}
.meow-card > .panel-heading {padding: 13px 16px}
.meow-card > .panel-heading h2 {font-size: 16px; font-weight: 600; margin: 0}
.meow-card > .panel-heading > div:first-child {flex-wrap: wrap; gap: 7px}
.meow-card-score {display: flex; align-items: center; gap: 12px; flex-shrink: 0}
.meow-tag {font-size: 9px; padding: 2px 7px; border-radius: 5px; background: var(--surface-muted); color: #7b8b98; font-weight: 400}
.meow-flag {font-size: 9px; padding: 2px 7px; border-radius: 5px; border: 1px solid var(--border); color: var(--muted); font-weight: 400}
.meow-flag.is-maxed {border-color: #d9b25a55; background: #d9b25a14; color: #a8811f}
.meow-flag.is-fixed {border-color: #3b82f655; background: #3b82f614; color: #2f74d0}
.meow-flag.is-level {border-color: color-mix(in srgb, var(--accent) 35%, transparent); color: var(--accent); font-variant-numeric: tabular-nums}
.meow-tier {display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 600; white-space: nowrap; background: var(--surface-muted); color: var(--muted)}
.meow-tier.is-perfect {background: #d9b25a22; color: #a8811f}
.meow-tier.is-near {background: #3b82f61a; color: #2f74d0}
.meow-tier.is-graduate {background: #269a8120; color: #1f8a73}
.meow-tier.is-transition {background: #8b5cf61a; color: #7451d8}
.meow-tier.is-snack {background: #94a3b81f; color: #6b7a8d}
.meow-tier.is-unsuitable {background: #bd555518; color: #b0555c}
.meow-tier.is-thunder {background: #0ea5e91a; color: #0b83b8}
[data-theme='dark'] .meow-tier.is-perfect, [data-theme='dark'] .meow-flag.is-maxed {color: #e3c169}
[data-theme='dark'] .meow-tier.is-near, [data-theme='dark'] .meow-flag.is-fixed {color: #8ab4f0}
[data-theme='dark'] .meow-tier.is-graduate {color: #63c3ac}
[data-theme='dark'] .meow-tier.is-transition {color: #b39bf0}
[data-theme='dark'] .meow-tier.is-unsuitable {color: #e0858a}
[data-theme='dark'] .meow-tier.is-thunder {color: #6cc5e8}
.meow-score {display: inline-flex; align-items: baseline; gap: 5px; font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--text)}
.meow-score small {font-size: 9px; font-weight: 400; color: var(--muted)}
.meow-cat-note {padding: 11px 16px 0; margin: 0; font-size: 11px; line-height: 1.9; color: var(--muted)}
.meow-talents {display: flex; flex-wrap: wrap; align-items: center; gap: 7px; padding: 11px 16px; border-bottom: 1px solid var(--border)}
.meow-talent {display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface-muted); font-size: 11px; line-height: 1.5}
.meow-talent.is-special {border-color: #d9b25a66; background: #d9b25a14; color: #9c7a1c; font-weight: 550}
.meow-talent.is-special > svg:first-child {color: #c9a227}
[data-theme='dark'] .meow-talent.is-special {color: #e3c169}
.meow-talent.is-inferred {border-style: dashed}
.meow-talent.is-inferred > svg:last-child {color: var(--theme-warning, #a56d16)}
.meow-level {font-size: 8px; line-height: 1; padding: 2px 4px; border-radius: 4px; background: #00000012; color: var(--muted); font-weight: 700}
[data-theme='dark'] .meow-level {background: #ffffff14}
.meow-inferred-hint {display: inline-flex; align-items: center; gap: 5px; margin-left: auto; font-size: 10px; color: var(--theme-warning, #a56d16)}
.meow-primary {display: grid; gap: 12px; padding: 14px 16px}
.meow-rubric-minor {display: grid; gap: 10px; padding: 11px 13px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-muted)}
.meow-rubric-head {display: flex; flex-wrap: wrap; align-items: center; gap: 10px}
.meow-rubric-head strong {font-size: 13px; font-weight: 600}
.meow-rubric-head .meow-score {margin-left: auto; font-size: 14px}
.meow-formula {font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums}
.meow-score-bar {height: 5px; border-radius: 999px; background: var(--surface-muted); overflow: hidden}
.meow-score-bar > i {display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #74bda8, #2f9e83)}
.meow-axis {display: flex; flex-wrap: wrap; align-items: baseline; gap: 7px}
.meow-axis-label {flex: 0 0 auto; min-width: 96px; max-width: 180px; font-size: 10px; color: var(--muted)}
.meow-hit {display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 7px; background: var(--accent-soft); color: var(--accent); font-size: 11px; line-height: 1.5}
.meow-hit.is-special {border: 1px solid #d9b25a55; background: #d9b25a14; color: #9c7a1c}
[data-theme='dark'] .meow-hit.is-special {color: #e3c169}
.meow-hit.is-empty {background: transparent; color: var(--muted); font-style: italic}
.meow-notes {display: grid; gap: 5px; margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.9; color: var(--muted)}
.meow-rubric-source {margin: 0; font-size: 10px; line-height: 1.8; color: var(--muted); overflow-wrap: anywhere}
.meow-others {border-top: 1px solid var(--border)}
.meow-others > summary {display: flex; align-items: center; gap: 7px; padding: 11px 16px; color: var(--muted); font-size: 11px; cursor: pointer; list-style: none}
.meow-others > summary::-webkit-details-marker {display: none}
.meow-others > summary > svg {transition: transform .2s}
.meow-others[open] > summary > svg {transform: rotate(180deg)}
.meow-others-body {display: grid; gap: 10px; padding: 0 16px 14px}
.meow-card-foot {display: flex; flex-wrap: wrap; gap: 4px 14px; padding: 10px 16px; border-top: 1px solid var(--border); font-size: 10px; color: var(--muted)}
/* 洗点推荐：配色由后端 verdict 决定，四种结论一眼可分 */
.meow-advice {margin: 0 16px 12px; padding: 10px 13px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-muted)}
.meow-advice.is-feed {border-color: color-mix(in srgb, var(--red) 42%, transparent); background: color-mix(in srgb, var(--red) 7%, transparent)}
.meow-advice.is-reroll {border-color: color-mix(in srgb, #d9a441 46%, transparent); background: color-mix(in srgb, #d9a441 9%, transparent)}
.meow-advice.is-pending {border-color: color-mix(in srgb, var(--accent) 42%, transparent); background: color-mix(in srgb, var(--accent) 7%, transparent)}
.meow-advice.is-keep {border-color: color-mix(in srgb, #3fa86a 42%, transparent); background: color-mix(in srgb, #3fa86a 7%, transparent)}
.meow-advice-head {display: flex; align-items: center; gap: 7px; font-size: 12px}
.meow-advice-head svg {flex: 0 0 auto; opacity: .85}
.meow-advice-reason {margin: 6px 0 0; font-size: 11px; color: var(--muted); line-height: 1.6}
.meow-advice-cost {margin: 5px 0 0; font-size: 11px; color: var(--muted)}
.meow-advice-targets {margin: 6px 0 0; padding: 0; list-style: none}
.meow-advice-targets li {position: relative; padding-left: 13px; font-size: 11px; color: var(--text); margin: 3px 0}
.meow-advice-targets li::before {content: '→'; position: absolute; left: 0; color: var(--accent); opacity: .8}
.meow-shot {font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); overflow-wrap: anywhere}
@media (max-width: 700px) {.meow-cats {padding: 12px}.meow-axis-label {flex-basis: 100%}.meow-card-score {width: 100%; justify-content: flex-start}}
.table-toolbar {display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; color:var(--muted); font-size:12px}
.resource-grid {display:flex;flex-wrap:wrap;--resource-card-min:150px}.resource-grid .resource-card {flex:1 1 var(--resource-card-min)}
.resource-card {min-width:0}.resource-value {white-space:nowrap}
.resource-settings {margin-top:8px;padding-top:18px;border-top:1px solid var(--border)}
.resource-settings-heading {display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}.resource-settings-heading>div {display:flex;flex-direction:column;gap:4px}.resource-settings-heading strong {font-size:15px;letter-spacing:-.2px}.resource-settings-heading span {color:var(--muted);font-size:11px;line-height:1.5}
.resource-card-editor {position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.resource-editor-card, .resource-editor-card.resource-picker-card {min-width:0;min-height:58px;display:flex;align-items:center;gap:9px;padding:10px 11px;border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:16px;background:color-mix(in srgb,var(--surface) 92%,transparent);box-shadow:0 4px 14px #00000008,inset 0 1px 0 #ffffff66;transition:transform .18s,translate .18s,border-color .18s,box-shadow .18s,background .18s;user-select:none}
.resource-editor-card:not(.resource-editor-add) {cursor:grab;touch-action:none}.resource-editor-card:not(.resource-editor-add):active {cursor:grabbing}.resource-editor-card:hover {border-color:color-mix(in srgb,var(--accent) 34%,var(--border));box-shadow:0 7px 18px #0000000d,inset 0 1px 0 #ffffff80}.resource-editor-card.dragging {z-index:2;transform:scale(1.04);border-color:var(--accent);box-shadow:0 12px 26px #00000026,inset 0 1px 0 #ffffff80}
.resource-drop-frame {position:absolute;display:none;margin:0}
.resource-drop-slot {border-style:dashed;border-color:color-mix(in srgb,var(--accent) 46%,var(--border));background:color-mix(in srgb,var(--accent-soft) 26%,transparent);box-shadow:none;cursor:default;pointer-events:none}
.resource-editor-grip {width:16px;display:grid;place-items:center;color:color-mix(in srgb,var(--muted) 72%,transparent);flex:0 0 auto}.resource-editor-icon {width:32px;height:32px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:var(--accent-soft);color:var(--accent)}.resource-editor-icon-image {background:transparent;overflow:visible}.resource-editor-icon-image .resource-icon-image {width:30px;height:30px}.resource-editor-label {min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600}
.resource-editor-remove {width:28px;height:28px;display:grid;place-items:center;flex:0 0 auto;padding:0;border:0;border-radius:9px;background:transparent;color:var(--muted);cursor:pointer;transition:background .15s,color .15s}.resource-editor-remove:hover {background:color-mix(in srgb,var(--red) 11%,transparent);color:var(--red)}
.resource-editor-add {justify-content:center;cursor:pointer;border-style:dashed;color:var(--accent);background:color-mix(in srgb,var(--accent-soft) 42%,var(--surface));font:inherit;font-size:13px;font-weight:600}.resource-editor-add:hover,.resource-editor-add.open {border-color:color-mix(in srgb,var(--accent) 62%,var(--border));background:color-mix(in srgb,var(--accent-soft) 72%,var(--surface))}.resource-editor-add-icon {width:30px;height:30px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--accent) 12%,transparent)}
.resource-picker {margin-top:10px;padding:10px;border:1px solid color-mix(in srgb,var(--border) 76%,transparent);border-radius:16px;background:color-mix(in srgb,var(--surface-muted) 78%,var(--surface));box-shadow:inset 0 1px 0 #ffffff55}.resource-picker-grid {position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.resource-picker-card {min-width:0;min-height:50px;display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid transparent;border-radius:13px;background:transparent;color:var(--text);font:inherit;font-size:12px;text-align:left;cursor:pointer;transition:background .15s,border-color .15s}.resource-picker-card>span:nth-child(2) {min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.resource-picker-card:hover {background:var(--surface);border-color:var(--border)}.resource-picker-card>svg {color:var(--accent);flex:0 0 auto}.resource-picker-empty {padding:14px;color:var(--muted);font-size:12px;text-align:center}
.overview-grid {grid-template-columns:minmax(260px,.45fr) minmax(0,1.55fr);align-items:stretch}
.schedule-panel {min-width:0;overflow:hidden;height:780px;display:flex;flex-direction:column}
.monitor-panel {min-width:0;overflow:hidden;display:flex;flex-direction:column}
.overview-main {display:flex;flex-direction:column;flex:1;min-height:0}
@media(min-width:951px) {
  /* 高度取父级 100%：自算高度对不上 main 的内边距与页标题外边距，底部会空一截；
     flex-basis 会盖过 height，所以这一项不能参与伸缩。 */
  /* 外壳给确定高度，内层 height:100% 才解析得到；只设 min-height 时整条链按内容长。 */
  .app-shell:has(.overview-page) {height: var(--viewport-height)}
  /* 网格项的最小尺寸默认取内容高，归零后才受外壳高度约束。 */
  .app-shell:has(.overview-page) .main-shell {min-height: 0}
  /* 高度取父级 100%：外壳没给确定高度时它会退化成 auto。flex-basis 会盖过 height，所以不参与伸缩。 */
  .overview-page {display:flex;flex-direction:column;flex:0 0 auto;height:100%;min-height:0;width:100%}
  /* 总览日志必须按父容器的剩余高度收缩，溢出交给 .log-content 内部滚动。
     basis:auto 会把日志内容纳入面板基准高度，日志越多面板就越长；旧版总览也会被这条全局规则误伤。 */
  .overview-page .monitor-panel,
  .instance-page-panel > .monitor-panel {flex:1 1 0;height:auto;min-height:0}
  .overview-main {margin-bottom:-10px}
}
.schedule-panel .panel-heading,.schedule-panel .schedule-summary {flex-shrink:0}
.schedule-summary {flex-wrap:wrap;gap:8px 12px;padding:12px 16px}.schedule-summary > span {display:none}
.schedule-panel .task-table {flex:1;min-height:0;max-height:none;overflow-y:auto;padding:0 14px}
.task-row {grid-template-columns:minmax(0,1fr) 48px 74px 10px;gap:6px}.task-order {display:none}.task-row-name {min-width:0;overflow:hidden}.task-row-name strong {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.task-state.running {color:#159b88;background:#159b881a;font-weight:700}.task-state.waiting {color:var(--muted)}
.monitor-tabs {display:flex;flex-direction:row;align-items:center;border-bottom:1px solid var(--border);padding:0 18px;gap:6px;flex-shrink:0;height:49px;box-sizing:border-box}
.monitor-tabs button {display:inline-flex;align-items:center;gap:8px;padding:0 16px;height:100%;background:none;border:0;color:var(--muted);border-bottom:2px solid transparent;cursor:pointer;box-sizing:border-box}
.monitor-tabs button[aria-selected=true] {color:var(--text);border-bottom-color:#159b88}
.monitor-tabs > a.text-button {margin-left:auto;font-size:11px}
.monitor-tabs > a.text-button + span {margin-left:0}
.monitor-tabs > span {margin-left:auto;font-size:11px;color:var(--muted)}
.monitor-view[hidden] {display:none !important}
.monitor-view:not([hidden]) {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.monitor-panel .log-panel {display:flex;flex-direction:column;flex:1;min-height:0;height:100%}
.monitor-panel .log-filters {flex-shrink:0;flex-wrap:wrap;gap:8px;border-bottom:1px solid var(--border)}.monitor-panel .log-filters input {min-width:0}
.monitor-panel .log-content {flex:1;min-height:0;height:auto;font-size:11px;overflow:auto}
.monitor-panel .log-line {overflow-wrap:anywhere}
.monitor-panel .preview-log {flex:0 0 auto;margin:16px 16px 0;padding:8px 13px;border:1px solid var(--border);border-radius:7px;background:var(--surface-muted);overflow:hidden;font-family:var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Courier New", monospace);font-size:11px;line-height:1.6;color:var(--text)}
.monitor-panel .preview-log-line {display:flex;gap:8px;align-items:baseline;white-space:nowrap;overflow:hidden}
.monitor-panel .preview-log-ts {color:#06b6d4;flex-shrink:0}
.monitor-panel .preview-log-msg {flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.monitor-panel .preview-stage {flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.monitor-panel .preview-screen {flex:0 0 auto;aspect-ratio:16/9;width:calc(100% - 32px);max-height:calc(100% - 32px);height:auto;margin:auto auto 16px;position:relative;border-radius:7px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.monitor-panel .preview-screen img {width:100%;height:100%;object-fit:contain;position:absolute;inset:0}
@supports (container-type: size) {
  /* 日志条压缩了上方空间，用容器高度反推 16:9 的宽度，画面才不会被压成两侧留黑边的信箱形。 */
  .monitor-panel .preview-stage {container-type:size}
  .monitor-panel .preview-screen {width:min(calc(100% - 32px),calc((100cqh - 32px)*16/9));max-height:none}
}
.statistics-controls {display:flex;flex-wrap:wrap;align-items:end;gap:14px;padding:18px 22px}.statistics-controls label {display:flex;flex-direction:column;gap:7px;font-size:11px;color:var(--muted)}.statistics-controls select,.statistics-controls input {max-width:200px;min-height:34px}.period-controls {padding:0 0 18px;align-items:center}.period-controls strong {margin-right:auto}.period-controls > span {font-size:12px;color:var(--muted)}
/* 以下工具栏规则只服务紧凑主题：分类、时间范围与操作合并为一行并置顶，滚动时仍可切换与刷新。
   非旧版版式由 body 滚动，需让开吸顶的顶栏；旧版版式的 .instance-page-main 自身滚动，贴顶即可。 */
:root[data-theme='extreme'] .statistics-toolbar-row {position:sticky;top:var(--topbar-height);z-index:30;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 0;margin-bottom:12px;background:var(--bg)}
/* 分段控件放不下时换成单按钮下拉（指针移入即展开，见 Select 的 openOnFocus）。
   is-compact 由 Statistics 测量可用宽度得出，不用固定断点：右侧控件宽度随分类变化。 */
:root[data-theme='extreme'] .statistics-toolbar-row .statistics-category-select {display:none}
:root[data-theme='extreme'] .statistics-toolbar-row.is-compact .statistics-category-control {display:none}
:root[data-theme='extreme'] .statistics-toolbar-row.is-compact .statistics-category-select {display:inline-flex}
:root[data-theme='extreme'] .instance-page-main > .statistics-toolbar-row {top:0}
:root[data-theme='extreme'] .statistics-toolbar-row .statistics-category-control {margin-bottom:0;flex:0 0 auto;width:max-content}
:root[data-theme='extreme'] .statistics-toolbar-right {display:flex;align-items:center;gap:12px;margin-left:auto;flex-wrap:wrap}
:root[data-theme='extreme'] .statistics-actions {display:flex;align-items:center;gap:8px}
:root[data-theme='extreme'] .statistics-inline-control {display:flex;align-items:center;gap:7px;font-size:11px;color:var(--muted);white-space:nowrap}
:root[data-theme='extreme'] .statistics-inline-control select,:root[data-theme='extreme'] .statistics-inline-control input {max-width:200px;min-height:var(--form-height)}
/* 控件名收进提示：工具栏只留当前值，鼠标移入或键盘聚焦时把名称浮在控件下方。
   文字仍渲染在 DOM 里（.statistics-inline-label），只是紧凑主题不占位，其它主题照旧。 */
:root[data-theme='extreme'] .statistics-inline-label {display:none}
:root[data-theme='extreme'] .statistics-inline-control {position:relative}
:root[data-theme='extreme'] .statistics-inline-control[data-tip]:not([data-tip='']):hover::after,
:root[data-theme='extreme'] .statistics-inline-control[data-tip]:not([data-tip='']):focus-within::after {
  content:attr(data-tip);position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);
  padding:3px 8px;background:var(--text);color:var(--surface);font-size:11px;line-height:1.6;
  white-space:nowrap;pointer-events:none;z-index:40;
}
/* 图表设置行挪到图表下方后由它收尾：紧凑主题把内边距压到与面板一致的尺度。 */
:root[data-theme='extreme'] .statistics-controls {padding:10px 12px;gap:12px;border-top:1px solid var(--border)}
:root[data-theme='extreme'] .statistics-controls label {gap:4px}
:root[data-theme='extreme'] .statistics-controls select,:root[data-theme='extreme'] .statistics-controls input {min-height:var(--form-height)}
/* 数值区（单指标一行 / 多指标卡片）：这两块原本按简约尺度写死，多选指标后一片卡片
   又高又散。紧凑主题收紧内边距、列宽与字号，并保持直角。 */
:root[data-theme='extreme'] .stat-metrics {padding:8px 12px;gap:12px}
:root[data-theme='extreme'] .stat-metrics span {margin-bottom:4px}
:root[data-theme='extreme'] .stat-metrics strong {font-size:18px}
:root[data-theme='extreme'] .stat-multi-metrics {grid-template-columns:repeat(auto-fit,minmax(178px,1fr));gap:8px;padding:8px 12px}
:root[data-theme='extreme'] .stat-metric-card {padding:8px 10px;gap:6px;border-radius:0}
:root[data-theme='extreme'] .stat-metric-header {font-size:12px;gap:6px}
:root[data-theme='extreme'] .stat-metric-body {gap:4px 8px;font-size:11px}
:root[data-theme='extreme'] .stat-metric-body span {font-size:10px;margin-bottom:2px}
:root[data-theme='extreme'] .stat-metric-body strong {font-size:14px}
.sr-title {position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.date-input-wrap {position:relative;display:inline-flex;align-items:center;width:100%;max-width:200px}.date-input-wrap input {width:100%}.date-empty {color:transparent}.date-empty::-webkit-datetime-edit {color:transparent}.date-empty::-webkit-calendar-picker-indicator {opacity:1}.date-input-placeholder {position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;font-size:11px;user-select:none;font-variant-numeric:tabular-nums;letter-spacing:0.5px}
/* 统计区与配置页一致采用自然贯穿流式布局，内容随页面自然向下延伸并在全局滚动。 */
.statistics-sections {display:flex;flex-direction:column;gap:20px}
.statistics-sections > * {flex:0 0 auto}
.statistics-sections > .statistics-chart:not(.chart-expanded) {height:auto;min-height:0}
.statistics-note {padding:13px 17px;background:var(--surface);border-left:3px solid #159b88;border-radius:5px;font-size:12px;line-height:1.8;color:var(--muted);margin:0}
.stat-metrics {display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:16px;padding:20px 22px}.stat-metrics span {display:block;color:var(--muted);font-size:11px;margin-bottom:10px}.stat-metrics strong {display:block;font-size:23px;font-weight:600;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.stat-metrics small {font-size:11px;font-weight:400;margin-left:6px;color:var(--muted)}.summary-metrics-panel {padding:22px 26px}.summary-metrics-panel .summary-metrics {padding:0;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:16px 20px}.summary-metrics {padding:0;grid-template-columns:repeat(auto-fill,minmax(165px,1fr))}.summary-metric-card, .summary-metrics section {padding:12px 14px;background:transparent;border:1px solid transparent;border-radius:12px;display:flex;flex-direction:column;justify-content:space-between;min-height:72px;transition:background .15s ease,border-color .15s ease,transform .15s ease}
.summary-metric-card:hover, .summary-metrics section:hover {background:var(--surface-muted);border-color:var(--border)}
.summary-metric-head {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.summary-metrics .summary-metric-label {display:block;margin-bottom:0;color:var(--muted);font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.summary-metric-icon {display:inline-flex;align-items:center;justify-content:center;color:var(--accent);opacity:.75;flex-shrink:0;transition:transform .18s ease,opacity .18s ease}
.summary-metric-card:hover .summary-metric-icon {opacity:1;transform:scale(1.08)}
.summary-metric-icon-webp {opacity:1;transform:none}
.summary-metric-icon-webp img {width:48px;height:48px;object-fit:contain;display:block;user-select:none;pointer-events:none;filter:drop-shadow(0 3px 8px rgb(0 0 0 / .24))}
.summary-metric-card:hover .summary-metric-icon-webp {transform:scale(1.08)}
.summary-metric-card strong {display:block;font-size:24px;font-weight:650;font-variant-numeric:tabular-nums;line-height:1.15;letter-spacing:-0.5px}
.summary-metric-card small {font-size:12px;font-weight:400;margin-left:6px;color:var(--muted);letter-spacing:normal}
.statistics-metrics-container {display:flex;flex-direction:column;gap:8px;padding:14px 22px 0}
.statistics-metrics-label {font-size:11px;color:var(--muted);font-weight:500}
.statistics-metrics-chips {display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.stat-chip {display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:12px;cursor:pointer;user-select:none;transition:all .15s ease}
.stat-chip:hover:not(:disabled) {border-color:var(--accent);background:var(--surface-muted)}
.stat-chip.active {border-color:var(--accent);background:var(--surface-muted);font-weight:600;box-shadow:0 0 0 1px var(--accent-soft)}
.stat-chip.empty {opacity:.45;cursor:not-allowed}
.stat-chip small {font-size:10px;color:var(--muted);margin-left:2px}
.stat-chip-dot {width:9px;height:9px;border-radius:50%;background:var(--border);flex-shrink:0;transition:all .15s ease}
.stat-chip-icon {width:20px;height:20px;object-fit:contain;flex-shrink:0;display:block;user-select:none;pointer-events:none;opacity:.75;transition:all .15s ease;filter:drop-shadow(0 1px 2px rgb(0 0 0 / .2))}
.stat-chip:hover:not(:disabled) .stat-chip-icon {opacity:.95}
.stat-chip.active .stat-chip-icon {opacity:1;transform:scale(1.08)}
.stat-metric-header .stat-chip-icon {width:20px;height:20px;opacity:1;transform:none}
.stat-chip-badge {font-size:10px;padding:1px 5px;border-radius:4px;font-weight:600;line-height:1.2;margin-left:4px;transition:all .15s ease}
.stat-chip-badge.primary {background:var(--accent);color:#fff}
.stat-chip-badge.secondary {background:var(--surface-muted);color:var(--muted);border:1px solid var(--border)}
.stat-chip-badge.secondary:hover {border-color:var(--accent);color:var(--text)}
.stat-multi-metrics {display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;padding:16px 22px}
.stat-metric-card {background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.stat-metric-header {display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}
.stat-metric-body {display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px}
.stat-metric-body span {display:block;color:var(--muted);font-size:11px;margin-bottom:4px}
.stat-metric-body strong {display:block;font-size:16px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.stat-metric-body strong.positive {color:#10b981}
.stat-metric-body strong.negative {color:#ef4444}
.stat-metric-body strong.neutral {color:var(--text)}
/* 统计图表面板：自然垂直流式布局，不设内部纵向滚动；图表保持适宜高度，下方内容自然排列。 */
.statistics-chart {display: flex; flex-direction: column}
.statistics-chart:not(.chart-expanded) > .chart-canvas {height: 380px; min-height: 320px; width: 100%; flex: 0 0 auto}
.chart-expanded {position:fixed;inset:20px;z-index:100;overflow:auto;background:var(--surface);box-shadow:0 0 0 50px #0008}.chart-expanded .chart-canvas {flex: none; height:55vh}
/* 放大视图铺满窗口后，右上角是 Electron 的窗口控制按钮，会压住「收起图表」；
   同时面板自身可滚动，滚动后标题行会滚出视口。右侧让开按钮宽度并让它吸顶。
   这里必须带 !important：紧凑主题用 padding 简写加 !important 压过面板内边距。 */
.panel.chart-expanded .panel-heading {position:sticky;top:0;z-index:2;padding-right:160px !important;background:var(--surface)}
.statistics-table {min-width:0}.statistics-table h3 {margin:0;font-size:14px}.table-toolbar {padding:10px 22px;margin:0;flex-wrap:wrap}.table-toolbar input {max-width:240px}.table-scroll {overflow-x:auto;overflow-y:visible;max-height:none}.statistics-table table {border-collapse:collapse;width:100%;font-size:12px;white-space:nowrap}.statistics-table td,.statistics-table th {padding:13px 20px;text-align:left;border-bottom:1px solid var(--border);font-variant-numeric:tabular-nums}.statistics-table th {position:sticky;top:0;background:var(--surface-muted);z-index:1}.statistics-table th button {border:0;background:none;color:var(--text);cursor:pointer;font:inherit}.statistics-table tbody tr:hover {background:var(--surface-muted)}.table-resource-cell {display:inline-flex;align-items:center;gap:8px;vertical-align:middle}.table-resource-icon {width:26px;height:26px;object-fit:contain;flex-shrink:0;display:block;user-select:none;pointer-events:none;filter:drop-shadow(0 1px 3px rgb(0 0 0 / .2))}.table-header-icon {width:24px;height:24px;margin-right:2px}
/* 卡片适应：列数由脚本按容器宽度写入，末排因此不会各自撑满整行。 */
.resource-grid.resource-fit {display:grid}
/* 卡片适应把网格切成多列，合并卡片仍占满整行。 */
.resource-grid.resource-fit .resource-merged {grid-column:1/-1}
.resource-grid.resource-fit .resource-merged {display:grid}
/* 紧凑视图：只收紧间距与内边距；旧版主题有更具体的规则，仍按主题的紧凑度走。 */
.resource-grid.resource-dense {gap:4px;margin-bottom:6px}
.resource-grid.resource-dense .resource-card {padding:4px 11px 3px}
/* 字体适应：窄卡片按容器宽度重排字号层级——数值统一收小并各卡一致（覆盖上游窄视口下的固定字号）；
   标题、图标与记录时间上调，总量后缀随数值放大；权重高于各主题的同名规则，避免紧凑主题按自己的尺寸覆盖。 */
:root .resource-grid.resource-fit-text .resource-card,
:root .resource-grid.resource-fit-text .resource-merged-item {container-type:inline-size}
:root .resource-grid.resource-fit-text .resource-heading {font-size:clamp(14px,6.6cqw,17px)}
:root .resource-grid.resource-fit-text .resource-heading > div {width:clamp(28px,15cqw,32px);height:clamp(28px,15cqw,32px)}
:root .resource-grid.resource-fit-text .resource-icon-image {width:clamp(28px,15cqw,32px);height:clamp(28px,15cqw,32px)}
:root .resource-grid.resource-fit-text .resource-value {font-size:20px !important}
:root .resource-grid.resource-fit-text .resource-value-content small {font-size:.8em}
:root .resource-grid.resource-fit-text .resource-foot {font-size:clamp(12px,5.6cqw,14px)}
/* 通用卡片：内部条目沿用资源卡自身的排版，仅由外层容器统一描边。 */
.resource-grid .resource-merged {flex:1 1 100%;display:flex;flex-wrap:wrap;gap:8px;box-shadow:var(--shadow)}
.resource-merged .resource-merged-item {flex:1 1 var(--resource-card-min);min-width:0;border:0;background:transparent;box-shadow:none;backdrop-filter:none}
/* 仪表盘设置弹窗内的开关行：弹窗比设置页窄，用紧凑排法。 */
.dashboard-options {display:flex;flex-direction:column}
.dashboard-option {display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid color-mix(in srgb,var(--border) 70%,transparent)}
.dashboard-option:last-child {border-bottom:0}
.dashboard-option-label {min-width:0;display:flex;flex-direction:column;gap:3px}
.dashboard-option-label strong {font-size:13px;font-weight:600}
.dashboard-option-label span {color:var(--muted);font-size:11px;line-height:1.6}
.dashboard-option .toggle {flex:0 0 auto;margin-top:2px}

@media(max-width:950px) {.resource-grid:not(.resource-fit) {grid-template-columns:repeat(auto-fit,minmax(140px,1fr)) !important}.resource-card-editor,.resource-picker-grid {grid-template-columns:1fr}.resource-settings-heading {gap:10px}.task-row {grid-template-columns:minmax(0,1fr) 48px 74px 10px !important}.stat-metrics {grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.statistics-controls {padding:15px;gap:10px}.statistics-controls label {max-width:100%}.statistics-controls input {max-width:100%}.statistics-sections {flex:none;grid-template-rows:auto auto}.schedule-panel, .monitor-panel {height:500px}.chart-expanded {inset:5px}.statistics-note {font-size:11px}}

/* 未展示资源的卡片外观复用编辑卡，点击即添加。 */
.resource-editor-card.resource-picker-card {cursor: pointer; font-size: inherit; color: inherit}
/* 三个档位：中档就是上游原样（栏 56、标签 30、字号 12），大小两档在这之上放大与缩小。
   余量固定 4px，标签因此几乎占满整条栏高，文字不会被大边框围住。 */
:root[data-tab-size='md'] {--row-scale: 1; --row-pad: calc(2px + (30px * 1) / 8)}
:root[data-tab-size='lg'] {--row-scale: 1.24; --row-pad: calc(2px + (30px * 1.24) / 8)}
:root[data-tab-size='xl'] {--row-scale: 1.55; --row-pad: calc(2px + (30px * 1.55) / 8)}
:root[data-tab-size='sm'] {--row-scale: .78; --row-pad: calc(2px + (30px * .78) / 8)}
:root[data-tab-size='xs'] {--row-scale: .62; --row-pad: calc(2px + (30px * .62) / 8)}
:root {--instance-tab-height: calc(30px * var(--row-scale, 1)); --instance-tab-font: calc(var(--instance-tab-height) * .4); --instance-tab-pad: calc(9px * var(--row-scale, 1)); --instance-tab-max: calc(210px * var(--row-scale, 1)); --instance-tab-icon: calc(14px * var(--row-scale, 1)); --instance-tab-gap: 1px; /* 新前端三个主题的标签页是长椭圆（胶囊）形；旧版主题另有规则把它压回 0。 */ --instance-tab-radius: 999px}

.update-notice.sidebar-update-notice {padding: 4px 8px; border-radius: 999px; background: var(--red); color: #fff; font-size: 10px; font-weight: 750; line-height: 1; flex-shrink: 0}
.sidebar-brand {padding-top: 0; margin-bottom: 20px}
.brand-title {color: var(--text); text-decoration: none}
.sidebar-brand-left {display: flex; align-items: center; gap: 8px; min-width: 0}
.sidebar-update-notice span {position: relative; z-index: 1}
.nav-instance-name {min-width: 0; overflow: hidden; text-overflow: ellipsis}
.topbar {position: sticky; top: 0; z-index: 30; gap: 16px; border-bottom: none !important}
/* 承载控件的那一行由控件自身撑起，不另外定高：定高会在分页与原模式之间差出 1px。 */
.breadcrumb {min-width: 0; min-height: var(--instance-tab-height); align-items: center}
.breadcrumb-current {overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.breadcrumb > a, .breadcrumb > span, .breadcrumb > strong {flex-shrink: 0}
.breadcrumb > .breadcrumb-current {flex-shrink: 1}
.breadcrumb .instance-picker {margin: 0; min-width: 0}
.breadcrumb .instance-switcher {display: inline-flex; align-items: center; gap: 2px; padding: 0; border: 0; background: transparent; width: auto}
.breadcrumb .instance-caption {display: inline-flex; align-items: center; color: var(--text); text-decoration: none; border-radius: 4px; padding: 4px 6px; transition: color .15s, background-color .15s}
.breadcrumb .instance-caption:hover {color: var(--accent); background: var(--accent-soft)}
/* 原模式下这一行由实例下拉撑起，它的字号与内边距也要跟同一比例缩放，
   否则小档时下拉自身的高度会把整行撑住，放缩在原模式下看不出效果。 */
.breadcrumb .instance-caption {padding: calc(var(--instance-tab-font) * .3) 6px}
.breadcrumb .instance-caption strong {font-size: var(--instance-tab-font); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.breadcrumb .instance-toggle {display: inline-flex; align-items: center; justify-content: center; padding: 4px 5px; border: 0; background: transparent; color: var(--muted); border-radius: 4px; cursor: pointer; transition: color .15s, background-color .15s}
.breadcrumb .instance-toggle:hover, .breadcrumb .instance-toggle[aria-expanded='true'] {color: var(--accent); background: var(--accent-soft)}
.breadcrumb .instance-menu {right: auto; width: 240px; max-width: calc(100vw - 110px)}
.breadcrumb .instance-menu span {color: inherit}

/* 模式开关与缩放开关都钉在行首不参与收缩，「主页 / 实例…」整体让到它们右边。 */
.topbar-mode-toggle, .topbar-tab-size {flex-shrink: 0}
/* 放缩只落在承载标签的那条栏上：新版主题是顶栏自己，旧版主题是页内那一行。
   旧版顶部还有一条只有品牌与页名的装饰栏，它不参与放缩，否则顶部会白占两条栏的高度。 */
/* 承载这一行的栏按「标签高 + 8px」定高，与顶栏是分页还是下拉无关 ——
   判据用「有这两枚按钮」而不是「有标签条」，否则切模式时这一行会突然变高变矮。
   正栏是吸顶的，不能压得比各主题原高还矮，否则下方会留缝让正文穿过去；页内那行可以贴到最紧。 */
/* 顶栏这一行的行高；定义在 :root 上，右栏才能继承到同一个值。 */
:root[data-tab-size] {--topbar-row-height: calc(var(--instance-tab-height) + 2 * var(--row-pad, 4px))}
:root[data-tab-size] .app-shell:not(.legacy-shell) .topbar:has(.topbar-tab-size) {height: var(--topbar-row-height)}
/* 右栏紧贴顶栏下方；旧版外壳的右栏另有一套规则，不在此列。 */
:root[data-tab-size] .app-shell:not(.legacy-shell) .right-rail {top: var(--topbar-row-height); height: calc(var(--viewport-height) - var(--topbar-row-height))}
:root[data-tab-size] .app-shell .legacy-page-nav:has(.topbar-tab-size) {height: calc(var(--instance-tab-height) + 1px); padding-block: var(--row-pad, 4px)}
:root[data-tab-size] .app-shell .topbar:has(.topbar-tab-size) {padding-block: var(--row-pad, 4px)}
/* 两枚按钮的盒子固定为图标的两倍见方，且与顶栏是分页还是下拉无关：
   按钮一旦随模式改变宽度，右侧所有内容都会被推着左右跳。
   （曾试过用居中伪元素把命中区收窄到图标四周各 .4 倍图标，但那层伪元素不拦指针，
   实测按钮四角仍会命中——它只能画东西，收不了命中区，已删。现按要求做成整格可点。） */
/* components.css 里同特异性的 .icon-button 也定这两枚按钮的尺寸，这里加一族前缀才压得住。 */
:root[data-tab-size] .app-shell .topbar-mode-toggle,
:root[data-tab-size] .app-shell .topbar-tab-size {width: calc(var(--instance-tab-icon) * 2); height: calc(var(--instance-tab-icon) * 2); padding: 0; justify-content: center}
/* 图标统一按 --instance-tab-icon 定死宽高：两枚按钮换图标（如切换图标形状不同）时不会改变自身宽度，
   否则点一下切换按钮，右侧整条标签都会左右跳。 */
.topbar-mode-toggle .lucide, .topbar-tab-size .lucide {width: var(--instance-tab-icon); height: var(--instance-tab-icon); flex-shrink: 0}
/* 两枚开关与「主页」同在一条横排里；悬停区单独占一个元素，摆在「主页」左边那片空处。 */
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions {position: relative; display: flex; align-items: center; align-self: stretch; min-width: 0; gap: calc(var(--instance-tab-icon) * .5); margin-left: auto}
/* 悬停区是盒子左侧外部的一条窄带（right: 100%），宽度按两枚开关算。 */
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions-hover {position: absolute; top: 0; bottom: 0; right: 100%; width: calc(var(--instance-tab-icon) * 2)}
/* 两枚开关收在一个盒子里，展开只是把盒子拉宽：向右长，把「主页」与标签栏一并顶开。
   折叠时盒子宽 0：「主页」直接靠到左沿，不留占位空；开关靠 visibility 不绘制。 */
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions-buttons {display: flex; align-items: center; gap: calc(var(--instance-tab-icon) * .5); width: 0; overflow: hidden; transition: width .18s ease}
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions-buttons > * {visibility: hidden; pointer-events: none}
/* 展开：指针落在左边那片悬停区上、或已进入展开的开关盒内 —— 两者合起来才算悬停区，
   否则指针一挪到开关上就掉出去，展开的开关根本点不到；键盘焦点同理。鼠标点击留下的
   焦点不算 —— 它会一直留着，盒子就再也折不回去。 */
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions:has(> .topbar-actions-hover:hover) .topbar-actions-buttons,
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions:has(> .topbar-actions-buttons:hover) .topbar-actions-buttons,
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions:has(:focus-visible) .topbar-actions-buttons {width: calc(var(--instance-tab-icon) * 4.5)}
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions:has(> .topbar-actions-hover:hover) .topbar-actions-buttons > *,
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions:has(> .topbar-actions-buttons:hover) .topbar-actions-buttons > *,
:root[data-tab-size] .app-shell .breadcrumb .topbar-actions:has(:focus-visible) .topbar-actions-buttons > * {visibility: visible; pointer-events: auto}
.instance-tab .lucide {width: var(--instance-tab-icon); height: var(--instance-tab-icon)}
/* 「主页」的文字与它右侧的分隔线跟整行同一比例；字号不只在分页模式生效。
   它是纯文字链接，默认命中区只有文字那么大，给足内边距让它占满整条行高。 */
.breadcrumb .topbar-actions > a {font-size: var(--instance-tab-font); display: inline-flex; align-items: center; padding: 10px calc(var(--instance-tab-pad) * .6)}
.breadcrumb .topbar-actions > a:hover {color: var(--accent); background: var(--accent-soft); border-radius: var(--theme-radius-control)}

/* 分页模式：实例平铺成一行标签页。留给标签的宽度有下限，所以「主页」与会收缩的页名要能截断，
   而不是把标签挤没。 */
.breadcrumb.with-tabs {flex: 1; min-width: 0}
.breadcrumb.with-tabs > a {flex-shrink: 0}
.breadcrumb.with-tabs > .breadcrumb-current {flex-shrink: 1; min-width: 0}
/* 标签条只负责排布；尺寸全部来自 :root[data-tab-size] 的三个档位。 */
.instance-tabs {display: flex; align-items: stretch; gap: var(--instance-tab-gap); min-width: 0; flex: 1 1 200px; overflow-x: auto; scrollbar-width: none}
.instance-tabs::-webkit-scrollbar {display: none}
.instance-tab {display: inline-flex; align-items: center; gap: .5em; flex-shrink: 0; max-width: var(--instance-tab-max); height: var(--instance-tab-height); padding: 0 var(--instance-tab-pad); border: 1px solid var(--border); border-bottom: 0; border-radius: var(--instance-tab-radius, 7px); background: var(--surface); color: var(--muted); font-size: var(--instance-tab-font); transition: color .15s, background-color .15s}
/* 相邻标签之间留一条细线作分隔。 */
.instance-tab + .instance-tab {border-left-color: var(--border)}
.instance-tab:hover {color: var(--accent); background: var(--accent-soft); border-color: var(--border); border-bottom: 0}
.instance-tab-name {font-size: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
/* 尺寸与标签页同高，并自己垂直居中：标签条是 stretch 对齐，不写 align-self 这个圆钮会顶对齐。 */
.instance-tab-create {flex-shrink: 0; align-self: center; box-sizing: border-box; width: var(--instance-tab-height); height: var(--instance-tab-height); padding: 0; display: grid; place-items: center; border: 1px dashed var(--border); border-radius: 999px; color: var(--muted); transition: color .15s, border-color .15s}
.instance-tab-create:hover {color: var(--accent); border-color: var(--accent)}
/* 「+」图标由 JSX 给固定尺寸，这里按标签图标变量覆盖，否则五档缩放时图标不动。 */
.instance-tab-create > .lucide {width: calc(var(--instance-tab-icon) * .72); height: calc(var(--instance-tab-icon) * .72)}
/* 按压反馈与主题里其它按钮同一写法（见 apple.css 的 .button:active）；两个创建入口共用。 */
.instance-tab-create:active:not(:disabled), .instance-create:active:not(:disabled) {filter: brightness(.94)}

/* 标签页里的两格控件位置：左格放状态与启停钮，右格放删除钮。格子有定宽，悬停切换图标不改标签宽度。
   左格比标签页里其它图标小一圈：只缩可点范围以减少误触，两枚图标都取同一尺寸，切换时不改变大小。 */
.instance-tab-cell {position: relative; display: inline-flex; flex-shrink: 0; --tab-cell-icon: calc(var(--instance-tab-icon) * 6 / 7); width: var(--tab-cell-icon); height: var(--tab-cell-icon)}
/* 状态图标与格子同尺寸；选择器要压过 .instance-tab .lucide（两个类）才生效。 */
.instance-tab .instance-tab-icon {flex-shrink: 0; width: var(--tab-cell-icon); height: var(--tab-cell-icon)}

/* 左格：平时是状态图标，鼠标压在这一格上时换成启停钮。 */
.instance-tab-cell:not(.instance-tab-remove):hover .instance-tab-icon {visibility: hidden}
.instance-tab-cell:not(.instance-tab-remove):hover .instance-tab-power {display: grid}
.instance-tab-power {position: absolute; inset: 0; display: none; place-items: center; border-radius: 50%; cursor: pointer; color: var(--accent)}
/* 启停图标与状态图标同尺寸：两态切换时图标不改变大小。 */
.instance-tab-power > .lucide {width: var(--tab-cell-icon); height: var(--tab-cell-icon)}
.instance-tab-power:hover {color: var(--surface); background: var(--accent)}
.instance-tab.running .instance-tab-power {color: var(--red)}
.instance-tab.running .instance-tab-power:hover {color: var(--surface); background: var(--red)}

/* 右格：× 号平时不显示，只有鼠标压在这一格上才现形。 */
.instance-tab-remove .lucide {display: none}
.instance-tab-remove:hover .lucide {display: block}
.instance-tab-remove:hover {border-radius: 50%; cursor: pointer; color: var(--red); background: var(--surface)}

/* 状态：跑着的图标呼吸，出错的与停下的静态。图标颜色即状态，不再另加文字。 */
.instance-tab.running {color: var(--accent)}
.instance-tab.running .instance-tab-icon {animation: instance-pulse 1.8s ease-in-out infinite}
.instance-tab.updating {color: var(--muted)}
.instance-tab.updating .instance-tab-icon {animation: spin 1.2s linear infinite}
.instance-tab.error {color: var(--red)}

/* 当前标签页高亮：切换瞬间闪一下主色再落回底色，让「跳到哪个实例」看得见。 */
/* 选中：只靠底色与主色文字区分，不画下沿重线 ——
   圆底标签上任何贴着底边的直下沿都会在两端露出圆角之外，看起来就是「主题色漏出来」。 */
.instance-tab.current {background: var(--accent-soft); color: var(--accent); border-color: var(--border); animation: instance-highlight .45s ease-out, instance-rise .25s ease-out}

.topbar-right {flex-shrink: 0; gap: 16px}
.update-notice {display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; color: var(--accent); background: var(--accent-soft); border-radius: 20px; white-space: nowrap}
.task-nav-heading {margin-bottom: 8px; flex-shrink: 0}
.sidebar-label .icon-button {width: 28px; height: 28px; padding: 6px}
.filter-active {color: var(--accent) !important; background: var(--accent-soft) !important}
.main-shell > main:has(> .home-editorial) {max-width: none; min-height: calc(var(--viewport-height) - 56px); padding: 0; display: flex}
/* 旧版外壳多出内容区顶部那行导航，页面本身也不靠「视口 − 常量」算高（那常量会漂），
   所以这里改成由上到下逐级撑满，否则整壳会被顶出视口、底部露出接缝。 */
.app-shell.legacy-shell > .main-shell > main:has(> .home-editorial) {min-height: 0}
/* 旧版外壳里两列都自己滚（和实例页同一套做法）：不这样，主页内容会把整壳顶出视口，矮窗口下底部就露出接缝。 */
.app-shell.legacy-shell .home-deck, .app-shell.legacy-shell .home-main {min-height: 0; overflow-y: auto}
.home-editorial {flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(300px, 34%) minmax(0, 1fr)}
.home-deck {position: relative; min-width: 0; padding: clamp(28px, 3.4vw, 54px); display: flex; flex-direction: column; gap: 26px}
.home-deck-copy {margin: auto 0; max-width: 34em}
.home-deck-eyebrow {margin: 0 0 10px; font-size: 12px; font-weight: 650; letter-spacing: .14em; opacity: .74}
.home-deck-greeting {margin: 0 0 14px; font-size: clamp(30px, 3vw, 42px); line-height: 1.24; font-weight: 700; word-break: keep-all; overflow-wrap: anywhere; text-wrap: balance}
.home-deck-subtitle {margin: 0; font-size: 13.5px; line-height: 1.8; opacity: .82}
.home-deck-foot {display: flex; flex-direction: column; gap: 14px; padding-top: 6px}
.home-stats {display: flex; flex-wrap: wrap; gap: 10px 26px; margin: 0}
.home-stat {display: flex; align-items: baseline; gap: 8px}
.home-stat dt {font-size: 12px; opacity: .7}
.home-stat dd {margin: 0; font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.4px}
.home-deck-links {display: flex; flex-wrap: wrap; gap: 10px}
.home-deck-link {display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border-radius: 999px; font-size: 12.5px; border: 1px solid var(--border); background: var(--surface); color: var(--text); transition: border-color .15s, color .15s, background-color .15s}
.home-deck-link:hover {border-color: var(--accent); color: var(--accent)}
.home-active .wallpaper::after {content: ''; position: absolute; inset: 0; background: linear-gradient(168deg, rgb(0 0 0 / .30), rgb(0 0 0 / .48) 55%, rgb(0 0 0 / .62)); pointer-events: none}.instance-device {display: flex; flex-wrap: wrap; gap: 4px 10px; color: var(--muted); font-size: 11px; overflow-wrap: anywhere}
.instance-device > span:first-child {text-transform: uppercase; flex-shrink: 0}
.home-main {min-width: 0; padding: clamp(26px, 3.2vw, 52px) clamp(26px, 3.6vw, 56px); background: var(--bg); color: var(--text); border-bottom-left-radius: var(--theme-radius-panel, 26px)}
.home-main-heading {display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid var(--border); margin-bottom: 24px}
.home-main-heading h2 {margin: 0; font-size: clamp(22px, 2.2vw, 30px); letter-spacing: -.6px}
.home-instance-grid {display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 20px; align-content: start}
.home-instance-grid .instance-card {display: flex; flex-direction: column; min-width: 0; padding: 24px; color: var(--text); text-decoration: none; border-radius: var(--theme-radius-card, 24px); border-bottom-left-radius: var(--theme-radius-card, 24px)}
.home-instance-grid .instance-card-heading {display: flex; align-items: center; justify-content: space-between; gap: 12px}
.home-instance-grid .home-instance-icon {width: 44px; height: 44px; display: grid; place-items: center; border-radius: 14px}
.home-instance-grid .instance-card h3 {margin: 22px 0 10px; font-size: 20px; letter-spacing: -.3px; overflow-wrap: anywhere}
.home-instance-grid .instance-card-footer {margin-top: auto; padding-top: 22px; display: flex; align-items: center; justify-content: space-between; gap: 12px}
.home-instance-grid .instance-card-footer > span {font-size: 12px; font-weight: 650; min-width: 0; overflow-wrap: anywhere}
.home-instance-grid .instance-card-footer > svg {background: var(--accent-soft); border-radius: 50%; box-sizing: content-box; padding: 7px}
.home-instance-empty {grid-column: 1 / -1; width: 100%; min-height: 180px; display: flex; align-items: center; justify-content: center; gap: 12px; border: 1px dashed var(--border); border-radius: 16px; color: var(--accent); background: transparent; font-size: 14px}
.home-instance-empty:hover {border-color: var(--accent)}
[data-theme='light'] .home-deck, [data-theme='dark'] .home-deck {color: #fff; text-shadow: 0 2px 18px rgb(0 0 0 / .45)}
[data-theme='light'] .home-deck-link, [data-theme='dark'] .home-deck-link {border-color: rgb(255 255 255 / .42); background: rgb(255 255 255 / .14); color: #fff; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px)}
[data-theme='light'] .home-deck-link:hover, [data-theme='dark'] .home-deck-link:hover {border-color: rgb(255 255 255 / .78); background: rgb(255 255 255 / .24); color: #fff}
@media (prefers-reduced-transparency: reduce), (forced-colors: active) {
  .home-deck {color: var(--text); background: var(--surface-muted); text-shadow: none}
  .home-deck-link {border-color: var(--border); background: var(--surface); color: var(--text)}
}
[data-theme='minimal'] .home-deck, [data-theme='extreme'] .home-deck {color: var(--text); background: var(--surface-muted); text-shadow: none}
[data-theme='minimal'] .main-shell > main:has(> .home-editorial), [data-theme='extreme'] .main-shell > main:has(> .home-editorial) {min-height: calc(var(--viewport-height) - var(--topbar-height))}
.head-grid {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-bottom: 24px}
.head-card {padding: 22px; display: grid; gap: 15px}
.head-card-header {display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap}
.head-card-header > span, .head-card > span {display: flex; align-items: center; gap: 8px; color: var(--muted)}
.head-card code {font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); font-size: 13px; overflow-wrap: anywhere; user-select: all}
.branch-summary {display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12px}
.commit-panel .panel-heading {flex-wrap: wrap; gap: 12px}
.update-summary {display: flex; align-items: center; flex-wrap: wrap; gap: 12px; color: var(--muted); font-size: 12px}
.update-summary > span {display: flex; align-items: center; gap: 6px}
.update-summary .update-available {color: var(--accent)}
.commit-row {display: flex; gap: 16px; padding: 19px 24px; border-top: 1px solid var(--border)}
.commit-node {margin-top: 2px; color: var(--accent); flex-shrink: 0}
.commit-detail {min-width: 0; flex: 1}
.commit-subject {line-height: 1.7; overflow-wrap: anywhere}
.commit-ref {display: inline-block; font-size: 10px; padding: 0 7px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: 5px; margin-left: 9px; white-space: nowrap}
.commit-ref.upstream {background: var(--accent-soft); color: var(--accent)}
.commit-meta {display: flex; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 11px; color: var(--muted); margin-top: 8px}
.commit-meta code {font-family: var(--theme-font-mono, "JetBrains Mono", "JetBrains Mono NL", "Cascadia Code", "Consolas", "Microsoft YaHei", monospace); user-select: all}
.commit-detail details {margin-top: 6px; color: var(--muted); font-size: 12px}
.commit-detail summary {cursor: pointer}
.commit-detail pre {white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; line-height: 1.8; color: var(--text)}
.commit-pagination {display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 18px 24px; border-top: 1px solid var(--border)}
.commit-pagination > span {margin-right: auto; color: var(--muted); font-size: 12px}
@media (max-width: 950px) {
  .instance-tabs {display: none}
  .topbar {gap: 8px}
  .sidebar {z-index: 100}
  .topbar-right {gap: 8px}
  .topbar-right .connection-label span {display: none}
  .breadcrumb .instance-caption strong {max-width: 100px}
  .breadcrumb {gap: 6px; flex: 1}
  .breadcrumb > a[href$='/task/Alas'], .breadcrumb > a[href$='/task/Alas'] + span {display: none}
  .update-notice {font-size: 10px; padding: 5px 6px}
  .update-notice > svg {display: none}
  .head-grid {grid-template-columns: 1fr}
  .head-card {padding: 18px}
  .commit-row {padding: 16px; gap: 10px}
  .commit-pagination {padding: 16px; gap: 8px}
  .home-editorial {grid-template-columns: 1fr}
  .home-deck {min-height: 248px; padding: 26px 30px}
  .home-deck-greeting {font-size: clamp(28px, 7vw, 40px)}
  .home-main {padding: 30px 26px}
}

@media (max-width: 620px) {
  .home-deck {min-height: 210px; padding: 22px 20px; gap: 16px}
  .home-deck-eyebrow, .home-deck-subtitle {display: none}
  .home-main {padding: 24px 18px}
  .home-main-heading {align-items: flex-start; flex-direction: column; gap: 14px}
  .home-instance-grid {gap: 16px}
}

/* 旧版外壳里，内容区那两列（\`.instance-page-grid\` / \`.task-config-legacy\`）的高度预算也要跟着这一行走，
   否则它们按旧值算出来的高度会把整壳顶出视口，页面就能滚、接缝就露出来了。 */
:root[data-tab-size] .app-shell.legacy-shell:has(.topbar-tab-size) {--legacy-page-nav-height: calc(56px * var(--row-scale, 1))}

/* 形状跟着主题家族走：light / dark 是操场形（四角半圆），简约与两个旧版主题保持上方矩形并贴住下方栏（浏览器标签页那样）。 */
:root[data-theme='minimal'], :root[data-theme='legacy-light'], :root[data-theme='legacy-dark'] {--instance-tab-radius: 0px}
:root[data-theme='legacy-light'] .instance-tab, :root[data-theme='legacy-dark'] .instance-tab {margin-bottom: -1px}
/* 拉开「栏底边线 → 实例名」这一段，三个新版主题一致。
   只给实例名加上外边距：顶栏高度、标签页位置、栏底边线都不动。 */
:root[data-tab-size] .app-shell:not(.legacy-shell) .main-shell main .page-title {margin-top: 48px}
/* 旧版底角是直角，下沿重线不会探出圆角，保持用户认可的那条下边框。 */
:root[data-theme='legacy-light'] .instance-tab.current, :root[data-theme='legacy-dark'] .instance-tab.current {box-shadow: inset 0 -2px 0 var(--accent)}
.dev-intro {display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 22px;margin-bottom:20px}
.dev-intro > div {display:flex;align-items:flex-start;gap:12px;min-width:0}
.dev-intro strong {display:block;font-size:14px;margin-bottom:4px}
.dev-intro p {color:var(--muted);font-size:12px;line-height:1.7}
.dev-control-block {display:flex;align-items:center;justify-content:space-between;gap:24px;padding:20px 24px;border-bottom:1px solid var(--border)}
.dev-control-block:last-child {border-bottom:0}
.dev-control-label {display:flex;flex-direction:column;gap:5px;min-width:150px}
.dev-control-label strong {font-size:14px;font-weight:550}
.dev-control-label span {font-size:12px;line-height:1.65;color:var(--muted)}
.dev-button-row {display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:10px}
.dev-inline-controls {display:flex;align-items:center;justify-content:flex-end;gap:14px;min-height:40px}
.dev-feedback-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:20px 24px}
.dev-feedback-grid > div {display:grid;align-content:start;gap:9px;min-width:0}
.dev-state-box {min-height:126px;border:1px dashed var(--border);border-radius:14px;background:color-mix(in srgb,var(--surface-muted) 72%,transparent);overflow:hidden}
.dev-state-box .loading {min-height:126px}
.dev-state-box .empty {min-height:126px;padding:18px}
.dev-control-block .monitor-segmented {flex-shrink:0}

.dev-surface-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:22px 24px;border-bottom:1px solid var(--border)}
.dev-surface-sample {position:relative;isolation:isolate;min-height:120px;padding:18px;border:1px solid var(--border);border-radius:20px;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;overflow:hidden}
.dev-surface-sample > :not(.glass-material) {position:relative;z-index:1}
.dev-surface-sample span {font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted)}
.dev-surface-sample strong {font-size:14px}
.dev-surface-sample small {color:var(--muted);font-family:monospace}
.dev-surface-plain {background:var(--surface)}
.dev-surface-muted {background:var(--surface-muted)}
.dev-surface-accent {background:var(--accent-soft)}
.dev-surface-glass {background:transparent}
.dev-shadow-grid {display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;padding:24px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--surface-muted) 44%,transparent)}
.dev-shadow-sample {min-height:104px;padding:16px;border-radius:18px;background:var(--surface);display:flex;flex-direction:column;justify-content:flex-end;gap:8px}
.dev-shadow-sample strong {font-size:13px}
.dev-shadow-sample code {font-size:9px;color:var(--muted);white-space:normal;overflow-wrap:anywhere}
.dev-radius-grid {display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:12px;padding:20px 24px}
.dev-radius-grid > div {display:grid;justify-items:center;gap:7px;color:var(--muted);font-size:10px}
.dev-radius-grid span {display:block;width:54px;height:54px;border:1px solid color-mix(in srgb,var(--accent) 28%,var(--border));background:var(--accent-soft)}
.dev-token-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--border)}
.dev-token {display:flex;align-items:center;gap:12px;padding:16px 18px;background:var(--surface);min-width:0}
.dev-token > span {width:38px;height:38px;border-radius:12px;border:1px solid color-mix(in srgb,var(--border) 70%,#888);flex:0 0 auto;box-shadow:inset 0 1px 0 #fff4}
.dev-token div {display:grid;gap:4px;min-width:0}
.dev-token strong {font-size:12px}
.dev-token code {font-size:10px;color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.dev-type-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--border)}
.dev-type-grid > div {padding:20px 24px;background:var(--surface);min-width:0;display:grid;gap:7px;align-content:center}
.dev-type-grid h1 {font-size:34px;letter-spacing:-1px}
.dev-type-grid h2 {font-size:23px}
.dev-type-grid h3 {font-size:17px}
.dev-type-grid p {line-height:1.8;font-size:13px}
.dev-type-grid code {justify-self:start;padding:7px 9px;border-radius:8px;background:var(--surface-muted);font-size:12px}
.dev-numeric {font-size:22px;font-variant-numeric:tabular-nums}
.dev-ellipsis {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;font-size:13px}
.dev-layout-grid {display:grid;grid-template-columns:minmax(220px,.8fr) minmax(260px,1fr) minmax(280px,1.2fr);gap:18px;padding:22px 24px}
.dev-layout-grid > div {min-width:0;display:grid;gap:10px;align-content:start}
.dev-nav-preview {padding:16px;border:1px solid var(--border);border-radius:20px;background:color-mix(in srgb,var(--surface) 76%,transparent)}
.dev-nav-preview .primary-nav {margin:0}
.dev-nav-preview .task-group-button {margin-top:8px}
.dev-submenu-list {margin-top:4px;padding:6px;border:1px solid var(--border);border-radius:13px;background:var(--surface-muted)}
.dev-card-preview .instance-card {min-height:230px;text-decoration:none}
.dev-metric-preview .summary-metrics {display:grid;grid-template-columns:1fr;gap:10px}
.dev-metric-preview .summary-metrics section {padding:16px}
.dev-table-preview {border-bottom:1px solid var(--border)}
.dev-table-preview .table-toolbar {padding:14px 20px;margin:0;border-bottom:1px solid var(--border)}
.dev-table-preview .input-icon {max-width:260px}
.dev-table-preview .table-scroll {max-height:260px}
.dev-scroll-sample {padding:18px 24px}
.dev-scroll-sample > div {height:150px;overflow:auto;border:1px solid var(--border);border-radius:14px;background:var(--surface-muted);padding:12px 14px}
.dev-scroll-sample p {padding:7px 0;border-bottom:1px solid color-mix(in srgb,var(--border) 60%,transparent);font-size:12px;color:var(--muted)}
.dev-scroll-sample p:last-child {border-bottom:0}
.dev-scroll-sample code {display:inline-block;width:30px;color:var(--accent)}

@media (max-width: 1200px) {
  .dev-blur-presets {grid-template-columns:repeat(3,minmax(0,1fr))}
  .dev-surface-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
  .dev-shadow-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
  .dev-radius-grid {grid-template-columns:repeat(5,minmax(0,1fr))}
  .dev-token-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
  .dev-layout-grid {grid-template-columns:1fr 1fr}
  .dev-metric-preview {grid-column:1/-1}
  .dev-metric-preview .summary-metrics {grid-template-columns:repeat(3,minmax(0,1fr))}
}

@media (max-width: 950px) {
  .dev-intro,.dev-control-block {align-items:stretch;flex-direction:column}
  .dev-button-row,.dev-inline-controls {justify-content:flex-start}
  .dev-feedback-grid {grid-template-columns:1fr}
  .dev-effect-lab {grid-template-columns:1fr;padding:18px}
  .dev-effect-stage {min-height:280px}
  .dev-effect-glass {inset:28px}
  .dev-surface-grid,.dev-shadow-grid,.dev-token-grid,.dev-type-grid,.dev-layout-grid {grid-template-columns:1fr}
  .dev-radius-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
  .dev-metric-preview {grid-column:auto}
  .dev-metric-preview .summary-metrics {grid-template-columns:1fr}
}

@media (max-width: 560px) {
  .dev-blur-presets {grid-template-columns:repeat(2,minmax(0,1fr));padding:16px}
  .dev-effect-stage {min-height:240px}
  .dev-effect-glass {inset:18px;padding:18px}
  .dev-effect-glass strong {font-size:18px}
  .dev-effect-wallpaper > span {font-size:30px;left:18px;bottom:16px}
  .dev-surface-grid,.dev-shadow-grid,.dev-radius-grid {padding:16px}
  .dev-radius-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
}
/* 快捷工具下方的状态说明。 */
.dev-hint {margin: 10px 0 0; color: var(--muted); font-size: 12px; line-height: 1.7}

/* 动效控制台与快捷工具：按钮组选中态需要可见反馈（aria-pressed 是语义源，也是样式源） */
.dev-button-row .button.secondary[aria-pressed='true'] {border-color: var(--accent); color: var(--accent); background: var(--accent-soft)}
/* 旧版主题配色：MD3 靛紫。
   取值来自 master 的 assets/gui/css/light-alas.css 与 dark-alas.css；
   变量键与 minimal-palette.css 一一对应，组件只消费 --theme-* 契约变量。 */
:root {
  color-scheme: light;
  /* 基础色板 */
  --bg: #f9f9f9; --surface: #ffffff; --surface-muted: #f6f6f9;
  --text: #2c2c2c; --muted: #777777; --border: #e0e0e0;
  --accent: #4e4c97; --accent-hover: #3f3d79; --accent-soft: #e8e8f8;
  --secondary: #7a77bb; --secondary-soft: #eeedfa;
  --sidebar: var(--surface); --radius: 8px; --shadow: 0 1px 2px rgb(0 0 0 / .1);
  --red: #c9342c; --green: #248a3d; --green-soft: #e8f4ec;
  --sidebar-width: 240px; --topbar-height: 56px;
  --glass-tint: var(--surface); --glass-edge: var(--border); --glass-shadow: none;
  --syntax-key: var(--accent); --syntax-string: var(--secondary); --syntax-value: #7b5ea7;
  --syntax-comment: var(--muted); --syntax-punctuation: var(--text);
  --theme-font-sans: 'MiSans', "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
  --theme-font-mono: 'JetBrains Mono', 'JetBrains Mono NL', Consolas, "Cascadia Code", "Microsoft YaHei", monospace;

  /* 契约层 —— 颜色 */
  --theme-bg: var(--bg); --theme-surface: var(--surface); --theme-surface-muted: var(--surface-muted);
  --theme-text: var(--text); --theme-muted: var(--muted); --theme-border: var(--border);
  --theme-accent: var(--accent); --theme-accent-hover: var(--accent-hover); --theme-accent-soft: var(--accent-soft);
  --theme-on-accent: #ffffff;
  --theme-on-danger: #ffffff;
  --theme-danger: var(--red); --theme-danger-soft: #fcebeb;
  --theme-success: var(--green); --theme-success-soft: var(--green-soft);
  --theme-warning: #805a14; --theme-warning-soft: #faf0d6; --theme-info: var(--secondary);
  --theme-sidebar: var(--surface); --theme-glass: var(--surface); --theme-glass-edge: var(--border);
  --theme-glass-shadow: none; --theme-material-filter: none; --theme-chrome-filter: none;
  --theme-popover-filter: none; --theme-overlay-filter: none; --theme-overlay: color-mix(in srgb, var(--bg) 30%, transparent);

  /* 契约层 —— 形状与阴影：遵循 Material Design 3 (MD3) 规范 */
  --theme-radius-control: 8px; --theme-radius-button: 20px; --theme-radius-panel: 16px;
  --theme-radius-card: 12px; --theme-radius-popover: 12px; --theme-radius-modal: 28px; --theme-radius-pill: 999px;
  --theme-shadow-panel: 0 1px 2px rgb(0 0 0 / .05);
  --theme-shadow-popover: 0 4px 12px rgb(0 0 0 / .08);
  --theme-shadow-modal: 0 8px 24px rgb(0 0 0 / .12);
  --theme-shadow-floating: 0 2px 6px rgb(0 0 0 / .08);
  --theme-shadow-hover: 0 2px 8px rgb(0 0 0 / .08);

  /* 契约层 —— 导航：选中/悬停统一用浅靛紫底 + 深靛紫字 */
  --theme-nav-text: var(--text); --theme-nav-icon: #2c2c2c;
  --theme-nav-active-bg: #e8e8f8; --theme-nav-active-text: #1a1861;
  --theme-nav-expanded-bg: var(--accent-soft); --theme-nav-hover-bg: var(--accent-soft);
  --theme-nav-popover-bg: var(--surface); --theme-nav-popover-edge: var(--border);
  --theme-nav-popover-shadow: 0 1px 2px rgb(0 0 0 / .1);
  --theme-primary-bg: var(--accent); --theme-primary-hover: var(--accent-hover);

  /* 契约层 —— 表单：旧版聚焦不加光圈，只换底边框颜色 */
  --theme-input-bg: #f6f6f9; --theme-input-text: var(--text); --theme-input-border: #8e8e8e;
  --theme-focus: var(--accent); --theme-focus-ring: transparent;
  --theme-toggle-off: #79747e; --theme-toggle-on: #4e4c97; --theme-toggle-knob: #ffffff; --theme-toggle-shadow: none;
  --theme-segment-bg: var(--surface-muted); --theme-segment-border: var(--border);
  --theme-segment-indicator: var(--accent-soft);
  --theme-toast-bg: var(--text); --theme-toast-text: var(--surface); --theme-toast-error-bg: var(--red);
  --theme-error-bg: var(--theme-danger-soft); --theme-error-border: var(--red);
  --theme-selection: var(--accent-soft); --theme-scrollbar-thumb: #b5b5b5;
  --theme-status-stopped-bg: var(--surface-muted); --theme-status-stopped-text: var(--muted);

  /* 契约层 —— 日志 */
  --theme-log-debug: #85929e; --theme-log-info: #0ea5e9; --theme-log-warning: #eab308;
  --theme-log-error: #ef4444; --theme-log-critical: #f43f5e; --theme-log-time: #06b6d4;
  --theme-log-true: #22c55e; --theme-log-false: #ef4444; --theme-log-null: #d946ef;
  --theme-log-path: #a855f7; --theme-log-attr: #14b8a6; --theme-log-search: #fbbf2445;
  --theme-resource-0-bg: var(--accent-soft); --theme-resource-0-text: var(--accent);
  --theme-resource-1-bg: var(--secondary-soft); --theme-resource-1-text: var(--secondary);
  --theme-resource-2-bg: var(--accent-soft); --theme-resource-2-text: var(--accent);
  --theme-resource-3-bg: var(--secondary-soft); --theme-resource-3-text: var(--secondary);
  --theme-preview-bg: var(--surface-muted); --theme-preview-text: var(--text); --theme-preview-muted: var(--muted);
  --theme-login-art-bg: var(--accent-soft); --theme-login-art-text: var(--accent);
  --theme-instance-icon-bg: var(--accent); --theme-instance-icon-shadow: none;

  /* 契约层 —— 标题：旧版是普通实色标题，不做玻璃字 */
  --theme-title-fill: none; --theme-title-color: var(--text); --theme-title-stroke: var(--text);
  --theme-title-highlight-stroke: var(--text); --theme-title-glass: var(--surface); --theme-title-shadow: none;
}

/* 深色变体是独立主题值，与前缀式反代的主题名一一对应。 */
:root[data-theme='legacy-dark'] {
  color-scheme: dark;
  --bg: #282a2f; --surface: #2f3136; --surface-muted: #36393f;
  --text: #eeeeee; --muted: #adb5bd; --border: #484b52;
  --accent: #b4b1e5; --accent-hover: #928fcf; --accent-soft: #3e3b6a;
  --secondary: #928fcf; --secondary-soft: #363560;
  --shadow: 0 1px 2px rgb(0 0 0 / .3);
  --red: #f28b82; --green: #4ade80; --green-soft: #24362b;
  --syntax-value: #c9a7f0;

  --theme-danger-soft: #4a2c30;
  --theme-on-danger: #282a2f;
  --theme-warning: #e7c078; --theme-warning-soft: #403723;
  --theme-overlay: color-mix(in srgb, var(--bg) 30%, transparent);

  /* 深色下选中菜单改用中靛紫底 + 浅靛紫字 */
  --theme-nav-icon: #dfdcfb;
  --theme-nav-active-bg: #3e3b6a; --theme-nav-active-text: #dfdcfb;
  --theme-nav-popover-bg: var(--surface); --theme-nav-popover-edge: #40444b;
  --theme-nav-popover-shadow: 0 2px 10px rgb(0 0 0 / .45);
  --theme-primary-bg: #7a77bb; --theme-primary-hover: #928fcf; --theme-on-accent: #1a1861;

  --theme-input-bg: #36393f; --theme-input-border: var(--border);
  --theme-toggle-off: #938f99; --theme-toggle-on: #7a77bb; --theme-toggle-knob: #ffffff;
  --theme-segment-indicator: #3e3b6a;
  --theme-selection: #3e3b6a; --theme-scrollbar-thumb: #5a5e66;
  --theme-shadow-panel: 0 1px 2px rgb(0 0 0 / .2);
  --theme-shadow-popover: 0 4px 12px rgb(0 0 0 / .25);
  --theme-shadow-modal: 0 8px 24px rgb(0 0 0 / .35);
  --theme-shadow-floating: 0 2px 6px rgb(0 0 0 / .2);
  --theme-shadow-hover: 0 2px 8px rgb(0 0 0 / .25);
  --theme-instance-icon-bg: #7a77bb;
}
/* 共用语义变量映射；材质由当前主题提供。 */
html, body {font-family: var(--theme-font-sans); color: var(--theme-text); background: var(--theme-bg)}
body {background-attachment: fixed}
::selection {background: var(--theme-selection)}
::-webkit-scrollbar-thumb {background: var(--theme-scrollbar-thumb)}

input, select, textarea {
  color: var(--theme-input-text);
  background: var(--theme-input-bg);
  border-color: var(--theme-input-border);
  border-radius: var(--theme-radius-control);
}
input:focus, select:focus, textarea:focus {border-color: var(--theme-focus); box-shadow: 0 0 0 3px var(--theme-focus-ring)}
button:focus-visible, a:focus-visible, summary:focus-visible {outline-color: var(--theme-focus)}

.sidebar, .right-rail, .panel, .resource-card {
  background: var(--theme-glass);
  border-color: var(--theme-glass-edge);
  box-shadow: var(--theme-shadow-panel);
  -webkit-backdrop-filter: var(--theme-material-filter, none);
  backdrop-filter: var(--theme-material-filter, none);
}
.sidebar {background: var(--theme-sidebar); border-radius: 0 var(--theme-radius-panel) var(--theme-radius-panel) 0}
.right-rail {border-radius: 0 0 0 var(--theme-radius-panel); border-top: 0 !important; box-shadow: var(--theme-shadow-floating)}
.panel, .resource-card {border-radius: var(--theme-radius-panel)}
.summary-metrics-panel .summary-metric-card,
.summary-metrics-panel .summary-metrics section {
  border-radius: var(--theme-radius-control, 12px);
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.instance-card {border-radius: var(--theme-radius-card)}

.glass-material {background: var(--theme-glass); -webkit-backdrop-filter: var(--theme-chrome-filter, none); backdrop-filter: var(--theme-chrome-filter, none)}
.glass-material-lens > .glass {box-shadow: inset 0 1px 0 var(--theme-glass-edge) !important}

.primary-nav a {color: var(--theme-nav-text)}
.primary-nav a svg, .task-group-icon {color: var(--theme-nav-icon)}
.primary-nav a:hover {background: var(--theme-nav-hover-bg)}
.primary-nav a.active {background: var(--theme-nav-active-bg); color: var(--theme-nav-active-text); box-shadow: none}
.primary-nav a.active svg {color: inherit}
.sidebar-label, .sidebar-label button, .breadcrumb, .breadcrumb span {color: var(--theme-muted)}
.task-submenu-item, .task-group-button {color: var(--theme-nav-text)}
.task-group-button:hover, .task-submenu-item:hover {color: var(--theme-text); background: var(--theme-nav-hover-bg)}
.task-group-button {position: relative}
.task-group-button.active, .task-submenu-item.active {color: var(--theme-accent); background: var(--theme-nav-active-bg); box-shadow: none}
.task-group-button.expanded {color: var(--theme-accent); background: var(--theme-nav-expanded-bg); border-color: transparent; box-shadow: none}
.task-group-button.active.expanded {background: var(--theme-nav-expanded-bg); box-shadow: none}
.task-submenu-dot {background: var(--theme-muted)}
.task-submenu-item:hover .task-submenu-dot, .task-submenu-item.active .task-submenu-dot {background: var(--theme-accent)}

.task-submenu-flyout, .instance-menu {
  background: var(--theme-nav-popover-bg);
  border-color: var(--theme-nav-popover-edge);
  border-radius: var(--theme-radius-popover);
  box-shadow: var(--theme-nav-popover-shadow);
  -webkit-backdrop-filter: var(--theme-popover-filter, none);
  backdrop-filter: var(--theme-popover-filter, none);
}
.task-submenu-flyout {
  isolation: isolate;
  background: var(--theme-surface);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.task-submenu-item {border: 1px solid transparent}
.task-submenu-item.active {border-color: transparent}
.task-submenu-item.active .task-submenu-dot {box-shadow: none}
.instance-menu button:hover, .instance-menu button:focus-visible, .instance-menu button[aria-checked='true'] {background: var(--theme-accent-soft); color: var(--theme-accent)}

.topbar {border-color: var(--theme-glass-edge); border-bottom: none !important; box-shadow: var(--theme-glass-shadow)}
.connection-label, .eyebrow, .text-button, .data-table summary {color: var(--theme-accent)}
.connection-banner {background: var(--theme-warning-soft); color: var(--theme-warning)}

.button {border-radius: var(--theme-radius-button)}
.button.primary, [data-theme='dark'] .button.primary {background: var(--theme-primary-bg); color: var(--theme-on-accent)}
.button.primary:hover:not(:disabled) {background: var(--theme-primary-hover)}
.button.secondary {background: var(--theme-surface); color: var(--theme-text); border-color: var(--theme-border)}
.button.secondary:hover {border-color: var(--theme-accent); color: var(--theme-accent)}
.button.danger {background: var(--theme-danger); color: var(--theme-on-accent)}
.button.danger.subtle {background: var(--theme-danger-soft); color: var(--theme-danger); border-color: color-mix(in srgb, var(--theme-danger) 18%, transparent)}
.icon-button {color: var(--theme-muted)}
.icon-button:hover {background: var(--theme-surface-muted); color: var(--theme-accent)}

.toggle {background: var(--theme-toggle-off)}
.toggle > span {background: var(--theme-toggle-knob); box-shadow: var(--theme-toggle-shadow)}
.toggle.on {background: var(--theme-toggle-on)}

.monitor-segmented {background: var(--theme-segment-bg); border-color: var(--theme-segment-border)}
.monitor-segmented .segmented-indicator {background: var(--theme-segment-indicator)}
.monitor-segmented button {color: var(--theme-muted)}
.monitor-segmented button:hover, .monitor-segmented button[aria-selected='true'], [data-theme='dark'] .monitor-segmented button[aria-selected='true'] {color: var(--theme-text)}

.page-title h1 {
  color: var(--theme-title-color);
  background-image: var(--theme-title-fill);
  -webkit-text-stroke-color: var(--theme-title-stroke);
  text-shadow: var(--theme-title-shadow);
}
.page-title h1::before {background: var(--theme-title-glass)}
.page-title h1::after {-webkit-text-stroke-color: var(--theme-title-highlight-stroke)}

.status.running, .task-state.running {color: var(--theme-success); background: var(--theme-success-soft)}
.status.stopped {color: var(--theme-status-stopped-text); background: var(--theme-status-stopped-bg)}
.status.error {color: var(--theme-danger); background: var(--theme-danger-soft)}
.status.updating {color: var(--theme-warning); background: var(--theme-warning-soft)}
.scheduler-status.running {color: var(--theme-text)}

.resource-heading, .resource-foot, .resource-value small, .count-badge, .task-order, .task-state, .task-row time, .task-row > svg, .empty, .empty > svg, .empty strong, .input-icon {color: var(--theme-muted)}
.resource-heading > div {background: var(--theme-resource-0-bg); color: var(--theme-resource-0-text)}
.resource-1 .resource-heading > div {background: var(--theme-resource-1-bg); color: var(--theme-resource-1-text)}
.resource-2 .resource-heading > div {background: var(--theme-resource-2-bg); color: var(--theme-resource-2-text)}
.resource-3 .resource-heading > div {background: var(--theme-resource-3-bg); color: var(--theme-resource-3-text)}
.resource-heading > div.resource-image-wrap {background: transparent}
.instance-card:hover {border-color: color-mix(in srgb, var(--theme-accent) 35%, var(--theme-border)); box-shadow: var(--theme-shadow-hover)}
.home-instance-icon {background: var(--theme-instance-icon-bg); color: var(--theme-on-accent); box-shadow: var(--theme-instance-icon-shadow)}

.preview-screen {background: var(--theme-preview-bg); color: var(--theme-preview-text)}
.preview-screen > span, .preview-screen > .preview-resolution, .radar {color: var(--theme-preview-muted)}
.live-label {color: var(--theme-success); border-color: color-mix(in srgb, var(--theme-success) 22%, transparent)}
.live-label i {background: var(--theme-success)}

.log-content {color: var(--theme-text)}
.lvl-debug {color: var(--theme-log-debug)}
.lvl-info {color: var(--theme-log-info)}
.lvl-warning {color: var(--theme-log-warning)}
.lvl-error {color: var(--theme-log-error)}
.lvl-critical {color: var(--theme-log-critical)}
.log-ts, .hl-time {color: var(--theme-log-time)}
.hl-bool-true {color: var(--theme-log-true)}
.hl-bool-false {color: var(--theme-log-false)}
.hl-none {color: var(--theme-log-null)}
.hl-path {color: var(--theme-log-path)}
.hl-attr {color: var(--theme-log-attr)}
.log-search-match {background: var(--theme-log-search)}

.error-box {color: var(--theme-danger); background: var(--theme-error-bg); border-color: var(--theme-error-border)}
.toast {background: var(--theme-toast-bg); color: var(--theme-toast-text); box-shadow: var(--theme-shadow-popover)}
.toast.error {background: var(--theme-toast-error-bg); color: var(--theme-on-accent)}
.modal {background: var(--theme-surface); color: var(--theme-text); border-color: var(--theme-glass-edge); border-radius: var(--theme-radius-panel); box-shadow: var(--theme-shadow-modal)}
/* 弹窗只是小窗，遮罩要能让背后的页面仍然看得见：一律半透明且不模糊。 */
.modal::backdrop {background: var(--theme-overlay, color-mix(in srgb, var(--bg) 30%, transparent)); backdrop-filter: none}

.login-page {background: var(--theme-bg)}
.login-art {background: var(--theme-login-art-bg); color: var(--theme-login-art-text)}
.login-art > span {color: var(--theme-login-art-text)}
.login-card {background: var(--theme-surface)}

.yaml-editor, .yaml-editor .cm-editor, .yaml-editor .cm-gutters, .field-row-multiline textarea, .storage-field pre {background: var(--theme-input-bg)}
.yaml-editor {border-color: var(--theme-border)}
.yaml-editor:focus-within {border-color: var(--theme-accent)}

/* Secondary surfaces and queue hierarchy inherit theme colors instead of literals. */
.scheduler-widget, .schedule-summary, .nav-search, .input-icon, .count-badge {background: var(--theme-surface-muted); border-color: var(--theme-border)}
.group-nav {
  background: var(--theme-glass);
  border: 1px solid var(--theme-glass-edge);
  box-shadow: var(--theme-shadow-panel);
  -webkit-backdrop-filter: var(--theme-material-filter, none);
  backdrop-filter: var(--theme-material-filter, none);
}
.group-nav a {
  color: var(--theme-nav-text);
  font-weight: 500;
  transition: color .16s ease, background-color .16s ease, box-shadow .16s ease;
}
.group-nav a:hover,
.group-nav a:focus-visible {
  color: var(--theme-text);
  background: var(--theme-nav-hover-bg);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 28%, transparent);
}
.group-nav a:active {
  color: var(--theme-nav-active-text);
  background: var(--theme-nav-active-bg);
}
.rail-queue-group.running {background: color-mix(in srgb, var(--theme-surface) 94%, transparent); border-color: color-mix(in srgb, var(--theme-glass-edge) 90%, var(--theme-border))}
.rail-queue-group.pending {background: color-mix(in srgb, var(--theme-surface) 72%, transparent); border-color: color-mix(in srgb, var(--theme-border) 64%, transparent)}
.rail-queue-group.waiting {background: color-mix(in srgb, var(--theme-surface) 46%, transparent); border-color: color-mix(in srgb, var(--theme-border) 42%, transparent)}
.rail-task-item:hover {background: color-mix(in srgb, var(--theme-surface) 86%, transparent)}

@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  .glass-material, .sidebar, .right-rail, .instance-menu, .task-submenu-flyout, .group-nav, .panel, .resource-card {background: var(--theme-surface); -webkit-backdrop-filter: none; backdrop-filter: none}
}

/* 全站表单共用现有主题契约，外部 theme.css 仍可覆盖颜色与圆角。 */
:root {
  --form-height: 40px;
  --form-edge: color-mix(in srgb, var(--theme-input-border) 75%, var(--theme-muted));
  --form-shadow: 0 1px 2px rgb(0 0 0 / .04);
}

input:where(:not([type='checkbox']):not([type='radio']):not([type='range'])), select, textarea {
  min-height: var(--form-height);
  padding: 9px 12px;
  border: 1px solid var(--form-edge);
  border-radius: var(--theme-radius-control);
  background: var(--theme-input-bg);
  color: var(--theme-input-text);
  line-height: 1.5;
  box-shadow: var(--form-shadow);
  transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
}
input::placeholder, textarea::placeholder {color: var(--theme-muted); opacity: .85}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--theme-focus);
  box-shadow: 0 0 0 3px var(--theme-focus-ring);
}
input:disabled, select:disabled, textarea:disabled {
  opacity: .55;
  cursor: not-allowed;
  -webkit-text-fill-color: currentColor;
}
input[readonly] {color: var(--theme-muted); box-shadow: none}
input[aria-invalid='true'], select[aria-invalid='true'], textarea[aria-invalid='true'] {
  border-color: var(--theme-danger);
  background: color-mix(in srgb, var(--theme-danger) 4%, var(--theme-input-bg));
}
input[aria-invalid='true']:focus, select[aria-invalid='true']:focus, textarea[aria-invalid='true']:focus {
  box-shadow: 0 0 0 3px var(--theme-danger-soft);
}

/* 下拉框的触发器和展开列表共用主题，浏览器 select 只桥接变更事件。 */
.select-control, .password-control {position: relative; display: inline-flex; min-width: 0; max-width: 100%; vertical-align: middle}
.select-control > select {display: none}


.field-control > .select-control, .field-control > .password-control {width: 100%; font-size: 13px}
.password-control > input {width: 100%; padding-right: 44px !important}
.password-reveal {position: absolute; right: 0; top: 0; bottom: 0; width: 42px; display: grid; place-items: center; color: var(--theme-muted); border-radius: var(--theme-radius-control)}
.password-reveal:hover:not(:disabled) {color: var(--theme-accent)}
.password-reveal:focus-visible {outline-offset: -4px}
.form-stack label > .select-control, .form-stack label > .password-control, .login-card .password-control {width: 100%}

/* 文件选择包在 label 里做成按钮：input 藏起来但仍可被 label 激活，label 也不再按字段那样竖排。
   不能用 display:none —— 那会让 label 跳过激活，点击冒泡到 <dialog> 被当成点背景，弹窗会直接关掉。 */
.form-stack label.file-button {position: relative; display: inline-flex; flex-direction: row; align-items: center; align-self: flex-start; gap: 0; cursor: pointer}
.form-stack label.file-button > input {position: absolute; width: 1px; height: 1px; opacity: 0}
.input-icon {border-radius: var(--theme-radius-control); border-color: var(--form-edge); color: var(--theme-muted); box-shadow: var(--form-shadow); transition: border-color .16s, box-shadow .16s}
.input-icon:focus-within {border-color: var(--theme-focus); box-shadow: 0 0 0 3px var(--theme-focus-ring)}
.input-icon > input, .input-icon > input:focus {background: transparent; border: 0; box-shadow: none; padding-left: 0}
.field-control textarea {min-height: var(--form-height); font-family: var(--theme-font-sans); line-height: 1.9}
.yaml-editor {border: 1px solid var(--form-edge); border-radius: var(--theme-radius-control); box-shadow: var(--form-shadow); overflow: hidden}
.yaml-editor:focus-within {border-color: var(--theme-focus); box-shadow: 0 0 0 3px var(--theme-focus-ring)}
.yaml-editor .cm-editor.cm-focused {outline: none}
.yaml-editor[aria-invalid='true'] {border-color: var(--theme-danger)}

/* 多选采用可点击的整行标签，选中状态同时通过勾选符号与颜色表达。 */
.multi-options {gap: 6px; text-align: left}
.multi-options .checkbox-control {gap: 9px; min-height: 36px; padding: 6px 10px; border: 1px solid transparent; border-radius: 9px; font-size: 13px; cursor: pointer; color: var(--theme-text)}
.checkbox-control:has(:checked) {background: var(--theme-accent-soft)}
.checkbox-control:has(:disabled) {opacity: .5; cursor: not-allowed}
.checkbox-mark {position: relative; display: inline-flex; width: 18px; height: 18px; flex-shrink: 0}
.checkbox-mark input[type='checkbox'] {appearance: none; width: 18px; height: 18px; min-height: 0; padding: 0; margin: 0; border: 1px solid var(--form-edge); border-radius: 5px; background: var(--theme-input-bg); cursor: inherit; opacity: 1}
.checkbox-mark input:checked {background: var(--theme-primary-bg); border-color: var(--theme-primary-bg)}
.checkbox-mark > svg {position: absolute; left: 2.5px; top: 2.5px; color: var(--theme-on-accent); pointer-events: none; visibility: hidden}
.checkbox-mark:has(:checked) > svg {visibility: visible}
input[type='radio'] {accent-color: var(--theme-primary-bg); width: 18px; height: 18px; min-height: 0; padding: 0}

/* 开关的实际焦点及触控区域为 52×44，轨道在其中垂直居中。 */
.toggle {width: 52px; height: 44px; padding: 0 3px; background: transparent; isolation: isolate}
.toggle::before {inset: 6px 0; border-radius: 999px; background: var(--theme-toggle-off); z-index: -1; transition: background-color .2s}
.toggle.on {background: transparent}
.toggle.on::before {background: var(--theme-toggle-on)}
.toggle > span {width: 26px; height: 26px; background: var(--theme-toggle-knob); box-shadow: var(--theme-toggle-shadow)}
.toggle.on > span {transform: translateX(20px)}
.toggle:active:not(:disabled) > span {width: 29px}
.toggle.on:active:not(:disabled) > span {transform: translateX(17px)}

.button {min-height: var(--form-height); height: auto; padding: 9px 17px; line-height: 1.4; background: var(--theme-surface-muted); border-color: var(--theme-border); box-shadow: var(--form-shadow)}
.button.primary, .button.danger {border-color: transparent}
.button.subtle:not(.danger) {background: var(--theme-accent-soft); color: var(--theme-accent); border-color: transparent; box-shadow: none}
.button svg, .icon-button svg, .text-button svg {stroke-width: 1.8}
.button:disabled, .icon-button:disabled, .text-button:disabled {opacity: .45; filter: none; box-shadow: none}
.edit-status {display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 5px; line-height: 1.5; overflow-wrap: anywhere}
/* 状态文本变化时淡入，避免「等待连接 / 已保存」来回切换时抽一下。 */
.edit-status-text {animation: edit-status-in .2s ease-out}
@keyframes edit-status-in {from {opacity: 0} to {opacity: 1}}
@media (prefers-reduced-motion: reduce) {.edit-status-text {animation: none}}
.edit-status > svg {flex-shrink: 0}
.field-row-multiline .edit-status {justify-content: flex-start}
.field-row {gap: 24px}
.field-label p {line-height: 1.65}
.background-control {display: flex; flex-direction: column; gap: 10px; min-width: 0; text-align: left}
.background-url-form {display: flex; flex-direction: column; gap: 8px; min-width: 0}
.background-url-form > input {width: 100%}
.background-url-actions {display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: start}
.background-url-actions > .select-control {width: 100%; min-width: 0}
.background-url-actions > .button {white-space: nowrap}
.background-upload {position: relative; display: grid; grid-template-columns: 38px minmax(0, 1fr); align-items: center; gap: 12px; min-height: 76px; padding: 14px; border: 1px dashed var(--form-edge); border-radius: calc(var(--theme-radius-control) + 2px); background: color-mix(in srgb, var(--theme-input-bg) 88%, var(--theme-accent-soft)); cursor: pointer; overflow-wrap: anywhere; transition: border-color .16s ease, background-color .16s ease, box-shadow .16s ease}
.background-upload:hover {border-color: var(--theme-accent); background: color-mix(in srgb, var(--theme-input-bg) 76%, var(--theme-accent-soft))}
.background-upload:focus-within {border-color: var(--theme-focus); box-shadow: 0 0 0 3px var(--theme-focus-ring)}
.background-upload-input {position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0}
.background-upload-icon {display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; color: var(--theme-accent); background: var(--theme-accent-soft)}
.background-upload-icon svg {stroke-width: 1.8}
.background-upload-copy {display: flex; flex-direction: column; gap: 3px; min-width: 0}
.background-upload-copy strong {color: var(--theme-text); font-size: 13px; font-weight: 600; line-height: 1.45; overflow-wrap: anywhere}
.background-upload-copy small {color: var(--theme-muted); font-size: 11px; line-height: 1.55}
.background-error {margin: 0; color: var(--theme-danger); font-size: 12px; line-height: 1.5}
.statistics-controls select, .statistics-controls input {min-height: var(--form-height)}
.statistics-table th button {display: inline-flex; align-items: center; gap: 6px; min-height: 32px}
.nav-search:focus-within {border-color: var(--theme-focus); box-shadow: 0 0 0 3px var(--theme-focus-ring)}
.nav-search input, .nav-search input:focus {border: 0; background: transparent; box-shadow: none; padding-left: 0}

/* 原生滑块保留方向键、Home/End 和触控拖动。 */
input[type='range'] {appearance: none; width: 100%; min-height: 32px; margin: 0; padding: 0; border: 0; box-shadow: none; background: transparent; accent-color: var(--theme-primary-bg); cursor: pointer}
input[type='range']::-webkit-slider-runnable-track {height: 5px; border-radius: 999px; background: var(--theme-input-border)}
input[type='range']::-moz-range-track {height: 5px; border-radius: 999px; background: var(--theme-input-border)}
input[type='range']::-moz-range-progress {height: 5px; border-radius: 999px; background: var(--theme-primary-bg)}
input[type='range']::-webkit-slider-thumb {appearance: none; height: 22px; width: 22px; margin-top: -8.5px; border-radius: 50%; background: var(--theme-toggle-knob); border: 1px solid var(--theme-input-border); box-shadow: 0 2px 5px #0002}
input[type='range']::-moz-range-thumb {height: 22px; width: 22px; border-radius: 50%; background: var(--theme-toggle-knob); border: 1px solid var(--theme-input-border); box-shadow: 0 2px 5px #0002}
input[type='range']:focus-visible {outline: 2px solid var(--theme-focus); outline-offset: 2px}

@media (hover: hover) {
  .checkbox-control:hover:not(:has(:disabled)) {background: var(--theme-accent-soft)}
  .button:not(.primary):not(.danger):hover:not(:disabled) {background: var(--theme-accent-soft); color: var(--theme-accent); border-color: var(--theme-border)}
}
@media (max-width: 768px), (pointer: coarse) {
  :root {--form-height: 44px}
  .field-control > .select-control, .field-control > .password-control, .select-trigger, .password-control input {font-size: 16px}
  .multi-options .checkbox-control {min-height: 44px}
  .password-reveal {width: 44px}
  .monitor-segmented button {min-height: 44px}
  .background-url-actions {grid-template-columns: minmax(0, 1fr) auto}
}
@media (forced-colors: active) {
  input, select, textarea, .button {border-color: ButtonText}
  .select-trigger, .select-menu {border-color: ButtonText}
  .select-option.is-active {background: Highlight; color: HighlightText}
  .checkbox-mark input[type='checkbox'] {appearance: auto}
  .checkbox-mark > svg {display: none}
  .toggle::before {background: Canvas; border: 1px solid ButtonText}
  .toggle.on::before {background: Highlight}
  .toggle > span {background: ButtonText}
  input[type='range'] {appearance: auto}
  .background-upload {border-style: solid}
  .background-upload-icon {border: 1px solid ButtonText}
}

.select-trigger {display: flex; align-items: center; justify-content: space-between; gap: 14px; min-width: 0; width: 100%; min-height: var(--form-height); padding: 9px 12px; border: 1px solid var(--form-edge); border-radius: var(--theme-radius-control); background: var(--theme-input-bg); color: var(--theme-input-text); line-height: 1.5; text-align: left; box-shadow: var(--form-shadow); transition: border-color .16s, box-shadow .16s}
.select-trigger > span {overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.select-trigger > svg {color: var(--theme-muted)}
.select-trigger:focus-visible, .select-trigger[aria-expanded='true'] {outline: none; border-color: var(--theme-focus); box-shadow: 0 0 0 3px var(--theme-focus-ring)}
.select-trigger[aria-invalid='true'] {border-color: var(--theme-danger); background: var(--theme-danger-soft)}
.select-trigger:disabled {cursor: not-allowed; opacity: .55}
.select-menu {position: fixed; inset: auto; margin: 0; padding: 5px; box-sizing: border-box; border: 1px solid var(--theme-border); border-radius: 13px; background: var(--theme-surface); color: var(--theme-text); box-shadow: 0 12px 36px #0003, 0 2px 8px #0001; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; font: 13px/1.5 var(--theme-font-sans); text-align: left; z-index: 1000; zoom: 1}
.select-menu::backdrop {background: transparent; pointer-events: none}
.select-option {display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px 9px; border-radius: 8px; cursor: pointer; overflow-wrap: anywhere}
.select-option > span {min-width: 0}
.select-option > svg {color: var(--theme-accent); flex-shrink: 0}
.select-option.is-active {background: var(--theme-accent-soft)}
.select-option[aria-disabled='true'] {opacity: .45; cursor: not-allowed}
@media (max-width: 768px), (pointer: coarse) {
  .select-trigger, .select-menu {font-size: 16px}
  .select-option {min-height: 44px}
}
@media (forced-colors: active) {
  .select-trigger, .select-menu {border-color: ButtonText}
  .select-option.is-active {background: Highlight; color: HighlightText}
  .select-option > svg {color: currentColor}
}
/* 旧版字体：正文 MiSans、日志 JetBrains Mono NL。
   字体文件放在 frontend/public/，用相对路径引用，才能在前缀式反代下同样命中。 */
@font-face {
  font-family: 'MiSans';
  src: url('./MiSans-Demibold.ttf') format('truetype');
  font-weight: 600;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono NL';
  src: url('./JetBrainsMonoNL-Regular.ttf') format('truetype');
  font-display: swap;
}

/* 日志区域统一继承等宽字体变量。 */
.log-content {font-family: var(--theme-font-mono)}
/* ============================================================================
   motion.css —— AzurPilot 全站动效系统（当前维护者方言的“收敛 + 编排”层）
   由各皮肤（classic / minimal / legacy）在自身条目之后引入，确保覆盖同级规则。
   纪律：
   - 只动 transform / opacity / 颜色；不新增 blur 层；
   - 不改 DOM 结构（:has(> …) 选择器依赖直接子级）；
   - 全部动画在 prefers-reduced-motion: reduce 下由 tokens.css 的全局开关关闭。
   ============================================================================ */

:root {
  /* 时长（5 档，映射现存 .12s/.15s/.18s/.2s/.22s/.24s/.26s）
     统一乘全局倍率 --motion-speed（开发者工具「动效控制台」可切换；默认 0.5× 对应 2）。 */
  --dur-1: calc(120ms * var(--motion-speed, 2));   /* 瞬时反馈：按压、hover 变色 */
  --dur-2: calc(160ms * var(--motion-speed, 2));   /* 微交互：图标按钮、toggle、导航项 */
  --dur-3: calc(200ms * var(--motion-speed, 2));   /* 标准 UI 变化：菜单、分段滑块、弹窗 */
  --dur-4: calc(260ms * var(--motion-speed, 2));   /* 结构性变化：抽屉、右栏、折叠展开、列表入场 */
  --dur-5: calc(320ms * var(--motion-speed, 2));   /* 页面级转场：路由切换、大面板 */
  --dur-pulse: 1800ms;
  --dur-spin: 1200ms;

  /* 缓动 */
  --ease-standard: cubic-bezier(.2, 0, 0, 1);        /* 维护者主缓动（现状 13 处） */
  --ease-decelerate: cubic-bezier(.22, .61, .36, 1); /* 入场（现状 5 处，含 legacy-page-in） */
  --ease-emphasized: cubic-bezier(.16, 1, .3, 1);    /* 页面级转场（近似 easeOutExpo） */
  --ease-accelerate: cubic-bezier(.4, 0, 1, 1);      /* 出场 */
  --ease-spring: var(--ease-decelerate);             /* 兜底；下面的 linear() 为真弹簧 */

  /* 位移与缩放 */
  --shift-page: 8px;      /* 页面级横向位移 */
  --shift-page-y: 0px;    /* 页面级纵向位移（已移除整页上浮，保持底板稳定） */
  --shift-entry: 8px;     /* 列表/卡片入场位移 */
  --press-scale: .97;
  --scale-modal: .97;
}

/* 真·弹簧：stiffness 360 / damping 28 / mass 1 → 过冲约 1.5%，沉降 320ms。
   仅用于单元素（toast/按压回弹），不进列表。 */
@supports (transition-timing-function: linear(0, 1)) {
  :root {
    --ease-spring: linear(
      0.0278 4.17%, 0.0976 8.33%, 0.1928 12.5%, 0.3004 16.67%, 0.4107 20.83%,
      0.5171 25%, 0.6151 29.17%, 0.7022 33.33%, 0.7771 37.5%, 0.8396 41.67%,
      0.8903 45.83%, 0.9302 50%, 0.9604 54.17%, 0.9825 58.33%, 0.9978 62.5%,
      1.0075 66.67%, 1.013 70.83%, 1.0152 75%, 1.015 79.17%, 1.0132 83.33%,
      1.0104 87.5%, 1.0071 91.67%, 1.0035 95.83%, 1 100%
    );
  }
}

/* 力度档位（开发者工具「动效控制台」可切换；默认标准＝PR 取值） */
:root[data-motion-strength='strong'] {
  --shift-page: 12px;
  --shift-page-y: 0px;
  --shift-entry: 12px;
  --card-stagger-shift: 24px;
  --dur-4: calc(300ms * var(--motion-speed, 2));
  --dur-5: calc(380ms * var(--motion-speed, 2));
  --scale-modal: .95;
}

/* 减少动效的模拟开关（开发者工具；与系统开关同等效力） */
:root[data-motion-reduced] *,
:root[data-motion-reduced] *::before,
:root[data-motion-reduced] *::after {
  animation: none !important;
  transition: none !important;
}

/* 旧版主题保持接近现状；minimal / extreme 由主题自身明确禁用全部动效。 */
:root[data-theme='legacy-light'], :root[data-theme='legacy-dark'] { --shift-page: 7px; --shift-page-y: 0px; --motion-page-dur: var(--dur-3) }
:root { --motion-page-dur: var(--dur-3) }

/* ============================================================================
   1 · 页面转场（由 usePageMotion 给 #main-content 挂类触发；首屏与同路径不播）
   ============================================================================ */
@keyframes motion-page-forward { from { opacity: 0; transform: translateX(var(--shift-page)) } to { opacity: 1; transform: none } }
@keyframes motion-page-back { from { opacity: 0; transform: translateX(calc(-1 * var(--shift-page))) } to { opacity: 1; transform: none } }
@keyframes motion-page-fade { from { opacity: 0 } to { opacity: 1 } }

/* 页面转场已完全交由内部卡片从左上角逐个错峰上浮接管；
   main#main-content 底板保持无图层隔离状态，避免破坏子元素 backdrop-filter 对背景壁纸的实时采样模糊。 */
main#main-content.motion-nav-forward,
main#main-content.motion-nav-back,
main#main-content.motion-nav-fade {
  animation: none !important;
}

/* 桌面端侧边栏招牌首次入场：与 SidebarTransition 从左至右保持视觉统一 */
@keyframes motion-sidebar-brand-in {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: none; }
}

@media (min-width: 951px) {
  .sidebar-brand {
    animation: motion-sidebar-brand-in var(--dur-3) var(--ease-emphasized) both;
  }
}

/* ============================================================================
   2 · 抽屉与右栏：视觉不变、性能修复（left/right → transform，避免逐帧重排）
   ============================================================================ */
@media (max-width: 950px) {
  .sidebar {
    left: 0;
    transform: translateX(-230px);
    visibility: hidden;
    transition: transform var(--dur-4) var(--ease-decelerate), visibility var(--dur-4) allow-discrete;
    will-change: transform;
  }
  .mobile-open .sidebar { left: 0; transform: none; visibility: visible }

  .right-rail {
    right: 0;
    opacity: 0;
    transform: translateX(100%);
    visibility: hidden;
    transition: transform var(--dur-4) var(--ease-decelerate), opacity var(--dur-4) var(--ease-standard), visibility var(--dur-4) allow-discrete;
    will-change: transform;
  }
  .rail-open .right-rail { transform: none; opacity: 1; visibility: visible }
}

/* ============================================================================
   3 · 弹窗 / 浮层入场（原生 <dialog>，[open] 切换即自动重播）
   ============================================================================ */
@keyframes motion-modal-in { from { opacity: 0; transform: translateY(6px) scale(var(--scale-modal)) } to { opacity: 1; transform: none } }
@keyframes motion-backdrop-in { from { opacity: 0 } to { opacity: 1 } }

dialog.modal[open] { animation: motion-modal-in var(--dur-3) var(--ease-emphasized) both }
dialog.modal[open]::backdrop { animation: motion-backdrop-in var(--dur-3) var(--ease-standard) both }

/* ============================================================================
   4 · 按压反馈（配合 components.css 中 .button/.icon-button 过渡补充 transform）
   ============================================================================ */
.button:active:not(:disabled),
.icon-button:active:not(:disabled),
.text-button:active { transform: scale(var(--press-scale)) }

/* ============================================================================
   5 · 卡片从左上角逐个上浮出现（柔和弹簧阻尼与景深微缩放，彻底消除傻快与线性感）
   ============================================================================ */
:root {
  --card-stagger-shift: 12px;
  --card-stagger-scale: .985;
  --card-stagger-dur: var(--dur-4); /* 约 260ms，从容柔和 */
  --ease-card-spring: cubic-bezier(.18, .92, .26, 1.02); /* 微过冲柔和弹簧阻尼 */
}
:root[data-motion-strength='strong'] {
  --card-stagger-shift: 18px;
  --card-stagger-scale: .975;
  --card-stagger-dur: calc(300ms * var(--motion-speed, 2));
}

@keyframes motion-card-stagger-in {
  from {
    opacity: 0;
    transform: translateY(var(--card-stagger-shift, 12px)) scale(var(--card-stagger-scale, .985));
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.motion-card-stagger {
  animation: motion-card-stagger-in var(--card-stagger-dur, 520ms) var(--ease-card-spring) both;
  animation-delay: var(--card-stagger-delay, 0ms);
}

@keyframes motion-fade-up { from { opacity: 0; transform: translateY(var(--shift-entry)) } to { opacity: 1; transform: none } }

.home-deck-copy > *, .home-main-heading { animation: motion-fade-up var(--dur-3) var(--ease-decelerate) both }
.home-deck-copy > :nth-child(2) { animation-delay: 30ms }
.home-deck-copy > :nth-child(3) { animation-delay: 60ms }
.home-deck-foot { animation: motion-fade-up var(--dur-3) var(--ease-decelerate) both; animation-delay: 90ms }

/* ============================================================================
   6 · 日志新行入场（LogPanel 给增量行挂 .motion-enter；初始加载不播）
   ============================================================================ */
@keyframes motion-log-in { from { opacity: 0; transform: translateY(2px) } to { opacity: 1; transform: none } }
.log-line.motion-enter, .log-rule.motion-enter { animation: motion-log-in var(--dur-2) var(--ease-decelerate) both }

/* ============================================================================
   7 · 顶栏“光随鼠标”掠光（仅材质主题；由 useGlassPointerLight 写入 --mx/--my）
   ============================================================================ */
:root[data-theme='light'] .topbar::after,
:root[data-theme='dark'] .topbar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    260px circle at var(--mx, 30%) var(--my, 30%),
    rgb(255 255 255 / .14),
    rgb(255 255 255 / .05) 45%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity var(--dur-4) var(--ease-standard);
}
:root[data-theme='light'] .topbar:hover::after,
:root[data-theme='dark'] .topbar:hover::after { opacity: 1 }

/* 任务列表 / 队列继续沿用各自已有的 keyframes，此处不重复定义。 */

/* MD3 输入框：底部强调指示线与浅色容器背景，聚焦时底线加粗变主色 */
:root {--form-shadow: none}
input:where(:not([type='checkbox']):not([type='radio']):not([type='range'])),
textarea, .select-trigger, .input-icon {
  border: 0;
  border-bottom: 1px solid var(--theme-input-border);
  border-radius: 4px 4px 0 0;
  background: var(--theme-input-bg);
  transition: border-bottom-color .2s cubic-bezier(.2, 0, 0, 1), background-color .2s cubic-bezier(.2, 0, 0, 1);
}
input:focus, textarea:focus,
.select-trigger:focus-visible, .select-trigger[aria-expanded='true'], .input-icon:focus-within {
  background: var(--accent-soft);
  border-bottom: 2px solid var(--theme-focus);
  box-shadow: none;
  outline: none;
}
input[aria-invalid='true'], textarea[aria-invalid='true'], .select-trigger[aria-invalid='true'] {
  border-bottom: 2px solid var(--red);
  background: color-mix(in srgb, var(--red) 6%, var(--theme-input-bg));
}

/* MD3 开关：52×32px 胶囊轨道 + 16px/24px 圆形滑块；未选中带 outline，选中换主色并放大滑块。 */
.toggle {
  position: relative;
  width: 52px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  background: transparent;
  cursor: pointer;
}
.toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 2px solid var(--theme-toggle-off);
  background: var(--surface-muted);
  box-sizing: border-box;
  transition: all .2s cubic-bezier(.2, 0, 0, 1);
}
.toggle > span {
  position: relative;
  z-index: 1;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--theme-toggle-off);
  box-shadow: none;
  transform: translateX(8px);
  transition: all .2s cubic-bezier(.2, 0, 0, 1);
}
.toggle.on::before {
  background: var(--theme-toggle-on);
  border-color: var(--theme-toggle-on);
}
.toggle.on > span {
  width: 24px;
  height: 24px;
  background: var(--theme-toggle-knob);
  transform: translateX(24px);
}
.toggle:active:not(:disabled) > span {
  width: 28px;
}
.toggle:not(.on):active:not(:disabled) > span {
  transform: translateX(6px);
}
.toggle.on:active:not(:disabled) > span {
  transform: translateX(20px);
}
.toggle:disabled {
  opacity: .38;
  cursor: not-allowed;
}
.toggle:disabled::before {
  background: transparent;
  border-color: var(--theme-toggle-off);
}
.toggle:disabled > span {
  background: var(--theme-toggle-off);
}
.toggle.on:disabled::before {
  background: var(--theme-toggle-off);
  border-color: transparent;
}
.toggle.on:disabled > span {
  background: var(--surface);
}

/* 旧版浅色/深色不挂载壁纸层；首页指挥台的文字色改回正文色。 */
:root[data-theme='legacy-light'] .home-deck,
:root[data-theme='legacy-dark'] .home-deck {
  color: var(--text);
  text-shadow: none;
}

/* 跳转链接必须在网格流之外，否则会占掉侧栏那一列。 */
.skip-link {position: fixed; top: -100px; left: 16px; z-index: 200; background: var(--surface); color: var(--accent); padding: 14px; border-radius: 8px}
.skip-link:focus {top: 12px}

body {background-attachment: scroll}
.app-shell {gap: 0}
/* 旧版侧栏贴边、只有一条右边框，顶栏与右栏不带圆角。 */
.sidebar, .right-rail, .topbar {border-radius: 0; background: var(--surface)}
.sidebar {padding: 0 14px 14px}
.sidebar-brand {height: var(--topbar-height); padding: 0 8px; margin-bottom: 14px}
.brand-title {font-size: 22px}
.brand-mark {color: var(--secondary)}
.sidebar-label, .sidebar-label button {color: var(--muted)}
.primary-nav a, .task-group-button {font-size: 14px; font-weight: 500; min-height: 44px; border-radius: 22px; transition: background-color .2s cubic-bezier(.2, 0, 0, 1), color .2s cubic-bezier(.2, 0, 0, 1)}
.task-submenu-item {font-size: 13px; min-height: 36px; border-radius: 18px}
.task-group-button.expanded {border-color: var(--accent)}
/* 收起后仍是当前所在的大类：保持展开时的底色、边框与强调。 */
.task-group-button.active:not(.expanded) {color: var(--accent); background: var(--accent-soft); border-color: var(--accent); font-weight: 600}
.task-group-button.active:not(.expanded) .task-group-icon {color: var(--accent)}
.topbar {position: sticky; top: 0; z-index: 80; height: var(--topbar-height); margin: 0; padding: 0 24px}
.right-rail {top: var(--topbar-height); height: calc(var(--viewport-height) - var(--topbar-height)); z-index: 70}
.breadcrumb, .breadcrumb .instance-caption strong {font-size: 13px}
/* 上内边距归零：旧版内容区顶部那条「主页 / 实例」行已经和下方留出了距离，再加 24px 就成了
   「主页文字底到容器顶边框」上那段多余空隙（实测从 7px 变成 36.8px），按用户要求消掉。 */
main {padding: 0 28px 24px}
main:focus {outline: none}
.page-title h1 {font-size: clamp(24px, 2.4vw, 32px); letter-spacing: -.6px; overflow-wrap: anywhere}
.home-intro {padding: 8px 0 24px}
.eyebrow {display: block; margin-bottom: 10px; font-size: 12px; font-weight: 600}
.home-intro .page-title {margin-bottom: 12px}
.home-intro p {color: var(--muted); line-height: 1.8}
.home-summary {display: flex; flex-wrap: wrap; gap: 20px; padding: 18px 0 24px; margin-bottom: 24px; border-bottom: 1px solid var(--border)}
.home-summary > div {display: flex; align-items: center; gap: 9px; color: var(--muted); font-size: 13px}
.home-summary strong {color: var(--text); font-size: 20px; font-variant-numeric: tabular-nums}
.title-actions {position: relative; gap: 8px; padding: 4px}
.panel-heading h2 {font-size: 15px}
.panel, .resource-card, .instance-card {border-radius: var(--theme-radius-panel)}

/* MD3 按钮规范：高度 40px，全胶囊圆角 20px，文字 14px Medium，标准状态层 */
.button {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: .1px;
  height: 40px;
  min-height: 40px;
  border-radius: var(--theme-radius-button, 20px);
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  box-sizing: border-box;
  transition: background-color .2s cubic-bezier(.2, 0, 0, 1), box-shadow .2s cubic-bezier(.2, 0, 0, 1), border-color .2s cubic-bezier(.2, 0, 0, 1), color .2s cubic-bezier(.2, 0, 0, 1);
}
.button:has(> svg) {padding: 0 16px}
.button.primary {
  background: var(--theme-primary-bg);
  color: var(--theme-on-accent);
  box-shadow: var(--theme-shadow-panel);
}
.button.primary:hover:not(:disabled) {
  transform: none;
  background: var(--theme-primary-hover);
  box-shadow: var(--theme-shadow-hover);
}
.button.secondary {
  background: transparent;
  color: var(--accent);
  border-color: var(--border);
  box-shadow: none;
}
.button.secondary:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.button.subtle:not(.danger) {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: transparent;
  box-shadow: none;
}
.button.subtle:not(.danger):hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent) 20%, var(--accent-soft));
}
.button.danger {
  background: var(--red);
  color: var(--theme-on-danger);
  border-color: transparent;
}
.button.danger.subtle {
  background: var(--theme-danger-soft);
  color: var(--red);
  border-color: transparent;
}
.button.danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--red) 85%, black);
}
.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color .15s, color .15s, transform .12s cubic-bezier(.2, 0, 0, 1);
}
.icon-button:hover:not(:disabled) {
  background: var(--accent-soft);
  color: var(--accent);
}
.text-button {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: .1px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 18px;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color .15s, transform .12s cubic-bezier(.2, 0, 0, 1);
}
.text-button:hover:not(:disabled) {
  background: var(--accent-soft);
}
.yaml-editor:focus-within, .nav-search:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.input-icon > input:focus, .nav-search input:focus {outline: none}
button:disabled, input:disabled, textarea:disabled, select:disabled, .select-trigger:disabled,
.checkbox-control:has(:disabled), .select-option[aria-disabled='true'] {opacity: 1; color: var(--muted)}
.button:disabled {background: var(--surface-muted); border-color: var(--border); box-shadow: none}
.input-icon, .schedule-summary, .count-badge, .nav-search {background: var(--surface-muted)}
.status, .task-state {border-radius: 8px; font-weight: 500}

.scheduler-widget {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--theme-radius-panel, 16px);
  padding: 16px 18px;
}
.scheduler-widget-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.scheduler-widget-heading > div {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.scheduler-widget-heading > div > svg {
  color: var(--accent);
}
.scheduler-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  color: var(--muted);
  line-height: 1.3;
}
.scheduler-status svg {
  flex-shrink: 0;
}
.scheduler-status.running {
  background: var(--theme-success-soft);
  color: var(--theme-success);
  border-color: color-mix(in srgb, var(--theme-success) 24%, transparent);
  font-weight: 600;
}
.scheduler-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}
.scheduler-stats > div {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  box-sizing: border-box;
  transition: border-color .15s ease, background-color .15s ease;
}
.scheduler-stats > div:hover {
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}
.scheduler-stats span {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 4px;
}
.scheduler-stats strong {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.scheduler-toggle {
  width: 100%;
  min-height: 40px;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: .1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.resource-foot > svg, .resource-editor-grip {color: var(--muted)}
.resource-editor-card, .resource-picker {background: var(--surface); border-color: var(--border)}
.resource-editor-card.dragging {opacity: 1; border-color: var(--accent); transform: none; background: var(--accent-soft)}
.resource-editor-remove:hover {background: var(--theme-danger-soft)}
.resource-editor-add-icon, .resource-editor-add, .resource-editor-add:hover, .resource-editor-add.open {background: var(--accent-soft)}
.statistics-note {border-left-color: var(--secondary)}
.chart-expanded {inset: 0; border-radius: 0; z-index: 150}
/* 旧版版式：只在实例视图生效（App.tsx 的 .legacy-shell）。
   旧版外壳是「顶栏跨全宽 + 文字菜单在顶栏下方」，与共享层的「侧栏整列 + 顶栏在主内容列内」
   是两套网格，所以在这里整块重排，主页视图不受影响。 */
.app-shell.legacy-shell {
  /* 旧版文字菜单宽 12rem(16px 基准)=192px；本仓库根字号是 14px，所以直接写像素。 */
  --sidebar-width: 192px;
  /* 内容区顶部那行「主页 / 实例 / 任务」，算进页内两列的高度预算里；
     分页模式下这行会被放缩，所以取值与它的实际高度同源，不能写死。 */
  --legacy-page-nav-height: var(--instance-page-nav-height, 42px);
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  /* 行高的隐含最小值是 auto，内容算高了会把整壳顶出视口、页面就能滚；钳成 0 让内容自己滚。 */
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas: 'topbar topbar' 'sidebar main';
  /* 光是 minmax(0, 1fr) 还不够：外壳不裁剪时网格会按内容测量，行照样被撑高、整壳溢出视口。
     裁掉溢出后这一行才真正只占「视口 − 顶栏」，多出来的部分由各列自己滚。 */
  overflow: hidden;
  /* 基类的 .app-shell 只给了 min-height，网格就会跟着内容长到视口之外。
     钉成正好一屏，内容多出来的部分交给内部滚动。 */
  height: var(--viewport-height);
}
.app-shell.legacy-shell.with-rail {
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr) var(--right-rail-width);
  grid-template-areas: 'topbar topbar topbar' 'sidebar main rail';
}
.app-shell.legacy-shell > .topbar {grid-area: topbar; width: auto}
.app-shell.legacy-shell > .sidebar {grid-area: sidebar; padding-top: 12px}
.app-shell.legacy-shell > .main-shell {grid-area: main; min-height: 0; overflow: hidden; display: flex; flex-direction: column}
/* 内容列的高度：非实例页（如 /dev、设置）由 main 自身滚动并防止卡片挤压，实例页由内部两列各自滚。
   增加 padding-top 确保页面卡片与标签栏底部分割线保持舒适的安全呼吸间隙，避免紧贴。 */
.app-shell.legacy-shell > .main-shell > main {min-height: 0; flex: 1 1 0; display: flex; flex-direction: column; overflow-y: auto; padding: 14px 28px 24px}
.app-shell.legacy-shell > .main-shell > main:has(.instance-page-grid),
.app-shell.legacy-shell > .main-shell > main:has(.task-config-legacy) {overflow-y: hidden}
.app-shell.legacy-shell > .main-shell > main > * {flex-shrink: 0}
/* 旧版两主题的按压反馈：鼠标按下时轻微收缩，主按钮同时收回悬停的上移。 */
:root[data-theme='legacy-light'] .button,
:root[data-theme='legacy-dark'] .button {transition: background-color .15s, box-shadow .15s, border-color .15s, color .15s, transform .12s cubic-bezier(.2, 0, 0, 1)}
:root[data-theme='legacy-light'] .button:active:not(:disabled),
:root[data-theme='legacy-dark'] .button:active:not(:disabled),
:root[data-theme='legacy-light'] .icon-button:active:not(:disabled),
:root[data-theme='legacy-dark'] .icon-button:active:not(:disabled),
:root[data-theme='legacy-light'] .text-button:active:not(:disabled),
:root[data-theme='legacy-dark'] .text-button:active:not(:disabled),
:root[data-theme='legacy-light'] .legacy-stat-title:active,
:root[data-theme='legacy-dark'] .legacy-stat-title:active {transform: scale(.97)}
:root[data-theme='legacy-light'] .button.primary:active:not(:disabled),
:root[data-theme='legacy-dark'] .button.primary:active:not(:disabled) {transform: translateY(0) scale(.97)}
:root[data-theme='legacy-light'] .toggle:active,
:root[data-theme='legacy-dark'] .toggle:active {transform: scale(.96)}
:root[data-theme='legacy-light'] .monitor-segmented button:active,
:root[data-theme='legacy-dark'] .monitor-segmented button:active {background: var(--accent-soft)}
/* 旧版外壳下换页：页面内容淡入，动画挂在页面根元素与内容列上。 */
.app-shell.legacy-shell .instance-page-grid,
.app-shell.legacy-shell .statistics-legacy,
.app-shell.legacy-shell .task-config-settings-inner,
.app-shell.legacy-shell .task-config-rail-slot .task-rail-directory {animation: legacy-page-in .22s cubic-bezier(.22, .61, .36, 1)}
@keyframes legacy-page-in {from {opacity: 0} to {opacity: 1}}
/* 总览页在两个视图间切换：面板用自己的动画，按切换方向淡入。 */
.app-shell.legacy-shell .instance-page-panel {animation: none}
.app-shell.legacy-shell .instance-page-panel.panel-drop {animation: panel-drop .24s cubic-bezier(.22, .61, .36, 1)}
.app-shell.legacy-shell .instance-page-panel.panel-rise {animation: panel-rise .24s cubic-bezier(.22, .61, .36, 1)}
@keyframes panel-drop {from {opacity: 0} to {opacity: 1}}
@keyframes panel-rise {from {opacity: 0} to {opacity: 1}}
@media (prefers-reduced-motion: reduce) {.app-shell.legacy-shell .instance-page-grid, .app-shell.legacy-shell .statistics-legacy, .app-shell.legacy-shell .task-config-settings-inner, .app-shell.legacy-shell .instance-page-panel, .app-shell.legacy-shell .instance-page-panel.panel-drop, .app-shell.legacy-shell .instance-page-panel.panel-rise, .app-shell.legacy-shell .task-config-rail-slot .task-rail-directory {animation: none}}
.app-shell.legacy-shell > .main-shell > main > .instance-page-grid,
.app-shell.legacy-shell > .main-shell > main > .task-config-legacy {flex-shrink: 1; min-height: 0}
.app-shell.legacy-shell > .right-rail {grid-area: rail}
/* 顶层页面（主页 / 更新器 / 设置 / 配置管理…）没有页内滚动区：外壳既把这一行裁掉，
   又没给 main 留滚动容器，长页面就被整段裁掉、页面还滚不动。
   main 在实例页是 flex 列（页内两列要 flex 撑满），到这里会把普通面板压扁而不是溢出，
   所以这里同时退回块级布局并补上滚动容器；顶栏与侧栏照旧常驻，与实例页一致。 */
.app-shell.legacy-home-shell > .main-shell > main {display: block; min-height: 0; overflow-y: auto}
/* 招牌随顶栏走：顶栏里的那份紧贴左侧，不参与侧栏那套 72px 间距。 */
.legacy-topbar-brand {height: auto; margin-bottom: 0; padding: 0}
/* 旧版顶栏的第三列是居中的页面名。 */
.legacy-topbar-title {flex: 1; min-width: 0; text-align: center; font-size: 1.2rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
/* 旧版实例页的页名由顶栏居中显示，内容区只留一个给读屏的标题。 */
.legacy-sr-title {position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap}
/* 传统模式：1:1 对齐用户参考图的 Edge/Chrome 沉浸式现代浏览器标签页：
   - 标签栏带浅灰蓝/暗色顶栏槽道底色（--tab-strip-bg）；
   - 激活标签纯白底色，顶部 9px 圆角，底部完全无下横线开口融入下方内容区；
   - 激活标签左右底脚采用经典 radial-gradient 反向倒角，呈现完美的流线型连接；
   - 激活标签常驻柔和关闭 × 按钮，未激活标签悬停微亮，带精致居中分割线。 */
:root[data-theme='legacy-light'] {
  --tab-strip-bg: #e6ebf2;
}
:root[data-theme='legacy-dark'] {
  --tab-strip-bg: #1e2029;
}

/* 导航条基础排版：必须严格垂直居中（align-items: center），上下内边距归零，
   彻底根除图标与文字沉在底部“往下掉”的问题，保证下拉菜单与常规导航绝对居中 */
:root[data-tab-size] .app-shell.legacy-shell .legacy-page-nav,
:root[data-theme='legacy-light'] .legacy-page-nav,
:root[data-theme='legacy-dark'] .legacy-page-nav,
.app-shell.legacy-shell .legacy-page-nav {
  padding: 0 16px !important;
  display: flex !important;
  align-items: center !important;
  background: var(--surface) !important;
  border-bottom: 1px solid var(--border) !important;
  box-sizing: border-box !important;
}
.legacy-page-nav .instance-picker {margin: 0}

/* 仅在平铺标签页模式（存在 .instance-tabs）时呈现浅灰蓝浏览器槽道底色，下拉模式保持常规纯白背景 */
:root[data-theme='legacy-light'] .legacy-page-nav:has(.instance-tabs),
:root[data-theme='legacy-dark'] .legacy-page-nav:has(.instance-tabs),
.app-shell.legacy-shell .legacy-page-nav:has(.instance-tabs) {
  background: var(--tab-strip-bg, #e6ebf2) !important;
}

:root[data-tab-size] .app-shell.legacy-shell .legacy-page-nav .breadcrumb,
.app-shell.legacy-shell .legacy-page-nav .breadcrumb {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  gap: 8px !important;
}

.legacy-page-nav .breadcrumb > a {
  align-self: center;
  height: 26px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  transition: all .15s ease;
  margin-bottom: 0;
}
.legacy-page-nav .breadcrumb > a:hover {
  background: color-mix(in srgb, var(--surface) 50%, transparent);
  color: var(--text);
}

.legacy-page-nav .topbar-mode-toggle,
.legacy-page-nav .topbar-tab-size {
  align-self: center;
  margin-bottom: 0;
}

/* 标签列表轨道：仅有标签页存在时，轨道自身撑满高度并下沉贴底，左侧主页/图标仍严格垂直居中 */
:root[data-theme='legacy-light'] .instance-tabs,
:root[data-theme='legacy-dark'] .instance-tabs,
.app-shell.legacy-shell .instance-tabs {
  align-self: stretch !important;
  display: flex !important;
  align-items: flex-end !important;
  gap: 0 !important;
  height: 100% !important;
  margin-bottom: -1px !important;
  padding: 0 4px !important;
}

/* 标签页主体 */
:root[data-theme='legacy-light'] .instance-tab,
:root[data-theme='legacy-dark'] .instance-tab,
.app-shell.legacy-shell .instance-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: var(--instance-tab-height);
  padding: 0 var(--instance-tab-pad);
  border: 1px solid transparent !important;
  border-bottom: none !important;
  border-radius: 9px 9px 0 0 !important;
  background: transparent !important;
  color: var(--muted) !important;
  font-size: var(--instance-tab-font);
  font-weight: 450;
  box-shadow: none !important;
  margin-bottom: 0 !important;
  transition: background-color .15s ease, color .15s ease;
}

/* 未激活标签悬停微亮 */
:root[data-theme='legacy-light'] .instance-tab:hover,
:root[data-theme='legacy-dark'] .instance-tab:hover,
.app-shell.legacy-shell .instance-tab:hover {
  background: color-mix(in srgb, var(--surface) 40%, transparent) !important;
  color: var(--text) !important;
  border-color: transparent !important;
}

/* 标签右侧精细分割竖线（类似浏览器未激活标签） */
.app-shell.legacy-shell .instance-tab::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 14px;
  background: color-mix(in srgb, var(--border) 70%, transparent);
  pointer-events: none;
  transition: opacity .15s ease;
}
.app-shell.legacy-shell .instance-tab:last-of-type::after,
.app-shell.legacy-shell .instance-tab.current::after,
.app-shell.legacy-shell .instance-tab:hover::after,
.app-shell.legacy-shell .instance-tab:has(+ .instance-tab.current)::after,
.app-shell.legacy-shell .instance-tab:has(+ .instance-tab:hover)::after {
  opacity: 0;
}

/* 激活标签：纯白底色，下边缘无横线阻隔，完全开口与下方融合，顶部大圆角，底边平整干净 */
:root[data-theme='legacy-light'] .instance-tab.current,
:root[data-theme='legacy-dark'] .instance-tab.current,
.app-shell.legacy-shell .instance-tab.current {
  background: var(--surface) !important;
  color: var(--text) !important;
  font-weight: 600;
  border: 1px solid var(--border) !important;
  border-bottom: 1px solid var(--surface) !important;
  border-radius: 8px 8px 0 0 !important;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.03) !important;
  z-index: 3;
  margin-bottom: -1px !important;
  height: var(--instance-tab-height);
}

.app-shell.legacy-shell .instance-tab.current.running {
  color: var(--theme-success, #16a34a) !important;
}
.app-shell.legacy-shell .instance-tab.current.running .instance-tab-name {
  color: var(--text) !important;
}
.app-shell.legacy-shell .instance-tab.current.error {
  color: var(--theme-danger, #dc2626) !important;
}
.app-shell.legacy-shell .instance-tab.current.error .instance-tab-name {
  color: var(--text) !important;
}

/* 标签内的关闭 × 按钮（激活标签上始终柔和可见，像 Edge 截图一样） */
.app-shell.legacy-shell .instance-tab .instance-tab-remove {
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}
.app-shell.legacy-shell .instance-tab .instance-tab-remove .lucide {
  opacity: 0;
  display: block;
  transition: opacity .15s ease;
}
.app-shell.legacy-shell .instance-tab.current .instance-tab-remove .lucide {
  opacity: .5;
}
.app-shell.legacy-shell .instance-tab:hover .instance-tab-remove .lucide {
  opacity: .7;
}
.app-shell.legacy-shell .instance-tab .instance-tab-remove:hover .lucide {
  opacity: 1;
}
.app-shell.legacy-shell .instance-tab .instance-tab-remove:hover {
  background: color-mix(in srgb, var(--text) 10%, transparent);
  color: var(--text);
}

/* 新建标签按钮：静态只有加号，悬停现出虚线圆圈，按下时圆圈与图标一起放缩。 */
:root[data-theme='legacy-light'] .instance-tab-create,
:root[data-theme='legacy-dark'] .instance-tab-create,
.app-shell.legacy-shell .instance-tab-create {
  width: calc(var(--instance-tab-height) * .85);
  height: calc(var(--instance-tab-height) * .85);
  border-color: transparent;
  transition: color .15s ease, border-color .15s ease, transform .15s ease;
}
:root[data-theme='legacy-light'] .instance-tab-create > .lucide,
:root[data-theme='legacy-dark'] .instance-tab-create > .lucide,
.app-shell.legacy-shell .instance-tab-create > .lucide {
  transition: transform .15s ease;
}
:root[data-theme='legacy-light'] .instance-tab-create:hover,
:root[data-theme='legacy-dark'] .instance-tab-create:hover,
.app-shell.legacy-shell .instance-tab-create:hover {
  border-color: var(--accent);
}
:root[data-theme='legacy-light'] .instance-tab-create:hover > .lucide,
:root[data-theme='legacy-dark'] .instance-tab-create:hover > .lucide,
.app-shell.legacy-shell .instance-tab-create:hover > .lucide {
  transform: scale(1.12);
}
:root[data-theme='legacy-light'] .instance-tab-create:active,
:root[data-theme='legacy-dark'] .instance-tab-create:active,
.app-shell.legacy-shell .instance-tab-create:active {
  border-color: var(--accent);
  transform: scale(.9);
}
:root[data-theme='legacy-light'] .instance-tab-create:active > .lucide,
:root[data-theme='legacy-dark'] .instance-tab-create:active > .lucide,
.app-shell.legacy-shell .instance-tab-create:active > .lucide {
  transform: scale(.86);
}
/* 侧栏任务菜单：分组展开后具体任务往下列（旧版树状格式）。 */
.task-group-button:hover .task-group-arrow {transform: none}
.task-group-button.expanded .task-group-arrow {color: var(--accent); transform: rotate(180deg)}
/* 内层承载外边距，外层高度从 0 过渡到自身高度，展开折叠才有动画。 */
:root {interpolate-size: allow-keywords}
.task-submenu-list {height: 0; overflow: hidden; transition: height .24s cubic-bezier(.22, .61, .36, 1)}
.task-submenu-list.expanded {height: auto}
.task-submenu-inner {margin: 2px 0 6px 12px; padding-left: 8px; border-left: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px}
.task-submenu-list:not(.expanded) .task-submenu-inner {visibility: hidden}
@media (prefers-reduced-motion: reduce) {.task-submenu-list {transition: none} .rail-task-item {animation: none !important}}

/* 顶栏的「任务配置」下拉：旧版实例页删掉了页内的分组导航，跨任务跳转放在这里。 */
.task-picker {position: relative; flex-shrink: 0}
.task-picker-trigger {display: inline-flex; align-items: center; gap: 4px; color: var(--muted); font-size: 13px; white-space: nowrap}
.task-picker-trigger:hover, .task-picker-trigger[aria-expanded='true'] {color: var(--accent)}
.task-picker-menu {position: absolute; top: calc(100% + 8px); left: 0; z-index: 40; width: min(22rem, 70vw); max-height: min(30rem, 70vh); overflow-y: auto; padding: 8px; border: 1px solid var(--border); border-radius: var(--theme-radius-popover); background: var(--surface); box-shadow: var(--theme-shadow-popover)}
.task-picker-group + .task-picker-group {margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border)}
.task-picker-group-name {display: block; padding: 6px 8px 4px; color: var(--muted); font-size: 11px}
.task-picker-menu button {display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px; border-radius: 4px; text-align: left; font-size: 13px}
.task-picker-menu button span {flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap}
.task-picker-menu button:hover, .task-picker-menu button:focus-visible, .task-picker-menu button[aria-checked='true'] {background: var(--accent-soft); color: var(--accent)}
.task-picker-empty {padding: 14px 8px; color: var(--muted); font-size: 12px; text-align: center}

@media (min-width: 951px) {
  /* 顶栏占了第一行，侧栏与右栏从它下方开始各自滚动。 */
  .app-shell.legacy-shell > .topbar {position: relative; justify-content: flex-start; gap: 14px}
  .legacy-topbar-title {position: absolute; left: 50%; transform: translateX(-50%); max-width: min(30rem, 38%); flex: 0 0 auto}
  .app-shell.legacy-shell > .sidebar,
  .app-shell.legacy-shell > .right-rail {top: var(--topbar-height); height: calc(var(--viewport-height) - var(--topbar-height))}
  .app-shell.legacy-shell > .sidebar {padding-top: 14px}
  .app-shell.legacy-shell .legacy-sidebar-actions {display: none}

  /* 旧版实例页：左列调度器与任务计划，右列页面内容。总览与资源统计共用这一套，
     所以左列由各页面自己渲染（LegacyRail），不是外壳的一列。 */
  .instance-page-grid {
    display: grid;
    /* 用 flex 撑满 main 的剩余高度，不再按「视口 − 顶栏 − 页内行 − 常量」推算：
       那个常量会随着顶栏与页内行的实际高度漂移，容器底边就跟着上下跳。
       上面 main 与 .legacy-shell 已逐级撑满，所以不靠百分比高度也不会把整壳顶高。 */
    /* 基准写 0 而不是 auto：auto 会以内容高度为基准把容器撑到内容那么高。 */
    flex: 1 1 0;
    min-height: 0;
    grid-template-columns: minmax(16rem, 20rem) minmax(24rem, 1fr);
    gap: 14px;
    align-items: stretch;
  }
  /* 左列整体滚动；队列列表自身填满剩余高度并在内部滚动，与其它主题一致。 */
  .instance-page-rail {display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow-y: auto}
  .instance-page-rail .rail-task-list {flex: 1 1 0%; min-height: 0; overflow-y: auto}
  /* 右栏那套边距会让调度器与任务计划比同列其他卡片窄，这里清零让三块左右对齐。 */
  .instance-page-rail .scheduler-widget {margin: 0}
  .instance-page-rail .rail-schedule {padding: 12px 0 0}
  /* 右栏不滚，滚动交给面板：滚动条只在面板内出现与消失，同列的资源卡片宽度不变。 */
  .instance-page-main {display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow: hidden}
  .instance-page-main .resource-grid {margin-bottom: 0}
  .instance-page-panel {display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto}
  /* 搜索框与参数卡同宽，「任务设置和搜索对齐」。 */
  .task-config-settings .config-toolbar .input-icon {max-width: none}
  .task-config-settings .config-toolbar {margin-bottom: 0}
  /* 资源统计在旧版下没有左列，整页一条内容带；和 .instance-page-grid 一样撑满 main 的剩余高度。 */
  .statistics-legacy {
    display: flex;
    flex-direction: column;
    gap: 12px;
    /* flex-basis 取 auto：内容比视口高时停在自己的内容高上，让 main 去滚；
       取 0 会被压成视口高的一条内滚动带。 */
    flex: 1 0 auto;
    min-height: 0;
    overflow-y: auto;
  }
  .statistics-legacy .statistics-toolbar-row {display: flex; align-items: center; gap: 12px; flex-wrap: wrap}
  /* 分段控件按内容自然宽度排，不拉伸：upstream 的紧凑版式靠 offsetWidth 量它的自然宽度。 */
  .statistics-legacy .statistics-toolbar-row .statistics-category-control {margin-bottom: 0; flex: 0 0 auto; width: max-content}
  .statistics-legacy .statistics-actions {display: flex; align-items: center; gap: 8px; margin-left: auto}

  /* 旧版的任务详细设置：参数卡在左、分组导航在右（旧版是 13rem≈208px 的右列）。
     和总览一样定高 + 内部滚动，顶栏与侧栏才不会跟着滚走。 */
  .task-config-legacy {
    display: grid;
    flex: 1 1 auto;
    height: calc(var(--viewport-height) - var(--topbar-height) - 2 * var(--row-pad, 4px) - var(--legacy-page-nav-height, 42px) - 64px);
    /* 右列宽度取自新版右栏的契约变量，与断点同步收放。 */
    grid-template-columns: minmax(0, 1fr) min(268px, var(--right-rail-width));
    gap: 22px;
    align-items: stretch;
  }
  /* 右列换成外层容器后，行数预算归它管，这里改用普通列；高度吃满网格行。 */
  /* 高度逐层传到右列：网格行高必须能压住这两层，内层的滚动才拿得到约束。 */
  .task-config-rail-slot {display: flex; flex-direction: column; min-height: 0; overflow: hidden}
  .task-config-rail {display: flex; flex-direction: column; gap: 10px; min-height: 0; max-height: 100%; overflow: hidden}
  /* 切换按钮即各视图标题左侧的图标，两态共用同一坐标与尺寸。 */
  .task-rail-toggle {display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; margin-right: 1px; border: 0; background: none; color: var(--muted); cursor: pointer; flex-shrink: 0}
  .task-rail-toggle:hover {color: var(--accent)}
  /* 两个视图的标题行共用同一套字号、图标与间距。 */
  .task-rail-scheduler .scheduler-widget-heading, .task-rail-directory .rail-section-heading {margin-bottom: 13px; color: var(--text)}
  .task-rail-scheduler .scheduler-widget-heading > div, .task-rail-directory .rail-section-heading > div {gap: 7px; font-size: 12px; font-weight: 650; color: var(--text)}
  /* 调度块的外边距归零，内边距与目录卡片一致。 */
  /* 整列面板即一张卡片，内部层次靠分隔线而非嵌套卡片。 */
  .task-rail-scheduler {border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 16px 14px}
  .task-rail-scheduler .scheduler-widget {margin: 0; padding: 0; border: 0; background: none; box-shadow: none; flex-shrink: 0}
  .task-rail-scheduler .rail-schedule {border-top: 1px solid var(--border); padding-top: 14px; margin-top: 4px}
  /* 高度逐层传递：滚动只放在最外层，内层任务列表随内容撑开。 */
  .task-rail-scheduler {flex: 1 1 auto; display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow-y: auto}
  .task-rail-scheduler .rail-schedule {flex: 0 0 auto; min-height: 0; margin: 0; border-top: 0; padding: 0}
  .task-rail-scheduler .rail-task-list {flex: 0 0 auto; min-height: 0}
  .task-rail-directory {flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 16px 14px}
  .task-rail-directory .rail-section-heading {justify-content: space-between}
  .task-rail-directory .group-nav {flex: 1 1 auto}
  /* 切视图时按方向滑入并淡入。 */
  .task-rail-scheduler, .task-rail-directory {animation: rail-view-in .26s cubic-bezier(.22, .61, .36, 1)}
  .task-rail-scheduler {animation-name: rail-view-in-right}
  .task-rail-directory {animation-name: rail-view-in-left}
  @media (prefers-reduced-motion: reduce) {.task-rail-scheduler, .task-rail-directory {animation: none}}
  /* 参数列给宽度上限：宽屏下与输入框等宽的控件会被拉到读不过来的一整行。
     只限定这一列，不动外壳，所以中列填满视口的行为不受影响。 */
  .task-config-settings {min-width: 0; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; max-width: 1108px; margin-inline: auto}
  .task-config-legacy .group-nav {max-height: 100%}
  /* 参数列自己滚，锚点跳转不需要再给吸顶的顶栏留出 72px。 */
  .task-config-legacy .config-group {scroll-margin-top: 0}
}
.legacy-stat-card {display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; flex-shrink: 0}
/* 切换主区显示日志还是统计：两个状态都要有隐藏式的悬停选取框。
   选中态不用手型指针：它已不可再点，避免鼠标压在按钮上时看起来像还残留着高亮。 */
.legacy-stat-title {padding: 3px 8px; margin-left: -8px; border: 1px solid transparent; border-radius: var(--theme-radius-control, 8px); background: none; color: var(--text); font: inherit; font-size: 15px; font-weight: 600; line-height: 1.4; cursor: pointer; transition: background-color .15s, border-color .15s, color .15s}
.legacy-stat-title:hover {border-color: var(--accent); background: var(--accent-soft); color: var(--accent)}
.legacy-stat-title[aria-pressed='true'] {cursor: default}
.legacy-stat-title:focus-visible {outline: 2px solid var(--accent); outline-offset: 1px}
.instance-panel-stats {display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow: hidden}
.group-nav {padding: 6px; border-radius: var(--theme-radius-panel)}
.group-nav a {border-radius: 4px}
.monitor-tabs {height: auto; min-height: 60px; padding: 10px 16px; flex-wrap: wrap; gap: 8px}
.monitor-panel .log-toolbar {display: flex; align-items: center; margin-left: auto; gap: 4px}
.monitor-panel .log-panel {border: 0; border-radius: 0}
.monitor-panel .log-content {font-size: 12px; line-height: 1.8; background: var(--surface)}
.monitor-segmented {display: inline-flex; align-items: center; gap: 0; padding: 0; border: 1px solid var(--border); border-radius: 20px; background: transparent; max-width: 100%; overflow: hidden}
.monitor-segmented button {display: inline-flex; align-items: center; justify-content: center; gap: 7px; flex-shrink: 0; min-height: 36px; padding: 6px 16px; border: 0; border-right: 1px solid var(--border); border-radius: 0; color: var(--muted); font-size: 13px; font-weight: 500; white-space: nowrap; transition: background-color .15s, color .15s}
.monitor-segmented button:last-child {border-right: 0}
.monitor-segmented button[aria-selected='true'] {background: var(--accent-soft); color: var(--accent)}
.monitor-segmented button:focus-visible {outline-offset: -2px}
.checkbox-mark input[type='checkbox'] {border-radius: 2px}
.statistics-category-control {margin-bottom: 20px}
.log-rule .rule-bar {opacity: 1; background: var(--border)}
.log-rule.rule-double .rule-bar {opacity: 1; border-color: var(--border)}
.preview-screen .radar > div, .radar::before, .radar::after {display: none}
.live-label {border-color: var(--green)}
.rail-task-list {display: flex; flex-direction: column; gap: 12px}
.rail-queue-group {flex-shrink: 0; border: 1px solid var(--border); border-radius: var(--theme-radius-panel); overflow: hidden}
.rail-queue-group.running, .rail-queue-group.pending, .rail-queue-group.waiting {background: var(--surface); border-color: var(--border)}
.rail-queue-heading {display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px; background: var(--surface-muted); border-bottom: 1px solid var(--border)}
.rail-queue-heading > div {display: flex; align-items: center; gap: 8px; font-size: 12px}
.rail-queue-heading > span {color: var(--muted); font-size: 11px}
.rail-queue-heading svg {color: var(--secondary)}
.rail-queue-body {padding: 4px}
.rail-queue-empty {padding: 14px 12px; color: var(--muted); font-size: 12px; line-height: 1.6}
.rail-task-item {padding: 10px 8px; border-radius: 4px}
.rail-task-item:hover {background: var(--surface-muted)}
.rail-task-item strong {font-size: 12px}
.rail-task-item small {font-size: 11px}
.modal {
  border: 0;
  border-radius: var(--theme-radius-modal, 28px);
  padding: 24px;
  background: var(--surface);
  box-shadow: var(--theme-shadow-modal);
}
.toast {
  border: 0;
  border-radius: 8px;
  box-shadow: var(--theme-shadow-popover);
}
@media (max-width: 950px) {
  /* 窄屏下侧栏与右栏都是抽屉，旧版版式回到共享层的单列流。 */
  .app-shell.legacy-shell {display: block}
  /* 窄屏没有页内滚动区（下面的定高规则都在 ≥951px 里），
     外壳再钉死视口加 overflow:hidden 就会把后面的内容整段裁掉、页面还滚不动。 */
  .app-shell.legacy-shell, .app-shell.legacy-shell > .main-shell {height: auto; overflow: visible}
  /* 桌面 main 的零基准伸缩和裁剪也必须复位，否则子页仍被压成零高。 */
  .app-shell.legacy-shell > .main-shell > main,
  .app-shell.legacy-shell > .main-shell > main:has(.instance-page-grid),
  .app-shell.legacy-shell > .main-shell > main:has(.task-config-legacy) {flex: none; overflow: visible}
  .instance-page-grid {display: flex; flex-direction: column; gap: 12px; height: auto}
  .instance-page-rail, .instance-page-main {overflow: visible}
  .task-config-legacy {display: block}
  .legacy-page-nav {padding: 0 16px}
  /* 窄屏顶栏放不下两块招牌：顶栏那份收起来，侧栏抽屉里那份照旧。 */
  .app-shell.legacy-shell .legacy-topbar-brand {display: none}
  .topbar, .app-shell.with-rail .topbar {width: 100%; padding: 0 14px}
  .sidebar, .right-rail {top: 0; height: var(--viewport-height); z-index: 100}
  .sidebar-brand {padding: 0}
  .sidebar-brand .mobile-close {position: static; margin-left: auto}
  main {padding: 28px 16px}
  .monitor-segmented button {min-height: 44px}
}
@media (forced-colors: active) {
  .monitor-segmented button[aria-selected='true'] {border: 2px solid Highlight}
  .button:disabled {color: GrayText}
}

.dev-state-box, .dev-demo-card, .dev-shadow-grid {background: var(--surface-muted)}
.dev-nav-preview {background: var(--surface)}

/* 按下「立刻运行」时底色与字色互换，与按钮的缩放动画叠加。 */
.field-control > .field-actions .icon-only:hover:active:not(:disabled) {background: var(--theme-accent); color: var(--theme-on-accent)}

@keyframes rail-view-in-right {from {opacity: 0; transform: translateX(7px)} to {opacity: 1; transform: none}}
@keyframes rail-view-in-left {from {opacity: 0; transform: translateX(-7px)} to {opacity: 1; transform: none}}

/* 任务设置列表与右侧栏不显示滚动条。 */
.app-shell.legacy-shell .task-nav,
.app-shell.legacy-shell .group-nav {scrollbar-width: none}
.app-shell.legacy-shell .task-nav::-webkit-scrollbar,
.app-shell.legacy-shell .group-nav::-webkit-scrollbar {width: 0}

/* 调度栏视图下的容器与其中的任务列表不显示滚动条。 */
.app-shell.legacy-shell .task-rail-scheduler,
.app-shell.legacy-shell .rail-task-list {scrollbar-width: none}
.app-shell.legacy-shell .task-rail-scheduler::-webkit-scrollbar,
.app-shell.legacy-shell .rail-task-list::-webkit-scrollbar {width: 0}
`;export{e as default};