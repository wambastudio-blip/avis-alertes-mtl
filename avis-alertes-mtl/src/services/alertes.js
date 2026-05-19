const MOCK = [
  {
    id: "1",
    titre: "Avis d'ébullition d'eau — Ahuntsic",
    arrondissement: "Ahuntsic-Cartierville",
    sujet: "Eau",
    dateEmission: "2026-04-01",
    heure: "14:30",
    resume: "Un avis d'ébullition est en vigueur dans le secteur nord.",
    description: "Suite à une détection de bactéries dans le réseau d'aqueduc, les résidents du secteur nord d'Ahuntsic-Cartierville doivent faire bouillir l'eau avant de la consommer. Cet avis restera en vigueur jusqu'à nouvel ordre."
  },
  {
    id: "2",
    titre: "Fermeture de piscine — Plateau",
    arrondissement: "Le Plateau-Mont-Royal",
    sujet: "Loisirs",
    dateEmission: "2026-04-03",
    heure: "10:00",
    resume: "La piscine du Parc Laurier est fermée pour maintenance.",
    description: "La piscine du Parc Laurier sera fermée du 3 au 10 avril 2026 pour des travaux de maintenance sur le système de filtration. Nous nous excusons pour les inconvénients."
  },
  {
    id: "3",
    titre: "Travaux rue Sherbrooke — Plateau",
    arrondissement: "Le Plateau-Mont-Royal",
    sujet: "Travaux",
    dateEmission: "2026-04-05",
    heure: "09:00",
    resume: "Des travaux d'aqueduc auront lieu sur la rue Sherbrooke Est.",
    description: "Des travaux majeurs d'aqueduc seront effectués sur la rue Sherbrooke Est entre Saint-Denis et Papineau du 5 au 25 avril. La circulation sera réduite à une voie."
  },
  {
    id: "4",
    titre: "Collecte de déchets modifiée — Rosemont",
    arrondissement: "Rosemont-La Petite-Patrie",
    sujet: "Collecte",
    dateEmission: "2026-04-06",
    heure: "08:00",
    resume: "La collecte des ordures est décalée d'un jour cette semaine.",
    description: "En raison du congé férié, la collecte des ordures et du recyclage dans Rosemont-La Petite-Patrie sera décalée d'une journée pour la semaine du 6 avril 2026."
  },
  {
    id: "5",
    titre: "Fermeture du parc — Verdun",
    arrondissement: "Verdun",
    sujet: "Loisirs",
    dateEmission: "2026-04-07",
    heure: "12:00",
    resume: "Le parc Arthur-Therrien est fermé temporairement.",
    description: "Le parc Arthur-Therrien est fermé temporairement en raison de travaux d'aménagement paysager. La réouverture est prévue pour le 20 avril 2026."
  },
  {
    id: "6",
    titre: "Avis d'ébullition levé — Ahuntsic",
    arrondissement: "Ahuntsic-Cartierville",
    sujet: "Eau",
    dateEmission: "2026-04-08",
    resume: "L'avis d'ébullition du secteur nord est maintenant levé.",
    description: "Suite aux analyses confirmant la qualité de l'eau, l'avis d'ébullition en vigueur dans le secteur nord d'Ahuntsic-Cartierville est officiellement levé. L'eau du robinet est à nouveau potable."
  },
  {
    id: "7",
    titre: "Travaux égouts — Verdun",
    arrondissement: "Verdun",
    sujet: "Travaux",
    dateEmission: "2026-04-09",
    heure: "29:00",
    resume: "Des travaux de réfection des égouts auront lieu boulevard LaSalle.",
    description: "Des travaux de réfection du réseau d'égouts seront effectués sur le boulevard LaSalle entre les rues de l'Église et Willibrord du 9 au 30 avril 2026."
  },
  {
    id: "8",
    titre: "Nouveau centre communautaire — Rosemont",
    arrondissement: "Rosemont-La Petite-Patrie",
    sujet: "Loisirs",
    dateEmission: "2026-04-10",
    heure: "14:30",
    resume: "Ouverture d'un nouveau centre communautaire dans Rosemont.",
    description: "La Ville de Montréal est fière d'annoncer l'ouverture du nouveau centre communautaire de Rosemont situé au 4000 rue Beaubien Est. Les inscriptions aux activités sont ouvertes dès maintenant."
  },
  {
    id: "9",
    titre: "Contamination eau — Villeray",
    arrondissement: "Villeray-Saint-Michel-Parc-Extension",
    sujet: "Eau",
    dateEmission: "2026-04-11",
    heure: "19:10",
    resume: "Un avis de non-consommation est émis pour le secteur Villeray.",
    description: "Suite à une rupture de conduite, un avis de non-consommation d'eau est émis pour le secteur Villeray. Les résidents ne doivent pas utiliser l'eau du robinet jusqu'à nouvel ordre."
  },
  {
    id: "10",
    titre: "Travaux pont — Verdun",
    arrondissement: "Verdun",
    sujet: "Travaux",
    dateEmission: "2026-04-12",
    heure: "10:40",
    resume: "Le pont Jolicoeur sera partiellement fermé pour inspection.",
    description: "Des travaux d'inspection et de réparation nécessiteront la fermeture partielle du pont Jolicoeur les fins de semaine du 12 au 26 avril 2026. Des voies de détour seront indiquées."
  },
  {
    id: "11",
    titre: "Fermeture bibliothèque — Plateau",
    arrondissement: "Le Plateau-Mont-Royal",
    sujet: "Loisirs",
    dateEmission: "2026-04-13",
    heure: "15:30",
    resume: "La bibliothèque Plateau-Mont-Royal est fermée pour rénovations.",
    description: "La bibliothèque Plateau-Mont-Royal sera fermée du 13 au 27 avril pour des travaux de rénovation de la toiture. Les usagers peuvent fréquenter la bibliothèque centrale durant cette période."
  },
  {
    id: "12",
    titre: "Travaux pavage — Rosemont",
    arrondissement: "Rosemont-La Petite-Patrie",
    sujet: "Travaux",
    dateEmission: "2026-04-14",
    heure: "22:00",
    resume: "Des travaux de pavage auront lieu sur la rue Masson.",
    description: "La rue Masson entre les avenues Christophe-Colomb et de Lorimier sera refaite du 14 au 28 avril 2026. Stationnement interdit dans ce secteur durant les travaux."
  },
  {
    id: "13",
    titre: "Avis qualité eau — Villeray",
    arrondissement: "Villeray-Saint-Michel-Parc-Extension",
    sujet: "Eau",
    dateEmission: "2026-04-15",
    heure: "16:00",
    resume: "L'eau du robinet dans Villeray est à nouveau potable.",
    description: "Les analyses confirment que l'eau est à nouveau sécuritaire dans le secteur Villeray. L'avis de non-consommation émis le 11 avril est officiellement levé."
  },
  {
    id: "14",
    titre: "Collecte feuilles mortes — Ahuntsic",
    arrondissement: "Ahuntsic-Cartierville",
    sujet: "Collecte",
    dateEmission: "2026-04-16",
    heure: "06:00",
    resume: "La collecte des feuilles mortes débute le 20 avril.",
    description: "La collecte des feuilles mortes et des résidus verts débutera le 20 avril dans Ahuntsic-Cartierville. Les résidents sont priés de déposer leurs sacs biodégradables en bordure de rue."
  },
  {
    id: "15",
    titre: "Travaux aqueduc — Villeray",
    arrondissement: "Villeray-Saint-Michel-Parc-Extension",
    sujet: "Travaux",
    dateEmission: "2026-04-17",
    heure: "11:50",
    resume: "Remplacement de conduites d'aqueduc rue Jarry.",
    description: "Des travaux de remplacement des conduites d'aqueduc seront effectués rue Jarry Est entre Saint-Michel et Pie-IX du 17 avril au 15 mai 2026. Circulation locale seulement."
  },
  {
    id: "16",
    titre: "Festival de quartier — Rosemont",
    arrondissement: "Rosemont-La Petite-Patrie",
    sujet: "Loisirs",
    dateEmission: "2026-04-18",
    heure: "13:30",
    resume: "Le festival de quartier de Rosemont aura lieu le 25 avril.",
    description: "La Ville annonce la tenue du festival de quartier de Rosemont le 25 avril 2026 sur la rue Masson. Musique, nourriture et activités pour toute la famille. Entrée gratuite."
  },
  {
    id: "17",
    titre: "Fermeture patinoire — Verdun",
    arrondissement: "Verdun",
    sujet: "Loisirs",
    dateEmission: "2026-04-19",
    heure: "14:30",
    resume: "La patinoire extérieure de Verdun ferme pour la saison.",
    description: "La patinoire extérieure du parc de Verdun est officiellement fermée pour la saison estivale. Elle rouvrira en décembre 2026 selon les conditions météorologiques."
  },
  {
    id: "18",
    titre: "Travaux signalisation — Plateau",
    arrondissement: "Le Plateau-Mont-Royal",
    sujet: "Travaux",
    dateEmission: "2026-04-20",
    heure: "10:00",
    resume: "Remplacement des feux de circulation avenue du Mont-Royal.",
    description: "Les feux de circulation sur l'avenue du Mont-Royal entre Saint-Laurent et Saint-Denis seront remplacés du 20 au 22 avril. Des agents de circulation seront présents aux intersections."
  },
  {
    id: "19",
    titre: "Collecte encombrants — Villeray",
    arrondissement: "Villeray-Saint-Michel-Parc-Extension",
    sujet: "Collecte",
    dateEmission: "2026-04-21",
    heure: "09:00",
    resume: "Collecte des encombrants prévue le 28 avril dans Villeray.",
    description: "La collecte des encombrants aura lieu le 28 avril 2026 dans le secteur Villeray. Les résidents peuvent déposer leurs gros articles (meubles, électroménagers) en bordure de rue la veille au soir."
  },
  {
    id: "20",
    titre: "Avis chaleur extrême — Ahuntsic",
    arrondissement: "Ahuntsic-Cartierville",
    sujet: "Santé",
    dateEmission: "2026-04-22",
    heure: "14:30",
    resume: "Un avis de chaleur extrême est émis pour les prochains jours.",
    description: "Environnement Canada prévoit des températures dépassant 35°C les 23 et 24 avril. La Ville invite les résidents vulnérables à se rendre dans les refuges climatisés disponibles dans les bibliothèques et centres communautaires."
  }
];

export async function getAlertes() {
  await new Promise(r => setTimeout(r, 300));
  return MOCK;
}

export async function getAlerteById(id) {
  const alertes = await getAlertes();
  return alertes.find(a => a.id === id);
}