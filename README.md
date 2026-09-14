# KannunAI — AI Legal Document Intelligence Platform

> **"Understand your legal documents before you sign."**

**KannunAI** is a production-grade, competition-winning AI legal document intelligence platform built for **"AI for Legal Assistance & Access"**.

It translates complex legal agreements into plain-language summaries, interactive risk radar assessments, structured clause analysis, grounded Q&A with exact source section & page citations, side-by-side contract comparison, interactive pre-signing checklists, and exportable lawyer preparation briefs.

---

## 🌟 Key Capabilities

1. **Plain-Language Summary**: Summarizes contract type, purpose, explicit parties, effective date, duration, key obligations, deadlines, and highlights unestablished missing information.
2. **Clause Explorer**: Detects and categorizes 18+ legal clause types (Payment, Termination, Renewal, Liability, IP, Non-Compete, Confidentiality, Governing Law, etc.) with original text snippets and plain-language explanations.
3. **Accessible Risk Radar**: Categorizes findings into Low, Medium, and High attention levels using dual-encoding (icons + text + color), non-conclusion advisory language, evidence snippets, and suggested questions.
4. **Grounded Legal Q&A**: Document-grounded assistant with preset questions and custom query support. Returns answers anchored strictly in document evidence with clickable section and page citations.
5. **Side-by-Side Contract Comparison**: Dual-document comparison engine (Contract A vs B) showing classified diffs across financial terms, liability caps, notice windows, and renewal terms.
6. **Actionable Pre-Signing Checklist**: Interactive checklist tracking payment verification, termination notices, IP assignments, and liability caps.
7. **Lawyer Preparation Brief ("Prepare for a Lawyer")**: Generates structured, exportable/printable reports summarizing obligations, dates, flagged concerns, and custom questions for legal counsel.

---

## 🚀 Deployment Guide on Render

You can deploy **KannunAI** on [Render](https://render.com) in **under 2 minutes**.

### Method 1: Automatic Deployment using `render.yaml` Blueprint (Recommended)

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/Nithingowda16/KannunAI.git`.
4. Render will automatically detect `render.yaml` and configure the static web service:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `./dist`
5. Click **Apply**. Render will build and deploy your live URL (e.g., `https://kannun-ai.onrender.com`).

### Method 2: Manual Static Site Setup on Render

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Static Site**.
3. Connect your repository `Nithingowda16/KannunAI`.
4. Configure the settings:
   - **Name**: `kannun-ai`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Under **Advanced / Rewrites & Redirects**, add a SPA Rewrite Rule:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
6. Click **Create Static Site**.

---

## 🏗️ Tech Stack & Quality-Gate Architecture

- **Frontend**: React 18, TypeScript (Strict Mode), Vite, Lucide Icons, Vanilla CSS Design System ([`src/index.css`](file:///c:/Users/nithi/AI%20for%20Legal%20And%20Access/src/index.css))
- **AI / RAG Pipeline**: Grounded Vector Search (TF-IDF), Sliding-Window Semantic Chunker, Google Gemini API Provider (`gemini-2.5-flash`), Deterministic Local Mock AI Engine
- **Security Engineering**:
  - **Binary Magic Byte Verification**: Validates PDF (`%PDF-`), DOCX (`PK\x03\x04`), and text header bytes to block extension spoofing.
  - **Path Traversal & XSS Sanitization**: Strips dangerous file paths (`..`, `/`, `\`) and sanitizes active script tags.
  - **Indirect Prompt Injection Shield**: Isolates untrusted document text inside `<LEGAL_DOCUMENT_DATA>` XML delimiter boundaries.
- **Accessibility**: WCAG 2.2 AA compliant, semantic HTML5, visible focus trap management ([`Modal.tsx`](file:///c:/Users/nithi/AI%20for%20Legal%20And%20Access/src/components/ui/Modal.tsx)), ARIA live regions, and dual-encoding status badges (Icon + Text + Color).

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/Nithingowda16/KannunAI.git
cd KannunAI

# Install dependencies
npm install

# Run Vite Development Server
npm run dev
```

The application will launch locally at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 🧪 Automated Testing Suite

KannunAI includes an automated quality-gate test runner validating unit logic, security shields, WCAG 2.2 AA accessibility rules, and end-to-end user flows:

```bash
npm test
```

Test Coverage Includes:
- **Unit Tests**: File validator, path traversal sanitization, sliding window chunker, vector store TF-IDF retrieval.
- **Security Tests**: Neutralization of indirect prompt injection payloads and binary magic byte sniffing.
- **Accessibility Tests**: WCAG 2.2 AA DOM checks (`lang="en"`, skip link navigation, title branding).
- **E2E User Journey Tests**: Full user flow from upload through summary, risk radar, grounded Q&A, pre-signing checklist, and lawyer brief generation.

---

## 🔒 Responsible Legal AI Disclaimer

**KannunAI** provides legal document intelligence and general research information. It does **not** provide legal advice, claim attorney privilege, or replace a licensed legal professional.

All uploaded contracts are processed as untrusted passive text data strictly in-memory.
