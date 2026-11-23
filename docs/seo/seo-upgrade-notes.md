# seo-upgrade branch notes (Nov 23, 2026)

Not merged, not deployed. Needs Jason's OK before it goes to main.

## What changed
- Business hours (Mon–Fri 9–5, Sat 9–12, Sun closed, matching the verified Google profile) added to LocalBusiness schema (`openingHoursSpecification`), the contact page, and llms.txt.
- `sameAsProfiles` array in `scripts/build.mjs`: add each claimed profile URL (Google Maps, Bing Places, Apple Maps, Yelp, Facebook, BBB) once it exists. Empty arrays are not emitted.
- Homepage title de-duplicated from /houston-silver-buyer: now "AG Refining | Houston Silver Buyer Near Hobby Airport".
- City page titles shortened to "Silver Buyer in {City}, TX | Free Pickup | AG Refining" (all under 60 characters).
- New /guides hub and three sourced guides with Article + FAQPage schema:
  - /guides/sterling-vs-silver-plate
  - /guides/how-silver-is-valued
  - /guides/x-ray-film-privacy-checklist
- New /sell-estate-silver-houston page (facts already on the site plus hours and ID note).
- vercel.json: 301s for old WordPress/HTML URLs still in search indexes (/aboutus.html, /pricing.html, /product.html, /scrap-silver, etc.), plus /blog and /hours.
- Test count updated from 41 to 46 published HTML documents.

## Pending pages (built only with AG_INCLUDE_PENDING=1)
- /gold-buyer-houston
- /x-ray-film-privacy-process

Each claim on those pages is tied to a flag in `dennisConfirmed` (scripts/content/guides.mjs). A sentence only renders when its flag is true. Flip flags only after Dennis confirms in writing. Never describe AG Refining as "HIPAA certified" (HHS does not recognize private HIPAA certifications).

## After deploy
`npm run build && npm run submit:indexnow`, then resubmit sitemap in Search Console and Bing Webmaster Tools.
