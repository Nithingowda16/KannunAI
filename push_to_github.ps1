Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Untracking node_modules & pushing clean build config..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
git rm -r --cached node_modules 2>$null
git rm -r --cached dist 2>$null
git add .
git commit -m "fix(deploy): untrack node_modules and use vite build for Netlify"
git push origin main
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Push Complete! Check Netlify deploy" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
