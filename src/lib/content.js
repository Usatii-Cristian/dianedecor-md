/**
 * The studio's editorial content in one place.
 *
 * `prisma/seed.js` writes this into MongoDB, and `src/lib/queries.js` falls back
 * to it when the database is unreachable — so the site renders correctly before
 * the Atlas connection string exists and never goes blank if Mongo is down.
 *
 * `images` is a count: gallery paths are derived as
 * `/images/portfolio/<slug>-01.jpg` … and the cover as `<slug>-cover.jpg`.
 */

export const categories = [
  {
    name: 'Nunți',
    slug: 'nunti',
    description:
      'Decor complet de nuntă: arcadă, prezidiu, mese, sală și exterior, gândite ca un singur concept.',
    coverProjectSlug: 'nunta-ana-roman-chisinau',
    order: 1,
  },
  {
    name: 'Cumetrii',
    slug: 'cumetrii',
    description:
      'Zone foto, decor de masă și baloane pentru cumetrii, în tonuri calde și fără exces.',
    coverProjectSlug: 'cumetrie-matei-chisinau',
    order: 2,
  },
  {
    name: 'Cerere în căsătorie',
    slug: 'cerere-in-casatorie',
    description:
      'Setup-uri romantice indoor și outdoor, montate discret, cu lumânări, litere volumetrice și flori.',
    coverProjectSlug: 'cerere-diana-andrei-chisinau',
    order: 3,
  },
  {
    name: 'Aniversări',
    slug: 'aniversari',
    description:
      'Aniversări pentru copii și adulți: photo corner, candy bar, cifre volumetrice și decor de masă.',
    coverProjectSlug: 'aniversare-1-an-emma',
    order: 4,
  },
  {
    name: 'Cununie în aer liber',
    slug: 'cununie-in-aer-liber',
    description:
      'Ceremonii în livadă, în vie sau pe malul apei, cu arcadă, alee și scaune pregătite pentru invitați.',
    coverProjectSlug: 'cununie-livada-orhei',
    order: 5,
  },
  {
    name: 'Decor de Crăciun',
    slug: 'decor-de-craciun',
    description:
      'Decor de sezon pentru spații comerciale, restaurante și case, montat și demontat de echipa noastră.',
    coverProjectSlug: 'craciun-showroom-chisinau',
    order: 6,
  },
  {
    name: 'Evenimente corporative',
    slug: 'evenimente-corporative',
    description:
      'Gale, lansări de brand și petreceri de companie, cu decor aliniat identității vizuale a clientului.',
    coverProjectSlug: 'corporate-gala-de-iarna-chisinau',
    order: 7,
  },
]

