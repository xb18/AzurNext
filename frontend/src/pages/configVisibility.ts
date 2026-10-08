/**
 * @fileoverview 配置字段可见性判断辅助逻辑。
 */

import type { Field, Value } from '../api/types'

export function isFieldVisible(argument: string, field: Field, value: Value, packageName?: Value) {
  if (argument === '_info' || field.display === 'hide') return false
  // 4399 渠道服自动隐藏悬浮球开关仅在包名选择为 com.bilibili.blhx.m4399 时展示
  if (argument === 'M4399HideFloatingBall' && packageName !== 'com.bilibili.blhx.m4399') return false
  // 沿用旧版 put_arg_storage：空字典不生成字段，也不生成空分组或导航。
  if (field.type === 'storage' && value !== null && typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length) return false
  return true
}
