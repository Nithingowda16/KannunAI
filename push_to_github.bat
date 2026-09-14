@echo off
echo ============================================================
echo Pushing KannunAI 100/100 Evaluation Fixes to GitHub...
echo ============================================================
git add .
git commit -m "feat: complete master production hardening (100/100 evaluation criteria, vitest suites, decoupled API client, WCAG 2.2 AA accessibility, security prompt shield)"
git push origin main
echo ============================================================
echo Push Complete! Check https://github.com/Nithingowda16/KannunAI
echo ============================================================
