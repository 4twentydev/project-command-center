export const marketingFunnelStages = [
  "target", "contacted", "conversation", "fit-call", "audit-proposed", "audit-paid",
  "build-proposed", "won", "lost", "nurture",
] as const;
export type MarketingFunnelStage = typeof marketingFunnelStages[number];

export const marketingSources = ["warm-introduction", "direct-outreach", "shop-visit", "linkedin", "cama", "colorado-sign-association", "sbdc", "organic-search", "referral"] as const;
export type MarketingSource = typeof marketingSources[number];

export const prospectSegments = ["cnc-sign-fabrication", "job-shop", "custom-manufacturer", "architectural-products", "contractor-field-service", "other"] as const;
export type ProspectSegment = typeof prospectSegments[number];

export const marketingActivityTypes = ["call", "voicemail", "email", "linkedin", "linkedin-comment", "conversation", "visit", "referral", "fit-call", "audit-proposed", "audit-paid", "build-proposed", "client-won", "note"] as const;
export type MarketingActivityType = typeof marketingActivityTypes[number];

export const contentStatuses = ["idea", "draft", "scheduled", "published"] as const;
export type ContentStatus = typeof contentStatuses[number];

export const marketingStageLabels: Record<MarketingFunnelStage, string> = {
  target: "Target", contacted: "Contacted", conversation: "Conversation", "fit-call": "Fit call",
  "audit-proposed": "Audit proposed", "audit-paid": "Audit paid", "build-proposed": "Build proposed",
  won: "Won", lost: "Lost", nurture: "Nurture",
};

export const marketingSourceLabels: Record<MarketingSource, string> = {
  "warm-introduction": "Warm introduction", "direct-outreach": "Direct outreach", "shop-visit": "Shop visit",
  linkedin: "LinkedIn", cama: "CAMA", "colorado-sign-association": "Colorado Sign Association",
  sbdc: "Colorado SBDC", "organic-search": "Organic search", referral: "Referral",
};

export const marketingActivityLabels: Record<MarketingActivityType, string> = {
  call: "Call", voicemail: "Voicemail", email: "Email", linkedin: "LinkedIn", "linkedin-comment": "LinkedIn comment",
  conversation: "Conversation", visit: "Shop visit", referral: "Referral", "fit-call": "Fit call", "audit-proposed": "Audit proposed", "audit-paid": "Audit paid",
  "build-proposed": "Build proposed", "client-won": "Client won", note: "Note",
};

export const marketingTargets = {
  weekly: { accounts: 8, outreach: 6, conversations: 2, fitCalls: 1, visits: 1, posts: 1, comments: 5 },
  ninetyDay: { accounts: 96, outreach: 72, conversations: 24, fitCalls: 12, paidAudits: 6, paidClients: 3 },
  monthlyBudget: 300,
  weeklyHours: "6–8",
} as const;

export const idealCustomerProfile = {
  title: "Front Range shops where operating information still travels by hand",
  employees: "Approximately 5–75 employees",
  buyers: ["Owner", "Operations manager", "Production manager", "Shop manager"],
  priorities: ["CNC, sign, and fabrication shops", "Job shops", "Architectural-product manufacturers", "Small custom manufacturers"],
  signals: ["Quotes wait for one experienced person", "Inventory is checked by walking or calling", "Production status is reconstructed", "The same job is entered more than once", "Paperwork is repeatedly reformatted", "Scheduling changes do not reach downstream work"],
} as const;

export const launchWeeks = [
  { week: 1, phase: "Foundation", focus: "Positioning and operating assets", actions: ["Update Brandon’s LinkedIn headline and About section", "Prepare audit handout, signature, and scripts", "Build the first 20-account route-based list"], content: "Why production experience changes software design" },
  { week: 2, phase: "Foundation", focus: "Warm launch", actions: ["Contact 5–15 warm relationships personally", "Add the next 20 qualified accounts", "Schedule the first fit calls and introductions"], content: "Why quoting delays are usually workflow problems" },
  { week: 3, phase: "Conversation", focus: "North-metro outreach", actions: ["Run the complete contact sequence", "Hold the first scheduled shop introductions", "Record every next action"], content: "On-hand, committed, and available inventory" },
  { week: 4, phase: "Conversation", focus: "First audit conversions", actions: ["Move qualified fit calls to paid audits", "Deliver any audit within three business days", "Review message-to-conversation conversion"], content: "WORK//CTRL as an honestly labeled live system" },
  { week: 5, phase: "Conversation", focus: "Route-based field block", actions: ["Book two meetings before a longer drive", "Ask for one specific introduction", "Follow up with every open conversation"], content: "Why production status gets reconstructed" },
  { week: 6, phase: "Conversation", focus: "Offer clarity", actions: ["Review audit objections", "Refine the fit-call transition", "Stop weak list sources"], content: "What a Workflow Audit includes—and what it does not" },
  { week: 7, phase: "Proof", focus: "Convert evidence", actions: ["Ask for permission before using any client material", "Create one generalized process lesson", "Move suitable audits into sprint proposals"], content: "Repetitive paperwork as a systems symptom" },
  { week: 8, phase: "Proof", focus: "Commerce and marketplace network", actions: ["Identify three product-led businesses with a clear commerce constraint", "Make three genuine contacts", "Follow up within two business days"], content: "jwld.store as a live storefront and an honest foundation for broader marketplace systems" },
  { week: 9, phase: "Proof", focus: "Manufacturing network", actions: ["Attend one relevant CAMA program", "Listen for recurring operating problems", "Schedule only qualified follow-ups"], content: "Scheduling changes that fail to travel" },
  { week: 10, phase: "Proof", focus: "Owner-side review", actions: ["Use a Colorado SBDC advising session", "Review pricing and delivery capacity", "Confirm the strongest segment"], content: "When to convert a spreadsheet—and when to keep it" },
  { week: 11, phase: "Close", focus: "Pipeline resolution", actions: ["Follow up with every qualified conversation", "Close stale loops respectfully", "Schedule builds around one-active-build capacity"], content: "An anonymized audit or field lesson" },
  { week: 12, phase: "Close", focus: "Quarter review", actions: ["Review channel, segment, source, and message performance", "Continue only channels producing conversations", "Choose the next-quarter case-study priority"], content: "What the first 90 days revealed" },
] as const;

