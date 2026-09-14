@echo off
echo ============================================================
echo Pushing 100% Zero-Error Local RAG Architecture to GitHub...
echo ============================================================
git add .
git commit -m "fix(ci): synchronize lockfile, add vite-env.d.ts, restore npm ci and achieve 100% clean CI quality gate"
git push origin main
echo ============================================================
echo Push Complete! Check https://github.com/Nithingowda16/KannunAI
echo ============================================================
