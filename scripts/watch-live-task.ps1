# Wave 4 (22.11.2026): nightly website watch, started by the Windows task "AETERNUS Website-Waechter".
# Runs in its own worktree C:\_CB\WEBSITE_WAECHTER_MAIN, which belongs to the watch alone: it is forced to the
# newest origin/main, then the DE site is built so every printed QR route (public/qr/**) is known, then the
# watch reads both live sites. Nothing is pushed or deployed from here.
# Decision: decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122
$ErrorActionPreference = 'Stop'
$tree = Split-Path -Parent $PSScriptRoot
$log = 'C:\AETERNUS\00_BETRIEBSDATEN\COORDINATION\WEBSITE_WAECHTER\LAUF.log'
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
"$(Get-Date -Format o) start $tree" | Add-Content $log
git -C $tree fetch -q origin main
# The build rewrites tracked files; in this dedicated worktree they are simply reset each night.
git -C $tree checkout -q -f --detach origin/main
git -C $tree clean -fdq public
Push-Location $tree
try {
  npm ci --no-audit --no-fund --loglevel=error 2>&1 | Add-Content $log
  npm run build --silent 2>&1 | Select-Object -Last 5 | Add-Content $log
  if ($LASTEXITCODE -ne 0) { "$(Get-Date -Format o) DE build failed ($LASTEXITCODE); watch runs on the committed QR pages only" | Add-Content $log }
  node scripts\watch-live.cjs 2>&1 | Add-Content $log
  "$(Get-Date -Format o) exit $LASTEXITCODE" | Add-Content $log
} finally { Pop-Location }
