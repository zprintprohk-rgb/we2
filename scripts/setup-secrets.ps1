# setup-secrets.ps1 — 从 .env.production 批量配置 Cloudflare Workers secrets
#
# 用法:
#   1. 复制 .env.production.example 为 .env.production
#   2. 填好 8 个真实值 (DATABASE_URL, Supabase keys, PayPal keys, Alipay keys)
#   3. 跑: .\scripts\setup-secrets.ps1
#
# 优点 (vs 交互式):
#   - 无手输错误 (复制粘贴最容易出错)
#   - 可审计 (填好的 .env 是真相源)
#   - 可重跑 (幂等, 跑两次结果一样)
#   - 支持 CI/CD (非交互)
#
# 安全提示:
#   - 填好的 .env.production 必须加进 .gitignore!
#   - 跑完脚本后, 建议把 .env.production 移到 1Password / Bitwarden / 加密 U 盘

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host ""
Write-Host "=== We2 Cloudflare Workers Secrets 批量配置 ===" -ForegroundColor Cyan
Write-Host "  (从 .env.production 读取, 8 个 secrets 一键配置)" -ForegroundColor Gray
Write-Host ""

# ─── Step 1: 找 .env.production ───
$envFile = ".env.production"
if (-not (Test-Path $envFile)) {
    Write-Host "[Step 1/5] ❌ 找不到 $envFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先:" -ForegroundColor Yellow
    Write-Host "  1. 复制 .env.production.example 为 .env.production" -ForegroundColor White
    Write-Host "  2. 填入 8 个真实值 (DATABASE_URL, Supabase, PayPal, Alipay)" -ForegroundColor White
    Write-Host "  3. 跑这个脚本" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host "[Step 1/5] ✅ 找到 $envFile" -ForegroundColor Green

# ─── Step 2: 检查 .gitignore (安全) ───
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -notmatch [regex]::Escape($envFile)) {
        Write-Host ""
        Write-Host "⚠️  警告: .env.production 不在 .gitignore 中!" -ForegroundColor Yellow
        Write-Host "   强烈建议加一行: echo '.env.production' >> .gitignore" -ForegroundColor Yellow
        Write-Host ""
        $confirm = Read-Host "   继续? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Host "已取消" -ForegroundColor Red
            exit 1
        }
    }
}

# ─── Step 3: 解析 .env ───
Write-Host "[Step 2/5] 解析 .env.production..." -ForegroundColor Yellow

function Parse-DotEnvFile {
    param([string]$Path)
    
    $env = [ordered]@{}
    $content = Get-Content $Path -Raw -Encoding UTF8
    
    $i = 0
    while ($i -lt $content.Length) {
        # 跳过空白
        while ($i -lt $content.Length -and [char]::IsWhiteSpace($content[$i])) { $i++ }
        if ($i -ge $content.Length) { break }
        
        # 跳过注释 (#)
        if ($content[$i] -eq '#') {
            while ($i -lt $content.Length -and $content[$i] -ne "`n") { $i++ }
            continue
        }
        
        # 读 key (A-Z, 0-9, _)
        $keyStart = $i
        while ($i -lt $content.Length -and $content[$i] -match '[A-Z0-9_]') { $i++ }
        if ($i -ge $content.Length -or $keyStart -eq $i) { break }
        $key = $content.Substring($keyStart, $i - $keyStart)
        
        # 跳过空白 + =
        while ($i -lt $content.Length -and [char]::IsWhiteSpace($content[$i])) { $i++ }
        if ($i -ge $content.Length -or $content[$i] -ne '=') { continue }
        $i++
        while ($i -lt $content.Length -and [char]::IsWhiteSpace($content[$i])) { $i++ }
        
        # 读 value
        if ($i -lt $content.Length -and ($content[$i] -eq '"' -or $content[$i] -eq "'")) {
            # Quoted (支持多行)
            $quote = $content[$i]
            $i++
            $valueStart = $i
            while ($i -lt $content.Length -and $content[$i] -ne $quote) { $i++ }
            $value = $content.Substring($valueStart, $i - $valueStart)
            $i++  # skip closing quote
        } else {
            # Unquoted (到行尾)
            $valueStart = $i
            while ($i -lt $content.Length -and $content[$i] -ne "`n") { $i++ }
            $value = $content.Substring($valueStart, $i - $valueStart).Trim()
        }
        
        $env[$key] = $value
    }
    
    return $env
}

