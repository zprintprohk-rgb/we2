# AI 翻译提示词：法律/帮助页面 7 语言翻译

## 目标

将 `messages/en.json` 中 `legal.privacy` / `legal.terms` / `legal.cookies` / `legal.help` / `legal.contact` 这 5 个节点下的英文内容，**精准、本地化**地翻译到 7 种语言：zh-cn、zh-tw、ja、ko、de、fr、es。

英文原文在 `messages/en.json` 的 `legal.*` 节点下；翻译后写到对应 locale 的 `messages/<locale>.json` 的 `legal.*` 节点下。

## 上下文

- **品牌**：we2 — 一家提供照片打印、定制礼品、宠物纪念品等服务的国际化电商。
- **目标用户**：面向全球个人消费者和企业客户，涵盖 8 种语言。
- **法律语境**：所有页面受《个人资料（私隐）条例》（香港 PDPO）、GDPR（欧盟）、CCPA（美国加州）相关法规约束。
- **语气**：专业但亲切，避免过度法律化术语，关键概念可在 4-6 年级阅读水平理解。
- **结构**：`legal.<page>` 节点固定结构：
  ```json
  {
    "title": "页面标题（≤60 字符）",
    "subtitle": "页面副标题/介绍（1-2 句）",
    "lastUpdated": "Last updated: June 1, 2026",   // privacy/terms/cookies 才有
    "sections": [
      { "heading": "章节标题（≤80 字符）", "body": "章节正文（1-3 段，每段 50-150 词）" }
    ]
  }
  ```
- **不要修改**：`siteName`、`footer` 等非 `legal.*` 节点；`legal.help` / `legal.contact` 没有 `lastUpdated` 字段。
- **sections 数量**：privacy=6、terms=5、cookies=5、help=6、contact=5。**必须保持 1:1 对应**。

## 翻译原则

1. **法律准确性优先**：翻译时必须保留所有法律权利声明、限制、责任豁免条款的法律效力。必要时调整语序确保法律效果一致。
2. **本地化合规**：
   - **zh-cn / zh-tw**：保留"个人资料"概念，引用《个人信息保护法》（中国）/《个人资料保护法》（台湾）。
   - **ja**：引用《個人情報の保護に関する法律》（APPI）。
   - **ko**：引用《개인정보 보호법》（PIPA）。
   - **de / fr / es**：自然引用 GDPR 即可。
3. **货币 / 日期格式**：
   - 日期统一 `Month DD, YYYY` 英文格式（保留"June 1, 2026"），不要本地化。
   - 货币、地址、电话保留英文/原格式。
4. **品牌名/产品名**：`we2`、`Time Capsules`、`Virtual Pet`、产品 SKU 等**不译**，保持英文。
5. **链接文字**：`learn more`、`contact us`、`read our policy` 等 CTA 保持简洁。
6. **章节标题风格**：
   - 名词短语优先（"Data Collection" → "数据收集"），不用问句。
   - 长度相近（避免英文 5 词翻译成中文 20 字）。
7. **正文段落**：保持英文段落数和每段长度大致一致（不要把一段拆成两段，也不要合并两段）。

## 输出格式

对每个 locale 输出一个完整的 JSON 节点，直接复制到 `messages/<locale>.json` 的 `legal` 节点下：

```json
{
  "privacy": {
    "title": "...",
    "subtitle": "...",
    "lastUpdated": "Last updated: June 1, 2026",
    "sections": [
      { "heading": "...", "body": "..." },
      ...
    ]
  },
  "terms": { ... },
  "cookies": { ... },
  "help": { ... },
  "contact": { ... }
}
```

## 关键术语对照表

| 英文 | zh-cn | zh-tw | ja | ko | de | fr | es |
|---|---|---|---|---|---|---|---|
| Privacy Policy | 隐私政策 | 隱私權政策 | プライバシーポリシー | 개인정보처리방침 | Datenschutzerklärung | Politique de confidentialité | Política de privacidad |
| Terms of Service | 服务条款 | 服務條款 | 利用規約 | 이용약관 | Nutzungsbedingungen | Conditions d'utilisation | Términos de servicio |
| Cookie Policy | Cookie 政策 | Cookie 政策 | Cookie ポリシー | 쿠키 정책 | Cookie-Richtlinie | Politique des cookies | Política de cookies |
| Help Center | 帮助中心 | 說明中心 | ヘルプセンター | 고객센터 | Hilfe-Center | Centre d'aide | Centro de ayuda |
| Contact Us | 联系我们 | 聯絡我們 | お問い合わせ | 문의하기 | Kontaktieren Sie uns | Contactez-nous | Contáctanos |
| Personal Data | 个人信息 | 個人資料 | 個人情報 | 개인정보 | personenbezogene Daten | données personnelles | datos personales |
| Data Controller | 数据控制者 | 資料控制者 | データ管理者 | 데이터 관리자 | Datenverantwortlicher | responsable du traitement | responsable del tratamiento |
| GDPR | GDPR（通用数据保护条例） | GDPR（一般資料保護規範） | GDPR（一般データ保護規則） | GDPR | DSGVO | RGPD | RGPD |
| Third Party | 第三方 | 第三方 | 第三者 | 제3자 | Dritte | tiers | terceros |
| Order | 订单 | 訂單 | 注文 | 주문 | Bestellung | commande | pedido |

## 验证清单

翻译完成后请自检：
- [ ] 5 个 page 节点（privacy/terms/cookies/help/contact）全部翻译，无遗漏。
- [ ] 每个 page 的 `sections` 数组长度与英文一致（6/5/5/6/5）。
- [ ] `privacy/terms/cookies` 包含 `lastUpdated`；`help/contact` **不**包含。
- [ ] 品牌名 `we2`、产品名 `Time Capsules` 等保持英文。
- [ ] JSON 格式合法（无尾逗号、引号配对）。
- [ ] 跑 `npm run sync-messages` 通过无错误。

## 使用方法

1. 复制本提示词 + `messages/en.json` 的 `legal` 节点内容（5 个 page）给 AI。
2. 指定目标语言（如："请翻译为简体中文"）。
3. AI 输出完整 JSON 块后，写入对应 `messages/<locale>.json`。
4. 跑 `npm run sync-messages` 验证结构对齐。
5. 跑 `npm run build` 验证无运行时错误。
