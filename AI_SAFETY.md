# Responsible AI & Grounding Safeguards — Lexora

## Non-Legal-Advice Boundary

Lexora is designed to assist ordinary users in understanding legal documents before they sign.

The system explicitly enforces responsible AI safeguards:

1. **Mandatory Disclaimer**: Displayed prominently across the header, landing page, and lawyer preparation brief:
   > *"Lexora provides legal document intelligence and general information. It does not provide legal advice and does not replace a qualified legal professional."*

2. **Careful Risk Terminology**: The AI does not declare contracts "illegal" or make definitive legal conclusions. It uses calibrated phrasing:
   - *"Potential concern"*
   - *"Requires attention"*
   - *"Consider discussing with a legal professional"*
   - *"Not found in the provided document"*

3. **Anti-Hallucination RAG Grounding**:
   - Every factual answer and risk item maps directly to verifiable document text ranges and page citations.
   - If an answer cannot be determined from document context, the system explicitly outputs: `"I couldn't find enough information in the provided document to answer that reliably."`
