# check-supabase.ps1 — 验证 Supabase 4 个 keys 的格式
#
# 用法:
#   1. 复制 .env.production.example 为 .env.production
#   2. 填入 4 个 Supabase 值
#   3. 跑: .\scripts\check-supabase.ps1
#
# ⚠️ 本脚本只验证格式 (不读实际值, 不打印实际值)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Supabase 4 个 Keys 格式验证 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 .env.production
$envFile = ".env.production"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ 找不到 $envFile" -ForegroundColor Red
    Write-Host "  复制 .env.production.example 为 .env.production, 填好 Supabase 4 个值" -ForegroundColor Yellow
    exit 1
}

# 2. 解析 (复用 setup-secrets.ps1 的状态机解析)
function Parse-DotEnvFile {
    param([string]$Path)
    $env = [ordered]@{}
    $content = Get-Content $Path -Raw -Encoding UTF8
    $i = 0
    while ($i -lt $content.Length) {
        while ($i -lt $content.Length -and [char]::IsWhiteSpace($content[$i])) { $i++ }
        if ($i -ge $content.Length) { break }
        if ($content[$i] -eq '#') {
            while ($i -lt $content.Length -and $content[$i] -ne "`n") { $i++ }
            continue
        }
        $keyStart = $i
        while ($i -lt $content.Length -and $content[$i] -match '[A-Z0-9_]') { $i++ }
        if ($i -ge $content.Length -or $keyStart -eq $i) { break }
        $key = $content.Substring($keyStart, $i - $keyStart)
        while ($i -lt $content.Length -and [char]::IsWhiteSpace($content[$i])) { $i++ }
        if ($i -ge $content.Length -or $content[$i] -ne '=') { continue }
        $i++
        while ($i -lt $content.Length -and [char]::IsWhiteSpace($content[$i])) { $i++ }
        if ($i -lt $content.Length -and ($content[$i] -eq '"' -or $content[$i] -eq "'")) {
            $quote = $content[$i]
            $i++
            $valueStart = $i
            while ($i -lt $content.Length -and $content[$i] -ne $quote) { $i++ }
            $value = $content.Substring($valueStart, $i - $valueStart)
            $i++
        } else {
            $valueStart = $i
            while ($i -lt $content.Length -and $content[$i] -ne "`n") { $i++ }
            $value = $content.Substring($valueStart, $i - $valueStart).Trim()
        }
        $env[$key] = $value
    }
    return $env
}

$envVars = Parse-DotEnvFile $envFile
Write-Host "📄 解析 $envFile 完成, 找到 $($envVars.Count) 个变量" -ForegroundColor Gray
Write-Host ""

# 3. 验证 4 个值
$pass = 0
$fail = 0
$warn = 0

function Test-Field {
    param(
        [string]$Name,
        [string]$Pattern,
        [string]$Expected,
        [string]$HintIfFail
    )
    $script:total++
    if (-not $script:envVars.Contains($Name)) {
        Write-Host "  ❌ $Name — 不存在 (请在 .env.production 加一行: $Name=...)" -ForegroundColor Red
        $script:fail++
        return
    }
    $value = $script:envVars[$Name]
    if ([string]::IsNullOrWhiteSpace($value) -or $value -match '^YOUR_|^xxx|^\.\.\.$') {
        Write-Host "  ❌ $Name — 占位符未替换 (还是模板值)" -ForegroundColor Red
        Write-Host "     提示: $HintIfFail" -ForegroundColor Gray
        $script:fail++
        return
    }
    if ($value -match $Pattern) {
        Write-Host "  ✅ $Name — 格式正确 ($Expected, $($value.Length) 字符)" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  ❌ $Name — 格式不对" -ForegroundColor Red
        Write-Host "     期望: $Expected" -ForegroundColor Gray
        Write-Host "     提示: $HintIfFail" -ForegroundColor Gray
        $script:fail++
    }
}

$total = 0
$envVars = $envVars  # 给函数用

Write-Host "[1/4] DATABASE_URL" -ForegroundColor Yellow
Test-Field -Name "DATABASE_URL" `
    -Pattern '^postgresql://postgres\.[a-z0-9]+:[^@\s]+@[a-z0-9-]+\.pooler\.supabase\.com:6543/postgres\s*$' `
    -Expected "Transaction mode (port 6543)" `
    -HintIfFail "Supabase Dashboard → Settings → Database → Connection string → 选 'Transaction mode' (端口 6543) → 复制完整 URL"

Write-Host ""
Write-Host "[2/4] NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
Test-Field -Name "NEXT_PUBLIC_SUPABASE_URL" `
    -Pattern '^https://[a-z0-9]+\.supabase\.co\s*$' `
    -Expected "https://[ref].supabase.co" `
    -HintIfFail "Supabase Dashboard → Settings → API → Project URL (e.g., https://abcdefghijk.supabase.co)"

Write-Host ""
Write-Host "[3/4] NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
Test-Field -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" `
    -Pattern '^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\s*$' `
    -Expected "JWT 格式 (eyJ开头, 3 段, 段间 . 分隔)" `
    -HintIfFail "Supabase Dashboard → Settings → API → 'anon' 'public' 那一行的 JWT (anon key, 比 service_role 短)"

Write-Host ""
Write-Host "[4/4] SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
Test-Field -Name "SUPABASE_SERVICE_ROLE_KEY" `
    -Pattern '^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\s*$' `
    -Expected "JWT 格式 (eyJ开头, 3 段)" `
    -HintIfFail "Supabase Dashboard → Settings → API → 'service_role' 那一行 (⚠️ 点 Reveal, 比 anon 长)"

# 额外: service_role 必须比 anon 长
if ($envVars.Contains("NEXT_PUBLIC_SUPABASE_ANON_KEY") -and $envVars.Contains("SUPABASE_SERVICE_ROLE_KEY")) {
    $anonLen = $envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"].Length
    $serviceLen = $envVars["SUPABASE_SERVICE_ROLE_KEY"].Length
    if ($serviceLen -le $anonLen) {
        Write-Host ""
        Write-Host "  ⚠️  严重警告: SERVICE_ROLE_KEY 长度 ($serviceLen) ≤ ANON_KEY 长度 ($anonLen)" -ForegroundColor Yellow
        Write-Host "     这两个 key 应该是不同的! service_role 应该比 anon 长 30-50 字符" -ForegroundColor Yellow
        Write-Host "     可能复制错了 — 重新去 Dashboard 拿 service_role" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "  ✅ service_role 比 anon 长 $((serviceLen - $anonLen)) 字符 — 正确" -ForegroundColor Green
    }
}

# 4. 总结
Write-Host ""
Write-Host "=== 总结 ===" -ForegroundColor Cyan
Write-Host "  ✅ PASS: $pass / 4" -ForegroundColor $(if ($pass -eq 4) { "Green" } else { "Yellow" })
if ($fail -gt 0) {
    Write-Host "  ❌ FAIL: $fail / 4" -ForegroundColor Red
    Write-Host ""
    Write-Host "请按上面 ❌ 提示修正后重跑" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host ""
    Write-Host "🎉 4 个 Supabase 值格式全部正确!" -ForegroundColor Green
    Write-Host "下一步: 继续 Step 2 (R2 桶) + Step 3 (Cloudflare login) + Step 4 (PayPal)" -ForegroundColor Yellow
}
