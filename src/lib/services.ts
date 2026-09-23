export type ServiceFlowStep = {
  label: string;
};

export type ServicePageContent = {
  slug: string;
  number: string;
  cardTitle: string;
  cardText: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  seoTitle: string;
  seoDescription: string;
  intro: string[];
  resolveHeading: string;
  resolveItems: string[];
  highlight?: {
    title: string;
    body: string[];
  };
  closing?: string;
  flow?: {
    label: string;
    steps: ServiceFlowStep[];
  };
};

export const services = [
  {
    slug: "web",
    number: "/01",
    cardTitle: "Web",
    cardText:
      "Nový web jen tehdy, když ho salon skutečně potřebuje. Jinak pracujeme se současným.",
    eyebrow: "Web pro salon",
    title: "Web, který pracuje pro váš salon.",
    description:
      "Web salonu nemá být jen hezká online vizitka. Má zákazníkovi během několika sekund ukázat, kdo jste, co nabízíte a dovést ho k rezervaci.",
    ctaLabel: "Zjistit, co můžeme zlepšit",
    seoTitle: "Web pro kadeřnictví a salony | HAIRWEB",
    seoDescription:
      "Web pro kadeřnictví, který vede k rezervaci. Upravíme současný web nebo vytvoříme nový — jen když to dává smysl. Dlouhodobě se o něj staráme.",
    intro: [
      "Ne vždy potřebujete nový web.",
      "Pokud váš současný web funguje dobře, nebudeme vám prodávat nový. Podíváme se na něj očima zákazníka, zkontrolujeme jeho použitelnost na mobilu, rychlost, obsah, nabídku služeb, cestu k rezervaci a napojení na další části online prezentace.",
      "Pokud stačí upravit současný web, upravíme ho. Pokud vás současné řešení omezuje, navrhneme nové.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "nový web nebo redesign současného",
      "mobilní zobrazení",
      "prezentaci služeb",
      "ceník",
      "tým salonu",
      "fotogalerii",
      "kontakty a otevírací dobu",
      "propojení s rezervacemi",
      "dárkové poukazy",
      "základní SEO",
      "měření návštěvnosti a konverzí",
      "průběžné aktualizace",
    ],
    highlight: {
      title: "A když se něco změní?",
      body: [
        "Nová kolegyně. Nová služba. Nový ceník. Jiná otevírací doba.",
        "Nemusíte hledat člověka, který vám před dvěma lety vytvořil web. Změnu jednoduše zadáte přes HAIRWEB HUB nebo ji pošlete nám. My ji vyřešíme.",
      ],
    },
    flow: {
      label: "Cesta zákazníka",
      steps: [
        { label: "Návštěvník" },
        { label: "Služba" },
        { label: "Důvěra" },
        { label: "Rezervace" },
      ],
    },
  },
  {
    slug: "rezervace",
    number: "/02",
    cardTitle: "Rezervace",
    cardText:
      "Propojíme existující systém nebo pomůžeme vhodné řešení nastavit.",
    eyebrow: "Online rezervace",
    title: "Méně telefonů. Více rezervací.",
    description:
      "Zákazník chce rezervovat termín ve chvíli, kdy se pro něj rozhodne. Klidně večer, o víkendu nebo když zrovna držíte v ruce nůžky.",
    ctaLabel: "Chci vyřešit rezervace",
    seoTitle: "Rezervační systém pro kadeřnictví | HAIRWEB",
    seoDescription:
      "Online rezervace pro kadeřnictví a salony. Napojíme stávající systém nebo pomůžeme nastavit nový — méně telefonů, více volných křesel.",
    intro: [
      "Rezervace mají pomáhat vám i zákazníkům.",
      "Pokud už rezervační systém používáte a funguje vám, nemusíme ho měnit. Pomůžeme ho správně nastavit a propojit s webem a dalšími místy, odkud zákazníci přicházejí.",
      "Pokud rezervace zatím řešíte hlavně telefonem, zprávami nebo přes Instagram, pomůžeme najít vhodnější řešení.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "výběr vhodného rezervačního řešení",
      "nastavení služeb",
      "délky jednotlivých procedur",
      "zaměstnance",
      "pracovní dobu",
      "dostupnost",
      "propojení s webem",
      "odkazy z Google a sociálních sítí",
      "připomínky rezervací",
      "omezení zbytečných telefonátů",
      "sledování zdrojů rezervací",
    ],
    closing:
      "Cíl je jednoduchý. Co nejméně administrativy mezi zákazníkem a volným křeslem.",
    flow: {
      label: "Od zájmu k termínu",
      steps: [
        { label: "Instagram / Google / Web" },
        { label: "Rezervace" },
        { label: "Volné křeslo" },
      ],
    },
  },
  {
    slug: "lokalni-viditelnost",
    number: "/03",
    cardTitle: "Google & lokální viditelnost",
    cardText:
      "Google Business Profile, Firmy.cz, lokální SEO a správnost informací.",
    eyebrow: "Google & lokální vyhledávání",
    title: "Ať vás najdou lidé, kteří hledají salon právě teď.",
    description:
      "Když někdo hledá „kadeřnictví Praha 7“ nebo „balayage Brno“, nechcete být salon, který Google přehlédne.",
    ctaLabel: "Prověřit viditelnost salonu",
    seoTitle: "Google profil a lokální SEO pro kadeřnictví | HAIRWEB",
    seoDescription:
      "Google Business Profile, Firmy.cz a lokální SEO pro salony. Správné údaje, lepší viditelnost a jedna změna napříč internetem.",
    intro: [
      "Řešíme, jak váš salon působí ve chvíli, kdy vás potenciální zákazník hledá přes Google a další lokální služby.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "Google Business Profile",
      "Firmy.cz",
      "Mapy",
      "správnost kontaktních údajů",
      "otevírací dobu",
      "fotografie",
      "nabídku služeb",
      "odkazy na rezervace",
      "lokální SEO",
      "strukturu webu",
      "vyhledávací dotazy",
      "konzistenci údajů napříč internetem",
    ],
    highlight: {
      title: "Jedna změna. Všude správně.",
      body: [
        "Změníte otevírací dobu? Neměli byste ji ručně přepisovat na webu, Googlu, Firmy.cz a dalších místech.",
        "Dáte vědět HAIRWEBu. My řešíme zbytek.",
      ],
    },
    flow: {
      label: "Lokální vyhledávání",
      steps: [
        { label: "„kadeřnictví v okolí“" },
        { label: "Google" },
        { label: "Salon" },
        { label: "Rezervace" },
      ],
    },
  },
  {
    slug: "recenze",
    number: "/04",
    cardTitle: "Recenze",
    cardText: "Více recenzí, přehled reputace a práce s hodnocením salonu.",
    eyebrow: "Online reputace",
    title: "Dobrá práce si zaslouží být vidět.",
    description:
      "Spokojených zákazníků můžete mít stovky. Pokud ale recenze nepřibývají, nový zákazník o nich neví.",
    ctaLabel: "Chci více recenzí",
    seoTitle: "Získávání Google recenzí pro kadeřnictví | HAIRWEB",
    seoDescription:
      "Systém pro získávání recenzí kadeřnictví a salonů. Google hodnocení, monitoring reputace a práce s ohlasy zákazníků.",
    intro: [
      "Recenze patří mezi nejsilnější důvody, proč si nový zákazník vybere právě váš salon.",
      "Pomůžeme vytvořit jednoduchý systém, který přirozeně připomene spokojeným zákazníkům možnost salon ohodnotit.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "získávání nových recenzí",
      "Google recenze",
      "jednoduché odkazy a QR kódy",
      "připomenutí zákazníkům",
      "monitoring nových hodnocení",
      "přehled reputace",
      "reakce na hodnocení",
      "využití recenzí na webu",
    ],
    closing:
      "Nejde o falešné recenze. Jde o to dát skutečně spokojeným zákazníkům jednoduchou možnost říct to ostatním.",
  },
  {
    slug: "socialni-site",
    number: "/05",
    cardTitle: "Sociální sítě",
    cardText: "Obsah, prezentace a postupně také automatizace.",
    eyebrow: "Sociální sítě",
    title: "Salon má tvořit účesy. Ne řešit každý večer Instagram.",
    description:
      "Sociální sítě mají ukazovat vaši práci a přivádět zákazníky. Nemají se stát druhou směnou po zavření salonu.",
    ctaLabel: "Chci pomoct se sociálními sítěmi",
    seoTitle: "Sociální sítě pro kadeřnictví a salony | HAIRWEB",
    seoDescription:
      "Instagram a sociální sítě pro kadeřnictví bez večerní druhé směny. Obsah, rezervace ze sítí a propojení s celým online světem salonu.",
    intro: [
      "Pomůžeme nastavit sociální sítě tak, aby byly součástí celého online fungování salonu.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "obsahovou strategii",
      "plánování příspěvků",
      "prezentaci výsledků práce",
      "Reels",
      "Stories",
      "akce a novinky",
      "propojení s webem",
      "rezervace ze sociálních sítí",
      "konzistentní vizuální prezentaci",
      "postupnou automatizaci",
    ],
    closing:
      "Nemusíte nám každý týden posílat profesionální fotografie. Vy vytvoříte skvělý účes. My pomůžeme dostat jeho výsledek k dalším zákazníkům.",
  },
  {
    slug: "zakaznici",
    number: "/06",
    cardTitle: "Zákazníci",
    cardText:
      "Lepší práce se stávající klientelou a podpora opakovaných návštěv.",
    eyebrow: "Práce se zákazníky",
    title: "Nejlepší zákazník nemusí být ten nový.",
    description:
      "Salon už často má stovky zákazníků. Největší příležitost proto nemusí být hledání dalších, ale lepší práce s těmi, kteří už vás znají.",
    ctaLabel: "Chci lépe pracovat se zákazníky",
    seoTitle: "Práce se zákazníky kadeřnictví | HAIRWEB",
    seoDescription:
      "Opakované návštěvy a komunikace se stávající klientelou salonu. Připomínky, návrat a chytřejší práce se zákazníky.",
    intro: [
      "Pomůžeme salonu budovat dlouhodobý vztah se zákazníky a podporovat jejich návrat.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "databázi zákazníků",
      "připomenutí další návštěvy",
      "opakované rezervace",
      "komunikaci se stávající klientelou",
      "segmentaci zákazníků",
      "speciální nabídky",
      "narozeniny a další příležitosti",
      "zákazníky, kteří se dlouho nevrátili",
      "věrnost",
      "automatizaci komunikace",
    ],
    closing:
      "Nejde o spam. Jde o chytrou komunikaci ve správnou chvíli. Protože přivést zákazníka podruhé může být jednodušší než ho získat poprvé.",
    flow: {
      label: "Cesta klienta",
      steps: [
        { label: "1. návštěva" },
        { label: "Návrat" },
        { label: "Pravidelný zákazník" },
      ],
    },
  },
  {
    slug: "data-analytika",
    number: "/07",
    cardTitle: "Data & analytika",
    cardText:
      "Salon ví, odkud zákazníci přicházejí a co mu skutečně funguje.",
    eyebrow: "Data & analytika",
    title: "Víte, odkud skutečně přicházejí vaši zákazníci?",
    description:
      "Instagram? Google? Doporučení? Reklama? Web? Salon by měl vědět, co mu skutečně přivádí zákazníky – ne jen lajky a návštěvy.",
    ctaLabel: "Chci vidět, co funguje",
    seoTitle: "Analytika a data pro kadeřnictví | HAIRWEB",
    seoDescription:
      "Přehled, odkud přicházejí zákazníci salonu. Web, Google, rezervace a marketing v jednom srozumitelném pohledu přes HAIRWEB.",
    intro: [
      "Spojujeme důležitá data do srozumitelného pohledu na online fungování salonu.",
      "Nechceme vás zahltit tabulkami a grafy. Chceme odpovědět na jednoduché otázky: Co funguje? Co nefunguje? A kam má smysl investovat čas a peníze?",
    ],
    resolveHeading: "Můžeme sledovat například",
    resolveItems: [
      "návštěvnost webu",
      "zdroje návštěvníků",
      "kliknutí na rezervace",
      "konverze",
      "Google vyhledávání",
      "vývoj recenzí",
      "marketingové kampaně",
      "nejnavštěvovanější služby",
      "výkon jednotlivých kanálů",
    ],
    closing:
      "Důležité informace postupně zpřístupňujeme také prostřednictvím HAIRWEB HUBu.",
    flow: {
      label: "Do jednoho přehledu",
      steps: [
        { label: "Google" },
        { label: "Web" },
        { label: "Social" },
        { label: "Rezervace" },
        { label: "HAIRWEB HUB" },
      ],
    },
  },
  {
    slug: "marketing",
    number: "/08",
    cardTitle: "Marketing",
    cardText:
      "Podpora růstu rezervací a návratu klientů — bez zbytečného chaosu.",
    eyebrow: "Marketing salonu",
    title: "Marketing, který má přivádět rezervace. Ne jen čísla.",
    description:
      "Více návštěv webu nebo lajků samo o sobě účty nezaplatí. Marketing salonu musí mít jasný cíl – přivést správné zákazníky.",
    ctaLabel: "Chci růst salonu",
    seoTitle: "Online marketing pro kadeřnictví a salony | HAIRWEB",
    seoDescription:
      "Marketing kadeřnictví zaměřený na rezervace. Google, Meta a lokální kampaně až poté, co fungují základy online prezentace salonu.",
    intro: [
      "Marketing nezačínáme reklamou.",
      "Nejdříve se podíváme, jestli fungují základy: web, rezervace, Google, recenze, nabídka služeb a způsob, jakým salon komunikuje. Teprve potom má smysl přivádět více lidí.",
    ],
    resolveHeading: "Co můžeme řešit",
    resolveItems: [
      "strategii online marketingu",
      "Google",
      "Meta / Instagram",
      "lokální kampaně",
      "propagaci konkrétních služeb",
      "akce salonu",
      "získávání nových zákazníků",
      "podporu návratu stávajících",
      "měření výsledků",
      "optimalizaci kampaní",
    ],
    closing:
      "Nechceme utrácet rozpočet za návštěvnost. Chceme vědět, jestli marketing pomáhá plnit křesla.",
    flow: {
      label: "Od kampaně k zákazníkovi",
      steps: [
        { label: "Reklama" },
        { label: "Web" },
        { label: "Rezervace" },
        { label: "Zákazník" },
      ],
    },
  },
] as const satisfies readonly ServicePageContent[];

export type ServiceSlug = (typeof services)[number]["slug"];

export function getServiceBySlug(slug: string): ServicePageContent | undefined {
  return services.find((service) => service.slug === slug);
}

export function getServiceSlugs(): ServiceSlug[] {
  return services.map((service) => service.slug);
}
