export const workflowAuditIndustries = ["Manufacturing", "CNC / fabrication", "Sign shop", "Construction / field service", "Distribution / inventory", "Professional services", "Other"] as const;
export const workflowAuditEmployeeRanges = ["1–5", "6–15", "16–50", "51–100", "100+"] as const;
export const workflowAuditContactMethods = ["Email", "Phone", "Video call"] as const;

export type WorkflowAuditField = "name" | "business" | "email" | "phone" | "industry" | "employees" | "currentTools" | "frustratingWorkflow" | "hoursLost" | "desiredOutcome" | "preferredContact";
export type WorkflowAuditErrors = Partial<Record<WorkflowAuditField, string>>;

export type WorkflowAuditValues = {
  name: string;
  business: string;
  email: string;
  phone: string;
  industry: string;
  employees: string;
  currentTools: string;
  frustratingWorkflow: string;
  hoursLost: string;
  desiredOutcome: string;
  preferredContact: string;
};

export type WorkflowAuditPayload = WorkflowAuditValues & { website: string };
export type WorkflowAuditIntake = Pick<WorkflowAuditValues, "phone" | "industry" | "employees" | "currentTools" | "hoursLost" | "desiredOutcome" | "preferredContact">;

export function workflowAuditIntake(values: WorkflowAuditValues): WorkflowAuditIntake {
  return {
    phone: values.phone, industry: values.industry, employees: values.employees,
    currentTools: values.currentTools, hoursLost: values.hoursLost,
    desiredOutcome: values.desiredOutcome, preferredContact: values.preferredContact,
  };
}

function limited(value: unknown, maximum: number) {
  return String(value ?? "").trim().slice(0, maximum);
}

export function workflowAuditPayload(input: FormData | Record<string, unknown>): WorkflowAuditPayload {
  const read = (key: string) => input instanceof FormData ? input.get(key) : input[key];
  return {
    name: limited(read("name"), 100), business: limited(read("business"), 160),
    email: limited(read("email"), 180).toLowerCase(), phone: limited(read("phone"), 40),
    industry: limited(read("industry"), 80), employees: limited(read("employees"), 40),
    currentTools: limited(read("currentTools"), 1200), frustratingWorkflow: limited(read("frustratingWorkflow"), 4000),
    hoursLost: limited(read("hoursLost"), 20), desiredOutcome: limited(read("desiredOutcome"), 3000),
    preferredContact: limited(read("preferredContact"), 40), website: limited(read("website"), 200),
  };
}

export function validateWorkflowAudit(values: WorkflowAuditValues): WorkflowAuditErrors {
  const errors: WorkflowAuditErrors = {};
  if (values.name.length < 2) errors.name = "Tell me what to call you.";
  if (values.business.length < 2) errors.business = "Enter the business or shop name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.phone && !/^[+()\-.\s\d]{7,40}$/.test(values.phone)) errors.phone = "Enter a valid phone number or leave it blank.";
  if (!workflowAuditIndustries.includes(values.industry as typeof workflowAuditIndustries[number])) errors.industry = "Choose the closest industry.";
  if (values.employees && !workflowAuditEmployeeRanges.includes(values.employees as typeof workflowAuditEmployeeRanges[number])) errors.employees = "Choose a listed employee range.";
  if (values.currentTools.length < 2) errors.currentTools = "List the main tools, spreadsheets, or paper systems in use.";
  if (values.frustratingWorkflow.length < 20) errors.frustratingWorkflow = "Describe the workflow in at least a few sentences.";
  if (values.hoursLost && (!Number.isFinite(Number(values.hoursLost)) || Number(values.hoursLost) < 0 || Number(values.hoursLost) > 168)) errors.hoursLost = "Enter a weekly estimate between 0 and 168 hours.";
  if (values.desiredOutcome.length < 20) errors.desiredOutcome = "Describe what a useful improvement would look like.";
  if (!workflowAuditContactMethods.includes(values.preferredContact as typeof workflowAuditContactMethods[number])) errors.preferredContact = "Choose a preferred contact method.";
  if (values.preferredContact === "Phone" && !values.phone) errors.phone = "Add a phone number if phone is your preferred contact method.";
  return errors;
}
