@echo off
echo ============================================================
echo Step 1 & 2: Untracking node_modules from Git...
echo ============================================================
git rm -r --cached node_modules 2>nul

echo ============================================================
echo Step 3: Untracking dist from Git...
echo ============================================================
git rm -r --cached dist 2>nul

echo ============================================================
echo Step 5: Synchronizing package-lock.json...
echo ============================================================
call npm install --package-lock-only

echo ============================================================
echo Step 7 & 8: Verifying clean install (npm ci) & build...
echo ============================================================
call npm ci
call npm run build

echo ============================================================
echo Step 11: Quality Gate (typecheck, lint, test, build)...
echo ============================================================
call npm run typecheck
call npm run lint
call npm test
call npm run build

echo ============================================================
echo Step 13: Git Status & Diffs...
echo ============================================================
git status --short
echo --- DIFF ---
git diff -- .gitignore package.json package-lock.json netlify.toml
echo ============================================================
