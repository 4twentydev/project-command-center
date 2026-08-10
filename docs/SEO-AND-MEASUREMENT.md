# Search, measurement, and local-business setup

The application owns the technical SEO and first-party conversion layer. External accounts remain a business-owner responsibility.

## What the application publishes

- `/sitemap.xml` is generated from the typed service and case-study catalogs plus the public static routes.
- `/robots.txt` allows the public site and excludes APIs, login, account, and dashboard routes.
- Every indexable page has a self-referencing canonical URL, page-specific title and description, Open Graph metadata, and a large social card.
- The homepage publishes Organization data; `/about` publishes Person and Organization data; service pages publish Service, FAQ, and Breadcrumb data; project profiles publish CreativeWork and Breadcrumb data.
- `/privacy` explains form and analytics handling. `/not-found` supplies the branded 404 experience and useful next steps.
- Private owner routes are `noindex, nofollow` in addition to being excluded from `robots.txt`.

## First-party analytics

Conversion events are written to the existing Neon `conversion_events` table. No Google Analytics, Meta Pixel, advertising identifier, browser cookie, or third-party analytics script is added.

The browser sends only an allowlisted event name, the current public path, and limited context such as a service slug, project slug, placement, or booking destination. The server derives a daily salted one-way request hash for rate limiting and aggregate counting; it does not store the raw network address in the analytics table. Records older than 90 days are pruned as new events are recorded.

Tracked events:

- `service_page_view`
- `case_study_view`
- `workflow_audit_cta_click`
- `contact_form_start`
- `contact_form_submission` — recorded server-side only after a real inquiry is stored
- `email_link_click`
- `phone_link_click` — active when `BUSINESS_PHONE` is configured
- `external_booking_link_click`
- Existing Workflow Audit form, validation, view, and successful-submission events remain available for funnel detail.

Run `bun run db:migrate` in each environment before relying on event or inquiry storage.

## Google Search Console

Recommended setup:

1. Add `4twenty.dev` as a **Domain property** in Search Console. Domain properties cover protocols and subdomains and require the DNS record Google supplies.
2. Keep the DNS verification record after verification succeeds.
3. As an optional secondary method, copy only the `content` value from Google's HTML verification tag into the production Vercel variable `GOOGLE_SITE_VERIFICATION`, then redeploy. The app renders it as `<meta name="google-site-verification">` in the homepage head.
4. Confirm these production URLs return `200` without authentication:
   - `https://www.4twenty.dev/robots.txt`
   - `https://www.4twenty.dev/sitemap.xml`
5. Submit `https://www.4twenty.dev/sitemap.xml` in Search Console's Sitemaps report.
6. Use URL Inspection for the homepage, the four service pages, `/about`, `/workflow-audit`, and the three project profiles. Request indexing after the deployment is live.
7. Review Page indexing, Core Web Vitals, queries, impressions, and clicks after Google has had time to crawl the site.

Official references: [verify site ownership](https://support.google.com/webmasters/answer/9008080), [add a Search Console property](https://support.google.com/webmasters/answer/34592), and [submit and monitor a sitemap](https://support.google.com/webmasters/answer/7451001).

## Google Business Profile

Do not create a profile until the business is eligible. Google currently describes Business Profiles as intended for businesses that meet customers in person at a storefront or travel to customers; online-only businesses are not eligible.

If 4TWENTY.DEV qualifies:

1. Search Google and Maps for an existing `4TWENTY.DEV` profile before adding one. Claim an existing accurate profile instead of creating a duplicate.
2. Use the real public business name exactly as represented on the website and business materials. Do not add keywords to the name.
3. Choose the closest accurate primary category based on the services actually sold. Do not select a category solely for ranking.
4. Use `https://www.4twenty.dev` as the website and a business-controlled phone number if one is approved.
5. If customers are not served at the business address, hide the address. Add only accurate service areas where in-person service is actually delivered. Never publish a residential address merely to obtain local visibility.
6. Complete only the verification methods Google offers for the profile; the application cannot choose or complete those methods.
7. Add an approved logo, founder/business photos, service descriptions, hours, and booking link only after each item reflects the real operation.

Official references: [add or claim a profile](https://support.google.com/business/answer/2911778), [eligibility and setup](https://support.google.com/business/answer/7039811), [verify a profile](https://support.google.com/business/answer/7107242), [service-area guidance](https://support.google.com/business/answer/9157481), and [business representation guidelines](https://support.google.com/business/answer/3038177).

## Optional business structured data

The site publishes no street address by default. Configure only approved, public information in Vercel:

```env
BUSINESS_PHONE=+1 555 555 5555
BUSINESS_SERVICE_AREA=Approved service area description
```

An address appears in Organization structured data only when every address field is present **and** `BUSINESS_ADDRESS_APPROVED=true`:

```env
BUSINESS_ADDRESS_APPROVED=true
BUSINESS_STREET_ADDRESS=Approved public business address
BUSINESS_ADDRESS_LOCALITY=City
BUSINESS_ADDRESS_REGION=CO
BUSINESS_POSTAL_CODE=00000
BUSINESS_ADDRESS_COUNTRY=US
```

Do not set the approval flag for a residential address that should remain private.

## Deployment checks

After changing production metadata or environment variables:

1. Redeploy the production project.
2. Check the deployment logs and `/api/health` for database or integration failures.
3. Inspect page source—not only the rendered DOM—for the canonical, description, Open Graph tags, and optional verification tag.
4. Validate JSON-LD with Google's Rich Results Test and Schema.org's validator. FAQ rich-result display is not guaranteed.
5. Test the social card at `/opengraph-image` and each project-specific social-card route.
6. Confirm the Vercel production domain redirects consistently to `https://www.4twenty.dev` so duplicate hosts do not compete in search.
7. Review real-user Core Web Vitals in Search Console. Vercel Speed Insights can be enabled later if Brandon wants route-level production telemetry; it is not required for the current cookieless conversion store.
