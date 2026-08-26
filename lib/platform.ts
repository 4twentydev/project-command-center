export type PlatformModule = {
  id: string;
  name: string;
  category: "core_foundation" | "operational_module";
  summary: string;
  roleBeneficiaries: string[];
  keyCapabilities: string[];
};

export type RolePerspective = {
  id: string;
  roleTitle: string;
  personaExample: string;
  operatingFocus: string;
  interfaceView: string;
  whatTheySee: string[];
  whatIsHidden: string;
};

export const platformModules: PlatformModule[] = [
  {
    id: "identity_and_tenancy",
    name: "Tenant Isolation & Identity Governance",
    category: "core_foundation",
    summary: "Enforces strict organizational boundaries, role-based capabilities, and tamper-evident audit logging on every database transaction.",
    roleBeneficiaries: ["Owners", "System Administrators"],
    keyCapabilities: ["Multi-tenant boundary enforcement", "Granular capability matrix", "Append-only security audit log"],
  },
  {
    id: "master_data_vault",
    name: "Master Data & File Vault",
    category: "core_foundation",
    summary: "Single source of truth for customers, vendors, shop facilities, and engineering revision-controlled drawings.",
    roleBeneficiaries: ["All Roles"],
    keyCapabilities: ["Customer and vendor profiles", "CAD drawing vault", "Revision mismatch detectors"],
  },
  {
    id: "quoting_and_margin",
    name: "QuoteFlow & Margin Estimating",
    category: "operational_module",
    summary: "Integer-cents cost breakdown engine calculating machine setup, raw material yield, and executive margin approval guardrails.",
    roleBeneficiaries: ["Estimators", "Sales Leads", "Owners"],
    keyCapabilities: ["Real-time margin guardrails", "1-click live job conversion", "Material rate sheets"],
  },
  {
    id: "shopfloor_travelers",
    name: "Digital Shopfloor Travelers",
    category: "operational_module",
    summary: "Touch-optimized digital traveler routing parts across laser cutting, press brake, welding, and assembly with QR blocker reporting.",
    roleBeneficiaries: ["CNC Operators", "Fabricators", "Shop Leads"],
    keyCapabilities: ["Revision-locked CAD drawing viewer", "Step completion timestamps", "Machine downtime interval logger"],
  },
  {
    id: "quality_and_ncr",
    name: "Quality & NCR Containment",
    category: "operational_module",
    summary: "First Article Inspection (FAI) checklists with segregation of duties for scrap, rework, and return-to-vendor dispositions.",
    roleBeneficiaries: ["Quality Inspectors", "Production Managers"],
    keyCapabilities: ["Pass/fail dimensional checks", "NCR quarantine locks", "Root-cause disposition trail"],
  },
  {
    id: "inventory_ledger",
    name: "Immutable Material Ledger",
    category: "operational_module",
    summary: "Double-entry inventory ledger with negative stock overdraft prevention, dock barcode receiving, and PO threshold governance.",
    roleBeneficiaries: ["Purchasing Leads", "Inventory Clerks"],
    keyCapabilities: ["Zero-overdraft stock balance math", "Tiered PO approval limits", "Cycle count reconciliations"],
  },
  {
    id: "shipping_and_manifests",
    name: "Pallet Load Builder & Shipping",
    category: "operational_module",
    summary: "Automated container capacity calculations, gross weight verification, carrier BOL manifests, and electronic proof-of-delivery.",
    roleBeneficiaries: ["Shipping Leads", "Logistics Coordinators"],
    keyCapabilities: ["Pallet weight capacity checks", "Carrier BOL generation", "Electronic POD tracking"],
  },
  {
    id: "maintenance_and_telemetry",
    name: "Maintenance, Telemetry & LOTO",
    category: "operational_module",
    summary: "Equipment runtime monitoring, lockout/tagout safety checklists, and preventive maintenance work orders.",
    roleBeneficiaries: ["Maintenance Techs", "Plant Managers"],
    keyCapabilities: ["LOTO verified signoffs", "Fleet uptime KPI aggregation", "Maintenance parts tracking"],
  },
];

export const rolePerspectives: RolePerspective[] = [
  {
    id: "owner",
    roleTitle: "Company Owner / General Manager",
    personaExample: "Executive Overview",
    operatingFocus: "Capacity signals, margin preservation, WIP value, and fleet health.",
    interfaceView: "Executive control pulse with aggregate WIP valuation, machine downtime alerts, and margin exception reviews.",
    whatTheySee: [
      "Real-time shop WIP valuation in integer cents",
      "Low-margin quote alerts requiring executive signoff",
      "Overall on-time delivery and first-pass yield metrics",
      "Comprehensive system audit logs and member roles",
    ],
    whatIsHidden: "Routine machine step toggles and granular barcode scans.",
  },
  {
    id: "estimator",
    roleTitle: "Estimator / Project Manager",
    personaExample: "Commercial Estimating",
    operatingFocus: "Fast RFQ turnarounds, accurate material yield math, and customer revisions.",
    interfaceView: "QuoteFlow workbench with machine-hour rates, material yield calculations, and 1-click job release actions.",
    whatTheySee: [
      "Live material cost rates and yield percentages",
      "Machine setup and cycle time estimations",
      "Customer revision history and change notes",
      "1-click job packet generation and release to shop",
    ],
    whatIsHidden: "Maintenance logs, shipping container math, and system user permissions.",
  },
  {
    id: "operator",
    roleTitle: "Shopfloor Machine Operator",
    personaExample: "Laser & Press Brake Cell",
    operatingFocus: "Knowing the exact operation to execute next with the approved drawing.",
    interfaceView: "Touchscreen traveler screen with large operation buttons, locked CAD drawings, and quick blocker reporting.",
    whatTheySee: [
      "Current assigned traveler with verified CAD revision",
      "Ordered operation sequence with work instructions",
      "One-tap machine blocker and assist-gas reporting",
      "Shift output counter and traveler barcode scanner",
    ],
    whatIsHidden: "Customer billing, financial margins, purchasing spend, and company-wide analytics.",
  },
  {
    id: "quality",
    roleTitle: "Quality & Compliance Inspector",
    personaExample: "QA & Inspection Bench",
    operatingFocus: "Preventing defective parts from leaving the station; rigorous NCR containment.",
    interfaceView: "Inspection workbench with dimensional FAI checklists, calibration records, and quarantined NCR dispositions.",
    whatTheySee: [
      "First Article Inspection (FAI) dimensional check forms",
      "Non-Conformance Report (NCR) quarantine status",
      "Scrap vs rework disposition authority with reason codes",
      "Inspector calibration logs and tolerance standards",
    ],
    whatIsHidden: "Commercial sales pricing, raw supplier PO approvals, and carrier manifests.",
  },
  {
    id: "field_tech",
    roleTitle: "Mobile Field Technician",
    personaExample: "Van Fleet & Service Rig",
    operatingFocus: "Fast mobile checklist execution, photo proof-of-work, and client signoffs.",
    interfaceView: "Phone-first responsive app with large checkboxes, ultrasonic telemetry inputs, and customer consent forms.",
    whatTheySee: [
      "Assigned job address, client contacts, and vehicle specs",
      "Step-by-step mobile service and sanitation checklist",
      "On-site customer add-on digital approval button",
      "Camera integration for GPS photo proof-of-work",
    ],
    whatIsHidden: "Heavy shopfloor machinery queues, master inventory adjustments, and executive analytics.",
  },
];
