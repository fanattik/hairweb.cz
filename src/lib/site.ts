export const site = {
  name: "HAIRWEB",
  domain: "hairweb.cz",
  url: "https://hairweb.cz",
  email: "hello@lukasptacnik.cz",
  // TODO: doplnit reálný Instagram URL
  instagram: "#",
  // TODO: doplnit telefon, pokud má být veřejný
  phone: null as string | null,
} as const;

export const navLinks = [
  { href: "/#jak-to-funguje", label: "Jak to funguje" },
  { href: "/#co-resime", label: "Služby" },
  { href: "/#hub", label: "HAIRWEB Hub" },
  { href: "/#ukazky", label: "Reference" },
  { href: "/#o-hairweb", label: "O nás" },
] as const;

/**
 * Real social-proof entries only. Leave empty until genuine salon references exist.
 * Shape: { name: string; href?: string }
 */
export const socialProofSalons: readonly { name: string; href?: string }[] =
  [] as const;
