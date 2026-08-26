export type SolutionOutcome = {
  slug: string;
  number: string;
  title: string;
  kicker: string;
  coreProblem: string;
  operationalBottleneck: string;
  howWeSolveIt: string;
  composableCapabilities: string[];
  demoSlug?: string;
  demoUrl?: string;
  status: "Available in live demo" | "Custom engagement capability";
  diagnosticFocus: string;
};

export const publicSolutions: SolutionOutcome[] = [
  {
    slug: "quoting-and-estimating",
    number: "01",
    title: "Quote-to-Job Conversion & Margin Guardrails",
    kicker: "Estimating & Commercial Governance",
    coreProblem: "Requests wait days for pricing while estimators guess machine setup times and raw material markups.",
    operationalBottleneck: "Underpriced complex jobs eat shop margin, while slow turnaround causes winnable bids to go cold.",
    howWeSolveIt: "Structured integer-cents quoting with automated machine-rate calculation, material cost yield factors, margin guardrail warnings, and 1-click idempotent conversion to live shop jobs.",
    composableCapabilities: [
      "Dynamic material & machine runtime pricing tables",
      "Executive margin threshold approval alerts",
      "Customer revision tracking with change summaries",
      "1-click job packet and digital traveler generation",
    ],
    demoSlug: "front-range-manufacturing",
    demoUrl: "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
    status: "Available in live demo",
    diagnosticFocus: "Estimating cycle time and margin erosion audits.",
  },
  {
    slug: "shopfloor-and-traveler-control",
    number: "02",
    title: "Shopfloor Execution & Revision Lock",
    kicker: "Manufacturing Execution & Work-In-Progress",
    coreProblem: "Operators work from outdated paper drawings, and job status has to be reconstructed with shop walk-arounds.",
    operationalBottleneck: "Scrapped parts from superseded CAD revisions, unrecorded machine downtime, and bottlenecks discovered only after delivery dates pass.",
    howWeSolveIt: "Station-by-station digital travelers with CAD revision locking, QR code asset scanning, blocker reporting, and live shift progress tracking.",
    composableCapabilities: [
      "Revision-locked vector CAD drawing viewers",
      "Work-center sequential step signoffs",
      "Real-time equipment downtime interval logging",
      "First Article Inspection (FAI) and NCR quarantine",
    ],
    demoSlug: "mile-high-signworks",
    demoUrl: "https://ops.yorkstead.com/demo?scenario=mile-high-signworks",
    status: "Available in live demo",
    diagnosticFocus: "Shopfloor traveler friction and revision mismatch audits.",
  },
  {
    slug: "field-service-and-mobile-operations",
    number: "03",
    title: "Mobile Field Execution & Proof-of-Work",
    kicker: "Field Teams & Distributed Operations",
    coreProblem: "Technicians in the field struggle with clunky desktop apps, leading to incomplete checklists and delayed billing.",
    operationalBottleneck: "Disputed service completion, unrecorded customer add-on consents, and missed compliance sanitization standards.",
    howWeSolveIt: "Phone-first technician interface with step checklists, ultrasonic telemetry readings, GPS photo proof-of-work, and digital customer signoffs.",
    composableCapabilities: [
      "Offline-resilient mobile shift checklists",
      "On-site add-on customer consent with instant re-pricing",
      "Timestamped high-resolution photo proof archives",
      "Digital customer signoffs and warranty generation",
    ],
    demoSlug: "peak-mobile-detail",
    demoUrl: "https://ops.yorkstead.com/demo?scenario=peak-mobile-detail",
    status: "Available in live demo",
    diagnosticFocus: "Field crew dispatch and proof-of-work handoff audits.",
  },
  {
    slug: "inventory-and-material-ledger",
    number: "04",
    title: "Material Ledger & Sourcing Governance",
    kicker: "Inventory Accuracy & Purchasing Control",
    coreProblem: "Spreadsheet inventory drift leads to stockouts midway through manufacturing runs.",
    operationalBottleneck: "Double-ordering materials, unallocated safety stock, and unrecorded dock receiving variance.",
    howWeSolveIt: "Immutable double-entry transaction ledger enforcing zero negative stock, purchase order spend approvals, and dock barcode receiving.",
    composableCapabilities: [
      "Immutable transaction-only inventory balances",
      "Negative stock overdraft prevention policy",
      "Purchase order tiered spend authorization limits",
      "Dock receiving inspection and automated restock",
    ],
    demoSlug: "front-range-manufacturing",
    demoUrl: "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
    status: "Available in live demo",
    diagnosticFocus: "Material replenishment and inventory ledger audits.",
  },
  {
    slug: "packaging-and-shipping-logistics",
    number: "05",
    title: "Pallet Load Building & Carrier Dispatch",
    kicker: "Packaging & Logistics Verification",
    coreProblem: "Shipping dock uses guess-work for pallet packing, causing overweight carrier rejections and missing BOL paperwork.",
    operationalBottleneck: "Late shipments, damaged goods from overloaded pallets, and lack of signed delivery confirmation.",
    howWeSolveIt: "Container capacity math, automated gross weight calculation, carrier shipping manifests, and electronic proof-of-delivery (POD) tracking.",
    composableCapabilities: [
      "Container capacity constraint enforcement",
      "Carrier Bill of Lading (BOL) manifest generator",
      "Gross shipping weight automated calculations",
      "Carrier tracking and proof of delivery capture",
    ],
    demoSlug: "front-range-manufacturing",
    demoUrl: "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
    status: "Available in live demo",
    diagnosticFocus: "Shipping throughput and dispatch verification audits.",
  },
];