export const services = [
  {
    title: 'Decor nuntă',
    slug: 'decor-nunta',
    icon: 'Heart',
    order: 1,
    priceFrom: 15000,
    shortDescription:
      'Decor complet, de la arcada florală de la intrare până la aranjamentele de pe mese și mașina mirilor.',
    description:
      'Preluăm decorul întregii zile, nu doar al sălii. Pornim de la sala în care ai rezervat, de la ora la care intră invitații și de la lumina pe care o are spațiul, iar de acolo construim paleta și materialele.\n\nLucrăm cu flori naturale de sezon acolo unde se văd de aproape — prezidiu, mese, buchete — și cu structuri proprii reutilizabile pentru volumele mari, ca bugetul să meargă în ce se vede în fotografii.\n\nMontajul începe cu minimum patru ore înainte de sosirea invitaților, iar demontarea o facem în aceeași noapte, astfel încât sala să fie liberă dimineața.',
    features: [
      'Arcadă florală pentru cununie sau intrarea în sală',
      'Prezidiu sau masa mirilor, cu fundal și aranjamente',
      'Decor de masă pentru invitați: aranjamente, sfeșnice, numerotare',
      'Decor de sală: intrare, zonă tort, zonă cadouri, photo corner',
      'Aranjamente auto pentru mașina mirilor',
      'Transport, montaj și demontare incluse în ofertă',
    ],
  },
  {
    title: 'Decor cumetrie',
    slug: 'decor-cumetrie',
    icon: 'Baby',
    order: 2,
    priceFrom: 6500,
    shortDescription:
      'Zonă foto, decor de masă și baloane tematice pentru cumetrie, în tonuri calde, nu în culori stridente.',
    description:
      'Cumetria are un ritm al ei: multă lume, copii, fotografii făcute repede între feluri de mâncare. De aceea construim decorul în jurul a două zone care chiar se folosesc — zona foto și masa cu tortul.\n\nEvităm paletele foarte saturate, pentru că nu îmbătrânesc frumos în fotografii. Preferăm tonuri de crem, piersică, salvie sau bleu prăfuit, cu accente în materiale naturale.\n\nNumele copilului din litere volumetrice rămâne al tău după eveniment, dacă îl comanzi, sau îl închiriezi doar pentru ziua respectivă.',
    features: [
      'Zonă foto cu fundal, flori și lumini',
      'Decor pentru masa tortului și candy bar',
      'Baloane tematice: buchete, arcade organice, cifre',
      'Nume din litere volumetrice, la comandă sau în chirie',
      'Aranjamente pentru mesele invitaților',
      'Montaj înainte de sosirea invitaților și demontare la final',
    ],
  },
  {
    title: 'Cerere în căsătorie',
    slug: 'cerere-in-casatorie',
    icon: 'Gem',
    order: 3,
    priceFrom: 3500,
    shortDescription:
      'Setup romantic montat discret, indoor sau outdoor, cu lumânări, litere LED și traseu de petale.',
    description:
      'Cererea în căsătorie se pregătește pe ascuns și se montează repede. Ne spui locul și ora, iar noi venim cu o oră sau două înainte, montăm și plecăm înainte să ajungeți voi.\n\nPentru exterior lucrăm cu lumânări în suporturi cu protecție la vânt, covor sau traseu de petale și structuri stabile care nu se clatină. Pentru interior — apartament, terasă, cameră de hotel — adaptăm dimensiunile la spațiu.\n\nDacă vrei, rămânem la distanță pentru a strânge totul imediat după, ca să nu ai tu grija decorului în seara respectivă.',
    features: [
      'Setup indoor sau outdoor, adaptat locului ales',
      'Lumânări în suporturi protejate la vânt',
      'Litere LED cu mesaj sau inițiale',
      'Traseu de petale, covor sau alee luminată',
      'Aranjament floral și buchet pentru moment',
      'Montaj discret înainte de sosire și strângere după eveniment',
    ],
  },
  {
    title: 'Decor aniversare',
    slug: 'decor-aniversare',
    icon: 'Cake',
    order: 4,
    priceFrom: 4500,
    shortDescription:
      'Tematici pentru copii și decor sobru pentru adulți, cu candy bar și photo corner pregătite de fotografiat.',
    description:
      'Pentru copii pornim de la tematica pe care o cere sărbătoritul și o traducem în materiale care arată bine și în fotografii, nu doar pe ecran: textile, carton gros, flori, baloane mate.\n\nPentru aniversările adulților mergem în direcția opusă — decor sobru, o singură paletă, lumânări și flori, fără elemente tematice.\n\nCandy bar-ul și photo corner-ul le montăm astfel încât să fie accesibile din două părți, ca să nu se formeze coadă la ele în timpul petrecerii.',
    features: [
      'Concept tematic pentru aniversări de copii',
      'Decor sobru, pe o singură paletă, pentru adulți',
      'Candy bar: suporturi, etajere, semnalistică',
      'Photo corner cu fundal și lumini',
      'Cifre volumetrice și baloane asortate',
      'Decor de masă și aranjamente pentru invitați',
    ],
  },
  {
    title: 'Cununie în aer liber',
    slug: 'cununie-in-aer-liber',
    icon: 'Trees',
    order: 5,
    priceFrom: 8000,
    shortDescription:
      'Arcadă, covor, scaune și aranjamente pe alee pentru ceremonii în livadă, în vie sau pe malul apei.',
    description:
      'La ceremoniile în aer liber decorul trebuie să reziste la vânt și la soare, nu doar să arate bine în prima jumătate de oră. Folosim structuri cu contragreutăți, flori rezistente la căldură și textile care nu se decolorează.\n\nVenim în locație înainte de a-ți trimite oferta, ca să vedem terenul, direcția soarelui la ora ceremoniei și de unde intră invitații.\n\nAsigurăm și scaunele, aleea și zona de așteptare cu apă pentru invitați, dacă locația nu le are.',
    features: [
      'Arcadă de cununie, în variantă florală sau textilă',
      'Alee: covor, petale, felinare sau aranjamente laterale',
      'Scaune pentru invitați, cu sau fără husă',
      'Zonă de așteptare și punct de apă pentru invitați',
      'Plan alternativ pentru ploaie, discutat din timp',
      'Montaj în dimineața evenimentului și demontare imediat după',
    ],
  },
  {
    title: 'Baloane cu heliu',
    slug: 'baloane-cu-heliu',
    icon: 'PartyPopper',
    order: 6,
    priceFrom: 900,
    shortDescription:
      'Buchete de baloane, arcade organice și cifre volumetrice, umflate cu heliu și livrate gata montate.',
    description:
      'Lucrăm cu baloane mate, în paletele pe care le folosim și în restul decorului, nu cu culori standard de la raft. Diferența se vede imediat în fotografii.\n\nBaloanele cu heliu le umflăm în ziua evenimentului și le livrăm gata montate, cu tratament care le prelungește durata de zbor.\n\nArcadele organice și cifrele volumetrice le montăm la fața locului și le putem combina cu flori naturale sau verdeață.',
    features: [
      'Buchete de baloane cu heliu, livrate în ziua evenimentului',
      'Arcade organice pentru intrare sau zonă foto',
      'Cifre și litere volumetrice umplute cu baloane',
      'Palete de culori la comandă, în tonuri mate',
      'Combinații cu flori naturale și verdeață',
      'Livrare în Chișinău și în țară',
    ],
  },
  {
    title: 'Chirie decor',
    slug: 'chirie-decor',
    icon: 'Package',
    order: 7,
    priceFrom: null,
    shortDescription:
      'Mobilier, suporturi florale, panouri foto și sfeșnice din stocul propriu, pentru evenimente montate de altcineva.',
    description:
      'Dacă îți montezi singur decorul sau lucrezi cu altcineva, îți închiriem elementele din stocul nostru. Toate piesele sunt verificate și curățate între evenimente.\n\nPreluarea se face din atelierul din Chișinău sau livrăm noi, contra cost, în funcție de volum și distanță.\n\nPentru rezervare avem nevoie de data evenimentului și de lista pieselor. Îți confirmăm disponibilitatea în aceeași zi.',
    features: [
      'Suporturi florale, coloane și arcade metalice',
      'Sfeșnice, felinare și suporturi pentru lumânări',
      'Panouri foto și fundaluri textile',
      'Mobilier: mese înalte, etajere, scaune decorative',
      'Verificare și curățare între evenimente',
      'Ridicare din atelier sau livrare contra cost',
    ],
  },
]

