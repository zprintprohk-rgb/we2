const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), '.open-next');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanWithRetry(maxRetries = 5) {
  if (!fs.existsSync(targetDir)) {
    console.log('✅ .open-next does not exist, skipping cleanup');
    return;
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Strategy 1: rename first (Windows rename usually works despite read locks)
      const tempDir = `${targetDir}.old.${Date.now()}`;
      fs.renameSync(targetDir, tempDir);
      fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 });
      console.log('✅ .open-next cleaned (rename + rm)');
      return;
    } catch (_renameErr) {
      try {
        // Strategy 2: direct recursive remove with force
        fs.rmSync(targetDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
        console.log('✅ .open-next cleaned (direct rm)');
        return;
      } catch (_rmErr) {
        try {
          // Strategy 3: shell-based deletion (bypasses Node fs locks)
          if (process.platform === 'win32') {
            execSync(`rd /s /q "${targetDir}"`, { stdio: 'pipe', timeout: 10000 });
            // Windows 需要额外等待文件系统释放句柄，否则后续 OpenNext 会 EPERM
            // 轮询直到目录消失，然后额外等待 2 秒确保句柄完全释放
            console.log('   Waiting for Windows filesystem to release locks...');
            for (let w = 0; w < 15; w++) {
              if (!fs.existsSync(targetDir)) break;
              await sleep(500);
            }
            if (fs.existsSync(targetDir)) {
              throw new Error('Directory still exists after rd /s /q');
            }
            // 额外冷却时间 — 确保 Windows 内核完全释放路径句柄
            await sleep(2000);
          } else {
            execSync(`rm -rf "${targetDir}"`, { stdio: 'pipe', timeout: 10000 });
          }
          console.log('✅ .open-next cleaned (shell rd/rm)');
          return;
        } catch (_shellErr) {
          console.log(`⚠️ Cleanup attempt ${i + 1}/${maxRetries} failed`);
          if (i < maxRetries - 1) {
            console.log('   Retrying in 2s...');
            await sleep(2000);
          } else {
            console.warn(`\n⚠️  .open-next is locked by another process.`);
            console.warn('   The build will continue — OpenNext will handle cleanup internally.');
            // Don't exit — let OpenNext's initOutputDir handle the cleanup
            return;
          }
        }
      }
    }
  }
}

cleanWithRetry();
