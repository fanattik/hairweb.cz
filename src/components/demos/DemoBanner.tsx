import Link from "next/link";

export function DemoBanner({ name }: { name: string }) {
  return (
    <div className="sticky top-0 z-[60] border-b border-black/10 bg-[#111]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
        <p className="min-w-0 truncate text-[12px] tracking-wide text-white/75 sm:text-sm">
          Ukázkový koncept · <span className="text-white">{name}</span>
        </p>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            href="/#ukazky"
            className="text-[12px] font-medium text-white/80 transition hover:text-white sm:text-sm"
          >
            ← Zpět na ukázky
          </Link>
          <Link
            href="/#poptavka"
            className="hidden rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111] transition hover:bg-white/90 sm:inline-flex"
          >
            Chci podobný web
          </Link>
        </div>
      </div>
    </div>
  );
}
