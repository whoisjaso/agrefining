import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "dist");

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "assets"), { recursive: true });
cpSync(join(root, "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "src", "style.css"), join(out, "style.css"));
cpSync(join(root, "src", "site.js"), join(out, "site.js"));

const siteUrl = "https://agrefining.com";
const phoneDisplay = "(281) 898-2719";
const phoneHref = "+12818982719";
const email = "dennis@agrefining.com";
const street = "9125 Airport Blvd., Suite B-1";
const cityLine = "Houston, TX 77061";
const primaryCta = "Schedule a Free Pickup";
const arrow = '<span class="icon-arrow" aria-hidden="true"></span>';

const materialPages = [
  {
    path: "scrap-silver-jewelry",
    title: "Scrap Silver Jewelry Buyer in Houston | AG Refining",
    description: "Sell scrap silver jewelry in Houston. AG Refining offers clear weighing, honest pricing, free qualifying pickup, and fast payment.",
    eyebrow: "Scrap silver jewelry",
    heading: "Sell scrap silver jewelry with a clear process.",
    intro: "AG Refining buys qualifying silver jewelry from Houston businesses and commercial accounts. Tell us what you have, and we will explain the next step.",
    image: "material-silver-jewelry-1280.webp",
    imageAlt: "Sorted silver jewelry, flatware, wire, and silver scrap",
    answerHeading: "We buy silver for its recoverable metal.",
    answerText: "Broken, worn, outdated, or mixed silver jewelry may still have value. The amount depends on the material, weight, silver content, and current market price.",
    details: [
      ["What we review", "Sterling jewelry, broken silver items, silver findings, flatware, coins, and other qualifying silver-bearing pieces."],
      ["What to share", "Tell us the weight, visible markings, condition, source, and whether the lot is sorted or mixed."],
      ["How pickup works", "Free pickup may be available for qualifying commercial accounts in the Houston Metro Area. We confirm the material and schedule first."]
    ],
    faqs: [
      ["Do you buy broken silver jewelry?", "Yes. Broken or worn jewelry may qualify if it contains recoverable silver."],
      ["Do markings matter?", "Yes. Marks such as sterling or 925 can help with the first review, but the material still needs to be checked."],
      ["Can you pick up from my business?", "Free pickup may be available for qualifying commercial accounts in the Houston Metro Area."]
    ]
  },
  {
    path: "industrial-x-ray-silver-recycling",
    title: "Industrial X-Ray Silver Recycling in Houston | AG Refining",
    description: "Recycle qualifying industrial X-ray film in Houston with AG Refining. Get clear guidance, free qualifying pickup, and on-site weighing.",
    eyebrow: "Industrial X-ray film",
    heading: "Recover silver from industrial X-ray film.",
    intro: "AG Refining works with Houston companies that have qualifying industrial X-ray film, NDT film, and related silver-bearing imaging material.",
    image: "material-industrial-xray-1280.webp",
    imageAlt: "Industrial radiographic film and archive boxes prepared for review",
    answerHeading: "Old film can hold recoverable silver.",
    answerText: "The type, age, condition, quantity, and storage method can affect the review. Start with a clear count or weight and a short description.",
    details: [
      ["Common sources", "Oil and gas testing, weld inspection, aerospace work, manufacturing, laboratories, and non-destructive testing programs."],
      ["Records and privacy", "Remove protected, private, or controlled records before transfer. Do not upload private images or records through the public form."],
      ["Pickup planning", "For qualifying commercial lots, AG Refining can discuss free pickup, on-site weighing, and the right handling plan."]
    ],
    faqs: [
      ["Do you take industrial radiography film?", "Qualifying industrial and NDT film can be reviewed. Contact us before moving the material."],
      ["Can you pick up a large archive?", "Free pickup may be available for qualifying commercial lots in the Houston Metro Area."],
      ["Should I send sample images online?", "No. Do not send protected, private, or controlled records through the public form."]
    ]
  },
  {
    path: "sell-silver-coins-houston",
    title: "Sell Silver Coins in Houston | Top Prices | AG Refining",
    description: "Sell silver coins in Houston for top prices. AG Refining offers expert evaluations, fast payment, and trusted local service.",
    eyebrow: "Silver coins buyer in Houston, Texas",
    heading: "Sell your silver coins in Houston.",
    intro: "AG Refining buys silver coins from collectors, investors, estates, businesses, and individuals. Whether you have one coin or a full collection, we will explain the value and make a clear offer.",
    image: "material-silver-coins-1280.webp",
    imageAlt: "Silver coins arranged for a professional evaluation",
    answerHeading: "Know what your coins are worth before you sell.",
    answerText: "We inspect the coin type, silver content, weight, condition, and current silver market. Some rare or graded coins may be worth more to a collector than for their silver, so we explain the difference before you decide.",
    details: [
      ["Honest evaluation", "We inspect your coins and explain the factors that affect the offer."],
      ["Competitive pricing", "We follow the silver market and base each offer on the coins we confirm."],
      ["Fast payment", "If you accept the offer, we complete the sale and issue prompt payment."]
    ],
    faqs: [
      ["What silver coins does AG Refining buy?", "We buy many U.S. and foreign silver coins, including American Silver Eagles, Morgan and Peace dollars, silver dimes, quarters, half dollars, proof coins, and estate collections."],
      ["Can I sell one silver coin?", "Yes. You can request an evaluation for one coin or a full collection."],
      ["Do circulated or tarnished coins have value?", "They may. Value depends on the coin, silver content, weight, condition, and current market."],
      ["Do you buy inherited silver coin collections?", "Yes. We review estate and inherited collections and explain the offer before you choose to sell."],
      ["Do you grade rare coins?", "We evaluate silver value, but rare or graded coins may need a coin specialist if their collector value may be higher."]
    ]
  },
  {
    layout: "long-material",
    path: "silver-flake-buyer-houston",
    title: "Silver Flake Buyer in Houston, TX | AG Refining",
    description: "Sell silver flake in Houston for competitive prices. AG Refining offers expert evaluations, fast payment, and trusted refining services.",
    eyebrow: "Silver flake buyer Houston",
    heading: "Sell silver flake in Houston.",
    intro: "AG Refining buys qualifying silver flake from manufacturers, electronics companies, laboratories, metal finishers, and industrial facilities. We review the material, explain the offer, and make the process easy to follow.",
    image: "material-silver-flake-1280.webp",
    imageAlt: "Silver flake and clean silver-bearing production material prepared for review",
    answerHeading: "Unused silver flake may still hold strong value.",
    answerText: "Silver flake is used in electronics, coatings, solar products, medical devices, aerospace work, and specialty manufacturing. Its value depends on silver content, purity, weight, condition, and the current market.",
    typesHeading: "Silver flake materials we review.",
    typesIntro: "We review one-time lots and repeat production streams. Share labels and records before anything moves.",
    types: [
      "Industrial and high-purity silver flake",
      "Conductive and electronics-grade silver flake",
      "Manufacturing scrap and production offcuts",
      "Surplus or obsolete silver flake inventory",
      "Silver-bearing powders and flakes",
      "Laboratory silver materials",
      "Silver coating materials",
      "Mixed silver-bearing production scrap"
    ],
    audienceHeading: "Built for Houston industry.",
    audienceText: "We serve electronics, aerospace, energy, research, medical manufacturing, chemical, and industrial facilities across the Houston Metro Area.",
    audiences: ["Manufacturers", "Electronics companies", "Research labs", "Metal finishers"],
    guardrailHeading: "Identify powders before moving them.",
    guardrailText: "Do not open, mix, disturb, or repackage unknown powders. Share the product name, composition, safety data sheet, labels, weight, container type, and condition so we can confirm the right review path.",
    reasons: [
      ["Market-based offers", "We consider confirmed silver content, purity, weight, condition, and the current silver market."],
      ["Clear material review", "We explain what information is needed and how the lot will be evaluated."],
      ["Commercial service", "Qualifying Houston lots may be eligible for mobile review, pickup, and prompt payment."],
      ["Repeat-lot planning", "We can discuss a simple plan for approved, ongoing production material."]
    ],
    faqs: [
      ["What silver flake does AG Refining buy?", "We review qualifying industrial, conductive, electronics-grade, laboratory, surplus, and production silver flake."],
      ["Can you identify unknown powder?", "Start by sharing labels, the safety data sheet, source, weight, and container condition. Do not open or move unknown material before review."],
      ["Do you offer mobile service?", "Mobile service may be available after we confirm the material, quantity, location, and schedule."],
      ["How is the offer set?", "The offer depends on confirmed silver content, purity, weight, condition, and current market values."]
    ],
    materialQuery: "silver_flake",
    ctaHeading: "Request a silver flake review.",
    ctaText: "Tell us what the material is, how it is packed, and how much you have. We will confirm the next safe step."
  },
  {
    layout: "long-material",
    path: "laboratory-silver-buyer-houston",
    title: "Laboratory Silver Buyer in Houston, TX | AG Refining",
    description: "Sell laboratory silver in Houston for top value. AG Refining offers expert evaluations, fair pricing, and fast payment for silver materials.",
    eyebrow: "Laboratory silver buyer Houston",
    heading: "Sell laboratory silver in Houston.",
    intro: "AG Refining reviews silver-bearing material from laboratories, research facilities, universities, medical facilities, and industrial companies. We help approved customers recover value from unused, outdated, or excess material.",
    image: "material-laboratory-silver-1280.webp",
    imageAlt: "Labeled laboratory silver materials arranged for a professional review",
    answerHeading: "Start with clear labels and records.",
    answerText: "Laboratory silver may come as clean metal, powder, compound, solution, coated parts, or research material. The form and condition decide how the material must be reviewed.",
    typesHeading: "Laboratory silver materials we review.",
    typesIntro: "Each lot is different. We confirm what the material is before discussing pickup or payment.",
    types: [
      "Laboratory silver scrap",
      "Silver chemicals and compounds",
      "Silver solutions",
      "Silver powders and flakes",
      "Silver-bearing samples",
      "Silver-coated laboratory components",
      "Research and surplus silver materials",
      "Qualifying precious-metal laboratory material"
    ],
    audienceHeading: "Service for Houston research and industry.",
    audienceText: "We work with research facilities, universities, medical laboratories, manufacturers, and commercial teams that have approved silver-bearing material.",
    audiences: ["Research facilities", "Universities", "Medical labs", "Industrial labs"],
    guardrailHeading: "Unknown chemicals need a separate review.",
    guardrailText: "Do not mix, drain, ship, or move unknown solutions, chemicals, powders, or regulated waste. Send the product name, safety data sheet, labels, source, quantity, and container condition. AG Refining must confirm acceptance before transfer.",
    reasons: [
      ["Professional review", "We use the material records, form, weight, and condition to plan the evaluation."],
      ["Clear communication", "We explain what can be reviewed and what must follow another handling path."],
      ["Fair pricing", "Approved lots receive an offer based on confirmed recoverable silver and current market values."],
      ["Houston service", "Qualifying commercial lots may be eligible for pickup and prompt payment."]
    ],
    faqs: [
      ["What laboratory silver do you buy?", "We review qualifying clean silver scrap, compounds, solutions, powders, flakes, coated parts, samples, and surplus inventory."],
      ["Can I send an unknown solution?", "No. Do not ship or move it. Share the label, safety data sheet, source, amount, and container condition for review first."],
      ["Do you take hazardous waste?", "AG Refining does not automatically accept hazardous or regulated waste. The material must be identified and approved before transfer."],
      ["Can you come to our laboratory?", "Pickup may be available after the material, quantity, location, handling needs, and schedule are confirmed."]
    ],
    materialQuery: "laboratory_silver",
    ctaHeading: "Request a laboratory material review.",
    ctaText: "Share the material name, form, amount, labels, and safety records. We will confirm whether it qualifies."
  },
  {
    layout: "long-material",
    path: "silver-solder-buyer-houston",
    title: "Silver Solder Buyer in Houston, TX | AG Refining",
    description: "Sell silver solder in Houston for competitive prices. AG Refining offers expert evaluations, fast payment, and trusted refining services.",
    eyebrow: "Silver solder buyer Houston",
    heading: "Sell silver solder in Houston.",
    intro: "AG Refining buys qualifying silver solder from manufacturers, machine shops, HVAC and plumbing companies, electrical contractors, jewelers, fabricators, and industrial businesses.",
    image: "material-silver-solder-1280.webp",
    imageAlt: "Silver solder rods, wire, and clean fabrication offcuts prepared for review",
    answerHeading: "Silver solder can contain more than silver.",
    answerText: "The alloy, silver percentage, weight, condition, and current market all affect value. Labels and alloy markings help us review the lot correctly.",
    typesHeading: "Silver solder materials we buy.",
    typesIntro: "New inventory, clean offcuts, and sorted production scrap are usually easier to review.",
    types: [
      "Silver solder wire and rods",
      "Silver brazing alloys and paste",
      "Manufacturing and fabrication offcuts",
      "Industrial silver solder",
      "Jewelry silver solder",
      "HVAC silver brazing rods",
      "Plumbing silver solder",
      "Surplus and obsolete silver solder"
    ],
    audienceHeading: "Made for working Houston businesses.",
    audienceText: "We serve manufacturers, machine shops, HVAC and plumbing teams, electrical contractors, jewelers, fabricators, and industrial accounts.",
    audiences: ["Manufacturers", "HVAC contractors", "Metal fabricators", "Jewelers"],
    guardrailHeading: "Check the alloy before handling.",
    guardrailText: "Some solder and brazing alloys may contain lead, cadmium, or other metals. Share the alloy number, product label, safety data sheet, weight, and condition. Do not heat, grind, or mix unknown material for the review.",
    reasons: [
      ["Accurate identification", "Alloy markings and records help us confirm the right evaluation path."],
      ["Market-based pricing", "Offers reflect confirmed silver content, lot weight, condition, and current silver values."],
      ["Fast, clear service", "We explain the offer and payment timing before you approve the sale."],
      ["Mobile options", "Qualifying commercial lots may be eligible for on-site review or pickup."]
    ],
    faqs: [
      ["What silver solder do you buy?", "We review qualifying wire, rods, brazing alloys, paste, clean offcuts, production scrap, and surplus inventory."],
      ["Why do you need the alloy number?", "Silver content and other metals can vary widely. The alloy number or safety data sheet helps identify the material."],
      ["Can you pick up from my shop?", "Pickup may be available after the material, weight, location, and schedule are confirmed."],
      ["How is the offer calculated?", "The offer depends on the confirmed alloy, silver content, weight, condition, and current market."]
    ],
    materialQuery: "silver_solder",
    ctaHeading: "Request a silver solder evaluation.",
    ctaText: "Share the alloy markings, weight, condition, and photos of the labels. We will confirm the next step."
  },
  {
    layout: "long-material",
    path: "silver-plated-materials-buyer-houston",
    title: "Silver-Plated Materials Buyer in Houston, TX | AG Refining",
    description: "Sell silver-plated materials in Houston. AG Refining offers fair pricing, expert evaluations, and fast payment for silver-plated scrap.",
    eyebrow: "Silver-plated materials buyer Houston",
    heading: "Sell silver-plated materials in Houston.",
    intro: "AG Refining reviews silver-plated items from businesses, estates, restaurants, hotels, antique dealers, recyclers, and individuals. We identify the material and explain whether the lot has recoverable value.",
    image: "material-silver-plated-1280.webp",
    imageAlt: "Silver-plated flatware and serving pieces arranged for evaluation",
    answerHeading: "Silver-plated is not the same as sterling.",
    answerText: "Silver-plated items have a thin silver layer over another metal. Value depends on the item, base metal, plating, weight, quantity, condition, and recovery cost.",
    typesHeading: "Silver-plated materials we review.",
    typesIntro: "Large sorted lots and commercial inventory are often easier to assess than a few household pieces.",
    types: [
      "Silver-plated flatware",
      "Serving trays, bowls, and dishes",
      "Tea and coffee sets",
      "Candlesticks and hollowware",
      "Hotel and restaurant silverware",
      "Antique silver-plated pieces",
      "Industrial silver-plated components",
      "Electrical contacts and mixed plated scrap"
    ],
    audienceHeading: "From estates to commercial inventories.",
    audienceText: "We work with restaurants, hotels, schools, churches, estate managers, antique dealers, pawn shops, recyclers, businesses, and individuals.",
    audiences: ["Estate managers", "Restaurants and hotels", "Antique dealers", "Recycling companies"],
    guardrailHeading: "Not every plated lot has payable value.",
    guardrailText: "A small or lightly plated lot may cost more to process than the silver it contains. We review the substrate, plating, total weight, quantity, condition, and recovery needs before making an offer.",
    reasons: [
      ["Material identification", "We help explain the difference between sterling, plated, and base-metal items."],
      ["Honest evaluation", "We tell you when a lot may not have enough recoverable value."],
      ["Fair offers", "Qualifying lots are priced from the material we confirm and current market values."],
      ["Commercial pickup", "Larger qualifying collections may be eligible for mobile service in Houston."]
    ],
    faqs: [
      ["Do silver-plated items have value?", "Some do. Value depends on the item, base metal, plating, total weight, quantity, and recovery cost."],
      ["Can you tell plated and sterling apart?", "We can review markings and the material. Final identification may require further testing."],
      ["Do you buy damaged or tarnished items?", "They may qualify. Condition is only one part of the evaluation."],
      ["Do you pick up household items?", "Pickup is mainly for larger qualifying commercial or estate lots. Contact us before moving the collection."]
    ],
    materialQuery: "silver_plated",
    ctaHeading: "Request a plated-material review.",
    ctaText: "Tell us the item types, total count or weight, markings, and location. We will tell you whether the lot may qualify."
  },
  {
    layout: "long-material",
    path: "silver-oxide-watch-battery-recycling-houston",
    title: "Silver Oxide Watch Battery Recycling Houston | AG Refining",
    description: "Recycle silver oxide watch batteries in Houston with AG Refining. Competitive pricing, fast service, and professional precious metal recovery.",
    eyebrow: "Silver oxide watch battery recycling Houston",
    heading: "Recycle silver oxide watch batteries in Houston.",
    intro: "AG Refining reviews commercial quantities of qualifying silver oxide button cells from watch shops, jewelers, distributors, hospitals, manufacturers, and recyclers.",
    image: "material-watch-batteries-real-1280.webp",
    imageAlt: "Sorted silver oxide watch batteries arranged by code and size",
    answerHeading: "Sorting protects the value of the lot.",
    answerText: "Not every button cell contains silver. Clear battery codes, careful storage, and separation by chemistry make the lot easier to review.",
    typesHeading: "Battery lots we review.",
    typesIntro: "We focus on identified, sorted commercial quantities of silver oxide watch batteries.",
    types: [
      "Sorted silver oxide watch batteries",
      "Watch and jewelry shop collections",
      "Commercial button-cell inventory",
      "Obsolete silver oxide battery stock",
      "Manufacturing and distributor lots",
      "Qualifying pallet and container quantities"
    ],
    audienceHeading: "A commercial recovery program.",
    audienceText: "We serve watch repair shops, jewelry stores, hospitals, distributors, manufacturers, recycling companies, and other approved commercial accounts.",
    audiences: ["Watch repair shops", "Jewelry stores", "Distributors", "Commercial recyclers"],
    guardrailHeading: "Separate damaged and unknown cells.",
    guardrailText: "Do not mix silver oxide cells with lithium, alkaline, recalled, leaking, swollen, damaged, or unknown batteries. Tell us the codes, chemistry, total weight, source, storage method, and condition before pickup.",
    reasons: [
      ["Precious-metal focus", "We review identified silver oxide cells for recoverable silver."],
      ["Clear lot guidance", "We explain the sorting and records needed before transfer."],
      ["Competitive pricing", "Approved lots are valued from confirmed material, weight, condition, and current silver values."],
      ["Commercial support", "Qualifying Houston lots may be eligible for scheduled pickup and prompt payment."]
    ],
    faqs: [
      ["Do all watch batteries contain silver?", "No. Battery chemistry and markings must be confirmed."],
      ["Do you take mixed button cells?", "Mixed, unknown, lithium, alkaline, damaged, or leaking cells need a separate review and may not qualify."],
      ["How should batteries be stored?", "Keep cells dry, secure, identified, and separated by chemistry. Follow the battery maker and your organization’s storage rules."],
      ["Can you pick up a commercial lot?", "Pickup may be available after the battery codes, chemistry, quantity, condition, location, and schedule are confirmed."]
    ],
    materialQuery: "silver_oxide_batteries",
    ctaHeading: "Request a battery-lot review.",
    ctaText: "Share the battery codes, chemistry, total weight, condition, and storage method. We will confirm whether the lot qualifies."
  },
  {
    path: "medical-x-ray-recycling",
    title: "Medical X-Ray Film Recycling in Houston | AG Refining",
    description: "Request medical X-ray film recycling in Houston. AG Refining reviews qualifying film, pickup needs, and on-site weighing.",
    eyebrow: "Medical X-ray film",
    heading: "Clear old film and recover qualifying silver.",
    intro: "Hospitals, clinics, dental offices, and imaging centers can request a review of qualifying silver-bearing X-ray film.",
    image: "material-medical-xray-1280.webp",
    imageAlt: "Medical X-ray film and storage sleeves organized for review",
    answerHeading: "Patient privacy comes before pickup.",
    answerText: "Do not send patient names, birth dates, medical record numbers, or readable patient images through this website. Contact AG Refining for the correct review path.",
    details: [
      ["What to describe", "The film type, date range, box count, estimated weight, storage method, and whether records have been cleared for disposal."],
      ["Who we serve", "Hospitals, clinics, dental offices, imaging centers, laboratories, and approved records projects."],
      ["Before pickup", "Your organization must confirm its own retention, privacy, and disposal duties before material leaves the site."]
    ],
    faqs: [
      ["Do you recycle medical X-ray film?", "Qualifying traditional silver-bearing film can be reviewed."],
      ["Can I upload patient images?", "No. Do not upload or email protected patient information through this website."],
      ["Do you provide free pickup?", "Free pickup may be available for qualifying commercial projects in the Houston Metro Area."]
    ]
  },
  {
    layout: "long-material",
    path: "scrap-silver-buyer-houston",
    title: "Scrap Silver Buyer Houston | Sell Scrap Silver | AG Refining",
    description: "Sell scrap silver in Houston with AG Refining. Top prices, free pickup, on-site weighing, and immediate payment",
    eyebrow: "Scrap silver buyer Houston",
    heading: "Turn your scrap silver into cash.",
    intro: "AG Refining buys qualifying scrap silver from commercial, industrial, medical, and manufacturing businesses across Houston. We make the process simple, clear, and easy to follow.",
    image: "material-sterling-hollowware-1280.webp",
    imageAlt: "Industrial scrap silver wire, sheet, contacts, and clean offcuts",
    answerHeading: "Know the material and weight before you sell.",
    answerText: "We review the silver content, type, weight, condition, and current market. Qualifying pickups may include on-site weighing so you can see the weight before you accept the offer.",
    typesHeading: "Scrap silver materials we buy.",
    typesIntro: "We review clean single materials, mixed lots, one-time cleanouts, and repeat production scrap.",
    types: [
      "Silver-bearing manufacturing scrap",
      "Silver electrical contacts and bus bars",
      "Silver wire, sheet, plate, and tubing",
      "Silver solder and brazing alloys",
      "Silver powder and granules",
      "Silver jewelry scrap and sterling silver",
      "Silver coins and bars",
      "Electronic, laboratory, and production silver scrap",
      "Obsolete silver inventory and components"
    ],
    audienceHeading: "Local service for Houston business.",
    audienceText: "We work with manufacturers, medical and laboratory teams, industrial facilities, contractors, recyclers, and other approved commercial accounts.",
    audiences: ["Manufacturers", "Industrial facilities", "Medical and lab teams", "Commercial recyclers"],
    guardrailHeading: "Tell us what created the material.",
    guardrailText: "Mixed, dirty, chemical, powdered, liquid, or unknown material may need a separate review. Share the source, labels, weight, condition, container, and any safety records. Do not move unknown material until the path is confirmed.",
    reasons: [
      ["Professional service", "You get clear communication from the first review through final payment."],
      ["On-site weighing", "Qualifying pickups can be weighed at your location so you can see the process."],
      ["Market-based pricing", "Offers reflect confirmed material, recoverable silver, weight, condition, and current values."],
      ["Convenient pickup", "Free pickup may be available for qualifying commercial lots in the Houston Metro Area."]
    ],
    faqs: [
      ["What types of scrap silver do you buy?", "We review sterling, industrial scrap, electrical contacts, solder, wire, bars, jewelry scrap, laboratory material, and manufacturing scrap."],
      ["Do you offer free pickup?", "Yes, for qualifying commercial and industrial lots in the Houston Metro Area."],
      ["Do you weigh materials at my location?", "On-site weighing is available for qualifying pickups."],
      ["How is the price determined?", "Pricing depends on confirmed material, silver content, purity, weight, condition, and current market values."],
      ["When do I receive payment?", "Prompt or same-day payment may be available after the material is confirmed and the offer is accepted."],
      ["Why choose AG Refining?", "AG Refining is a Houston-based, family-owned company focused on honest pricing, clear service, convenient pickup, and long-term relationships."]
    ],
    materialQuery: "scrap_silver",
    ctaHeading: "Sell your scrap silver with a clear plan.",
    ctaText: "Tell us what you have, how much there is, and where it is. We will confirm whether the lot qualifies for pickup."
  },
  {
    layout: "long-material",
    path: "dental-scrap-buyer-houston",
    title: "Dental Scrap Buyer Houston | Sell Dental Scrap | AG Refining",
    description: "Sell dental scrap in Houston with AG Refining. Competitive pricing, free pickup, on-site service, and fast payment for dental practices.",
    eyebrow: "Dental scrap buyer Houston",
    heading: "Sell your dental scrap with confidence.",
    intro: "AG Refining reviews qualifying precious-metal dental scrap from dental offices, dental laboratories, orthodontic practices, oral surgeons, universities, and approved healthcare facilities in Houston.",
    image: "material-dental-scrap-1280.webp",
    imageAlt: "Clean dental alloy pieces sorted for a professional material review",
    answerHeading: "Dental scrap can contain several precious metals.",
    answerText: "Crowns, bridges, inlays, sprues, buttons, and lab scrap may contain gold, silver, platinum, or palladium. The material must be clean, identified, and safe to handle.",
    typesHeading: "Dental scrap we review.",
    typesIntro: "We serve single practices and larger dental laboratories. Keep material separate from patient records and clinical waste.",
    types: [
      "Dental crowns and bridges",
      "Gold crowns and PFM crowns",
      "Inlays, onlays, copings, and casting buttons",
      "Dental sprues and production scrap",
      "Partial denture frameworks",
      "Gold-filled and silver dental alloys",
      "Platinum and palladium dental alloys",
      "Qualifying bench sweepings, polishing dust, and refining sweeps"
    ],
    audienceHeading: "Service for dental professionals.",
    audienceText: "We work with general and specialty dental practices, oral surgeons, orthodontists, dental laboratories, dental schools, universities, and approved healthcare facilities.",
    audiences: ["Dental practices", "Oral surgeons", "Dental laboratories", "Dental schools"],
    guardrailHeading: "Keep patient information and clinical waste out.",
    guardrailText: "Do not include patient records, names, extracted teeth or biological material, sharps, liquids, amalgam, or unknown clinical waste in ordinary pickup. Your practice must confirm its own privacy, retention, safety, and disposal duties before transfer.",
    reasons: [
      ["Clear evaluation", "We explain what material qualifies and what factors affect the offer."],
      ["Competitive pricing", "Approved material is priced from confirmed precious-metal content and current market values."],
      ["Practice-friendly service", "We plan around your schedule after the material and quantity are reviewed."],
      ["Long-term support", "We can discuss one-time cleanouts and approved recurring dental-lab material."]
    ],
    faqs: [
      ["What dental scrap do you buy?", "We review qualifying crowns, bridges, inlays, onlays, copings, sprues, casting buttons, frameworks, alloys, and approved lab scrap."],
      ["Can I include extracted teeth or sharps?", "No. Do not include biological material, extracted teeth, sharps, liquids, amalgam, or unknown clinical waste in ordinary pickup."],
      ["Can I send patient information?", "No. Never send patient names, records, or protected information through the website or with the material."],
      ["Do you offer free pickup?", "Free pickup may be available for qualifying dental practices and laboratories after the lot is reviewed."],
      ["When is payment made?", "Payment timing is confirmed with the offer and depends on the approved material and transaction."]
    ],
    materialQuery: "dental_material",
    ctaHeading: "Request a dental scrap review.",
    ctaText: "Tell us the material type, approximate weight, source, and whether it is sorted. Do not include patient information."
  },
  {
    layout: "xray-hub",
    path: "x-ray-recycling-services-houston",
    title: "X-Ray Recycling Services Houston | X-Ray Film Recycling | AG Refining",
    description: "Houston X-ray recycling services for medical and industrial film. Secure silver recovery, competitive pricing, and professional service.",
    eyebrow: "X-ray recycling services Houston",
    heading: "Secure X-ray film recycling in Houston.",
    intro: "AG Refining reviews qualifying medical, dental, and industrial X-ray film for silver recovery. We help Houston organizations plan a clear, secure, and responsible recycling process.",
    image: "material-industrial-xray-1280.webp",
    imageAlt: "Medical and industrial X-ray film organized in archive boxes for recycling",
    answerHeading: "Traditional X-ray film may contain recoverable silver.",
    answerText: "Digital images do not contain recoverable silver film. Tell us the film type, quantity, date range, storage method, and whether the records are cleared for destruction.",
    faqs: [
      ["What X-ray film do you recycle?", "We review qualifying traditional medical, dental, industrial radiographic, and NDT film. Digital images are not silver-bearing film."],
      ["Is the service HIPAA compliant?", "Your organization must confirm its own privacy and record-retention duties. We discuss handling, chain-of-custody needs, and available documentation before pickup, but do not make a blanket compliance guarantee."],
      ["Can I upload patient X-rays?", "No. Do not upload or email patient names, record numbers, birth dates, or readable patient images."],
      ["Do you provide destruction records?", "Ask what documentation is available for your project and confirm it in writing before pickup."],
      ["Do you offer free pickup?", "Free pickup may be available for qualifying commercial projects after the film, quantity, location, security needs, and schedule are reviewed."]
    ]
  },
  {
    path: "industrial-silver-scrap",
    title: "Industrial Silver Scrap Buyer in Houston | AG Refining",
    description: "Sell industrial silver scrap in Houston with AG Refining. Free qualifying pickup, on-site weighing, and honest pricing.",
    eyebrow: "Industrial silver",
    heading: "A repeatable way to sell industrial silver.",
    intro: "AG Refining helps Houston plants, shops, and manufacturers sell qualifying silver-bearing production material.",
    image: "material-industrial-silver-1280.webp",
    imageAlt: "Industrial silver wire, tubing, sheet, and contacts",
    answerHeading: "Recurring material needs a clear plan.",
    answerText: "Tell us what process creates the material, how often it is produced, how it is stored, and the normal lot size.",
    details: [
      ["Common material", "Wire, tubing, contacts, sheet, solder, clean offcuts, production scrap, and qualifying silver-bearing parts."],
      ["Recurring accounts", "AG Refining can review one-time cleanouts and repeat material streams."],
      ["On-site service", "Qualifying accounts can ask about free pickup, on-site weighing, and fast payment in the Houston Metro Area."]
    ],
    faqs: [
      ["Do you work with manufacturers?", "Yes. Manufacturing and industrial accounts can request a review."],
      ["Can you handle repeat pickups?", "Repeat pickup plans can be discussed after the material and normal volume are reviewed."],
      ["How is the offer set?", "The offer depends on the material, recoverable silver, weight, condition, and current market values."]
    ]
  },
  {
    layout: "long-material",
    path: "sell-silver-bars-houston",
    title: "Sell Silver Bars in Houston | AG Refining",
    description: "Sell silver bars in Houston for top prices. AG Refining offers honest evaluations, fast payment, and outstanding customer service.",
    eyebrow: "Sell silver bars Houston",
    heading: "Turn your silver bars into cash.",
    intro: "AG Refining buys silver bars from investors, businesses, estates, jewelers, and industrial companies across the Houston Metro Area. Whether you have one bar or an entire collection, we evaluate it against the current silver market and pay you quickly.",
    image: "material-silver-bars-1280.webp",
    imageAlt: "Poured and minted silver bars prepared for weighing and evaluation",
    answerHeading: "Old, tarnished, or unpackaged bars still carry value.",
    answerText: "We price silver bars from confirmed weight, fineness, and the current silver market. Bars that are scratched, tarnished, or no longer in original packaging are still bought on their silver content.",
    typesHeading: "Silver bars we buy.",
    typesIntro: "Any size and any brand. Bring the full lot so we can weigh and evaluate it together.",
    types: [
      "1 oz, 5 oz, and 10 oz silver bars",
      "20 oz, 50 oz, and 100 oz silver bars",
      "1 kilogram silver bars",
      "1,000 oz commercial silver bars",
      "Cast and minted silver bars",
      "Investment grade and vintage bars",
      "Industrial and sterling silver bars",
      "Fine silver bars (.999 and .9999)"
    ],
    audienceHeading: "Who sells silver bars to AG Refining.",
    audienceText: "We buy from individual investors, collectors, estate executors, trust companies, businesses, manufacturers, jewelry stores, and financial institutions throughout Houston.",
    audiences: ["Investors and collectors", "Estate executors", "Businesses and manufacturers", "Jewelry stores"],
    guardrailHeading: "Call before you travel with a collection.",
    guardrailText: "Tell us the bar sizes, approximate total weight, and where the lot is stored. We will confirm the right next step, and for larger holdings we can discuss an on-site evaluation instead of you moving the silver.",
    reasons: [
      ["Competitive prices", "Offers are based on the current silver market, which moves throughout the day."],
      ["Honest evaluations", "Every bar is inspected, weighed, and tested when needed. We explain how the value was reached."],
      ["Fast payment", "Once your bars are evaluated, we complete the transaction quickly and accurately."],
      ["No pressure to sell", "We answer your questions and make the offer. The decision stays yours."]
    ],
    faqs: [
      ["Do you buy a single silver bar?", "Yes. We evaluate one bar or thousands of ounces with the same process."],
      ["Are tarnished or scratched bars worth less?", "Condition matters far less than silver content. Tarnished, scratched, and unpackaged bars are still bought on weight and fineness."],
      ["Do you buy 1,000 oz commercial bars?", "Yes. For large commercial bars, call first so we can plan handling and confirm the next step."],
      ["How is my offer calculated?", "From confirmed weight, fineness, and current silver market values. We explain the math before you decide."]
    ],
    materialQuery: "silver_bars",
    ctaHeading: "Request a silver bar evaluation.",
    ctaText: "Tell us the bar sizes, how many you have, and where they are. We will confirm the next step before anything moves."
  },
  {
    layout: "long-material",
    path: "silver-flatware-buyer-houston",
    title: "Silver Flatware Buyer in Houston, TX | AG Refining",
    description: "Sell silver flatware in Houston for top prices. AG Refining offers honest evaluations, fast payment, and trusted service.",
    eyebrow: "Silver flatware buyer Houston",
    heading: "Turn unused silver flatware into cash.",
    intro: "AG Refining buys sterling flatware, antique silverware, serving pieces, and complete sets from homeowners, estates, collectors, and dealers. From a single serving spoon to a full family collection, we price it against the current silver market.",
    image: "material-sterling-hollowware-1280.webp",
    imageAlt: "Sterling silver flatware and serving pieces laid out for evaluation",
    answerHeading: "Not sure whether it is sterling?",
    answerText: "That is a normal question. Our team identifies your pieces, explains what they are, and tells you what they are worth before you decide to sell anything.",
    typesHeading: "Silver flatware we buy.",
    typesIntro: "Polished or tarnished, complete or mismatched, purchased or inherited.",
    types: [
      "Sterling silver flatware sets",
      "Antique silverware",
      "Silver serving trays",
      "Serving spoons and forks",
      "Butter knives",
      "Tea and coffee service pieces",
      "Hollowware",
      "Individual sterling utensils",
      "Estate silver collections",
      "Damaged or mismatched pieces"
    ],
    audienceHeading: "Who we serve.",
    audienceText: "We work with individuals, estate executors, antique dealers, jewelers, and businesses across Houston and the surrounding metro area.",
    audiences: ["Homeowners", "Estate executors", "Antique dealers", "Jewelers"],
    guardrailHeading: "Ask about mobile service for large collections.",
    guardrailText: "If you have a full estate collection, do not move it before calling. We can come to your location, evaluate the silver, weigh the material, and pay on the spot once you accept the offer.",
    reasons: [
      ["Competitive prices", "Offers follow the current silver market, which changes daily."],
      ["Accurate evaluations", "Each piece is examined and weighed, and we explain what is sterling and what is not."],
      ["Fast, secure payment", "No hidden fees and no unnecessary delays once you accept the offer."],
      ["Respectful service", "Inherited silver carries history. We treat every collection and every customer with respect."]
    ],
    faqs: [
      ["How do I know if my flatware is sterling?", "Bring it in or send photos of the markings. Our team identifies your items and explains their value before you sell."],
      ["Do you buy incomplete sets?", "Yes. Mismatched, incomplete, and damaged pieces are all evaluated on silver content."],
      ["Do you buy silver-plated flatware?", "Plated flatware is handled differently from sterling. See our silver-plated materials page, or ask and we will point you to the right path."],
      ["Can you come to me?", "Mobile service may be available for larger collections after we confirm the material, location, and schedule."]
    ],
    materialQuery: "silver_flatware",
    ctaHeading: "Request a silver flatware evaluation.",
    ctaText: "Tell us what you have and roughly how much. We will confirm whether to visit us or send our team to you."
  },
  {
    layout: "long-material",
    path: "jewelry-store-silver-recycling-houston",
    title: "Jewelry Store Silver Recycling in Houston, TX | AG Refining",
    description: "AG Refining helps Houston jewelry stores recycle silver scrap with expert service, fair pricing, accurate evaluations, and fast payment.",
    eyebrow: "Jewelry store silver recycling Houston",
    heading: "Turn bench scrap into working capital.",
    intro: "Jewelry stores handle silver every day. Damaged pieces, customer trade-ins, bench scrap, and outdated inventory build up fast. AG Refining helps Houston jewelers recover the full value of that material with accurate evaluations and fast payment.",
    image: "material-silver-jewelry-1280.webp",
    imageAlt: "Sterling silver jewelry scrap, findings, and bench material collected for refining",
    answerHeading: "The silver you already own is working capital.",
    answerText: "Broken jewelry, polishing dust, casting scrap, and inventory that never sold still contain recoverable silver. We evaluate each lot on silver content, weight, purity, and current market conditions.",
    typesHeading: "Jewelry store materials we buy.",
    typesIntro: "One small lot or an ongoing refining relationship. Both work the same way.",
    types: [
      "Sterling silver jewelry scrap",
      "Silver rings, bracelets, necklaces, and earrings",
      "Repair and bench scrap",
      "Silver filings and polishing dust",
      "Silver casting scrap",
      "Silver wire and sheet",
      "Silver settings and findings",
      "Broken or damaged silver jewelry",
      "Outdated silver inventory",
      "Silver manufacturing leftovers"
    ],
    audienceHeading: "Built for the Houston jewelry trade.",
    audienceText: "Houston has a deep jewelry industry: retail stores, custom benches, repair shops, wholesalers, and manufacturers. All of them generate silver worth recovering.",
    audiences: ["Retail jewelry stores", "Custom and bench jewelers", "Repair shops", "Wholesalers and manufacturers"],
    guardrailHeading: "Set up a routine instead of a one-time cleanout.",
    guardrailText: "If your bench produces scrap every month, tell us your volume and schedule. We can agree on a recurring pickup so the material never piles up and the value never sits idle.",
    reasons: [
      ["Competitive pricing", "Offers follow current silver market values, not a flat shop rate."],
      ["Accurate content evaluations", "Experienced precious metal specialists assess silver content and explain the result."],
      ["Professional and confidential", "Your inventory and volumes stay between us."],
      ["Convenient pickup", "For larger quantities we come to your store, evaluate, weigh, and make the offer on site."]
    ],
    faqs: [
      ["Do you buy polishing dust and filings?", "Yes. Sweeps, filings, and polishing waste often hold meaningful silver and are evaluated with the rest of your lot."],
      ["Is there a minimum quantity?", "Small lots are welcome. For larger volumes, ask about pickup and we will plan a visit."],
      ["Can we set up recurring service?", "Yes. Tell us your typical monthly volume and we will discuss a simple recurring schedule."],
      ["How fast is payment?", "Once the lot is evaluated and you accept the offer, we pay quickly. Timing depends on the material and agreed terms."]
    ],
    materialQuery: "jewelry_scrap",
    ctaHeading: "Request a jewelry scrap evaluation.",
    ctaText: "Tell us what your bench produces and how much is waiting. We will confirm pickup and the next step."
  }
];

const industryPages = [
  ["hospital-silver-recycling", "Hospital Silver Recycling in Houston", "Hospitals", "medical X-ray film, dental material, lab material, and other qualifying silver-bearing items", "material-medical-xray-1280.webp"],
  ["dental-lab-silver-recycling", "Dental Lab Silver Recycling in Houston", "Dental laboratories", "qualifying crowns, bridges, inlays, filings, and silver-bearing dental material", "material-dental-scrap-1280.webp"],
  ["oil-gas-silver-recovery", "Oil and Gas Silver Recovery in Houston", "Oil and gas companies", "industrial X-ray film, NDT film, contacts, and qualifying silver-bearing maintenance or production material", "material-industrial-xray-1280.webp"],
  ["manufacturing-silver-recovery", "Manufacturing Silver Recovery in Houston", "Manufacturers", "wire, contacts, sheet, solder, clean offcuts, parts, and recurring production scrap", "material-industrial-silver-1280.webp"],
  ["university-silver-recycling", "University Silver Recycling in Houston", "Universities", "qualifying lab material, old X-ray film, electronics, batteries, and approved silver-bearing inventory", "material-laboratory-silver-1280.webp"],
  ["electronics-silver-recovery", "Electronics Silver Recovery in Houston", "Electronics companies", "qualifying contacts, switches, components, solder, and silver-bearing production scrap", "material-silver-solder-1280.webp"]
].map(([path, heading, audience, materials, image]) => ({
  path,
  title: `${heading} | AG Refining`,
  description: `${heading} with free qualifying pickup, on-site weighing, honest pricing, and direct service from AG Refining.`,
  eyebrow: "Industry service",
  heading,
  intro: `AG Refining helps ${audience.toLowerCase()} review and sell ${materials}.`,
  image,
  imageAlt: `${audience} silver-bearing material prepared for review`,
  answerHeading: `A direct silver service for ${audience.toLowerCase()}.`,
  answerText: "We come to qualifying Houston accounts, weigh material on-site, explain the offer, and provide fast payment when available.",
  details: [
    ["Start with the material", `Tell us what you have, the normal quantity, its condition, and whether it is a one-time lot or a repeat stream.`],
    ["Plan the pickup", "Free pickup may be available for qualifying commercial accounts in the Houston Metro Area. We confirm the lot and schedule first."],
    ["Keep the process clear", "You can see the on-site weight before payment. Final pricing depends on the confirmed material and current silver market values."]
  ],
  faqs: [
    [`Does AG Refining work with ${audience.toLowerCase()}?`, `Yes. ${audience} can request a commercial material review.`],
    ["Do you offer free pickup?", "Yes, for qualifying commercial and industrial accounts in the Houston Metro Area."],
    ["Can you weigh material on-site?", "Yes, on-site weighing is available for qualifying pickups."]
  ]
}));

const locationPages = [
  // The fourth column keeps the service-area index from repeating one photograph
  // seven times. Each city carries a different material from the set.
  // The 1280 variant, not the 1600 hero crop: service pages and taxonomy cards
  // declare width="1280" height="819", so the file has to actually be that.
  ["houston-silver-buyer", "Houston", "the City of Houston", "ag-silver-pour-1280.webp"],
  ["silver-buyer-pearland", "Pearland", "Pearland and nearby south Houston businesses", "material-sterling-hollowware-1280.webp"],
  ["silver-buyer-pasadena", "Pasadena", "Pasadena, Deer Park, and nearby industrial areas", "material-industrial-silver-1280.webp"],
  ["silver-buyer-sugar-land", "Sugar Land", "Sugar Land, Stafford, and nearby southwest Houston businesses", "material-silver-jewelry-1280.webp"],
  ["silver-buyer-katy", "Katy", "Katy and west Houston businesses", "material-silver-coins-1280.webp"],
  ["silver-buyer-the-woodlands", "The Woodlands", "The Woodlands, Spring, and north Houston businesses", "material-silver-bars-1280.webp"],
  ["silver-buyer-conroe", "Conroe", "Conroe and nearby Montgomery County businesses", "material-industrial-xray-1280.webp"]
].map(([path, city, area, image]) => ({
  path,
  title: `Silver Buyer in ${city}, TX | Free Qualifying Pickup | AG Refining`,
  description: `Sell qualifying silver in ${city}. AG Refining offers free commercial pickup, on-site weighing, honest pricing, and fast payment.`,
  eyebrow: "Houston Metro service",
  heading: `${city} silver buyer for commercial accounts.`,
  intro: `AG Refining serves ${area}. Qualifying commercial accounts can ask for free pickup, on-site weighing, and fast payment.`,
  image,
  imageAlt: `Silver-bearing commercial material for pickup near ${city}, Texas`,
  answerHeading: `We come to qualifying businesses in ${city}.`,
  answerText: "You do not have to move a large lot before you know the process. Tell us what you have, and we will confirm whether the pickup qualifies.",
  details: [
    ["What we buy", "Qualifying scrap silver, industrial silver, dental material, silver oxide batteries, X-ray film, coins, jewelry, and other silver-bearing material."],
    ["How pickup works", `We review the material, amount, condition, and location. If the lot qualifies, we schedule pickup in ${city}.`],
    ["How you get paid", "We weigh qualifying material on-site and provide an offer based on the material and current silver market values. Fast payment is available when the transaction qualifies."]
  ],
  faqs: [
    [`Do you pick up silver in ${city}?`, `Yes. Free pickup may be available for qualifying commercial accounts in ${city}.`],
    ["Do you weigh the material at my location?", "Yes. On-site weighing is available for qualifying pickups."],
    ["Do you buy from individuals?", "AG Refining reviews individual and business inquiries, but free pickup is focused on qualifying commercial accounts."]
  ]
}));

Object.assign(locationPages.find((page) => page.path === "houston-silver-buyer"), {
  layout: "houston-hub",
  title: "Houston Silver Buyer | Sell Scrap Silver in Houston | AG Refining",
  description: "Sell silver in Houston with AG Refining. Free pickup, on-site weighing, immediate payment, and honest pricing for commercial accounts.",
  eyebrow: "Houston silver buyer",
  heading: "Sell your silver with confidence.",
  intro: "AG Refining helps Houston businesses sell qualifying silver-bearing material. We offer clear evaluations, convenient pickup, on-site weighing, and prompt payment when the transaction qualifies.",
  answerHeading: "We come to qualifying Houston businesses.",
  answerText: "Tell us what you have, how much there is, and where it is. We will review the material and confirm the pickup, weighing, offer, and payment process before anything moves.",
  faqs: [
    ["What types of customers does AG Refining serve?", "We work with commercial, industrial, medical, educational, manufacturing, recycling, and other approved customers across the Houston Metro Area."],
    ["Do you offer free pickup?", "Yes, for qualifying commercial and industrial accounts after the material, quantity, location, and schedule are confirmed."],
    ["Do you weigh materials on-site?", "On-site weighing is available for qualifying pickups so you can see the weight before accepting an offer."],
    ["When do I get paid?", "Prompt or same-day payment may be available after the material is confirmed and the offer is accepted."],
    ["What areas do you serve?", "We serve Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, and nearby communities."]
  ]
});

const allServicePages = [...materialPages, ...industryPages, ...locationPages];

const nav = `
  <header class="site-header" data-site-header>
    <div class="utility-bar">
      <div class="shell utility-inner">
        <p>Houston, Texas <span aria-hidden="true">/</span> Silver buying and pickup</p>
        <div>
          <a href="tel:${phoneHref}">${phoneDisplay}</a><span></span>
          <a href="mailto:${email}">${email}</a><span></span>
          <a href="/espanol">Español</a>
        </div>
      </div>
    </div>
    <nav class="nav shell" aria-label="Primary navigation">
      <a class="brand" href="/" aria-label="AG Refining home">
        <img src="/assets/ag-mark-path.svg" alt="" width="48" height="48">
        <span class="brand-word"><strong>AG</strong> Refining</span>
      </a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-links" aria-label="Open navigation"><span></span><span></span></button>
      <div class="nav-links" id="primary-links" data-nav>
        <a href="/accepted-materials">Materials</a>
        <a href="/industries">Industries</a>
        <a href="/service-areas">Service areas</a>
        <a href="/how-it-works">How it works</a>
        <a href="/about">Our story</a>
        <a class="button button-primary nav-review" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
      </div>
    </nav>
    <button class="nav-scrim" type="button" data-nav-scrim aria-label="Close navigation" tabindex="-1"></button>
  </header>`;

const footer = `
  <footer class="footer">
    <div class="shell footer-grid">
      <div>
        <a class="brand" href="/"><img src="/assets/ag-mark-path.svg" alt="" width="48" height="48"><span class="brand-word">AG Refining</span></a>
        <p>Houston silver buying and pickup for qualifying commercial, industrial, medical, and business accounts.</p>
      </div>
      <nav aria-label="Materials">
        <a href="/scrap-silver-buyer-houston">Silver scrap</a>
        <a href="/industrial-x-ray-silver-recycling">Industrial X-ray film</a>
        <a href="/silver-oxide-watch-battery-recycling-houston">Watch batteries</a>
        <a href="/accepted-materials">All materials</a>
      </nav>
      <nav aria-label="Contact">
        <a href="tel:${phoneHref}">${phoneDisplay}</a>
        <a href="mailto:${email}">${email}</a>
        <a href="/contact?intent=pickup">${primaryCta}</a>
      </nav>
    </div>
    <div class="shell footer-bottom">
      <p>Copyright 2026 AG Refining. Free pickup and fast payment depend on material, location, account type, and schedule.</p>
      <nav aria-label="Legal"><a href="/privacy">Privacy</a></nav>
    </div>
  </footer>`;

const materialGuide = `
  <details class="material-guide">
    <summary><span class="guide-mark" aria-hidden="true"></span><span>Identify your material</span></summary>
    <div class="material-guide-panel">
      <h2>Start with the material.</h2>
      <a href="/accepted-materials">See what we buy ${arrow}</a>
      <a href="/how-it-works">See how pickup works ${arrow}</a>
      <a href="/contact">Request a review ${arrow}</a>
      <a href="tel:${phoneHref}">Call ${phoneDisplay}</a>
    </div>
  </details>`;

const mobileActions = `<nav class="mobile-actions" aria-label="Quick actions"><a href="tel:${phoneHref}">Call</a><a class="button-primary" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></nav>`;

function schemaTag(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "AG Refining",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/assets/ag-mark-path.svg`,
  telephone: phoneHref,
  email,
  address: {
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: "Houston",
    addressRegion: "TX",
    postalCode: "77061",
    addressCountry: "US"
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Greater Houston Metro Area"
  }
};

// og:image dimensions have to match the file actually referenced, or link
// previews crop to the wrong ratio. Sizes come from the presets in
// scripts/optimize-asset.mjs.
function ogSize(image) {
  if (image.endsWith("-1600.webp")) return { w: 1600, h: 900 };
  if (image.endsWith("-1280.webp")) return { w: 1280, h: 819 };
  return { w: 1200, h: 675 };
}

function document({
  title,
  description,
  path = "",
  content,
  lang = "en",
  bodyClass = "",
  pageSchema = [],
  image = "ag-silver-social.webp",
  robots = "index,follow,max-image-preview:large"
}) {
  const canonical = path ? `${siteUrl}/${path}` : `${siteUrl}/`;
  const schema = [organizationSchema, ...pageSchema];
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta name="robots" content="${robots}">
    <meta name="theme-color" content="#f1ede4">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="AG Refining">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="AG Refining">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${siteUrl}/assets/${image}">
    <meta property="og:image:width" content="${ogSize(image).w}">
    <meta property="og:image:height" content="${ogSize(image).h}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="/assets/ag-mark-path.svg" type="image/svg+xml">
    <link rel="preload" href="/assets/fonts/newsreader-latin-opsz.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/manrope-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/style.css?v=20260803-silver-atelier">
    ${schemaTag({ "@context": "https://schema.org", "@graph": schema })}
  </head>
  <body data-design="silver-atelier"${bodyClass ? ` class="${bodyClass}"` : ""}>
    <a class="skip" href="#main">Skip to content</a>
    ${nav}
    <main id="main">${content}</main>
    ${mobileActions}
    ${footer}
    ${materialGuide}
    <script src="/site.js?v=20260803-silver-atelier" defer></script>
  </body>
</html>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map(([label, href], index) => `<li>${href && index < items.length - 1 ? `<a href="${href}">${label}</a>` : label}</li>`).join("")}</ol></nav>`;
}

function faqMarkup(items) {
  return `<div class="faq-list">${items.map(([question, answer]) => `<details><summary>${question}<span aria-hidden="true"></span></summary><div><p>${answer}</p></div></details>`).join("")}</div>`;
}

function faqSchema(items) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text }
    }))
  };
}

