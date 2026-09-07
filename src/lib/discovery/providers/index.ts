import { googlePlacesProvider } from "@/lib/discovery/providers/google-places";
import {
  facebookProvider,
  firmyProvider,
  instagramDiscoveryProvider,
  mapyProvider,
} from "@/lib/discovery/providers/stubs";
import type { LeadSourceProvider } from "@/lib/discovery/providers/types";
import type { DiscoveryProviderId } from "@/lib/discovery/types";

const registry: Record<DiscoveryProviderId, LeadSourceProvider> = {
  google_places: googlePlacesProvider,
  firmy_cz: firmyProvider,
  instagram: instagramDiscoveryProvider,
  facebook: facebookProvider,
  mapy_cz: mapyProvider,
};

export function getDiscoveryProvider(
  id: DiscoveryProviderId | string,
): LeadSourceProvider {
  const provider = registry[id as DiscoveryProviderId];
  if (!provider) {
    throw new Error(`Neznámý discovery provider: ${id}`);
  }
  return provider;
}

export function listDiscoveryProviders(): LeadSourceProvider[] {
  return Object.values(registry);
}

export type { LeadSourceProvider } from "@/lib/discovery/providers/types";
