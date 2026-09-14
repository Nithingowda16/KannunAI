# Architecture Overview — Lexora

## System Architecture Diagram

```
                  ┌──────────────────────────────────────────────┐
                  │              CLIENT (Browser)                │
                  │  React 18 + TypeScript + Accessible UI       │
                  │  - Drag & Drop Upload Zone                   │
                  │  - Interactive Document Viewer + Jump Anchor │
                  │  - Plain Summary, Clause Explorer, Risk Radar│
                  │  - Grounded Q&A, Comparison, Lawyer Brief    │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTPS / REST API
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             SERVER PROXY LAYER               │
                  │   Node.js / Express or Middleware Server     │
                  │  - Strict API Secret Management (.env)       │
                  │  - Server-Side Magic Byte MIME Sniffing       │
                  │  - Server-Side File Size Enforcer (10MB)     │
                  │  - Indirect Prompt Injection Shield          │
                  │  - Rate Limiting & Abuse Prevention          │
                  │  - Grounded RAG Vector Retrieval Engine       │
                  │  - LLM Provider Abstraction (Gemini / Mock)  │
                  └──────────────────────┬───────────────────────┘
                                         │ Secure SDK / REST
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │            GOOGLE GEMINI LLM API             │
                  │          (or Deterministic Mock)             │
                  └──────────────────────────────────────────────┘
```

## RAG & Grounding Pipeline

1. **Upload & Server Validation**: File uploaded → magic byte header check (%PDF / PK zip for DOCX) → 10MB limit enforcement.
2. **Extraction & Normalization**: Raw text extracted preserving page markers and section headings.
3. **Sliding Window Semantic Chunking**: 1200-character chunks created with 200-character overlap, tagging `startChar`, `endChar`, `pageNumber`, and `sectionHeader`.
4. **In-Memory Vector Search**: TF-IDF token weighting and section header boosting for grounded chunk retrieval.
5. **Prompt Isolation**: Retrieved chunks enclosed inside `<UNTRUSTED_LEGAL_DOCUMENT_DATA>` tags with explicit system instructions to ignore embedded commands.
6. **Citation Validator**: Answers and risk flags map directly to page numbers and range offsets, triggering fallback to `"Not found in the provided document."` when evidence is missing.