function assayLine(label = "Ag / 47") {
  return `<div class="assay-line" aria-hidden="true"><span>${label}</span><i></i></div>`;
}

const featuredMaterials = [
  ["Scrap silver jewelry", "scrap-silver-jewelry", "material-silver-jewelry-1280.webp", "material-silver-jewelry-mobile.webp", "Jewelry, flatware, coins, and mixed silver items."],
  ["Industrial X-ray film", "industrial-x-ray-silver-recycling", "material-industrial-xray-1280.webp", "material-industrial-xray-mobile.webp", "Industrial radiography and NDT film from qualifying accounts."],
  ["Silver coins", "sell-silver-coins-houston", "material-silver-coins-1280.webp", "material-silver-coins-mobile.webp", "Single coins, mixed lots, and estate collections evaluated with care."],
  ["Silver oxide batteries", "silver-oxide-watch-battery-recycling-houston", "material-watch-batteries-real-1280.webp", "material-watch-batteries-real-mobile.webp", "Sorted commercial lots from watch and jewelry businesses."],
  ["Medical X-ray film", "medical-x-ray-recycling", "material-medical-xray-1280.webp", "material-medical-xray-mobile.webp", "Qualifying film from medical, dental, and imaging facilities."],
  ["Sterling and hollowware", "silver-flatware-buyer-houston", "material-sterling-hollowware-1280.webp", "material-sterling-hollowware-mobile.webp", "Sterling flatware, serving pieces, trays, and estate collections."]
];