export const outreachSequence = [
  { day: 0, channel: "Call + email", instruction: "Make a personal call, leave a short voicemail when necessary, and send a same-day email referencing one real operating signal." },
  { day: 3, channel: "LinkedIn", instruction: "Connect or interact thoughtfully; do not paste the same sales message." },
  { day: 7, channel: "Second call", instruction: "Reference the earlier message and ask one direct fit question." },
  { day: 14, channel: "Useful follow-up", instruction: "Send a relevant observation, checklist, or example without pretending it is personalized analysis." },
  { day: 30, channel: "Close the loop", instruction: "Ask whether to revisit later or close the record. Respect a no." },
] as const;

export const marketingTemplates = {
  call: `Hi, this is Brandon York with Yorkstead Systems. My background is in production, CNC fabrication, inventory, shipping, and software. I help smaller shops fix workflows where quoting, inventory, paperwork, or production status still has to be reconciled by hand. Is there one part of that process that creates more chasing than it should?`,
  voicemail: `Hi, this is Brandon York with Yorkstead Systems. I work with smaller manufacturers and fabrication shops on quoting, inventory, production, and paperwork workflows. I’m reaching out because your operation looks like the kind of real-world work I understand. You can reach me through yorkstead.com. I’ll also send a short email.`,
  emailSubject: `A practical workflow question for {{company}}`,
  email: `Hi {{name}},\n\nI’m Brandon York, founder of Yorkstead Systems. My background spans production management, CNC fabrication, inventory, shipping, and custom software.\n\nI help smaller shops improve workflows where quoting, inventory, paperwork, scheduling, or production status still has to be reconciled by hand. I noticed {{specific_signal}}.\n\nIs there one part of that process that creates more chasing or duplicate entry than it should? If so, I’d be glad to spend 20 minutes determining whether a focused workflow audit would be useful.\n\nBrandon York\nYorkstead Systems\nIndustrial software and workflow automation\nhttps://yorkstead.com`,
  followUp: `Hi {{name}},\n\nClosing the loop on my earlier note. If quoting, inventory, production visibility, or repetitive paperwork is creating avoidable owner involvement at {{company}}, I’d be happy to have a short fit call. If the timing is not right, I can close this out and reconnect later.\n\nBrandon`,
  fitCallAgenda: `20-minute fit call\n\n1. Why this problem matters now — 4 minutes\n2. Walk through the current symptom — 8 minutes\n3. Confirm owner, urgency, constraints, and desired outcome — 5 minutes\n4. Decide: no fit, future follow-up, or paid Workflow Audit — 3 minutes\n\nDo not provide the full bottleneck analysis or implementation design during the fit call.`,
  shopIntroduction: `15-minute shop introduction\n\n• Confirm the owner/manager and purpose before arriving.\n• Follow every safety, PPE, restricted-area, and photography rule.\n• Ask where quoting, inventory, paperwork, or production status creates the most chasing.\n• Observe context; do not perform free workflow mapping.\n• End with a specific next step: no fit, fit call, or paid audit.`,
  permission: `Permission request\n\nMay Yorkstead Systems use the specifically identified screenshot, photo, process description, or project result in public marketing? Approval applies only to the listed material and can exclude company names, people, metrics, or identifying details. No material will be published until the approved version is confirmed in writing.`,
} as const;

export const partnerResources = [
  { name: "Colorado Advanced Manufacturing Association", role: "Primary manufacturing relationship", url: "https://co-cama.org/events/", action: "Attend one relevant program and build three genuine relationships." },
  { name: "Colorado Sign Association", role: "Primary sign/fabrication relationship", url: "https://cosigns.org/", action: "Request guest access or attend one relevant gathering." },
  { name: "Colorado SBDC", role: "Owner-side advisory resource", url: "https://sbdc.colorado.gov/about", action: "Schedule one no-cost business-advising session." },
  { name: "Manufacturer’s Edge", role: "Future complementary relationship", url: "https://manufacturersedge.com/", action: "Revisit after a clear approved case study exists." },
] as const;

export const launchBudget = [
  { item: "Audit handouts and business cards", cap: 80 },
  { item: "Front Range travel and coffee meetings", cap: 100 },
  { item: "Two low-cost industry events", cap: 80 },
  { item: "Contingency", cap: 40 },
] as const;
