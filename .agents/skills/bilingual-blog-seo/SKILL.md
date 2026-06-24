---
name: bilingual-blog-seo
description: >
  Enforces bilingual (English/Spanish) blog content standards for KoolTech Solutions.
  Applies to all blog post creation, translation, and SEO optimization tasks targeting
  the US, Canada, Dominican Republic, Caribbean, and Latin America markets.
---

# Bilingual Blog SEO Standards

This skill codifies the content strategy and technical SEO rules for all bilingual blog content on the KoolTech Solutions platform. Follow these standards **without exception** when creating, translating, or optimizing blog posts.

## Architecture Rules

1. **Subdirectory URL model** — English at `/blog/[slug]`, Spanish at `/es/blog/[slug]`
2. **Separate database rows** — each language version is its own `posts` row, linked via `translated_from`
3. **Never put both languages on the same page** — breaks SEO and user experience
4. **Never auto-redirect based on location or browser language** — always let the user choose via the language switcher

## Translation Standards

### Language Quality
- Use **neutral Latin American Spanish** ("español neutro") as the default dialect
- Avoid Spain-specific vocabulary (e.g., use "computadora" not "ordenador", "celular" not "móvil")
- When a blog targets a specific country (e.g., Dominican Republic), use local idioms and slang where appropriate
- Localize cultural references — don't just translate, adapt the content

### What to Translate
- **Title** — fully localized, not a literal word-for-word translation
- **Excerpt / Meta Description** — rewritten for Spanish SEO, not just translated
- **Content body** — localized with regional relevance
- **URL slug** — must be in Spanish (e.g., `consejos-de-ciberseguridad`, not `cybersecurity-tips`)
- **Image alt text** — must match the page language
- **Author bio** — can remain in English or be translated, author's choice

### What NOT to Translate
- Proper nouns and brand names (KOOL TECH SOLUTIONS, Supabase, OPNsense, etc.)
- Technical acronyms widely understood in both languages (API, SQL, SSL, VPN, SIEM)
- Product names and tool names (Wazuh, Grafana, Action1)

## Keyword Research Rules

### 1. Never Auto-Translate Keywords
English keywords ≠ Spanish keywords. The same concept has different search patterns:
- "sneakers" → Chile: "zapatillas", Mexico: "tenis", Argentina: "zapatillas/championes"
- "cell phone" → LATAM: "celular", Spain: "móvil"

### 2. Filter by Country, Not Just Language
When using SEO tools (Semrush, Ahrefs, Google Keyword Planner):
- Always filter search volume **per country**: US, Mexico, Dominican Republic, Colombia
- Never use global "Spanish" volume — it's meaningless for targeting

### 3. Use the Neutral Term Strategy
For content targeting the entire region:
- Use the term with the **highest aggregate volume** across all target countries in the H1 and URL
- Weave regional variations into H2/H3 headings and body text

### 4. Capture Spanglish for US Hispanic Audiences
US Hispanic users frequently mix languages:
- "agencia de marketing digital near me" (instead of pure Spanish)
- "asegura de carro barata" (instead of "seguro de auto barato")
- Target these hybrid phrases — they have high volume and low competition

### 5. Leverage Google Trends
Before finalizing Spanish keywords:
- Compare regional variants in Google Trends (e.g., "celular" vs "móvil")
- Verify the term dominates in your target countries

## Technical SEO Checklist

For every Spanish blog post, verify:

- [ ] **Hreflang tags** — bidirectional (EN→ES and ES→EN) with self-reference
- [ ] **x-default** — set to the English version
- [ ] **Canonical tag** — points to itself (`/es/blog/[slug]`), NOT to the English version
- [ ] **URL slug** — in Spanish
- [ ] **Meta title** — custom Spanish title (not translated from English)
- [ ] **Meta description** — custom Spanish description
- [ ] **OpenGraph locale** — set to `es_LA`
- [ ] **JSON-LD inLanguage** — set to `es`
- [ ] **Image alt text** — in Spanish
- [ ] **Date formatting** — use `es-LA` locale for date display
- [ ] **Sitemap** — post appears with correct alternate language links

## Content Prioritization

Not every English post needs a Spanish translation immediately. Prioritize:

1. **Core service pages** — cybersecurity, cloud, managed IT (relevant to all markets)
2. **Caribbean-specific content** — directly relevant to DR, PR, and Caribbean audiences
3. **High-traffic posts** — posts with proven English traffic should be translated first
4. **Region-specific posts** — a post about Canadian tax compliance may not need a Spanish version

## Date & Number Formatting

| Element | English | Spanish |
|---------|---------|---------|
| Date locale | `en-US` | `es-LA` |
| Date format | "Jun 23, 2026" | "23 jun 2026" |
| Thousands separator | `,` (1,000) | `.` (1.000) |
| Decimal separator | `.` (3.14) | `,` (3,14) |
