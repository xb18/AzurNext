import { expect, it } from 'vitest'
import { isFieldVisible } from './configVisibility'

it('存储空间按旧版规则隐藏空字典，保留非空状态及其中的零值', () => {
  const field = {type: 'storage', display: 'disabled', value: {}}
  expect(isFieldVisible('Storage', field, {})).toBe(false)
  expect(isFieldVisible('Storage', field, {count: 0, enabled: false})).toBe(true)
  expect(isFieldVisible('Storage', {...field, display: 'hide'}, {count: 1})).toBe(false)
  expect(isFieldVisible('NextRun', {type: 'datetime', value: ''}, '')).toBe(true)
})

it('4399 悬浮球开关仅在模拟器包名为 com.bilibili.blhx.m4399 时可见', () => {
  const field = {type: 'checkbox', value: true}
  expect(isFieldVisible('M4399HideFloatingBall', field, true, 'auto')).toBe(false)
  expect(isFieldVisible('M4399HideFloatingBall', field, true, 'com.bilibili.blhx')).toBe(false)
  expect(isFieldVisible('M4399HideFloatingBall', field, true, 'com.bilibili.blhx.m4399')).toBe(true)
})