const homeFaqs = [
  ["What types of customers does AG Refining serve?", "We work with commercial, industrial, medical, educational, manufacturing, and recycling businesses throughout the Houston Metro Area."],
  ["Do you offer free pickup?", "Yes. We provide free pickup throughout the Houston Metro Area for qualifying commercial and industrial accounts."],
  ["Do you weigh materials on-site?", "Yes. We perform on-site weighing for qualifying pickups so you can see the weight before payment."],
  ["When do I get paid?", "Immediate payment is available for most qualifying transactions. Same-day service depends on the material, schedule, and agreed terms."],
  ["What areas do you serve?", "We serve Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, and nearby communities."],
  ["Why choose AG Refining?", "Customers choose AG Refining for honest pricing, professional service, free qualifying pickup, on-site weighing, and direct Houston-based support."]
];

const home = `
  <section class="atelier-hero">
    <div class="hero-media">
      <picture>
        <source media="(max-width: 700px)" srcset="/assets/ag-silver-pour-mobile.webp">
        <img src="/assets/ag-silver-pour-1600.webp" alt="Molten silver poured from an induction furnace into a mold at AG Refining" width="1600" height="900" fetchpriority="high">
      </picture>
    </div>
    <div class="shell hero-commercial-grid">
      <div class="hero-copy" data-reveal>
        <div class="assay-line" aria-hidden="true"><span>Ag / 47</span><i></i></div>
        <p class="hero-kicker"><span>Ag</span> Houston silver buyer</p>
        <h1>Turn silver-bearing material into cash.</h1>
        <p class="hero-lede">AG Refining turns silver-bearing material into cash for Houston businesses. Free pickup for qualifying accounts, on-site weighing you can watch, honest pricing, and immediate payment on most qualifying transactions.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
          <a class="phone-link" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
        </div>
        <p class="shipping-note"><span></span>Contact AG before shipping or visiting.</p>
      </div>
      <form class="intake-panel" action="/contact" method="get" data-reveal>
        <input type="hidden" name="intent" value="pickup">
        <p class="hero-review-label">Start here</p>
        <h2>What silver do you have?</h2>
        <p>Choose the closest type. We will review the details and confirm the next step.</p>
        <label for="hero-material">Material type
          <select id="hero-material" name="material" required>
            <option value="">Select a material</option>
            <option value="scrap_silver">Scrap silver</option>
            <option value="industrial_silver">Industrial silver</option>
            <option value="dental_material">Dental material</option>
            <option value="silver_oxide_batteries">Watch batteries</option>
            <option value="xray_film">X-ray film</option>
            <option value="unknown">Not sure</option>
          </select>
        </label>
        <label for="hero-quantity">Approximate amount <span>Optional</span>
          <input id="hero-quantity" name="quantity" type="text" maxlength="120" placeholder="Weight, boxes, drums, or pallets">
        </label>
        <button class="button button-primary" type="submit">${primaryCta} ${arrow}</button>
        <small>Free pickup depends on the material, location, account type, and schedule.</small>
      </form>
    </div>
  </section>

  <div class="trust-ledger">
    <div class="shell trust-line-inner trust-line-four">
      <p>Houston-based</p>
      <p>Free qualifying pickup</p>
      <p>On-site weighing</p>
      <p>Immediate payment</p>
    </div>
  </div>

  <section class="section answer-home">
    <div class="shell answer-home-grid">
      <div><p class="eyebrow">Houston's trusted silver buyer</p><h2>Sell your silver with confidence.</h2></div>
      <div>
        <p class="answer-lede">Experience, honesty, and service matter when you sell silver.</p>
        <p>AG Refining makes the process simple. We help with small commercial lots and large industrial loads. You see the weight, hear the offer, and choose what happens next.</p>
        <div class="inline-actions">
          <a class="text-link" href="/how-it-works">See how it works ${arrow}</a>
          <a class="text-link" href="/about">Meet the family ${arrow}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section material-editorial">
    <div class="shell">
      <div class="section-title-row">
        <div><p class="eyebrow">Materials we buy</p><h2>Start with what you have.</h2></div>
        <p class="section-intro-small">Each page explains what to share, what may qualify, and how pickup works.</p>
      </div>
      <div class="featured-materials-grid">
        ${featuredMaterials.map(([name, path, desktop, mobile, copy]) => `<a class="material-row" href="/${path}" data-reveal>
          <picture class="featured-material-image"><source media="(max-width: 700px)" srcset="/assets/${mobile}"><img src="/assets/${desktop}" alt="${name} prepared for review" width="1280" height="819" loading="lazy"></picture>
          <div class="featured-material-copy"><h3>${name}</h3><p>${copy}</p><strong>View material ${arrow}</strong></div>
        </a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section assay-process">
    <div class="shell">
      <div class="section-title-row">
        <div><p class="eyebrow">A simple process</p><h2>Six steps from silver to cash.</h2></div>
        <p class="section-intro-small">You stay informed from the first call to final payment.</p>
      </div>
      <div class="process process-six" data-reveal>
        <article><span>01</span><h3>Contact us</h3><p>Tell us what silver you have.</p></article>
        <article><span>02</span><h3>Schedule</h3><p>Choose a pickup time that works.</p></article>
        <article><span>03</span><h3>We arrive</h3><p>Our team comes to your location.</p></article>
        <article><span>04</span><h3>We weigh</h3><p>See the material weight on-site.</p></article>
        <article><span>05</span><h3>Get an offer</h3><p>Review clear, market-based pricing.</p></article>
        <article><span>06</span><h3>Get paid</h3><p>Receive fast payment when available.</p></article>
      </div>
      <a class="button button-secondary process-link" href="/how-it-works">See the full process ${arrow}</a>
    </div>
  </section>

  <section class="facility-feature">
    <div class="industrial-feature-grid">
      <div class="industrial-feature-media">
        <picture class="industrial-feature-picture"><source media="(max-width: 700px)" srcset="/assets/ag-silver-hero-mobile.webp"><img src="/assets/ag-silver-hero-1600.webp" alt="Industrial silver material prepared for pickup and weighing" width="1600" height="900" loading="lazy"></picture>
      </div>
      <div class="industrial-feature-copy" data-reveal>
        <p class="eyebrow">Why businesses choose AG Refining</p>
        <h2>We come to your facility.</h2>
        <p>Qualifying Houston accounts save time and avoid the trouble of moving valuable material before the process is clear.</p>
        <ul class="plain-checks">
          <li>Family-owned, Houston-based company</li>
          <li>Free pickup for qualifying accounts</li>
          <li>On-site weighing you can see</li>
          <li>Honest, market-based pricing</li>
          <li>Fast payment when available</li>
          <li>Commercial and industrial accounts welcome</li>
        </ul>
        <a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
      </div>
    </div>
  </section>

  <section class="section industry-index">
    <div class="shell">
      <div class="section-title-row">
        <div><p class="eyebrow">Industries we serve</p><h2>Built for business accounts.</h2></div>
        <p class="section-intro-small">AG Refining works with organizations that create or store silver-bearing material.</p>
      </div>
      <div class="related-grid">
        ${industryPages.slice(0, 6).map((page) => `<a class="related-card" href="/${page.path}"><span>Industry page</span><h3>${page.heading.replace(" in Houston", "")}</h3><p>${page.intro}</p><b>${arrow}</b></a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section service-area-section">
    <div class="shell service-area-layout">
      <div>
        <p class="eyebrow">Serving the Houston Metro Area</p>
        <h2>Local pickup across Southeast Texas.</h2>
        <p>We serve Houston, Pearland, Pasadena, Sugar Land, Katy, Cypress, Spring, The Woodlands, Conroe, Humble, Baytown, League City, Friendswood, Missouri City, Richmond, Rosenberg, Tomball, Bellaire, Deer Park, La Porte, Texas City, Galveston, and nearby communities.</p>
        <a class="button button-secondary" href="/service-areas">View service areas ${arrow}</a>
      </div>
      <div class="service-area-links">
        ${locationPages.map((page) => `<a href="/${page.path}">${page.heading.replace(" for commercial accounts.", "")} ${arrow}</a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section provenance-story">
    <div class="shell legacy-editorial">
      <div><p class="legacy-number">Ag</p><p class="legacy-caption">The Stevens family</p></div>
      <div>
        <p class="eyebrow">A family legacy</p>
        <blockquote>“My father taught us the importance of honesty, hard work, and respect.”</blockquote>
        <cite>Dennis Stevens</cite>
        <p>John Stevens built his name by treating customers fairly. Dennis carries that lesson into every silver transaction today.</p>
        <a class="text-link" href="/about">Read the family story ${arrow}</a>
      </div>
    </div>
  </section>

  <section class="section location-section">
    <div class="shell location-grid">
      <a class="location-map" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${cityLine}`)}" target="_blank" rel="noopener" aria-label="Open ${street}, ${cityLine} in Google Maps">
        <span class="location-map-kicker"><b>Ag / 47</b><span>Houston, Texas</span></span>
        <span class="location-map-city" aria-hidden="true">HOU</span>
        <span class="location-map-detail"><span>${street}<br>${cityLine}</span><strong>Open in Google Maps ${arrow}</strong></span>
      </a>
      <div class="location-copy">
        <p class="eyebrow">Contact and location</p>
        <h2>Call before shipping or visiting.</h2>
        <p>We will confirm the material, pickup option, and next step before anything moves.</p>
        <dl>
          <div><dt>Address</dt><dd>${street}<br>${cityLine}</dd></div>
          <div><dt>Phone</dt><dd><a href="tel:${phoneHref}">${phoneDisplay}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${email}">${email}</a></dd></div>
        </dl>
        <div class="location-actions">
          <a class="button button-primary" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
          <a class="phone-link" href="tel:${phoneHref}">Call AG Refining</a>
        </div>
        <p class="location-note">Please call before visiting. Pickup and same-day service depend on the material and schedule.</p>
      </div>
    </div>
  </section>

  <section class="section faq-section">
    <div class="shell faq-grid">
      <div><p class="eyebrow">Common questions</p><h2>Clear answers before pickup.</h2></div>
      ${faqMarkup(homeFaqs)}
    </div>
  </section>

  <section class="conversion-band">
    <div class="shell" data-reveal>
      <p class="eyebrow">Ready to sell your silver?</p>
      <h2>Let us come to you.</h2>
      <p>Tell us what you have, how much there is, and where it is located. We will confirm whether the lot qualifies for free pickup.</p>
      <div class="hero-actions hero-actions-center">
        <a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
        <a class="phone-link phone-link-inverse" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
      </div>
    </div>
  </section>`;

writeFileSync(join(out, "index.html"), document({
  title: "Houston Silver Buyer | Sell Scrap Silver in Houston | AG Refining",
  description: "Sell silver in Houston with AG Refining. Free pickup, on-site weighing, immediate payment, and honest pricing for commercial accounts.",
  content: home,
  bodyClass: "home-page",
  pageSchema: [faqSchema(homeFaqs)]
}));

function servicePage(page) {
  const related = allServicePages.filter((candidate) => candidate.path !== page.path).slice(0, 3);
  const materialByPath = {
    "scrap-silver-jewelry": "scrap_silver",
    "industrial-x-ray-silver-recycling": "xray_film",
    "sell-silver-coins-houston": "silver_coins",
    "silver-oxide-watch-battery-recycling-houston": "silver_oxide_batteries",
    "medical-x-ray-recycling": "xray_film",
    "scrap-silver-buyer-houston": "scrap_silver",
    "dental-scrap-buyer-houston": "dental_material",
    "industrial-silver-scrap": "industrial_silver"
  };
  const materialQuery = materialByPath[page.path] ? `&material=${materialByPath[page.path]}` : "";
  const content = `
    <section class="page-hero service-hero">
      <div class="shell">
        ${breadcrumbs([["Home", "/"], [page.eyebrow, null]])}
        <div class="service-hero-grid">
          <div class="service-hero-copy" data-reveal>
            ${assayLine()}
            <p class="eyebrow">${page.eyebrow}</p>
            <h1>${page.heading}</h1>
            <p>${page.intro}</p>
            <a class="button button-primary" href="/contact?intent=pickup${materialQuery}">${primaryCta} ${arrow}</a>
          </div>
          <figure class="service-visual"><img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" fetchpriority="high"></figure>
        </div>
      </div>
    </section>
    <section class="answer-band">
      <div class="shell answer-grid">
        <p class="answer-index">What to know</p>
        <div><h2>${page.answerHeading}</h2><p>${page.answerText}</p></div>
      </div>
    </section>
    <section class="section detail-section">
      <div class="shell detail-grid">
        <aside class="detail-rail"><p class="eyebrow">Simple next steps</p><h2>Know what happens next.</h2><a class="text-link" href="/how-it-works">See the full process ${arrow}</a></aside>
        <div class="detail-copy">${page.details.map(([heading, text]) => `<article data-reveal><h3>${heading}</h3><p>${text}</p></article>`).join("")}</div>
      </div>
    </section>
    <section class="section faq-section">
      <div class="shell faq-grid"><div><p class="eyebrow">Common questions</p><h2>Answers before pickup.</h2></div>${faqMarkup(page.faqs)}</div>
    </section>
    <section class="section related">
      <div class="shell"><div class="section-title-row"><div><p class="eyebrow">Keep exploring</p><h2>More ways we can help.</h2></div></div>
        <div class="related-grid editorial-index">${related.map((item) => `<a class="related-card" href="/${item.path}"><span>${item.eyebrow}</span><h3>${item.heading}</h3><p>${item.intro}</p><b>${arrow}</b></a>`).join("")}</div>
      </div>
    </section>
    <section class="conversion-band"><div class="shell" data-reveal><p class="eyebrow">Start with the material</p><h2>Schedule a Houston pickup.</h2><p>Tell us what you have and where it is. We will confirm whether the lot qualifies.</p><a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></div></section>`;
  const dir = join(out, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({
    title: page.title,
    description: page.description,
    path: page.path,
    content,
    image: page.image,
    pageSchema: [faqSchema(page.faqs)]
  }));
}

function coinServicePage(page) {
  const coinTypes = [
    "American Silver Eagles",
    "Canadian Silver Maple Leafs",
    "Morgan Silver Dollars",
    "Peace Silver Dollars",
    "Walking Liberty Half Dollars",
    "Franklin Half Dollars",
    "Kennedy Half Dollars (40% and 90% silver)",
    "Mercury Dimes",
    "Roosevelt Silver Dimes",
    "Washington Silver Quarters",
    "Standing Liberty Quarters",
    "Barber Coins",
    "Junk Silver Coins",
    "Proof and Commemorative Silver Coins",
    "Foreign Silver Coins",
    "Estate Silver Coin Collections"
  ];
  const reasons = [
    ["Outstanding customer service", "We answer your questions, explain each step, and never pressure you to sell."],
    ["Industry experience", "Our team understands silver content, weight, condition, and current market values."],
    ["Competitive pricing", "We monitor the silver market and make an offer based on the coins we confirm."],
    ["Honest evaluations", "We show you the factors that affect the offer before you make a decision."],
    ["Fast payment", "Once you accept the offer, we complete the transaction without unnecessary delays."]
  ];
  const process = [
    ["Contact AG Refining", "Tell us what coins you have and how large the collection is."],
    ["Professional evaluation", "We inspect the coin type, silver content, weight, and condition."],
    ["Review your offer", "We explain the offer using the current silver market and the coins we confirmed."],
    ["Get paid", "If you choose to sell, we complete the transaction and issue prompt payment."]
  ];
  const related = materialPages.filter((candidate) => candidate.path !== page.path).slice(0, 3);
  const content = `
    <section class="page-hero coin-hero">
      <div class="shell">
        ${breadcrumbs([["Home", "/"], ["Materials", "/accepted-materials"], ["Silver coins", null]])}
        <div class="service-hero-grid">
          <div class="service-hero-copy" data-reveal>
            ${assayLine("Ag / Coin evaluation")}
            <p class="eyebrow">${page.eyebrow}</p>
            <h1>${page.heading}</h1>
            <p>${page.intro}</p>
            <div class="coin-hero-actions">
              <a class="button button-primary" href="/contact?intent=pickup&material=silver_coins">${primaryCta} ${arrow}</a>
              <a class="phone-link" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
            </div>
            <p class="coin-hero-note">No pressure to sell. We explain the offer before any transaction.</p>
          </div>
          <figure class="service-visual coin-visual">
            <img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" fetchpriority="high">
            <figcaption><span>Ag</span><p>Silver<br>Atomic no. 47</p></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="answer-band coin-answer-band">
      <div class="shell answer-grid">
        <p class="answer-index">A clear evaluation</p>
        <div><h2>${page.answerHeading}</h2><p>${page.answerText}</p></div>
      </div>
    </section>

    <section class="section coin-types-section">
      <div class="shell coin-types-layout">
        <div class="coin-types-intro">
          <p class="eyebrow">Silver coins we buy</p>
          <h2>One coin or a full collection.</h2>
          <p>Circulated, tarnished, and inherited coins may still have strong silver value. Bring the full lot so we can review it clearly.</p>
        </div>
        <ul class="coin-types-list">
          ${coinTypes.map((type) => `<li><span aria-hidden="true"></span>${type}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="coin-value-section">
      <div class="shell coin-value-grid">
        <div class="coin-value-mark" aria-hidden="true"><span>47</span><strong>Ag</strong><small>107.868</small></div>
        <div>
          <p class="eyebrow">How we determine value</p>
          <h2>Every offer starts with the facts.</h2>
          <p>We look at the coin type, silver content, total weight, condition, and current silver market. We then explain how those facts affect your offer.</p>
          <p class="coin-caution"><strong>Collector-value note:</strong> Some rare, key-date, certified, or graded coins may be worth more as collectibles than for their silver. A coin specialist may be the better path for those pieces.</p>
        </div>
      </div>
    </section>

    <section class="section coin-reasons-section">
      <div class="shell coin-reasons-layout">
        <div class="coin-reasons-intro">
          <p class="eyebrow">Why choose AG Refining</p>
          <h2>Trusted local service without the pressure.</h2>
          <p>We want you to understand the offer and feel comfortable with your decision.</p>
        </div>
        <div class="coin-reasons-list">
          ${reasons.map(([heading, text]) => `<article><h3>${heading}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="section coin-process-section">
      <div class="shell">
        <div class="section-title-row">
          <div><p class="eyebrow">Our simple selling process</p><h2>Four steps from coins to cash.</h2></div>
          <p class="section-intro-small">You stay in control. The sale happens only after you review and accept the offer.</p>
        </div>
        <ol class="coin-process">
          ${process.map(([heading, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${heading}</h3><p>${text}</p></div></li>`).join("")}
        </ol>
      </div>
    </section>

    <section class="section coin-trust-section">
      <div class="shell coin-trust-grid">
        <div><p class="eyebrow">Houston's trusted silver coin buyer</p><h2>Bring us the collection. Leave with clear answers.</h2></div>
        <div><p>AG Refining serves Houston and nearby communities. We buy from collectors, investors, estates, businesses, and individuals. Our goal is to make each transaction simple, secure, and easy to understand.</p><a class="text-link" href="/about">Read our family story ${arrow}</a></div>
      </div>
    </section>

    <section class="section faq-section">
      <div class="shell faq-grid"><div><p class="eyebrow">Common questions</p><h2>Answers before your evaluation.</h2></div>${faqMarkup(page.faqs)}</div>
    </section>

    <section class="section related">
      <div class="shell"><div class="section-title-row"><div><p class="eyebrow">Other silver materials</p><h2>More ways we can help.</h2></div></div>
        <div class="related-grid editorial-index">${related.map((item) => `<a class="related-card" href="/${item.path}"><span>${item.eyebrow}</span><h3>${item.heading}</h3><p>${item.intro}</p><b>${arrow}</b></a>`).join("")}</div>
      </div>
    </section>

    <section class="conversion-band coin-cta">
      <div class="shell" data-reveal>
        <p class="eyebrow">Ready to sell silver coins?</p>
        <h2>Request your coin evaluation.</h2>
        <p>Tell us what coins you have. We will confirm the right next step before you travel or move the collection.</p>
        <div class="hero-actions hero-actions-center">
          <a class="button button-inverse" href="/contact?intent=pickup&material=silver_coins">${primaryCta} ${arrow}</a>
          <a class="phone-link phone-link-inverse" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
        </div>
      </div>
    </section>`;
  const dir = join(out, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({
    title: page.title,
    description: page.description,
    path: page.path,
    content,
    image: page.image,
    pageSchema: [faqSchema(page.faqs)]
  }));
}

function longMaterialPage(page) {
  const process = [
    ["Share the material", "Tell us what it is, how much you have, its condition, and where it is stored."],
    ["Complete the review", "We confirm the records, handling needs, and whether the lot qualifies."],
    ["Plan the service", "If approved, we set the evaluation, pickup, weighing, and timing."],
    ["Review the offer", "You decide after we explain the confirmed material, market-based offer, and payment terms."]
  ];
  const related = materialPages
    .filter((candidate) => candidate.path !== page.path)
    .sort((a, b) => Number(Boolean(b.layout)) - Number(Boolean(a.layout)))
    .slice(0, 3);
  const content = `
    <section class="page-hero material-hero">
      <div class="shell">
        ${breadcrumbs([["Home", "/"], ["Materials", "/accepted-materials"], [page.eyebrow, null]])}
        <div class="service-hero-grid">
          <div class="service-hero-copy" data-reveal>
            ${assayLine("Ag / Material review")}
            <p class="eyebrow">${page.eyebrow}</p>
            <h1>${page.heading}</h1>
            <p>${page.intro}</p>
            <div class="material-hero-actions">
              <a class="button button-primary" href="/contact?intent=pickup&material=${page.materialQuery}">${primaryCta} ${arrow}</a>
              <a class="phone-link" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
            </div>
            <p class="material-hero-note">Nothing moves until the material and next step are confirmed.</p>
          </div>
          <figure class="service-visual material-visual">
            <img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" fetchpriority="high">
            <figcaption><span>Ag</span><p>Houston<br>Material review</p></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="answer-band material-answer-band">
      <div class="shell answer-grid">
        <p class="answer-index">What to know</p>
        <div><h2>${page.answerHeading}</h2><p>${page.answerText}</p></div>
      </div>
    </section>

    <section class="section material-types-section">
      <div class="shell material-types-layout">
        <div class="material-types-intro">
          <p class="eyebrow">What we review</p>
          <h2>${page.typesHeading}</h2>
          <p>${page.typesIntro}</p>
        </div>
        <ul class="material-types-list">
          ${page.types.map((type) => `<li><span aria-hidden="true"></span>${type}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="handling-inset material-guardrail-section">
      <div class="shell material-guardrail-grid">
        <div class="material-guardrail-mark" aria-hidden="true"><span>47</span><strong>Ag</strong><small>Review first</small></div>
        <div>
          <p class="eyebrow">Before anything moves</p>
          <h2>${page.guardrailHeading}</h2>
          <p>${page.guardrailText}</p>
          <a class="text-link" href="/contact?intent=quote&material=${page.materialQuery}">Ask about your material ${arrow}</a>
        </div>
      </div>
    </section>

    <section class="section material-audience-section">
      <div class="shell material-audience-grid">
        <div>
          <p class="eyebrow">Who we serve</p>
          <h2>${page.audienceHeading}</h2>
          <p>${page.audienceText}</p>
        </div>
        <ul>${page.audiences.map((audience) => `<li>${audience}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section material-reasons-section">
      <div class="shell material-reasons-layout">
        <div class="material-reasons-intro">
          <p class="eyebrow">Why AG Refining</p>
          <h2>A clear process from review to payment.</h2>
          <p>Every lot is different. We confirm the facts before promising pickup, price, or timing.</p>
        </div>
        <div class="material-reasons-list">
          ${page.reasons.map(([heading, text]) => `<article data-reveal><h3>${heading}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="section material-process-section">
      <div class="shell">
        <div class="section-title-row">
          <div><p class="eyebrow">How it works</p><h2>Four steps. No guesswork.</h2></div>
          <p class="section-intro-small">Pickup, on-site weighing, and prompt payment are available when the approved material, account, location, and schedule qualify.</p>
        </div>
        <ol class="material-process">
          ${process.map(([heading, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${heading}</h3><p>${text}</p></div></li>`).join("")}
        </ol>
      </div>
    </section>

    <section class="section faq-section">
      <div class="shell faq-grid"><div><p class="eyebrow">Common questions</p><h2>Answers before the material moves.</h2></div>${faqMarkup(page.faqs)}</div>
    </section>

    <section class="section related">
      <div class="shell"><div class="section-title-row"><div><p class="eyebrow">Other silver materials</p><h2>Find the right review path.</h2></div></div>
        <div class="related-grid editorial-index">${related.map((item) => `<a class="related-card" href="/${item.path}"><span>${item.eyebrow}</span><h3>${item.heading}</h3><p>${item.intro}</p><b>${arrow}</b></a>`).join("")}</div>
      </div>
    </section>

    <section class="conversion-band material-cta">
      <div class="shell" data-reveal>
        <p class="eyebrow">Start with the facts</p>
        <h2>${page.ctaHeading}</h2>
        <p>${page.ctaText}</p>
        <div class="hero-actions hero-actions-center">
          <a class="button button-inverse" href="/contact?intent=pickup&material=${page.materialQuery}">${primaryCta} ${arrow}</a>
          <a class="phone-link phone-link-inverse" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
        </div>
      </div>
    </section>`;
  const dir = join(out, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({
    title: page.title,
    description: page.description,
    path: page.path,
    content,
    image: page.image,
    pageSchema: [faqSchema(page.faqs)]
  }));
}

function xrayHubPage(page) {
  const filmPaths = [
    {
      label: "Medical and dental film",
      title: "Medical X-ray Film Recycling",
      text: "For hospitals, clinics, imaging centers, dental practices, and approved record projects.",
      href: "/medical-x-ray-recycling"
    },
    {
      label: "Industrial and NDT film",
      title: "Industrial X-ray Silver Recycling",
      text: "For oil and gas, aerospace, weld inspection, manufacturing, and NDT programs.",
      href: "/industrial-x-ray-silver-recycling"
    }
  ];
  const industries = [
    "Hospitals and medical centers",
    "Imaging and orthopedic centers",
    "Dental offices and laboratories",
    "Universities and research labs",
    "Oil and gas companies",
    "Aerospace and manufacturing",
    "NDT inspection companies",
    "Government and approved facilities"
  ];
  const benefits = [
    ["Recover silver", "Traditional film emulsion may contain silver that can be recovered after the film is approved."],
    ["Clear storage", "Approved recycling can free archive space and reduce the cost of keeping obsolete film."],
    ["Plan secure handling", "We discuss access, packaging, transport, chain of custody, and available documentation before pickup."],
    ["Schedule local service", "Qualifying Houston projects may be eligible for pickup and a market-based offer."]
  ];
  const content = `
    <section class="page-hero xray-hub-hero">
      <div class="shell">
        ${breadcrumbs([["Home", "/"], ["Materials", "/accepted-materials"], ["X-ray recycling", null]])}
        <div class="service-hero-grid">
          <div class="service-hero-copy" data-reveal>
            <p class="eyebrow">${page.eyebrow}</p>
            <h1>${page.heading}</h1>
            <p>${page.intro}</p>
            <div class="material-hero-actions">
              <a class="button button-primary" href="/contact?intent=pickup&material=xray_film">${primaryCta} ${arrow}</a>
              <a class="phone-link" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
            </div>
            <p class="material-hero-note">Do not upload patient information, private records, or readable X-ray images.</p>
          </div>
          <figure class="service-visual material-visual">
            <img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" fetchpriority="high">
            <figcaption><span>Ag</span><p>Film review<br>Silver recovery</p></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="answer-band">
      <div class="shell answer-grid">
        <p class="answer-index">Film or digital?</p>
        <div><h2>${page.answerHeading}</h2><p>${page.answerText}</p></div>
      </div>
    </section>

    <section class="section xray-path-section">
      <div class="shell">
        <div class="section-title-row">
          <div><p class="eyebrow">Choose the film type</p><h2>Two paths. One clear first step.</h2></div>
          <p class="section-intro-small">Choose the page that best matches your organization and material.</p>
        </div>
        <div class="pathway-list xray-path-grid">
          ${filmPaths.map((item) => `<a href="${item.href}" data-reveal><span>${item.label}</span><h3>${item.title}</h3><p>${item.text}</p><b>View service ${arrow}</b></a>`).join("")}
        </div>
      </div>
    </section>

    <section class="handling-inset xray-security-section">
      <div class="shell xray-security-grid">
        <div class="xray-security-mark" aria-hidden="true"><span>Chain</span><strong>of</strong><small>custody</small></div>
        <div>
          <p class="eyebrow">Privacy and records</p>
          <h2>Confirm your duties before film leaves the site.</h2>
          <p>Your organization is responsible for its own privacy, record-retention, destruction, and industry rules. Before pickup, we can discuss the film type, approved access, packaging, transport, chain-of-custody needs, and available project records.</p>
          <p><strong>Documentation:</strong> Ask what can be included and confirm it in writing before pickup. AG Refining does not make a blanket HIPAA or legal-compliance guarantee.</p>
        </div>
      </div>
    </section>

    <section class="section xray-benefits-section">
      <div class="shell material-reasons-layout">
        <div class="material-reasons-intro">
          <p class="eyebrow">Why recycle X-ray film</p>
          <h2>Recover value and clear old storage.</h2>
          <p>Traditional film may be worth more as a reviewed recycling project than as a disposal cost.</p>
        </div>
        <div class="material-reasons-list">
          ${benefits.map(([heading, text]) => `<article data-reveal><h3>${heading}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="section xray-industries-section">
      <div class="shell material-types-layout">
        <div class="material-types-intro">
          <p class="eyebrow">Industries we serve</p>
          <h2>Medical, industrial, and public-sector projects.</h2>
          <p>Every archive has different privacy, access, and logistics needs. We review those needs before scheduling.</p>
        </div>
        <ul class="material-types-list">${industries.map((item) => `<li><span aria-hidden="true"></span>${item}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section faq-section">
      <div class="shell faq-grid"><div><p class="eyebrow">Common questions</p><h2>Answers before pickup.</h2></div>${faqMarkup(page.faqs)}</div>
    </section>

    <section class="conversion-band">
      <div class="shell" data-reveal>
        <p class="eyebrow">Houston X-ray recycling</p>
        <h2>Start with a film and records review.</h2>
        <p>Tell us the film type, box count or weight, date range, storage method, location, and security needs. Do not send private records.</p>
        <div class="hero-actions hero-actions-center">
          <a class="button button-inverse" href="/contact?intent=pickup&material=xray_film">${primaryCta} ${arrow}</a>
          <a class="phone-link phone-link-inverse" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
        </div>
      </div>
    </section>`;
  const dir = join(out, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({
    title: page.title,
    description: page.description,
    path: page.path,
    content,
    image: page.image,
    pageSchema: [faqSchema(page.faqs)]
  }));
}

function houstonHubPage(page) {
  const advantages = [
    "Family-owned and Houston-based",
    "Free pickup for qualifying accounts",
    "We come to your facility",
    "On-site weighing when available",
    "Prompt payment for approved sales",
    "Honest, market-based pricing",
    "Commercial and industrial accounts",
    "Clear communication",
    "Fast scheduling when available",
    "One-time and repeat material reviews"
  ];
  const services = [
    ["Scrap Silver", "Wire, contacts, solder, sterling, bars, production scrap, and more.", "/scrap-silver-buyer-houston"],
    ["X-Ray Film", "Medical, dental, industrial, and NDT film review and silver recovery.", "/x-ray-recycling-services-houston"],
    ["Silver Oxide Batteries", "Sorted commercial watch-battery lots with confirmed chemistry.", "/silver-oxide-watch-battery-recycling-houston"],
    ["Laboratory Silver", "Identified lab silver, compounds, solutions, powders, and approved material.", "/laboratory-silver-buyer-houston"]
  ];
  const cities = [
    "Houston", "Pearland", "Pasadena", "Sugar Land", "Katy", "Cypress", "Spring", "The Woodlands",
    "Conroe", "Humble", "Baytown", "League City", "Friendswood", "Missouri City", "Richmond", "Rosenberg",
    "Tomball", "Bellaire", "Deer Park", "La Porte", "Texas City", "Galveston"
  ];
  const process = [
    ["Contact AG Refining", "Tell us the material, amount, condition, and location."],
    ["Confirm the material", "We review the details and any records needed for safe handling."],
    ["Schedule service", "If the lot qualifies, we plan the pickup or evaluation."],
    ["Review the weight and offer", "Qualifying lots can be weighed on-site before you accept."],
    ["Get paid", "Payment timing is confirmed with the approved offer and transaction."]
  ];
  const content = `
    <section class="page-hero houston-hub-hero">
      <div class="shell">
        ${breadcrumbs([["Home", "/"], ["Service areas", "/service-areas"], ["Houston", null]])}
        <div class="service-hero-grid">
          <div class="service-hero-copy" data-reveal>
            ${assayLine("Ag / Houston")}
            <p class="eyebrow">${page.eyebrow}</p>
            <h1>${page.heading}</h1>
            <p>${page.intro}</p>
            <div class="material-hero-actions">
              <a class="button button-primary" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
              <a class="phone-link" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
            </div>
            <p class="material-hero-note">Pickup, on-site weighing, and prompt payment depend on the material, account, location, and schedule.</p>
          </div>
          <figure class="service-visual material-visual">
            <img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" fetchpriority="high">
            <figcaption><span>47</span><p>Houston<br>Silver buyer</p></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="answer-band">
      <div class="shell answer-grid">
        <p class="answer-index">Local silver service</p>
        <div><h2>${page.answerHeading}</h2><p>${page.answerText}</p></div>
      </div>
    </section>

    <section class="section houston-advantages-section">
      <div class="shell material-types-layout">
        <div class="material-types-intro">
          <p class="eyebrow">Why businesses choose AG Refining</p>
          <h2>Houston service built around your facility.</h2>
          <p>We focus on clear facts, professional handling, and a process your team can understand.</p>
        </div>
        <ul class="material-types-list">${advantages.map((item) => `<li><span aria-hidden="true"></span>${item}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section houston-services-section">
      <div class="shell">
        <div class="section-title-row">
          <div><p class="eyebrow">Materials and services</p><h2>Choose the closest material.</h2></div>
          <a class="text-link" href="/accepted-materials">View all materials ${arrow}</a>
        </div>
        <div class="houston-services-grid">
          ${services.map(([title, text, href]) => `<a href="${href}" data-reveal><h3>${title}</h3><p>${text}</p><b>View page ${arrow}</b></a>`).join("")}
        </div>
      </div>
    </section>

    <section class="section houston-process-section">
      <div class="shell">
        <div class="section-title-row">
          <div><p class="eyebrow">Sell your silver the easy way</p><h2>From first call to final payment.</h2></div>
          <p class="section-intro-small">You approve the offer before a sale is completed.</p>
        </div>
        <ol class="houston-process">
          ${process.map(([heading, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${heading}</h3><p>${text}</p></div></li>`).join("")}
        </ol>
      </div>
    </section>

    <section class="houston-area-section">
      <div class="shell houston-area-grid">
        <div>
          <p class="eyebrow">Houston Metro service area</p>
          <h2>Serving businesses across Southeast Texas.</h2>
          <p>If your business is in or near the Houston Metro Area, ask whether your material qualifies for local pickup.</p>
        </div>
        <ul>${cities.map((city) => `<li>${city}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section faq-section">
      <div class="shell faq-grid"><div><p class="eyebrow">Frequently asked questions</p><h2>Clear answers before pickup.</h2></div>${faqMarkup(page.faqs)}</div>
    </section>

    <section class="conversion-band">
      <div class="shell" data-reveal>
        <p class="eyebrow">Ready to sell your silver?</p>
        <h2>Schedule your Houston material review.</h2>
        <p>Tell us what you have and where it is. We will confirm the right next step.</p>
        <div class="hero-actions hero-actions-center">
          <a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a>
          <a class="phone-link phone-link-inverse" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
        </div>
      </div>
    </section>`;
  const dir = join(out, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({
    title: page.title,
    description: page.description,
    path: page.path,
    content,
    image: page.image,
    pageSchema: [faqSchema(page.faqs)]
  }));
}

allServicePages.forEach((page) => {
  if (page.path === "sell-silver-coins-houston") {
    coinServicePage(page);
    return;
  }
  if (page.layout === "long-material") {
    longMaterialPage(page);
    return;
  }
  if (page.layout === "xray-hub") {
    xrayHubPage(page);
    return;
  }
  if (page.layout === "houston-hub") {
    houstonHubPage(page);
    return;
  }
  servicePage(page);
});

function taxonomyPage({ path, title, description, eyebrow, heading, intro, items }) {
  const cards = items.map((page) => `<a class="taxonomy-card" href="/${page.path}" data-reveal>
    <figure class="taxonomy-image"><img src="/assets/${page.image}" alt="${page.imageAlt}" width="1280" height="819" loading="lazy"></figure>
    <div><p class="eyebrow">${page.eyebrow}</p><h2>${page.heading}</h2><p>${page.intro}<b>View page ${arrow}</b></p></div>
  </a>`).join("");
  const content = `
    <section class="page-hero page-intro"><div class="shell">${breadcrumbs([["Home", "/"], [eyebrow, null]])}<div class="page-intro-grid"><div><p class="eyebrow">${eyebrow}</p><h1>${heading}</h1></div><p>${intro}</p></div></div></section>
    <section class="section decision-section"><div class="shell"><div class="editorial-index taxonomy-grid">${cards}</div></div></section>
    <section class="conversion-band"><div class="shell"><p class="eyebrow">Not sure?</p><h2>Tell us what you have.</h2><p>We will help you find the right material page and pickup path.</p><a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></div></section>`;
  const dir = join(out, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), document({ title, description, path, content }));
}

taxonomyPage({
  path: "accepted-materials",
  title: "Silver Materials We Buy | AG Refining Houston",
  description: "See the scrap silver, X-ray film, silver oxide batteries, coins, jewelry, dental material, and industrial silver AG Refining reviews.",
  eyebrow: "Materials",
  heading: "Silver materials we buy.",
  intro: "Choose the closest material. Each page explains what to share, what may qualify, and how pickup works.",
  items: materialPages
});

taxonomyPage({
  path: "industries",
  title: "Industries We Serve | Houston Silver Buyer | AG Refining",
  description: "AG Refining serves hospitals, dental labs, oil and gas companies, manufacturers, universities, and electronics companies in Houston.",
  eyebrow: "Industries",
  heading: "Silver service built for business.",
  intro: "Different industries create different silver-bearing material. Start with the page that best matches your operation.",
  items: industryPages
});

taxonomyPage({
  path: "service-areas",
  title: "Houston Metro Silver Pickup Service Areas | AG Refining",
  description: "See AG Refining silver pickup service areas across Houston, Pearland, Pasadena, Sugar Land, Katy, The Woodlands, Conroe, and nearby cities.",
  eyebrow: "Service areas",
  heading: "Silver pickup across the Houston Metro Area.",
  intro: "Free pickup may be available for qualifying commercial and industrial accounts. Choose your closest service area.",
  items: locationPages
});

const howItWorks = `
  <section class="page-hero page-intro"><div class="shell">${breadcrumbs([["Home", "/"], ["How it works", null]])}<div class="page-intro-grid"><div><p class="eyebrow">How it works</p><h1>Six clear steps from silver to cash.</h1></div><p>You know what happens before the material moves.</p></div></div></section>
  <section class="section process-page"><div class="shell"><ol class="assay-process process-rail">
    <li><span>01</span><div><h2>Tell us what you have.</h2><p>Call or use the form. Share the material type, amount, condition, location, and whether it is a one-time or repeat lot.</p></div></li>
    <li><span>02</span><div><h2>We review the details.</h2><p>We may ask for markings, weights, photos, box counts, or other simple facts needed to understand the lot.</p></div></li>
    <li><span>03</span><div><h2>Schedule the pickup.</h2><p>If the lot qualifies, we choose a time that works for your facility. Free pickup is available for qualifying Houston Metro commercial accounts.</p></div></li>
    <li><span>04</span><div><h2>We weigh on-site.</h2><p>You can see the material weight before payment. This keeps the process clear.</p></div></li>
    <li><span>05</span><div><h2>Review the offer.</h2><p>The offer depends on the confirmed material, recoverable silver, weight, condition, and current silver market values.</p></div></li>
    <li><span>06</span><div><h2>Get paid.</h2><p>Fast payment is available for qualifying transactions. Timing depends on the material and agreed terms.</p></div></li>
  </ol></div></section>
  <section class="conversion-band"><div class="shell"><p class="eyebrow">Start now</p><h2>Schedule a free pickup.</h2><p>Tell us what silver you have and where it is.</p><a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></div></section>`;
mkdirSync(join(out, "how-it-works"), { recursive: true });
writeFileSync(join(out, "how-it-works", "index.html"), document({
  title: "How to Sell Silver in Houston | AG Refining",
  description: "See the six-step AG Refining process: contact, schedule, pickup, on-site weighing, offer, and fast qualifying payment.",
  path: "how-it-works",
  content: howItWorks
}));

const about = `
  <section class="page-hero page-intro"><div class="shell">${breadcrumbs([["Home", "/"], ["Our story", null]])}<div class="page-intro-grid"><div><p class="eyebrow">The Stevens family</p><h1>Built on fairness and hard work.</h1></div><p>AG Refining is a Houston-based family business with a direct promise: treat people fairly and make the silver-selling process clear.</p></div></div></section>
  <section class="section provenance-story about-story"><div class="shell legacy-editorial"><div><p class="legacy-number">Ag</p><p class="legacy-caption">Silver, atomic number 47</p></div><div><p class="eyebrow">The family story</p><blockquote>“My father taught us the importance of honesty, hard work, and respect.”</blockquote><cite>Dennis Stevens</cite><p>John Stevens built his reputation by working hard and treating customers fairly. Years later, Dennis returned to silver refining after his youngest son asked him to melt a small amount of old silver. The work felt familiar. It also showed him what the family could build next.</p><p>Today, AG Refining helps Houston businesses turn silver-bearing material into cash through clear pickup, weighing, pricing, and payment.</p></div></div></section>
  <section class="conversion-band"><div class="shell"><p class="eyebrow">Work with AG Refining</p><h2>Let us earn your business.</h2><p>Start with a clear review of your material.</p><a class="button button-inverse" href="/contact?intent=pickup">${primaryCta} ${arrow}</a></div></section>`;
mkdirSync(join(out, "about"), { recursive: true });
writeFileSync(join(out, "about", "index.html"), document({
  title: "About AG Refining | Houston Family-Owned Silver Buyer",
  description: "Meet the Stevens family and learn how AG Refining brings fairness, hard work, and clear service to Houston silver buying.",
  path: "about",
  content: about
}));

function reviewForm() {
  return `<form id="review-form" class="review-form" data-review-form action="/api/leads" method="post" novalidate>
    <div class="form-errors field-wide" data-form-errors tabindex="-1" hidden></div>
    <input type="hidden" name="intent" value="pickup">
    <input type="hidden" name="form_started" value="">
    <input type="hidden" name="submission_key" value="">
    <div class="field"><label for="name">Name <span>Required</span></label><input id="name" name="name" type="text" autocomplete="name" required></div>
    <div class="field"><label for="business">Business</label><input id="business" name="business" type="text" autocomplete="organization"></div>
    <div class="field"><label for="phone">Phone <span>Required</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
    <div class="field"><label for="email">Email <span>Required</span></label><input id="email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="material">Material <span>Required</span></label><select id="material" name="material" required>
      <option value="">Select one</option><option value="scrap_silver">Scrap silver</option><option value="industrial_silver">Industrial silver</option><option value="silver_flake">Silver flake</option><option value="laboratory_silver">Laboratory silver</option><option value="silver_solder">Silver solder</option><option value="silver_plated">Silver-plated material</option><option value="silver_bars">Silver bars</option><option value="silver_flatware">Silver flatware</option><option value="jewelry_scrap">Jewelry store scrap</option><option value="dental_material">Dental material</option><option value="silver_oxide_batteries">Watch batteries</option><option value="xray_film">X-ray film</option><option value="silver_coins">Silver coins</option><option value="unknown">Not sure</option>
    </select></div>
    <div class="field"><label for="quantity">Approximate amount</label><input id="quantity" name="quantity" type="text" maxlength="120" placeholder="Weight, boxes, drums, or pallets"></div>
    <div class="field"><label for="location">Pickup location <span>Required</span></label><input id="location" name="location" type="text" maxlength="180" placeholder="City or business address" required></div>
    <div class="field"><label for="frequency">How often?</label><select id="frequency" name="frequency"><option value="one_time">One-time lot</option><option value="recurring">Recurring material</option><option value="unknown">Not sure</option></select></div>
    <div class="field field-wide"><label for="details">What should we know? <span>Required</span></label><textarea id="details" name="details" required minlength="20" placeholder="Describe the material, condition, source, and anything that may affect pickup."></textarea></div>
    <fieldset class="field field-wide preferred-contact"><legend>Preferred contact</legend><label><input type="radio" name="preferred_contact" value="phone" checked> Phone</label><label><input type="radio" name="preferred_contact" value="email"> Email</label></fieldset>
    <div class="honeypot" aria-hidden="true"><label for="company_url">Company website</label><input id="company_url" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
    <p class="form-note field-wide">This request is not a final quote or pickup promise. Free pickup and fast payment depend on the material, location, account type, and schedule. Do not send patient records, passwords, financial data, or identity documents. See our <a href="/privacy">privacy notice</a>.</p>
    <div class="form-actions field-wide"><button class="button button-primary" type="submit" data-submit-button>Send request ${arrow}</button><p class="form-status" data-form-status aria-live="polite"></p></div>
  </form>`;
}

const contact = `
  <section class="page-hero page-intro page-intro-contact"><div class="shell">${breadcrumbs([["Home", "/"], ["Contact", null]])}<div class="page-intro-grid"><div><p class="eyebrow">Schedule pickup</p><h1>Tell us what silver you have.</h1></div><p>Share the material, amount, and location. We will confirm whether it qualifies and explain the next step.</p></div></div></section>
  <section class="section contact-section"><div class="shell contact-grid">
    <aside class="expectation-rail contact-aside"><p class="eyebrow">Contact AG Refining</p><h2>Prefer to talk first?</h2>
      <a class="contact-line" href="tel:${phoneHref}"><span>Phone</span><strong>${phoneDisplay}</strong></a>
      <a class="contact-line" href="mailto:${email}"><span>Email</span><strong>${email}</strong></a>
      <div class="contact-line"><span>Address</span><strong>${street}<br>${cityLine}</strong></div>
      <div class="contact-boundary"><h3>Before you ship or visit</h3><p>Call first. We will confirm the material, pickup option, and next step.</p></div>
    </aside>
    <div><p class="eyebrow">Pickup and quote request</p><h2>Start with a few details.</h2>${reviewForm()}</div>
  </div></section>`;
mkdirSync(join(out, "contact"), { recursive: true });
writeFileSync(join(out, "contact", "index.html"), document({
  title: "Schedule Silver Pickup in Houston | Contact AG Refining",
  description: "Schedule a qualifying silver pickup or request a quote from AG Refining in Houston. Share your material, amount, and location.",
  path: "contact",
  content: contact
}));

const spanish = `
  <section class="page-hero page-intro"><div class="shell">${breadcrumbs([["Inicio", "/"], ["Español", null]])}<div class="page-intro-grid"><div><p class="eyebrow">Servicio en español</p><h1>Venda su plata en Houston.</h1></div><p>AG Refining ofrece recogida gratis para cuentas comerciales que califican, pesaje en su local y precios claros.</p></div></div></section>
  <section class="section"><div class="shell spanish-materials">
    <article><h2>Recogida</h2><p>Cuéntenos qué material tiene, cuánto pesa y dónde está. Confirmaremos si la recogida califica.</p></article>
    <article><h2>Pesaje</h2><p>Pesamos el material en su presencia para que pueda ver el peso antes del pago.</p></article>
    <article><h2>Pago inmediato</h2><p>El pago inmediato está disponible para la mayoría de las transacciones que califican. El tiempo depende del material y los términos acordados.</p></article>
    <article><h2>Llame primero</h2><p>No envíe material ni visite sin confirmar el siguiente paso. Llame al ${phoneDisplay}.</p></article>
  </div></section>
  <section class="conversion-band"><div class="shell"><p class="eyebrow">Comience hoy</p><h2>Solicite una recogida.</h2><a class="button button-inverse" href="/contact?intent=pickup">Enviar solicitud ${arrow}</a></div></section>`;
mkdirSync(join(out, "espanol"), { recursive: true });
writeFileSync(join(out, "espanol", "index.html"), document({
  title: "Comprador de Plata en Houston | AG Refining",
  description: "Venda plata en Houston con AG Refining. Recogida gratis para cuentas que califican, pesaje en su local y precios claros.",
  path: "espanol",
  lang: "es",
  content: spanish
}));

const privacy = `
  <section class="page-hero page-intro"><div class="shell">${breadcrumbs([["Home", "/"], ["Privacy", null]])}<div class="page-intro-grid"><div><p class="eyebrow">Privacy</p><h1>How we handle website requests.</h1></div><p>This page explains the information collected through the AG Refining website.</p></div></div></section>
  <section class="section"><div class="shell legal-grid"><nav aria-label="Privacy sections"><a href="#collect">What we collect</a><a href="#use">How we use it</a><a href="#avoid">What not to send</a><a href="#contact-privacy">Contact</a></nav><div>
    <section id="collect"><h2>What we collect</h2><p>The pickup form asks for your name, business, phone, email, material, amount, location, preferred contact method, and details you choose to provide. Basic website attribution may also be stored to understand how you found the site.</p></section>
    <section id="use"><h2>How we use it</h2><p>AG Refining uses the information to review your request, contact you, plan a possible pickup, and improve the website. We do not promise a quote or pickup from a form submission alone.</p></section>
    <section id="avoid"><h2>What not to send</h2><p>Do not send patient records, passwords, financial account data, identity documents, controlled records, or other sensitive information through the public form.</p></section>
    <section id="contact-privacy"><h2>Contact</h2><p>Questions can be sent to <a href="mailto:${email}">${email}</a> or discussed by phone at <a href="tel:${phoneHref}">${phoneDisplay}</a>.</p></section>
  </div></div></section>`;
mkdirSync(join(out, "privacy"), { recursive: true });
writeFileSync(join(out, "privacy", "index.html"), document({
  title: "Privacy | AG Refining",
  description: "Learn what information the AG Refining website collects and how pickup and quote requests are handled.",
  path: "privacy",
  content: privacy
}));

writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);

const staticPaths = ["", "accepted-materials", "industries", "service-areas", "how-it-works", "about", "contact", "espanol", "privacy"];
const sitemapPaths = [...staticPaths, ...allServicePages.map((page) => page.path)];
const sitemapUrls = sitemapPaths.map((path) => `<url><loc>${siteUrl}/${path}</loc><lastmod>2026-07-30</lastmod></url>`).join("");
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls}</urlset>`);

writeFileSync(join(out, "404.html"), document({
  title: "Page Not Found | AG Refining",
  description: "The requested AG Refining page could not be found.",
  path: "404",
  robots: "noindex,follow",
  content: `<section class="page-hero page-intro"><div class="shell"><p class="eyebrow">404</p><h1>That page is not here.</h1><p>View the materials we buy or schedule a pickup.</p><p><a class="button button-primary" href="/accepted-materials">View materials ${arrow}</a></p></div></section>`
}));

console.log(`Built ${sitemapPaths.length} public pages in dist`);
