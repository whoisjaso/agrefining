// Google review link, shared by the Buy Desk (QR code and text message) and the
// receipt email in api/receipt.js. The server can override it with the
// GOOGLE_REVIEW_URL environment variable once the direct "write a review" link
// from Google Business Profile is available.
export const GOOGLE_REVIEW_URL = "https://www.google.com/maps/search/?api=1&query=AG+Refining+9125+Airport+Blvd+Houston+TX";

// Only plain https links are accepted, so a bad value can never become a
// javascript: link or a broken QR code.
export function safeReviewUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function reviewUrl(env = {}) {
  return safeReviewUrl(env.GOOGLE_REVIEW_URL) || GOOGLE_REVIEW_URL;
}

// sms: link with a prefilled message. Returns null when the phone number is not usable.
export function reviewTextLink(phone, link = GOOGLE_REVIEW_URL, firstName = "") {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  const greeting = firstName ? `Hi ${firstName}, thank you` : "Thank you";
  const body = `${greeting} for choosing AG Refining today. If you have a minute, a short Google review helps other people find us: ${link}`;
  // "?&body=" is read correctly by both iOS and Android messaging apps.
  return `sms:+1${digits}?&body=${encodeURIComponent(body)}`;
}
