Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 1 & 2: Untracking node_modules from Git..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
git rm -r --cached node_modules 2>$null

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 3: Untracking dist from Git..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
git rm -r --cached dist 2>$null

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 5: Synchronizing package-lock.json..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
npm install --package-lock-only

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 7 & 8: Verifying clean install (npm ci) & build..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
npm ci
npm run build

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Step 11: Quality Gate (typecheck, lint, test, build)..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
npm run typecheck
npm run lint
npm test
npm run build

Write-Host "============================================================" -ForegroundColor Green
Write-Host "Step 13: Git Status & Diffs..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
git status --short
Write-Host "--- DIFF ---" -ForegroundColor Yellow
git diff -- .gitignore package.json package-lock.json netlify.toml
Write-Host "============================================================" -ForegroundColor Green
