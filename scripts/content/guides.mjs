// Guides (blog posts) and pending pages for agrefining.com.
// Every fact in these posts is tied to a public source listed with the post.
// Prices, payout percentages, and review counts are intentionally absent.
// Pages in `pendingPages` only build when AG_INCLUDE_PENDING=1, because they
// describe services Dennis has not yet confirmed in writing.

export const guidesPublished = "2026-11-23";

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
