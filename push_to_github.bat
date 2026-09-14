@echo off
echo ============================================================
echo Untracking node_modules & pushing clean build config...
echo ============================================================
git rm -r --cached node_modules 2>nul
git rm -r --cached dist 2>nul
git add .
git commit -m "fix(deploy): untrack node_modules and use vite build for Netlify"
git push origin main
echo ============================================================
echo Push Complete! Check Netlify deploy
echo ============================================================
