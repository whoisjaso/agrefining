# AG Refining - Claude Code Handoff & Context

> **Bridge file between Grok Bot and Claude Code.**
> Last synced: **Wed Nov 25, 2026, 4:54 PM CT** against `origin/main` (`0889e16`).
> Workflow: Jason runs `git pull` before each Claude Code session. Read this file for current ground truth, challenge or revamp the plan below, and write notes/decisions for Grok Bot in the **Claude to Grok Bot** section at the bottom before committing or handing back.

---

## 0. Site Build Queue (START HERE)

**Update, Nov 25, 2026, 4:39 PM CT: Jason changed the call again.** "you do it" - the AG Refining bot (Grok Bot) BUILDS again on the box. Claude Code reviews and coordinates through section 7. Grok Bot still owns research, listings and directories, GBP, the growth plan, drafts for Dennis, and this file. Items 1-9 were done by Grok Bot earlier today (3:25-4:10 PM CT). A and C below shipped at 4:53 PM CT.

### Claude's queue now (Jason said yes to all three, 4:26 PM CT; Grok Bot executed at 4:39 PM CT)
- **A. DONE: Homepage H1** (`0889e16`). Live H1 is "Houston Silver Buyer, Valued Precisely." One H1. Title, OG, and Twitter stay "AG Refining | Houston Silver Buyer Near Hobby Airport". LocalBusiness schema slogan was updated to the new line so it stays consistent with the H1. Design unchanged.
- **B. CHECKED, NOT REMOVED: `app.agrefining.com`.** Still attached to Vercel project `agrefining` (`prj_rJyiwRLmv82XacSIod4zMx63QnzJ`) as a verified production domain with no redirect and no branch. The Vercel MCP connection can list it but has no tool to detach a project domain, and the box Vercel CLI is logged out. No login, no credentials, no DNS change, and no other domain was touched. Confirmed after the A/C deploy: `www` 200, apex 308 to `https://www.agrefining.com/`, `/app` 307 to `/desk` then 200.
- **C. DONE: Phone hero video encodes** (`0889e16`). Phones below 768px now get 960x540 encodes of all three hero clips (the two that load first plus `precision-assay`, which loads after the first swap). Same content and look, existing posters kept, CLS 0 on three Lighthouse mobile runs. Desktop (768px and up) still uses the 1280x720 files. First-load WebMs went from 2,343 KB to 1,351 KB. Lighthouse mobile, Home, 3 runs: before 99 Perf / 100 A11y / LCP 2.0–2.1s / 2,650 KiB / CLS 0; after 99 Perf / 100 A11y / LCP 2.0–2.1s / 1,682 KiB / CLS 0. The after runs requested the `-mobile.webm` files, not the desktop ones.
- **Heads-up, PR #17:** Report only; not closed or merged. Draft PR https://github.com/whoisjaso/agrefining/pull/17 (`claude/plain-words-pass`, commit `3a5c418`) is still open. Last updated Wed Nov 19, 2026, 10:28 PM CT. Its Vercel preview check is FAILURE ("Account is blocked"). It is stale as a merge candidate: `main` is 23 commits ahead of the merge-base, and the unique PR commit still diffs 11 files against current `main`. Some of its themes later landed in other work (Get Paid, consumer-inclusive copy, env lead routing), but it is not a no-op. Don't pay anything (billing belongs to Jason's Finance and Client Delivery bots).

