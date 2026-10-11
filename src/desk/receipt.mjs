// Client-facing receipt: HTML (screen + print) and PDF (jsPDF).
// Only the public view of a sale is accepted here, so private numbers cannot leak.
import { formatMoney, maskId } from "./pricing.mjs";

export const BUSINESS = Object.freeze({
  name: "AG Refining",
  street: "9125 Airport Blvd., Suite B-1",
  city: "Houston, TX 77061",
  phone: "(281) 898-2719",
  email: "dennis@agrefining.com",
  web: "agrefining.com"
});

export const STATEMENT = "The seller confirms that they are the lawful owner of the items listed, that the items are free of any lien or claim, that they are 18 years of age or older, and that they accept the amount above as payment in full. Ownership of the items passes to AG Refining upon payment. The seller agreed to sign electronically and to receive this receipt electronically.";

// Tamper-evident fingerprint of exactly what the seller signed (SHA-256, hex).
export function canonicalAgreement(sale) {
  const view = publicSale(sale);
  return JSON.stringify({
    receiptNo: view.receiptNo,
    createdAt: view.createdAt,
    seller: view.seller,
    payment: view.payment,
    items: view.items,
    total: view.total,
    statement: STATEMENT,
    signature: view.signature
  });
}

export async function agreementFingerprint(sale, subtle = globalThis.crypto.subtle) {
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(canonicalAgreement(sale)));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function esignLine(sale) {
  const e = sale.esign;
  if (!e?.signedAt) return "";
  const when = formatWhen(e.signedAt);
  return `Signed electronically ${when.date} at ${when.time}. Record fingerprint ${String(e.fingerprint || "").slice(0, 16).toUpperCase()}.`;
}
export const INCLUDED = "Included at no charge: evaluation, weighing, and handling.";
export const THANKS = "Thank you for choosing AG Refining. Please keep this receipt for your records.";

const PUBLIC_SALE_KEYS = ["receiptNo", "createdAt", "seller", "payment", "items", "total", "signature", "esign"];

