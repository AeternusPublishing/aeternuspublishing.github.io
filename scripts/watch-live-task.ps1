# Wave 4 (22.11.2026): nightly website watch, started by the Windows task "AETERNUS Website-Waechter".
# Runs in its own read-only worktree C:\_CB\WEBSITE_WAECHTER_MAIN, moved to the newest origin/main first.
# Decision: decision_website_welle4_qualitaetsgate_drei_stufen_mergesperre_lokaler_deploy_20261122
$ErrorActionPreference = 'Stop'
$tree = Split-Path -Parent $PSScriptRoot
$log = 'C:\AETERNUS\00_BETRIEBSDATEN\COORDINATION\WEBSITE_WAECHTER\LAUF.log'
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
"$(Get-Date -Format o) start $tree" | Add-Content $log
git -C $tree fetch -q origin main
git -C $tree checkout -q --detach origin/main
node (Join-Path $tree 'scripts\watch-live.cjs') 2>&1 | Add-Content $log
"$(Get-Date -Format o) exit $LASTEXITCODE" | Add-Content $log
