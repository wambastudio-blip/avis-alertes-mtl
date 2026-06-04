/**
 * Service d'accès aux données — Avis et alertes Ville de Montréal
 *
 * Source primaire  : GeoJSON public (portail données ouvertes)
 * Source secondaire: CKAN datastore_search (mêmes champs, format JSON)
 *
 * Champs réels de l'API (confirmés sur le jeu de données) :
 *   titre          — libellé complet de l'avis
 *   date_debut     — ISO 8601 ex. "2026-05-12T18:49:52.660000"
 *   date_fin       — ISO 8601
 *   type           — catégorie ex. "Urgence", "Eau et aqueduc", "Circulation et transport"
 *   service_publieur
 *   lien           — URL vers la page de détail sur montreal.ca
 *
 * NOTE : il n'y a PAS de champ "arrondissement" dans l'API.
 *        L'arrondissement est extrait du titre via regex.
 */

const GEOJSON_URL =
  "https://donnees.montreal.ca/dataset/556c84af-aebf-4ca9-9a9c-2f246601674c" +
  "/resource/d249e452-46f5-422f-91ae-898c98eea6cc/download/avis-alertes.geojson";

const CKAN_URL =
  "https://donnees.montreal.ca/api/3/action/datastore_search" +
  "?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336&limit=500";

const CACHE_KEY = "alertes_cache_v2";

// ─────────────────────────────────────────────────────────────────────────────
// Liste des arrondissements officiels de Montréal (pour la détection dans le titre)
// ─────────────────────────────────────────────────────────────────────────────
const ARRONDISSEMENTS = [
  "Ahuntsic-Cartierville",
  "Anjou",
  "Côte-des-Neiges–Notre-Dame-de-Grâce",
  "Côte-des-Neiges - Notre-Dame-de-Grâce",
  "L'Île-Bizard–Sainte-Geneviève",
  "LaSalle",
  "Lachine",
  "Mercier–Hochelaga-Maisonneuve",
  "Mercier-Hochelaga-Maisonneuve",
  "Mont-Royal",
  "Montréal-Est",
  "Montréal-Nord",
  "Montréal-Ouest",
  "Outremont",
  "Pierrefonds-Roxboro",
  "Le Plateau-Mont-Royal",
  "Plateau-Mont-Royal",
  "Rivière-des-Prairies–Pointe-aux-Trembles",
  "Rivière-des-Prairies - Pointe-aux-Trembles",
  "Rosemont–La Petite-Patrie",
  "Rosemont-La Petite-Patrie",
  "Rosemont–La-Petite-Patrie",
  "Rosemont-La-Petite-Patrie",
  "Saint-Laurent",
  "Saint-Léonard",
  "Verdun",
  "Ville-Marie",
  "Villeray–Saint-Michel–Parc-Extension",
  "Villeray-Saint-Michel-Parc-Extension",
];

/**
 * Extrait le nom de l'arrondissement depuis le titre de l'alerte.
 * L'API ne fournit pas ce champ séparément — il est toujours dans le titre.
 *
 * Exemples traités :
 *   "...arrondissement de Montréal-Nord"             → "Montréal-Nord"
 *   "...arrondissement Côte-des-Neiges–NDG"          → "Côte-des-Neiges–NDG"
 *   "...arrondissement d'Anjou"                      → "Anjou"
 *   "...arr. du Plateau-Mont-Royal"                  → "Plateau-Mont-Royal"
 *   "...Villeray–Saint-Michel–Parc-Extension"        → "Villeray–Saint-Michel–Parc-Extension"
 */
