// Southeast Houston area pages. Each page carries local facts (drive routes, landmarks, ZIP codes)
// so it is useful on its own and not a doorway page. Drive distances and times are OpenStreetMap
// (OSRM) route estimates without traffic, checked 2026-11-23. Do not add claims Dennis has not confirmed.
export const areasPublished = "2026-11-23";

const visit = "<p>Our office is at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, on Airport Blvd. between Monroe Road and the Gulf Freeway (I-45), about half a mile west of the freeway. Hours are Monday through Friday 9:00 AM to 5:00 PM and Saturday 9:00 AM to 12:00 PM. Closed Sunday. Please call (281) 898-2719 before you come so we can confirm what you have. Hablamos español.</p>";
const bring = "<p>Bring the silver as it is, without polishing or sorting, and a government-issued photo ID. Texas law requires dealers that buy crafted precious metal to record the seller’s name, physical description, and address.</p>";
const law = ["Texas Occupations Code 1956.063", "https://statutes.capitol.texas.gov/Docs/OC/htm/OC.1956.htm#1956.063"];
const ftc = ["FTC Jewelry Guides, 16 CFR 23.5", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23/section-23.5"];

export const areaPages = [
  {
    path: "silver-buyer-hobby-airport",
    city: "Hobby Airport",
    title: "Silver Buyer Near Hobby Airport | Southeast Houston | AG Refining",
    description: "AG Refining is a silver buyer on Airport Blvd. near Hobby Airport, minutes from Park Place, Meadowbrook, Glenbrook Valley, Golfcrest, and Edgebrook.",
    eyebrow: "Hobby Airport and Southeast Houston",
    heading: "Silver Buyer Near Hobby Airport in Southeast Houston",
    answer: "AG Refining buys sterling silver, silver coins, flatware, and industrial silver at 9125 Airport Blvd., Suite B-1, Houston, TX 77061, a short drive east of Hobby Airport. Call (281) 898-2719 before you visit.",
    areaServed: ["Park Place", "Meadowbrook", "Glenbrook Valley", "Golfcrest", "Gulfgate", "Edgebrook", "Hobby"],
    sections: [
      ["Neighborhoods Close to Us", "<p>We are part of the Hobby Airport area. These neighborhoods are usually a short drive away:</p><ul><li><strong>Glenbrook Valley:</strong> about 1.6 miles, using Glencrest Street and Airport Blvd.</li><li><strong>Edgebrook and the Almeda Mall area:</strong> about 2.5 to 3 miles, using the Gulf Freeway frontage road to Airport Blvd.</li><li><strong>Meadowbrook:</strong> about 3 miles, using Howard Drive and the Gulf Freeway frontage road.</li><li><strong>Park Place:</strong> about 3.5 miles, using Broadway Street and the Gulf Freeway.</li><li><strong>Golfcrest and Gulfgate:</strong> about 4.5 miles, taking the Gulf Freeway south to Airport Blvd.</li></ul><p>Distances are map estimates. Most of these drives take under 10 minutes without traffic.</p>"],
      ["Local Landmarks", "<p>From Hobby Airport, head east on Airport Blvd. toward the Gulf Freeway. After you pass Monroe Road, we are on the way to the freeway. If you reach the Gulf Freeway, you have gone too far. The historic 1940 Air Terminal Museum on Travelair Street sits on the west side of the airport.</p>"],
      ["Who We Help in Southeast Houston", "<ul><li>Families with inherited sterling flatware, tea sets, or coin collections</li><li>Neighbors selling old 90% silver dimes, quarters, and half dollars</li><li>Dental offices, clinics, and labs with silver-bearing film or scrap</li><li>Jewelers and repair shops with silver oxide watch batteries or bench scrap</li><li>Shops and plants along the Gulf Freeway with silver solder, contacts, or wire</li></ul>"],
      ["What To Bring", bring],
      ["Visit or Schedule a Pickup", `${visit}<p>Qualifying business lots in southeast Houston may be picked up. We confirm the material and schedule first.</p>`]
    ],
    faqs: [
      ["Where is AG Refining near Hobby Airport?", "9125 Airport Blvd., Suite B-1, Houston, TX 77061. It is on Airport Blvd. east of Hobby Airport, between Monroe Road and the Gulf Freeway."],
      ["Do I need an appointment?", "Please call (281) 898-2719 first so we can confirm what you have and that someone is ready to review it."],
      ["Do you buy silver coins from Park Place and Meadowbrook residents?", "Yes. We review silver coins, sterling, and flatware from anyone in the area. Bring a photo ID."],
      ["Can you pick up from a business near Hobby?", "Pickup may be available for qualifying business lots. Call with the material type and amount."]
    ],
    sources: [law, ftc],
    related: ["sell-estate-silver-houston", "sell-silver-coins-houston", "silver-buyer-south-houston"]
  },
  {
    path: "silver-buyer-south-houston",
    city: "South Houston",
    title: "Silver Buyer for South Houston, TX 77587 | AG Refining",
    description: "AG Refining is about 1.6 miles from the City of South Houston via College Avenue and Airport Blvd. Sterling, coins, flatware, and business silver.",
    eyebrow: "City of South Houston",
    heading: "Silver Buyer for the City of South Houston",
    answer: "AG Refining is about 1.6 miles from the City of South Houston (77587), using College Avenue and Airport Blvd. We review sterling silver, silver coins, flatware, and business silver. Call (281) 898-2719 before you visit.",
    areaServed: ["South Houston"],
    sections: [
      ["How To Get Here From South Houston", "<p>Take College Avenue west toward the Gulf Freeway (I-45). Once you cross the freeway, College Avenue becomes Airport Blvd. Our office is about half a mile past the freeway. The drive is about 1.6 miles and usually takes a few minutes without traffic.</p>"],
      ["What South Houston Residents Bring Us", "<ul><li>Sterling flatware and serving pieces marked 925 or Sterling</li><li>Silver dimes, quarters, and half dollars dated 1964 or earlier</li><li>Kennedy half dollars from 1965 to 1970, which contain 40% silver</li><li>Silver bars and rounds</li><li>Mixed drawers of sterling and silver plate. We sort them with you</li></ul>"],
      ["Local Businesses", "<p>Shops, dental offices, and small manufacturers in South Houston can call about silver solder, contacts, X-ray film, or silver oxide batteries. Pickup may be available for qualifying lots.</p>"],
      ["What To Bring", bring],
      ["Hours and Location", visit]
    ],
    faqs: [
      ["How far is AG Refining from South Houston?", "About 1.6 miles from the city center, using College Avenue and Airport Blvd."],
      ["Do you buy silver plate?", "Silver plate has only a thin layer of silver. We can look at a plated lot and tell you whether it has recoverable value, but we cannot promise to buy it."],
      ["Do you speak Spanish?", "Yes. Hablamos español."]
    ],
    sources: [law, ftc, ["APMEX, history of 90% silver coins", "https://learn.apmex.com/learning-guide/history/the-history-of-90-precent-silver-coins/"]],
    related: ["silver-buyer-pasadena", "guides/sterling-vs-silver-plate", "silver-buyer-hobby-airport"]
  },
  {
    path: "silver-buyer-clear-lake",
    city: "Clear Lake",
    title: "Silver Buyer for Clear Lake, Webster & League City | AG Refining",
    description: "From Clear Lake, Webster, Nassau Bay, or League City, AG Refining is a straight drive up the Gulf Freeway (I-45) to Airport Blvd. near Hobby Airport.",
    eyebrow: "Clear Lake and the Bay Area",
    heading: "Silver Buyer for Clear Lake, Webster, and League City",
    answer: "From Clear Lake, Webster, Nassau Bay, or League City, AG Refining is a straight drive north on the Gulf Freeway (I-45) to Airport Blvd., about 10 to 15 miles. We review sterling, silver coins, flatware, and business silver. Call (281) 898-2719 first.",
    areaServed: ["Clear Lake", "Webster", "Nassau Bay", "League City", "Seabrook"],
    sections: [
      ["How To Get Here From the Bay Area", "<p>Take the Gulf Freeway (I-45) north toward downtown Houston and exit toward Airport Blvd. Turn west onto Airport Blvd., away from South Houston. Our office is about half a mile west of the freeway.</p><ul><li><strong>Baybrook Mall area:</strong> about 10 miles</li><li><strong>Clear Lake City, via Bay Area Blvd.:</strong> about 12.5 miles</li><li><strong>Webster, via NASA Bypass:</strong> about 14 miles</li><li><strong>Space Center Houston, NASA Parkway:</strong> about 15 miles</li><li><strong>League City, via State Highway 3:</strong> about 15 miles</li></ul><p>Distances are map estimates. Most of these drives take about 15 to 20 minutes without traffic, longer at rush hour.</p>"],
      ["Why Call Before You Drive", "<p>The Bay Area is a longer trip, so call first. Describe what you have, what the marks say, and roughly how much there is. We will tell you whether it is worth the drive and what to bring.</p>"],
      ["What We Review", "<ul><li>Estate sterling, tea sets, and flatware</li><li>Silver coins and coin collections</li><li>Silver bars and rounds</li><li>For businesses: X-ray and NDT film, silver solder, contacts, lab silver, and silver oxide batteries</li></ul>"],
      ["Business Pickup in the Bay Area", "<p>Labs, clinics, dental offices, and manufacturers in the Clear Lake area may qualify for pickup. Call with the material type, amount, and location.</p>"],
      ["What To Bring", bring],
      ["Hours and Location", visit]
    ],
    faqs: [
      ["How do I get to AG Refining from Clear Lake?", "Take the Gulf Freeway (I-45) north to Airport Blvd. and turn west. The trip is about 12 to 15 miles from most of Clear Lake."],
      ["Do you pick up in Webster or League City?", "Pickup may be available for qualifying business lots. Call (281) 898-2719 to confirm."],
      ["Is my silver worth the drive?", "Call first and describe it. We will tell you honestly whether it makes sense to come in."]
    ],
    sources: [law, ftc],
    related: ["sell-estate-silver-houston", "silver-buyer-pearland", "guides/how-silver-is-valued"]
  }
];

// Local facts for the Pasadena and Pearland service pages (rendered by servicePage in build.mjs).
// Drive distances and times are OpenStreetMap (OSRM) route estimates without traffic, checked 2026-11-25.
// Landmark addresses were checked on official sites: City of Pasadena (1149 Ellsworth Drive),
// San Jacinto College (8060 Spencer Hwy.), and City of Pearland (3519 Liberty Drive).
const localNote = "<p>Distances are map estimates without traffic. Rush hour takes longer.</p>";
export const localServiceAreas = {
  "silver-buyer-pasadena": {
    title: "Silver Buyer for Pasadena and Deer Park, TX | AG Refining",
    description: "AG Refining is about 6 miles from Pasadena City Hall via Spencer Highway and College Avenue. Sterling, silver coins, flatware, and business silver.",
    eyebrow: "Pasadena and Deer Park",
    heading: "Silver Buyer for Pasadena and Deer Park",
    intro: "AG Refining is about 6 miles from Pasadena City Hall, on Airport Blvd. near Hobby Airport. We review sterling, silver coins, flatware, and business silver from Pasadena and Deer Park. Call (281) 898-2719 before you visit.",
    answerHeading: "A short drive west on Spencer Highway.",
    answerText: "Most of Pasadena is a straight drive west on Spencer Highway to College Avenue, which becomes Airport Blvd. once you cross the Gulf Freeway (I-45). Families and businesses are both welcome. Call first so we can confirm what you have.",
    localSections: [
      ["How To Get Here From Pasadena", `<p>Head west on Spencer Highway into South Houston, then follow College Avenue west across the Gulf Freeway (I-45). Past the freeway, College Avenue becomes Airport Blvd. Our office is about half a mile past the freeway, before Monroe Road.</p><ul><li><strong>Strawberry Park, on Strawberry Road:</strong> about 4.7 miles, about 9 minutes</li><li><strong>Pasadena City Hall, 1149 Ellsworth Drive:</strong> about 6 miles, about 11 minutes, using Shaver Street to Spencer Highway</li><li><strong>San Jacinto College Central Campus, 8060 Spencer Hwy.:</strong> about 9.7 miles, about 18 minutes, straight down Spencer Highway</li></ul>${localNote}`],
      ["What Pasadena Families Bring Us", "<ul><li>Sterling flatware, tea sets, and serving pieces marked 925 or Sterling</li><li>Silver dimes, quarters, and half dollars dated 1964 or earlier</li><li>Silver bars and rounds</li><li>Inherited estate silver that has not been sorted yet. We sort it with you</li></ul>"],
      ["Pasadena and Deer Park Businesses", "<p>Labs, dental offices, clinics, and industrial shops in Pasadena and Deer Park can call about X-ray and NDT film, silver solder, contacts, lab silver, or silver oxide batteries. Pickup may be available for qualifying lots. We confirm the material and schedule first.</p>"]
    ],
    faqs: [
      ["How far is AG Refining from Pasadena?", "About 6 miles from Pasadena City Hall, roughly 11 minutes without traffic, using Spencer Highway, College Avenue, and Airport Blvd."],
      ["Do you buy silver from Pasadena residents or only businesses?", "Both. We review sterling, silver coins, flatware, and bars from individuals and families, and we work with businesses. Bring a government-issued photo ID."],
      ["Do you pick up in Pasadena or Deer Park?", "Pickup may be available for qualifying business lots. Call (281) 898-2719 with the material type and amount."],
      ["Do I need an appointment?", "Please call (281) 898-2719 before you come so we can confirm what you have and that someone is ready to review it."],
      ["Do you speak Spanish?", "Yes. Hablamos español."]
    ]
  },
  "silver-buyer-pearland": {
    title: "Silver Buyer for Pearland, TX | Near Hobby Airport | AG Refining",
    description: "From Pearland, AG Refining is about 8 to 9 miles north via Pearland Parkway or Telephone Road and Monroe Road. Sterling, silver coins, and business silver.",
    eyebrow: "Pearland and South Houston",
    heading: "Silver Buyer for Pearland",
    intro: "AG Refining is about 8 to 9 miles north of central Pearland, on Airport Blvd. near Hobby Airport. We review sterling, silver coins, flatware, and business silver from Pearland families and businesses. Call (281) 898-2719 before you visit.",
    answerHeading: "Monroe Road brings you to our door.",
    answerText: "From most of Pearland, the drive ends on Monroe Road north to Airport Blvd. Turn east on Airport Blvd. and our office is between Monroe Road and the Gulf Freeway (I-45). Call first so we can confirm what you have.",
    localSections: [
      ["How To Get Here From Pearland", `<p><strong>From Pearland City Hall and east Pearland:</strong> take Pearland Parkway north, continue north on Monroe Road to Airport Blvd., and turn east.</p><p><strong>From Old Town Pearland:</strong> take Main Street (State Highway 35) north. It becomes Telephone Road. Turn east on Almeda-Genoa Road, then north on Monroe Road to Airport Blvd., and turn east.</p><ul><li><strong>Main Street and Broadway, Old Town Pearland:</strong> about 8 miles, about 14 minutes</li><li><strong>Pearland City Hall, 3519 Liberty Drive:</strong> about 8.7 miles, about 17 minutes</li><li><strong>Pearland Town Center, on Broadway at State Highway 288:</strong> about 15 miles, about 24 minutes, using State Highway 288 and Beltway 8 to Monroe Road</li></ul>${localNote}`],
      ["What Pearland Families Bring Us", "<ul><li>Sterling flatware and serving pieces from family estates</li><li>Silver coins and coin collections, including pre-1965 dimes, quarters, and half dollars</li><li>Silver bars and rounds</li><li>Mixed drawers of sterling and silver plate. We sort them with you</li></ul>"],
      ["Pearland Businesses", "<p>Dental offices, clinics, labs, and repair shops in Pearland can call about X-ray film, dental scrap, silver solder, or silver oxide watch batteries. Pickup may be available for qualifying lots. We confirm the material and schedule first.</p>"]
    ],
    faqs: [
      ["How far is AG Refining from Pearland?", "About 8 to 9 miles from central Pearland, roughly 15 to 20 minutes without traffic, using Pearland Parkway or Telephone Road, then Monroe Road to Airport Blvd."],
      ["Do you buy silver from Pearland residents or only businesses?", "Both. We review sterling, silver coins, flatware, and bars from individuals and families, and we work with businesses. Bring a government-issued photo ID."],
      ["Do you pick up in Pearland?", "Pickup may be available for qualifying business lots. Call (281) 898-2719 with the material type and amount."],
      ["Do I need an appointment?", "Please call (281) 898-2719 before you come so we can confirm what you have and that someone is ready to review it."],
      ["Do you speak Spanish?", "Yes. Hablamos español."]
    ]
  }
};
