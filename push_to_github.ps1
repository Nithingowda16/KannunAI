Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Pushing Code Quality 100/100 Modular Architecture to GitHub..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
git add .
git commit -m "refactor(quality): achieve 100/100 Code Quality architecture (zero any, modular server routes, schema validator, typed error hierarchy, separated GeminiProvider/MockProvider, discriminated API unions)"
git push origin main
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Push Complete! Check https://github.com/Nithingowda16/KannunAI" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
