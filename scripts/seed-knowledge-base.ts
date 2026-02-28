import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}
const connectionString = String(uri);

const knowledgeBase = [
  // ============================================================
  // 1. GRAND-BASSAM - Patrimoine UNESCO
  // ============================================================
  {
    category: "site_culturel",
    title: "Grand-Bassam - Patrimoine Mondial UNESCO",
    location: "Grand-Bassam",
    region: "Sud-Comoe",
    content: `Grand-Bassam est la premiere capitale historique de la Cote d'Ivoire, inscrite au patrimoine mondial de l'UNESCO en 2012. Situee a 40 km a l'est d'Abidjan, cette ville coloniale offre un temoignage exceptionnel de l'urbanisme colonial de la fin du XIXe siecle et du debut du XXe siecle. Le quartier France, coeur historique de la ville, presente une architecture coloniale remarquable avec ses batiments a colonnades, ses verandas et ses toits de tuiles. Parmi les monuments emblematiques : l'ancien palais du gouverneur (1893), la maison des Artistes, le phare historique, la poste coloniale et le tribunal. Grand-Bassam fut la capitale de 1893 a 1900 avant d'etre transferee a Bingerville suite a une epidemie de fievre jaune. La ville abrite egalement le Musee National du Costume, installe dans l'ancien palais du gouverneur, qui presente une collection unique de costumes traditionnels des differentes ethnies ivoiriennes. La plage de Grand-Bassam, bordee de cocotiers, est l'une des plus frequentees du pays. Le N'Zima Village, quartier traditionnel, offre un contraste saisissant avec le quartier colonial et permet de decouvrir le mode de vie des populations autochtones N'Zima.`,
    tags: ["UNESCO", "patrimoine", "coloniale", "musee", "plage", "architecture", "histoire"],
    practical_info: {
      horaires: "Quartier historique accessible toute la journee. Musee du Costume: 9h-17h sauf lundi.",
      tarif: "Entree musee: 1000 FCFA adulte, 500 FCFA enfant. Visite guidee: 5000 FCFA.",
      transport: "Depuis Abidjan: taxi (40 min, 3000-5000 FCFA), gbaka/bus (1h, 500-1000 FCFA). Depuis la gare d'Adjame.",
      meilleure_periode: "Novembre a Mars (saison seche). Eviter Juin-Juillet (grandes pluies).",
      duree_visite: "Demi-journee minimum, journee complete recommandee.",
      tips: "Negociez les prix avec les guides locaux. Visitez tot le matin pour eviter la chaleur. Le marche artisanal pres de la plage offre d'excellents souvenirs."
    }
  },
  {
    category: "histoire",
    title: "Histoire de Grand-Bassam : De la capitale coloniale au patrimoine mondial",
    location: "Grand-Bassam",
    region: "Sud-Comoe",
    content: `Grand-Bassam a ete fondee comme comptoir commercial par les Francais en 1843. Elle devint officiellement la capitale de la colonie de Cote d'Ivoire en 1893 sous le gouverneur Louis Gustave Binger. La ville a connu son apogee entre 1893 et 1900, periode durant laquelle furent construits les principaux edifices coloniaux. En 1899, une terrible epidemie de fievre jaune decima une grande partie de la population europeenne, entrainant le transfert de la capitale a Bingerville en 1900. Malgre ce declin administratif, Grand-Bassam resta un centre commercial important grace a son port et a ses maisons de commerce. Les compagnies CFAO et SCOA y maintirent leurs entrepots jusque dans les annees 1950. La ville a egalement ete un foyer de resistance anticoloniale : en decembre 1949, les femmes de Grand-Bassam marcherent sur la prison pour demander la liberation des prisonniers politiques du PDCI-RDA, un evenement fondateur de l'histoire nationale. Apres l'independance en 1960, Grand-Bassam perdit progressivement de son importance economique mais conserva son charme architectural. En 2012, l'UNESCO inscrivit la ville historique au patrimoine mondial, reconnaissant sa valeur universelle exceptionnelle comme exemple d'une ville coloniale planifiee du XIXe siecle.`,
    tags: ["histoire", "colonisation", "independance", "femmes", "politique", "UNESCO"],
    practical_info: null
  },

  // ============================================================
  // 2. YAMOUSSOUKRO - Capitale politique
  // ============================================================
  {
    category: "site_culturel",
    title: "Basilique Notre-Dame de la Paix - Yamoussoukro",
    location: "Yamoussoukro",
    region: "Lacs",
    content: `La Basilique Notre-Dame de la Paix de Yamoussoukro est le plus grand edifice religieux chretien au monde. Consacree le 10 septembre 1990 par le Pape Jean-Paul II, elle a ete construite entre 1986 et 1989 a l'initiative du president Felix Houphouet-Boigny, natif de Yamoussoukro. Inspiree de la Basilique Saint-Pierre de Rome, elle la depasse en dimensions : 158 metres de hauteur avec la croix (contre 136 m pour Saint-Pierre), une surface de 30 000 m2, et une capacite de 7 000 places assises (18 000 debout). Le dome culmine a 90 metres et mesure 60 metres de diametre. Les vitraux, realises par des maitres verriers francais, couvrent une surface de 7 400 m2 et representent des scenes bibliques dans un style contemporain. L'un des vitraux inclut une representation du president Houphouet-Boigny aux cotes des Rois Mages. Le parvis, plus grand que celui de Saint-Pierre, est orne de 128 colonnes doriques. Autour de la basilique, des jardins magnifiques de 130 hectares reproduisent les jardins a la francaise. Le cout total de la construction est estime entre 175 et 600 millions de dollars, entierement finance sur les fonds personnels du president selon les sources officielles.`,
    tags: ["basilique", "religion", "architecture", "Houphouet-Boigny", "record"],
    practical_info: {
      horaires: "Mardi-Dimanche 9h-17h. Messe dominicale a 9h30. Fermee le lundi.",
      tarif: "Entree gratuite. Don recommande. Visite guidee: 2000-5000 FCFA.",
      transport: "Depuis Abidjan: autoroute du Nord (240 km, 3h). Bus UTB ou EHIVET: 4000-6000 FCFA.",
      meilleure_periode: "Toute l'annee. Decembre-Fevrier plus agreable (moins chaud).",
      duree_visite: "1h30 a 2h pour la visite complete incluant les jardins.",
      tips: "Tenue correcte exigee (pas de shorts ni debardeurs). Photographes amateurs : la lumiere du matin est ideale pour les vitraux."
    }
  },
  {
    category: "site_culturel",
    title: "Palais Presidentiel et Lac aux Caïmans - Yamoussoukro",
    location: "Yamoussoukro",
    region: "Lacs",
    content: `Le Palais Presidentiel de Yamoussoukro, aussi appele Fondation Felix Houphouet-Boigny, est la residence officielle du president de la Republique. Construit dans les annees 1960-1970, ce vaste ensemble architectural s'etend sur plusieurs hectares et est entoure d'un lac artificiel peuple de crocodiles sacres. Les caïmans du lac presidentiel constituent l'une des attractions les plus insolites d'Afrique de l'Ouest. Selon la tradition Baoule, ces crocodiles sont les gardiens spirituels de la ville et du president. Chaque jour a 17h, un gardien nourrit les crocodiles avec des poulets vivants, un spectacle impressionnant qui attire de nombreux visiteurs. On estime a environ 200 le nombre de caïmans dans le lac. La Fondation Houphouet-Boigny pour la Recherche de la Paix, situee a proximite, accueille regulierement des conferences internationales. Les rues larges de Yamoussoukro, eclairees par 10 000 lampadaires, et ses grands boulevards donnent a la capitale politique un aspect unique en Afrique.`,
    tags: ["palais", "crocodiles", "politique", "Baoule", "Houphouet-Boigny"],
    practical_info: {
      horaires: "Lac aux caïmans: spectacle de nourrissage a 17h tous les jours. Palais: visite exterieure uniquement.",
      tarif: "Spectacle caïmans: 1000 FCFA. Photos supplementaires: 500 FCFA.",
      transport: "Taxis locaux depuis le centre-ville: 500-1000 FCFA.",
      meilleure_periode: "Toute l'annee.",
      duree_visite: "1h pour le lac aux caïmans, 2h avec les alentours.",
      tips: "Arrivez 30 min avant le nourrissage pour avoir une bonne place. Ne vous approchez pas trop des berges."
    }
  },

  // ============================================================
  // 3. KONG - Cite historique du Nord
  // ============================================================
  {
    category: "site_culturel",
    title: "Kong - Ancienne cite marchande islamique",
    location: "Kong",
    region: "Savanes",
    content: `Kong est une ancienne cite marchande et islamique situee dans le nord de la Cote d'Ivoire, a environ 600 km d'Abidjan. Fondee au XIe siecle par les Dioula (commercants Mandingue), Kong devint l'un des centres les plus importants du commerce transsaharien en Afrique de l'Ouest. Au XVIIe siecle, sous le regne de Sekou Ouattara, Kong etait la capitale d'un puissant royaume qui controlait les routes commerciales entre la zone forestiere au sud et le Sahel au nord. L'or, la cola, le sel, les esclaves et les tissus y etaient echanges. Kong fut egalement un centre islamique majeur, abritant des ecoles coraniques reputees qui attiraient des erudits de tout le Soudan occidental. La Grande Mosquee de Kong, construite en style soudanais avec ses murs en banco (terre crue) et ses tours coniques herissees de tirons en bois, est le monument le plus emblematique de la ville. Detruite par Samori Toure en 1897 lors de sa campagne militaire, puis reconstruite, elle est classee parmi les mosquees de style soudanais les plus remarquables d'Afrique de l'Ouest, aux cotes de celles de Djenne et Tombouctou. Aujourd'hui, Kong conserve son ambiance de cite historique avec ses ruelles etroites, ses maisons en banco, et ses artisans tisserands qui perpetuent la tradition du tissu Baoulé.`,
    tags: ["Islam", "mosquee", "commerce", "Dioula", "soudanais", "architecture"],
    practical_info: {
      horaires: "Mosquee: visite respectueuse en dehors des heures de priere. Ville accessible toute la journee.",
      tarif: "Guide local recommande: 5000-10000 FCFA. Entree mosquee: don libre.",
      transport: "Depuis Abidjan: vol interieur Abidjan-Korhogo puis taxi (80 km). Route: 8-10h en bus.",
      meilleure_periode: "Novembre a Fevrier (saison seche, moins chaud). Eviter Mars-Avril (chaleur extreme).",
      duree_visite: "Journee complete recommandee.",
      tips: "Respectez les horaires de priere. Demandez toujours la permission avant de photographier les habitants. Apportez de l'eau et un chapeau."
    }
  },

  // ============================================================
  // 4. PARC NATIONAL DE TAI
  // ============================================================
  {
    category: "site_culturel",
    title: "Parc National de Tai - Reserve de Biosphere UNESCO",
    location: "Tai",
    region: "Bas-Sassandra",
    content: `Le Parc National de Tai est la plus grande foret tropicale primaire protegee d'Afrique de l'Ouest, couvrant une superficie de 536 000 hectares (5 360 km2). Inscrit au patrimoine mondial de l'UNESCO en 1982 et classe Reserve de la Biosphere, il abrite une biodiversite exceptionnelle. On y recense plus de 1 300 especes vegetales, dont 54% sont endemiques a la region guineo-congolaise, plus de 140 especes de mammiferes, dont les celebres chimpanzes casseurs de noix (la seule population connue au monde utilisant des outils en pierre), 234 especes d'oiseaux, et plus de 700 especes d'insectes. Le parc est l'un des derniers refuges de l'hippopotame pygmee, du cercopitheque de Diane, et de l'elephant de foret. Les recherches scientifiques menees depuis les annees 1970 par des equipes internationales, notamment le Taï Chimpanzee Project fonde par Christophe Boesch en 1979, ont revolutionne notre comprehension du comportement des primates. La canopee, atteignant 50 metres de hauteur, abrite un ecosysteme complexe. Le parc offre plusieurs sentiers de randonnee, des tours d'observation, et des campements ecotouristiques. La riviere Cavally forme la frontiere occidentale du parc avec le Liberia.`,
    tags: ["nature", "UNESCO", "biodiversite", "chimpanzes", "foret", "ecotourisme"],
    practical_info: {
      horaires: "Ouvert toute l'annee. Bureau du parc: 7h-17h. Randonnees: depart 6h30.",
      tarif: "Entree: 5000 FCFA/adulte, 2000 FCFA/enfant. Guide obligatoire: 15000-25000 FCFA/jour. Campement: 10000-20000 FCFA/nuit.",
      transport: "Depuis Abidjan: route vers San Pedro puis Tai (environ 8h). 4x4 recommande pour les derniers kilometres.",
      meilleure_periode: "Decembre a Mars (saison seche). Observation des chimpanzes meilleure de Juillet a Septembre.",
      duree_visite: "Minimum 2 jours, idealement 3-4 jours pour observer la faune.",
      tips: "Reservez a l'avance aupres de l'OIPR. Portez des vetements sombres et des chaussures de randonnee. Anti-moustiques indispensable. Vaccin fievre jaune obligatoire."
    }
  },

  // ============================================================
  // 5. MAN - Region des Montagnes
  // ============================================================
  {
    category: "site_culturel",
    title: "Man et la Region des Dix-Huit Montagnes",
    location: "Man",
    region: "Montagnes",
    content: `Man est le chef-lieu de la region des Montagnes, surnommee "la ville aux 18 montagnes". Situee a 570 km d'Abidjan dans l'ouest du pays, elle offre des paysages spectaculaires de montagnes couvertes de forets denses et de lianes. Le pont de liane de Man (ou Lieupleu), suspendu au-dessus d'un ravin a plus de 30 metres, est une prouesse d'ingenierie traditionnelle Yacouba (Dan). Ces ponts, construits entierement en lianes naturelles tressees, sont encore utilises par certaines communautes et constituent une attraction touristique majeure. Le Mont Tonkpi (ou Mont Tonkoui), culminant a 1 189 metres, est le second plus haut sommet de Cote d'Ivoire. Depuis son sommet, par temps clair, on peut apercevoir les frontieres du Liberia et de la Guinee. La region abrite la danse des echassiers sacres, une tradition initiatique Yacouba ou des danseurs executes des acrobaties sur des echasses pouvant atteindre 3 metres de hauteur. Cette pratique est inscrite au patrimoine culturel immateriel. Les cascades de Man (Cascade de la Mariee) offrent un spectacle naturel impressionnant, surtout en saison des pluies. Le marche de Man est repute pour ses poteries, ses tissus traditionnels et ses masques Dan.`,
    tags: ["montagnes", "lianes", "echassiers", "Yacouba", "cascade", "nature"],
    practical_info: {
      horaires: "Pont de lianes: 8h-16h. Mont Tonkpi: randonnee depart tot le matin (6h). Cascades: accessibles toute la journee.",
      tarif: "Pont de lianes: 2000 FCFA + guide 5000 FCFA. Mont Tonkpi: guide 10000 FCFA. Spectacle echassiers: 15000-25000 FCFA (a negocier).",
      transport: "Depuis Abidjan: bus (8-9h, 8000-12000 FCFA) ou vol interieur vers Man.",
      meilleure_periode: "Novembre a Mars (routes praticables). Cascades plus spectaculaires en Juin-Septembre.",
      duree_visite: "2-3 jours pour decouvrir la region.",
      tips: "Engagez un guide local pour les ponts de lianes (obligatoire). Si sujet au vertige, le pont n'est pas recommande. Prevoyez des chaussures fermees antiderapantes."
    }
  },

  // ============================================================
  // 6. ABIDJAN - Capitale economique
  // ============================================================
  {
    category: "site_culturel",
    title: "Abidjan - La Perle des Lagunes",
    location: "Abidjan",
    region: "Lagunes",
    content: `Abidjan, surnommee "la Perle des Lagunes" ou "le Manhattan de l'Afrique", est la capitale economique de la Cote d'Ivoire et la plus grande ville d'Afrique de l'Ouest francophone avec plus de 5 millions d'habitants. La ville est construite autour de la lagune Ebrie et comprend des quartiers distincts : le Plateau (centre des affaires avec ses gratte-ciels), Cocody (quartier residentiel chic), Treichville (quartier populaire et culturel), Yopougon (le plus grand quartier populaire), et Marcory. Parmi les sites majeurs : la Cathedrale Saint-Paul (concue par l'architecte italien Aldo Spirito, 1985), le Musee des Civilisations de Cote d'Ivoire (collections ethnographiques exceptionnelles), le Plateau avec ses tours modernes dont la tour BSIC et les Twins Towers, la Pyramide du Plateau, et le marche de Treichville (le plus grand marche couvert d'Afrique de l'Ouest). Le quartier de Treichville est egalement le berceau du couper-decaler, genre musical ne dans les annees 2000. Le Parc National du Banco, situe en plein coeur d'Abidjan, est un vestige de foret tropicale de 3 474 hectares abrite des singes, des oiseaux rares et offre des sentiers de randonnee. Le Blvd de la lagune et le Pont HKB offrent des panoramas spectaculaires sur la ville et la lagune.`,
    tags: ["metropole", "lagune", "culture", "marche", "musique", "architecture"],
    practical_info: {
      horaires: "Musee des Civilisations: 9h-17h du mardi au dimanche. Parc du Banco: 8h-17h30.",
      tarif: "Musee: 1000 FCFA. Parc du Banco: 200 FCFA entree, guide 5000 FCFA.",
      transport: "Metro d'Abidjan (Ligne 1 en cours). Taxis compteurs: 200 FCFA/km. VTC (Yango, Uber): disponibles.",
      meilleure_periode: "Decembre a Mars. Eviter Juin (grandes pluies, inondations possibles).",
      duree_visite: "3-5 jours minimum pour decouvrir les quartiers principaux.",
      tips: "Evitez les embouteillages aux heures de pointe (7h-9h, 17h-20h). Treichville le soir pour les maquis et la musique live."
    }
  },

  // ============================================================
  // 7. GASTRONOMIE IVOIRIENNE
  // ============================================================
  {
    category: "gastronomie",
    title: "Gastronomie Ivoirienne - Les plats incontournables",
    location: "National",
    region: "National",
    content: `La cuisine ivoirienne est l'une des plus riches et variees d'Afrique de l'Ouest. Le plat national est l'Attieke, une semoule de manioc fermentee accompagnee de poisson braise (generalement du thon, de la dorade ou du maquereau) et d'une sauce pimentee. L'Alloco, des bananes plantain frites servies avec du piment et parfois des oeufs, est un snack populaire dans tout le pays. Le Foutou (ou fufu), pate a base de banane plantain et de manioc pilee, se mange avec differentes sauces: sauce graine (a base de noix de palme), sauce arachide, sauce claire au poisson. Le Kedjenou est un ragout de poulet ou de pintade mijote lentement dans une canari (marmite en terre cuite) avec des legumes, sans ajout d'eau, specialite Baoule. Le Garba est un plat populaire compose d'attieke grossier et de thon frit, vendu dans des "garbadromes" a travers le pays. Le Placali est une pate de manioc fermentee plus souple que le foutou. La sauce Kopé (aubergines ecrasees) et la sauce N'Tro (escargots) sont des accompagnements traditionnels. Cote boissons: le Bangui (vin de palme frais), le Koutoukou (alcool de palme distille), et le Bissap (jus d'hibiscus). Les maquis (restaurants populaires en plein air) sont l'ame de la gastronomie ivoirienne, offrant une cuisine authentique dans une ambiance conviviale.`,
    tags: ["gastronomie", "attieke", "foutou", "kedjenou", "maquis", "cuisine"],
    practical_info: {
      horaires: "Maquis ouverts generalement de 11h a 23h. Garbadromes ouverts des 8h.",
      tarif: "Repas dans un maquis: 1500-5000 FCFA. Garba: 500-1500 FCFA. Restaurant: 5000-25000 FCFA.",
      transport: null,
      meilleure_periode: "Toute l'annee. Saison des mangues: Mars-Juin.",
      duree_visite: null,
      tips: "Demandez 'pas trop pimente' si vous n'etes pas habitue. Le poisson braise est meilleur en bord de lagune. Essayez le Bangui frais dans les villages."
    }
  },

  // ============================================================
  // 8. ARTISANAT ET CULTURES
  // ============================================================
  {
    category: "artisanat",
    title: "L'Artisanat Ivoirien - Masques, Tissus et Sculptures",
    location: "National",
    region: "National",
    content: `La Cote d'Ivoire possede un patrimoine artisanal d'une richesse exceptionnelle, refletant la diversite de ses plus de 60 ethnies. Les Masques: Les masques sacres sont au coeur des ceremonies traditionnelles. Les masques Dan (region de Man) aux traits epures et au front bombe sont parmi les plus celebres d'Afrique. Les masques Senoufo (region de Korhogo) se distinguent par leurs formes geometriques complexes et leurs coiffes elaborees. Les masques Gouro sont reputes pour leur finesse et leur elegance. Les masques Baoule, souvent polychromes, representent des ideaux de beaute. Le Tissu: Le pagne Baoule, tisse sur des metiers a tisser traditionnels a quatre lisses, est celebre pour ses motifs geometriques en bandes colorees. Le Kita, pagne des Senoufo, est un tissu teint a l'indigo avec des motifs symboliques. A Korhogo, le tissu peint (toiles de Fakaha) reproduit des scenes de la vie quotidienne et des animaux symboliques en noir sur fond ecru. La Sculpture: Les statuettes Baoule (statues "Blolo Bian" et "Blolo Bla") representent les epoux spirituels et sont d'une grande finesse. Les portes sculptees Senoufo et les sièges traditionnels Ashanti sont d'autres pieces maitresses. L'Orfevrerie: Le travail de l'or est une tradition ancestrale chez les peuples Akan (Baoule, Agni). Les poids a peser l'or, miniatures en bronze realisees a la cire perdue, sont de veritables oeuvres d'art.`,
    tags: ["artisanat", "masques", "tissu", "sculpture", "Baoule", "Senoufo", "Dan"],
    practical_info: {
      horaires: "Marches artisanaux: 8h-18h. Village Artisanal d'Abidjan: 8h-19h.",
      tarif: "Masque decoratif: 5000-50000 FCFA. Pagne Baoule: 15000-100000 FCFA. Toile de Korhogo: 10000-75000 FCFA.",
      transport: null,
      meilleure_periode: "Toute l'annee. Periodes de fetes pour les ceremonies de masques (Decembre-Janvier).",
      duree_visite: null,
      tips: "Au Village Artisanal d'Abidjan, vous pouvez voir les artisans travailler. Negociez toujours les prix (divisez par 2-3 le prix initial). Demandez un certificat d'authenticite pour les pieces de valeur."
    }
  },

  // ============================================================
  // 9. FESTIVALS ET EVENEMENTS
  // ============================================================
  {
    category: "festival",
    title: "Festivals et Evenements Culturels en Cote d'Ivoire",
    location: "National",
    region: "National",
    content: `La Cote d'Ivoire celebre de nombreux festivals qui mettent en valeur sa diversite culturelle. Le FEMUA (Festival des Musiques Urbaines d'Anoumabo), cree par le groupe Magic System en 2008, est le plus grand festival de musique urbaine d'Afrique de l'Ouest. Il se tient a Abidjan (Marcory) en Avril et attire plus de 500 000 spectateurs sur 8 jours. L'Abissa, fete traditionnelle du peuple N'Zima de Grand-Bassam, a lieu chaque annee fin Octobre-debut Novembre pendant une semaine. C'est une periode de reconciliation et de purification ou la communaute regle ses conflits, danse et celebre. Le Poro, ceremonial initiatique sacre des Senoufo du nord, marque le passage a l'age adulte pour les jeunes hommes. Bien que ses aspects les plus sacres soient interdits aux non-inities, certaines danses publiques sont accessibles. Le Festival des Masques de Man rassemble chaque Novembre les meilleurs danseurs de masques Yacouba/Dan dans des competitions spectaculaires d'equilibre et d'acrobaties sur echasses. Le Bouake Carnaval est l'un des plus anciens carnavals d'Afrique, avec des chars decores et des defiles colores. Le MASA (Marche des Arts du Spectacle Africain) a Abidjan, biennale, est le plus grand marche professionnel des arts du spectacle du continent.`,
    tags: ["festival", "FEMUA", "Abissa", "Poro", "masques", "musique", "carnaval"],
    practical_info: {
      horaires: "FEMUA: Avril (8 jours). Abissa: Octobre-Novembre. Festival des Masques: Novembre. MASA: Mars (biennale).",
      tarif: "FEMUA: gratuit pour certains concerts, VIP 10000-50000 FCFA. Abissa: gratuit. Festival des Masques: 2000-5000 FCFA.",
      transport: "Pendant les festivals, des navettes speciales sont souvent organisees.",
      meilleure_periode: "Selon le festival. Consultez les dates exactes chaque annee.",
      duree_visite: null,
      tips: "Reservez votre hebergement a l'avance pendant le FEMUA. Pour l'Abissa, arrivez des le premier jour pour comprendre les rituels. Respectez les interdits lies aux masques sacres."
    }
  },

  // ============================================================
  // 10. HEBERGEMENT ET BUDGET
  // ============================================================
  {
    category: "pratique",
    title: "Hebergement et Budget de Voyage en Cote d'Ivoire",
    location: "National",
    region: "National",
    content: `Le cout de la vie en Cote d'Ivoire est modere compare a l'Europe mais parmi les plus eleves d'Afrique de l'Ouest. Budget quotidien estime par categorie de voyageur: Budget (routard): 15000-30000 FCFA/jour (25-50 EUR). Hebergement en auberge ou petit hotel (5000-15000 FCFA/nuit). Repas dans les maquis (1500-3000 FCFA). Transport en gbaka/bus (200-1000 FCFA). Milieu de gamme: 40000-80000 FCFA/jour (65-130 EUR). Hotel 2-3 etoiles (20000-40000 FCFA/nuit). Restaurants (5000-10000 FCFA). Taxis et visites guidees. Confort: 80000-200000 FCFA+/jour (130-330+ EUR). Hotels 4-5 etoiles (50000-150000 FCFA/nuit). Restaurants gastronomiques. Voiture avec chauffeur. Hebergement: Abidjan offre le plus large choix, du Sofitel Hotel Ivoire (5 etoiles) aux guesthouses. A Yamoussoukro: President Hotel, Hotel des Parlementaires. A Grand-Bassam: hotels de plage (Boblin Beach, Assoyam Beach). En brousse: campements villageois (5000-10000 FCFA). Monnaie: le Franc CFA (XOF), partagé avec 7 autres pays d'Afrique de l'Ouest. 1 EUR = environ 656 FCFA. Les cartes bancaires sont acceptees dans les grands hotels et restaurants a Abidjan mais le cash reste roi partout ailleurs. Distributeurs Orange Money et MTN Money disponibles partout.`,
    tags: ["budget", "hebergement", "hotel", "argent", "monnaie", "pratique"],
    practical_info: {
      horaires: null,
      tarif: null,
      transport: "Budget transport journalier: 2000-15000 FCFA selon les moyens utilises.",
      meilleure_periode: null,
      duree_visite: null,
      tips: "Ayez toujours du cash en FCFA. Orange Money est tres utile. Negociez les prix des hotels en basse saison. Les maquis offrent le meilleur rapport qualite-prix pour manger."
    }
  },

  // ============================================================
  // 11. TRANSPORT ET DEPLACEMENT
  // ============================================================
  {
    category: "pratique",
    title: "Se deplacer en Cote d'Ivoire - Guide des Transports",
    location: "National",
    region: "National",
    content: `Avion: Air Cote d'Ivoire dessert les villes principales (Bouake, Man, Korhogo, San Pedro, Odienne). Aeroport international Felix Houphouet-Boigny a Abidjan (ABJ). Bus interurbains: UTB (Union des Transporteurs de Bouake) et plusieurs compagnies privees relient Abidjan aux grandes villes. Bus climatises confortables. Gare routiere principale: Adjame (Abidjan). Prix indicatifs depuis Abidjan: Yamoussoukro 4000-6000 FCFA, Bouake 5000-7000 FCFA, Man 8000-12000 FCFA, Korhogo 10000-15000 FCFA. Gbakas: minibus locaux pour les trajets courts et moyens. Economiques mais peu confortables. Taxis: Taxis compteurs a Abidjan (orange, rouges). Negociez le prix avant de monter pour les autres villes. VTC a Abidjan: Yango (principale plateforme). Taxis intercommunaux: woros-woros. Train: La ligne Abidjan-Ouagadougou (Sitarail) traverse le pays du sud au nord, desservant Bouake, Ferkessedougou. Voyage lent mais pittoresque (environ 12h Abidjan-Bouake). Location de voiture: disponible a Abidjan (ADA, Europcar). 4x4 recommande pour les zones rurales. Permis international necessaire. Routes principales en bon etat, pistes secondaires variables. Autoroute du Nord: Abidjan-Yamoussoukro (bonne qualite, peage 3500 FCFA).`,
    tags: ["transport", "avion", "bus", "taxi", "train", "deplacement", "route"],
    practical_info: null
  },

  // ============================================================
  // 12. SECURITE ET SANTE
  // ============================================================
  {
    category: "pratique",
    title: "Securite et Sante pour le Voyage en Cote d'Ivoire",
    location: "National",
    region: "National",
    content: `Sante: Le vaccin contre la fievre jaune est obligatoire pour entrer en Cote d'Ivoire. Vaccins recommandes: hepatites A et B, typhoide, meningite. Traitement antipaludeen fortement recommande (le paludisme est present dans tout le pays). Utilisez un repulsif anti-moustiques et dormez sous moustiquaire impregnee. L'eau du robinet n'est pas potable: achetez de l'eau en bouteille (Pure Water en sachet: 25-50 FCFA, bouteille: 300-500 FCFA). Hopitaux recommandes a Abidjan: Polyclinique Sainte Anne-Marie, Pisam. Pharmacies ouvertes 24h/24 dans les grandes villes. Securite: La Cote d'Ivoire est globalement sure pour les touristes, surtout dans les zones touristiques classiques. Abidjan est une grande ville africaine: vigilance normale contre les pickpockets dans les zones bondees (marches, transports). Evitez de montrer des objets de valeur. La zone frontaliere nord-est avec le Burkina Faso est deconseilee en raison de risques securitaires. Utilisez les taxis officiels ou les VTC la nuit a Abidjan. Numeros utiles: Police 111, Pompiers 180, SAMU 185. Formalites: Visa obligatoire pour la plupart des nationalites (e-visa disponible sur snedai.com). Passeport valide 6 mois minimum.`,
    tags: ["sante", "securite", "visa", "vaccin", "paludisme", "urgence", "pratique"],
    practical_info: null
  },

  // ============================================================
  // 13. KORHOGO ET CULTURE SENOUFO
  // ============================================================
  {
    category: "site_culturel",
    title: "Korhogo et la Culture Senoufo",
    location: "Korhogo",
    region: "Savanes",
    content: `Korhogo est la capitale du pays Senoufo dans le nord de la Cote d'Ivoire. Cette ville de plus de 300 000 habitants est un centre culturel majeur ou les traditions ancestrales restent vivantes. Le bois sacre de Korhogo est un lieu initiatique ou se deroule le Poro, ceremonie qui dure 7 ans et marque le passage a l'age adulte des jeunes hommes Senoufo. Bien que l'acces au bois sacre soit restreint, certaines danses rituelles sont presentees aux visiteurs. Le village de Fakaha, a 20 km de Korhogo, est celebre pour ses toiles peintes traditionnelles: les artisans Senoufo peignent sur du coton des scenes de la vie quotidienne, des animaux et des symboles mythologiques en utilisant des teintures naturelles. Ces toiles sont devenues un art reconnu internationalement. Le marche de Korhogo est l'un des plus animes du nord, avec ses sections de tissus, poteries, vanneries et produits agricoles. Les forgerons Senoufo perpetuent la tradition de la metallurgie du fer, fabriquant des outils agricoles, des sculptures en fer forge et des masques en metal. La danse du Boloy (danse des pantheres) et le N'Goron (danse acrobatique des jeunes filles) sont des spectacles culturels impressionnants. Le Mont Korhogo offre un panorama sur toute la region des savanes.`,
    tags: ["Senoufo", "Poro", "Fakaha", "toiles", "forge", "danse", "traditions"],
    practical_info: {
      horaires: "Village de Fakaha: 8h-17h. Marche de Korhogo: tous les jours, plus anime le samedi.",
      tarif: "Visite Fakaha: 5000 FCFA + guide. Toile peinte: 5000-50000 FCFA selon taille. Spectacle danse: 20000-50000 FCFA (groupe).",
      transport: "Depuis Abidjan: vol Air Cote d'Ivoire (1h) ou bus (10h, 10000-15000 FCFA).",
      meilleure_periode: "Novembre a Fevrier. Ceremonies Poro: variable selon les villages.",
      duree_visite: "2-3 jours pour Korhogo et environs.",
      tips: "Un guide local est indispensable pour visiter les villages Senoufo. Demandez toujours l'autorisation du chef de village. Les toiles de Fakaha font d'excellents souvenirs authentiques."
    }
  },

  // ============================================================
  // 14. BOUAKE
  // ============================================================
  {
    category: "site_culturel",
    title: "Bouake - Deuxieme ville et carrefour culturel",
    location: "Bouake",
    region: "Vallee-du-Bandama",
    content: `Bouake est la deuxieme ville de Cote d'Ivoire avec environ 800 000 habitants. Situee au centre du pays a 350 km d'Abidjan, elle est un carrefour commercial et culturel entre le nord et le sud. Fondee comme camp militaire francais en 1898, Bouake devint rapidement un centre commercial important grace a sa position strategique sur la route nord-sud et la ligne de chemin de fer Abidjan-Ouagadougou. La ville est connue pour son carnaval, l'un des plus anciens d'Afrique, avec ses chars decores, ses masques et ses costumes colores. Le marche central de Bouake est le plus important du centre du pays, renomme pour ses textiles, ses pagnes et sa kola. La cathedrale de Bouake, construite en 1950, est un exemple d'architecture religieuse coloniale. Le quartier du Commerce conserve quelques beaux batiments de l'epoque coloniale. Bouake est egalement un centre Baoule important, et les villages environnants perpetuent les traditions de tissage du pagne Baoule et de sculpture sur bois. Le stade de la Paix, renove, accueille des evenements sportifs et culturels majeurs. Les environs de Bouake offrent des paysages de savane et plusieurs villages traditionnels Baoule.`,
    tags: ["Bouake", "carnaval", "commerce", "Baoule", "centre", "textile"],
    practical_info: {
      horaires: "Marche central: 7h-18h tous les jours. Cathedrale: 7h-18h.",
      tarif: "Carnaval (Mars): gratuit pour les defiles publics.",
      transport: "Depuis Abidjan: autoroute (350 km, 4h). Bus UTB: 5000-7000 FCFA. Train Sitarail: 3500-6000 FCFA.",
      meilleure_periode: "Mars pour le Carnaval. Novembre-Fevrier pour le climat.",
      duree_visite: "1-2 jours.",
      tips: "Bouake est un bon point de base pour explorer le centre du pays. Le marche est ideal pour acheter des pagnes Baoule authentiques."
    }
  },

  // ============================================================
  // 15. LANGUES LOCALES
  // ============================================================
  {
    category: "culture",
    title: "Langues et Expressions Utiles en Cote d'Ivoire",
    location: "National",
    region: "National",
    content: `La Cote d'Ivoire compte plus de 60 langues locales reparties en 4 grands groupes linguistiques: Mande (nord-ouest: Dioula, Malinke), Voltaique (nord-est: Senoufo, Lobi), Krou (sud-ouest: Bete, Dida), et Akan (centre-sud: Baoule, Agni). Le francais est la langue officielle, parlee par environ 70% de la population. Le Nouchi, argot ivoirien melant francais et langues locales, est tres repandu, surtout chez les jeunes. Expressions Dioula essentielles: I ni sogoma (Bonjour le matin), I ni tile (Bonjour l'apres-midi), I ni wula (Bonsoir), I ni ce (Merci), N'ba (Maman/Madame respectueux), N'fa (Papa/Monsieur respectueux), Aw ni ce (Merci a tous), Hera sira (Bon voyage), Ka kene (Comment ca va?), Seko te (Pas de probleme). Expressions Baoule: Afwe (Bonjour), Mo (Merci), Klwa (Au revoir), Edi (Oui), Aha (Non). Expressions Bete: Guezéh (Bonjour), Kah (Merci). Le Nouchi courant: Garba (plat d'attieke/thon), Gbê (force/courage), Djobi (chercher), Enjailler (s'amuser), C'est djeh (c'est bien/cool), On dit quoi? (Comment ca va?), Yako (desolee/pardon - utilise partout).`,
    tags: ["langues", "Dioula", "Baoule", "Bete", "Nouchi", "expressions", "francais"],
    practical_info: null
  },

  // ============================================================
  // 16. CLIMAT ET METEO
  // ============================================================
  {
    category: "pratique",
    title: "Climat et Meilleure Periode pour Visiter la Cote d'Ivoire",
    location: "National",
    region: "National",
    content: `La Cote d'Ivoire a un climat tropical avec des variations nord-sud. Zone Sud (Abidjan, Grand-Bassam, San Pedro): Climat equatorial humide. 4 saisons: Grande saison seche (Decembre-Mars) - periode ideale, ensoleille, 28-33C. Grande saison des pluies (Avril-Juillet) - averses violentes mais courtes, vegetation luxuriante. Petite saison seche (Aout-Septembre) - temperatures agreables, moins de touristes. Petite saison des pluies (Octobre-Novembre) - pluies moderees. Zone Centre (Yamoussoukro, Bouake): Climat tropical de transition. Saison seche (Novembre-Mars) plus marquee. Temperatures 25-35C. Harmattan (vent sec du Sahara) en Decembre-Janvier. Zone Nord (Korhogo, Kong): Climat tropical sec. Deux saisons: seche (Novembre-Mai) et humide (Juin-Octobre). Temperatures pouvant depasser 40C en Mars-Avril. Nuits fraiches en Decembre-Janvier (18-22C) dues a l'Harmattan. Meilleure periode globale: Novembre a Mars (saison seche dans tout le pays). Decembre-Fevrier est ideal pour le nord. Pour le sud, la petite saison seche (Aout-Septembre) est aussi agreable. Humidite moyenne: 70-80% au sud, 40-60% au nord en saison seche. Precipitation annuelle: 1400-2400mm au sud, 1000-1400mm au nord.`,
    tags: ["climat", "meteo", "saison", "temperature", "pluie", "harmattan"],
    practical_info: null
  },

  // ============================================================
  // 17. SAN PEDRO ET COTE OUEST
  // ============================================================
  {
    category: "site_culturel",
    title: "San Pedro et la Cote Ouest - Plages et Nature",
    location: "San Pedro",
    region: "Bas-Sassandra",
    content: `San Pedro est le deuxieme port de Cote d'Ivoire et la porte d'entree vers l'ouest sauvage du pays. La ville offre de magnifiques plages de sable fin encore peu frequentees, un contraste saisissant avec les plages bondees du sud-est. La plage de Monogaga, a 30 km au nord de San Pedro, est consideree comme l'une des plus belles d'Afrique de l'Ouest: une longue bande de sable dore bordee de cocotiers et de foret tropicale, avec des eaux turquoise et calmes. Le Parc National de Tai est accessible depuis San Pedro (3-4h de route). Les iles de l'archipel de Sassandra offrent des excursions en pirogue dans un cadre paradisiaque. Sassandra, ancienne ville coloniale a 80 km a l'est de San Pedro, conserve les ruines d'un fort francais du XVIIIe siecle et offre une ambiance de petit port de peche authentique. Le marche aux poissons de San Pedro est spectaculaire le matin, avec l'arrivee des pirogues chargees de thon, merou et crevettes. La region est aussi le coeur de la production cacaoyere ivoirienne (la Cote d'Ivoire est le premier producteur mondial de cacao).`,
    tags: ["plage", "San Pedro", "Monogaga", "Sassandra", "cacao", "port", "nature"],
    practical_info: {
      horaires: "Plage de Monogaga: accessible toute la journee. Marche aux poissons: 6h-9h.",
      tarif: "Excursion iles Sassandra: 15000-30000 FCFA/personne. Pirogue peche: 5000-10000 FCFA.",
      transport: "Depuis Abidjan: bus (7h, 7000-10000 FCFA) ou vol Air Cote d'Ivoire.",
      meilleure_periode: "Decembre a Mars. Eaux plus calmes en Janvier-Fevrier.",
      duree_visite: "2-3 jours minimum.",
      tips: "Louez une pirogue a Sassandra pour decouvrir les criques isolees. Le poisson frais grille sur la plage est une experience a ne pas manquer."
    }
  },

  // ============================================================
  // 18. ITINERAIRES SUGGERES
  // ============================================================
  {
    category: "itineraire",
    title: "Itineraires Touristiques Recommandes en Cote d'Ivoire",
    location: "National",
    region: "National",
    content: `Itineraire 1 - Decouverte Express (5 jours, Budget: 250000-500000 FCFA): Jour 1-2: Abidjan (Plateau, Treichville, Musee des Civilisations, Parc du Banco). Jour 3: Grand-Bassam (patrimoine UNESCO, plage, musee du Costume). Jour 4: Yamoussoukro (Basilique, lac aux caïmans). Jour 5: Retour Abidjan via Bouake. Itineraire 2 - Grand Tour Cultural (10 jours, Budget: 500000-1200000 FCFA): Jour 1-2: Abidjan. Jour 3: Grand-Bassam. Jour 4-5: Yamoussoukro et environs. Jour 6: Bouake et villages Baoule. Jour 7-8: Korhogo et Fakaha (culture Senoufo). Jour 9: Kong (mosquee, cite historique). Jour 10: Vol retour Korhogo-Abidjan. Itineraire 3 - Nature et Aventure (7 jours, Budget: 400000-900000 FCFA): Jour 1: Abidjan. Jour 2-3: San Pedro et plage Monogaga. Jour 4-5: Parc National de Tai (foret primaire, chimpanzes). Jour 6-7: Man (pont de lianes, Mont Tonkpi, echassiers). Retour Abidjan. Itineraire 4 - Immersion Culturelle Nord (7 jours): Jour 1: Abidjan-Yamoussoukro. Jour 2: Yamoussoukro-Bouake. Jour 3-4: Korhogo (Senoufo, Fakaha). Jour 5: Kong. Jour 6: Odienne (culture Malinke). Jour 7: Retour Abidjan par vol.`,
    tags: ["itineraire", "circuit", "planification", "budget", "voyage", "tour"],
    practical_info: null
  }
];

async function seed() {
  const client = new MongoClient(connectionString);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("culturechain");

    // Drop and recreate collection
    const collections = await db.listCollections({ name: "knowledge_base" }).toArray();
    if (collections.length > 0) {
      await db.dropCollection("knowledge_base");
      console.log("Dropped old knowledge_base collection");
    }

    // Insert all documents
    const result = await db.collection("knowledge_base").insertMany(
      knowledgeBase.map((doc) => ({
        ...doc,
        searchText: [doc.title, doc.content, ...(doc.tags || [])].join(" ").toLowerCase(),
        createdAt: new Date(),
      }))
    );
    console.log("Inserted " + result.insertedCount + " knowledge base documents");

    // Create text index for search
    await db.collection("knowledge_base").createIndex(
      { title: "text", content: "text", tags: "text", category: "text", location: "text" },
      { weights: { title: 10, tags: 5, location: 5, category: 3, content: 1 }, name: "knowledge_text_search" }
    );
    console.log("Created text search index");

    console.log("Knowledge base seeded successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
  }
}

seed();
