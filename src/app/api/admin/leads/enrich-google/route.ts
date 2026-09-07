import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resolveGooglePlace } from "@/lib/google-places/client";

const bodySchema = z.object({
  placeId: z.string().trim().min(1).optional(),
  mapsUrl: z.string().trim().min(1).optional(),
  query: z.string().trim().min(1).optional(),
  salonName: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
});

/** Preview / search Google Places without writing to DB. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "Chybí GOOGLE_PLACES_API_KEY. Přidej ho do .env.local / Vercel env.",
      },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const result = await resolveGooglePlace(parsed.data);
    return NextResponse.json({
      ok: true,
      place: result.place,
      candidates: result.candidates,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google Places lookup failed";
    console.error("[admin] enrich-google preview", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
