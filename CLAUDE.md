# AG Refining - Claude Code Handoff & Context

> **Bridge file between Grok Bot and Claude Code.**
> Last synced: **Wed Nov 25, 2026 (America/Chicago / CT)** against `origin/main` (`402b6c2`).
> Workflow: Jason runs `git pull` before each Claude Code session. Read this file for current ground truth, challenge or revamp the plan below, and write notes/decisions for Grok Bot in the **Claude to Grok Bot** section at the bottom before committing or handing back.

---

## 1. Business Facts

- **Business:** AG Refining (family-owned; founded by John Stevens, operated by his son Dennis Stevens)
- **Exact NAP (must match identically everywhere):**
  - **Name:** `AG Refining`
  - **Address:** `9125 Airport Blvd., Suite B-1, Houston, TX 77061` (near Hobby Airport, ~0.5 mi west of I-45)
  - **Phone:** `(281) 898-2719`
  - **Website:** `https://www.agrefining.com` (apex `agrefining.com` 308-redirects to `www`)
- **Public contact email:** `dennis@agrefining.com`
- **Hours (verified on GBP):** Mon-Fri 9:00 AM-5:00 PM, Sat 9:00 AM-12:00 PM, Sun Closed
- **Customer mix:** ~50/50 split between **B2B/commercial** (dental offices/labs, X-ray and imaging centers, hospitals, jewelers, watch repair shops, industrial/NDT, laboratories) and **consumer/individual** (estate executors, inherited sterling flatware, silver coins, bars/rounds).
- **Positioning & goal:** Silver-first. Make AG Refining the go-to silver buyer in Southeast Houston across Google, Bing/Yahoo, and AI answer engines using strictly white-hat tactics. **Yahoo and Bing are high priority** because older estate and silver sellers skew heavily toward Yahoo/Bing.

---

## 2. Hard Rules & Guardrails

1. **No unauthorized outreach:** Never send texts, emails, B2B outreach, or press pitches to Dennis or anyone else without Jason's explicit OK. Drafts only.
2. **No Dennis credentials:** Never ask for, store, or handle Dennis's passwords or 2-step verification codes.
3. **No unapproved live deploys:** Never deploy or change the live `agrefining.com` site or merge any branch to `main` without Jason's OK. (This docs-only `CLAUDE.md` commit was pre-authorized by Jason.)
4. **Strict truthfulness & white-hat only:**
   - Never invent metrics, credentials, case studies, or customer counts.
   - No fake reviews, no review gating (never screen for happy customers only), no discounts/incentives for reviews, and never ask for Yelp reviews in bulk.
   - No duplicate listings and no thin/copy-paste doorway pages.
5. **Gold hold:** **No gold claims** on the site or listings until Dennis confirms in writing exactly what gold he buys (jewelry, scrap, coins, bars) and confirms Texas OCCC registration. (`/gold-buyer-houston` stays off by default.)
6. **HIPAA wording ban:** **Never write "HIPAA compliant" or "HIPAA certified."** HHS does not recognize private HIPAA certifications. (`/x-ray-film-privacy-process` stays off by default behind `dennisConfirmed` flags until Dennis confirms his BAA, chain-of-custody, staff training, and destruction process.)
7. **Media honesty:** **No stock or AI footage presented as the real shop.** Never upload AI-generated or stock images/video to Google Business Profile, Apple Business Connect, or Yelp. GBP uses brand graphics only until Dennis sends real phone photos.
8. **NuCor boundary:** Do not touch the NuCor listings.
9. **Billing boundary:** Paid items (Vercel overdue balance, South Belt-Ellington Chamber membership, counter QR card printing) go through Jason's Finance and Client Delivery bots.
10. **Dennis UX:** Dennis is older, non-technical, and a phone person. Keep his steps dead simple (phone calls, FaceTime, one-tap links).
11. **Copy & UI contract (`PRODUCT.md`, `DESIGN.md`, `scripts/check.mjs`):**
    - Plain, direct, unhurried copy. Qualify claims ("for qualifying commercial and industrial accounts", "when scheduling permits", etc.).
    - **Title Case headings** across the site.
    - **Floating "Get Paid" pill** (`get-paid-dock` -> `#get-paid`) rises after scrolling past the first screen on every page and lands on the pickup/quote form.
    - Silver Atelier palette: warm cream `--canvas: #f1ede4`, ink `--navy: #102a43`, accent `--mineral-blue: #416b94`, Manrope + Newsreader typography.
    - **Repo lint rule (`npm run check`):** **Zero em dashes (`\u2014`) and zero emojis** anywhere in tracked text files (including `CLAUDE.md`).

