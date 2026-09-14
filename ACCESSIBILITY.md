# Accessibility & WCAG 2.2 AA Compliance — KannunAI

KannunAI treats accessibility as a core engineering discipline.

## WCAG 2.2 AA Checklist

### 1. Keyboard Navigation
- Every interactive element (buttons, tabs, inputs, cards) is keyboard focusable.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#0284c7]`) applied across all components.
- Modal dialogs trap focus and close on `Escape` ([`Modal.tsx`](file:///c:/Users/nithi/AI%20for%20Legal%20And%20Access/src/components/ui/Modal.tsx)).
- Document upload zone supports keyboard triggers (`Enter` or `Space`).

### 2. Screen Reader Semantics & ARIA
- Semantic HTML5 elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`).
- Screen reader live regions (`aria-live="polite"`, `role="status"`) announce dynamic file upload progress and RAG analysis completion.

### 3. Dual-Encoding Risk Indicators
- Risk levels (Low, Medium, High Attention) never rely on color alone.
- Every badge pairs distinct visual SVG icons (`AlertCircle`, `ShieldAlert`, `CheckCircle`) with explicit text labels.

### 4. High Contrast & Neutral Dark Mode
- True Neutral Charcoal dark palette ([`index.css`](file:///c:/Users/nithi/AI%20for%20Legal%20And%20Access/src/index.css)) rigorously checked for high contrast ratios (minimum 4.5:1 for standard body text, 3:1 for large headings and icons).