export const projects = [
  {
    title: 'Nuntă Ana & Roman',
    slug: 'nunta-ana-roman-chisinau',
    clientNames: 'Ana & Roman',
    categorySlug: 'nunti',
    eventDate: '2025-06-14',
    location: 'Chișinău',
    featured: true,
    order: 1,
    tags: ['flori naturale', 'ivoriu și cognac', 'arcadă'],
    imageCount: 6,
    shortDescription:
      'Nuntă de vară într-o sală cu tavan înalt, construită pe ivoriu, cognac și foarte multă verdeață.',
    description:
      'Ana și Roman ne-au adus o singură cerință clară: să nu arate ca o sală de nuntă standard. Sala avea tavan de peste cinci metri și pereți albi, așa că am lucrat pe verticală — arcadă înaltă la intrare și structuri suspendate deasupra prezidiului, ca spațiul de sus să nu rămână gol.\n\nPaleta a pornit de la rochiile domnișoarelor de onoare, în ton de cognac. Am completat cu ivoriu, crem și trei tipuri de verdeață, iar florile naturale le-am concentrat acolo unde se văd de aproape: prezidiu, mesele invitaților și buchetul miresei.\n\nPe mese am folosit sfeșnice joase, ca invitații să se vadă între ei peste masă, și numerotare scrisă de mână pe carton gros. Montajul a durat șapte ore, cu demontare în aceeași noapte.',
  },
  {
    title: 'Nuntă Nicoleta & Dumitru',
    slug: 'nunta-nicoleta-dumitru-orhei',
    clientNames: 'Nicoleta & Dumitru',
    categorySlug: 'nunti',
    eventDate: '2024-09-07',
    location: 'Orhei',
    featured: false,
    order: 2,
    tags: ['toamnă', 'lumânări', 'sală mică'],
    imageCount: 5,
    shortDescription:
      'Nuntă de toamnă pentru 80 de invitați, cu accent pe lumânări și pe o singură paletă caldă.',
    description:
      'Sala din Orhei era mică și cu lumină caldă, așa că am renunțat la volume mari și am mizat pe densitate: multe lumânări, aranjamente joase și textile care să îmbrace pereții.\n\nPaleta a rămas într-o singură familie — muștar, teracotă și crem — fără niciun accent rece. Am folosit crizanteme, trandafiri de grădină și frunze de eucalipt, toate de sezon.\n\nZona de tort a fost singurul element vertical din sală, montată în fața unui panou textil, ca fotografiile din acel moment să aibă un fundal curat.',
  },
  {
    title: 'Nuntă Cristina & Vlad',
    slug: 'nunta-cristina-vlad-soroca',
    clientNames: 'Cristina & Vlad',
    categorySlug: 'nunti',
    eventDate: '2025-08-23',
    location: 'Soroca',
    featured: true,
    order: 3,
    tags: ['alb și verde', 'nuntă mare', 'photo corner'],
    imageCount: 7,
    shortDescription:
      'Nuntă de 210 invitați, într-o paletă strictă de alb și verde, cu decor identic pe toate cele 21 de mese.',
    description:
      'La 210 invitați, coerența contează mai mult decât efectul. Am ales o paletă de doar două culori — alb și verde — și am repetat exact același aranjament pe toate cele 21 de mese, ca sala să se citească unitar din orice colț.\n\nPrezidiul a primit singura concentrare mare de flori, pe o lungime de patru metri, cu trandafiri albi, hortensii și eucalipt. În spate am montat un panou textil plisat, care a funcționat și ca fundal pentru fotografiile de grup.\n\nPhoto corner-ul l-am pus lângă intrare, nu în sală, ca invitații să îl folosească înainte de a se așeza la mese. A fost cea mai fotografiată zonă a serii.',
  },
  {
    title: 'Cumetria lui Matei',
    slug: 'cumetrie-matei-chisinau',
    clientNames: 'Familia Rusu',
    categorySlug: 'cumetrii',
    eventDate: '2025-04-12',
    location: 'Chișinău',
    featured: true,
    order: 4,
    tags: ['bleu prăfuit', 'zonă foto', 'litere volumetrice'],
    imageCount: 6,
    shortDescription:
      'Cumetrie de primăvară în bleu prăfuit și crem, cu zonă foto construită în jurul numelui copilului.',
    description:
      'Familia Rusu voia ceva luminos, dar fără albastrul intens pe care îl vezi la majoritatea cumetriilor. Am mers pe bleu prăfuit, crem și alb, cu accente în lemn natural.\n\nZona foto a fost construită în jurul numelui copilului, din litere volumetrice de 70 cm, montate pe un fundal textil plisat, cu baloane mate în cascadă pe o singură parte, ca să rămână loc pentru oameni în cadru.\n\nPe mesele invitaților am pus aranjamente joase din lalele și frezii, iar la masa tortului o etajeră cu dulciuri în aceeași paletă. Totul a fost montat cu două ore înainte de sosirea invitaților.',
  },
  {
    title: 'Cumetria Sofiei',
    slug: 'cumetrie-sofia-balti',
    clientNames: 'Familia Ciobanu',
    categorySlug: 'cumetrii',
    eventDate: '2024-11-16',
    location: 'Bălți',
    featured: false,
    order: 5,
    tags: ['piersică', 'candy bar', 'baloane'],
    imageCount: 5,
    shortDescription:
      'Cumetrie de noiembrie în tonuri de piersică și crem, cu un candy bar accesibil din două părți.',
    description:
      'Restaurantul din Bălți avea mochetă roșie și pereți cu tapet cu model, deci decorul trebuia să creeze zonele lui proprii, izolate vizual de restul sălii.\n\nAm montat două panouri textile crem — unul pentru zona foto, unul în spatele candy bar-ului — care au tăiat complet fundalul existent. Paleta a fost piersică, crem și alb, cu verdeață puțină.\n\nCandy bar-ul l-am poziționat central, accesibil din două părți, pentru că la 90 de invitați o masă lipită de perete înseamnă coadă toată seara.',
  },
  {
    title: 'Cerere în căsătorie — Diana & Andrei',
    slug: 'cerere-diana-andrei-chisinau',
    clientNames: 'Diana & Andrei',
    categorySlug: 'cerere-in-casatorie',
    eventDate: '2025-02-14',
    location: 'Chișinău',
    featured: false,
    order: 6,
    tags: ['indoor', 'lumânări', 'litere LED'],
    imageCount: 4,
    shortDescription:
      'Cerere în căsătorie montată într-un apartament cu terasă, cu 120 de lumânări și litere LED.',
    description:
      'Andrei a ales apartamentul lor, pentru că acolo se mutaseră împreună cu un an înainte. Am avut la dispoziție 90 de minute cât Diana era plecată.\n\nAm montat 120 de lumânări în suporturi de sticlă pe podea și pe balustrada terasei, litere LED pe peretele din fața intrării și un traseu de petale de la ușă până la terasă.\n\nAranjamentul floral a fost în tonuri de roșu prăfuit și crem, iar buchetul l-am lăsat pregătit lângă litere. Am plecat cu zece minute înainte să ajungă ea și ne-am întors a doua zi dimineață pentru strângere.',
  },
  {
    title: 'Cerere pe terasa de la Rezina',
    slug: 'cerere-terasa-rezina',
    clientNames: 'Elena & Ion',
    categorySlug: 'cerere-in-casatorie',
    eventDate: '2024-08-30',
    location: 'Rezina',
    featured: false,
    order: 7,
    tags: ['outdoor', 'apus', 'felinare'],
    imageCount: 4,
    shortDescription:
      'Cerere în căsătorie la apus, pe o terasă deasupra Nistrului, cu felinare și structuri rezistente la vânt.',
    description:
      'Terasa era complet expusă vântului dinspre râu, așa că toate elementele au fost montate cu contragreutăți, iar lumânările le-am pus exclusiv în felinare închise.\n\nAm calculat montajul în funcție de ora apusului: decorul a fost gata cu 40 de minute înainte, ca lumina caldă să prindă aranjamentul în fotografii.\n\nStructura centrală a fost o arcadă circulară din metal, îmbrăcată cu verdeață și flori albe pe o singură treime, lăsând restul liber pentru priveliște.',
  },
  {
    title: 'Aniversarea de 1 an a Emmei',
    slug: 'aniversare-1-an-emma',
    clientNames: 'Familia Grosu',
    categorySlug: 'aniversari',
    eventDate: '2025-05-18',
    location: 'Chișinău',
    featured: false,
    order: 8,
    tags: ['copii', 'cifră volumetrică', 'roz prăfuit'],
    imageCount: 5,
    shortDescription:
      'Prima aniversare, cu cifră volumetrică, arcadă organică de baloane și decor de masă în roz prăfuit.',
    description:
      'Petrecerea a fost într-o grădină, la prânz, deci decorul trebuia să reziste la soare direct timp de patru ore fără să se decoloreze sau să se dezumfle.\n\nAm folosit baloane mate de calitate ridicată, montate în arcadă organică pe o structură metalică ancorată în pământ, și o cifră volumetrică de 100 cm îmbrăcată în același material.\n\nPaleta a fost roz prăfuit, crem și alb, cu verdeață naturală. Pe masa tortului am pus etajere joase, la înălțimea copiilor, ca să ajungă singuri la dulciuri.',
  },
  {
    title: 'Aniversare 40 de ani — Victoria',
    slug: 'aniversare-40-de-ani-victoria',
    clientNames: null,
    categorySlug: 'aniversari',
    eventDate: '2024-10-05',
    location: 'Chișinău',
    featured: false,
    order: 9,
    tags: ['adulți', 'sobru', 'lumânări'],
    imageCount: 4,
    shortDescription:
      'Aniversare de 40 de ani într-un restaurant mic, cu decor sobru, fără baloane și fără elemente tematice.',
    description:
      'Victoria a cerut explicit să nu existe niciun balon și nicio cifră. Am construit decorul exclusiv din flori, lumânări și textile, într-o singură paletă: bordo profund, crem și auriu mat.\n\nMesele au primit aranjamente lungi, pe toată lungimea blatului, cu lumânări conice între ele. Nu am folosit fețe de masă colorate — doar in natural.\n\nSingurul element vertical a fost peretele din spatele mesei principale, îmbrăcat în textil plisat crem, cu aplicații florale la două înălțimi.',
  },
  {
    title: 'Cununie în livadă, Orhei',
    slug: 'cununie-livada-orhei',
    clientNames: 'Alina & Sergiu',
    categorySlug: 'cununie-in-aer-liber',
    eventDate: '2025-07-05',
    location: 'Orhei',
    featured: true,
    order: 10,
    tags: ['livadă', 'arcadă', 'alee'],
    imageCount: 7,
    shortDescription:
      'Cununie într-o livadă de meri, cu arcadă din lemn, alee de petale și 90 de scaune pentru invitați.',
    description:
      'Livada avea rânduri de meri la distanțe egale, așa că aleea ceremoniei a folosit un culoar natural deja existent — nu a trebuit să construim nimic ca să delimităm spațiul.\n\nArcada a fost din lemn brut, îmbrăcată cu verdeață și flori albe și crem doar pe colțuri, ca să nu concureze cu pomii din spate. Am ancorat-o cu țăruși, pentru că terenul era în pantă ușoară.\n\nAm montat 90 de scaune de lemn, fără huse, și am pus la capătul aleii o zonă de așteptare cu apă și umbrele, pentru că ceremonia a început la ora 17:00, când soarele încă bătea puternic.',
  },
  {
    title: 'Cununie pe malul Nistrului',
    slug: 'cununie-malul-nistrului-rezina',
    clientNames: 'Mihaela & Radu',
    categorySlug: 'cununie-in-aer-liber',
    eventDate: '2024-06-22',
    location: 'Rezina',
    featured: false,
    order: 11,
    tags: ['malul apei', 'vânt', 'alb'],
    imageCount: 5,
    shortDescription:
      'Ceremonie pe malul Nistrului, cu arcadă textilă calculată pentru vânt și decor redus la minimum.',
    description:
      'Locul avea deja tot ce trebuia vizual — apa, malul înalt, cerul — deci decorul a fost intenționat minimal. Ideea a fost să încadrăm priveliștea, nu să o acoperim.\n\nArcada a fost o structură dreaptă din metal, cu două fâșii de voal alb prinse doar în partea de sus, astfel încât vântul să le miște fără să le rupă. Florile au fost concentrate la bază, în două aranjamente laterale.\n\nAleea a fost marcată cu felinare joase din sticlă, fără covor, pentru că terenul era iarbă tunsă și un covor ar fi arătat artificial.',
  },
  {
    title: 'Decor de Crăciun, showroom Chișinău',
    slug: 'craciun-showroom-chisinau',
    clientNames: null,
    categorySlug: 'decor-de-craciun',
    eventDate: '2024-12-02',
    location: 'Chișinău',
    featured: false,
    order: 12,
    tags: ['sezonier', 'comercial', 'brad'],
    imageCount: 5,
    shortDescription:
      'Decor de sezon pentru un showroom de 400 mp, montat noaptea și demontat integral după sărbători.',
    description:
      'Showroom-ul funcționa în program normal, deci montajul s-a făcut noaptea, în două ture, ca dimineața spațiul să fie complet curat și funcțional.\n\nAm lucrat pe o paletă de verde profund, alb și alamă, fără roșu, ca decorul să nu intre în conflict cu produsele expuse. Bradul principal, de 3,5 metri, a fost pus la intrare, iar restul spațiului a primit doar accente: ghirlande pe casa de marcat și pe vitrine.\n\nDemontarea a fost inclusă în contract și s-a făcut pe 8 ianuarie, tot noaptea.',
  },
  {
    title: 'Gală corporativă de iarnă',
    slug: 'corporate-gala-de-iarna-chisinau',
    clientNames: null,
    categorySlug: 'evenimente-corporative',
    eventDate: '2024-12-13',
    location: 'Chișinău',
    featured: false,
    order: 13,
    tags: ['corporate', 'scenă', 'brand'],
    imageCount: 5,
    shortDescription:
      'Gală de final de an pentru 180 de angajați, cu decor de scenă și zonă de intrare brănduită.',
    description:
      'Clientul avea o identitate vizuală strictă, cu două culori de brand. Am folosit exact acele două culori, fără să adăugăm nimic, și am construit contrastul din materiale: mat față de lucios, textil față de metal.\n\nZona de intrare a primit un perete de fotografiat de șase metri, cu logo repetat discret, iluminat lateral ca să nu apară reflexii în poze.\n\nPe scenă am montat un fundal cu volume geometrice și aranjamente florale la bază, dimensionate astfel încât să nu intre în cadrul camerelor de filmat.',
  },
  {
    title: 'Lansare de brand, Bălți',
    slug: 'corporate-lansare-brand-balti',
    clientNames: null,
    categorySlug: 'evenimente-corporative',
    eventDate: '2025-03-20',
    location: 'Bălți',
    featured: false,
    order: 14,
    tags: ['lansare', 'minimal', 'iluminat'],
    imageCount: 4,
    shortDescription:
      'Lansare de produs într-un spațiu industrial, cu decor minimal și accent pus pe iluminat.',
    description:
      'Spațiul era o hală cu pereți de beton și structură metalică vizibilă. Am păstrat caracterul industrial și am adăugat doar trei elemente: un podium pentru produs, două aranjamente florale mari și iluminat direcțional.\n\nFlorile au fost în tonuri de alb și verde, în vase înalte de metal, ca să se citească pe fundalul gri fără să pară decorative în exces.\n\nRestul efectului a venit din lumină: spoturi calde pe zona produsului și lumină rece, difuză, pe pereți, ca separarea între zone să se facă vizual, fără pereți despărțitori.',
  },
]

