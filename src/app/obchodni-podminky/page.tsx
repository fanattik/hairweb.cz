import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { operator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Obchodní podmínky | Hairweb.cz",
  description:
    "Obchodní podmínky služby Hairweb.cz — tvorba webových stránek pro kadeřnictví a barbershopy.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Obchodní podmínky">
      <p>
        Tyto obchodní podmínky upravují poskytování služeb značky{" "}
        <strong className="font-medium text-ink">Hairweb.cz</strong>.
      </p>
      <p>Poslední aktualizace: 6. 9. 2026.</p>

      <h2>1. Poskytovatel</h2>
      <p>
        Poskytovatelem služeb je:
        <br />
        <strong className="font-medium text-ink">{operator.name}</strong>
        <br />
        IČO: {operator.ico}
        <br />
        Sídlo: {operator.address}
        <br />
        E-mail:{" "}
        <a href={`mailto:${operator.email}`}>{operator.email}</a>
        <br />
        Právní forma: {operator.form}
        <br />
        (dále jen „poskytovatel“)
      </p>
      <p>
        Hairweb.cz je specializovaná služba zaměřená na tvorbu webových
        stránek pro kadeřnictví, hair salony a barbershopy.
      </p>

      <h2>2. Zákazník</h2>
      <p>
        Zákazníkem je fyzická nebo právnická osoba, která poptává nebo
        objednává služby poskytovatele (dále jen „zákazník“). Služby jsou
        primárně určeny podnikatelům (B2B). Pokud je zákazníkem spotřebitel,
        uplatní se příslušná ustanovení zákona na ochranu spotřebitele.
      </p>

      <h2>3. Předmět služeb</h2>
      <p>Poskytovatel nabízí zejména:</p>
      <ul>
        <li>návrh a tvorbu webových stránek</li>
        <li>úpravy a spuštění webu</li>
        <li>napojení na stávající rezervační systémy</li>
        <li>související konzultace a technickou pomoc</li>
      </ul>
      <p>
        Konkrétní rozsah (např. varianta START / PRO nebo individuální
        zadání) je vždy upřesněn v nabídce nebo ve smlouvě / objednávce.
      </p>

      <h2>4. Poptávka a uzavření smlouvy</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Odesláním formuláře na webu zákazník zasílá nezávaznou poptávku.
          Samotné odeslání poptávky není uzavřením smlouvy.
        </li>
        <li>
          Poskytovatel se ozve s návrhem dalšího postupu (např. doporučení,
          směr webu, cenová nabídka).
        </li>
        <li>
          Smlouva vzniká přijetím nabídky zákazníkem (e-mailem, písemně nebo
          jiným prokazatelným způsobem) a/nebo uhrazením domluvené zálohy.
        </li>
      </ol>

      <h2>5. Ceny a platby</h2>
      <ul>
        <li>
          Orientační ceny uvedené na webu (např. „od … Kč“) nejsou závaznou
          nabídkou. Finální cena závisí na rozsahu projektu.
        </li>
        <li>
          Není-li dohodnuto jinak, finální cena a případné DPH budou uvedeny
          v nabídce / faktuře.
        </li>
        <li>
          Platební podmínky (záloha, doplatek, splatnost) budou uvedeny v
          nabídce / faktuře.
        </li>
        <li>
          Dílo nebo jeho část může být předána až po uhrazení sjednané
          platby.
        </li>
      </ul>

      <h2>6. Součinnost zákazníka</h2>
      <p>Zákazník se zavazuje zejména:</p>
      <ul>
        <li>poskytnout podklady (texty, fotografie, logo, přístupy)</li>
        <li>včas schvalovat návrhy a poskytovat zpětnou vazbu</li>
        <li>zajistit oprávnění k použití dodaných materiálů</li>
      </ul>
      <p>
        Prodlení na straně zákazníka může posunout termín dodání. Pokud
        zákazník dlouhodobě neposkytuje součinnost, může poskytovatel
        projekt pozastavit nebo ukončit; uhrazené platby za již provedenou
        práci se nevracejí, pokud není dohodnuto jinak.
      </p>

      <h2>7. Termíny</h2>
      <p>
        Orientační termíny se uvádějí v nabídce. Závazný termín platí jen
        pokud je výslovně sjednán. Termín se prodlužuje o dobu, po kterou
        zákazník neposkytuje součinnost, a o okolnosti mimo kontrolu
        poskytovatele.
      </p>

      <h2>8. Předání a akceptace</h2>
      <p>
        Web se považuje za předaný spuštěním na doméně zákazníka nebo
        zpřístupněním na stagingu a výzvou k akceptaci. Pokud zákazník do
        7 dnů neuplatní konkrétní výhrady k rozsahu sjednaných prací,
        považuje se dílo za akceptované.
      </p>

      <h2>9. Autorská práva a licence</h2>
      <ul>
        <li>
          Autorská práva k vytvořenému webu (design, kód, koncepce)
          náleží poskytovateli, pokud není dohodnuto jinak.
        </li>
        <li>
          Po úplném zaplacení získává zákazník nevýhradní licenci k užití
          webu pro vlastní podnikání.
        </li>
        <li>
          Poskytovatel může web uvést v portfoliu, pokud zákazník výslovně
          nevyloučí tuto možnost.
        </li>
        <li>
          Za obsah dodaný zákazníkem (texty, fotografie, loga) odpovídá
          zákazník.
        </li>
      </ul>

      <h2>10. Doména, hosting a třetí služby</h2>
      <p>
        Doména, hosting a rezervační systémy třetích stran (např. Reservio,
        Fresha, Bookio) mohou být předmětem samostatných smluv mezi
        zákazníkem a daným poskytovatelem. Hairweb nenahrazuje tyto služby
        a neodpovídá za jejich výpadky, změny ceníků ani obchodní podmínky.
      </p>

      <h2>11. Odpovědnost</h2>
      <ul>
        <li>
          Poskytovatel odpovídá za řádné provedení sjednaných prací s
          odbornou péčí.
        </li>
        <li>
          Poskytovatel neodpovídá za ušlý zisk, nepřímé škody ani za výsledky
          marketingu / SEO, pokud nejsou výslovně garantovány.
        </li>
        <li>
          Celková odpovědnost poskytovatele je omezena výší ceny uhrazené za
          konkrétní zakázku, ledaže zákon stanoví jinak.
        </li>
      </ul>

      <h2>12. Reklamace</h2>
      <p>
        Zjevné vady je třeba reklamovat bez zbytečného odkladu, nejpozději
        do 14 dnů od předání. Poskytovatel vadu opraví v přiměřené lhůtě,
        nebo se strany dohodnou na jiném řešení.
      </p>

      <h2>13. Odstoupení a zrušení</h2>
      <p>
        Před uzavřením smlouvy může kterákoli strana poptávku ukončit bez
        sankcí. Po uzavření smlouvy lze zakázku ukončit dohodou. Při
        ukončení z důvodu na straně zákazníka má poskytovatel nárok na
        úhradu již provedené práce a prokazatelných nákladů.
      </p>
      <p>
        Spotřebitel má v zákonných případech právo odstoupit od smlouvy
        uzavřené distančně; u služeb zahájených se souhlasem před uplynutím
        lhůty se postupuje dle zákona č. 634/1992 Sb. a občanského
        zákoníku.
      </p>

      <h2>14. Ochrana osobních údajů</h2>
      <p>
        Zpracování osobních údajů popisuje dokument{" "}
        <a href="/ochrana-osobnich-udaju">Ochrana osobních údajů</a>.
        Informace o cookies jsou v dokumentu{" "}
        <a href="/cookies">Cookies</a>.
      </p>

      <h2>15. Závěrečná ustanovení</h2>
      <ul>
        <li>
          Vztahy se řídí právním řádem České republiky.
        </li>
        <li>
          Případné spory se strany pokusí řešit smírně. Příslušné jsou soudy
          ČR.
        </li>
        <li>
          Poskytovatel může tyto podmínky aktualizovat. Pro konkrétní
          zakázku platí znění účinné ke dni přijetí nabídky.
        </li>
        <li>
          Odchylná ujednání v nabídce / smlouvě mají přednost před těmito
          podmínkami.
        </li>
      </ul>

      <p>
        Kontakt:{" "}
        <a href={`mailto:${operator.email}`}>{operator.email}</a>
      </p>
    </LegalPage>
  );
}
