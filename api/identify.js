// Reads hallmarks from a counter photo and suggests a Buy Desk material, purity, and coin.
// Locked by DESK_ACCESS_CODE like api/receipt.js. The answer is only a suggestion:
// the desk pre-selects it in the item sheet and the owner confirms or changes it.
import { codeMatches, recordFailure, throttled } from "./receipt.js";
import { COINS, MATERIALS } from "../src/desk/pricing.mjs";

export const MODEL = "claude-sonnet-5-5";
const API_URL = "https://api.anthropic.com/v1/messages";
const TIMEOUT_MS = 45_000;
// Decoded image bytes. The desk sends a 1600 px JPEG (well under 1 MB); this keeps
// the base64 request body near 4 MB, inside the serverless body limit.
export const MAX_IMAGE_BYTES = 3_000_000;
const CONFIDENCE = ["high", "medium", "low"];
const FALLBACK_NOTE = "Could not read the marks clearly. Choose the material by hand.";

const MATERIAL_IDS = MATERIALS.map((m) => m.id);
const COIN_IDS = COINS.map((c) => c.id);

function clientKey(req) {
  return String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
  return typeof raw === "string" && raw ? JSON.parse(raw) : {};
}

// Media type from the file's first bytes, not from what the client claims.
export function imageType(base64) {
  const head = Buffer.from(String(base64).slice(0, 16), "base64");
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head.subarray(0, 4).toString("latin1") === "\x89PNG") return "image/png";
  return null;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["material", "purity", "coin", "marks", "confidence", "note"],
  properties: {
    material: { anyOf: [{ type: "string", enum: MATERIAL_IDS }, { type: "null" }] },
    purity: { anyOf: [{ type: "number" }, { type: "null" }] },
    coin: { anyOf: [{ type: "string", enum: COIN_IDS }, { type: "null" }] },
    marks: { type: "array", items: { type: "string" } },
    confidence: { type: "string", enum: CONFIDENCE },
    note: { type: "string" }
  }
};

const catalog = MATERIALS.map((m) => {
  const purities = m.purities ? m.purities.map(([value, label]) => `${value} (${label})`).join(", ") : "none, use coin instead";
  return `- ${m.id}: ${m.name}. ${m.note}. Purities: ${purities}`;
}).join("\n");
const coins = COINS.map((c) => `- ${c.id}: ${c.label}`).join("\n");

export const SYSTEM = `You help the owner of AG Refining, a Houston silver buyer, identify an item at the counter from one photo.
Read any hallmarks, stamps, dates, or mint marks you can see, then choose the closest entry from the desk's catalog.

Materials (id: name. note. allowed purities as fractions):
${catalog}

Coins (only when material is "coins"):
${coins}

Rules:
- material must be one of the ids above, or null if the photo does not show silver you can place.
- purity must be one of that material's listed fractions, or null when unsure. Use null for coins.
- coin must be one of the coin ids above when material is "coins", otherwise null.
- marks lists the stamps exactly as you read them, for example "925", "STERLING", "1964 D". Use an empty list if none are legible.
- confidence is "high" only when a clear hallmark or coin design confirms the choice.
- note is one short, plain sentence for the owner. No prices, no values, no advice to the seller.
- A hallmark can be faked or worn. When in doubt, say so with "low" confidence; the owner will test and weigh the item.`;

function sameNumber(a, b) {
  return Math.abs(a - b) < 1e-6;
}

// Never trust the model's ids: anything outside the desk catalog becomes null.
export function normalizeIdentification(raw) {
  const value = raw && typeof raw === "object" ? raw : {};
  const material = MATERIALS.find((m) => m.id === value.material) || null;
  let purity = null;
  if (material?.purities && typeof value.purity === "number") {
    purity = material.purities.find(([p]) => sameNumber(p, value.purity))?.[0] ?? null;
  }
  const coin = material?.mode === "coins" ? COINS.find((c) => c.id === value.coin)?.id ?? null : null;
  const marks = (Array.isArray(value.marks) ? value.marks : [])
    .filter((mark) => typeof mark === "string")
    .map((mark) => mark.replace(/\s+/g, " ").trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 8);
  const confidence = material && CONFIDENCE.includes(value.confidence) ? value.confidence : "low";
  const note = typeof value.note === "string" && value.note.trim() ? value.note.replace(/\s+/g, " ").trim().slice(0, 200) : FALLBACK_NOTE;
  return { material: material?.id ?? null, purity, coin, marks, confidence, note: material ? note : FALLBACK_NOTE };
}

export function identifyRequest(base64, mediaType) {
  return {
    model: MODEL,
    max_tokens: 4000,
    // Server-side fallback re-runs a declined request on another model inside the same call.
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: "Read the hallmarks on this item and choose the closest desk material, purity, and coin." }
      ]
    }]
  };
}

export default async function handler(req, res, { fetchImpl = fetch } = {}) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  const available = Boolean(process.env.ANTHROPIC_API_KEY && process.env.DESK_ACCESS_CODE);

  if (req.method === "GET") return res.status(200).json({ available });
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Use POST." });
  }
  if (!available) return res.status(503).json({ available: false, message: "The hallmark reader is not set up yet." });

  let body;
  try {
    body = readBody(req);
  } catch {
    return res.status(400).json({ message: "The photo could not be read." });
  }

  const key = clientKey(req);
  if (throttled(key)) return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." });
  if (!codeMatches(body.code, process.env.DESK_ACCESS_CODE)) {
    recordFailure(key);
    return res.status(401).json({ message: "Desk access code is not recognized." });
  }

  const image = String(body.imageBase64 || "").replace(/^data:image\/(?:jpeg|png);base64,/, "");
  if (!image || !/^[A-Za-z0-9+/=]+$/.test(image)) return res.status(422).json({ message: "Take a photo first." });
  if (image.length * 0.75 > MAX_IMAGE_BYTES) return res.status(413).json({ message: "That photo is too large. Try again." });
  const mediaType = imageType(image);
  if (!mediaType) return res.status(422).json({ message: "Use a JPEG or PNG photo." });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
        "content-type": "application/json"
      },
      body: JSON.stringify(identifyRequest(image, mediaType))
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const message = await response.json();
    if (message?.stop_reason === "refusal" || message?.stop_reason === "max_tokens") throw new Error(message.stop_reason);
    const text = (Array.isArray(message?.content) ? message.content : []).find((block) => block?.type === "text")?.text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("unparseable");
    }
    return res.status(200).json(normalizeIdentification(parsed));
  } catch {
    return res.status(502).json({ message: "The photo could not be read right now. Choose the material by hand." });
  } finally {
    clearTimeout(timer);
  }
}
