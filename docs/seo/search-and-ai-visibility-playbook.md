# AG Refining search and AI visibility playbook

What the site now does automatically for search engines (SEO), answer engines (AEO), and generative engines (GEO), plus the off-site steps that still need a person with account access.

## What the build publishes

| Asset | URL | Purpose |
| --- | --- | --- |
| XML sitemap | https://www.agrefining.com/sitemap.xml | 40 indexed URLs with lastmod, changefreq, priority, hreflang for the English and Spanish home pages, and an image entry for every material, industry, and service-area page. Submit this in Google Search Console and Bing Webmaster Tools. |
| HTML site index | https://www.agrefining.com/sitemap | Human-readable index of every page. Also reachable at /index, /site-map, /site-index. |
| FAQ hub | https://www.agrefining.com/faq | Every question the site answers in one place with FAQPage structured data and a quick-facts block written for AI answer engines. |
| robots.txt | https://www.agrefining.com/robots.txt | Allows all search engines and explicitly welcomes the crawlers behind ChatGPT, Claude, Perplexity, Gemini, Copilot, Apple, Meta, and Common Crawl. Points to the sitemap. |
| llms.txt | https://www.agrefining.com/llms.txt | Plain-markdown briefing for language models: who AG Refining is, where it is, what it buys, where it picks up, and links to every page. |
| llms-full.txt | https://www.agrefining.com/llms-full.txt | Long form with every FAQ answer, material summary, industry summary, and service-area summary. |
| IndexNow key | https://www.agrefining.com/c8325a3fa9a6acb1e94923fd669bb439.txt | Lets `npm run submit:indexnow` push every URL to Bing, Yandex, and partners after a deploy. |

## Structured data on every page

Each page carries one JSON-LD graph with:

- `LocalBusiness` + `Organization`: name, description, logo, images, phone, email, street address, GPS coordinates, map link, founder (Dennis Stevens), contact points in English and Spanish, service cities across the Houston Metro Area, knowledge topics, and an offer catalog listing every material page.
- `WebSite` linked to the organization.
- `WebPage` (or `AboutPage`, `ContactPage`, `CollectionPage`) with published and modified dates, language, and primary image.
- `BreadcrumbList` on every page that shows breadcrumbs.
- `Service` on every material, industry, and service-area page with provider, service area, and contact channel.
- `FAQPage` on the home page, the FAQ hub, and every service page.
- `Person` for Dennis Stevens on the About page.

Meta tags include canonical URLs on the www host, Open Graph and Twitter cards with images, `og:locale`, hreflang alternates, and geo tags for Houston.

## Why the www host matters

Vercel serves the site on `https://www.agrefining.com` and 308-redirects the apex `agrefining.com` to it. Before this change the canonical tags, sitemap, and schema all pointed at the apex, so search engines were told the canonical page was a redirect. Everything now uses the www host. Do not change `siteUrl` in `scripts/build.mjs` unless the primary domain in Vercel changes too.

## Search Console and Bing setup (needs account access)

1. Google Search Console: the property `https://www.agrefining.com/` has been added to the connected Google account and is waiting for ownership verification. In Search Console pick the HTML-tag method, copy the token, set it as the Vercel environment variable `GOOGLE_SITE_VERIFICATION`, redeploy, then click Verify. A DNS TXT record on agrefining.com also works and covers the apex too.
2. Submit `https://www.agrefining.com/sitemap.xml` under Sitemaps.
3. Use URL Inspection on the home page, `/faq`, `/houston-silver-buyer`, and `/accepted-materials` and click Request Indexing.
4. Bing Webmaster Tools: import the site from Google Search Console (one click) or verify with the `BING_SITE_VERIFICATION` environment variable the same way. Submit the sitemap there too. Bing feeds ChatGPT search, Copilot, DuckDuckGo, and Yahoo.
5. After each deploy that changes content, run:

```bash
npm run build && npm run submit:indexnow
```

## Google Business Profile and citations (highest-impact off-site work)

AI assistants and Google Maps lean heavily on business listings. Use exactly the same name, address, and phone everywhere:

- Name: AG Refining
- Address: 9125 Airport Blvd., Suite B-1, Houston, TX 77061
- Phone: (281) 898-2719
- Website: https://www.agrefining.com/
- Primary category: Precious metals dealer or Scrap metal dealer. Secondary: Recycling center.

Claim or create these, in priority order: Google Business Profile (link the website, add the featured material photos, add Q&A from the FAQ page, post monthly updates), Bing Places, Apple Business Connect, Yelp, Yellow Pages, BBB, Nextdoor for Business, the local Chamber of Commerce, and precious-metal or scrap-metal industry directories. Once these exist, add their URLs to a `sameAs` array on the organization schema in `scripts/build.mjs`.

## Reviews

Ask satisfied commercial accounts for Google reviews that mention the material and city. Reply to every review. Review text is one of the strongest signals AI assistants use to describe a local business.

## Reddit and community content

Reddit threads are heavily cited by Google AI Overviews, ChatGPT, and Perplexity. Dennis should post from his own account, identify himself as the owner, and answer real questions rather than advertise. Good places: r/houston and r/HoustonSmallBusiness (where to sell silver scrap or old X-ray film locally), r/Silverbugs (how scrap silver and sterling are evaluated), r/DentalLab (what to do with dental scrap), and r/NDT (silver recovery from film). One helpful, transparent answer a week, linking the matching material page when it genuinely answers the question.

## Content cadence

Add one new page or long answer per month to the registries in `scripts/build.mjs`. Candidates that match real searches: how scrap silver is valued in Houston (factors, no price promises), how to sell sterling flatware in Houston, X-ray film disposal guidance for Houston hospitals, silver oxide battery recycling for jewelers, and city pages for Cypress, Spring, Baytown, League City, and Friendswood.

## Checking AI visibility

Once a month ask ChatGPT, Claude, Perplexity, and Gemini: "Who buys scrap silver in Houston?", "Where can a Houston hospital recycle X-ray film for silver?", "Silver buyer near Hobby Airport Houston", and "AG Refining Houston". Note which pages they cite. Perplexity and ChatGPT search read `llms.txt`, the FAQ hub, and Bing's index. Gemini and Google AI Overviews read Google's index and Google Business Profile.
