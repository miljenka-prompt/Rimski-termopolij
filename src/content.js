export const EVIDENCE_COLORS = {
  documented: "#d8c08b",
  contextual: "#66a9b3",
  plausible: "#c58a52",
  interpretive: "#a36b8c",
};

const sharedEvidence = {
  hr: [
    {
      id: "documented",
      label: "Potvrđeno",
      description: "Arheološki, epigrafski ili tekstualno potvrđen podatak.",
    },
    {
      id: "contextual",
      label: "Povijesno utemeljeno",
      description: "Potvrđen društveni ili regionalni obrazac, ne nužno ovaj pojedinac.",
    },
    {
      id: "plausible",
      label: "Plauzibilna rekonstrukcija",
      description: "Moguće prema poznatom kontekstu, ali bez izravnog dokaza.",
    },
    {
      id: "interpretive",
      label: "Autorska interpretacija",
      description: "Dramaturška odluka koja ostaje vidljivo označena.",
    },
  ],
  en: [
    {
      id: "documented",
      label: "Attested",
      description: "Supported by archaeological, epigraphic or textual evidence.",
    },
    {
      id: "contextual",
      label: "Historically grounded",
      description: "An attested social or regional pattern, not necessarily this individual.",
    },
    {
      id: "plausible",
      label: "Plausible reconstruction",
      description: "Possible within the known context, but not directly evidenced.",
    },
    {
      id: "interpretive",
      label: "Authorial interpretation",
      description: "A dramatic choice kept visibly distinct from evidence.",
    },
  ],
};