export function extraireArrondissement(titre) {
  if (!titre) return "";

  // 1. Chercher via la liste des arrondissements connus (le plus fiable)
  for (const arr of ARRONDISSEMENTS) {
    // Comparaison souple : insensible à la casse et aux tirets/espaces
    const re = new RegExp(
      arr.replace(/[-–]/g, "[-–\\s]").replace(/\s+/g, "\\s*"),
      "i"
    );
    if (re.test(titre)) return arr;
  }

  // 2. Pattern "arrondissement de/d'/du/des X"
  const m1 = titre.match(
    /arrondissement\s+(?:de\s+l[''\s]|des\s+|du\s+|d['']\s*|de\s+)?([A-ZÀ-Ÿa-zà-ÿ][^,\n–]{2,50}?)(?:\s*[,\n]|\s*$)/i
  );
  if (m1) return m1[1].trim();

  // 3. Pattern abrégé "arr. du/de/d' X"
  const m2 = titre.match(
    /arr\.\s+(?:du\s+|de\s+|d['']\s*)?([A-ZÀ-Ÿ][A-Za-zÀ-ÿ\-–\s]{2,50}?)(?:\s*[,\n]|\s*$)/i
  );
  if (m2) return m2[1].trim();

  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisation
// ─────────────────────────────────────────────────────────────────────────────

let _idCounter = 1;

/**
 * Convertit un Feature GeoJSON ou un enregistrement CKAN en modèle interne.
 */
export function normaliserAlerte(raw) {
  // Supporte les deux formats : GeoJSON Feature et CKAN record
  const props = raw.properties || raw;

  const id = String(props._id || props.id || (_idCounter++));
  const titre = (props.titre || props.TITRE || "").trim();
  const sujet = (props.type || props.TYPE || props.sujet || "Général").trim();

  // Date (ex. "2026-05-12T18:49:52.660000" → "2026-05-12")
  const dateRaw = props.date_debut || props.DATE_DEBUT || props.date_avis || "";
  const dateEmission = dateRaw ? dateRaw.split("T")[0].split(" ")[0] : "";

  // Heure extraite de date_debut si présente
  let heure = "";
  if (dateRaw && dateRaw.includes("T")) {
    heure = dateRaw.split("T")[1]?.substring(0, 5) || "";
  }

  const lien = (props.lien || props.LIEN || "").trim();
  const arrondissement = extraireArrondissement(titre) || "Non précisé";

  return {
    id,
    titre: titre || "(Sans titre)",
    arrondissement,
    sujet,
    dateEmission,
    heure,
    resume: titre, // L'API ne fournit pas de résumé séparé
    description: titre,
    lien,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les alertes.
 * Essaie d'abord le GeoJSON, puis le CKAN datastore en fallback.
 * En cas d'échec réseau total, retourne le cache localStorage.
 */
export async function getAlertes() {
  try {
    // — Source primaire : GeoJSON —
    const alertes = await _fetchGeoJSON();
    _saveCache(alertes);
    return { alertes, fromCache: false };
  } catch (errGeo) {
    try {
      // — Source secondaire : CKAN datastore —
      const alertes = await _fetchCKAN();
      _saveCache(alertes);
      return { alertes, fromCache: false };
    } catch (errCkan) {
      // — Fallback : cache localStorage —
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return { alertes: JSON.parse(cached), fromCache: true };
      }
      throw new Error("Données indisponibles et aucun cache local.");
    }
  }
}

async function _fetchGeoJSON() {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error(`GeoJSON HTTP ${res.status}`);
  const json = await res.json();
  const features = json.features ?? [];
  if (features.length === 0) throw new Error("GeoJSON vide");
  return features.map(normaliserAlerte);
}

async function _fetchCKAN() {
  const res = await fetch(CKAN_URL);
  if (!res.ok) throw new Error(`CKAN HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("CKAN success=false");
  const records = json.result?.records ?? [];
  if (records.length === 0) throw new Error("CKAN 0 enregistrements");
  return records.map(normaliserAlerte);
}

function _saveCache(alertes) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(alertes));
  } catch (_) {}
}

/**
 * Récupère une alerte par id (cherche d'abord dans le cache).
 */
export async function getAlerteById(id) {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const alertes = JSON.parse(cached);
    const found = alertes.find((a) => a.id === String(id));
    if (found) return found;
  }
  // Si pas en cache, recharge tout et cherche
  const { alertes } = await getAlertes();
  return alertes.find((a) => a.id === String(id)) ?? null;
}
