# Avis et alertes — Ville de Montréal (TP2)

Application React connectée à l'API de données ouvertes de la Ville de Montréal, transformée en PWA installable et fonctionnelle hors connexion.

---

## Installation et démarrage

```bash
npm install
npm run dev
```

Pour tester la PWA (service worker actif) :

```bash
npm run build
npm run preview
```

---

## Source de données

L'application utilise l'API du portail de données ouvertes de la Ville de Montréal.

On essaie d'abord le GeoJSON, et si ça échoue on tombe sur le CKAN datastore en fallback. Si les deux sont inaccessibles, on retourne le cache `localStorage`.

**GeoJSON (source principale) :**
```
https://donnees.montreal.ca/dataset/.../download/avis-alertes.geojson
```

**CKAN datastore (fallback) :**
```
https://donnees.montreal.ca/api/3/action/datastore_search
  ?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336&limit=500
```

### Normalisation des données

Les champs de l'API ne correspondent pas au modèle utilisé dans le TP1. J'ai donc créé une fonction `normaliserAlerte()` dans `src/services/alertes.js` qui convertit la réponse brute vers le modèle interne. Ça permet de changer la source de données au TP3 sans toucher aux composants.

| Champ interne    | Source API                        |
|------------------|-----------------------------------|
| `id`             | `_id`                             |
| `titre`          | `titre`                           |
| `arrondissement` | extrait du titre (regex)          |
| `sujet`          | `type`                            |
| `dateEmission`   | `date_debut` (extrait YYYY-MM-DD) |
| `heure`          | `date_debut` (extrait HH:MM)      |
| `lien`           | `lien`                            |
| `resume`         | `titre` (l'API n'a pas de résumé) |

> Note : l'API ne fournit pas de champ `arrondissement` séparé. Je l'extrais du titre avec une regex et une liste des arrondissements officiels de Montréal.

---

## Stratégie de mise en cache

Le service worker est généré automatiquement par `vite-plugin-pwa` (Workbox) au moment du `npm run build`.

### Assets statiques → Précache (Cache First)

Tous les fichiers JS, CSS, HTML et images produits par Vite sont précachés au premier chargement. Ils sont servis instantanément depuis le cache à chaque visite suivante.

J'ai choisi cette stratégie parce que ces fichiers ne changent pas entre deux visites — ils ne changent que lors d'un nouveau déploiement, et Workbox gère ça automatiquement via le manifeste de précache.

### Données API → StaleWhileRevalidate

Les appels vers `donnees.montreal.ca/api/*` utilisent la stratégie **StaleWhileRevalidate** :

1. Si une réponse est en cache, elle est retournée **immédiatement**.
2. En parallèle, une requête réseau est lancée pour mettre le cache à jour.
3. La prochaine visite affichera les données fraîches.

J'ai choisi cette stratégie parce que les avis de la Ville ne changent pas à chaque seconde — afficher des données légèrement en retard est acceptable, et ça permet à l'app de rester rapide et fonctionnelle hors ligne.

Cache : `api-alertes`, max 10 entrées, expiration 24h.

### Mode hors-ligne

- Le shell (HTML + JS + CSS) démarre sans réseau grâce au précache
- Les derniers avis chargés restent consultables (cache Workbox + `localStorage` en secours)
- La navigation entre l'accueil et la page de détail fonctionne hors connexion
- Une bannière jaune s'affiche quand l'utilisateur est hors ligne

---

## Structure du projet

```
src/
├── components/
│   ├── Header.jsx          — barre de navigation
│   ├── CarteAlerte.jsx     — carte cliquable d'une alerte
│   ├── FiltreDropdown.jsx  — dropdown multi-select réutilisable
│   ├── SkeletonCard.jsx    — squelette animé pendant le chargement
│   └── AbonnementAlertes.jsx
├── pages/
│   ├── Accueil.jsx         — liste avec filtres et recherche
│   └── Detail.jsx          — page de détail d'un avis
├── services/
│   └── alertes.js          — fetch + normalisation des données
├── App.jsx
├── main.jsx
└── index.css
```

---

## Scores Lighthouse (production)

| Catégorie   | Score |
|-------------|-------|
| PWA         | ≥ 90  |
| Performance | ≥ 80  |

Pour lancer l'audit : `npm run build && npm run preview`, puis Chrome DevTools → Lighthouse.
