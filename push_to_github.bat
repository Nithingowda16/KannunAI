@echo off
echo ============================================================
echo Pushing Testing 100/100 Suite to GitHub...
echo ============================================================
git add .
git commit -m "test: implement 100/100 Testing suite (Playwright E2E journey, Playwright axe-core accessibility audit, API integration matrix, AI schema validation, fixtures, GitHub Actions CI)"
git push origin main
echo ============================================================
echo Push Complete! Check https://github.com/Nithingowda16/KannunAI
echo ============================================================
