// One-pager request: the Data room form posts here (same origin). Checks every field on the server,
// writes one row to the D1 database bound as SX_REQUESTS_DB, then sends the visitor back to the form.
// Nothing is e-mailed from here; the one-pager is sent by hand. No secret lives in this file.

const BACK_SENT = "/data-room.html#request-sent";
const BACK_ERROR = "/data-room.html#request-error";
// until the database is bound (after the CNDP declaration, H 2-Oct) nothing is stored and the visitor is asked to write instead
const BACK_OFFLINE = "/data-room.html#request-offline";
const MAX_BODY = 4096;
// a ceiling on new rows per day; past it nothing more is stored and the visitor is asked to write instead
const DAILY_CAP = 200;
const HEARD_FROM = ["linkedin", "google", "friend", "colleague", "event", "press", "other"];
const CONSENT_NOTICE = "2026-10-02";
const EMAIL_SHAPE = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,185}\.[A-Za-z]{2,24}$/;
const CONTROL = /[\u0000-\u001f\u007f]/;

// _headers does not reach function responses, so the function sets its own
const HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "X-Robots-Tag": "noindex",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};

function back(url, target) {
  return new Response(null, { status: 303, headers: Object.assign({ Location: new URL(target, url).toString() }, HEADERS) });
}

function text(value, max) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (v.length < 1 || v.length > max || CONTROL.test(v)) return null;
  return v;
}

export async function onRequestPost(context) {
  const request = context.request;
  const url = new URL(request.url);

  // only this site's own form may post here: the Origin header is required and must be this site's
  const origin = request.headers.get("Origin");
  if (origin !== url.origin) return back(url, BACK_ERROR);
  const site = request.headers.get("Sec-Fetch-Site");
  if (site !== null && site !== "same-origin") return back(url, BACK_ERROR);

  const type = (request.headers.get("Content-Type") || "").toLowerCase();
  if (!type.startsWith("application/x-www-form-urlencoded")) return back(url, BACK_ERROR);
  const length = Number(request.headers.get("Content-Length") || "0");
  if (length > MAX_BODY) return back(url, BACK_ERROR);

  let form;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return back(url, BACK_ERROR);
    form = new URLSearchParams(raw);
  } catch (error) {
    return back(url, BACK_ERROR);
  }

  // the hidden trap field: people never fill it, simple robots do; they get the same answer and nothing is stored
  if ((form.get("website") || "") !== "") return back(url, BACK_SENT);

  const email = text(form.get("email"), 254);
  const first = text(form.get("first_name"), 100);
  const last = text(form.get("last_name"), 100);
  const company = text(form.get("company"), 150);
  const heard = form.get("heard_from");
  if (!email || !EMAIL_SHAPE.test(email) || !first || !last || !company || !HEARD_FROM.includes(heard)) {
    return back(url, BACK_ERROR);
  }

  const db = context.env && context.env.SX_REQUESTS_DB;
  if (!db) return back(url, BACK_OFFLINE);

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  try {
    const today = await db.prepare("SELECT COUNT(*) AS n FROM one_pager_requests WHERE request_day = ?1").bind(day).first();
    if (!today || Number(today.n) >= DAILY_CAP) return back(url, BACK_OFFLINE);
    // one request per address per day: a second one the same day changes nothing and gets the same answer
    await db.prepare(
      "INSERT INTO one_pager_requests (created_at, request_day, email, first_name, last_name, company, heard_from, consent_notice) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) ON CONFLICT (email, request_day) DO NOTHING"
    ).bind(now.toISOString(), day, email.toLowerCase(), first, last, company, heard, CONSENT_NOTICE).run();
  } catch (error) {
    return back(url, BACK_ERROR);
  }
  return back(url, BACK_SENT);
}

export async function onRequest(context) {
  return new Response("Method not allowed", { status: 405, headers: Object.assign({ Allow: "POST", "Content-Type": "text/plain; charset=utf-8" }, HEADERS) });
}
