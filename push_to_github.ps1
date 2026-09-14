Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Pushing 100% Zero-Error Local RAG Architecture to GitHub..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
git rm -f render.yaml 2>$null
git add .
git commit -m "docs(readme): update README for PromptWars alignment and accurate local architecture"
git push origin main
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Push Complete! Check https://github.com/Nithingowda16/KannunAI" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
