# Accessibility & WCAG 2.2 AA Compliance — Lexora

Lexora treats accessibility as a core engineering discipline.

## WCAG 2.2 AA Checklist

### 1. Keyboard Navigation
- Every interactive element (buttons, tabs, inputs, cards) is keyboard focusable.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`) applied across all components.
- Modal dialogs trap focus and close on `Escape`.
- Document upload zone supports keyboard triggers (`Enter` or `Space`).

### 2. Screen Reader Semantics & ARIA
- Semantic HTML5 elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`).
- Skip to main content link (`a[href="#main-content"]`) present on every page.
- Screen reader live regions (`aria-live="polite"`, `role="status"`) announce dynamic file upload progress and RAG analysis completion.

### 3. Dual-Encoding Risk Indicators
- Risk levels (Low, Medium, High Attention) never rely on color alone.
- Every badge pairs distinct visual SVG icons (`AlertCircle`, `AlertTriangle`, `Info`) with explicit text labels.

### 4. High Contrast Color System
- Slate/Indigo design palette rigorously checked for high contrast ratios (minimum 4.5:1 for standard body text, 3:1 for large headings and icons).
