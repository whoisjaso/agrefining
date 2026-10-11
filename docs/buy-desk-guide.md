# AG Refining Buy Desk

A private counter app for buying silver in front of a client. Open it on the tablet at **www.agrefining.com/desk**, then tap Share → **Add to Home Screen** so it opens like an app.

The desk is not linked from the website and is hidden from search engines.

## First time

1. Choose a four to six digit **desk code**. You enter it each time you open the desk, and whenever you tap **Lock**.
2. Open **Settings** and check the offer rates (below). They start at sensible defaults.

## With a client

1. **What did they bring?** Tap the material. Pick the purity, or the coin type, and type the weight or count on the large keypad. The offer for that item appears as you type. Tap **Add to offer**.
2. Repeat for each item. Tap any line in **The offer** to change or remove it.
3. **Hold to view private numbers** shows today's silver price, the market value, your refinery return, and your spread. They disappear the moment you let go, so a client across the table never sees them.
4. Tap **Show the offer** and turn the tablet around. The client sees the total, each item, and what is included. They never see the silver price or your rates. The offer is held at that moment's price for 15 minutes, even if the market moves.
5. Tap **Accept offer**. Enter the seller's name and ID number, choose how you are paying, have them check the statement and sign with a finger.
6. **Complete the sale.** The receipt is saved on the tablet. Email it, share it as a PDF (Messages, AirDrop, Files), or print it.

## Settings

| Setting | What it means |
|---|---|
| **Offer** | The share of market value you pay the seller for that material. |
| **Return** | The share of market value your refinery pays you. Used only to show your spread. |
| **Manual price** | If the live feed is ever down, type today's silver price here. Clear it to go back to live. |
| **Offer rounding** | Exact cents (reads as measured, not negotiated) or whole dollars. |

Default offer and return rates, as a share of the fine-silver market value:

| Material | Offer | Return | Silver content used |
|---|---:|---:|---|
| Sterling | 80% | 95% | .925 (also .958, .950, .900, .835, .800) |
| Silver coins | 90% | 98% | Exact U.S. Mint silver weights per coin |
| Bars and rounds | 92% | 99% | .999 / .9999 |
| Scrap and jewelry | 75% | 93% | .925 / .900 / .800 / mixed .600 |
| Industrial silver | 80% | 95% | .999 to .850 |
| Silver solder | 70% | 90% | 56% to 6% by grade |
| Laboratory silver | 65% | 88% | Silver nitrate 63.5%, chloride 75.3%, sludge est. 50% |
| Dental scrap | 60% | 85% | Estimated 20% to 35% |
| Watch batteries | 55% | 85% | Estimated 20% to 30% |
| X-ray film | 50% | 80% | Estimated 0.6% to 2% of film weight |
| Silver-plated | 45% | 75% | Estimated 1.5% to 3% |

Estimated materials are flagged "(est.)" on the desk. Adjust the rates to match what your refinery actually settles at.

## Receipts and records

- **Receipts** lists every sale with today's count, amount paid, and spread.
- **Export spreadsheet** creates a CSV with every sale, including the seller's full ID number, silver price, market value, and spread, for your books and records.
- Receipts are stored on this tablet only. Export the spreadsheet regularly (weekly is a good habit) and keep it somewhere safe. Clearing Safari's website data erases the desk's receipts and code.
- The client's receipt shows only the last four digits of their ID.

## Live silver price

The desk reads the live silver spot price every 30 seconds from three independent market feeds (gold-api.com, Swissquote, COMEX futures), using the next one if a feed fails. The dot at the top shows **Live market**, **Manual market price**, or **Market offline**.

## Setting up receipt email (one time)

Receipt email uses the same Resend account as the website's pickup form. In Vercel, project **agrefining** → Settings → Environment Variables, add:

- `DESK_ACCESS_CODE`: the same digits as your desk code.

Until that is set, **Email receipt** falls back to sharing the PDF, so nothing is blocked. Each emailed receipt also sends a copy to `dennis@agrefining.com`.

## Forgot the desk code

The desk code lives only on the tablet. To reset it, export your receipts first if you can, then clear website data for agrefining.com in Settings → Safari → Advanced → Website Data. This also erases saved receipts.

## Electronic signatures

Each sale is signed with a finger on the tablet. Texas (Uniform Electronic Transactions Act, Business and Commerce Code Chapter 322) and federal law (E-SIGN Act) treat that signature like ink when the record shows the seller meant to sign and agreed to do business electronically. The desk records all of this:

- **Consent:** the seller's checkmark statement includes "I agree to sign electronically and to receive my receipt electronically."
- **Signature:** the drawn signature is placed on the receipt and the PDF.
- **Audit trail:** the exact time of signing and the device used are saved with the sale.
- **Tamper evidence:** a SHA-256 fingerprint of everything the seller signed (items, amounts, seller details, statement, signature) is printed on the receipt. If any of it changed later, the fingerprint would no longer match.
- **Retention:** the seller gets a copy (email, share, or print), and the full record, fingerprint included, is in the exported spreadsheet.

## Legal note

The receipt includes a seller's statement of ownership, age, and acceptance of payment, a signature, and the seller's ID. Texas regulates dealers who buy crafted precious metal (Texas Occupations Code, Chapter 1956), including record keeping, seller identification, and holding periods. Confirm your registration and obligations with your attorney or the Texas Department of Public Safety.
