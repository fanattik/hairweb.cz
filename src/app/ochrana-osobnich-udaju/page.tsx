import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | Hairweb.cz",
  description:
    "Informace o zpracování osobních údajů na webu Hairweb.cz (GDPR).",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Ochrana osobních údajů">
      <p>
        Tento dokument informuje o zpracování osobních údajů v souvislosti s
        webem a službou <strong className="font-medium text-ink">Hairweb.cz</strong>.
      </p>
      <p>Poslední aktualizace: 6. 9. 2026.</p>

      <h2>1. Správce osobních údajů</h2>
      <p>
        Správcem je:
        <br />
        <strong className="font-medium text-ink">{operator.name}</strong>
        <br />
        IČO: {operator.ico}
        <br />
        Sídlo: {operator.address}
        <br />
        E-mail:{" "}
        <a href={`mailto:${operator.email}`}>{operator.email}</a>
      </p>

      <h2>2. Jaké údaje zpracováváme</h2>
      <p>Nejčastěji zpracováváme údaje, které sami uvedete v poptávce:</p>
      <ul>
        <li>jméno</li>
        <li>název salonu (nepovinné)</li>
        <li>e-mail</li>
        <li>telefon (nepovinné)</li>
        <li>web / Instagram</li>
        <li>zpráva / popis požadavku</li>
        <li>zvolený balíček (START / PRO), pokud jej uvedete</li>
      </ul>
      <p>
        Dále můžeme zpracovat technické a marketingové kontextové údaje
        související s poptávkou (např. UTM parametry, referrer, vstupní
        stránka, zdroj CTA na webu) — bez zbytečného fingerprintingu.
      </p>

      <h2>3. Účel a právní základ</h2>
      <ul>
        <li>
          <strong className="font-medium text-ink">Vyřízení poptávky a komunikace</strong> —
          plnění opatření před uzavřením smlouvy / oprávněný zájem (čl. 6
          odst. 1 písm. b) a f) GDPR).
        </li>
        <li>
          <strong className="font-medium text-ink">Plnění smlouvy</strong> —
          pokud dojde k objednávce služeb (čl. 6 odst. 1 písm. b) GDPR).
        </li>
        <li>
          <strong className="font-medium text-ink">Evidence a účetnictví</strong> —
          právní povinnost (čl. 6 odst. 1 písm. c) GDPR), pokud vznikne.
        </li>
        <li>
          <strong className="font-medium text-ink">Analytika webu</strong> —
          souhlas nebo oprávněný zájem dle konkrétního nastavení cookies
          (viz <a href="/cookies">Cookies</a>).
        </li>
      </ul>
      <p>
        Údaje z formuláře nepoužívám k hromadnému newsletteru bez
        samostatného souhlasu.
      </p>

      <h2>4. Jak dlouho údaje uchováváme</h2>
      <ul>
        <li>
          poptávky a související komunikace — obvykle po dobu jednání a
          dále přiměřeně (zpravidla do 24 měsíců), není-li delší doba
          potřebná pro obhajobu právních nároků
        </li>
        <li>
          smluvní a účetní doklady — po dobu stanovenou právními předpisy
        </li>
      </ul>

      <h2>5. Komu mohou být údaje zpřístupněny</h2>
      <p>
        Údaje mohou být zpracovávány prostřednictvím ověřených
        zpracovatelů / služeb nutných k provozu (hosting, databáze,
        e-mailová služba, případně analytika), vždy v rozsahu potřebném pro
        daný účel. Aktuálně může jít zejména o:
      </p>
      <ul>
        <li>Supabase (databáze a autentizace administrace)</li>
        <li>Resend (odesílání e-mailů)</li>
        <li>Vercel / hostingová infrastruktura</li>
        <li>Google Analytics (pokud je aktivní)</li>
      </ul>
      <p>
        Osobní údaje nepředávám třetím stranám za účelem prodeje dat.
      </p>

      <h2>6. Vaše práva</h2>
      <p>V rozsahu GDPR máte právo zejména na:</p>
      <ul>
        <li>přístup k osobním údajům</li>
        <li>opravu</li>
        <li>výmaz (v zákonných případech)</li>
        <li>omezení zpracování</li>
        <li>přenositelnost (v zákonných případech)</li>
        <li>námitku proti zpracování založenému na oprávněném zájmu</li>
        <li>odvolání souhlasu, pokud je zpracování na souhlasu založeno</li>
      </ul>
      <p>
        Žádosti zasílejte na{" "}
        <a href={`mailto:${operator.email}`}>{operator.email}</a>. Máte také
        právo podat stížnost u Úřadu pro ochranu osobních údajů
        (www.uoou.cz).
      </p>

      <h2>7. Zabezpečení</h2>
      <p>
        Přístup k administraci je chráněn autentizací. Lead data nejsou
        veřejně dostupná přes klientské API. Přesto žádný přenos dat po
        internetu nelze zaručit jako absolutně bezpečný.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Podrobnosti o cookies najdete na stránce{" "}
        <a href="/cookies">Cookies</a>.
      </p>

      <h2>9. Kontakt</h2>
      <p>
        {operator.name}
        <br />
        {operator.address}
        <br />
        <a href={`mailto:${operator.email}`}>{operator.email}</a>
      </p>
    </LegalPage>
  );
}