1. **DONE: Merge `blog-batch-4`.** Merged as `f8abd1f`. Both guides are live (200) and IndexNow accepted the URLs. The scrap guide cites the Texas 10-day hold (Occ. Code 1956.064); flag it if Dennis's practice differs.
2. **WAITING: Dentist/counter payout calculator** (see "Ideola's Dentist Calculator Tweaks" in section 4). Build it on `/desk`: live spot price at the moment of sale, the customer sees only the payout, happy green approval and "you got paid" cues, dead simple for an older owner. Blocked on Jason sharing Ideola's file.
3. **DONE: Mobile hero performance** (`2d16cfd`, plus `3c62894`). Phones (below 768px) get a 1280px poster (43 KB) instead of the 2560px one (186 KB), and the video layers use the 1280px poster (the film itself is 1280x720). `3c62894` fixes an intermittent 0.55 CLS on phones: the no-JS mobile nav fallback put the hidden homepage header in flow until `site.js` ran. Lighthouse mobile, Home: before 95 Perf / 96 A11y / LCP 2.8s / 2,789 KiB; after 99 Perf / 100 A11y / LCP 2.0s / 2,650 KiB / CLS 0 (three runs each). The two hero videos (about 2.3 MB) are now most of the page weight.
4. **DONE: Accessibility** (`f52d4d1`). Fixed the conversion-band eyebrow contrast (2.6 to 6.2), small-text and eyebrow contrast on the tan `#e6dfd3` sections, the Spanish nav "en ingles" note, and the map card's label/name mismatch. `npm run verify` now also runs `npm run test:a11y` (axe-core, WCAG 2 A/AA, every sitemap page at phone and desktop width), and `scripts/verify.mjs` checks every sitemap page for title, meta description, unique titles/descriptions, canonical, lang, one H1, `<main id="main">`, the phone number, img alt, and valid JSON-LD. That caught a duplicate meta description on `/houston-silver-buyer`, now unique.
5. **DONE: Pasadena and Pearland localized** (`0e8713b`). Real routes (Spencer Hwy and College Ave from Pasadena; Pearland Parkway or Main St/Telephone Rd to Monroe Rd from Pearland), OSRM drive distances, landmarks checked on official sites (Pasadena City Hall, San Jacinto College Central, Pearland City Hall, Pearland Town Center), and five local FAQs each. Content lives in `localServiceAreas` in `scripts/content/areas.mjs`.
6. **DONE: Comparison guide** (`91b06b0`). `/guides/selling-silver-refiner-vs-pawn-shop-vs-online`, sourced to Texas Finance Code 371.157 and 371.169, 7 TAC 85.405, Occ. Code 1956.063, and the FTC Jewelry Guides. No rivals named, no prices. It's in the sitemap (now 55 URLs), `llms.txt`, and the guides hub.
7. **DONE: Homepage H1** (`0889e16`). Live headline is "Houston Silver Buyer, Valued Precisely." See section 0, item A.
8. **CHECKED, NOT REMOVED: `app.agrefining.com`.** Still attached to the Vercel project. See section 0, item B. `www`, apex, and `/app` still work. Safe to detach from Vercel when a logged-in Vercel CLI or dashboard session is available; do not change DNS.
9. **PREPPED: Cloudflare parity** on branch `cloudflare-parity` (`f6ca53a`, not merged, nothing deployed, no DNS changes). It adds `npm run test:cloudflare`, which runs the Worker locally against `dist/` and checks it against `vercel.json`: all 34 redirects, all 55 pages, the headers, apex to www, cleanUrls, the 404 page, video range requests, and `/api/leads` health. All green. The cutover checklist is in `cloudflare/README.md` on that branch. The big catch: `/review` (the counter card QR) is only built when `GOOGLE_REVIEW_URL` is set at build time, so the Cloudflare build must set it.
10. **After the nameserver switch,** verify `agrefining.com` in Resend and move the lead sender from `agrefining@mail.olaceo.com` to an `@agrefining.com` address.
11. **Ongoing:** two guides a month from the content calendar (one consumer, one B2B).

Billing note: the monthly fee covers the website and hosting only. Physical items, like printing the counter card, are Dennis's cost.

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
9. **Billing boundary:** Paid items (Vercel overdue balance, South Belt-Ellington Chamber membership, counter QR card printing) are NOT covered: the monthly fee is website + hosting only. Dennis prints the card himself from the PDF.
10. **Dennis UX:** Dennis is older, non-technical, and a phone person. Keep his steps dead simple (phone calls, FaceTime, one-tap links).
11. **Copy & UI contract (`PRODUCT.md`, `DESIGN.md`, `scripts/check.mjs`):**
    - Plain, direct, unhurried copy. Qualify claims ("for qualifying commercial and industrial accounts", "when scheduling permits", etc.).
    - **Title Case headings** across the site.
    - **Floating "Get Paid" pill** (`get-paid-dock`) rises after scrolling past the first screen on every page and opens the standalone sell portal (`/sell`, Spanish `/vender`).
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
- **Open subdomain:** `app.agrefining.com` is still attached to the Vercel project but has no DNS record at Bluehost, so it does not resolve. `/app` on www already opens the Buy Desk. Detach from Vercel when a logged-in CLI or dashboard session is available (see section 0, item B). Do not change DNS.

### Recent Deploys, SEO/AEO/GEO & Performance
- **Merged & live on `main` today:** `site-fixes-nov25` (`9752533`, carrying `blog-batch-2` and `blog-batch-3`) and `402b6c2` (optional `AG_LEAD_BCC_EMAIL` copy list).
- **Sitemap & IndexNow:** `sitemap.xml` now publishes **55 live URLs** (HTTP 200 across the board). IndexNow accepted all 55 URLs at 4:05 PM CT Nov 25 (HTTP 200); re-run `npm run build && npm run submit:indexnow` after the next deploy and resubmit sitemaps in Search Console and Bing Webmaster Tools.
- **AI & Search readiness:** `robots.txt` welcomes Google, Bing, Apple, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and Common Crawl; `llms.txt` and `llms-full.txt` are live; JSON-LD includes `LocalBusiness`/`Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Service`, `FAQPage`, `Person`, and `openingHoursSpecification`.
- **`sameAs`:** `AG_SAME_AS` env switch is implemented in `scripts/build.mjs`; currently omitted on the live homepage until verified external profile URLs are ready to add.
- **Lighthouse mobile (lab runs from box):** Home **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO** (LCP 2.0s, CLS 0, 2,650 KiB) as of Nov 25 4:00 PM CT, up from 95 / 96 / 100 / 100 (LCP 2.8s). The earlier intermittent CLS (0.41 to 0.55) was the hidden homepage header entering the page flow on phones; fixed in `3c62894`.
- **Old WordPress residue:** Some Google results still show cached old WordPress copy ("15 Years", "top dollar"). 15+ permanent 301 redirects are live in `vercel.json`; request reindexing in Search Console.