// Strip a full sale down to what the client may see.
export function publicSale(sale) {
  const view = Object.fromEntries(PUBLIC_SALE_KEYS.map((key) => [key, sale[key]]));
  view.items = (sale.items || []).map(({ title, detail, offer }) => ({ title, detail, offer }));
  view.seller = { ...(sale.seller || {}) };
  return view;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function formatWhen(iso) {
  const date = new Date(iso);
  return {
    date: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  };
}

export function renderReceiptHtml(sale) {
  const view = publicSale(sale);
  const when = formatWhen(view.createdAt);
  const seller = view.seller;
  const id = seller.idNumber ? `${esc(seller.idType || "ID")} ${esc(maskId(seller.idNumber))}` : "";
  const contact = [seller.phone, seller.email].filter(Boolean).map(esc).join("<br>");
  const rows = view.items.map((item) => `<tr><td>${esc(item.title)}<small>${esc(item.detail)}</small></td><td>${formatMoney(item.offer)}</td></tr>`).join("");
  return `
    <header class="r-head">
      <div class="r-brand"><img src="/assets/ag-mark-path.svg" alt="AG Refining"><div><strong>${BUSINESS.name}</strong><span>${BUSINESS.street}<br>${BUSINESS.city}<br>${BUSINESS.phone} · ${BUSINESS.email}</span></div></div>
      <div class="r-meta"><b>Receipt</b><strong>${esc(view.receiptNo)}</strong><br>${when.date}<br>${when.time}</div>
    </header>
    <h2 class="r-title">Purchase receipt and bill of sale</h2>
    <div class="r-party">
      <div><h4>Seller</h4><p><strong>${esc(seller.name)}</strong>${seller.address ? `<br>${esc(seller.address)}` : ""}${contact ? `<br>${contact}` : ""}${id ? `<br>${id}` : ""}</p></div>
      <div><h4>Purchaser</h4><p><strong>${BUSINESS.name}</strong><br>${BUSINESS.street}<br>${BUSINESS.city}</p></div>
    </div>
    <table class="r-table"><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="r-total"><span>Total paid</span><strong>${formatMoney(view.total)}</strong></div>
    <div class="r-paid"><span>Paid by ${esc(view.payment || "Cash")}</span><span>Paid in full</span></div>
    <p class="r-included">${INCLUDED}</p>
    <p class="r-statement">${STATEMENT}</p>
    <div class="r-sign">
      <div>${view.signature ? `<img src="${esc(view.signature)}" alt="Seller signature">` : ""}<p class="r-sigline">Seller signature</p></div>
      <div><p class="r-sigline">${esc(seller.name)} · ${when.date}</p></div>
    </div>
    ${sale.esign ? `<p class="r-esign">${esc(esignLine(sale))}</p>` : ""}
    <footer class="r-foot"><span>${THANKS}</span><span>${BUSINESS.web}</span></footer>`;
}

// ---------- PDF ----------

const NAVY = [16, 42, 67];
const INK = [32, 53, 76];
const MUTED = [88, 107, 126];
const MINERAL = [65, 107, 148];
const RULE = [214, 221, 227];

function pdfSafe(text) {
  return String(text ?? "").replace(/[•]/g, "*").replace(/[\u2013\u2014]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

// Rasterize the SVG mark so jsPDF can embed it.
export async function logoPng(src = "/assets/ag-mark-path.svg", size = 240) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.getContext("2d").drawImage(image, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

export function buildReceiptPdf(sale, { jsPDF, logo }) {
  const view = publicSale(sale);
  const when = formatWhen(view.createdAt);
  const seller = view.seller;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 54;
  let y = M;

  doc.setProperties({ title: `AG Refining Receipt ${view.receiptNo}`, author: BUSINESS.name, subject: "Purchase receipt and bill of sale", creator: "AG Refining Buy Desk" });

  const color = (rgb) => doc.setTextColor(...rgb);
  const text = (value, x, yy, opts) => doc.text(pdfSafe(value), x, yy, opts);

  // Header
  if (logo) doc.addImage(logo, "PNG", M, y, 46, 46);
  doc.setFont("helvetica", "bold").setFontSize(17);
  color(NAVY);
  text(BUSINESS.name, M + 60, y + 15);
  doc.setFont("helvetica", "normal").setFontSize(9);
  color(MUTED);
  text(`${BUSINESS.street}, ${BUSINESS.city}`, M + 60, y + 29);
  text(`${BUSINESS.phone}  ·  ${BUSINESS.email}`, M + 60, y + 41);

  doc.setFont("helvetica", "bold").setFontSize(7.5);
  color(MINERAL);
  doc.setCharSpace(1.4);
  text("RECEIPT", W - M, y + 8, { align: "right" });
  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold").setFontSize(12);
  color(NAVY);
  text(view.receiptNo, W - M, y + 24, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9);
  color(MUTED);
  text(`${when.date}  ·  ${when.time}`, W - M, y + 38, { align: "right" });

  y += 60;
  doc.setDrawColor(...NAVY).setLineWidth(1.6).line(M, y, W - M, y);

  // Title
  y += 38;
  doc.setFont("times", "normal").setFontSize(23);
  color(NAVY);
  text("Purchase receipt and bill of sale", M, y);

  // Parties
  y += 30;
  const colW = (W - 2 * M) / 2;
  const label = (value, x, yy) => {
    doc.setFont("helvetica", "bold").setFontSize(7.5);
    color(MINERAL);
    doc.setCharSpace(1.2);
    text(value.toUpperCase(), x, yy);
    doc.setCharSpace(0);
  };
  label("Seller", M, y);
  label("Purchaser", M + colW, y);
  const sellerLines = [
    seller.address,
    [seller.phone, seller.email].filter(Boolean).join("  ·  "),
    seller.idNumber ? `${seller.idType || "ID"} ${maskId(seller.idNumber)}` : ""
  ].filter(Boolean);
  doc.setFont("helvetica", "bold").setFontSize(10.5);
  color(INK);
  text(seller.name, M, y + 15);
  text(BUSINESS.name, M + colW, y + 15);
  doc.setFont("helvetica", "normal").setFontSize(9.5);
  sellerLines.forEach((line, index) => text(doc.splitTextToSize(pdfSafe(line), colW - 16)[0], M, y + 29 + index * 13));
  text(BUSINESS.street, M + colW, y + 29);
  text(BUSINESS.city, M + colW, y + 42);
  y += 29 + Math.max(sellerLines.length, 2) * 13 + 18;

  // Items
  const header = () => {
    doc.setFont("helvetica", "bold").setFontSize(7.5);
    color(MUTED);
    doc.setCharSpace(1.2);
    text("ITEM", M, y);
    text("AMOUNT", W - M, y, { align: "right" });
    doc.setCharSpace(0);
    y += 8;
    doc.setDrawColor(...RULE).setLineWidth(0.8).line(M, y, W - M, y);
    y += 18;
  };
  header();
  for (const item of view.items) {
    if (y > H - 250) {
      doc.addPage();
      y = M;
      header();
    }
    doc.setFont("helvetica", "bold").setFontSize(10.5);
    color(INK);
    text(item.title, M, y);
    doc.setFont("helvetica", "normal");
    text(formatMoney(item.offer), W - M, y, { align: "right" });
    doc.setFontSize(9);
    color(MUTED);
    text(item.detail, M, y + 13);
    y += 24;
    doc.setDrawColor(236, 232, 222).setLineWidth(0.6).line(M, y - 4, W - M, y - 4);
    y += 10;
  }

  // Total
  y += 8;
  doc.setFont("helvetica", "bold").setFontSize(9);
  color(NAVY);
  doc.setCharSpace(1);
  text("TOTAL PAID", M, y);
  doc.setCharSpace(0);
  doc.setFont("times", "normal").setFontSize(26);
  text(formatMoney(view.total), W - M, y + 2, { align: "right" });
  y += 12;
  doc.setDrawColor(...NAVY).setLineWidth(1.6).line(M, y, W - M, y);
  y += 16;
  doc.setFont("helvetica", "normal").setFontSize(9.5);
  color(MUTED);
  text(`Paid by ${view.payment || "Cash"}`, M, y);
  text("Paid in full", W - M, y, { align: "right" });

  // Included
  y += 22;
  doc.setFillColor(250, 248, 242).roundedRect(M, y, W - 2 * M, 28, 3, 3, "F");
  color(INK);
  text(INCLUDED, M + 12, y + 18);

  // Statement
  y += 50;
  doc.setFontSize(9);
  color(MUTED);
  const statement = doc.splitTextToSize(STATEMENT, W - 2 * M);
  doc.text(statement, M, y);
  y += statement.length * 12 + 26;

  // Signature
  if (y > H - 130) {
    doc.addPage();
    y = M + 20;
  }
  const sigW = (W - 2 * M) * 0.55;
  if (view.signature) doc.addImage(view.signature, "PNG", M, y, Math.min(sigW, 220), 64, undefined, "FAST");
  y += 70;
  doc.setDrawColor(...[135, 150, 165]).setLineWidth(0.7).line(M, y, M + sigW, y);
  doc.line(M + sigW + 24, y, W - M, y);
  doc.setFontSize(8.5);
  color(MUTED);
  text("Seller signature", M, y + 12);
  text(`${seller.name}  ·  ${when.date}`, M + sigW + 24, y + 12);

  if (view.esign) {
    doc.setFontSize(7.5);
    color(MUTED);
    text(esignLine(view), M, y + 30);
  }

  // Footer
  const fy = H - 46;
  doc.setDrawColor(...RULE).setLineWidth(0.6).line(M, fy - 14, W - M, fy - 14);
  doc.setFontSize(8.5);
  color(MUTED);
  text(THANKS, M, fy);
  text(BUSINESS.web, W - M, fy, { align: "right" });

  return doc;
}
