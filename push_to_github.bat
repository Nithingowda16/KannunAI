@echo off
echo ============================================================
echo Pushing 100% Zero-Error Local RAG Architecture to GitHub...
echo ============================================================
git add .
git commit -m "fix(qa): ground short-chunk retrieval and keyword matching in InMemoryVectorStore for 100% test pass"
git push origin main
echo ============================================================
echo Push Complete! Check https://github.com/Nithingowda16/KannunAI
echo ============================================================
