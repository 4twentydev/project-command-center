export type LabExperiment = {
  slug: string;
  number: string;
  title: string;
  category: string;
  kicker: string;
  maturity: "Functional Prototype" | "Browser-Runnable Slice" | "Hardware Lab Benchmark" | "Archived Spike";
  status: "active_experiment" | "runnable_prototype" | "archived";
  purpose: string;
  operationalHypothesis: string;
  limitations: string;
  dataSource: string;
  interactionType: "Live interactive demo" | "External runnable slice" | "Architecture & specs only" | "Read-only archive";
  interactionUrl?: string;
  technologies: string[];
  findings: string[];
};

export const publicLabExperiments: LabExperiment[] = [
  {
    slug: "sic-pizza-pos",
    number: "LAB-01",
    title: "SIC Pizza Tableside POS & Voice Engine",
    category: "Hospitality Point of Sale & Brand Tone",
    kicker: "Collaborative Tableside Ordering & Sarcastic Voice",
    maturity: "Browser-Runnable Slice",
    status: "runnable_prototype",
    purpose: "Testing collaborative guest item proposals, tableside server entry, and configurable sarcastic brand voice in non-sensitive moments.",
    operationalHypothesis: "Restaurants can run a distinctive brand personality without sacrificing strict integer-cent pricing, kitchen state integrity, and audit logging.",
    limitations: "Uses mocked in-memory state, seeded development PINs, decorative same-browser QR join, and mocked card authorization. Not certified for live payment processing.",
    dataSource: "Synthetic menu items and mock tableside orders.",
    interactionType: "External runnable slice",
    interactionUrl: "https://sic-pizza.vercel.app",
    technologies: ["Next.js 16", "React 19", "TypeScript", "Drizzle ORM", "Tailwind CSS"],
    findings: [
      "Guest item proposals must require explicit server authorization before kitchen transmission.",
      "Separating tone configuration from core ordering logic prevents brand voice from leaking into receipt or payment payloads.",
    ],
  },
  {
    slug: "shop-inventory-allocation",
    number: "LAB-02",
    title: "Shop Inventory & Job Material Allocation",
    category: "Mobile Shopfloor & Material Telemetry",
    kicker: "Mobile-First Stock Movement & Shortage Prevention",
    maturity: "Functional Prototype",
    status: "active_experiment",
    purpose: "Exploring a lightweight, mobile-first inventory pattern that separates physical on-hand stock from job-committed material without heavy ERP overhead.",
    operationalHypothesis: "Small fabrication shops make fewer quoting errors and experience fewer mid-job stockouts when material reservation is visible directly from the traveler.",
    limitations: "In-memory simulation. Hardware barcode laser scanner integration and automated supplier EDI ordering remain future work.",
    dataSource: "Synthetic fabrication sheet metal stock fixtures.",
    interactionType: "Live interactive demo",
    interactionUrl: "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
    technologies: ["TypeScript Domain Models", "Mobile-First UI Patterns", "Integer Quantity Arithmetic"],
    findings: [
      "Negative stock overdraft prevention must be enforced at the immutable transaction ledger layer.",
      "Field teams need job-level material reservation rather than complex multi-warehouse bin hierarchies.",
    ],
  },
  {
    slug: "iot-telemetry-bridge",
    number: "LAB-03",
    title: "Industrial Modbus/TCP Machine Telemetry Bridge",
    category: "Edge Hardware & Field Protocols",
    kicker: "Laser Assist-Gas Pressure & Chiller Telemetry",
    maturity: "Hardware Lab Benchmark",
    status: "active_experiment",
    purpose: "Benchmarking edge-device polling intervals for RS-485 Modbus TCP sensors monitoring assist-gas pressure on laser cutters and compressor runtimes.",
    operationalHypothesis: "Predictive downtime alerts can be triggered by monitoring pressure drop gradients 30 seconds before laser fault shutdown.",
    limitations: "Benchtop hardware simulation only. Zero direct PLC actuator write capability to prevent safety hazard risks.",
    dataSource: "Synthetic high-frequency sensor telemetry logs.",
    interactionType: "Architecture & specs only",
    technologies: ["Node.js Edge Runtime", "Modbus TCP", "Time-Series Aggregation", "Synthetic Telemetry Generator"],
    findings: [
      "Edge telemetry bridges must be strictly unidirectional (read-only) to satisfy industrial safety boundaries.",
      "Buffering telemetry locally during network drops prevents false downtime alerts.",
    ],
  },
  {
    slug: "offline-pwa-sync-engine",
    number: "LAB-04",
    title: "Offline-First Service Worker Transaction Queue",
    category: "Distributed Systems & Resilient Sync",
    kicker: "Subterranean Field Service Checklists",
    maturity: "Archived Spike",
    status: "archived",
    purpose: "Evaluated client-side IndexedDB operational transaction queues for mobile technicians operating in zero-connectivity subterranean parking garages.",
    operationalHypothesis: "Technicians can complete 100% of inspections offline and sync deterministically upon regaining LTE/Wi-Fi signal.",
    limitations: "Concluded research spike. The production system adopted optimistic client caching with lightweight background sync to reduce complexity.",
    dataSource: "Synthetic synchronization race-condition test suite.",
    interactionType: "Read-only archive",
    technologies: ["IndexedDB", "Service Workers", "Conflict Resolution Rules", "Web Crypto API"],
    findings: [
      "Append-only client activity logs resolve sync conflicts with significantly less complexity than CRDT state merging.",
      "Optimistic UI state with server-reconciled timestamps provides sufficient consistency for mobile work orders.",
    ],
  },
];
