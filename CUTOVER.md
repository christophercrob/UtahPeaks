# Cutover: point utahpeaks.org at Cloud Run

The site already runs on Cloud Run for `www`. This repo now serves its own images and does not call Manus at runtime. Merging to `main` deploys that build. Do the DNS change only after `www` shows the new images.

Apex `utahpeaks.org` is the canonical address. `www` redirects to it only after you turn that redirect on, so this deploy does not send `www` visitors back to the Manus apex.

## 1. Deploy, then look before changing DNS

Merge the pull request. GitHub Actions builds the image with the `VITE_GOOGLE_MAPS_API_KEY` secret and deploys service `utah-peaks` in project `utahpeaks`, region `us-central1`. The workflow stops if that secret is empty.

Confirm, before touching the apex:

- `https://www.utahpeaks.org` and `https://utah-peaks-419826993873.us-central1.run.app` show photos, icons, and the map.
- A photo URL under `/media/...` returns an image.
- `/manus-storage/<same-file>` returns `301` to `/media/<same-file>`.

Leave `CANONICAL_REDIRECT` unset for this check.

## 2. Maps API key referrers

In Google Cloud Console open **APIs & Services → Credentials** and edit the key stored as the GitHub secret `VITE_GOOGLE_MAPS_API_KEY`. It is a browser key. Vite bakes it into the JavaScript.

HTTP referrer restrictions, all three:

- `https://utahpeaks.org/*`
- `https://www.utahpeaks.org/*`
- `https://utah-peaks-419826993873.us-central1.run.app/*`

API restriction: **Maps JavaScript API**. The loader also requests the `marker`, `places`, `geocoding`, and `geometry` libraries. The app uses Advanced Markers (`marker`). It does not call Places, Geocoding, or Geometry. If the browser console later reports those libraries blocked, enable the matching APIs on this key.

If the key is currently unrestricted, add the three referrers in one save so `www` is not locked out. For local work, use a separate key restricted to `http://localhost:*` and `http://127.0.0.1:*` in a gitignored `.env` as `VITE_GOOGLE_MAPS_API_KEY`. Do not put that value in the repo.

Which GCP project owns the key is not recorded in this repo. The Cloud Run key is whichever value is in the GitHub secret.

## 3. Map the apex in Cloud Run

Console: **Cloud Run → Domain mappings → Add mapping**.

- Service: `utah-peaks`
- Region: `us-central1` (domain mapping exists in this region)
- Domain: `utahpeaks.org`

Or:

```bash
gcloud beta run domain-mappings create \
  --project utahpeaks \
  --region us-central1 \
  --service utah-peaks \
  --domain utahpeaks.org
```

`www.utahpeaks.org` is already mapped. Do not remove it.

If the console asks you to verify ownership, the DNS panel already has a TXT record:

`google-site-verification=ca6X-kWaL-knApahFo9PSZIFymukPM-nFGVia8lf37Q`

A November 21, 2026 lookup showed a stray trailing ` |` on that value. Leave the TXT record alone unless Search Console says verification failed; if it failed, delete the space and pipe and re-verify.

Domain mapping is the same preview feature `www` already uses. Google issues the certificate after DNS points at the mapping. That usually takes about 15 minutes and can take up to 24 hours. During that window `https://utahpeaks.org` may fail. `https://www.utahpeaks.org` stays on Cloud Run. Browsers that already loaded the old apex cached HSTS (`max-age=31536000; includeSubDomains`) for up to a year, so those browsers will not fall back to HTTP. Keep `www` on its current certificate the whole time.

## 4. DNS in the Manus panel

The panel can store **A, CNAME, MX, and TXT** only. It cannot store **AAAA**.

Open the records Google shows on the domain mapping (**DNS records** in the mapping's menu, or `gcloud beta run domain-mappings describe --domain utahpeaks.org --region us-central1 --project utahpeaks`). Add those. Copy the console list if it differs from the addresses below.

As of November 2026, Cloud Run apex mappings show these. They are Google's frontend addresses, not the addresses `www` resolves to through `ghs.googlehosted.com`. Do not copy `www`'s A records onto the apex.

| Type | Host | Value |
|---|---|---|
| A | `@` | `216.239.32.21` |
| A | `@` | `216.239.34.21` |
| A | `@` | `216.239.36.21` |
| A | `@` | `216.239.38.21` |
| AAAA | `@` | `2001:4860:4802:32::15` |
| AAAA | `@` | `2001:4860:4802:34::15` |
| AAAA | `@` | `2001:4860:4802:36::15` |
| AAAA | `@` | `2001:4860:4802:38::15` |

In the panel:

1. Delete the apex A record `104.18.26.246` (Manus). Do not leave it beside the new records.
2. Add the four **A** records at the apex (`@`, or whatever the panel calls the bare domain).
3. Skip the **AAAA** records. The panel cannot store them. **A-only is fine** for every normal visitor: browsers try IPv6, then use these A records. An IPv6-only network with no IPv4 and no DNS64 cannot open the apex until DNS lives somewhere that stores AAAA. Certificate issuance completes from the A records in normal cases. If the mapping stays on "certificate provisioning" for many hours, the missing AAAA records are the likely cause, and the fix is a DNS host that can store them. The four addresses do not change because of that move.
4. Do not put a CNAME on the apex. The panel has no ALIAS/ANAME, and an apex CNAME cannot sit next to the zone's other records. Google's apex mapping is A/AAAA, not a CNAME.
5. Leave `www` as `CNAME ghs.googlehosted.com`.
6. Leave the Search Console TXT record.

Google's edge redirects `http://utahpeaks.org` to HTTPS once the mapping is active. No DNS record does that. The app also redirects a public-host request that still arrives as HTTP.

## 5. Turn on the www → apex redirect

Do this only after `https://utahpeaks.org` itself serves the Cloud Run site (certificate valid, photos present, map loads). Until then, `www` must keep serving Cloud Run directly.

Console: **Cloud Run → utah-peaks → Edit & deploy new revision → Variables & secrets**

- Name: `CANONICAL_REDIRECT`
- Value: `1`

Or:

```bash
gcloud run services update utah-peaks \
  --project utahpeaks \
  --region us-central1 \
  --update-env-vars CANONICAL_REDIRECT=1
```

`https://www.utahpeaks.org/...` then returns `301` to `https://utahpeaks.org/...`. Later deploys from GitHub do not clear the variable, because the workflow does not replace environment variables.

The page also advertises `<link rel="canonical" href="https://utahpeaks.org/">`.

To turn the redirect off:

```bash
gcloud run services update utah-peaks \
  --project utahpeaks \
  --region us-central1 \
  --remove-env-vars CANONICAL_REDIRECT
```

## 6. Rollback

Turn the redirect off first. Put the apex A record back to `104.18.26.246` and remove the `utahpeaks.org` domain mapping. `www` keeps serving Cloud Run. The old Manus apex is unchanged until that A record is replaced.

## Analytics

The Manus Umami snippet (`manus-analytics.com`, website id `b3a0460a-3013-4da2-8948-7eb2fc64e49b`) was removed. No analytics provider was added. Historical Umami data stays in Manus unless you export it. Add Cloudflare Web Analytics or GA4 later if you want a replacement.
