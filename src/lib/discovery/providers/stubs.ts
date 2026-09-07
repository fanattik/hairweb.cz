import type { LeadSourceProvider } from "@/lib/discovery/providers/types";
import type { DiscoveryProviderId } from "@/lib/discovery/types";

function stubProvider(
  id: DiscoveryProviderId,
  label: string,
): LeadSourceProvider {
  return {
    id,
    label,
    enabled: false,
    async search() {
      throw new Error(
        `${label} provider ještě není napojený (Phase 2+).`,
      );
    },
  };
}

export const firmyProvider = stubProvider("firmy_cz", "Firmy.cz");
export const instagramDiscoveryProvider = stubProvider(
  "instagram",
  "Instagram",
);
export const facebookProvider = stubProvider("facebook", "Facebook");
export const mapyProvider = stubProvider("mapy_cz", "Mapy.cz");
