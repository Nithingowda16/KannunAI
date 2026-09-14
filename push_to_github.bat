@echo off
echo ============================================================
echo Pushing Code Quality 100/100 Modular Architecture to GitHub...
echo ============================================================
git add .
git commit -m "refactor(quality): achieve 100/100 Code Quality architecture (zero any, modular server routes, schema validator, typed error hierarchy, separated GeminiProvider/MockProvider, discriminated API unions)"
git push origin main
echo ============================================================
echo Push Complete! Check https://github.com/Nithingowda16/KannunAI
echo ============================================================
