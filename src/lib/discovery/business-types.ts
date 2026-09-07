/**
 * Hair / beauty business types for discovery UI + Google Places mapping.
 */

export const DISCOVERY_BUSINESS_TYPES = [
  {
    id: "hair_salon",
    label: "Kadeřnictví",
    googleTypes: ["hair_salon"],
    textHint: "kadeřnictví",
  },
  {
    id: "hair_salon_en",
    label: "Hair salon",
    googleTypes: ["hair_salon"],
    textHint: "hair salon",
  },
  {
    id: "barber_shop",
    label: "Barber shop",
    googleTypes: ["barber_shop", "hair_salon"],
    textHint: "barber",
  },
  {
    id: "beauty_salon",
    label: "Beauty salon",
    googleTypes: ["beauty_salon"],
    textHint: "beauty salon",
  },
  {
    id: "studio",
    label: "Studio",
    googleTypes: ["beauty_salon", "hair_salon"],
    textHint: "studio kadeřnictví",
  },
  {
    id: "mens_barber",
    label: "Pánské holičství",
    googleTypes: ["barber_shop"],
    textHint: "pánské holičství",
  },
] as const;

export type DiscoveryBusinessTypeId =
  (typeof DISCOVERY_BUSINESS_TYPES)[number]["id"];

export function resolveGoogleIncludedTypes(
  businessTypeIds: string[],
): string[] {
  const set = new Set<string>();
  for (const id of businessTypeIds) {
    const def = DISCOVERY_BUSINESS_TYPES.find((item) => item.id === id);
    if (def) {
      for (const t of def.googleTypes) set.add(t);
    } else {
      set.add(id);
    }
  }
  if (set.size === 0) set.add("hair_salon");
  return [...set];
}

export function resolveTextQueryHints(businessTypeIds: string[]): string[] {
  const hints: string[] = [];
  for (const id of businessTypeIds) {
    const def = DISCOVERY_BUSINESS_TYPES.find((item) => item.id === id);
    if (def) hints.push(def.textHint);
  }
  return hints.length ? hints : ["kadeřnictví"];
}

export function businessTypeLabel(id: string): string {
  return (
    DISCOVERY_BUSINESS_TYPES.find((item) => item.id === id)?.label ?? id
  );
}