export const CONTENT = {
  hr: {
    ui: {
      projectLabel: "ANDAUTONIJA · 1. ST. N. E.",
      location: "Ščitarjevo · antička Andautonija",
      placeInSpace: "Postavi u prostor",
      exitAR: "Završi AR",
      chronovisor: "Kronovizor",
      diorama: "Diorama",
      chronovisorLabel: "KRONOVIZOR · INTERPRETATIVNI SLOJ",
      routeThrace: "Trakija",
      routeSiscia: "Siscija",
      routeAndautonia: "Andautonija",
      whyThisScene: "Zašto je ovaj prizor ovakav?",
      previous: "Natrag",
      next: "Dalje",
      restart: "Ponovno",
      evidenceLayer: "EVIDENCIJSKI SLOJ",
      whatWeKnow: "Što znamo, a što rekonstruiramo",
      opacityMethod:
        "Prozirnost u 3D prizoru označava vrstu interpretacije. Ona nije izmišljeni postotak povijesne istine.",
      currentScene: "TRENUTAČNI PRIZOR",
      whyFreedman: "Zašto prikazujemo libertina?",
      freedmanContext:
        "Libertin je bio pravno slobodan, ali nije počinjao život ispočetka. Veze s patronom, podrijetlo, rad, dugovi i reputacija i dalje su određivali koliko je njegova sloboda stvarna. Eumachus zato ne predstavlja sve oslobođenike: on je kompozitni lik kroz kojega promatramo društvenu pokretljivost, ovisnost i svakodnevni rad na rubu Carstva. Andautonija je bila provincijska u odnosu na Rim, ali lokalno povezan gradski centar — upravo mjesto gdje se veliki sustav vidi kroz male živote.",
      sourcesTitle: "Polazišta",
      legacyLink: "Otvori sačuvani izvorni demo",
      loading: "Učitavanje diorame…",
      unsupportedAR: "Ovaj preglednik nema WebXR AR. Diorama ostaje potpuno dostupna u 3D prikazu.",
      findingSurface: "Pomiči telefon polako dok se ne pojavi brončani krug.",
      tapToPlace: "Dodirni zaslon kako bi postavila dioramu.",
      placed: "Diorama je postavljena. Kreći se oko nje ili je postavi ponovno.",
      arFailed: "AR se nije mogao pokrenuti. Nastavljamo u 3D prikazu.",
      soundOn: "Uključi zvuk",
      soundOff: "Isključi zvuk",
      position: (current, total) => `${current} od ${total}`,
    },
    evidence: sharedEvidence.hr,
    scenes: [
      {
        id: "name",
        kicker: "IME IZMEĐU SVJETOVA",
        title: "Eumachos postaje Eumachus",
        deck: "Grčko ime u tračkom prostoru nije proturječje, nego trag kulturnoga dodira.",
        voice: "Ime mi je ostalo. Samo su ga na latinskom izgovarali drukčije.",
        body:
          "Eumachos je grčko ime potvrđeno u heleniziranom okruženju Trakije. Latinski oblik Eumachus zato odgovara liku koji je odrastao između tračke lokalne tradicije i grčkoga jezika. Ne znamo njegovo puno rimsko ime ni ime patrona; „Eumachus Felix” ostaje izložbeni naziv.",
        evidence: "contextual",
        evidenceText:
          "Ime Eumachos epigrafski je potvrđeno u Mezambrii. To podupire regionalnu mogućnost imena, ali ne dokazuje osobu iz ove priče.",
        opacity: 0.84,
        visual: "name",
      },
      {
        id: "house",
        kicker: "KUĆA KONJA I ORUŽJA",
        title: "Rođen dovoljno visoko da pamti pad",
        deck: "Njegova prgavost proizlazi iz izgubljena položaja, ne iz etničke karikature.",
        voice: "U našoj su kući konji imali imena, a ljudi obveze.",
        body:
          "Zamišljamo ga u nižem lokalnom vojno-zemljoposjedničkom sloju: obitelj ima konje, oružje i ograničen ugled, ali nije velika aristokracija. Eumachus nije rimski auxiliary ni decurio. Ratničko nasljeđe ovdje objašnjava ponos i osjećaj da mu svijet duguje mjesto koje je izgubio.",
        evidence: "plausible",
        evidenceText:
          "Tračko vojno i konjaničko okruženje povijesno je utemeljeno. Eumachusova obitelj, njezin rang i imovina kompozitna su rekonstrukcija.",
        opacity: 0.68,
        visual: "house",
      },
      {
        id: "fall",
        kicker: "PAD BEZ LEGIONARSKOG ČINA",
        title: "Nije veteran. Postaje roba.",
        deck: "Njegov pad odvojen je od rimske vojne službe, čime nestaje ključna povijesna kontradikcija.",
        voice: "Nisam položio prisegu Rimu. Rim je svejedno stigao do mene.",
        body:
          "Prijelaz u ropstvo ostaje namjerno neprecizan: politički i vojni potresi na sjeveru Trakije mogli su čovjeka ratničkoga podrijetla pretvoriti u zarobljenika i robu. Ne tvrdimo točan pohod, godinu ni kupca. Znamo samo dramaturšku jezgru — slobodno podrijetlo i iskustvo prisilne ovisnosti.",
        evidence: "interpretive",
        evidenceText:
          "Ne postoji izvor za Eumachusovo zarobljavanje. Prizor je autorski most koji izbjegava netočnu tvrdnju o porobljenom rimskom auxiliaryju.",
        opacity: 0.48,
        visual: "fall",
      },
      {
        id: "voice",
        kicker: "GLAS U TUĐOJ KUĆI",
        title: "Homer kao dar i poniženje",
        deck: "Ono malo obrazovanja što posjeduje povećava njegovu uporabnu vrijednost, ali mu ne vraća dostojanstvo.",
        voice: "Tražili su stihove dok sam čistio pod. Zapamtio sam njihov smijeh bolje od Homera.",
        body:
          "U kući nepoznata gospodara Eumachus čisti triklinij i pred gostima recitira fragmente Homera. Prizor nije dokumentirani običaj jedne osobe, nego namjerno zaoštrena slika gospodareve moći: obrazovanje, posluživanje i zabava mogu stati u isto tijelo roba.",
        evidence: "interpretive",
        evidenceText:
          "Ropstvo, kućna služba i obrazovani robovi dobro su potvrđeni fenomeni. Konkretno recitiranje tijekom čišćenja Eumachusova je dramaturška biografija.",
        opacity: 0.46,
        visual: "voice",
      },
      {
        id: "siscia",
        kicker: "SLOBODA BEZ POVRATKA",
        title: "Siscija kao druga granica",
        deck: "Manumissio mijenja njegov pravni status, ali ne briše ovisnost, glasine ni promašene pokušaje uspona.",
        voice: "Slobodan, rekli su. Slobodan za dugove, tuđa vrata i vlastitu sramotu.",
        body:
          "Mogući boravak u Sisciji povezuje manumissio, rad s konjima ili posredovanje u trgovini i propali pokušaj osamostaljenja. Cesta prema Poetoviju vodi preko Andautonije. Prometnice i gradovi su potvrđeni; Eumachusov osobni put ostaje plauzibilna rekonstrukcija.",
        evidence: "plausible",
        evidenceText:
          "Siscija i Andautonija bile su povezane regionalnim prometnim pravcima. Oslobođenje, posao i razlozi njegova odlaska nisu izravno potvrđeni.",
        opacity: 0.66,
        visual: "siscia",
      },
      {
        id: "thermopolium",
        kicker: "TERMOPOLIJ",
        title: "Carstvo viđeno odozdo",
        deck: "Na kraju ne gledamo cara ni vojskovođu, nego čovjeka koji pokušava zaraditi, pripadati i sačuvati ostatak ponosa.",
        voice: "Ovdje svatko nešto duguje: novac, uslugu, šutnju. Ja barem znam cijenu.",
        body:
          "U Andautoniji Eumachus nije „tipični libertin”, nego jedna moguća biografija. Kroz njega se vide rad, patronat, migracija, gradske mreže i nejednaka vrijednost slobode. Provincijski rub nije izolirana pozornica: Andautonija je lokalni upravni, gospodarski i kulturni centar povezan sa Siscijom i širim Carstvom.",
        evidence: "contextual",
        evidenceText:
          "Urbana uloga Andautonije i širi položaj libertina povijesno su utemeljeni. Eumachusova prisutnost u termopoliju i njegov glas ostaju kompozitna interpretacija.",
        opacity: 0.82,
        visual: "thermopolium",
      },
    ],
  },
  en: {
    ui: {
      projectLabel: "ANDAUTONIA · 1ST CENTURY CE",
      location: "Ščitarjevo · ancient Andautonia",
      placeInSpace: "Place in your space",
      exitAR: "End AR",
      chronovisor: "Chronovisor",
      diorama: "Diorama",
      chronovisorLabel: "CHRONOVISOR · INTERPRETIVE LAYER",
      routeThrace: "Thrace",
      routeSiscia: "Siscia",
      routeAndautonia: "Andautonia",
      whyThisScene: "Why is this scene shown this way?",
      previous: "Back",
      next: "Next",
      restart: "Restart",
      evidenceLayer: "EVIDENCE LAYER",
      whatWeKnow: "What we know and what we reconstruct",
      opacityMethod:
        "Transparency in the 3D scene marks the type of interpretation. It is not a fabricated percentage of historical truth.",
      currentScene: "CURRENT SCENE",
      whyFreedman: "Why portray a freedman?",
      freedmanContext:
        "A freedman was legally free, but did not begin life anew. Ties to a patron, origin, work, debt and reputation still shaped how real that freedom could become. Eumachus therefore does not stand for every freed person. He is a composite figure through whom we examine mobility, dependence and ordinary work at the edge of the Empire. Andautonia was peripheral to Rome yet locally connected — precisely where a vast system becomes visible through small lives.",
      sourcesTitle: "Starting points",
      legacyLink: "Open the preserved original demo",
      loading: "Loading the diorama…",
      unsupportedAR: "This browser does not provide WebXR AR. The full diorama remains available in 3D.",
      findingSurface: "Move the phone slowly until a bronze ring appears.",
      tapToPlace: "Tap the screen to place the diorama.",
      placed: "The diorama is placed. Walk around it or place it again.",
      arFailed: "AR could not start. Continuing in the 3D view.",
      soundOn: "Turn sound on",
      soundOff: "Turn sound off",
      position: (current, total) => `${current} of ${total}`,
    },
    evidence: sharedEvidence.en,
    scenes: [
      {
        id: "name",
        kicker: "A NAME BETWEEN WORLDS",
        title: "Eumachos becomes Eumachus",
        deck: "A Greek name in Thrace is not a contradiction, but evidence of cultural contact.",
        voice: "My name remained. They simply pronounced it differently in Latin.",
        body:
          "Eumachos is a Greek name attested in the Hellenised environment of Thrace. The Latin form Eumachus therefore suits a figure raised between local Thracian tradition and Greek language. His full Roman name and patron are unknown; “Eumachus Felix” remains an exhibition title.",
        evidence: "contextual",
        evidenceText:
          "The name Eumachos is epigraphically attested at Mesambria. This supports the regional possibility of the name, not the individual portrayed here.",
        opacity: 0.84,
        visual: "name",
      },
      {
        id: "house",
        kicker: "A HOUSE OF HORSES AND ARMS",
        title: "Born high enough to remember the fall",
        deck: "His defiance comes from lost position, not from an ethnic caricature.",
        voice: "In our house the horses had names, and the people had duties.",
        body:
          "We imagine him in a lower local military landholding stratum: a family with horses, weapons and limited standing, but no grand aristocracy. Eumachus is not a Roman auxiliary or decurion. The martial background explains his pride and his sense that the world owes him the place he lost.",
        evidence: "plausible",
        evidenceText:
          "A Thracian military and equestrian environment is historically grounded. Eumachus' family, rank and property are a composite reconstruction.",
        opacity: 0.68,
        visual: "house",
      },
      {
        id: "fall",
        kicker: "A FALL WITHOUT ROMAN RANK",
        title: "Not a veteran. Made into property.",
        deck: "His enslavement is detached from Roman military service, removing the central historical contradiction.",
        voice: "I never swore an oath to Rome. Rome reached me all the same.",
        body:
          "The passage into slavery remains deliberately imprecise. Political and military upheaval in northern Thrace could turn a free man of martial background into a captive and a commodity. We claim no exact campaign, year or buyer — only the dramatic core of free origin followed by coerced dependence.",
        evidence: "interpretive",
        evidenceText:
          "No source records Eumachus' capture. This is an authorial bridge that avoids the false claim of an enslaved Roman auxiliary.",
        opacity: 0.48,
        visual: "fall",
      },
      {
        id: "voice",
        kicker: "A VOICE IN ANOTHER MAN'S HOUSE",
        title: "Homer as gift and humiliation",
        deck: "His limited education increases his utility, but does not restore his dignity.",
        voice: "They asked for verses while I cleaned the floor. I remember their laughter better than Homer.",
        body:
          "In an unnamed master's house Eumachus cleans the triclinium and recites fragments of Homer before the guests. It is not a documented habit of one person, but a sharpened image of mastery: learning, service and entertainment can be forced into the same enslaved body.",
        evidence: "interpretive",
        evidenceText:
          "Slavery, domestic service and educated enslaved people are well attested. Reciting while cleaning belongs to Eumachus' dramatic biography.",
        opacity: 0.46,
        visual: "voice",
      },
      {
        id: "siscia",
        kicker: "FREEDOM WITHOUT RETURN",
        title: "Siscia as a second frontier",
        deck: "Manumission changes his legal status, but not dependence, rumours or failed attempts to rise.",
        voice: "Free, they said. Free for debts, other men's doors and my own shame.",
        body:
          "A possible stay in Siscia links manumission, work with horses or trade brokerage, and a failed attempt at independence. The road towards Poetovio passed through Andautonia. The cities and routes are attested; Eumachus' personal journey remains a plausible reconstruction.",
        evidence: "plausible",
        evidenceText:
          "Siscia and Andautonia were connected through regional routes. His manumission, work and reasons for leaving are not directly attested.",
        opacity: 0.66,
        visual: "siscia",
      },
      {
        id: "thermopolium",
        kicker: "THE THERMOPOLIUM",
        title: "The Empire seen from below",
        deck: "We end not with an emperor or commander, but with someone trying to earn, belong and preserve what remains of his pride.",
        voice: "Everyone here owes something: money, a favour, silence. At least I know the price.",
        body:
          "In Andautonia Eumachus is not a “typical freedman”, but one possible biography. Through him we see work, patronage, migration, urban networks and the unequal value of freedom. The provincial edge was not isolated: Andautonia was a local administrative, economic and cultural centre connected with Siscia and the wider Empire.",
        evidence: "contextual",
        evidenceText:
          "Andautonia's urban role and the broader status of freed people are historically grounded. Eumachus' presence in a thermopolium and his voice remain composite interpretation.",
        opacity: 0.82,
        visual: "thermopolium",
      },
    ],
  },
};
