/**
 * cn — 合并 className（轻量版，避免拉 tailwind-merge 引入额外依赖）
 * Worker 已在 src/lib/utils.ts 引入 tailwind-merge（package.json），
 * 这里只补一个轻量 fallback。
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
