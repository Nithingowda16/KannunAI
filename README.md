# KannunAI — Legal Document Intelligence Platform

> **"Understand your legal documents before you sign."**

**KannunAI** is an accessible legal document intelligence platform developed as a competition submission for the **PromptWars "AI for Legal Assistance & Access"** track. It is engineered to help individuals, freelancers, and small business owners understand complex contracts and legal agreements without replacing a qualified attorney.

KannunAI transforms dense legal language into clear, plain-language summaries, interactive risk assessments, structured clause breakdowns, evidence-grounded Q&A with direct document citations, side-by-side contract comparisons, pre-signing verification checklists, and structured preparation briefs for legal consultations.

KannunAI operates as an **informational assistance platform**—not a source of legal advice. Its core design emphasizes explainability, document evidence, obligation tracking, risk awareness, and actionable next steps.

---

## ⚖️ Problem Statement & Competition Alignment

The legal landscape presents significant barriers to justice and fair negotiation:

- **Information Asymmetry**: Non-lawyers regularly sign agreements (employment contracts, leases, SaaS agreements, NDAs) without fully understanding the binding obligations, restrictive covenants, or liability liabilities embedded within them.
- **Prohibitive Consultation Costs**: Engaging legal counsel for initial review is often cost-prohibitive, leading people to sign agreements blindly.
- **Opacity & Dense Jargon**: Traditional contracts conceal operational and financial risks within verbose cross-references and legalistic terms.

### How KannunAI Solves This

KannunAI addresses the **"AI for Legal Assistance & Access"** challenge through structured, evidence-anchored analysis:

- **Simplifying Legal Documents**: Generates structured, plain-language explanations of contract scope, key dates, obligations, and missing elements.
- **Surfacing Obligations & Risks**: Identifies critical clauses and potential concerns with multi-level attention indicators and explanatory notes.
- **Document-Grounded Q&A**: Answers user questions using strictly retrieved document evidence with clickable citations, refusing to extrapolate beyond document text.
- **Side-by-Side Comparison**: Highlights contractual variance and differing terms across two versions of an agreement.
- **Actionable Checklists**: Provides interactive pre-signing verification steps to guide informed decision-making.
- **Empowering Legal Consultations**: Prepares exportable, organized briefs that users can take to an attorney, reducing billable review hours and focusing discussion on critical terms.
- **Ethical AI Boundaries**: Clarifies that AI provides informational assistance to enhance legal literacy, preserving user agency and respecting the boundaries of the legal profession.

---

## 🌟 Key Capabilities

1. **Plain-Language Summary**  
   Extracts and summarizes core agreement metadata: contract type, stated purpose, participating parties, effective dates, durations, governing terms, key obligations, deadlines, and highlights missing or unstated provisions.

2. **Clause Explorer**  
   Detects and categorizes standard legal clauses (Payment Terms, Termination, Renewal, Liability Caps, Intellectual Property, Non-Compete, Confidentiality, Indemnification, Governing Law, etc.), presenting original text excerpts alongside plain-language explanations.

3. **Risk Radar**  
   Highlights potential areas of concern categorized into Low, Medium, and High attention levels. Uses dual-encoding (icons and text labels alongside color), neutral advisory language, quoted evidence snippets, and suggested follow-up questions for legal counsel.

4. **Grounded Legal Q&A**  
   An in-document question-answering interface featuring common preset questions as well as custom user queries. Answers are anchored directly to retrieved document passages with explicit section and page citations. When evidence is insufficient, it explicitly states that the document does not provide the answer.

5. **Contract Comparison (Side-by-Side)**  
   Compares two documents (e.g., Contract A vs. Contract B) across key contractual parameters: payment terms, termination notice periods, liability caps, and renewal conditions, highlighting specific differences.

6. **Pre-Sign Checklist**  
   An interactive verification checklist covering critical pre-execution checkpoints such as fee schedules, notice windows, non-solicitation bounds, and intellectual property assignments.

7. **Lawyer Preparation Brief ("Prepare for a Lawyer")**  
   Compiles a structured summary containing key document facts, identified areas of concern, open questions, and flagged clauses into a clean, printable and exportable format to help users conduct efficient, focused consultations with legal professionals.

---

## 🔍 How It Works

KannunAI processes documents through a local, deterministic retrieval and analysis pipeline:

```
[ Upload Document (PDF / DOCX / TXT) ]
                │
                ▼
[ File Validation (Type, Magic Bytes, 10MB Limit) ]
                │
                ▼
[ Text Extraction & Character Offset Normalization ]
                │
                ▼
[ Sliding-Window Semantic Chunking (Overlapping Windows) ]
                │
                ▼
[ In-Memory Vector Search & Keyword Retrieval (TF-IDF) ]
                │
                ▼
[ Deterministic Evidence Analysis & Clause Extraction ]
                │
                ▼
[ Grounded Results: Citations, Risks, Explanations, Actions ]
```