export const testimonials = [
  {
    authorName: 'Ana M.',
    eventType: 'Nuntă, Chișinău',
    content:
      'Ne-am întâlnit de trei ori înainte de nuntă și de fiecare dată am plecat cu răspunsuri clare, nu cu vorbe generale. În ziua nunții am intrat în sală la ora la care ni s-a promis și era gata tot. Nu am avut niciun telefon de rezolvat în ziua aceea.',
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    authorName: 'Nicoleta P.',
    eventType: 'Nuntă, Orhei',
    content:
      'Aveam o sală mică și îmi era teamă că va arăta încărcat. Mi s-a propus să scoatem jumătate din ce voiam eu inițial și a fost decizia corectă. A ieșit exact cât trebuia.',
    rating: 5,
    featured: true,
    order: 2,
  },
  {
    authorName: 'Victoria C.',
    eventType: 'Aniversare 40 de ani, Chișinău',
    content:
      'Am cerut ceva fără baloane și fără cifre, iar acesta a fost primul studio care nu a încercat să mă convingă de contrariu. Decorul a fost exact ce am descris la prima discuție.',
    rating: 5,
    featured: true,
    order: 3,
  },
  {
    authorName: 'Dumitru B.',
    eventType: 'Cumetrie, Bălți',
    content:
      'Au venit din Chișinău la Bălți, au montat în două ore și au strâns tot la finalul serii. Prețul din ofertă a fost prețul final, fără adăugiri.',
    rating: 5,
    featured: true,
    order: 4,
  },
  {
    authorName: 'Cristina R.',
    eventType: 'Nuntă, Soroca',
    content:
      'Am fost 210 invitați și mă așteptam la haos la montaj. Echipa a lucrat organizat, fără să încurce personalul restaurantului. Mesele arătau identic, toate 21.',
    rating: 5,
    featured: true,
    order: 5,
  },
  {
    authorName: 'Sergiu T.',
    eventType: 'Cununie în aer liber, Orhei',
    content:
      'Au venit să vadă livada înainte de a-mi da prețul și mi-au spus direct ce nu are sens să facem acolo. Apreciez că nu mi-au vândut lucruri de care nu aveam nevoie.',
    rating: 5,
    featured: true,
    order: 6,
  },
]

/** Gallery image paths for a project, derived from its slug and image count. */
export function projectImagePaths(slug, imageCount) {
  return Array.from(
    { length: imageCount },
    (_, index) => `/images/portfolio/${slug}-${String(index + 1).padStart(2, '0')}.jpg`
  )
}

/** Cover image path for a project. */
export function projectCoverPath(slug) {
  return `/images/portfolio/${slug}-cover.jpg`
}

/** Cover image path for a service. */
export function serviceCoverPath(slug) {
  return `/images/services/${slug}.jpg`
}
