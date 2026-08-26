export type PublicDemo = {
  slug: string;
  number: string;
  title: string;
  industry: string;
  kicker: string;
  summary: string;
  operationalProblem: string;
  solutionNarrative: string;
  workflowsShown: string[];
  maturity: "Interactive Production Sandbox" | "Beta Interactive Sandbox";
  dataDisclaimer: string;
  canonicalLaunchUrl: string;
  metrics: { label: string; value: string }[];
  stages: string[];
};

export const publicDemos: PublicDemo[] = [
  {
    slug: "front-range-manufacturing",
    number: "01",
    title: "Front Range Precision Manufacturing",
    industry: "Precision Sheet Metal & CNC Machining",
    kicker: "High-Mix Shopfloor Execution & Traveler Control",
    summary: "High-mix contract manufacturing with laser cutting, CNC press brake forming, welding, FAI inspection, and palletized logistics.",
    operationalProblem: "Disjointed paper travelers, scrap from unverified CAD drawing revisions, and blind spots on machine downtime.",
    solutionNarrative: "Digital shopfloor travelers on 6kW laser cells, integer-cents quote margin enforcement, FAI quality signoffs, and gross-weight shipping manifests.",
    workflowsShown: [
      "QuoteFlow Estimating & Margin Policy Guardrails",
      "Digital Traveler Execution on 6kW Laser Cell",
      "First Article Inspection (FAI) & NCR Containment",
      "Pallet Load Builder & Carrier Manifest Dispatch",
    ],
    maturity: "Interactive Production Sandbox",
    dataDisclaimer: "Operates exclusively with synthetic fixtures. Zero customer CAD or real ERP data leakage.",
    canonicalLaunchUrl: "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
    metrics: [
      { label: "WIP Value", value: "$142,500" },
      { label: "On-Time Rate", value: "98.7%" },
      { label: "First Pass Yield", value: "99.2%" },
    ],
    stages: ["Quote Intake", "Laser Traveler", "FAI Quality Check", "Pallet Shipping"],
  },
  {
    slug: "summit-facility-services",
    number: "02",
    title: "Summit Facility Services",
    industry: "Commercial Facility Maintenance & Sanitation",
    kicker: "Multi-Site Service Operations & Proof of Work",
    summary: "Multi-site facility operations managing corporate campuses, hospital cleanrooms, and recurring preventative maintenance shifts.",
    operationalProblem: "Uncertain shift completion, missed sanitization checklists, lack of photographic proof-of-work, and unverified bio-load compliance.",
    solutionNarrative: "Mobile shift execution checklists, ATP bioluminescent swab scoring (<30 RLU hospital grade), exception tracking, and digital client signoffs.",
    workflowsShown: [
      "Multi-Facility Tier Scheduling & Site Allocation",
      "Mobile 5-Point Shift Sanitation Checklists",
      "Bioluminescent ATP Swab Verification (<30 RLU)",
      "Digital Client Punchlist Signoff & Consumables Log",
    ],
    maturity: "Interactive Production Sandbox",
    dataDisclaimer: "All facilities, square footage, and client signatures are synthetic demonstration records.",
    canonicalLaunchUrl: "https://ops.yorkstead.com/demo?scenario=summit-facility-services",
    metrics: [
      { label: "Active Facilities", value: "3 Sites" },
      { label: "Audit Quality", value: "99.4%" },
      { label: "Supply Efficiency", value: "98.1%" },
    ],
    stages: ["Site Allocation", "Mobile Checklist", "ATP Bio-Swab", "Client Signoff"],
  },
  {
    slug: "mile-high-signworks",
    number: "03",
    title: "Mile High Signworks",
    industry: "Architectural Sign Fabrication & Rigging",
    kicker: "Custom Job Shop, Permitting & Crane Rigging",
    summary: "Architectural sign manufacturing featuring vector CAD revision locks, City electrical permits, CNC routing, and 45ft crane installation.",
    operationalProblem: "Wrong DXF artwork released to CNC routers, uninspected electrical circuits failing UL 48, and uncoordinated crane rigging crews.",
    solutionNarrative: "Client artwork approval gate, City electrical permit vault tracking, in-shop fabrication routing, foam crating, and illuminated proof-of-work.",
    workflowsShown: [
      "Vector CAD Drawing Revision Gate & Client Lock",
      "City Electrical Permit & UL 48 Listing Verification",
      "CNC Routing & 12V LED Module Array Layout",
      "45ft Boom Crane Rigging & Illuminated Nighttime Signoff",
    ],
    maturity: "Interactive Production Sandbox",
    dataDisclaimer: "Synthetic architectural drawings and simulated municipal permit records.",
    canonicalLaunchUrl: "https://ops.yorkstead.com/demo?scenario=mile-high-signworks",
    metrics: [
      { label: "On-Time Installs", value: "98.2%" },
      { label: "Permit Pass Rate", value: "100.0%" },
      { label: "Avg Lead Time", value: "16 Days" },
    ],
    stages: ["Artwork Revision", "UL Permitting", "Shop Routing", "Crane Rigging"],
  },
  {
    slug: "peak-mobile-detail",
    number: "04",
    title: "Peak Mobile Detail",
    industry: "Mobile Detailing & Ceramic Quartz",
    kicker: "Phone-First Fleet Ops & On-Site Add-On Consent",
    summary: "On-demand mobile detailing fleet with ultrasonic paint depth telemetry, multi-point mobile checklist, and simulated card payment.",
    operationalProblem: "Thin clearcoat burn-through risks, unrecorded add-on customer consent, and disconnected card payment receipts.",
    solutionNarrative: "Ultrasonic clearcoat thickness mapping (135µm safe), SMS digital add-on consent with real-time recalculation, and simulated merchant checkout.",
    workflowsShown: [
      "Vehicle Intake & Ultrasonic Paint Depth Mapping",
      "Phone-First 6-Stage Decon & Ceramic Cure Checklist",
      "On-Site Add-On Customer Consent & Recalculation",
      "Simulated Card Payment Capture (Zero Gateway Calls)",
    ],
    maturity: "Interactive Production Sandbox",
    dataDisclaimer: "Synthetic credit card checkout in sandbox mode. Zero actual merchant charges.",
    canonicalLaunchUrl: "https://ops.yorkstead.com/demo?scenario=peak-mobile-detail",
    metrics: [
      { label: "Van Utilization", value: "94.5%" },
      { label: "Avg Ticket", value: "$740.00" },
      { label: "5-Star Reviews", value: "99.8%" },
    ],
    stages: ["Intake Telemetry", "Detail Checklist", "Add-On Consent", "Simulated Checkout"],
  },
];