try {
    $envVars = Parse-DotEnvFile -Path $envFile
    Write-Host "  ✅ 解析完成, 找到 $($envVars.Count) 个变量" -ForegroundColor Green
} catch {
    Write-Host "  ❌ 解析失败: $_" -ForegroundColor Red
    exit 1
}

# ─── Step 4: 验证必需字段 ───
Write-Host "[Step 3/5] 验证必需字段..." -ForegroundColor Yellow

$required = [ordered]@{
    "DATABASE_URL"              = "Supabase Transaction mode"
    "NEXT_PUBLIC_SUPABASE_URL"  = "Supabase Project URL"
    "SUPABASE_SERVICE_ROLE_KEY" = "Supabase service_role"
    "PAYPAL_CLIENT_ID"          = "PayPal Developer"
    "PAYPAL_CLIENT_SECRET"      = "PayPal Developer"
    "ALIPAY_APP_ID"             = "Alipay 开放平台"
    "ALIPAY_PRIVATE_KEY"        = "Alipay 私钥 (多行)"
    "ALIPAY_PUBLIC_KEY"         = "Alipay 公钥 (多行)"
}

$missing = @()
foreach ($key in $required.Keys) {
    $value = $envVars[$key]
    $isMissing = $false
    
    if (-not $envVars.Contains($key)) {
        $isMissing = $true
    } elseif ([string]::IsNullOrWhiteSpace($value)) {
        $isMissing = $true
    } elseif ($value -match '^YOUR_|^xxx|^\.\.\.$') {
        # 占位符未替换
        $isMissing = $true
    }
    
    if ($isMissing) {
        $missing += $key
    } else {
        # 显示 key 长度 (不显示值)
        $len = $value.Length
        $preview = if ($len -gt 60) { $value.Substring(0, 60) + "..." } else { $value }
        Write-Host "  ✅ $key ($($required[$key])) [$len 字符]" -ForegroundColor Green
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "  ❌ 缺少/未填字段:" -ForegroundColor Red
    foreach ($k in $missing) {
        Write-Host "     - $k ($($required[$k]))" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "  请编辑 .env.production 补全这些字段" -ForegroundColor Yellow
    exit 1
}

# ─── Step 5: wrangler 登录验证 ───
Write-Host "[Step 4/5] 验证 wrangler 登录..." -ForegroundColor Yellow
$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 未登录 Cloudflare" -ForegroundColor Red
    Write-Host "  请先跑: npx wrangler login" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ 已登录" -ForegroundColor Green

# ─── Step 6: 配置 secrets ───
Write-Host "[Step 5/5] 配置 8 个 secrets..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
foreach ($key in $required.Keys) {
    $value = $envVars[$key]
    Write-Host "  → $key ... " -ForegroundColor Gray -NoNewline
    
    # 写到临时文件, 用 wrangler secret put 读取
    # (避免命令行长度限制, 处理多行 Alipay 私钥)
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tempFile, $value, [System.Text.Encoding]::UTF8)
        npx wrangler secret put $key < $tempFile 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`r  ✅ $key                                        " -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "`r  ❌ $key 失败                                   " -ForegroundColor Red
        }
    } finally {
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "=== 配置完成 ===" -ForegroundColor Green
Write-Host "  成功: $successCount / $($required.Count)" -ForegroundColor $(if ($successCount -eq $required.Count) { "Green" } else { "Yellow" })
Write-Host ""

# 验证
Write-Host "[验证] wrangler secret list:" -ForegroundColor Cyan
$secretList = npx wrangler secret list 2>&1
foreach ($key in $required.Keys) {
    if ($secretList -match "\b$key\b") {
        Write-Host "  ✅ $key" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $key (未找到)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 验证 secrets: npx wrangler secret list" -ForegroundColor White
Write-Host "  2. 一键部署: .\scripts\deploy.ps1" -ForegroundColor White
Write-Host ""
Write-Host "安全提示:" -ForegroundColor Yellow
Write-Host "  ⚠️  .env.production 含真实 secrets, 强烈建议:" -ForegroundColor White
Write-Host "     1. 确认在 .gitignore" -ForegroundColor Gray
Write-Host "     2. 跑完后移到 1Password / Bitwarden" -ForegroundColor Gray
Write-Host "     3. 本地保留加密副本 (gpg -c .env.production)" -ForegroundColor Gray
Write-Host ""
