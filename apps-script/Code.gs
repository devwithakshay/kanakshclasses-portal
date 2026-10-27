/** Kanaksh Classes – Google Sheets backend. Paste into Extensions > Apps Script of your Sheet. */
const SHEET_NAME = "Students";
const SECRET = "CHANGE_ME_SECRET"; // must match API_KEY in config.js
const BRAND_NAME = "Kanaksh Classes";
const BRAND_TAGLINE = "Bright Minds, Brighter Futures!";
const INSTAGRAM_URL = "https://www.instagram.com/kanakshclasses";
const REVIEW_URL = "https://g.page/r/CUa3eeMUZIwwEAE/review";
const COLS = ["id","name","dob","gender","school","cls","board","adm","guardian","rel","email","mobile","alt","fee","addr","notes","subs","status","due","paid","att","created"];

function ensureCols_(sh) {
  const last = sh.getLastColumn();
  if (last < 1) return;
  const hdr = sh.getRange(1, 1, 1, last).getValues()[0].map(String);
  if (hdr.indexOf("paid") === -1) {
    const dueIdx = hdr.indexOf("due");
    const insertAt = dueIdx >= 0 ? dueIdx + 2 : last + 1;
    sh.insertColumnAfter(dueIdx >= 0 ? dueIdx + 1 : last);
    sh.getRange(1, insertAt).setValue("paid").setFontWeight("bold");
  }
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) { s = ss.insertSheet(SHEET_NAME); s.appendRow(COLS); s.setFrozenRows(1); s.getRange(1,1,1,COLS.length).setFontWeight("bold").setBackground("#26354A").setFontColor("#fff"); }
  else ensureCols_(s);
  return s;
}

const str = x => String(x == null ? "" : x).trim();

function findRow_(sh, id) {
  const v = sh.getDataRange().getValues(), h = v[0].map(String), col = h.indexOf("id");
  if (col < 0) return 0;
  for (let r = 1; r < v.length; r++) if (String(v[r][col]).trim() === id) return r + 1;
  return 0;
}

