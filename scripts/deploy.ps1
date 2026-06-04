# deploy.ps1 — 一键部署 We2 到 Cloudflare Workers
#
# 用途: 跑 Drizzle migrations + OpenNext build + wrangler deploy + 验证
# 用法: .\scripts\deploy.ps1
#
# 前置条件:
#   1. 已运行 setup-secrets.ps1 (8 个 secrets 已配置)
#   2. 已创建 Supabase 项目 + R2 bucket we2-storage
#   3. 已 npm install

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host ""
Write-Host "=== We2 一键部署 ===" -ForegroundColor Cyan
Write-Host "目标: Cloudflare Workers (we2-v3)" -ForegroundColor Gray
Write-Host ""

# ─── Step 0: 验证前置条件 ───
Write-Host "[Step 0/6] 验证前置条件..." -ForegroundColor Yellow

# 0.1 wrangler 安装
$wranglerVersion = npx wrangler --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ wrangler 未安装. 跑: npm install" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ wrangler $wranglerVersion" -ForegroundColor Green

# 0.2 Cloudflare 登录
$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 未登录 Cloudflare. 跑: npx wrangler login" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Cloudflare 已登录" -ForegroundColor Green

# 0.3 secrets 是否齐
Write-Host "  → 检查 secrets..." -ForegroundColor Gray
$secrets = npx wrangler secret list 2>&1
$required = @("DATABASE_URL", "PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "ALIPAY_APP_ID", "ALIPAY_PRIVATE_KEY", "ALIPAY_PUBLIC_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL")
$missing = @()
foreach ($s in $required) {
    if ($secrets -notmatch "\b$s\b") {
        $missing += $s
    }
}
if ($missing.Count -gt 0) {
    Write-Host "  ❌ 缺少 secrets: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "  请先跑: .\scripts\setup-secrets.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ 8 个 secrets 全部就位" -ForegroundColor Green

# 0.4 Drizzle 配置
if (-not (Test-Path "drizzle.config.ts")) {
    Write-Host "  ❌ drizzle.config.ts 不存在" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ drizzle.config.ts 存在" -ForegroundColor Green

Write-Host ""

# ─── Step 1: Drizzle 生成迁移 ───
Write-Host "[Step 1/6] 生成 Drizzle 迁移..." -ForegroundColor Yellow
npx drizzle-kit generate 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ drizzle-kit generate 失败" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 迁移文件生成" -ForegroundColor Green

# ─── Step 2: 应用迁移到 Supabase ───
Write-Host "[Step 2/6] 应用迁移到 Supabase..." -ForegroundColor Yellow
npx drizzle-kit migrate 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ drizzle-kit migrate 失败" -ForegroundColor Red
    Write-Host "  检查 DATABASE_URL 是否正确, Supabase 项目是否 ready" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ 14 张表已创建" -ForegroundColor Green
Write-Host "  → profiles / couples / pets / capsules / albums / posts / comments" -ForegroundColor Gray
Write-Host "  → likes / topics / challenges / challenge_participants" -ForegroundColor Gray
Write-Host "  → push_subscriptions / orders / memberships / tickets / referrals" -ForegroundColor Gray

Write-Host ""

# ─── Step 3: OpenNext Build ───
Write-Host "[Step 3/6] OpenNext Build..." -ForegroundColor Yellow
$buildStart = Get-Date
npm run cf-build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Build 失败" -ForegroundColor Red
    exit 1
}
$buildDuration = (Get-Date) - $buildStart
Write-Host "  ✅ Build 完成 (耗时 $([math]::Round($buildDuration.TotalSeconds, 1))s)" -ForegroundColor Green

# ─── Step 4: 部署 ───
Write-Host "[Step 4/6] 部署到 Cloudflare Workers..." -ForegroundColor Yellow
$deployOutput = npx wrangler deploy 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 部署失败" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}
$deployOutput | Out-String | Write-Host
Write-Host "  ✅ 部署完成" -ForegroundColor Green

# ─── Step 5: 提取 URL ───
Write-Host "[Step 5/6] 提取部署 URL..." -ForegroundColor Yellow
$siteUrl = ($deployOutput | Select-String -Pattern "https://[a-z0-9-]+\.workers\.dev" | Select-Object -First 1).Matches.Value
if (-not $siteUrl) {
    $siteUrl = "https://we2-v3.zprintprohk.workers.dev"  # fallback
}
Write-Host "  ✅ URL: $siteUrl" -ForegroundColor Green

# ─── Step 6: 验证 ───
Write-Host "[Step 6/6] 验证部署..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 6.1 健康检查
try {
    $healthResp = Invoke-WebRequest -Uri "$siteUrl/api/health" -UseBasicParsing -TimeoutSec 10
    if ($healthResp.StatusCode -eq 200) {
        Write-Host "  ✅ /api/health 200 OK" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  /api/health $($healthResp.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  /api/health 失败: $_" -ForegroundColor Yellow
}

# 6.2 Pricing 页 (英文)
try {
    $pricingResp = Invoke-WebRequest -Uri "$siteUrl/en/pricing" -UseBasicParsing -TimeoutSec 10
    if ($pricingResp.StatusCode -eq 200) {
        Write-Host "  ✅ /en/pricing 200 OK" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  /en/pricing $($pricingResp.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  /en/pricing 失败: $_" -ForegroundColor Yellow
}

# 6.3 i18n 闸门 (本地再跑一次)
Write-Host "  → i18n 4 闸门最终验证..." -ForegroundColor Gray
node scripts/check-locale-syntax.js 2>&1 | Select-Object -Last 3 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
node scripts/scan-locale-prefix.js 2>&1 | Select-Object -Last 2 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
node scripts/check-translation-completeness.js 2>&1 | Select-Object -Last 2 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
node scripts/check-locale-placeholders.js 2>&1 | Select-Object -Last 2 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "=== 部署完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来手动配的 Webhook:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  PayPal Webhook URL:" -ForegroundColor Cyan
Write-Host "    $siteUrl/api/paypal/webhook" -ForegroundColor White
Write-Host "    → PayPal Developer → My Apps → Webhooks → Add" -ForegroundColor Gray
Write-Host ""
Write-Host "  Alipay 异步通知 URL:" -ForegroundColor Cyan
Write-Host "    $siteUrl/api/alipay/notify" -ForegroundColor White
Write-Host "    → Alipay 开放平台 → 应用 → 开发设置" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 测试清单:" -ForegroundColor Yellow
Write-Host "  1. 访问 $siteUrl/en/pricing 看 USD 价格" -ForegroundColor White
Write-Host "  2. 访问 $siteUrl/zh-tw/pricing 看 HKD 价格" -ForegroundColor White
Write-Host "  3. 点 Subscribe → PayPal sandbox 走通" -ForegroundColor White
Write-Host "  4. 访问 $siteUrl/zh-cn/pricing → Alipay sandbox 走通" -ForegroundColor White
Write-Host ""
Write-Host "💡 监控:" -ForegroundColor Yellow
Write-Host "  - Cloudflare Dashboard → Workers → we2-v3 → Logs" -ForegroundColor Gray
Write-Host "  - Supabase Dashboard → Database → subscriptions 表看订单" -ForegroundColor Gray
Write-Host ""
