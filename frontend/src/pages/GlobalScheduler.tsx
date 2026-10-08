/**
 * @fileoverview 多配置实例「全局调度控制中心」页面。
 *
 * 提供跨配置实例的顺序轮转调度启停、轮转队列进度可视化、全局待执行任务看板、
 * 轮转参数实时修改保存以及当前活动实例的实时控制台日志监控。
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle2, Clock3, Flame, Globe, Layers, Pause, Play, RefreshCw, Settings2, Terminal } from 'lucide-react'
import { api } from '../api/client'
import type { GlobalSchedulerSettings, GlobalSchedulerStatus } from '../api/types'
import { useApp, useConnection } from '../app/context'
import { FieldInput } from '../components/FieldInput'
import { LogPanel } from '../components/LogPanel'
import { Empty, ErrorBox, Loading, PageTitle, StatusBadge } from '../components/ui'
import { notifyDesktop } from '../desktop/alasDesktop'

const EMPTY_ACTIONS: Array<{value: GlobalSchedulerSettings['whenTaskQueueEmpty']; label: string}> = [
  {value: 'close_emulator', label: '关闭模拟器 (close_emulator)'},
  {value: 'app_stop', label: '关闭游戏进程 (app_stop)'},
  {value: 'goto_main', label: '返回游戏主界面 (goto_main)'},
  {value: 'stay_there', label: '停留在当前画面 (stay_there)'},
]

export function GlobalScheduler() {
  const connection = useConnection()
  const {notify, refresh: refreshInstances} = useApp()
  const [data, setData] = useState<GlobalSchedulerStatus | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [configListDraft, setConfigListDraft] = useState('auto')
  const prevRunningRef = useRef<boolean | null>(null)

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.request('global_scheduler.status', {})
      setData(prev => {
        if (!prev || prev.settings.configList !== res.settings.configList) {
          setConfigListDraft(res.settings.configList)
        }
        return res
      })
      setError('')

      // 检测单轮多配置调度完成并触发跨环境通知
      if (prevRunningRef.current === true && !res.running) {
        if (res.currentTask === '单轮已完成') {
          const title = '全局调度完成'
          const content = '所有配置单轮任务已全部执行完毕！'
          notifyDesktop(title, content)
          notify(`${title}：${content}`)
        } else if (res.currentTask === '单轮结束(遇错跳过)') {
          const title = '全局调度单轮结束'
          const content = '部分配置遇到异常跳过，单轮调度已结束退出。'
          notifyDesktop(title, content)
          notify(`${title}：${content}`, true)
        }
      }
      prevRunningRef.current = res.running
    } catch (err) {
      setError((err as Error).message)
    }
  }, [notify])

  useEffect(() => {
    if (connection !== 'ready') return
    void loadStatus()
    const timer = window.setInterval(() => {
      void loadStatus()
    }, 2500)
    return () => window.clearInterval(timer)
  }, [connection, loadStatus])

  const logInstance = data?.activeInstance || data?.mainInstance || ''

  // 订阅当前活动实例的实时日志流
  useEffect(() => {
    if (connection !== 'ready' || !logInstance) return
    void api.request('events.subscribe', {instance: logInstance, topics: ['instances', 'logs']}).catch(() => undefined)
    return () => {
      void api.request('events.subscribe', {instance: null, topics: ['instances']}).catch(() => undefined)
    }
  }, [connection, logInstance])

  async function handleStart() {
    setBusy(true)
    try {
      // 若草稿框中的配置列表有改动但尚未失焦保存，启动前先一并保存
      if (data && configListDraft.trim() !== data.settings.configList) {
        await api.request('global_scheduler.save', {config_list: configListDraft.trim() || 'auto'})
      }
      const next = await api.request('global_scheduler.start', {})
      setData(next)
      prevRunningRef.current = next.running
      await refreshInstances()
      notify(`全局调度已启动（起始实例：${next.currentConfig}）`)
    } catch (err) {
      notify((err as Error).message, true)
    } finally {
      setBusy(false)
    }
  }

  async function handleStop() {
    setBusy(true)
    try {
      const next = await api.request('global_scheduler.stop', {})
      setData(next)
      prevRunningRef.current = next.running
      await refreshInstances()
      notify('全局调度已停止')
    } catch (err) {
      notify((err as Error).message, true)
    } finally {
      setBusy(false)
    }
  }

  async function updateSetting(patch: {
    config_list?: string | null
    run_single_cycle?: boolean | null
    when_task_queue_empty?: GlobalSchedulerSettings['whenTaskQueueEmpty'] | null
    wait_between_configs?: number | null
    switch_on_error?: boolean | null
  }) {
    setSaving(true)
    try {
      const next = await api.request('global_scheduler.save', patch)
      setData(next)
      if (patch.config_list !== undefined) {
        setConfigListDraft(next.settings.configList)
      }
      notify('全局调度设置已保存')
    } catch (err) {
      notify((err as Error).message, true)
    } finally {
      setSaving(false)
    }
  }

  if (!data) {
    return error ? <ErrorBox message={error} retry={loadStatus}/> : <Loading/>
  }

  const badgeStatus = data.running ? 'running' : 'stopped'
  const statusText = data.running
    ? data.status === 'waiting'
      ? '等待最早任务'
      : data.status === 'switching'
        ? '正在切换配置'
        : '正在轮转运行'
    : data.currentTask === '单轮已完成'
      ? '单轮已完成'
      : '空闲休眠'

  return (
    <>
      <PageTitle
        title="全局调度控制中心"
        actions={
          <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
            <button type="button" className="button secondary" onClick={() => void loadStatus()}>
              <RefreshCw size={15}/>刷新状态
            </button>
            {data.running ? (
              <button type="button" className="button danger" disabled={busy} onClick={handleStop}>
                <Pause size={15}/>停止全局调度
              </button>
            ) : (
              <button type="button" className="button primary" disabled={busy || data.allInstances.length === 0} onClick={handleStart}>
                <Play size={15}/>启动全局调度
              </button>
            )}
          </div>
        }
      />

      {error && <ErrorBox message={error} retry={loadStatus}/>}

      {/* 实时状态概览与轮转队列进度 */}
      <section className="panel config-group">
        <div className="panel-heading">
          <div>
            <Globe size={18}/>
            <h2>轮转执行状态与队列进度</h2>
          </div>
          <StatusBadge status={badgeStatus}/>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px'}}>
          <div className="stat-card" style={{padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-muted)'}}>
            <span className="small-label">运行状态</span>
            <strong style={{display: 'block', fontSize: '1.05rem', marginTop: '4px'}}>{statusText}</strong>
          </div>
          <div className="stat-card" style={{padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-muted)'}}>
            <span className="small-label">当前配置实例</span>
            <strong style={{display: 'block', fontSize: '1.05rem', marginTop: '4px'}}>{data.currentConfig || '无'}</strong>
          </div>
          <div className="stat-card" style={{padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-muted)'}}>
            <span className="small-label">当前执行任务</span>
            <strong style={{display: 'block', fontSize: '1.05rem', marginTop: '4px'}}>{data.currentTaskLabel || '无'}</strong>
          </div>
          <div className="stat-card" style={{padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-muted)'}}>
            <span className="small-label">下次唤醒 / 更新时间</span>
            <strong style={{display: 'block', fontSize: '0.95rem', marginTop: '4px'}}>{data.nextRun || data.updatedAt || '—'}</strong>
          </div>
        </div>

        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center'}}>
          {data.queue.length === 0 ? (
            <span className="muted">暂无可调度的配置实例</span>
          ) : (
            data.queue.map(step => {
              const isRunning = step.state === 'running'
              const isDone = step.state === 'completed'
              return (
                <Link
                  key={step.instance}
                  to={`/i/${encodeURIComponent(step.instance)}/overview`}
                  className="button secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: isRunning ? 'var(--accent)' : isDone ? 'var(--green)' : undefined,
                    background: isRunning ? 'var(--accent-soft)' : undefined,
                    fontWeight: isRunning ? 700 : 500,
                  }}
                >
                  <span className="small-label">#{step.index}</span>
                  <span>{step.instance}</span>
                  {isRunning ? <Flame size={14}/> : isDone ? <CheckCircle2 size={14}/> : <Clock3 size={14}/>}
                </Link>
              )
            })
          )}
        </div>
      </section>

      {/* 全局待执行任务看板 */}
      <section className="panel config-group">
        <div className="panel-heading">
          <div>
            <Layers size={18}/>
            <h2>全局任务看板</h2>
          </div>
          <span className="small-label">
            运行中 {data.runningTasks.length} · 待执行 {data.pendingTasks.length} · 计划等待 {data.waitingTasks.length}
          </span>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px'}}>
          <div>
            <h3 style={{fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Flame size={15}/>正在运行 ({data.runningTasks.length})
            </h3>
            {data.runningTasks.length === 0 ? (
              <p className="muted" style={{margin: 0}}>{data.running ? '正在准备任务…' : '当前没有运行中的任务'}</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                {data.runningTasks.map(item => (
                  <Link
                    key={`${item.instance}-${item.name}`}
                    to={`/i/${encodeURIComponent(item.instance)}/task/${item.name}`}
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'var(--accent-soft)', textDecoration: 'none', color: 'inherit'}}
                  >
                    <span><strong>[{item.instance}]</strong> {item.label} <small className="muted">({item.name})</small></span>
                    <span className="small-label">执行中</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Clock3 size={15}/>待执行队列 ({data.pendingTasks.length})
            </h3>
            {data.pendingTasks.length === 0 ? (
              <p className="muted" style={{margin: 0}}>当前没有已到期的待执行任务</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto'}}>
                {data.pendingTasks.map((item, idx) => (
                  <Link
                    key={`${item.instance}-${item.name}-${idx}`}
                    to={`/i/${encodeURIComponent(item.instance)}/task/${item.name}`}
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'var(--surface-muted)', textDecoration: 'none', color: 'inherit'}}
                  >
                    <span><strong>[{item.instance}]</strong> {item.label}</span>
                    <small className="muted">{item.nextRun}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <CalendarClock size={15}/>未来计划任务 ({data.waitingTasks.length})
            </h3>
            {data.waitingTasks.length === 0 ? (
              <p className="muted" style={{margin: 0}}>暂无计划中的等待任务</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto'}}>
                {data.waitingTasks.map((item, idx) => (
                  <Link
                    key={`${item.instance}-${item.name}-${idx}`}
                    to={`/i/${encodeURIComponent(item.instance)}/task/${item.name}`}
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'var(--surface-muted)', textDecoration: 'none', color: 'inherit'}}
                  >
                    <span><strong>[{item.instance}]</strong> {item.label}</span>
                    <small className="muted">{item.nextRun}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 全局调度参数配置 */}
      <section className="panel config-group">
        <div className="panel-heading">
          <div>
            <Settings2 size={18}/>
            <h2>全局调度规则设置</h2>
          </div>
          <span className="small-label">{saving ? '正在保存…' : '修改后自动生效'}</span>
        </div>

        <div className="field-row">
          <div className="field-label">
            <label htmlFor="gs-config-list">轮转配置列表 (ConfigList)</label>
            <p>填 auto 自动按顺序轮转全部实例；也可填写指定实例名（用逗号分隔），例如：alas, sub1, sub2。</p>
          </div>
          <div className="field-control" style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
            <input
              id="gs-config-list"
              value={configListDraft}
              disabled={saving}
              onChange={e => setConfigListDraft(e.target.value)}
              onBlur={() => {
                const trimmed = configListDraft.trim() || 'auto'
                if (trimmed !== data.settings.configList) {
                  void updateSetting({config_list: trimmed})
                }
              }}
              placeholder="auto 或实例名列表（逗号分隔）"
            />
            <button
              type="button"
              className="button secondary"
              disabled={saving || configListDraft === 'auto'}
              onClick={() => {
                setConfigListDraft('auto')
                void updateSetting({config_list: 'auto'})
              }}
            >
              恢复 auto
            </button>
          </div>
        </div>

        <div className="field-row">
          <div className="field-label">
            <label htmlFor="gs-single-cycle">只执行一轮 (RunSingleCycle)</label>
            <p>开启后，按顺序将列表中的所有配置跑完一轮待办任务即自动停止退出；关闭则持续循环等待最早到期任务。</p>
          </div>
          <div className="field-control">
            <FieldInput
              id="gs-single-cycle"
              label="只执行一轮"
              type="bool"
              value={data.settings.runSingleCycle}
              disabled={saving}
              onChange={val => void updateSetting({run_single_cycle: Boolean(val)})}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field-label">
            <label htmlFor="gs-when-empty">单配置任务清空后动作 (WhenTaskQueueEmpty)</label>
            <p>当前配置实例没有到期任务、准备切换到下一个配置前执行的收尾操作。</p>
          </div>
          <div className="field-control">
            <FieldInput
              id="gs-when-empty"
              label="单配置任务清空后动作"
              value={data.settings.whenTaskQueueEmpty}
              options={EMPTY_ACTIONS.map(a => a.value)}
              translateOption={opt => EMPTY_ACTIONS.find(a => a.value === opt)?.label ?? String(opt)}
              disabled={saving}
              onChange={val => void updateSetting({when_task_queue_empty: val as GlobalSchedulerSettings['whenTaskQueueEmpty']})}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field-label">
            <label htmlFor="gs-wait-seconds">切换配置缓冲等待秒数 (WaitBetweenConfigs)</label>
            <p>从一个配置切换到下一个配置之前的等待秒数，留出模拟器或进程释放时间。</p>
          </div>
          <div className="field-control">
            <FieldInput
              id="gs-wait-seconds"
              label="切换配置缓冲等待秒数"
              type="number"
              value={data.settings.waitBetweenConfigs}
              disabled={saving}
              onChange={val => {
                const num = Math.max(0, Math.min(3600, Math.round(Number(val) || 0)))
                void updateSetting({wait_between_configs: num})
              }}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field-label">
            <label htmlFor="gs-switch-error">遇错自动跳过到下一配置 (SwitchOnError)</label>
            <p>某个配置运行发生未恢复异常时，不中断整体调度，自动切换执行列表中的下一个配置实例。</p>
          </div>
          <div className="field-control">
            <FieldInput
              id="gs-switch-error"
              label="遇错自动跳过到下一配置"
              type="bool"
              value={data.settings.switchOnError}
              disabled={saving}
              onChange={val => void updateSetting({switch_on_error: Boolean(val)})}
            />
          </div>
        </div>
      </section>

      {/* 实时控制台日志 */}
      <section className="panel config-group">
        <div className="panel-heading">
          <div>
            <Terminal size={18}/>
            <h2>实时调度控制台日志 ({logInstance || '未选择'})</h2>
          </div>
        </div>
        {logInstance ? <LogPanel instance={logInstance}/> : <Empty title="暂无可用配置实例"/>}
      </section>
    </>
  )
}