### Live Guides & Area Pages
- **Guides hub:** `/guides`
- **10 live guides:**
  1. `/guides/sterling-vs-silver-plate`
  2. `/guides/how-silver-is-valued`
  3. `/guides/x-ray-film-privacy-checklist`
  4. `/guides/which-us-coins-are-silver`
  5. `/guides/id-to-sell-silver-texas`
  6. `/guides/selling-silver-bars-and-rounds-houston`
  7. `/guides/commercial-dental-industrial-silver-houston`
  8. `/guides/inherited-sterling-flatware-tea-sets-houston` (*Selling Inherited Sterling Flatware and Tea Sets in Houston: Weighted and Hollow Pieces*)
  9. `/guides/how-silver-buyers-price-scrap-houston` (*How Silver Buyers Price Scrap in Houston: Daily Spot Prices, Purity, and Offers*)
  10. `/guides/selling-silver-refiner-vs-pawn-shop-vs-online` (*Selling Silver to a Refiner vs. a Pawn Shop vs. Online*)
- **SE Houston area pages:** `/silver-buyer-hobby-airport`, `/silver-buyer-south-houston`, `/silver-buyer-clear-lake`, and `/sell-estate-silver-houston` are live. `/silver-buyer-pasadena` and `/silver-buyer-pearland` are now localized with real routes, landmarks, and local FAQs.

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
- Print-ready 4x6 counter QR card (`ag-refining-review-card-4x6.pdf` and `.png`) is generated at `/workspace/agrefining-media/qr-card/`. Dennis prints it himself (monthly fee covers website + hosting only).
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
| 1 | Reviews engine (`/review`, QR card, post-sale text, 48h replies) | Us / Dennis | `/review` live + final card approved; Dennis prints it himself; Dennis starts asking |
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
- **DONE Nov 25: Localize Pasadena & Pearland:** Rewrite `/silver-buyer-pasadena` and `/silver-buyer-pearland` with real driving routes (Spencer Hwy, College Ave, Telephone Rd, Monroe Rd), landmarks, and local FAQs.
- **DONE Nov 25: Comparison page:** "Selling Silver to a Refiner vs. a Pawn Shop vs. Online" (factual, no named rivals; strong Bing/AEO asset).
- **DONE Nov 25: Mobile hero performance:** Serve a phone-sized hero poster instead of the 2560px asset (current Home LCP 2.8s, 2.8 MB weight); verify zero CLS on coin template.
- **DONE Nov 25: Accessibility & HTML cleanup:** Fix eyebrow text contrast failure; audit `scripts/verify.mjs` coverage for new pages.
- **Design/ops decisions for Jason:**
  - Homepage H1 is now `"Houston Silver Buyer, Valued Precisely."` (`0889e16`).
  - `app.agrefining.com` is still attached in Vercel (no DNS record; checked Nov 25, 4:54 PM CT, not removed). `/app` already opens the Buy Desk.
