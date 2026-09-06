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
  { href: "#ukazky", label: "Ukázky" },
  { href: "#co-ziskate", label: "Co získáte" },
  { href: "#jak-to-funguje", label: "Jak to funguje" },
  { href: "#cenik", label: "Ceník" },
] as const;
