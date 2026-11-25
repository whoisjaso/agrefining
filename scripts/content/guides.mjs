// Guides (blog posts) and pending pages for agrefining.com.
// Every fact in these posts is tied to a public source listed with the post.
// Prices, payout percentages, and review counts are intentionally absent.
// Pages in `pendingPages` only build when AG_INCLUDE_PENDING=1, because they
// describe services Dennis has not yet confirmed in writing.

export const guidesPublished = "2026-11-25";

// Flip a flag to true only after Dennis confirms it in writing. Each flag
// unlocks one sentence on the X-ray privacy page or the gold page.
export const dennisConfirmed = {
  signsBusinessAssociateAgreement: false,
  issuesCertificateOfDestruction: false,
  lockedSealedTransport: false,
  chainOfCustodyLog: false,
  workforcePrivacyTraining: false,
  hasEpaIdNumber: false,
  buysGoldJewelryAndScrapGold: false,
  buysGoldCoinsAndBars: false,
  craftedPreciousMetalDealerRegistered: false
};

export const guides = [
  {
    path: "guides/sterling-vs-silver-plate",
    title: "Sterling, Coin Silver, or Silver Plate? How to Tell | AG Refining",
    description: "How to read the marks on silverware and jewelry before you sell: sterling (925), coin silver (900), and silver plate, explained in plain language.",
    eyebrow: "Guide for sellers",
    heading: "Sterling, Coin Silver, or Silver Plate? How To Tell Before You Sell",
    answer: "Look for a stamp. Under federal guidelines, “sterling” or “925” means at least 92.5% pure silver, and “coin” or “coin silver” means at least 90% pure silver. Pieces marked with words like “silver plate,” “EP,” “EPNS,” or a maker’s plate mark have only a thin silver coating over another metal, so most of their weight is not silver.",
    sections: [
      ["What the Marks Mean", "<p>The Federal Trade Commission’s Jewelry Guides say a product should not be called “sterling” unless it is at least 925 parts per thousand pure silver, and should not be called “coin silver” unless it is at least 900 parts per thousand pure silver. The same guides say a coated item should not be described as plain “silver” unless the description makes clear it is only coated. The National Stamping Act also bars stamping silver-plated articles with the word “sterling” or “coin.”</p><ul><li><strong>Sterling, Ster., or 925:</strong> at least 92.5% silver.</li><li><strong>Coin or Coin Silver:</strong> at least 90% silver. Often seen on older American spoons.</li><li><strong>A number such as 800 or 835:</strong> the silver content in parts per thousand, common on European pieces.</li><li><strong>Silver plate, EP, EPNS, or Quadruple Plate:</strong> a thin silver layer over a base metal.</li></ul>"],
      ["Where To Look for the Stamp", "<p>On flatware, check the back of the handle. On bowls, trays, and tea sets, check the underside. On rings, check inside the band, and on chains, check the clasp. A small magnifying glass and good light help. Marks can be worn, so a missing mark does not always mean an item is plated.</p>"],
      ["Why Weight Can Be Misleading", "<p>Some sterling pieces are not solid all the way through. Knives often have hollow sterling handles with a steel blade, and some candlesticks and bowls are weighted with a filler. A buyer pays for the silver, not the filler or the steel, so expect those parts to be set aside when the piece is weighed.</p>"],
      ["What Not To Do Before You Sell", "<ul><li>Do not polish or dip old silver to make it look better. It does not raise the silver value.</li><li>Do not clean old coins. Cleaning can reduce collector value.</li><li>Do not take sets apart or remove handles. Bring pieces as they are.</li><li>Do keep sterling and plated pieces in separate bags if you already know which is which.</li></ul>"],
      ["How AG Refining Can Help", "<p>If you are not sure what you have, call (281) 898-2719 and describe the marks you see. We can tell you whether it is worth bringing in and what happens next. AG Refining is at 9125 Airport Blvd., Suite B-1, Houston, TX 77061. Please call before you visit.</p>"]
    ],
    faqs: [
      ["Is “925” the same as sterling?", "Yes. Under the FTC Jewelry Guides, sterling means at least 925 parts per thousand pure silver, which is why sterling pieces are often stamped 925."],
      ["What does “coin silver” mean?", "Under the FTC Jewelry Guides, coin silver means at least 900 parts per thousand pure silver. It is common on older American flatware."],
      ["Is silver plate worth selling?", "Silver plate has only a thin layer of silver, so its silver value is usually small. Call first and describe the items so we can tell you whether a lot has recoverable value."],
      ["Should I polish my silver before selling it?", "No. Polishing does not raise the silver value. Bring pieces as they are."]
    ],
    sources: [
      ["FTC Jewelry Guides, 16 CFR 23.5, Misrepresentation as to silver content", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"],
      ["National Stamping Act, 15 U.S.C. 297", "https://www.law.cornell.edu/uscode/text/15/297"]
    ],
    related: ["silver-flatware-buyer-houston", "sell-silver-coins-houston", "scrap-silver-jewelry"]
  },
  {
    path: "guides/how-silver-is-valued",
    title: "How Silver Is Valued When You Sell It | AG Refining Houston",
    description: "Troy ounces, purity, and melt value explained simply, with the formula buyers use and what changes an offer. No sales pitch.",
    eyebrow: "Guide for sellers",
    heading: "How Silver Is Valued When You Sell It: Troy Ounces, Purity, and Melt Value",
    answer: "Silver is priced by the troy ounce, which equals 31.1035 grams. To find the pure silver in an item, multiply its silver weight by its purity, then divide by 31.1035 to get troy ounces. That number times the day’s silver market price is the melt value. A buyer’s offer is normally below the full melt value, because testing, refining, and handling cost money, and some coins are worth more than melt to collectors.",
    sections: [
      ["Troy Ounces, Not Kitchen Ounces", "<p>Precious metals are weighed in troy ounces. One troy ounce is 31.1034768 grams, a little heavier than the ounce on a kitchen scale, which is about 28.35 grams. When you see a silver price quoted per ounce, it means per troy ounce.</p>"],
      ["The Melt Value Formula", "<p>Melt value = weight in grams × purity ÷ 31.1035 × silver price per troy ounce.</p><p>Example: a sterling set whose silver parts weigh 1,000 grams contains about 925 grams of pure silver (1,000 × 0.925). That is about 29.74 troy ounces (925 ÷ 31.1035). Multiply by the day’s silver price to get the melt value. The price changes every trading day, so any number you calculate is a snapshot.</p>"],
      ["Purity by Common Item", "<ul><li><strong>Sterling flatware and jewelry:</strong> at least 92.5% silver.</li><li><strong>Coin silver flatware:</strong> at least 90% silver.</li><li><strong>U.S. dimes, quarters, and half dollars dated 1964 and earlier:</strong> 90% silver.</li><li><strong>Kennedy half dollars dated 1965 through 1970:</strong> 40% silver.</li><li><strong>Most investment bars and rounds:</strong> marked .999 fine.</li><li><strong>Silver plate:</strong> only a thin coating, so little silver by weight.</li></ul>"],
      ["Melt Value Versus Collector Value", "<p>Melt value is what the metal alone is worth. Some coins, especially rare dates, high grades, or certified coins in sealed holders, can be worth more to collectors than their silver. That is why you should never clean coins and should ask a buyer whether they are reviewing collector value or metal value.</p>"],
      ["Why an Offer Is Below Full Melt", "<p>A buyer has to test the material, refine it into pure silver, and carry the market risk until it sells. Those costs come out of the offer. A fair buyer will tell you how they measured the weight and purity and how they reached the number. At AG Refining, offers are based on the confirmed material, weight, recoverable silver, and current silver market values, and you can see the weight before payment.</p>"],
      ["Texas Rules That Protect Sellers", "<p>Texas requires businesses that buy crafted precious metal, such as jewelry and flatware, to register with the Office of Consumer Credit Commissioner, to report purchases to local law enforcement with the seller’s name, physical description, and address, and in most cases to hold reported items for 10 days before melting them. That is why a buyer may ask for your ID. Texas also does not charge sales tax on gold, silver, or numismatic coins or on gold and silver bullion.</p>"]
    ],
    faqs: [
      ["How many grams are in a troy ounce?", "One troy ounce equals 31.1034768 grams, usually rounded to 31.1035 grams."],
      ["How do I estimate the silver in my sterling?", "Multiply the weight of the silver parts in grams by 0.925, then divide by 31.1035 to get troy ounces of pure silver."],
      ["Are old U.S. coins silver?", "U.S. dimes, quarters, and half dollars dated 1964 and earlier are 90% silver. Kennedy half dollars dated 1965 through 1970 are 40% silver."],
      ["Why do buyers ask for ID in Texas?", "Texas law requires dealers that buy crafted precious metal to report each purchase with the seller’s name, physical description, and address."]
    ],
    sources: [
      ["Texas Occupations Code 1956.063, Form of report", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.063"],
      ["Texas Occupations Code 1956.064, Required retention of crafted precious metal", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.064"],
      ["Texas OCCC, Crafted Precious Metal Dealers", "https://occc.texas.gov/industry/cpmd/"],
      ["Texas Tax Code 151.336, Certain coins and precious metals", "https://statutes.capitol.texas.gov/Docs/TX/htm/TX.151.htm#151.336"],
      ["FTC Jewelry Guides, 16 CFR 23.5", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"],
      ["APMEX, History of 90% silver coins", "https://learn.apmex.com/learning-guide/history/the-history-of-90-precent-silver-coins/"]
    ],
    related: ["sell-silver-coins-houston", "sell-silver-bars-houston", "how-it-works"]
  },
  {
    path: "guides/x-ray-film-privacy-checklist",
    title: "Recycling Old X-Ray Film: Privacy Checklist for Clinics | AG Refining",
    description: "What HIPAA guidance says about disposing of film with patient information, and the questions a Houston clinic should ask any film recycler.",
    eyebrow: "Guide for clinics and labs",
    heading: "Recycling Old X-Ray Film: A Privacy Checklist for Houston Clinics",
    answer: "Old X-ray film contains recoverable silver, and it often carries patient names or images. HHS says HIPAA does not require one specific disposal method, but covered entities must use reasonable safeguards, train staff on disposal, and may not leave records where the public can reach them. If a vendor picks up and destroys records with patient information, HHS says the covered entity must have a business associate agreement with that vendor.",
    sections: [
      ["What HHS Says About Disposal", "<p>The HHS Office for Civil Rights explains that covered entities must apply reasonable administrative, technical, and physical safeguards to protected health information in any form, including when it is disposed of. HHS also says workforce members involved in disposal must be trained on the disposal policy, and records may not be left in dumpsters or containers the public can reach. The rules do not name one required method. Each organization decides what is reasonable for the type and amount of information.</p>"],
      ["When a Recycler Needs a Business Associate Agreement", "<p>HHS says a covered entity may hire a vendor to dispose of protected health information, and when it does, it must have a contract, usually called a business associate agreement, requiring the vendor to safeguard the information through disposal. Under the HIPAA breach notification rule, a business associate that discovers a breach must notify the covered entity without unreasonable delay and no later than 60 days after discovery.</p>"],
      ["Texas Adds Its Own Rules", "<p>Texas Health and Safety Code Chapter 181 defines a covered entity more broadly than HIPAA. It includes anyone who comes into possession of protected health information, and it requires covered entities to train employees on state and federal privacy law within 90 days of hire.</p>"],
      ["Questions To Ask Any Film Recycler", "<ul><li>Will you sign our business associate agreement before pickup?</li><li>How is the film secured from our office to your facility?</li><li>Who handles the film, and have they had privacy training?</li><li>How is the patient information destroyed, and how long does it take?</li><li>What written record do we receive afterward, and what does it list?</li><li>How will you tell us if something goes wrong?</li><li>How is the silver value measured and paid?</li></ul>"],
      ["A Note on “HIPAA Certified”", "<p>HHS has said it does not endorse or recognize private organizations’ HIPAA “certifications,” and that such certifications do not take away an organization’s own legal obligations. A signed agreement and a clear written process matter more than a badge.</p>"],
      ["Preparing Film for Pickup", "<ul><li>Separate film from paper charts if your policy allows.</li><li>Keep film in closed boxes in a locked room until pickup.</li><li>Count or weigh the boxes and write the total down.</li><li>Never send patient names, record numbers, or readable images through a website form or email to a recycler.</li></ul><p>To talk through a film cleanout in the Houston area, call AG Refining at (281) 898-2719. We will explain what we can review and what documentation is available for your project, and confirm it in writing before anything moves. This guide is general information, not legal advice.</p>"]
    ],
    faqs: [
      ["Does HIPAA require a specific way to destroy X-ray film?", "No. HHS says the Privacy and Security Rules do not require a particular disposal method, but covered entities must use reasonable safeguards and train staff involved in disposal."],
      ["Do we need a business associate agreement with a film recycler?", "HHS says that when a covered entity hires a vendor to dispose of protected health information, it must have a contract requiring the vendor to safeguard that information through disposal."],
      ["Is there an official HIPAA certification for recyclers?", "No. HHS has said it does not endorse or recognize private HIPAA certifications."],
      ["Does Texas have its own medical privacy rules?", "Yes. Texas Health and Safety Code Chapter 181 covers anyone who comes into possession of protected health information and requires employee privacy training within 90 days of hire."]
    ],
    sources: [
      ["HHS, What does HIPAA require when disposing of PHI?", "https://www.hhs.gov/hipaa/for-professionals/faq/575/what-does-hipaa-require-of-covered-entities-when-they-dispose-information/index.html"],
      ["HHS, Frequently Asked Questions About the Disposal of PHI (PDF)", "https://www.hhs.gov/sites/default/files/disposalfaqs.pdf"],
      ["45 CFR 164.410, Notification by a business associate", "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D/section-164.410"],
      ["HHS FAQ 2003, Security Rule certification", "https://www.hhs.gov/hipaa/for-professionals/faq/2003/are-we-required-to-certify-our-organizations-compliance-with-the-standards/index.html"],
      ["Texas Health and Safety Code Chapter 181", "https://statutes.capitol.texas.gov/Docs/HS/htm/HS.181.htm"]
    ],
    related: ["medical-x-ray-recycling", "x-ray-recycling-services-houston", "hospital-silver-recycling"]
  },
  {
    path: "guides/which-us-coins-are-silver",
    published: "2026-11-23",
    title: "Which U.S. Coins Are Silver? A Quick Date Guide | AG Refining",
    description: "A simple date guide to U.S. silver coins: 90% dimes, quarters, and halves, 40% Kennedy halves, and 35% wartime nickels, with sources.",
    eyebrow: "Guide for sellers",
    heading: "Which U.S. Coins Are Silver? A Quick Date Guide",
    answer: "U.S. dimes, quarters, and half dollars dated 1964 and earlier are 90% silver. Kennedy half dollars dated 1965 through 1970 are 40% silver. Jefferson nickels from late 1942 through 1945 with a large mint mark above Monticello are 35% silver. Circulating dimes, quarters, and half dollars made after those dates contain no silver.",
    sections: [
      ["The Quick Date Chart", "<ul><li><strong>Dimes dated 1964 and earlier:</strong> 90% silver.</li><li><strong>Quarters dated 1964 and earlier:</strong> 90% silver.</li><li><strong>Half dollars dated 1964 and earlier:</strong> 90% silver.</li><li><strong>Kennedy half dollars dated 1965 through 1970:</strong> 40% silver.</li><li><strong>Jefferson nickels from late 1942 through 1945 with a large P, D, or S above Monticello:</strong> 35% silver.</li><li><strong>Dimes and quarters dated 1965 and later, and half dollars dated 1971 and later:</strong> no silver.</li></ul>"],
      ["Why 1964 Is the Cutoff", "<p>The Coinage Act of 1965 replaced silver in dimes and quarters with a clad coin: copper-nickel faces bonded to a copper core. It kept some silver in the half dollar, with a cladding of 80% silver over a silver-copper core, for a coin that is 40% silver overall. Later law removed silver from circulating half dollars starting with the 1971 date.</p>"],
      ["The Copper Edge Test", "<p>Look at the edge of a dime, quarter, or half dollar. A clad coin shows a copper-colored stripe around the rim. A 90% silver coin has a solid silver-gray edge. The date is still the best check, because 40% half dollars also look silver on the edge.</p>"],
      ["Wartime Nickels", "<p>During World War II, Congress ordered nickel removed from the five-cent coin. From late 1942 through 1945, the Mint struck nickels from 56% copper, 35% silver, and 9% manganese. These coins carry a large P, D, or S mint mark above the dome of Monticello on the back. Some 1942 nickels were made the old way, so look for the large mint mark, not just the date.</p>"],
      ["Melt Value Versus Collector Value", "<p>Most worn silver coins sell for their silver content. Rare dates, uncirculated coins, and coins in sealed grading holders can be worth more to collectors. Do not clean coins. Cleaning can lower collector value and does not add silver.</p>"],
      ["Selling a Jar or a Roll", "<ul><li>Pull out coins by date using the chart above.</li><li>Keep 90%, 40%, and wartime nickels in separate bags.</li><li>Leave coins in any original rolls, folders, or holders.</li><li>Call before you visit and tell us roughly how many of each you have.</li></ul><p>AG Refining is at 9125 Airport Blvd., Suite B-1, Houston, TX 77061. Call (281) 898-2719.</p>"]
    ],
    faqs: [
      ["Are 1965 quarters silver?", "No. Circulating dimes and quarters dated 1965 and later are copper-nickel clad and contain no silver."],
      ["Are Kennedy half dollars silver?", "Kennedy halves dated 1964 are 90% silver, those dated 1965 through 1970 are 40% silver, and circulating halves dated 1971 and later contain no silver."],
      ["Which nickels contain silver?", "Jefferson nickels struck from late 1942 through 1945 with a large P, D, or S mint mark above Monticello are 35% silver."],
      ["Should I clean old coins before selling them?", "No. Cleaning can lower collector value and does not change the silver content."]
    ],
    sources: [
      ["Coinage Act of 1965, Public Law 89-81 (79 Stat. 254)", "https://www.govinfo.gov/content/pkg/STATUTE-79/pdf/STATUTE-79-Pg254.pdf"],
      ["31 U.S. Code 5112, Denominations, specifications, and design of coins", "https://www.law.cornell.edu/uscode/text/31/5112"],
      ["The National WWII Museum, US Money in World War II", "https://www.nationalww2museum.org/war/articles/united-states-money-in-world-war-ii"],
      ["APMEX, History of 90% silver coins", "https://learn.apmex.com/learning-guide/history/the-history-of-90-precent-silver-coins/"]
    ],
    related: ["sell-silver-coins-houston", "guides/how-silver-is-valued", "silver-buyer-hobby-airport"]
  },
  {
    path: "guides/id-to-sell-silver-texas",
    published: "2026-11-23",
    title: "What ID Do You Need To Sell Silver in Texas? | AG Refining",
    description: "What Texas law asks of silver buyers and sellers: the ID record, the seller list, the 10-day hold, and why coins and bars are treated differently.",
    eyebrow: "Guide for sellers",
    heading: "What ID Do You Need To Sell Silver in Texas?",
    answer: "Bring a government-issued photo ID. When a Texas dealer buys crafted precious metal, such as sterling flatware or jewelry, state law requires the dealer to record the seller’s driver’s license or Texas ID number, name, address, and a description of the items, and to report the purchase to local police. Sellers under 18 need written consent from a parent or guardian.",
    sections: [
      ["What the Law Covers", "<p>Texas Occupations Code Chapter 1956 regulates dealers that buy crafted precious metal. That means jewelry, silverware, art objects, and similar household items made wholly or partly of precious metal. The law specifically leaves out coins, bars, commemorative medallions, dental and medical items, and metal recovered from industrial waste. Those items fall outside this chapter’s reporting rules.</p>"],
      ["What the Dealer Must Record", "<ul><li>Your name and address.</li><li>A complete description of the items you are selling.</li><li>Your signed statement that the information is true and complete.</li><li>Your driver’s license number or Texas Department of Public Safety ID number, recorded when you show the card in person.</li><li>For the police report: the date, a description of the items, your name, physical description, and address, and the dealer’s name and address.</li></ul>"],
      ["Where the Report Goes", "<p>The dealer sends a copy of the list to the local chief of police, or to the county sheriff outside a city with a police department, within 48 hours. The dealer keeps a copy for three years. Peace officers can inspect purchased items during business hours.</p>"],
      ["Why Items Are Held Before Melting", "<p>A dealer may not melt, alter, or dispose of reported crafted precious metal before the 11th day after the report is filed, with a few exceptions. If an officer suspects an item is stolen, the officer can place it on hold for up to 60 days. This protects families whose heirlooms were stolen.</p>"],
      ["Selling for a Family Member or an Estate", "<p>The seller is the person who signs the list and shows ID. If you are selling for a parent or as part of an estate, bring your own ID and tell us the situation when you call. Sellers under 18 must bring a written statement from a parent or legal guardian consenting to the sale.</p>"],
      ["Registration and Taxes", "<p>Businesses that buy and sell crafted precious metal must register with the Texas Office of Consumer Credit Commissioner. Texas does not charge sales tax on gold, silver, or numismatic coins, or on gold and silver bullion.</p>"],
      ["What To Bring to AG Refining", "<p>Bring your silver as it is and a government-issued photo ID. If you only have an out-of-state license or a passport, call (281) 898-2719 first. We are at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, open Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM. This guide is general information, not legal advice.</p>"]
    ],
    faqs: [
      ["Do I need ID to sell silver in Texas?", "Yes, for crafted precious metal such as sterling flatware and jewelry. Texas law requires the dealer to record your driver’s license or Texas ID number. Bring a government-issued photo ID."],
      ["Why does the buyer write down my description?", "Texas law requires the dealer’s police report to include the seller’s name, physical description, and address."],
      ["Can a buyer melt my silver the same day?", "Generally no. Reported crafted precious metal may not be melted or disposed of before the 11th day after the report is filed, with limited exceptions."],
      ["Can a teenager sell silver?", "A dealer may not buy crafted precious metal from someone under 18 without a written statement from a parent or legal guardian consenting to the sale."]
    ],
    sources: [
      ["Texas Occupations Code 1956.051, Definitions", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.051"],
      ["Texas Occupations Code 1956.062, Report of purchase required", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.062"],
      ["Texas Occupations Code 1956.063, Form of report", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.063"],
      ["Texas Occupations Code 1956.064, Required retention", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.064"],
      ["Texas Occupations Code 1956.066, Purchase from minor", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.066"],
      ["Texas OCCC, Crafted Precious Metal Dealers", "https://occc.texas.gov/industry/cpmd/"],
      ["Texas Tax Code 151.336, Certain coins and precious metals", "https://statutes.capitol.texas.gov/Docs/TX/htm/TX.151.htm#151.336"]
    ],
    related: ["sell-estate-silver-houston", "guides/sterling-vs-silver-plate", "contact"]
  },
  {
    path: "guides/selling-silver-bars-and-rounds-houston",
    published: "2026-11-23",
    title: "Selling Silver Bars and Rounds in Houston | AG Refining",
    description: "How .999 fine silver bars and rounds differ from .925 sterling, what hallmarks and mint marks mean, and how weight, testing, and spot price affect a Houston payout.",
    eyebrow: "Guide for Sellers",
    heading: "Selling Silver Bars and Rounds in Houston: Fine Silver Versus Sterling",
    answer: "Most investment bars and rounds are marked .999 fine silver, meaning 99.9% pure silver. Sterling is at least 92.5% silver and is common on flatware and jewelry, not on investment bars. A bar or round is usually stamped with its weight, a fineness such as .999, and often a mint or maker’s name. Generic pieces may have fewer marks. Buyers pay on confirmed weight and purity against the current silver market, not on a screenshot of the spot price. AG Refining reviews qualifying bars and rounds in Houston near Hobby Airport. Please call before you visit.",
    sections: [
      ["Fine Silver Versus Sterling", "<p>The Federal Trade Commission’s Jewelry Guides say a piece should not be called “sterling” unless it is at least 925 parts per thousand pure silver, and should not be called “coin silver” unless it is at least 900 parts per thousand. When a number such as 999 is used, it should match the actual silver content in parts per thousand. That is what “.999 fine” means: 999 parts of silver in 1,000, or 99.9% pure silver.</p><p>Investment bars and rounds are usually made to that .999 standard. The United States Mint’s American Silver Eagle bullion coin is struck from one troy ounce of .999 fine silver. COMEX silver futures also specify refined silver of at least 999 fineness. Sterling, by contrast, is the usual standard for much household silverware and jewelry. It is valuable, but it is not the same alloy as a one-ounce investment bar.</p><p>Some bars are marked .9999 (99.99% silver). That is a slightly higher fineness. The difference in pure silver per ounce is small; the buyer still confirms the mark, the weight, and the metal before making an offer.</p>"],
      ["Hallmarks, Mints, and Generic Rounds", "<p>Turn the bar or round over and read the stamps under good light.</p><ul><li><strong>Weight:</strong> often 1 oz, 5 oz, 10 oz, 1 kilogram, or another stated troy weight. A troy ounce is 31.1034768 grams, the same unit used for the silver market price.</li><li><strong>Fineness:</strong> .999, .9999, or words such as “fine silver.”</li><li><strong>Mint or maker:</strong> a recognized mint or refiner name, a logo, or a serial number. U.S. Mint Silver Eagles also carry a year and a mint mark on current bullion issues.</li><li><strong>Generic or privately poured pieces:</strong> some rounds and poured bars have only a weight and a fineness, or marks that are worn or unofficial. Those can still contain silver, but they need a closer look.</li></ul><p>Leave pieces in any original assay card, plastic, or box. Do not polish them or try to recut a worn stamp. A missing or odd mark does not automatically mean the piece is worthless, and a clear mark is not a substitute for a weight and metal check.</p>"],
      ["How Weight and Testing Work", "<p>Precious metals are weighed in troy ounces, not the ounces on a kitchen scale. A bar marked “1 oz” should be close to 31.1035 grams. Larger bars are the stated troy weight times that number. Hollow or filled pieces are uncommon in investment bars, but they appear on some decorative sterling, so the buyer weighs the actual metal, not the label alone.</p><p>Offers are based on confirmed weight and purity. When a mark is clear and the weight matches, testing may be brief. When a piece is generic, damaged, or the stamp is hard to read, the buyer may test it before quoting. AG Refining inspects, weighs, and tests bars when needed, and explains how the value was reached. You can see the weight before payment.</p><p>If you have a mixed lot of bars, rounds, and coins, keep them grouped and tell us what you have when you call. Date-dated U.S. coins are covered in our <a href=\"/guides/which-us-coins-are-silver\">U.S. silver coin date guide</a>.</p>"],
      ["Spot Price Versus Payout", "<p>The spot price is the current market price for a troy ounce of fine silver. It moves through the trading day. Melt value is that price times the pure silver in your bars or rounds, as explained in our <a href=\"/guides/how-silver-is-valued\">guide to how silver is valued</a>.</p><p>A payout is normally below full melt. The buyer has to confirm the metal, handle and refine it, and carry the market risk until it is sold. A printed spot price or an online calculator is a snapshot, not an offer. A fair buyer will tell you the confirmed weight, the purity used in the math, and how they reached the number. At AG Refining, offers are based on the confirmed material, weight, recoverable silver, and current silver market values. There is no pressure to sell.</p><p>Texas treats most bars and bullion differently from crafted household silver. Occupations Code Chapter 1956’s reporting rules for crafted precious metal specifically leave out coins, bars, and commemorative medallions. Even so, please bring a government-issued photo ID and call if you have questions about what to bring. See <a href=\"/guides/id-to-sell-silver-texas\">what ID you need to sell silver in Texas</a>.</p>"],
      ["Visiting AG Refining Near Hobby Airport", "<p>AG Refining is at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, near Hobby Airport. Hours are Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM, closed Sunday. Please call (281) 898-2719 before you visit or ship anything, and tell us the bar or round sizes and the approximate total weight. For larger holdings we can discuss an on-site evaluation instead of you moving the silver. Service is available in English and Spanish.</p><p>Tarnished, scratched, or unpackaged bars can still be reviewed on their silver content. Bring the full lot as it is.</p>"]
    ],
    faqs: [
      ["Is a .999 bar the same as sterling?", "No. .999 fine is 99.9% silver. Sterling is at least 92.5% silver and is the usual standard for flatware and much jewelry."],
      ["Do generic rounds have value?", "They can, if they are confirmed as silver and the weight is real. Fewer marks means the buyer will rely more on weighing and testing."],
      ["Will I be paid the spot price I saw online?", "The spot price is the market reference, not the payout. Offers are based on confirmed weight and purity, and they are normally below full melt because of testing, refining, and handling."],
      ["Can I sell one bar?", "Yes. AG Refining reviews a single qualifying bar or a larger lot. Call before you visit."]
    ],
    sources: [
      ["FTC Jewelry Guides, 16 CFR 23.5", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"],
      ["U.S. Mint, American Eagle Silver Bullion Coins", "https://www.usmint.gov/coins/coin-medal-programs/american-eagle/silver-bullion"],
      ["CME Group, Silver futures contract specifications", "https://www.cmegroup.com/markets/metals/precious/silver.contractSpecs.html"],
      ["Texas Occupations Code 1956.051, Definitions", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.051"]
    ],
    related: ["sell-silver-bars-houston", "guides/how-silver-is-valued", "silver-buyer-hobby-airport"]
  },
  {
    path: "guides/commercial-dental-industrial-silver-houston",
    published: "2026-11-23",
    title: "Commercial, Dental, and Industrial Silver in Houston | AG Refining",
    description: "How Houston dental offices, watch shops, and industrial or medical accounts can sell silver-bearing scrap and X-ray film, with clear privacy handling and free qualifying pickup.",
    eyebrow: "Guide for Businesses",
    heading: "Selling Commercial, Dental, and Industrial Silver in Houston",
    answer: "AG Refining reviews qualifying commercial silver from dental offices and labs, watch repair shops, medical and industrial imaging programs, and other Houston businesses. That can include dental scrap, silver oxide watch batteries, medical and dental X-ray film, industrial NDT film, and other silver-bearing scrap. Free pickup and on-site weighing are available for qualifying commercial accounts. Because medical and dental film can carry patient information, we confirm handling and documentation in writing before anything moves. Please do not send patient names, record numbers, or readable images through this website or by email. Service is available in English and Spanish.",
    sections: [
      ["What Qualifying Businesses Often Bring", "<p>Commercial lots are usually recurring or accumulated scrap, not a single household drawer. Typical sources include:</p><ul><li>Dental offices and dental laboratories</li><li>Watch repair and jewelry shops with silver oxide batteries or bench scrap</li><li>Hospitals, clinics, and imaging centers with stored X-ray film</li><li>Industrial and NDT (nondestructive testing) programs with radiographic film</li><li>Manufacturers, labs, and other businesses with silver-bearing parts, contacts, solder, or flake</li></ul><p>Tell us the material type, the approximate weight or box count, where it is stored, and whether pickup or an in-shop drop-off is easier. Nothing is scheduled until the material and the next step are confirmed.</p>"],
      ["Dental Offices and Labs", "<p>Dental scrap can include crowns, bridges, inlays, filings, grinding waste, and other bench material that may contain silver or other precious metals. Keep lots separated if you already know what they are, and leave them as they came from the operatory or lab. Do not send patient names or chart numbers with the material or in an email.</p><p>Texas Occupations Code Chapter 1956 regulates dealers that buy crafted precious metal such as jewelry and silverware. That chapter specifically leaves out dental and medical items, and metal recovered from industrial waste, as well as coins and bars. Other business and privacy rules can still apply, so we confirm the handling for your account in writing before pickup.</p>"],
      ["Watch Repair and Silver Oxide Batteries", "<p>Silver oxide button cells are widely used in watches and similar small devices. AG Refining reviews qualifying silver oxide watch batteries from watch shops and other businesses. Keep them in a closed container, dry, and separate from alkaline household batteries if you already sort them. Do not crush or open the cells.</p><p>If you also have sterling bench scrap, findings, or other shop silver, mention that when you call so we can review the lot together.</p>"],
      ["Medical and Dental X-Ray Film, and Industrial NDT Film", "<p>Older radiographic film contains recoverable silver. That is true of medical film, dental film, and industrial NDT film. Film packets and envelopes can also carry names, dates, or images, so treat stored film as a privacy matter, not only as scrap.</p><p>Our separate <a href=\"/guides/x-ray-film-privacy-checklist\">X-ray film privacy checklist</a> walks through what the U.S. Department of Health and Human Services says about disposal safeguards, written vendor agreements, and the questions a clinic should ask any recycler. We do not offer a blanket compliance guarantee, and HHS has said it does not recognize private organizations’ certifications of those rules. A signed agreement, when your policy requires one, and a clear written process matter more than a badge.</p><p>Please do not email or upload patient names, record numbers, or readable images to get a quote. Describe the film type and the number of boxes or the approximate weight instead.</p>"],
      ["How Privacy and Chain of Custody Work", "<p>For any lot that may include patient information:</p><ul><li>Confirm with your records or compliance officer that the material is cleared to leave the facility.</li><li>Keep film in closed boxes in a secured area until pickup.</li><li>Count or weigh the boxes and write the total down.</li><li>Ask us, in writing, how the material will travel, who will handle it, what record you will receive, and how we will contact you if something is off.</li><li>Never place labels or film with readable names in a photo you send us.</li></ul><p>We confirm in writing, before pickup, which documentation we can provide for your project, such as a written description of how the material will be handled. Until that is agreed, nothing moves.</p><p>Industrial film and non-patient scrap still deserve a clear handoff: material type, box or weight count, pickup location, and a contact on site.</p>"],
      ["Pickup, Weighing, and How to Start", "<p>Free pickup and on-site weighing are available for qualifying commercial accounts, depending on the material, location, account, and schedule. After we confirm the lot, we set the evaluation, pickup or drop-off, and timing with you. Offers are based on the confirmed material, weight, recoverable silver, and current silver market values. You decide after we explain the offer.</p><p>AG Refining is at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, near Hobby Airport, Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM, closed Sunday. Call (281) 898-2719 or use the <a href=\"/contact\">contact form</a> to describe what you have. Hablamos español. Service is available in English and Spanish.</p>"]
    ],
    faqs: [
      ["Do you offer pickup for a dental office or shop?", "Free pickup and on-site weighing are available for qualifying commercial accounts. Call or write with the material type, approximate amount, and address, and we will confirm whether the lot qualifies."],
      ["Can we email a photo of X-ray envelopes to get a quote?", "Please do not. Describe the film type and quantity instead, and make sure no patient names or record numbers are visible."],
      ["Do you buy silver oxide watch batteries?", "Yes. We review qualifying silver oxide watch batteries, including lots from watch repair shops. Keep them dry and in a closed container."],
      ["Is this the same process as selling household sterling?", "The weighing and market-based offer are similar, but commercial lots are often larger, may need pickup, and film lots need a privacy discussion before anything is moved. Household sterling is covered in our sterling marks guide."]
    ],
    sources: [
      ["HHS, What does HIPAA require of covered entities when they dispose of protected health information?", "https://www.hhs.gov/hipaa/for-professionals/faq/575/what-does-hipaa-require-of-covered-entities-when-they-dispose-information/index.html"],
      ["HHS, Are we required to “certify” our organization’s compliance with the HIPAA standards?", "https://www.hhs.gov/hipaa/for-professionals/faq/2003/are-we-required-to-certify-our-organizations-compliance-with-the-standards/index.html"],
      ["Texas Occupations Code 1956.051, Definitions", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.051"]
    ],
    related: ["dental-scrap-buyer-houston", "guides/x-ray-film-privacy-checklist", "silver-oxide-watch-battery-recycling-houston"]
  },
  {
    path: "guides/inherited-sterling-flatware-tea-sets-houston",
    published: "2026-11-25",
    title: "Selling Inherited Sterling Flatware and Tea Sets in Houston | AG Refining",
    description: "How to tell if inherited flatware, tea sets, and candlesticks are solid sterling, weighted, or plated, and how AG Refining weighs estate silver near Hobby Airport.",
    eyebrow: "Guide for Sellers",
    heading: "Selling Inherited Sterling Flatware and Tea Sets in Houston: Weighted and Hollow Pieces",
    answer: "Not every piece in an inherited silver chest or tea set is solid silver. Under federal rules, items stamped “Sterling” or “925” must be at least 92.5% silver, while pieces marked “EP,” “EPNS,” or “silver plate” carry only a thin silver coating over a base metal. Even genuine sterling sets often include weighted candlesticks, bowls with non-silver filler, and hollow-handle knives with stainless steel blades. AG Refining sorts and weighs estate flatware and tea sets in Southeast Houston near Hobby Airport so you know what is silver before you sell.",
    sections: [
      ["Sterling Flatware, Tea Sets, and Silver Plate", "<p>Inherited silver chests and estate dining sets often mix solid sterling, older coin silver, and silver-plated pieces. Under the Federal Trade Commission’s Jewelry Guides, an item should not be called “sterling” or stamped “925” unless it is at least 925 parts per thousand pure silver, and “coin silver” means at least 900 parts per thousand. The National Stamping Act also prohibits stamping silver-plated pieces with the word “sterling” or “coin.”</p><ul><li><strong>Solid sterling flatware and hollowware:</strong> spoons, forks, trays, bowls, and tea sets stamped <em>Sterling</em>, <em>Ster.</em>, or <em>925</em>.</li><li><strong>Silver plate:</strong> items marked <em>EP</em>, <em>EPNS</em>, <em>Silver Plate</em>, or <em>Quadruple Plate</em>, which have a thin silver surface layer over brass, copper, or nickel alloy.</li><li><strong>Unmarked or worn pieces:</strong> tarnish looks similar on both sterling and plate, so check the underside of teapots and the back of handles under good light.</li></ul><p>If your drawer has mixed marks, our <a href=\"/guides/sterling-vs-silver-plate\">sterling versus silver plate guide</a> walks through common stamps.</p>"],
      ["Weighted Candlesticks, Bowls, and Hollow-Handle Knives", "<p>Scale weight on a kitchen scale does not always equal recoverable silver weight. Several classic sterling pieces are built with non-silver materials inside:</p><ul><li><strong>Weighted or reinforced pieces:</strong> candlesticks, salt and pepper shakers, compotes, and some trophy bowls stamped <em>Sterling Weighted</em> or <em>Weighted and Reinforced</em> use a thin outer sterling shell filled with pitch, plaster, cement, or a support rod so they stay upright.</li><li><strong>Hollow-handle table knives:</strong> dinner knives, butter spreaders, and carving pieces usually have a sterling handle shell packed with filler around a stainless steel tang and blade.</li><li><strong>Tea set handles and hinges:</strong> sterling teapots and coffee pots are hollow inside, and some handles use non-silver heat insulators or solder at joints.</li></ul><p>The Appendix to the FTC Jewelry Guides lists knife blades and metallic parts encased in nonmetallic coverings as recognized exemptions in silver assays. When you sell weighted or hollow-handle items, a buyer pays for the recoverable silver shell, not the steel blade or cement core.</p>"],
      ["What Not To Do Before Visiting a Buyer", "<p>Keep inherited sets simple to evaluate by bringing them as you found them:</p><ul><li><strong>Do not polish or dip old silver:</strong> tarnish does not reduce silver content, and abrasive polishing adds unnecessary work.</li><li><strong>Do not pry apart weighted bases or knife handles:</strong> cement cores and steel tangs can break cleanly only with shop tools and can create sharp edges.</li><li><strong>Leave pieces in their chests or rolls:</strong> if you already know which items are plated, you can bag them separately, or bring the full box so we can sort it with you.</li></ul><p>See our <a href=\"/sell-estate-silver-houston\">estate silver overview</a> if you are handling a larger family collection.</p>"],
      ["Selling Estate Silver Near Hobby Airport", "<p>AG Refining is located at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, near Hobby Airport about half a mile west of I-45. Hours are Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM, closed Sunday. Service is available in English and Spanish.</p><p>Please call (281) 898-2719 or use our <a href=\"/contact?intent=pickup\">Get Paid form</a> before visiting and tell us what stamps you see and roughly how many pieces you have. Texas law requires dealers buying crafted precious metal to record seller details from a valid government-issued photo ID. See our <a href=\"/guides/id-to-sell-silver-texas\">Texas ID guide</a> before you drive in.</p>"]
    ],
    faqs: [
      ["What does “Sterling Weighted” mean on candlesticks or bowls?", "It means the outer shell is sterling silver, while the base or stem is filled with pitch, plaster, or cement for stability. Buyers value the silver shell rather than the filler weight."],
      ["Are sterling silver knife blades made of silver?", "Most dinner and butter knives with sterling handles have stainless steel blades and filler inside the handle. Some solid fruit knives or butter picks are all sterling, so a buyer checks the blade and stamps separately."],
      ["Can I sell a partial set of inherited flatware or mismatched spoons?", "Yes. AG Refining reviews complete sets, partial sets, monogrammed pieces, and single serving spoons."],
      ["Should I polish or disassemble an inherited tea set first?", "No. Tarnish does not lower silver value, and buyers do not need you to remove blades or weighted cores before bringing pieces in."]
    ],
    sources: [
      ["FTC Jewelry Guides, 16 CFR 23.5, Misrepresentation as to silver content", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"],
      ["FTC Jewelry Guides, Appendix to Part 23, Assay exemptions", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/appendix-Appendix%20to%20Part%2023"],
      ["National Stamping Act, 15 U.S.C. 297", "https://www.law.cornell.edu/uscode/text/15/297"],
      ["Texas Occupations Code 1956.063, Form of report", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.063"]
    ],
    related: ["silver-flatware-buyer-houston", "guides/sterling-vs-silver-plate", "silver-buyer-hobby-airport", "contact"]
  },
  {
    path: "guides/how-silver-buyers-price-scrap-houston",
    published: "2026-11-25",
    title: "How Silver Buyers Price Scrap in Houston | AG Refining",
    description: "How daily silver market prices are set, why scrap offers differ from the headline spot price, and what to check before accepting an offer in Southeast Houston.",
    eyebrow: "Guide for Sellers",
    heading: "How Silver Buyers Price Scrap in Houston: Daily Spot Prices, Purity, and Offers",
    answer: "Silver buyers base scrap offers on two things: the live silver market price per troy ounce (31.1035 grams) and the confirmed pure silver in your lot. Global reference markets such as the daily LBMA Silver Price auction and COMEX silver futures move during trading hours. A scrap payout is normally below the headline spot price because buyers cover testing, refining into .999 silver, non-silver weight deductions, and market risk. At AG Refining near Hobby Airport, we weigh your material in view and explain how the offer is calculated before you decide.",
    sections: [
      ["How Daily Silver Prices Are Set", "<p>Precious metals trade worldwide in troy ounces rather than standard kitchen ounces. One troy ounce equals 31.1034768 grams, while an avoirdupois kitchen ounce is about 28.35 grams. When you look up a live silver price online, that quote refers to one troy ounce of refined silver.</p><ul><li><strong>LBMA Silver Price:</strong> administered by ICE Benchmark Administration, a daily electronic auction at 12:00 London time sets a widely referenced U.S. dollar benchmark for unallocated London silver.</li><li><strong>COMEX silver futures and spot feeds:</strong> CME Group silver contracts represent 5,000 troy ounces of refined silver at .999 minimum fineness, and live spot prices update through business trading hours.</li></ul><p>Because silver trades continuously on business days, an online chart is a moving reference, not a locked retail offer. See our <a href=\"/guides/how-silver-is-valued\">silver valuation formula guide</a> for the troy ounce math.</p>"],
      ["Why Scrap Silver Offers Differ from Spot Price", "<p>Even when two lots have the same total weight on a scale, their payouts differ based on what a buyer has to do to recover pure silver:</p><ul><li><strong>Purity and alloy form:</strong> bullion bars marked .999 fine are already refined, whereas .925 sterling flatware, .900 coin silver, dental scrap, and industrial contacts must be tested, melted, and refined back to .999 silver.</li><li><strong>Refining, assay, and handling costs:</strong> processing fees, shipping, and hedging against market swings while metal moves through refining come out of the spread below melt value.</li><li><strong>Non-silver weight and solder tolerances:</strong> under the National Stamping Act, sterling articles containing solder carry wider alloy tolerances than solderless pieces, and weighted candlesticks or hollow-handle knives contain filler or steel that is excluded from silver weight.</li><li><strong>Texas statutory hold period:</strong> under Texas Occupations Code 1956.064, dealers buying reported crafted precious metal generally must hold items until at least the 11th day after filing the purchase report before melting or disposing of them, exposing the buyer to price movement during that hold.</li></ul>"],
      ["What To Check Before You Accept an Offer", "<p>Whether you visit a local buyer near Hobby Airport or compare mail-in options, verify a few basics before handing over your silver:</p><ul><li><strong>Visible weighing:</strong> ask to see the scale readout in grams or troy ounces and confirm how sterling, coin silver, and plated items are separated.</li><li><strong>Clear purity explanation:</strong> ask how hallmarks were verified or tested and whether non-silver blades, stones, or filler were deducted.</li><li><strong>Mail-in safeguards:</strong> before mailing silver anywhere, confirm in writing how parcels are logged, how long you have to decline an offer, and who pays return shipping if you say no.</li><li><strong>Written receipt:</strong> confirm the itemized weights, payout terms, and payment timing before finalizing the sale.</li></ul><p>Have a question about a drawer of scrap or estate silver? Call (281) 898-2719 or submit details through our <a href=\"/contact?intent=pickup\">Get Paid form</a> before coming in.</p>"],
      ["How AG Refining Evaluates Scrap Silver in Southeast Houston", "<p>AG Refining is located at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, near Hobby Airport. We are open Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM, closed Sunday. Service is available in English and Spanish.</p><p>We inspect markings, test pieces when needed, and weigh qualifying material where you can see the scale. Offers depend on confirmed material, weight, recoverable silver, and current silver market values, with no pressure to sell. Bring a government-issued photo ID as required for Texas crafted precious metal purchases, and review our <a href=\"/scrap-silver-buyer-houston\">scrap silver page</a> or <a href=\"/guides/inherited-sterling-flatware-tea-sets-houston\">inherited sterling guide</a> before visiting.</p>"]
    ],
    faqs: [
      ["What time do silver prices change each day?", "Live silver spot and futures markets update throughout business trading hours, while the LBMA Silver Price benchmark is set by a daily electronic auction at 12:00 London time."],
      ["Why do silver buyers pay below the online spot price for scrap?", "Spot price reflects refined .999 silver in institutional markets. Scrap silver must be sorted, tested, held under state rules where applicable, and refined, so buyers deduct processing costs and market risk."],
      ["Does soldered or tarnished sterling sell for less?", "Tarnish does not lower the silver content. Heavy solder joints, non-silver cores, and steel knife blades contain non-silver weight that is excluded from the silver payout."],
      ["Should I mail my scrap silver or bring it to a local Houston buyer?", "Visiting a local buyer lets you watch the sorting and weighing in person and decide on the offer before leaving your silver. If you ever use mail-in service, get written terms for holds and return shipping first."]
    ],
    sources: [
      ["ICE Benchmark Administration, LBMA Silver Price", "https://developer.ice.com/fixed-income-data-services/catalog/lbma-silver-price"],
      ["CME Group, Silver futures contract specifications", "https://www.cmegroup.com/markets/metals/precious/silver.contractSpecs.html"],
      ["FTC Jewelry Guides, 16 CFR 23.5, Misrepresentation as to silver content", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"],
      ["Texas Occupations Code 1956.064, Required retention of crafted precious metal", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.064"]
    ],
    related: ["scrap-silver-buyer-houston", "guides/how-silver-is-valued", "guides/inherited-sterling-flatware-tea-sets-houston", "contact"]
  },
  {
    path: "guides/selling-silver-refiner-vs-pawn-shop-vs-online",
    published: "2026-11-25",
    title: "Selling Silver to a Refiner vs. a Pawn Shop vs. Online | AG Refining",
    description: "How selling silver to a refiner or precious metal buyer compares with a pawn shop or an online mail-in buyer, and the questions to ask before you sell.",
    eyebrow: "Guide for Sellers",
    heading: "Selling Silver to a Refiner vs. a Pawn Shop vs. Online",
    answer: "A refiner or precious metal buyer pays for the silver in your items, based on weight, purity, and the current silver market. A pawn shop can buy an item outright or make a pawn loan, and a pawn loan is not a sale: in Texas you can get the item back by repaying the loan and charges, and unredeemed items can be forfeited after a grace period of at least 30 days past the maturity date. Online and mail-in buyers can be convenient, but your silver leaves your hands before you see the final offer. The right choice depends on whether you want to sell or borrow, and whether your items are worth more than their silver.",
    sections: [
      ["How Each Option Works", "<ul><li><strong>Refiner or precious metal buyer:</strong> the buyer identifies the silver, weighs it, and makes an offer based on the recoverable silver and the current market. The items are usually melted and refined, so the offer is about metal content, not the item as a product.</li><li><strong>Pawn shop, outright sale:</strong> the shop buys the item and owns it. A pawn shop may resell the item as it is, so ask how the offer was set.</li><li><strong>Pawn shop, pawn loan:</strong> the shop holds your item as collateral for a short-term loan. You get cash now, and you get the item back only if you repay the loan and the pawn service charge.</li><li><strong>Online or mail-in buyer:</strong> you ship your silver, the buyer checks it, and then you get an offer or a payment. You do not see the weighing or testing in person.</li></ul>"],
      ["When a Refiner or Precious Metal Buyer Makes Sense", "<p>A buyer that pays for metal content is a good fit for items whose value is mostly the silver itself:</p><ul><li>Sterling flatware, tea sets, and serving pieces marked 925 or Sterling</li><li>Broken or out-of-style silver jewelry and bench scrap</li><li>Pre-1965 U.S. dimes, quarters, and half dollars in circulated condition</li><li>Business material such as silver solder, contacts, lab silver, X-ray film, and silver oxide batteries</li></ul><p>Ask to watch the weighing, ask how purity was confirmed, and ask how non-silver parts such as knife blades, weighted bases, or stones are handled. See <a href=\"/guides/how-silver-buyers-price-scrap-houston\">how silver buyers price scrap</a> for the details.</p>"],
      ["When a Pawn Shop Makes Sense", "<p>A pawn loan can make sense when you need short-term cash and want to keep the item. In Texas, the pawn ticket must show the amount financed, the finance charge, the total of payments, the annual percentage rate, and the maturity date, along with a statement that you are not required to redeem the item. The maturity date can be no more than one month after the loan, and the last day of grace is at least 30 days after the maturity date. If you do not redeem the item by then, the pawnbroker may take it into inventory.</p><p>If you do not want the item back, compare an outright pawn shop offer with an offer based on the silver content before you decide.</p>"],
      ["When Selling Online or by Mail Makes Sense", "<p>Mail-in and online buyers can help when no local buyer handles your type of item. Before you ship anything, get these answers in writing:</p><ul><li>The buyer's physical business address and how long it has operated</li><li>Whether shipping is insured, and who pays for it</li><li>How long you have to accept or decline the offer, and what happens if you do not answer</li><li>Who pays return shipping if you say no</li><li>When and how you will be paid</li></ul><p>Take photos and note the weight of each item before you pack it.</p>"],
      ["Items That May Be Worth More Than Their Silver", "<p>Some items are worth more to collectors than their silver content, such as rare or high-grade coins, signed antique silver, or pieces by well-known makers. Before selling those for metal value, consider asking a coin dealer, an antiques specialist, or an appraiser what you have. A metal buyer should tell you if an item looks like it deserves a second look.</p>"],
      ["Questions To Ask Any Silver Buyer", "<ul><li>Can I watch you weigh the silver, and in what units?</li><li>How did you confirm the purity?</li><li>What weight was left out, and why?</li><li>Is the offer in writing, and how long is it good for?</li><li>When and how will I be paid?</li></ul><p>Bring a government-issued photo ID. Texas law requires dealers that buy crafted precious metal to record the seller's name, physical description, and address. Read more in our <a href=\"/guides/id-to-sell-silver-texas\">guide to ID for selling silver in Texas</a>.</p>"],
      ["How AG Refining Works", "<p>AG Refining is a silver buyer at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, near Hobby Airport. We review the silver, weigh it where you can see the scale, and explain the offer before you decide, with no pressure to sell. Hours are Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM, closed Sunday. Call (281) 898-2719 before you visit. Hablamos español.</p>"]
    ],
    faqs: [
      ["Is a pawn loan the same as selling my silver?", "No. A pawn loan uses your item as collateral. You can redeem it by repaying the loan and charges by the last day of grace. If you do not, the pawnbroker may keep the item."],
      ["How long does a Texas pawn shop hold an item I do not redeem?", "Texas law requires the pawnbroker to hold pledged goods for at least 30 days after the maturity date on the pawn ticket. After that, the goods may be forfeited to the pawnbroker."],
      ["Is it safe to mail silver to an online buyer?", "It can be, if you confirm the buyer's physical address, insured shipping, how long you have to decline an offer, and who pays return shipping. Get those terms in writing before you ship."],
      ["Should I sell rare coins for their silver value?", "Not before you check. Some coins and antique pieces are worth more to collectors than their silver. Ask a coin dealer or appraiser first."]
    ],
    sources: [
      ["Texas Finance Code 371.157, Pawn ticket", "https://statutes.capitol.texas.gov/Docs/FI/htm/FI.371.htm#371.157"],
      ["Texas Finance Code 371.169, Unredeemed pledged goods; forfeiture", "https://statutes.capitol.texas.gov/Docs/FI/htm/FI.371.htm#371.169"],
      ["7 Texas Administrative Code 85.405, Pawn transaction", "https://www.law.cornell.edu/regulations/texas/7-Tex-Admin-Code-SS-85-405"],
      ["Texas Occupations Code 1956.063, Records of crafted precious metal purchases", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.063"],
      ["FTC Jewelry Guides, 16 CFR 23.5, Misrepresentation as to silver content", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"]
    ],
    related: ["guides/how-silver-buyers-price-scrap-houston", "guides/how-silver-is-valued", "guides/id-to-sell-silver-texas", "contact"]
  }
];

// Pages that need Dennis's written confirmation before they go live.
export const pendingPages = [
  {
    path: "sell-estate-silver-houston",
    pending: false,
    title: "Sell Estate and Antique Silver in Houston | AG Refining",
    description: "Inherited sterling, tea sets, or a drawer of family silver? AG Refining reviews estate and antique silver in Houston. Call before you visit.",
    eyebrow: "Estate and antique silver",
    heading: "Sell Estate and Antique Silver in Houston",
    answer: "If you inherited sterling flatware, a tea set, serving pieces, or a box of family silver, AG Refining can review it. Call (281) 898-2719 first and describe what you have. Please do not polish, take apart, or sort every piece before calling.",
    sections: [
      ["What We Review", "<ul><li>Sterling flatware, complete or partial sets</li><li>Serving pieces, trays, bowls, and tea sets</li><li>Coin silver spoons and older American pieces</li><li>Silver coins and small coin collections</li><li>Mixed drawers where sterling and plate are together</li></ul>"],
      ["For Families Handling an Estate", "<p>Many calls come from adult children or estate helpers who are not sure what they have. That is fine. Tell us what the marks say, roughly how many pieces there are, and whether anything is monogrammed or boxed. We will tell you the next step.</p>"],
      ["What To Bring", "<p>Bring the silver as it is and a government-issued photo ID. Texas law requires dealers that buy crafted precious metal to record the seller’s name, physical description, and address.</p>"],
      ["Where We Are", "<p>9125 Airport Blvd., Suite B-1, Houston, TX 77061, near Hobby Airport. Monday through Friday 9:00 AM to 5:00 PM, Saturday 9:00 AM to 12:00 PM, closed Sunday. Please call before you visit. Hablamos español.</p>"]
    ],
    faqs: [
      ["Can I sell a partial set of family silverware?", "Yes. Qualifying sterling and flatware can be reviewed as a complete set or as leftover pieces."],
      ["Should I polish antique silver before selling it?", "No. Bring it as it is."],
      ["Do you buy silver plate?", "Silver plate has only a thin layer of silver. We can review a plated lot and tell you whether it has recoverable value, but we cannot promise to buy it."]
    ],
    sources: [["FTC Jewelry Guides, 16 CFR 23.5", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"], ["Texas Occupations Code 1956.063", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.063"]],
    related: ["silver-flatware-buyer-houston", "guides/sterling-vs-silver-plate", "sell-silver-coins-houston"]
  },
  {
    path: "x-ray-film-privacy-process",
    pending: true,
    title: "X-Ray Film Recycling and Privacy Process | AG Refining Houston",
    description: "How AG Refining handles X-ray film pickups for Houston clinics, hospitals, and imaging centers, and what documentation to confirm before pickup.",
    eyebrow: "X-ray film and patient privacy",
    heading: "X-Ray Film Recycling With a Clear Privacy Process",
    answer: "AG Refining reviews qualifying medical, dental, and industrial X-ray film for silver recovery in the Houston area. Because medical film can carry patient information, we confirm the handling and documentation for your project in writing before anything moves.",
    confirmable: [
      ["signsBusinessAssociateAgreement", "We sign your business associate agreement before pickup."],
      ["lockedSealedTransport", "Film travels in closed, sealed containers from your facility to ours."],
      ["chainOfCustodyLog", "We record box counts or weights at pickup and again at processing."],
      ["workforcePrivacyTraining", "Everyone who handles film has completed privacy training."],
      ["issuesCertificateOfDestruction", "You receive a written certificate after the film is processed."],
      ["hasEpaIdNumber", "AG Refining holds an EPA identification number for regulated recycling activity."]
    ],
    sections: [
      ["Before Anything Moves", "<p>Tell us the film type, the approximate number of boxes or pounds, where it is stored, and whether your records officer has cleared it for destruction. Never send patient names, record numbers, or readable images through this website or by email.</p>"],
      ["Your Organization’s Responsibilities", "<p>HHS says covered entities decide what disposal safeguards are reasonable for them, must train staff involved in disposal, and need a business associate agreement with any vendor that picks up and destroys protected health information. We do not offer a blanket compliance guarantee, and HHS does not recognize private HIPAA certifications.</p>"]
    ],
    faqs: [
      ["Is your service HIPAA compliant?", "HIPAA compliance depends on your organization’s policies and the agreement between us. Tell us what your policy requires and we will confirm in writing what we can provide before pickup."],
      ["Do you provide a certificate of destruction?", "Ask us about documentation for your project. We confirm what will be provided in writing before pickup."],
      ["Can I upload patient X-rays to get a quote?", "No. Describe the film type and quantity instead."]
    ],
    sources: [["HHS, Disposal of PHI FAQ", "https://www.hhs.gov/hipaa/for-professionals/faq/575/what-does-hipaa-require-of-covered-entities-when-they-dispose-information/index.html"], ["HHS FAQ 2003, certification", "https://www.hhs.gov/hipaa/for-professionals/faq/2003/are-we-required-to-certify-our-organizations-compliance-with-the-standards/index.html"]],
    related: ["medical-x-ray-recycling", "guides/x-ray-film-privacy-checklist", "dental-scrap-buyer-houston"]
  },
  {
    path: "gold-buyer-houston",
    pending: true,
    title: "Gold Buyer in Houston Near Hobby Airport | AG Refining",
    description: "AG Refining buys qualifying gold in Houston near Hobby Airport. Call before you visit so we can confirm what you have.",
    eyebrow: "Gold",
    heading: "Gold Buyer in Houston, Near Hobby Airport",
    answer: "AG Refining reviews qualifying gold at 9125 Airport Blvd., Suite B-1, Houston, TX 77061. Call (281) 898-2719 before you visit and tell us what you have.",
    confirmable: [
      ["buysGoldJewelryAndScrapGold", "We buy gold jewelry, broken chains, class rings, and other scrap gold."],
      ["buysGoldCoinsAndBars", "We buy gold coins and gold bars."],
      ["craftedPreciousMetalDealerRegistered", "AG Refining is registered as a crafted precious metal dealer with the Texas Office of Consumer Credit Commissioner."]
    ],
    sections: [
      ["How Gold Purity Is Marked", "<p>Gold purity is marked in karats or parts per thousand. 24K is pure gold, 18K is 75% gold (750), 14K is 58.3% gold (583 or 585), and 10K is 41.7% gold (417). Dental crowns and lab scrap can contain gold, silver, platinum, or palladium and are reviewed separately.</p>"],
      ["What To Bring", "<p>Bring the items as they are and a government-issued photo ID.</p>"]
    ],
    faqs: [
      ["Do you buy dental gold?", "Yes. We review qualifying precious-metal dental scrap from dental offices and labs. See our dental scrap page."]
    ],
    sources: [["FTC Jewelry Guides, 16 CFR 23.4 (gold)", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.4"]],
    related: ["dental-scrap-buyer-houston", "how-it-works", "contact"]
  }
];