function patchStudent_(sh, id, patch) {
  const rowNum = findRow_(sh, id);
  if (!rowNum) return false;
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  Object.keys(patch).forEach(k => {
    const c = h.indexOf(k);
    if (c >= 0) sh.getRange(rowNum, c + 1).setValue(patch[k]);
  });
  return true;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function esc_(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inr_(n) {
  const x = Number(n) || 0;
  return "₹" + x.toLocaleString("en-IN");
}

function rowToStudent_(h, r) {
  const s = Object.fromEntries(h.map((c, i) => [c, r[i]]));
  s.subs = str(s.subs) ? str(s.subs).split(", ") : [];
  return s;
}

function getStudent_(id) {
  const sh = sheet_(), v = sh.getDataRange().getValues();
  if (v.length < 2) return null;
  const h = v[0].map(String), col = h.indexOf("id");
  for (let i = 1; i < v.length; i++) {
    if (String(v[i][col]).trim() === id) return rowToStudent_(h, v[i]);
  }
  return null;
}

function admissionEmailHtml_(s, logoUrl) {
  const v = k => esc_(str(s[k]) || "—");
  const subs = (s.subs && s.subs.length) ? esc_(Array.isArray(s.subs) ? s.subs.join(", ") : s.subs) : "—";
  const logo = esc_(logoUrl || "");
  const fee = inr_(s.fee);
  const due = inr_(s.due);
  const paid = inr_(s.paid);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#26354A">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ec;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e8e4dc;box-shadow:0 8px 32px rgba(38,53,74,.08)">
<tr><td style="background:linear-gradient(120deg,#26354A,#AA261B);padding:28px 24px;text-align:center">
${logo ? `<img src="${logo}" alt="${esc_(BRAND_NAME)}" width="72" height="72" style="display:block;margin:0 auto 12px;border-radius:14px;background:#fff;padding:6px">` : ""}
<div style="color:#fff;font-size:22px;font-weight:700">${esc_(BRAND_NAME)}</div>
<div style="color:rgba(255,255,255,.85);font-size:13px;margin-top:4px">${esc_(BRAND_TAGLINE)}</div>
</td></tr>
<tr><td style="padding:28px 24px 8px"><p style="margin:0 0 8px;font-size:15px">Dear <strong>${v("guardian")}</strong>,</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:#6f7a8a">Thank you for choosing ${esc_(BRAND_NAME)}. Admission for <strong style="color:#26354A">${v("name")}</strong> is confirmed. Details are below.</p>
<div style="background:#faf8f5;border:1px solid #e8e4dc;border-radius:14px;padding:16px 18px;margin-bottom:16px">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#AA261B;font-weight:700;margin-bottom:10px">Student ID · ${v("id")}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6">
<tr><td style="padding:4px 0;color:#6f7a8a;width:42%">Class / Board</td><td style="padding:4px 0;font-weight:600">Class ${v("cls")} · ${v("board")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Date of birth</td><td style="padding:4px 0;font-weight:600">${v("dob")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Gender</td><td style="padding:4px 0;font-weight:600">${v("gender")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">School</td><td style="padding:4px 0;font-weight:600">${v("school")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Subjects</td><td style="padding:4px 0;font-weight:600">${subs}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Admission date</td><td style="padding:4px 0;font-weight:600">${v("adm")}</td></tr>
</table></div>
<div style="background:#faf8f5;border:1px solid #e8e4dc;border-radius:14px;padding:16px 18px;margin-bottom:16px">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#26354A;font-weight:700;margin-bottom:10px">Parent / contact</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6">
<tr><td style="padding:4px 0;color:#6f7a8a;width:42%">${v("rel")}</td><td style="padding:4px 0;font-weight:600">${v("guardian")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Mobile</td><td style="padding:4px 0;font-weight:600">${v("mobile")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Alternate mobile</td><td style="padding:4px 0;font-weight:600">${v("alt")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Email</td><td style="padding:4px 0;font-weight:600">${v("email")}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a;vertical-align:top">Address</td><td style="padding:4px 0;font-weight:600">${v("addr")}</td></tr>
</table></div>
<div style="background:#faf8f5;border:1px solid #e8e4dc;border-radius:14px;padding:16px 18px;margin-bottom:20px">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#1f9d57;font-weight:700;margin-bottom:10px">Fee summary</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6">
<tr><td style="padding:4px 0;color:#6f7a8a;width:42%">Monthly fee</td><td style="padding:4px 0;font-weight:600">${fee}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Paid</td><td style="padding:4px 0;font-weight:600">${paid}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Due</td><td style="padding:4px 0;font-weight:600;color:#AA261B">${due}</td></tr>
<tr><td style="padding:4px 0;color:#6f7a8a">Status</td><td style="padding:4px 0;font-weight:600">${v("status")}</td></tr>
</table></div>
${str(s.notes) ? `<p style="font-size:13px;color:#6f7a8a;margin:0 0 20px"><strong>Notes:</strong> ${v("notes")}</p>` : ""}
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 8px"><tr>
<td style="padding:6px"><a href="${esc_(INSTAGRAM_URL)}" style="display:inline-block;background:#26354A;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 18px;border-radius:12px">Follow @kanakshclasses</a></td>
<td style="padding:6px"><a href="${esc_(REVIEW_URL)}" style="display:inline-block;background:#F09D59;color:#26354A;text-decoration:none;font-size:13px;font-weight:600;padding:12px 18px;border-radius:12px">Leave a Google review</a></td>
</tr></table>
<p style="font-size:12px;color:#9aa6b6;text-align:center;margin:16px 0 0;line-height:1.5">Questions? Reply to this email or WhatsApp us on ${v("mobile")}.<br>${esc_(BRAND_TAGLINE)}</p>
</td></tr>
<tr><td style="padding:16px 24px;background:#faf8f5;border-top:1px dashed #e8e4dc;text-align:center;font-size:11px;color:#9aa6b6">${esc_(BRAND_NAME)} · Instagram: @kanakshclasses</td></tr>
</table></td></tr></table></body></html>`;
}

function sendAdmissionEmail_(s, logoUrl) {
  const email = str(s.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) return { sent: false, reason: "no_email" };
  try {
    MailApp.sendEmail({
      to: email,
      subject: BRAND_NAME + " – Admission confirmed (" + str(s.id) + ")",
      htmlBody: admissionEmailHtml_(s, logoUrl),
      name: BRAND_NAME
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}

function doGet(e) {
  if (!e.parameter || e.parameter.key !== SECRET) return out_({ ok: false, error: "Unauthorized" });
  const v = sheet_().getDataRange().getDisplayValues(), h = v.shift();
  return out_({ ok: true, students: v.filter(r => r[0]).map(r => Object.fromEntries(h.map((c, i) => [c, r[i]]))) });
}

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.key !== SECRET) return out_({ ok: false, error: "Unauthorized" });
    if (body.action === "sendAdmissionEmail") {
      const id = str(body.id);
      const s = getStudent_(id);
      if (!s) return out_({ ok: false, error: "Student not found" });
      const mail = sendAdmissionEmail_(s, str(body.logoUrl));
      if (!mail.sent) return out_({ ok: false, error: mail.error || mail.reason || "Email not sent" });
      return out_({ ok: true, emailSent: true });
    }
    if (body.action === "updateFee") {
      const id = str(body.id);
      if (!id) return out_({ ok: false, error: "Student ID required" });
      const sh = sheet_();
      const fee = Number(body.fee), due = Number(body.due), paid = Number(body.paid);
      const status = str(body.status) || "Pending";
      if (!patchStudent_(sh, id, {
        fee: isNaN(fee) ? "" : fee,
        due: isNaN(due) ? 0 : due,
        paid: isNaN(paid) ? 0 : paid,
        status: status
      })) return out_({ ok: false, error: "Student not found" });
      return out_({ ok: true, id: id, fee: fee, due: due, paid: paid, status: status });
    }
    if (body.action !== "add") return out_({ ok: false, error: "Unknown action" });
    const s = body.student || {};
    if (!str(s.name) || !str(s.guardian)) return out_({ ok: false, error: "Name and guardian required" });
    if (!/^\d{10}$/.test(str(s.mobile))) return out_({ ok: false, error: "Invalid mobile" });
    if (str(s.alt) && !/^\d{10}$/.test(str(s.alt))) return out_({ ok: false, error: "Invalid alternate mobile" });
    const sh = sheet_(), year = new Date().getFullYear();
    s.id = "KC-" + year + "-" + String(Math.max(sh.getLastRow(), 1)).padStart(4, "0"); // header row counts as 1, so first student = 0001
    s.status = "New"; s.paid = Number(s.paid) || 0; s.due = Number(s.due) || Number(s.fee) || 0;
    s.created = new Date().toISOString(); s.subs = (s.subs || []).join(", ");
    const row = COLS.map(c => str(s[c]));
    const r = sh.getLastRow() + 1;
    sh.getRange(r, 1, r, COLS.length).setNumberFormat("@").setValues([row]);
    s.subs = s.subs ? s.subs.split(", ") : [];
    const mail = sendAdmissionEmail_(s, str(body.logoUrl));
    return out_({ ok: true, student: s, emailSent: !!mail.sent, emailError: mail.error || "" });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
