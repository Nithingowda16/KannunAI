# Lexora — Legal Document Intelligence Platform

> **"Understand your legal documents before you sign."**

Lexora is a competition-winning, production-minded GenAI legal document intelligence platform built for PromptWars (**"AI for Legal Assistance & Access"**).

It translates complex legal contracts into plain-language summaries, interactive risk radar assessments, structured clause analysis, grounded Q&A with exact source citations, side-by-side contract comparison, interactive pre-signing checklists, and printable lawyer preparation briefs.

---

## 🌟 Key Capabilities

1. **Plain-Language Summary**: Summarizes contract type, purpose, explicit parties, effective date, duration, key obligations, deadlines, and highlights unestablished missing information.
2. **Clause Explorer**: Detects and categorizes 18+ legal clause types (Payment, Termination, Renewal, Liability, IP, Non-Compete, Confidentiality, etc.) with original text and plain-language explanations.
3. **Accessible Risk Radar**: Categorizes findings into Low, Medium, and High attention levels using dual-encoding (icons + text), non-conclusion language, evidence snippets, and suggested questions.
4. **Grounded Legal Q&A**: Document-grounded assistant with preset questions and custom query support. Returns answers anchored strictly in document evidence with clickable section and page citations.
5. **Contract Comparison**: Side-by-side comparison engine (Contract A vs B) showing classified diffs across financial terms, liability caps, and termination notice windows.
6. **Actionable Pre-Signing Checklist**: Interactive checklist tracking pre-signing verification tasks with progress indicators.
7. **Lawyer Preparation Brief ("Prepare for a Lawyer")**: Generates structured, exportable/printable reports summarizing obligations, dates, flagged concerns, and custom questions for legal counsel.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript (Strict Mode), Vite, Lucide Icons, Vanilla CSS Design System (`src/index.css`)
- **AI / RAG Pipeline**: Grounded Vector Search (TF-IDF), Sliding-Window Semantic Chunker, Google Gemini API Provider (`gemini-2.5-flash`), Deterministic Mock AI Fallback Engine
- **Server Proxy Layer**: Node.js API Proxy (`server/`) with HSTS/CSP security headers, sliding-window rate limiting, server-side binary magic byte MIME checking, and prompt injection isolation
- **Accessibility**: Target WCAG 2.2 AA compliance, semantic HTML5, visible focus rings, ARIA live regions, dual-encoding status badges

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone or navigate to directory
cd "AI for Legal And Access"

# Install dependencies
npm install

# Run Vite Development Server
npm run dev
```

The application will launch at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 🧪 Automated Testing

Lexora includes an automated test runner validating unit logic, prompt injection defense, and accessibility principles:

```bash
npm test
```

Includes:
- `fileValidator.test.ts`: Filename sanitization against path traversal (`../`), size enforcement.
- `promptShield.test.ts`: Neutralization of indirect prompt injection payloads.
- `accessibilityTests.ts`: WCAG 2.2 AA DOM checks (`lang="en"`, skip anchor, accessible titles).

---

## 🔒 Security & Responsible AI Disclaimer

Lexora provides legal document intelligence and general information. It does **not** provide legal advice, claim attorney privilege, or replace a qualified legal professional.

All uploaded documents are treated as untrusted passive text data. Server-side binary inspection prevents file type spoofing, and API credentials remain securely contained.
