import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/google-places/client";
import { checkRateLimit, getClientIp } from "@/lib/leads/rate-limit";

/**
 * Salon autocomplete via Google Places (New).
 * Returns empty suggestions when API key is missing — UI falls back to manual entry.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`audit-places:${ip}`);
  if (!rate.ok) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    return NextResponse.json({
      suggestions: [],
      available: false,
      error: "missing_key",
    });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [], available: true });
  }

  try {
    const places = await searchPlaces(`${q} kadeřnictví`, {
      maxResultCount: 5,
    });
    return NextResponse.json({
      available: true,
      suggestions: places.map((p) => ({
        placeId: p.placeId,
        name: p.name,
        address: p.formattedAddress,
        city: p.city,
        website: p.website,
        mapsUrl: p.mapsUrl,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        phone: p.phone,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[audit/places]", message);
    const blocked =
      /blocked|PERMISSION_DENIED|API_KEY_SERVICE_BLOCKED|403/i.test(message);
    return NextResponse.json({
      suggestions: [],
      available: false,
      error: blocked ? "api_blocked" : "places_error",
      message: blocked
        ? "Google Places API je u klíče zablokované. Zapněte Places API (New) a povolte places.googleapis.com."
        : message.slice(0, 200),
    });
  }
}
