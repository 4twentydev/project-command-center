# Search Engine Optimization & Measurement Architecture

## 1. Search Engine Verification & Ownership
1. Add `yorkstead.com` as a **Domain property** in Google Search Console.
2. Public sitemap and robots endpoints:
   - `https://yorkstead.com/robots.txt`
   - `https://yorkstead.com/sitemap.xml`
3. Submit `https://yorkstead.com/sitemap.xml` in Search Console.

---

## 2. Cookieless First-Party Analytics Policy
- All event measurements are cookieless, first-party, and privacy-preserving.
- Event records in Neon PostgreSQL are anonymized with a daily-rotating SHA-256 request salt.
- Zero analytics payloads are transmitted to Google Analytics, Meta Pixel, or third-party tracking scripts.
