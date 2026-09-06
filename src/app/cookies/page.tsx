import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookies | Hairweb.cz",
  description:
    "Informace o používání cookies a podobných technologií na webu Hairweb.cz.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Zásady používání cookies">
      <p>
        Tyto zásady popisují, jak web{" "}
        <strong className="font-medium text-ink">Hairweb.cz</strong> používá
        cookies a podobné technologie.
      </p>
      <p>
        Provozovatel webu: <strong className="font-medium text-ink">{operator.name}</strong>,
        IČO: {operator.ico}, sídlo: {operator.address}, e-mail:{" "}
        <a href={`mailto:${operator.email}`}>{operator.email}</a>.
      </p>
      <p>Poslední aktualizace: 6. 9. 2026.</p>

      <h2>1. Co jsou cookies</h2>
      <p>
        Cookies jsou malé textové soubory, které se ukládají do vašeho
        zařízení při návštěvě webu. Pomáhají zajistit základní funkce webu,
        zapamatovat si nastavení nebo (po souhlasu) měřit návštěvnost.
      </p>

      <h2>2. Jaké cookies používáme</h2>

      <h3>2.1 Nezbytné / technické cookies</h3>
      <p>
        Tyto cookies jsou potřeba pro bezpečný a správný chod webu. Bez nich
        by některé funkce nefungovaly. Neslouží k marketingu.
      </p>
      <ul>
        <li>
          cookies související s přihlášením do administrace (Supabase Auth)
        </li>
        <li>
          technické údaje nutné pro běh aplikace a ochranu formulářů
        </li>
      </ul>

      <h3>2.2 Preferenční / funkční údaje v prohlížeči</h3>
      <p>
        Pro správné fungování poptávkového formuláře můžeme v{" "}
        <code className="text-ink">sessionStorage</code> dočasně uložit
        first-touch marketingové parametry (např. UTM), referrer a vstupní
        stránku. Tyto údaje se používají výhradně k vyhodnocení poptávky a
        nejsou marketingovými cookies třetích stran.
      </p>

      <h3>2.3 Analytické cookies (volitelné)</h3>
      <p>
        Pokud je na webu aktivní Google Analytics 4 (GA4), mohou být
        nastaveny analytické cookies / měřicí skripty Google. Slouží k
        anonymizovanému nebo pseudonymizovanému měření návštěvnosti a
        konverzí (např. odeslání poptávky).
      </p>
      <p>
        Analytiku spouštíme jen pokud je v konfiguraci webu nastaveno
        Measurement ID. Pokud GA4 není nastaveno, analytické cookies
        Google se nenačítají.
      </p>
      <p>
        Více o zpracování dat Googlem:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/privacy
        </a>
        .
      </p>

      <h2>3. Právní základ</h2>
      <ul>
        <li>
          <strong className="font-medium text-ink">Nezbytné cookies</strong> —
          oprávněný zájem na provozu webu (čl. 6 odst. 1 písm. f) GDPR).
        </li>
        <li>
          <strong className="font-medium text-ink">Analytické cookies</strong> —
          souhlas (čl. 6 odst. 1 písm. a) GDPR), pokud je vyžadován a
          udělen.
        </li>
      </ul>

      <h2>4. Doba uložení</h2>
      <p>
        Doba platnosti cookies se liší podle typu. Session cookies zanikají
        po zavření prohlížeče. Persistent cookies mohou zůstat déle podle
        nastavení poskytovatele (např. Google Analytics). Údaje v
        sessionStorage zanikají po ukončení relace prohlížeče.
      </p>

      <h2>5. Jak cookies spravovat</h2>
      <p>
        Cookies můžete blokovat nebo mazat v nastavení prohlížeče. Blokování
        nezbytných cookies může omezit funkčnost webu (např. přihlášení do
        administrace).
      </p>
      <p>
        Návody běžných prohlížečů: Chrome, Firefox, Safari, Edge — sekce
        Soukromí / Cookies.
      </p>

      <h2>6. Kontakt</h2>
      <p>
        Dotazy k cookies a ochraně osobních údajů pište na{" "}
        <a href={`mailto:${operator.email}`}>{operator.email}</a>.
      </p>
      <p>
        Související dokumenty:{" "}
        <a href="/ochrana-osobnich-udaju">Ochrana osobních údajů</a>,{" "}
        <a href="/obchodni-podminky">Obchodní podmínky</a>.
      </p>
    </LegalPage>
  );
}
