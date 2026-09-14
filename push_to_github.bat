@echo off
echo ============================================================
echo Pushing 100% Zero-Error Local RAG Architecture to GitHub...
echo ============================================================
git rm -f render.yaml 2>nul
git add .
git commit -m "docs(readme): update README for PromptWars alignment and accurate local architecture"
git push origin main
echo ============================================================
echo Push Complete! Check https://github.com/Nithingowda16/KannunAI
echo ============================================================
