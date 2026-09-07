"use client";

import { LeadEditorForm } from "@/components/admin/LeadEditorForm";
import type { Lead } from "@/lib/leads/types";

export function LeadCrmForm({ lead }: { lead: Lead }) {
  return <LeadEditorForm mode="edit" lead={lead} />;
}