---

## 3. Current State (Nov 25, 2026 CT)

### Google Business Profile (GBP)
- **Live:** Brand logo (silver ring v2-C), cover graphic, categories, 16 SE Houston service areas, business description, and silver services are live. Posting is turned off on this profile.
- **Minor GBP cleanup:** Duplicate cover photo needs removal; confirm Jan 1, 2026 opening date.
- **Biggest gap:** **0 Google reviews** vs. Houston competitors at 240 to 400+ reviews.

### Site Stack, Hosting & Billing
- **Architecture:** Static HTML generator (`scripts/build.mjs`) + Vercel serverless functions (`api/leads.js`, `api/spot.js`, `api/receipt.js`), hosted on Vercel project `agrefining`, auto-deploying from `main`.
- **Vercel overdue balance (OPEN RISK):** Live site is up today (all 52 sitemap URLs return HTTP 200), but there is an overdue $20 balance (bounced payment) that recently caused Vercel's "This deployment is temporarily paused" screen on Dennis's phone. Site can pause again without warning until resolved. Owned by Jason's Finance / Client Delivery bots.
- **Cloudflare migration (PENDING DENNIS):** Cloudflare zone is created and waiting for Dennis to update nameservers at Bluehost (`marvin.ns.cloudflare.com` and `nelly.ns.cloudflare.com`). `cloudflare` branch and `.cf-deploy/` prep exist. Note: if moving off Vercel, `vercel.json` redirects and `/api/*` serverless routes (`leads`, `spot`, `receipt`) must also run on Cloudflare before cutting over. Never remove Vercel domains without Jason's OK.
- **Open subdomain:** `app.agrefining.com` is attached to the Vercel project but does not resolve (needs Jason's decision).

### Recent Deploys, SEO/AEO/GEO & Performance
- **Merged & live on `main` today:** `site-fixes-nov25` (`9752533`, carrying `blog-batch-2` and `blog-batch-3`) and `402b6c2` (optional `AG_LEAD_BCC_EMAIL` copy list).
- **Sitemap & IndexNow:** `sitemap.xml` now publishes **52 live URLs** (HTTP 200 across the board). IndexNow was pinged at 11:51 AM CT (api.indexnow.org 200, Bing 200, Yandex 200 for the 48 pre-merge URLs); re-run `npm run build && npm run submit:indexnow` after the next deploy and resubmit sitemaps in Search Console and Bing Webmaster Tools.
- **AI & Search readiness:** `robots.txt` welcomes Google, Bing, Apple, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and Common Crawl; `llms.txt` and `llms-full.txt` are live; JSON-LD includes `LocalBusiness`/`Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Service`, `FAQPage`, `Person`, and `openingHoursSpecification`.
- **`sameAs`:** `AG_SAME_AS` env switch is implemented in `scripts/build.mjs`; currently omitted on the live homepage until verified external profile URLs are ready to add.
- **Lighthouse mobile (lab runs from box):** Home **95 Performance / 96 Accessibility / 100 Best Practices / 100 SEO** (LCP ~2.8s, 2.8 MB page weight); coin and Hobby pages **99 Performance** (an earlier coin run saw CLS 0.41, four reruns saw 0 CLS).
- **Old WordPress residue:** Some Google results still show cached old WordPress copy ("15 Years", "top dollar"). 15+ permanent 301 redirects are live in `vercel.json`; request reindexing in Search Console.

### Live Guides & Area Pages
- **Guides hub:** `/guides`
- **7 live guides:**
  1. `/guides/sterling-vs-silver-plate`
  2. `/guides/how-silver-is-valued`
  3. `/guides/x-ray-film-privacy-checklist`
  4. `/guides/which-us-coins-are-silver`
  5. `/guides/id-to-sell-silver-texas`
  6. `/guides/selling-silver-bars-and-rounds-houston`
  7. `/guides/commercial-dental-industrial-silver-houston`
- **SE Houston area pages:** `/silver-buyer-hobby-airport`, `/silver-buyer-south-houston`, `/silver-buyer-clear-lake`, and `/sell-estate-silver-houston` are live. `/silver-buyer-pasadena` and `/silver-buyer-pearland` exist but still use generic template copy.

### Buy Desk (`/desk`, `/app` 307-redirects to `/desk`)
- Private, `noindex` counter PWA (`src/desk/`) for buying silver in front of a customer (`docs/buy-desk-guide.md`).
- Pulls live silver spot every 30s from 3 feeds via `/api/spot` (gold-api.com, Swissquote, COMEX futures).
- Separates staff math ("Hold to view private numbers") from client view ("Show the offer", holding spot price for 15 minutes), captures UETA/E-SIGN finger signatures with SHA-256 tamper-evident receipts, exports CSV, and emails PDFs via `/api/receipt` (when `DESK_ACCESS_CODE` is set).

### Lead Form Delivery (`/api/leads`) - FIXED TODAY
- **Live status:** `GET /api/leads?status=health` now returns `{"delivery":true}`.
- **Current routing:** Sends via Jason's olaceo Resend account from `agrefining@mail.olaceo.com` to Dennis's Gmail, with a BCC to Jason (`AG_LEAD_BCC_EMAIL`).
- **Planned upgrade:** Switch sender to an `@agrefining.com` address once Dennis moves nameservers to Cloudflare and `agrefining.com` is verified in Resend.

### `/review` Redirect & Counter QR Card - LIVE TODAY
- `GOOGLE_REVIEW_URL` is set in Vercel; `https://www.agrefining.com/review` (`noindex`) returns HTTP 200 and redirects straight to AG Refining's Google review form.
- Print-ready 4x6 counter QR card (`ag-refining-review-card-4x6.pdf` and `.png`) is generated at `/workspace/agrefining-media/qr-card/`. Physical printing goes through Jason's billing bots.
- **Final design approved by Jason (Nov 25, 2026, 2:40 PM CT) - keep as is:** navy card, v2-C Ag ring logo, "AG REFINING", "Thanks For Selling With Us.", cream panel with "Leave Us A Quick Google Review.", five yellow stars (#f5b301) under that line, QR (scans to https://agrefining.com/review), "Point your phone camera here. It takes a minute.", address + phone in the footer with breathing room above it. The printed URL line was removed on purpose. Source: `card.html` + `qr-review.svg` in the same folder.

### Listings & Citations Tracker Summary
| Platform | Status (Nov 25, 2026) | Waiting On / Notes |
|---|---|---|
| Google Business Profile | Live (logo, cover, 16 areas, services, 0 reviews) | Remove duplicate cover; confirm Jan 1, 2026 open date |
| Search Console & Bing Webmaster | Verified | Resubmit `sitemap.xml` after today's merge |
| BBB (free profile) | Submitted Nov 23 (Silver Buyers); not in search yet | Houston BBB review (no paid accreditation) |
| CoinsNearMe | Submitted Nov 23; not visible on Houston page yet | Directory publish step |
| ScrapMonster & Manta | Free accounts created | Dennis to click 2 verification emails (do not create more email-gated accounts until these clear) |
| Bing Places | Not checked | Confirm which Microsoft/Facebook login owns it (feeds Bing, Yahoo, Copilot, DuckDuckGo) |
| Yelp | Verification pending | Dennis to answer verification call (critical: Yahoo's local box shows Yelp stars) |
| Apple Business Connect | Held | Real 1600x1040+ storefront photo + EIN/doc |
| iScrap App | Form link ready | Jason to submit (monday.com reCAPTCHA) |
| OpenStreetMap | Hit HTTP 429 rate limit | One careful retry later |
| Cybo & ShowMeLocal | Duplicate-checked, ready | Browser pass / phone approval |
| GoLocal247, Brownbook, 2FindLocal, Find-Us-Here | Vetted free forms ready | Hold until ScrapMonster/Manta verification emails clear |
| Data Axle, Foursquare, Nextdoor, Yellow Pages, CDXList | Skipped for now | Needs Dennis's phone for verification codes (batch on one call) |
| Facebook Page & YouTube | Held | Needs Dennis's own accounts (adds Jason as admin/manager) |
| South Belt-Ellington Chamber | Held | Paid membership (Jason + billing bots) |

---

## 4. Growth Plan (Ranked Moves, Whiteboard, Calendar, B2B, Ads, AI, Calculator)

### The #1 Highest-Leverage Move Right Now: Reviews Engine
- AG Refining's proximity and relevance signals are largely in place, while review count sits at **0 vs. 240-400+**. Reviews drive Google Map Pack rank, click-through rate, Bing/Yahoo trust, and AI assistant citations at zero media cost.
- **Loop:** Counter 4x6 QR card (`agrefining.com/review`) + receipt card + same-day text from Dennis's phone ("Thanks for coming in today. If you have a minute, an honest Google review helps other Houston families find us: agrefining.com/review - Dennis, AG Refining") + reply to every review within 48 hours. Ask every customer equally; never incentivize or gate.

### Ranked Action List
| # | Action | Owner | Status |
|---|---|---|---|
| Fix | Fix lead form email delivery (Resend keys + BCC) | Jason / Grok Bot | **Done Nov 25** (`delivery:true`); move sender to `@agrefining.com` after NS cutover |
| Fix | Clear Vercel overdue balance ($20 bounced) | Jason / Finance bots | Open pause risk |
| 1 | Reviews engine (`/review`, QR card, post-sale text, 48h replies) | Us / Dennis | `/review` live + card ready; printing via billing bots; Dennis starts asking |
| 2 | Merge `site-fixes-nov25` + IndexNow + sitemap resubmit | Jason / Us | **Merged Nov 25**; resubmit sitemaps + re-ping IndexNow for 52 URLs |
| 3 | Real shop photos + 20-30s walk-in video (storefront, Suite B-1, counter, scale, testing, Dennis, clean lots) | Dennis / Us | Waiting on Dennis's phone shots |
| 4 | Claim Bing Places (feeds Bing, Yahoo, Copilot, DuckDuckGo, Yahoo Scout) | Jason / Us | Identify owning login |
| 5 | Complete Yelp verification call (feeds Yahoo local box) | Dennis | Waiting on Dennis |
| 6 | B2B outreach within ~10 miles of 77061 | Us / Jason / Dennis | Build lists next; sends need Jason OK; Dennis takes calls |
| 7 | Answer the 9 confirmation questions (gold, OCCC, BAA, film chain-of-custody, EPA ID/fixer) | Jason / Dennis | Unanswered (one 20-min call) |
| 8 | Apple Business Connect (Apple Maps, Siri) | Us / Dennis | Held for real storefront photo |
| 9 | Finish ScrapMonster + Manta listings | Dennis / Us | Waiting on Dennis's 2 email clicks |
| 10 | Two expert guides/month (1 consumer, 1 B2B) | Us / Jason | Calendar set |
| 11 | Aggregators & phone-verified listings (Data Axle, Foursquare, Nextdoor, YP) | Us / Dennis | Batch on one call with Dennis |
| 12 | Facebook Page + YouTube channel (real short clips) | Dennis / Us | Held for Dennis's accounts |
| 13 | Earned PR links (Qwoted, Featured, SourceBottle; Community Impact / Bay Area Houston Magazine) | Us / Jason | Not started |
| 14 | Cloudflare nameserver switch at Bluehost + cutover | Dennis / Jason / Us | Waiting on Dennis at Bluehost |
| 15 | iScrap form, OSM retry, Cybo, ShowMeLocal, then GoLocal247/Brownbook/2FindLocal/Find-Us-Here | Jason / Us | Queued |
| 16 | South Belt-Ellington Chamber (local link + directory) | Jason / Finance bots | Paid membership |
| 17 | 30-day ranking recheck (Google, Bing, Yahoo, AI engines) | Us | Scheduled ~Wed Dec 23, 2026 |

### Site Whiteboard (Engineering & Content Backlog)
- **Localize Pasadena & Pearland:** Rewrite `/silver-buyer-pasadena` and `/silver-buyer-pearland` with real driving routes (Spencer Hwy, College Ave, Telephone Rd, Monroe Rd), landmarks, and local FAQs.
- **Comparison page:** "Selling Silver to a Refiner vs. a Pawn Shop vs. Online" (factual, no named rivals; strong Bing/AEO asset).
- **Mobile hero performance:** Serve a phone-sized hero poster instead of the 2560px asset (current Home LCP 2.8s, 2.8 MB weight); verify zero CLS on coin template.
- **Accessibility & HTML cleanup:** Fix eyebrow text contrast failure; audit `scripts/verify.mjs` coverage for new pages.
- **Design/ops decisions for Jason:**
  - Homepage H1 `"Your silver, valued precisely."` has no local keywords (title tag covers it; decide whether to adjust).
  - Resolve `app.agrefining.com` (attached in Vercel, currently dead).
- **Attribution & schema:** Add UTM tag to GBP website link; fill `AG_SAME_AS` env var as GBP/BBB/Bing/Yelp/Apple URLs confirm.
- **Reindex & gated pages:** Request Google reindex to clear old WordPress snippets; enable `/gold-buyer-houston` and `/x-ray-film-privacy-process` only after Dennis confirms in writing.
- **Cloudflare parity:** Ensure all `vercel.json` 301s and `/api/*` endpoints have working Cloudflare equivalents before switching DNS.

### Content Calendar (2 Guides/Month: 1 Consumer, 1 Business)
- **Dec 2026:** *Is My Silver Tea Set Sterling? Weighted and Hollow Pieces* | *Used X-Ray Fixer Is Hazardous Waste (RCRA D011): Options for Dental Offices*
- **Jan 2027:** *How Silver Prices Are Set Each Day* | *Silver Oxide Watch Batteries: How Jewelers Collect and Recycle Them*
- **Feb 2027:** *How to Sell Silver Safely: Mail-In Offers, Holds, and Receipts* | *NDT Film from Pipeline and Refinery Inspections: Silver Recovery in Houston*
- **Mar 2027:** *Como Vender Plata en Houston (Spanish Guide)* | *Bench Scrap, Filings, and Polishing Dust in a Jewelry Shop*

### B2B Targets (Within ~10 Miles of 77061)
| Segment | Hook | Landing Page |
|---|---|---|
| Dental offices & dental labs | Old X-ray film, fixer, dental scrap; qualifying pickup | `/dental-scrap-buyer-houston` |
| X-ray & imaging centers, hospitals | Film purge with clear privacy safeguards | `/medical-x-ray-recycling` |
| Jewelers | Bench scrap & trade-ins turned into working capital | `/jewelry-store-silver-recycling-houston` |
| Watch repair shops | Silver oxide watch battery collection | `/silver-oxide-watch-battery-recycling-houston` |
| Estate sale companies | Sterling flatware, coins, estate lots | `/sell-estate-silver-houston` |
| Pawn shops | Steady outlet for silver they do not want to hold | `/scrap-silver-buyer-houston` |

Next step: build prospect lists from public map data, draft short intro emails + phone script for Dennis, get Jason's OK before any send.

### Ideola's Dentist Calculator Tweaks (and Buy Desk `/desk` Synergy)
- Jason's contact ("Ideola") shared a dentist silver/scrap calculator concept. Jason wants a Claude-crafted version that:
  1. Pulls the **live metal price** at the exact moment of sale.
  2. Is **very front-end focused** and effortless to use at a counter or clinic.
  3. **Hides all calculations/rates/margins from the customer**, showing **only the payout**.
  4. Uses **happy green "approval / congratulations / you got paid" cues**.
- **Important codebase fact:** `/desk` (`src/desk/` + `/api/spot` + `/api/receipt`) already implements live 3-feed silver spot pricing, hidden staff margins, and a customer-facing offer view. Before building from scratch, evaluate upgrading `/desk` (or adding a dedicated dentist/counter presentation mode) vs. a standalone front end, while keeping `DESIGN.md` and mobile/tablet usability intact.

### Phase 2: Ads on a Per-Qualified-Lead / Performance Basis
- **Launch gate:** Lead form delivering (done), review count > 0, Dennis ready for higher call volume.
- **Channels:** Google Search call ads tied to GBP; Microsoft Ads (Bing/Yahoo older demographic); Meta (FB/IG) ads for estate/inherited silver within ~15 miles.
- **Qualified lead definition:** 60+ sec call or form fill from Greater Houston with silver to sell (no spam, job seekers, sales pitches, existing appointments, or gold-only until Dennis confirms; Dennis gets a 7-day bad-lead flag window).
- **Tracking:** Dedicated ad-only call-tracking number (never on listings/NAP), UTMs on all ads, "How did you hear about us?" logged on Buy Desk receipts.
- **Pricing options (rates set after 30-day CPL test):** (A) flat fee per qualified lead + Dennis funds ad spend, (B) monthly management fee + lower per-lead fee, or (C) commission on AG Refining's margin verified via Buy Desk receipts.

### Phase 3: AI Automation Upsells (Higher Ticket)
- Missed-call text-back (<60s); English/Spanish AI phone receptionist; web/SMS photo intake bot (never promises a price); automated next-day review-request SMS triggered by Buy Desk sale; recurring B2B clinic/jeweler pickup scheduler; Buy Desk + dentist calculator suite; opt-in repeat-seller follow-up when silver moves.

---

## 5. Open Blockers & Who Unblocks Each

| Blocker | Who Unblocks | Exact Action Needed |
|---|---|---|
| Vercel overdue $20 balance (site pause risk) | Jason + Finance / Client Delivery bots | Clear balance or approve cutover plan |
| Counter QR card printing | Jason + Finance / Client Delivery bots | Approve print order for `/workspace/agrefining-media/qr-card/ag-refining-review-card-4x6.pdf` |
| Dennis review ask + real shop photos + Yelp call | Dennis (prompted by Jason) | Ask every customer (`agrefining.com/review`), send phone photos/walk-in video, answer Yelp call |
| 9 confirmation questions (gold, OCCC, BAA, X-ray process, EPA ID) | Dennis + Jason (one 20-min call) | Unlocks `/gold-buyer-houston` and `/x-ray-film-privacy-process` |
| ScrapMonster & Manta email clicks | Dennis | Click the 2 verification emails in his inbox |
| Bluehost nameservers -> Cloudflare | Dennis + Jason | Set `marvin` / `nelly.ns.cloudflare.com` at Bluehost; then move Resend sender to `@agrefining.com` |
| Bing Places owning login | Jason | Confirm which Microsoft/Facebook account owns or should claim it |
| iScrap App submission | Jason | Submit free listing form (gated by reCAPTCHA) |
| B2B outreach & chamber membership | Jason (OK / budget) | Approve prospect list + drafts; approve paid South Belt-Ellington Chamber |
| Ideola's dentist calculator source/input | Jason | Share Ideola's calculator or specs so Claude can finalize tweaks |

---

## 6. Questions for Claude

1. **Growth plan critique:** Looking at the ranked 0-17 plan and SE Houston competitive landscape (Yahoo/Bing local boxes, Google Map Pack 0 vs. 240-400+ reviews, B2B dental/imaging vs. consumer estate), what are we under-weighting, over-engineering, or missing altogether? What is the single smartest asymmetric white-hat play we haven't listed?
2. **Dentist calculator vs. `/desk`:** Should Ideola's dentist calculator be built as a streamlined mode/skin inside `src/desk/` (reusing `/api/spot`, `/api/receipt`, and UETA/E-SIGN logging) or as a separate lightweight route? How do we design the green "approved / congratulations / you got paid" customer screen so it feels joyful and trustworthy without breaking the Silver Atelier aesthetic or looking like a pawn gimmick?
3. **Cloudflare migration readiness:** Before Dennis switches nameservers to Cloudflare, what breaks if `dist` is deployed directly to Cloudflare Pages/Workers? Specifically, how should we port `vercel.json`'s 301s/headers and the three serverless endpoints (`api/leads.js`, `api/spot.js`, `api/receipt.js`) so the cutover is zero-downtime?
4. **Site performance & SEO technical debt:** What is the cleanest fix for the 2560px mobile hero poster (2.8s LCP, 2.8 MB weight), the eyebrow contrast issue, and the Pasadena/Pearland template pages while keeping `scripts/check.mjs` and `scripts/verify.mjs` 100% green?
5. **Phase 2 & 3 economics:** How would you structure the 30-day paid test, call-tracking safeguards, and per-qualified-lead vs. margin-commission pricing so Dennis has zero hesitation and Jason has clean proof of ROI?

---

## 7. Claude to Grok Bot

*Claude Code: write your revamped strategy, architectural decisions, diffs/PR plans, or questions for Grok Bot below this line before committing `CLAUDE.md` so Grok Bot picks them up on the next `git pull`.*

- *(Awaiting Claude Code's first pass.)*
