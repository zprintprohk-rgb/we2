# Locale Quality Scripts — 翻译团队上手指南

## 快速命令（按运行顺序）

```bash
# P0-1: JSON 语法检查（非法字符、控制字符）
node scripts/check-locale-syntax.js

# P0-2: 污染扫描（key 前缀 + value 前缀 + 结构漂移）
node scripts/scan-locale-prefix.js messages

# P0-3: 翻译完整性（en.json 对比 7 个 locale）
node scripts/check-translation-completeness.js

# P0-4: 占位符一致性（{variable} / ICU 格式平衡）
node scripts/check-locale-placeholders.js

# 一键修复 value 污染（三态：preview → apply → rollback）
node scripts/fix-locale-pollution.js --preview   # 预览
node scripts/fix-locale-pollution.js --apply     # 执行
node scripts/fix-locale-pollution.js --rollback  # 回滚
```

## 翻译工作流

```
修改 messages/*.json
  │
  ├─→ ① node scripts/check-locale-syntax.js        ← JSON 合法？
  ├─→ ② node scripts/scan-locale-prefix.js messages ← 有污染？
  ├─→ ③ node scripts/check-translation-completeness  ← 缺 key？
  ├─→ ④ node scripts/check-locale-placeholders.js    ← 占位符对得上？
  │
  └─→ CI 自动跑全 4 步（.github/workflows/locale-check.yml）
```

## 脚本清单

| 脚本 | 作用 | 可写？ | 退出码 |
|------|------|--------|--------|
| `check-locale-syntax.js` | JSON 语法 + 控制字符 | 只读 | 1 = 有错误 |
| `scan-locale-prefix.js` | key/value 前缀污染 + 结构漂移 | 只读 | 1 = 有污染/缺失 |
| `check-translation-completeness.js` | 每个 locale 缺失/多余 key | 只读 | 1 = 不完整 |
| `check-locale-placeholders.js` | `{var}` / ICU 占位符一致性 | 只读 | 1 = 不一致 |
| `fix-locale-pollution.js` | 修复 value 前缀污染 | **可写** | 0 |
| `sync-messages.ts` | 从 en.json 同步 key 到各 locale | **可写** | 0 |

## CI 工作流

PR 修改 `messages/**` 时自动触发 4 闸门。
失败时 → PR 评论贴出具体错误 + Artifact 保存 diff。

配置文件: `.github/workflows/locale-check.yml`

## 常见问题

**Q: CI 报 `value prefix bugs` 但我不小心改了翻译文件？**
A: CI 已报错但你想回滚本地的污染修复 → `node scripts/fix-locale-pollution.js --rollback`

**Q: 新增翻译 key 后 CI 报 `missing vs en`？**
A: 先更新 en.json 加好 key，再跑 `node scripts/sync-messages.ts` 同步到其他 locale。

**Q: 占位符检查报 `{variable}` 数量不一致？**
A: 翻译文本中的 `{count}` / `{name}` 等占位符必须与 en.json 完全一致（数量、花括号配对）。