# Kanaksh Classes Portal – deployment

## 1. Backend (Google Sheet in your Drive) – 5 min
1. Drive -> New -> Google Sheets -> name it "Kanaksh Classes DB".
2. Extensions -> Apps Script -> delete sample code -> paste `apps-script/Code.gs`.
3. Change `SECRET` to your own long random text.
4. Deploy -> New deployment -> type **Web app** -> Execute as: **Me** -> Who has access: **Anyone** -> Deploy -> authorize -> copy the **Web app URL**.
5. Open `config.js`: paste the URL into `API_URL` and the same secret into `API_KEY`.
(After editing Code.gs later: Deploy -> Manage deployments -> Edit -> New version.)

**Fee management:** Use **₹ Fees** in the portal to record payments, set status (Paid / Partial / Pending / Overdue), and send WhatsApp fee reminders to each parent’s mobile. Updates sync to the Sheet via the `updateFee` action (redeploy the web app after updating `Code.gs`).

**Admission email & links:** WhatsApp/copy messages include full admission details, logo URL, [Instagram](https://www.instagram.com/kanakshclasses), and [Google review](https://g.page/r/CUa3eeMUZIwwEAE/review). If the parent email is filled in, Apps Script sends a styled HTML confirmation (from the Google account that deployed the web app). Set `LOGO_URL` in `config.js` to your public logo URL (e.g. `https://yourdomain.com/portal/assets/logo.jpg`) so it shows in emails.

## 2. Upload to your domain
Upload `index.html`, `config.js` and the `assets/` folder to `public_html` (or a subfolder like `public_html/portal`) using cPanel File Manager or FTP. Do NOT upload `apps-script/`. Open https://yourdomain.com/portal/
Any static host works (cPanel, Netlify, Vercel, Cloudflare Pages). No Node.js needed.

## 3. Protect it (important)
The portal has no login and holds children's personal data, and the secret key is visible in `config.js`. In cPanel use **Directory Privacy** to password-protect the folder (or Cloudflare Access). A proper login comes with the Next.js version.
