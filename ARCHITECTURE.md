# Architecture Overview — KannunAI

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
                                         │ Typed API Client (apiClient.ts)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             SERVER PROXY LAYER               │
                  │   Node.js / Express or Middleware Server     │
                  │  - Strict API Secret Management (.env)       │
                  │  - Server-Side Magic Byte MIME Sniffing       │
                  │  - Server-Side File Size Enforcer (10MB)     │
                  │  - Indirect Prompt Injection Shield          │
                  │  - Rate Limiting & Abuse Prevention          │
                  │  - Unicode & Kannada RAG Vector Engine       │
                  │  - LLM Provider Abstraction (Gemini / Mock)  │
                  └──────────────────────┬───────────────────────┘
                                         │ Secure SDK / REST
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │            GOOGLE GEMINI LLM API             │
                  │     (gemini-1.5-flash / Local Mock AI)       │
                  └──────────────────────────────────────────────┘
```

## RAG & Grounding Pipeline

1. **Upload & Server Validation**: File uploaded → magic byte header check (`%PDF` / `PK\x03\x04` zip for DOCX) → 10MB limit enforcement.
2. **Extraction & Normalization**: Raw text extracted preserving page markers, section headings, and Unicode character sets.
3. **Sliding Window Semantic Chunking**: 1200-character chunks created with 200-character overlap, tagging `startChar`, `endChar`, `pageNumber`, and `sectionHeader`.
4. **Unicode & Kannada Vector Search**: TF-IDF token weighting and section header boosting supporting English, Kannada (`\u0C80-\u0CFF`), and multilingual Indian legal contracts.
5. **Prompt Isolation**: Retrieved chunks enclosed inside `<LEGAL_DOCUMENT_DATA>` tags with explicit system instructions to ignore embedded instructions.
6. **Citation Validator**: Answers and risk flags map directly to page numbers and range offsets, triggering fallback to `"Insufficient document evidence found..."` when evidence is missing.
