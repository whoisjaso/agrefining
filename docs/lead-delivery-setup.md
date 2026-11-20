# Lead delivery setup (for Jason)

Status on Nov 15, 2026: `GET https://www.agrefining.com/api/leads?status=health` returns `{"delivery":false}`.
The Vercel project `agrefining` has **no environment variables at all**, so `RESEND_API_KEY` was never set.
Every form lead sent since launch reached nobody by email. The old code showed the visitor an error and a
"send it yourself" mail link. The function did not log lead contents, so there is no record to recover them from.
From this release on, an undelivered lead is written in full to the Vercel function log (search `LEAD_UNDELIVERED`).

## 1. Sending domain (DNS: Jason only; nothing was changed)

`agrefining.com` DNS is hosted at Bluehost (`NS1.BLUEHOST.com`). Mail for the domain goes to `mail.agrefining.com`
(Bluehost / websitewelcome), and SPF today is `v=spf1 ip4:162.241.244.88 a mx include:websitewelcome.com ~all`.
Resend has never been set up for the domain: there is no `resend._domainkey` record and no `send` subdomain record.

1. In Resend: Domains, then Add Domain, then `agrefining.com` (region us-east-1).
2. Resend then shows the exact records to add at Bluehost. They are typically:
   - TXT `resend._domainkey` with the DKIM public key Resend gives you;
   - MX `send` with `feedback-smtp.us-east-1.amazonses.com`, priority 10;
   - TXT `send` with `v=spf1 include:amazonses.com ~all`.
   These go on the `send` subdomain, so the existing root SPF and Bluehost mail are not affected.
3. Optional: TXT `_dmarc` with `v=DMARC1; p=none;` if no DMARC record exists yet.
4. Wait for Resend to show the domain as Verified.

## 2. Vercel environment variables (Production and Preview)

| Name | Value |
|---|---|
| `RESEND_API_KEY` | a Resend API key with sending access |
| `LEAD_TO` | Dorothy's address once confirmed. Leave unset until then: leads go to `dennis@agrefining.com`. |
| `LEAD_CC` | leave unset to CC `dennis@agrefining.com` (skipped automatically while he is also `LEAD_TO`) |
| `LEAD_FROM` | `AG Refining Website <leads@agrefining.com>` (must be on the verified domain) |

Redeploy after saving, then check `/api/leads?status=health` shows `{"delivery":true,"recipients":1}` (2 once Dorothy is `LEAD_TO`).

## 3. Test lead

- **Staging (the preview URL):** submit name `Test Lead`, phone `000-000-0000`, material `Not sure`, notes `TEST - please ignore`. Confirm it arrived, and that Reply-To works when an email is given.
- **Production:** repeat once, only after Jason says go, because it lands in the client's real inbox.

## 4. Mail sent straight to dennis@agrefining.com

Forwarding Dennis's mailbox to Dorothy is a mailbox setting, not website code. The mailbox is on Bluehost:
cPanel, then Email, then Forwarders, then Add Forwarder for `dennis@agrefining.com` to Dorothy's address.
Use "Keep a copy" so Dennis still gets everything.
