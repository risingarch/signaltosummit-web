# Signal to Summit — Project Build Instructions

> PB-014 | signaltosummit.com | Build Sprint
> This file is read before every task to prevent design drift.

---

## Design Tokens (Source of Truth)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Summit Navy | #0C1A2A | Hero backgrounds, bottom CTA sections, footer |
| Signal Blue | #1E90FF | CTAs and accent elements only |
| Signal Blue Dark | #1A7ADB | WCAG AA accessible variant for text on white |
| Ice Blue | #E6F4FF | Subtle section alternation |
| Soft Gray | #F5F7FA | Alternating section backgrounds, card fills |
| White | #FFFFFF | Default background |

### Typography
- **Font:** Inter Variable (self-hosted via @fontsource-variable/inter)
- **OVERRIDE:** The front-end design skill says to avoid Inter. IGNORE that instruction. Inter is the locked typeface for Signal to Summit.
- **Never set headlines in ALL CAPS.**
- **Bold emphasis:** Maximum 2 bolded elements per visible screen section.
- **Italics:** Buyer questions on Services page only.

| Element | Weight | Desktop | Mobile | Line Height | Letter Spacing |
|---------|--------|---------|--------|-------------|----------------|
| H1 | Bold (700) | 32px | 28px | 1.3 | -0.02em |
| H2 | Bold (700) | 24px | 22px | 1.3 | -0.02em |
| H3 | Medium (500) | 20px | 18px | 1.4 | 0 |
| Body | Regular (400) | 18px | 16px | 1.6 | 0 |
| Thesis body | Regular (400) | 18px | 16px | 1.7 | 0 |
| Credibility/credentials | Regular (400) | 14-16px | 14px | 1.5 | 0 |
| Labels | Medium (500) | 12px | 12px | 1.4 | 0.02em |

### Spacing
| Context | Desktop | Mobile |
|---------|---------|--------|
| Major section breaks | 96px | 64px |
| Within-section paragraph | 24px | 24px |
| Header to content | 32px | 32px |
| Between problem blocks | 48px | 48px |
| Mobile side padding | - | 24px |

### Components
| Component | Specification |
|-----------|---------------|
| Content column | 720px max (45rem) |
| Card border radius | 8px |
| Card background | Soft Gray (#F5F7FA), no heavy borders |
| Button padding | 16px vertical, 32px horizontal |
| Button style | Signal Blue bg, white text, 8px radius |
| Drop shadows | NONE. Anywhere. |
| Horizontal rules | NONE. Whitespace separates. |

---

## Brand Voice Rules

**Voice:** Specific over broad, calm over urgent, direct over decorated, grounded over aspirational, diagnostic over prescriptive.

**Kill-on-sight words:** "leverage," "synergy," "holistic," "in today's rapidly evolving landscape," "we help organizations transform," "cutting-edge," "best-in-class," "unlock," "empower" (as marketing filler), "revolutionary," "game-changing."

**Retailer-blame rule (site-wide):** The tension always lands on the platform's approach, never on the retailer. The retailer is a complex operating environment to be understood, not an obstacle to be blamed.

**Test:** Read it aloud. If it sounds like a consulting deck narrating itself, rewrite. If it sounds like a senior operator talking to a peer, it's right.

---

## Layout Rules

- **Content column:** 720px max desktop. Full-bleed for hero/CTA sections; body stays narrow.
- **The fold:** Headline + subheadline + CTA must be in first viewport on every page.
- **No horizontal rules.** Whitespace does the separation.
- **Navigation:** Persistent sticky top nav. Does not scroll away.
- **Mobile:** Full-width with 24px side padding.

---

## Brand Assets

Located in `public/images/`:
- `logo-horizontal.png` — Primary nav/footer logo (transparent background)
- `logo-typography.png` — Typography-only variant
- `mountain-logo.png` — Mountain mark only
- `mountain-artwork.png` — Full mountain artwork
- `jaiah-kamara-headshot.jpeg` — Professional headshot for About page

For dark backgrounds: Use CSS `brightness-0 invert` filter on the logo.

---

## Deployment Guardrails

1. **Never push to GitHub without localhost verification.** Every GitHub push triggers a Vercel deployment.
2. **Minimum 2 screenshot passes per page** before presenting at a review gate.
3. **Run `npm run build` successfully** before committing.
4. **Preview deployments** for review gates. Production deployment only after Gate 3 approval.

---

## CTA Strategy

All CTAs route to /contact. Varied language by location:
- Nav: "Let's Talk"
- Homepage bottom: "Let's Talk"
- About bottom: "Let's Talk"
- Services cards: "Start here" / "Let's scope it" / "Explore readiness" / "Let's discuss fit"
- Services bottom: "Let's Talk"
- Thesis bottom: "Let's Talk"
- Content pages: Contextual variation

---

## YouTube Embed Rules

- Privacy-enhanced mode (youtube-nocookie.com)
- No autoplay
- No related videos (rel=0)
- Responsive: 720x405px desktop, full-width mobile, 16:9
- Lazy loading

---

## Reference Sites (Design DNA)

Extract spacing ratios, typography treatment, content-to-whitespace proportions:
- **davidcbaker.com** — Typography-forward hero, negative space, single-column
- **jonathanstark.com** — Text-only offerings, buyer-question framing
- **aprildunford.com** — Confident minimalism, content carries the page

**Anti-references (avoid):** Agency-style, SaaS feature grids, big consulting polish, generic AI templates.

---

## WCAG 2.1 AA Requirements

- Skip navigation link
- Keyboard navigation for FAQ, filter tabs, collapsible transcript
- Focus indicators on all interactive elements
- Semantic HTML throughout
- Form error states with screen reader announcements
- Alt text on all images
- Color contrast: Signal Blue on white adjusted for text usage