1. **Document Ingestion & Validation**: Uploaded documents are inspected in-memory for allowed formats, valid magic-byte signatures, and size thresholds.
2. **Text Extraction & Normalization**: Text content is extracted while preserving structural markers, page offsets, and character boundaries.
3. **Sliding-Window Chunking**: The extracted text is segmented into overlapping chunks with tracked metadata (`startChar`, `endChar`, `pageNumber`, `sectionHeader`).
4. **Retrieval & Evidence Matching**: Queries and clause categories are matched against document chunks using an in-memory TF-IDF vector retrieval engine with token-weighting and header boosting.
5. **Deterministic Analysis**: Extracted passages are evaluated against structured clause patterns and risk criteria to generate summaries, identify obligations, and assign attention levels.
6. **Grounded Output Generation**: Output summaries, answers, and checklist items are bound directly to their source chunk offsets, providing verified citations and preventing ungrounded claims.

---

## 🛡️ Security Architecture & Controls

KannunAI is built with defensive input validation and secure file-handling practices:

- **Binary Magic-Byte Verification**: Inspects leading file bytes (e.g., `%PDF-` for PDFs, `PK\x03\x04` for DOCX) to ensure file content matches its reported MIME type and prevent file extension spoofing.
- **File Size Boundaries**: Strictly enforces a 10MB maximum file size limit on both client and server validation layers.
- **Path & Filename Sanitization**: Removes path-traversal sequences (`../`, `..\\`) and control characters from uploaded file names.
- **Untrusted Document Boundary**: Treats all uploaded legal document content as untrusted passive data. Text passages are isolated within delimited boundaries (`<LEGAL_DOCUMENT_DATA>`) to mitigate indirect prompt-injection and instruction-override risks.
- **In-Memory Ephemeral Processing**: Uploaded documents are processed in memory during the active session. The application does not store document text in a persistent database.
- **In-Memory Rate Limiting**: Employs an in-memory sliding-window rate limiter on API endpoints (30 requests/minute per client IP) to protect against traffic bursts and resource exhaustion.
- **Security Headers**: Middleware configures standard defensive HTTP headers including `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security`.

---

## ♿ Accessibility

KannunAI is designed with WCAG 2.2 AA principles in mind and validated with automated accessibility checks:

