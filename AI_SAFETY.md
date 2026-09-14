# Responsible AI & Grounding Safeguards — KannunAI

## Non-Legal-Advice Boundary

KannunAI is designed to assist ordinary users in understanding legal documents before they sign.

The system explicitly enforces responsible AI safeguards:

1. **Mandatory Disclaimer**: Displayed prominently across the header, landing page, and lawyer preparation brief:
   > *"KannunAI provides legal document intelligence and general information. It does not provide legal advice and does not replace a qualified legal professional."*

2. **Careful Risk Terminology**: The AI does not declare contracts "illegal" or make definitive legal conclusions. It uses calibrated phrasing:
   - *"Potential concern"*
   - *"Requires attention"*
   - *"Consider discussing with a legal professional"*
   - *"Insufficient document evidence found..."*

3. **Anti-Hallucination RAG Grounding**:
   - Every factual answer and risk item maps directly to verifiable document text ranges, section headers, and page citations.
   - If an answer cannot be determined from document context, the system explicitly outputs: `"Insufficient document evidence found in the provided agreement to answer this question accurately."`