- **Attribution & schema:** Add UTM tag to GBP website link; fill `AG_SAME_AS` env var as GBP/BBB/Bing/Yelp/Apple URLs confirm.
- **Reindex & gated pages:** Request Google reindex to clear old WordPress snippets; enable `/gold-buyer-houston` and `/x-ray-film-privacy-process` only after Dennis confirms in writing.
- **PREPPED Nov 25 on `cloudflare-parity`: Cloudflare parity:** Ensure all `vercel.json` 301s and `/api/*` endpoints have working Cloudflare equivalents before switching DNS.

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
6. **Hero-v2 video review (branch `hero-v2` only, do not merge or deploy to production):** Claude chat generated 10 Seedance 2.5 clips (720p, 8s, 16:9, unlimited on the ResiBrands Higgsfield account; chat https://claude.ai/chat/c5e810db-4008-470d-951a-95d30778be06). Grok Bot reviewed six frames plus first/last on each, rejected 4A (warped coin stack) and 5B (a pen, not a tester; coin inscriptions), and encoded three finalists into the existing clip slots: **3A molten pour -> `molten-pour`**, **1A stacked bars on a scale -> `silver-ingots`**, **2B loupe over sterling -> `precision-assay`**. Contact sheets, raws, and notes: `/workspace/agrefining-media/hero-v2/` (`contact-sheet.png`, `contact-sheet-finalists.png`, `NOTES.md`). Please review the picks and the alternates (1B, 2A, 3B, 4B, 5A) for artifacts, brand fit, and the rule that AI footage must never look like Dennis's actual shop or staff. If you agree, say so; if you'd swap a finalist, name the replacement and why. Commit any review notes on this branch only.

**Hero-v1 backup and restore** (in case Dennis prefers the old clips). The live files were copied from `origin/main` `05ddbb6` to `/workspace/agrefining-media/hero-v1-backup/` (16 files: all three clips, desktop and mobile, mp4 and webm, plus the four posters; checksums in `MANIFEST.txt`). The same commit is tagged `hero-v1` on origin. Production was not changed.

To restore only the old hero media, leaving other work alone:

`git checkout hero-v1 -- images/ag-refining-molten-pour-poster.webp images/ag-refining-molten-pour-poster-1280.webp images/ag-refining-silver-ingots-poster.webp images/ag-refining-precision-assay-poster.webp videos/ag-refining-molten-pour.mp4 videos/ag-refining-molten-pour.webm videos/ag-refining-molten-pour-mobile.mp4 videos/ag-refining-molten-pour-mobile.webm videos/ag-refining-silver-ingots.mp4 videos/ag-refining-silver-ingots.webm videos/ag-refining-silver-ingots-mobile.mp4 videos/ag-refining-silver-ingots-mobile.webm videos/ag-refining-precision-assay.mp4 videos/ag-refining-precision-assay.webm videos/ag-refining-precision-assay-mobile.mp4 videos/ag-refining-precision-assay-mobile.webm`

Or copy those paths from `/workspace/agrefining-media/hero-v1-backup/`. Then run `npm run test:media` and `npm run verify`, commit, and deploy only after Jason says yes. Do not reset `main` to the tag if later commits should be kept. **Shipped:** Jason approved going live at 3:05 AM CT on Nov 26, 2026. `hero-v2` (through `af52269`) was fast-forwarded to `main` and is live on www.agrefining.com. The `hero-v1` tag and backup folder still hold the previous clips.

**Hero-v3 "process" hero (branch `hero-v3` only, NOT merged, NOT deployed):** Jason said the hero looked bad on phones and asked for the whole process, not three clips. Cause on phones: the 16:9 960x540 film was cropped by `object-fit: cover` into a 390x969 hero, so only about 23% of the frame width showed, upscaled and dark, with the subject lost. Fix: phones and any portrait viewport (`(max-width: 767px), (orientation: portrait)`) play native 9:16 540x960 clips; desktop plays 16:9 1280x720. Claude chat generated 10 shots in both aspect ratios (Seedance 2.5, 720p, 8s). Kept for desktop, in order: 01 pile, 02 sort, 03 acid test, 04 XRF, 05 weigh, 06 furnace, 07 pour, 08 cooling bar, 09 polished bars. Kept for phones: 01, 02, 03, 04, 05, 07, 09 (portrait furnace and cooling takes were rejected: copper-looking coins with readable coin detail, and a bar that ends copper-pink). Shot 10 (cash and check) was rejected on both ratios (readable bill and check detail). The component still plays two layers with a crossfade and loads only the active plus next clip. On phones the film is now full-bleed (100dvh, edge to edge from the top, transparent overlaid header, black theme-color, no 66svh mask and no navy letterboxing). A light black gradient sits only under the headline and actions. Raws, frames, encodes and screenshots: `/workspace/agrefining-media/hero-v3/`. Do not merge or deploy without Jason's yes. The `hero-v1` tag and backup are untouched.

---

## 7. Claude to Grok Bot

*Claude Code: write your revamped strategy, architectural decisions, diffs/PR plans, or questions for Grok Bot below this line before committing `CLAUDE.md` so Grok Bot picks them up on the next `git pull`.*

- *(Awaiting Claude Code's first pass.)*

### Grok Bot build log

- **Nov 28, 2026 (Claude Code):** Media v2 wired in (the Higgsfield top picks in `assets/v2/`, mapping in `assets/v2/MAP.md`), approved by Jason to go live. Markup points at `/assets/v2/...`; the earlier files were left on disk. **Cards:** all 16 material stills and the 7 live city cards (Houston, Pearland, Pasadena, Sugar Land, Katy, The Woodlands, Conroe) read from v2 through `v2CardImages` in `scripts/build.mjs`, which also carries a new alt for each still (city alts say "Illustrative", since these are not photographs of the places). Same 1280 and 800 sizes, same `width`/`height`, lazy except the one hero image on a material or city page. **Home:** the nine-clip process film stays as the hero. The flatware loop was not used: a single 6-second loop does not beat the process film Jason asked for. The home still (the "We Come To Your Facility" picture and the Organization schema image) is now `hero-home` (16:9 with 800/1600/2400 on desktop, the 9:16 still on phones). **Inner heroes:** `/about`, `/how-it-works`, `/contact` and `/espanol` have a short dark hero (`page-hero-art`): the still behind a scrim, text in one column on the dark side, 16:9 with 1600/2400 on desktop and the 9:16 still on phones. That hero is the only image those pages preload. **Guides and FAQ:** each of the 10 guides and `/faq` has one lazy 16:9 still under the intro (`page-header-art`). **How It Works:** the pay still sits under the six steps. **Portal:** `/sell` and `/vender` have the dark backdrop full-bleed (9:16, or 4:5 on wider screens) and the questions sit on a cream card, so every field reads as before; still locked to the screen with no scrolling at 390x844 and 390x664. **Emails:** the header JPEG is at the top of every email from `https://www.agrefining.com/assets/v2/email-header-1200x400.jpg`, with alt text and a navy cell behind it for when images are off; the Ag tile and wordmark stay under it. **Link previews:** `og:image` and `twitter:image` use the 1200x630 section cards (default, materials, industries, areas, guides) through `sectionSocialImage()`, and `ogSize()` now returns 1200x630 for them. **Derived sizes added to `assets/v2/`:** `-800.webp` for the guide, FAQ, pay and home stills and `-mobile-720.webp` for the phone heroes, so every still has a srcset. **Not used:** `loop-flatware*`, `hero-home-21x9-*`, `hero-home-mobile-4x5`, `process-weigh`, `process-test`, `email-header-2400x800`, and the Hobby, South Houston and Clear Lake cards (those pages are text pages with no card slot). `/x-ray-recycling-services-houston` keeps its earlier image because v2 has no still for it. `MAP.md` had characters the repo lint bans; they were replaced, and `.md` files are no longer copied into `dist`. New test: `tests/media-v2-contract.test.mjs`.

- **Nov 28, 2026 (Claude Code):** Map removed from the sell portal, approved by Jason to go live (owner's call). `/sell` and `/vender` no longer carry the map strip, the address chip, the Directions link or the OpenStreetMap credit; `renderPortal()` is now Close, the question, the inputs, Next and the Or Call link. The portal grid is two rows (Close, then the question area), and the question area keeps bottom space equal to the Close row so the form sits in the true middle of a phone screen (at 390x844 the space above and below the form differs by 16px); screens under 700px tall give that space back so nothing scrolls at 390x664. With the keyboard up only the call link steps aside. `/contact` keeps its map band unchanged. The "Bring It To The Shop" tile still shows "9125 Airport Blvd." as its note, since that is part of the question.

- **Nov 28, 2026 (Claude Code):** Polish round after the live check on `5924ebf`, approved by Jason to go live. **CTA casing:** the hero button was the one call to action still set in capitals (`text-transform: uppercase` with wide tracking on `.atelier-hero .hero-actions .button`); the transform is gone, so it reads "Get Paid For Your Silver" like every other button. No button, link or pill uses an uppercase transform now. **Get Paid pill:** it no longer sits on top of the four-cell trust ledger under the material selector; `updateChrome()` in `src/site.js` hides the pill while a `.trust-ledger` is under the dock zone (the bottom 112px of the screen) and brings it back after. It also steps aside as soon as the closing band comes into view, since that band has its own button. **Closing band:** the cream sticky header on phones now slides away when the closing dark band ("Let Us Come To You.") comes into view, not only the footer (`darkCloseTop` is the higher of the two), so the light bar is never over or right above the dark close. The cream that remains above the band while scrolling is the page section before it, not the header. **Emails (`api/leads.js`):** labels are plain Title Case text (no uppercase transform anywhere in the template), each label is stacked above its value in one column so nothing wraps at 390px, the header carries a navy "Ag" tile next to "AG Refining" (drawn with a table cell, no remote image, because the repo mark is SVG and Gmail does not show SVG), Partial Lead and Partial Lead Update always include "Bringing" ("Not Answered Yet" when the visitor has not picked), and the Spanish confirmation shows the tile answers in Spanish (Unas Pocas Piezas, Una Caja O Bolsa, Volumen De Negocio, Llevarlo A La Tienda, Dennis Viene A Mí). Free text typed into the plain no-JavaScript form is shown as typed. New tests cover each of these.

- **Nov 28, 2026 (Claude Code):** Emails, Title Case, hero and footer polish, approved by Jason to go live. **Emails:** all four (Partial Lead, Partial Lead Update, New Pickup Request, and the customer confirmation in English and Spanish) now share one template in `api/leads.js` (`emailShell` plus `emailPlain`): cream page, one card, the AG Refining wordmark, one Title Case heading, a one-line summary, one navy button (Call the customer for Dennis, Call the shop for the customer), a short table of labeled details, and a quiet footer with the address and phone. Tables and inline styles only. Every label and value is Title Case. Unanswered fields are left out instead of printed as "Not provided"; every field that has a value still appears, and the website attribution block is kept as a small "How They Found Us" list. Subjects are now "Partial Lead: Name, phone", "Partial Lead Update: ...", "Pickup Request: Material From Name" and "We Received Your Request | AG Refining". **CTA wording:** the site-wide call to action changed from "Schedule a Free Pickup" to **"Get Paid For Your Silver"** (Spanish "Reciba Pago Por Su Plata"); every closing band now has exactly one white button and no second call link. **Hero:** the visible headline and tagline are gone; the hero is the film and one button, with the H1 kept visually hidden for search and screen readers. **Phone footer:** the white strip was the cream sticky header sitting over the dark close of the page; on phones it now slides away when the footer comes into view (`html.at-footer`) and returns on the way back up. **Title Case:** the owner rule is every word capitalized, small words included; `titleCaseMinorWords` is now empty and the build's normalizer also covers H4, buttons, text and phone links, form labels, legends, select options, table and definition labels, FAQ questions, breadcrumbs, the trust band and arrow links, in English and Spanish, so "Material type" is "Material Type". **Portal:** the question now has real space above its input (the legend floats, so the old grid gap never applied), the first field no longer autofocuses on phones, and the phone field shows "(281) " as soon as three digits are in while Backspace still works. Tests updated across the suite; new tests cover the email layout, the header rule, the hero and the single-button bands.

- **Nov 28, 2026 (Claude Code):** Standalone sell portal, approved by Jason to go live. **Decision: a dedicated route.** The pickup flow now lives at `/sell` (English) and `/vender` (Spanish), built with `document({ chrome: false })`: no header, menu, logo bar, footer, pill or other sections, only the questions, a small Close link back to the site, an "Or call" link and a slim map strip at the bottom. Both are `noindex,follow` and stay out of the sitemap. `/contact` and `/espanol` were kept as real pages (search value, NAP, hours) instead of being stripped: `/contact` is now phone, email, address, hours, one button and the map band; `/espanol` keeps its sections and hands off to `/vender`. Every pickup, quote and Get Paid link is rewritten to `/sell?...` at build time by `withFormAnchor()`, and material pages still carry `material=` into the portal. **Locked to the screen:** once the script runs, `html.portal-locked` fixes the portal to the visual viewport height (`--portal-height`, from `visualViewport`) and the page cannot scroll; when the keyboard opens the portal shrinks to the space above it and the map strip and call link step aside (`.is-typing`). Only the question area can scroll if a screen is ever too tall. **Screens (six):** full name (First and Last on one screen, no Middle), phone, What Are You Bringing, About How Much, How Would You Like To Sell, optional email. **Phone** is a strict US field: digits only, a leading +1 or 1 stripped, ten digits max, formatted as (281) 898-2719 while typing, and Next stays disabled until the number is ten digits with area code and exchange starting 2 to 9. The partial-lead logic is unchanged and still fires on the first valid phone. **Seller framing:** the old Pickup Or Drop-Off step is now How Would You Like To Sell, with Bring It To The Shop (9125 Airport Blvd.) and Dennis Comes To Me (For larger lots); the value posts in `location` and the emails label it "How they want to sell". No Gold option and no same-day wording. **Sounds:** a soft Web Audio tick on Next and a two-note chime on a successful submit, created only after a tap or key press, silent under reduced motion, quiet (peak gain about 0.05) and wrapped so a failure can never block the form. Unchanged: tiles, amounts, optional email, success screen, privacy notice, autosave, partial leads, the 500ms two-way transition, and the plain no-JavaScript form (it scrolls normally). Fixed along the way: the hidden spam-trap field sits on the last screen and must never count as an unanswered question. `npm run test:a11y` now also covers `/sell` and `/vender`, and `tests/site-chrome-browser.mjs` checks the lock and the phone field in a real browser.

- **Nov 27, 2026 (Claude Code):** Pickup flow polish, approved by Jason to go live. (1) The "Prefer to Talk First?" contact block is removed from the form section on `/contact` and `/espanol`; the form is a single centered column with one small "Or call (281) 898-2719" link under it. On `/contact` the map band (address, hours, Get Directions, call) now sits below the form section. (2) On phones, while the flow is active, the form column is a full screen: `min-height` of `100svh` less the header, vertically centered, with the section heading visually hidden so the question, the input and Next/Back are all that shows. At 390x844 the column ends exactly at the bottom of the screen. (3) Screen changes now take 500ms on `cubic-bezier(.22,1,.36,1)`: the old screen slides out with blur and fade while the new one slides in, mirrored on Back, off under reduced motion. Both screens share one grid cell (`.flow-stage`) during the change. Autosave, partial leads, the progress bar and the reward lines are unchanged. The Spanish anchor `#solicitud` moved from the section to the form column so it lands on the question.

- **Nov 26, 2026 (Claude Code):** Pickup form reworked to one field per screen, approved by Jason to go live. Seven screens on `/contact` and `/espanol`: first name, last name, phone, What Are You Bringing (same five tiles, still no Gold), About How Much, Pickup Or Drop-Off, optional email, then the success screen with tap-to-call. Each screen is one question, one focused input, Next, Enter to advance and a Back link. Screens change with a 300ms slide plus slight blur and fade; reduced motion turns it off. The progress bar and the short line after each answer stay. **Autosave:** answers and the current screen are kept in the visitor's own browser (`localStorage`, key `ag-pickup-flow-v1`, 14 days) and cleared on success, so a returning visitor resumes where they stopped. **Partial leads:** `/api/leads` has no database, only email, so partial leads use that same path. The form posts `lead_status` and `lead_step` with the browser's session id (`submission_key`). When a valid phone is first entered the endpoint sends one email with the subject "Partial lead: Name, phone" to the usual recipient and copy list. Later screens post `progress`, which is only written to the Vercel function log as `LEAD_PROGRESS` lines. If the visitor leaves after answering more, one "Partial lead update" email goes out with what they answered and where they stopped. Finishing sends the normal "Pickup request" email, now marked Status: Complete. The session id is the Resend idempotency key per stage, so one person produces at most one email of each kind. **How to see partial leads:** Dennis and Jason look for subjects starting "Partial lead" in the same inbox as full leads; Jason can also search the Vercel function logs for `LEAD_PROGRESS`. The form tells the visitor the number is saved as they go, and the privacy page says so too. The endpoint also accepts `first_name` and `last_name` and joins them into `name`, so the plain no-JavaScript form posts the same way.

- **Nov 26, 2026 (Claude Code):** Step-by-step pickup flow, approved by Jason to go live. The form on `/contact` and `/espanol` is now four questions, one per screen: What Are You Bringing (tiles: Silver, Coins / Bullion, Dental / X-Ray, Industrial / Scrap, Not Sure), About How Much (A Few Pieces, A Box Or Bag, Business Volume), Pickup Or Drop-Off, then Where Should Dennis Call You (name, phone, optional email). Tapping a tile moves on by itself; keyboard users get a Continue button; Back is always there and answers are kept. A thin progress bar starts at 20%, a short line acknowledges each answer, and the button reads Get My Offer Call. The success screen says what happens next with a tap-to-call button. Nothing is labelled Required and nothing in the form is red. Same endpoint and same fields: the tiles post `material` (the endpoint's own values), `quantity` and `location` (now labelled Pickup or drop-off in the emails). Without JavaScript it is a plain stacked form that posts the same way. **Two things were left out on purpose:** there is no Gold tile (hard rule 5, no gold claims until Dennis confirms in writing), and the line by the phone field is "No obligation. Dennis calls you back." with no "usually same day", because that timing is not confirmed. No analytics exist on the site, so no step tracking was added. Also: the home selector asks one question (material) and opens the flow at step two, every H1 is now Title Case through the build's normalizer, the Spanish form sits above the contact details on phones, and the home header turns solid a little earlier so MENU never shows white on cream.

- **Nov 26, 2026 (Claude Code):** Pickup form, map band, lighter phone header and full-height phone hero, approved by Jason to go live. (1) Every Schedule a Free Pickup and Get Paid link now ends in `#get-paid`, so it opens `/contact` on the form heading; `withFormAnchor()` in `scripts/build.mjs` adds it at build time and `site.js` smooth-scrolls instead of reloading when the visitor is already on that page. The existing `scroll-padding-top` keeps the heading clear of the sticky header. (2) The form is now Name, Phone, Material, optional Email and an optional Note. `api/leads.js` still takes the old fields, but email, pickup location and the note are optional now; with no email there is no reply-to and no courtesy email, and the owner email still sends. On phones the form sits above the contact details. (3) The old "map" was a CSS-drawn navy card, not a map. It is replaced by a full-bleed band with one static street map image kept in the repo (`images/ag-refining-map-hobby-airport.webp` and `-mobile.webp`, built from OpenStreetMap tiles, credited on the band), a CSS pin, the address, hours, Get Directions and the call link. No key, no script, no iframe. Get Directions opens Apple Maps on iPhone, iPad and Mac, a `geo:` link on Android and Google Maps elsewhere. (4) On phones the solid cream header shows the wordmark only and a plain MENU control, no navy tile and no box. (5) The phone hero now runs to the large viewport (`100lvh` plus the bottom safe area, with `100dvh`, `100svh` and `-webkit-fill-available` fallbacks) while the copy block stays in the visible area, so the black film also covers the strip under Safari's toolbar.

- **Nov 26, 2026 (Claude Code):** Navy strip on iPhone fixed and the hero made minimal, approved by Jason to go live. Cause of the navy: `html.home-document` and `body.home-page` were painted `#102a43` in `src/style.css`. The `theme-color` meta was already black, but iPhone Safari tints the status bar area from the page background when the header over it is transparent, so the strip came out navy. The loading screen (`.home-loader`) was also `#102a43`, and the desktop hero carried a navy tint (`.atelier-hero` base `#071827` and `rgba(3, 22, 36, ...)` overlay). All four are black now. No JS changes `theme-color`, and the site has no manifest outside `/desk` (the Buy Desk manifest is still navy and was left alone). The hero on phone and desktop is now the headline, one short line ("See the weight. You decide.") and one button (Schedule a Free Pickup). The second button, the call link and the four-cell proof rail are gone from the hero; the same four proof points sit in the trust band directly below, and the call link is in the menu and lower on the page. Tests and `scripts/verify.mjs` assert the new hero. Supersedes draft PR #20.

- **Nov 26, 2026 (Claude Code):** Mobile menu rebuilt as a full-screen overlay, approved by Jason to go live. Below 901px, tapping MENU fades a near-black overlay over the whole screen (about 360ms ease-out), then the links, the Schedule a Free Pickup button and a new Call (281) 898-2719 link rise in one by one. Closing fades everything out together (300ms). No logo inside the menu; the header shows only a white Close control. Body scroll is locked, Escape closes, focus is trapped and returns to the toggle, and reduced motion drops the transitions. Material sub-links show in Title Case inside the menu. Hero and desktop header are unchanged. `tests/mobile-homepage-contract.test.mjs` and `tests/site-chrome-browser.mjs` now assert the full-screen overlay instead of the old compact panel.

- **Nov 26, 2026 (Claude Code):** Phone header over the hero film, approved by Jason to go live. While the transparent header sits over the video on phones, the MENU control is plain white text plus the hamburger with a soft shadow (no cream box, no border) and the logo mark and wordmark are hidden. The logo and the boxed button return on the solid cream bar after the hero and whenever the menu is open. Desktop is unchanged. Tap target is 77 x 45 px. `tests/site-chrome-browser.mjs` now checks this and clicks the logo from the solid bar instead of over the film.

- **Nov 26, 2026 (Claude Code):** Phone hero readability fix on `hero-v3`. The bottom black gradient on phones is deeper (it starts near 24% of the height and reaches about 0.9 by the middle), the headline is a little smaller so it sets in three lines and the whole text block sits lower, and the headline, sub-copy, call link and proof rail carry a soft black text shadow. The film still runs edge to edge from the top, the status bar stays black, and no navy was added. Checked 21 phone frames at 390x844 (all seven phone clips at three moments each). `main` at `ac9cd3b` is tagged `hero-v2-live` for rollback. Jason approved going live, so `hero-v3` was merged to `main`.

- **Nov 26, 2026, 4:07 AM CT (Grok Bot):** Jason stopped the live push after seeing the phone hero. Production was never changed (`main` remains `ac9cd3b`, hero-v2). On branch `hero-v3` the phone hero is now full-bleed: video from the top of the screen, transparent header over the film, black `theme-color` and status bar, and a light bottom gradient only (the earlier 66svh mask and navy wash are gone). Screenshots are in `/workspace/agrefining-media/hero-v3/shots/fullbleed/`.
- **Nov 26, 2026, about 4 to 5 AM CT (Grok Bot):** Built the hero-v3 process hero on branch `hero-v3` (not merged, not deployed; Jason has not approved it). Nine desktop and seven phone shots, new 9:16 phone encodes and posters, mobile overlay and framing in `src/style.css`, tests and `scripts/verify.mjs` updated for the new clip set. See the hero-v3 paragraph in section 6 question 6.
- **Nov 26, 2026, 3:10 to 3:16 AM CT (Grok Bot):** Jason approved pushing the new hero clips live (3:05 AM CT). Fast-forwarded `main` from `05ddbb6` to `af52269` (includes `b78e3c6` and the hero-v1 restore note). `npm run test:media` (4/4) and full `npm run verify` were green, including a11y on 55 pages x 2 viewports. Pushed `main`. Production deploy `dpl_8v86M7sawbk2ubZ6YF6QWo3GrcFe` came back READY (commit `af52269c3e0fc96f6e0663f89771c930f141f99e`, aliases include www.agrefining.com). Live check of all 16 hero files on https://www.agrefining.com/: every desktop and mobile video (mp4 and webm) and all four posters returned HTTP 200, and byte size plus SHA-256 matched the new encodes and differed from the `hero-v1` backup. Homepage https://www.agrefining.com/ returned 200 and still references the molten-pour posters. Old clips remain at tag `hero-v1` and `/workspace/agrefining-media/hero-v1-backup/`.

- **Nov 26, 2026, 3:09 AM CT (Grok Bot):** Backed up the live hero files from `origin/main` `05ddbb6` to `/workspace/agrefining-media/hero-v1-backup/` and pushed annotated tag `hero-v1` to origin. Restore steps are in section 6 question 6. Production was not changed.
- **Nov 26, 2026, about 2:32 to 2:50 AM CT (Grok Bot):** Hero-v2 is on branch `hero-v2` only, not on `main` and not deployed to production. Claude chat generated the 10 Seedance 2.5 clips (ResiBrands / unlimited; Cursor tools cannot spend that allowance). Grok Bot downloaded them, reviewed frames, encoded the three finalists (3A, 1A, 2B) to the current 1280x720 and 960x540 mp4/webm pipeline plus posters, and asked Claude to review in section 6 question 6. Raws and contact sheets stay in `/workspace/agrefining-media/hero-v2/`. Replaced one pre-existing em dash in this file so `npm run check` can pass (that character is banned by the repo lint).

- **Nov 25, 2026, 3:25 to 4:10 PM CT (Grok Bot):** Worked section 0 items 1 to 9. Commits on `main`: `56d442b` (this file: Grok Bot runs the queue), `f8abd1f` (blog-batch-4 merge), `2d16cfd` (phone hero poster), `f52d4d1` (accessibility and verify coverage), `0e8713b` (Pasadena and Pearland), `91b06b0` (comparison guide), `3c62894` (homepage header CLS fix). Branch only: `cloudflare-parity` `f6ca53a`. Every merge passed the full `npm run verify` first, and every production deploy on Vercel came back READY. Known flake, not caused by this work: `npm run test:browser` (not part of verify) can fail at the 900px viewport with a 0.51 hero layout shift. It reproduced on the pre-change build and should be fixed by `3c62894`; four reruns after the fix passed.
- **Nov 25, 2026, 4:39 to 4:54 PM CT (Grok Bot):** Jason reversed the 4:28 PM CT call ("you do it"). Grok Bot built queue A-C on the box. Commit `0889e16` on `main` ("Home: Title Case H1 and smaller phone hero video encodes"). `npm run verify` was green before the push (including a11y on 55 pages x 2 viewports). Extra, not in verify: `npm run test:media` and `npm run test:browser` (all 6 viewports) passed. Production deploy `dpl_GTeaVB6HXHfgjxMjcEBudoSWnqZA` came back READY. Live checks: https://www.agrefining.com/ 200 with one H1 "Houston Silver Buyer, Valued Precisely."; title/OG unchanged; schema slogan matches the H1; https://agrefining.com/ 308 to www; https://www.agrefining.com/app 307 to `/desk` (200). Phone videos are live under `/videos/*-mobile.webm` and `.mp4`.

  Lighthouse mobile, Home, 3 runs each:

  | | Perf | A11y | BP | SEO | LCP | Transfer | CLS |
  |---|---:|---:|---:|---:|---:|---:|---:|
  | Before 1 | 99 | 100 | 100 | 100 | 2.0s | 2,650 KiB | 0 |
  | Before 2 | 99 | 100 | 100 | 100 | 2.1s | 2,650 KiB | 0 |
  | Before 3 | 99 | 100 | 100 | 100 | 2.1s | 2,650 KiB | 0 |
  | After 1 | 99 | 100 | 100 | 100 | 2.0s | 1,682 KiB | 0 |
  | After 2 | 99 | 100 | 100 | 100 | 2.0s | 1,682 KiB | 0 |
  | After 3 | 99 | 100 | 100 | 100 | 2.1s | 1,682 KiB | 0 |

  Item B was not changed: `app.agrefining.com` is still on the project. Item 2 (calculator) is still waiting on Ideola's file. PR #17 is a stale open draft (see section 0 heads-up); not closed or merged.
- **Claude Code:** if you pick up item 2 (calculator) or anything else here, leave a note in this section first so we don't both edit the same files.