- **Semantic HTML5 Structure**: Uses landmark elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`) to facilitate screen reader navigation.
- **Keyboard Navigation**: Interactive controls, buttons, tab bars, and upload triggers are fully accessible via `Tab`, `Enter`, and `Space`.
- **Visible Focus Management**: Applies high-contrast focus rings (`focus-visible`) across interactive elements.
- **Focus Trapping**: Modal dialogs constrain focus within the modal while open and dismiss on `Escape`.
- **Screen Reader Announcements**: Uses ARIA live regions (`aria-live="polite"`, `role="status"`) to announce file upload progress, parsing states, and completed analysis.
- **Dual-Encoding Information**: Status badges and risk levels pair distinct icons (`AlertCircle`, `ShieldAlert`, `CheckCircle`) with explicit text labels, ensuring meaning is never conveyed through color alone.
- **Contrast Ratios**: The design system uses curated color tokens tested to meet WCAG contrast thresholds (minimum 4.5:1 for standard text, 3:1 for large text and key graphical boundaries).
- **Automated Accessibility Auditing**: Integrated with `@axe-core/playwright` to run automated WCAG rule checks (`wcag2a`, `wcag2aa`, `wcag22aa`) as part of the test suite.

---

## 🧪 Testing Architecture & Quality Gates

The repository contains an automated multi-layer test suite using **Vitest** and **Playwright**:

```
┌─────────────────────────────────────────────────────────────┐
│                 Playwright Real Browser E2E                 │
│         User Journeys & axe-core Accessibility Audits       │
├─────────────────────────────────────────────────────────────┤
│                 API & Schema Integration Tests              │
│       Endpoint Matrix, Rate Limiting, Input Validation      │
├─────────────────────────────────────────────────────────────┤
│                    Vitest Unit & Logic Tests                │
│    Chunking, In-Memory Retrieval, Security, File Validation │
└─────────────────────────────────────────────────────────────┘
```

### Test Suites

- **Unit & Logic Tests (`src/tests/unit.test.ts`)**: Verifies sliding-window chunking, token indexing, TF-IDF scoring, and plain-language formatting.
- **Security Tests (`src/tests/security.test.ts`)**: Validates magic-byte detection, path-traversal sanitization, file-size enforcement, and indirect injection defenses.
- **Schema Validation (`src/tests/aiSchema.test.ts`)**: Checks schema parsing, default fallbacks, and boundary conditions for analysis payloads.
- **API Integration Matrix (`src/tests/apiIntegration.test.ts`)**: Tests route handling, health checks (`GET /health`), validation (`POST /validate-file`), rate limiting (HTTP 429), and error responses.
- **Accessibility Tests (`src/tests/accessibility.test.ts` & `e2e/accessibility.spec.ts`)**: Tests DOM semantics and runs axe-core automated audits across key application states.
- **Browser E2E User Journey (`e2e/journey.spec.ts`)**: Real browser automation validating the workflow from document upload to summary, clause view, risk radar, grounded Q&A, and lawyer brief generation.

### Configured Coverage Thresholds

As configured in `vitest.config.ts`, the test runner enforces the following coverage thresholds:
- **Statements**: ≥ 90%
- **Branches**: ≥ 85%
- **Functions**: ≥ 90%
- **Lines**: ≥ 90%

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) enforces the following quality gates on every push and pull request to `main`:

1. **Dependency Installation**: Runs `npm ci` with cached Node.js dependencies.
2. **Strict Type Checking**: Runs `npm run typecheck` (`tsc --noEmit`) to verify zero TypeScript errors.
3. **Code Quality Gate**: Runs `npm run lint` (`tsc --noEmit`).
4. **Unit, Security, & Integration Tests**: Executes `npm run test` via Vitest.
5. **Browser E2E & Accessibility Audits**: Installs Chromium and runs `npm run test:e2e:playwright` with Playwright and axe-core.
6. **Production Build**: Executes `npm run build` to ensure a clean Vite bundle output.

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript (Strict Mode), Vite, Lucide Icons, Vanilla CSS Design System
- **Local Retrieval & Analysis**: In-memory TF-IDF vector store, sliding-window chunking, deterministic legal analysis engine
- **Testing**: Vitest, V8 Coverage (`@vitest/coverage-v8`), Playwright (`@playwright/test`), axe-core (`@axe-core/playwright`)
- **Server Utilities & Middleware**: Node.js, sliding-window rate limiter, security headers middleware

---

## 📁 Project Structure

```
KannunAI/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI quality gate
├── e2e/
│   ├── accessibility.spec.ts    # axe-core automated accessibility audits
│   └── journey.spec.ts          # Playwright end-to-end user journey tests
├── fixtures/                    # Standardized sample contracts for testing
├── server/                      # Server-side middleware & handlers
│   ├── middleware/              # Rate limiter and security headers
│   ├── routes/                  # API request handlers
│   └── services/                # Server-side validation and schema guards
├── src/
│   ├── components/              # UI components
│   │   ├── document/            # Upload zone and document viewer
│   │   ├── landing/             # Landing page and workflow views
│   │   ├── layout/              # Header, navigation, and footer
│   │   ├── ui/                  # Modal, tabs, and reusable controls
│   │   └── workspace/           # Summary, clauses, risks, Q&A, briefs
│   ├── services/
│   │   ├── ai/                  # Local deterministic analysis engine & provider interfaces
│   │   ├── api/                 # Typed API client
│   │   ├── document/            # Chunker, text extractor, in-memory vector store
│   │   └── security/            # Client-side file validation and prompt shield
│   ├── tests/                   # Vitest unit, security, schema, and API test suites
│   ├── types/                   # TypeScript interfaces and domain schemas
│   ├── utils/                   # Helper functions and formatting utilities
│   ├── App.tsx                  # Root application component
│   └── index.css                # Custom CSS design system
├── playwright.config.ts         # Playwright test configuration
├── vitest.config.ts             # Vitest test configuration with coverage thresholds
├── package.json                 # Project scripts and dependencies
└── tsconfig.json                # Strict TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20.0.0
- npm (bundled with Node.js)

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/Nithingowda16/KannunAI.git
cd KannunAI

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The development server will start at `http://localhost:3000` (or the port indicated in your terminal).

### Building for Production

```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

### Running Tests

```bash
# Run all Vitest unit, security, and integration tests
npm test

# Run tests with V8 coverage report
npm run test:coverage

# Run Playwright browser E2E journey and axe-core accessibility audits
npm run test:e2e:playwright
```

---

## 🌐 Deployment Guide (Render Static Site)

KannunAI can be deployed directly to [Render](https://render.com) as a Static Site:

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Static Site**.
3. Connect your repository: `https://github.com/Nithingowda16/KannunAI.git`.
4. Set the build parameters:
   - **Name**: `kannun-ai`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click **Create Static Site**.
6. Under **Settings** → **Redirects/Rewrites**, add an SPA rewrite rule:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
7. Save changes. Your live site will deploy at `https://<your-service-name>.onrender.com`.

---

## ⚠️ Legal Disclaimer

**KannunAI provides informational assistance and does not provide legal advice.** It is not a law firm, does not possess attorney-client privilege, and does not replace a qualified lawyer or licensed legal professional.

The analysis, summaries, clause categorizations, and risk flags generated by this platform are automated research aids intended solely to improve document comprehension and facilitate more informed discussions with legal counsel. Users should consult a qualified attorney for legal guidance, negotiation, or decisions regarding any contract or legal instrument.
