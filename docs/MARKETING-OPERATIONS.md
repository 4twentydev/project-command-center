# Marketing operations

The private `/dashboard/marketing` workspace implements the approved 90-day, founder-led launch plan for 4TWENTY.DEV. It is an operating surface—not an automated outreach or publishing system.

## What it manages

- twelve-week launch plan and weekly focus;
- qualified outbound prospects and route-based operating signals;
- pipeline stages from Target through Won, Lost, or Nurture;
- calls, emails, LinkedIn activity, visits, fit calls, audits, proposals, and wins;
- source attribution and booked value;
- the twelve approved LinkedIn topics and their assets, CTAs, status, and results;
- weekly and ninety-day funnel scorecards;
- outreach, fit-call, shop-introduction, follow-up, and permission templates;
- Colorado partnership references and monthly budget guardrails; and
- print-ready Workflow Audit collateral, fictional sample briefing, and QR cards.

## Starting the campaign

1. Run `bun run db:migrate` after deployment so the `marketing_workspaces` table exists.
2. Open `/dashboard/marketing` and select **Start campaign today**. This seeds the approved content topics and starts week one.
3. Add only qualified companies. Record a specific operational signal rather than importing anonymous bulk lists.
4. Give every active prospect a dated next action.
5. Log real touches and outcomes. The scorecard is derived from those timestamps; it is not manually inflated.
6. Review the dashboard weekly and make channel decisions only at weeks 4, 8, and 12.

## Pipeline rules

- **Target:** researched account with a plausible operational signal.
- **Contacted:** a personal outreach attempt has occurred.
- **Conversation:** a decision-maker or relevant operator engaged.
- **Fit call:** the free 20-minute qualification conversation occurred or is scheduled.
- **Audit proposed / paid:** the $350 Workflow Audit was offered or purchased.
- **Build proposed:** an audit supports a bounded Sprint or System proposal.
- **Won / Lost / Nurture:** work is booked, definitively declined, or intentionally deferred.

Logging Conversation, Fit Call, Audit Proposed, Audit Paid, Build Proposed, or Client Won automatically advances the associated prospect to the matching stage.

## External actions the software does not perform

The workspace never sends email, places calls, posts to LinkedIn, registers for events, publishes client material, or creates external accounts. Brandon remains responsible for reviewing and performing each action.

Before publishing any shop image, screenshot, process description, customer identity, testimonial, or result, obtain written approval for the exact final material. Current and former employer information remains private unless separately authorized.

## Printed collateral

Open `/dashboard/marketing/one-sheet` and use **Print or save PDF**. The print set contains:

1. Workflow Audit one-sheet;
2. clearly fictional sample audit briefing; and
3. four QR business cards.

The QR code is generated locally by the application and points directly to `https://www.4twenty.dev/workflow-audit`; it does not use an external tracking or QR service.
