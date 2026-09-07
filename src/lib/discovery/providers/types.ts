import type {
  DiscoveredPlace,
  DiscoveryProviderId,
  DiscoverySearchInput,
} from "@/lib/discovery/types";

/**
 * Pluggable lead discovery source.
 * Phase 1: GooglePlacesProvider. Later: Firmy, Instagram, Mapy.cz, …
 */
export interface LeadSourceProvider {
  readonly id: DiscoveryProviderId;
  readonly label: string;
  readonly enabled: boolean;

  search(input: DiscoverySearchInput): Promise<{
    places: DiscoveredPlace[];
    apiCalls: number;
  }>;
}

export type ProviderRegistry = Record<
  string,
  LeadSourceProvider | undefined
>;
