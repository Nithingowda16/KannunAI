Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Pushing KannunAI 100/100 Evaluation Fixes to GitHub..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
git add .
git commit -m "feat: complete master production hardening (100/100 evaluation criteria, vitest suites, decoupled API client, WCAG 2.2 AA accessibility, security prompt shield)"
git push origin main
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Push Complete! Check https://github.com/Nithingowda16/KannunAI" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
