#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Script de correction TP2 — Avis et alertes MTL
# Lance ce script depuis la RACINE de ton projet : bash appliquer-corrections.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Arrête le script si une commande échoue

echo "📁 Création des dossiers si nécessaire..."
mkdir -p src/components src/pages src/services

# ─── main.jsx ────────────────────────────────────────────────────────────────
echo "✏️  src/main.jsx"
cat > src/main.jsx << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Enregistrement du Service Worker (production uniquement)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW enregistré :', reg.scope))
      .catch(err => console.error('Échec enregistrement SW :', err))
  })
}
EOF

# ─── App.jsx ─────────────────────────────────────────────────────────────────
echo "✏️  src/App.jsx"
cat > src/App.jsx << 'EOF'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Accueil from './pages/Accueil'
import Detail from './pages/Detail'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/alertes/:id" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
EOF

# ─── components/Header.jsx ───────────────────────────────────────────────────
echo "✏️  src/components/Header.jsx"
cat > src/components/Header.jsx << 'EOF'
import { Link } from 'react-router-dom'
import logo from '../assets/image.jpeg'
import '../index.css'

function Header() {
  return (
    <header className="header">
      <Link to="/">
        <img src={logo} alt="Ville de Montréal" style={{ height: '50px' }} />
      </Link>

      <button onClick={() => alert('Mon Compte non disponible.')}>
        👤 Mon Compte
      </button>
    </header>
  )
}

export default Header
EOF

# ─── components/CarteAlerte.jsx ──────────────────────────────────────────────
echo "✏️  src/components/CarteAlerte.jsx"
cat > src/components/CarteAlerte.jsx << 'EOF'
import { useNavigate } from 'react-router-dom'

function CarteAlerte({ alerte }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/alertes/${alerte.id}`)}
      className="carte"
    >
      <h3>{alerte.titre}</h3>
      <span className="sujet">{alerte.sujet}</span>
      <p className="info">
        📅 {alerte.dateEmission} &nbsp; 🕐 {alerte.heure}
      </p>
    </div>
  )
}

export default CarteAlerte
EOF

# ─── components/AbonnementAlertes.jsx ────────────────────────────────────────
echo "✏️  src/components/AbonnementAlertes.jsx"
cat > src/components/AbonnementAlertes.jsx << 'EOF'
function AbonnementAlertes() {
  return (
    <aside className="abonnement-box">
      <h2 className="abonnement-title">S'abonner aux alertes</h2>
      <p className="abonnement-text">
        Pour recevoir des avis et alertes par courriel ou texto, vous devez avoir créé un compte.
      </p>
      <a href="#" className="abonnement-link">
        M'abonner →
      </a>
    </aside>
  )
}

export default AbonnementAlertes
EOF

# ─── components/SkeletonCard.jsx ─────────────────────────────────────────────
echo "✏️  src/components/SkeletonCard.jsx"
cat > src/components/SkeletonCard.jsx << 'EOF'
function SkeletonCard() {
  return (
    <div className="skeleton-carte" aria-hidden="true">
      <div className="skeleton-line sk-title" />
      <div className="skeleton-line sk-badge" />
      <div className="skeleton-line sk-meta" />
    </div>
  )
}

export default SkeletonCard
EOF

# ─── components/FiltreDropdown.jsx (NOUVEAU) ─────────────────────────────────
echo "✏️  src/components/FiltreDropdown.jsx (nouveau)"
cat > src/components/FiltreDropdown.jsx << 'EOF'
import { useState, useRef, useEffect } from 'react'

// Composant réutilisable pour un filtre multi-valeurs (dropdown checkboxes)
// Gère l'ouverture/fermeture avec useState et la fermeture au clic extérieur
function FiltreDropdown({ label, options, selectionnes, onToggle }) {
  const [ouvert, setOuvert] = useState(false)
  const ref = useRef(null)

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="filter-group" ref={ref}>
      <button
        className={`filter-toggle-btn${selectionnes.length > 0 ? ' active' : ''}`}
        onClick={() => setOuvert(prev => !prev)}
        aria-expanded={ouvert}
      >
        {label}
        {selectionnes.length > 0 && (
          <span className="filter-count">{selectionnes.length}</span>
        )}
        ▾
      </button>

      <div className={`filter-dropdown${ouvert ? ' open' : ''}`}>
        {options.map(option => (
          <label key={option} className="filter-option">
            <input
              type="checkbox"
              checked={selectionnes.includes(option)}
              onChange={() => onToggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

export default FiltreDropdown
EOF

# ─── pages/Accueil.jsx ───────────────────────────────────────────────────────
echo "✏️  src/pages/Accueil.jsx"
cat > src/pages/Accueil.jsx << 'EOF'
import { useState, useEffect } from 'react'
import { getAlertes } from '../services/alertes'
import CarteAlerte from '../components/CarteAlerte'
import SkeletonCard from '../components/SkeletonCard'
import AbonnementAlertes from '../components/AbonnementAlertes'
import FiltreDropdown from '../components/FiltreDropdown'

const PAGE_SIZE = 10

function Accueil() {
  const [alertes, setAlertes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [horsLigne, setHorsLigne] = useState(!navigator.onLine)
  const [fromCache, setFromCache] = useState(false)

  // Filtres
  const [recherche, setRecherche] = useState('')
  const [filtreArrondissements, setFiltreArrondissements] = useState([])
  const [filtreSujets, setFiltreSujets] = useState([])
  const [filtreDateDebut, setFiltreDateDebut] = useState('')
  const [filtreDateFin, setFiltreDateFin] = useState('')

  // Pagination
  const [nbAffiches, setNbAffiches] = useState(PAGE_SIZE)

  // ─── Chargement initial des données ──────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        const { alertes: data, fromCache: fc } = await getAlertes()
        setAlertes(data)
        setFromCache(fc)
      } catch (err) {
        setErreur('Impossible de contacter le serveur. Vérifiez votre connexion.')
      } finally {
        setChargement(false)
      }
    })()
  }, [])

  // ─── Détection hors-ligne ─────────────────────────────────────────────────
  useEffect(() => {
    const onOffline = () => setHorsLigne(true)
    const onOnline = () => setHorsLigne(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  // ─── Options de filtres disponibles ──────────────────────────────────────
  const arrondissements = [...new Set(alertes.map(a => a.arrondissement))].sort()
  const sujets = [...new Set(alertes.map(a => a.sujet))].sort()

  // ─── Normalisation pour la recherche sans accents ─────────────────────────
  const sansAccents = str =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  // ─── Filtrage (OU à l'intérieur d'un filtre, ET entre filtres) ────────────
  const alertesFiltrees = alertes.filter(a => {
    if (
      recherche &&
      !sansAccents(a.titre).includes(sansAccents(recherche)) &&
      !sansAccents(a.resume).includes(sansAccents(recherche))
    )
      return false

    if (filtreArrondissements.length > 0 && !filtreArrondissements.includes(a.arrondissement))
      return false

    if (filtreSujets.length > 0 && !filtreSujets.includes(a.sujet))
      return false

    if (filtreDateDebut && a.dateEmission && a.dateEmission < filtreDateDebut)
      return false

    if (filtreDateFin && a.dateEmission && a.dateEmission > filtreDateFin)
      return false

    return true
  })

  const alertesPage = alertesFiltrees.slice(0, nbAffiches)

  // ─── Réinitialiser tous les filtres ──────────────────────────────────────
  function reinitialiser() {
    setRecherche('')
    setFiltreArrondissements([])
    setFiltreSujets([])
    setFiltreDateDebut('')
    setFiltreDateFin('')
    setNbAffiches(PAGE_SIZE)
  }

  // ─── Toggle multi-select ──────────────────────────────────────────────────
  function toggleArrondissement(val) {
    setFiltreArrondissements(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
    setNbAffiches(PAGE_SIZE)
  }

  function toggleSujet(val) {
    setFiltreSujets(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
    setNbAffiches(PAGE_SIZE)
  }

  // ─── Construction des chips actifs ────────────────────────────────────────
  const chipsActifs = [
    ...filtreArrondissements.map(v => ({
      label: v,
      remove: () => setFiltreArrondissements(prev => prev.filter(x => x !== v)),
    })),
    ...filtreSujets.map(v => ({
      label: v,
      remove: () => setFiltreSujets(prev => prev.filter(x => x !== v)),
    })),
    ...(filtreDateDebut
      ? [{ label: `Depuis ${filtreDateDebut}`, remove: () => setFiltreDateDebut('') }]
      : []),
    ...(filtreDateFin
      ? [{ label: `Jusqu'au ${filtreDateFin}`, remove: () => setFiltreDateFin('') }]
      : []),
  ]

  const hasActifs = chipsActifs.length > 0 || recherche !== ''

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="accueil-page">

      {/* Bannière hors-ligne */}
      {horsLigne && (
        <div className="banniere-offline">
          📴 Vous êtes hors ligne — affichage des données en cache.
        </div>
      )}

      {/* Bannière cache */}
      {!horsLigne && fromCache && (
        <div className="banniere-cache">
          ⚠️ Les données affichées proviennent du cache. Rechargez pour actualiser.
        </div>
      )}

      {/* ─── En-tête ──────────────────────────────────────────────────── */}
      <section className="header-bloc">
        <h1 className="header-title">Avis et alertes</h1>
        <p className="header-subtitle">Trouver un avis</p>
        <input
          type="text"
          placeholder="🔎   Que cherchez-vous?"
          value={recherche}
          onChange={e => { setRecherche(e.target.value); setNbAffiches(PAGE_SIZE) }}
          className="search-bar"
          aria-label="Recherche"
        />
      </section>

      <hr className="separator" />

      {/* ─── Filtres ──────────────────────────────────────────────────── */}
      <div className="filters-outside">

        <FiltreDropdown
          label="Arrondissement"
          options={arrondissements}
          selectionnes={filtreArrondissements}
          onToggle={toggleArrondissement}
        />

        <FiltreDropdown
          label="Sujet"
          options={sujets}
          selectionnes={filtreSujets}
          onToggle={toggleSujet}
        />

        {/* Filtre date */}
        <label className="date-filter-label">
          Du
          <input
            type="date"
            value={filtreDateDebut}
            onChange={e => { setFiltreDateDebut(e.target.value); setNbAffiches(PAGE_SIZE) }}
          />
        </label>

        <label className="date-filter-label">
          Au
          <input
            type="date"
            value={filtreDateFin}
            onChange={e => { setFiltreDateFin(e.target.value); setNbAffiches(PAGE_SIZE) }}
          />
        </label>

        {hasActifs && (
          <button onClick={reinitialiser} className="reset-btn">
            Tout effacer
          </button>
        )}
      </div>

      {/* ─── Zone filtres actifs (chips) ──────────────────────────────── */}
      {chipsActifs.length > 0 && (
        <div className="chips-zone" role="list" aria-label="Filtres actifs">
          {chipsActifs.map(chip => (
            <span key={chip.label} className="chip" role="listitem">
              {chip.label}
              <button
                className="chip-remove"
                onClick={chip.remove}
                aria-label={`Retirer le filtre ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ─── Contenu principal ────────────────────────────────────────── */}
      <div className="content-layout">
        <div className="alertes-list">

          {/* État : chargement */}
          {chargement && (
            <>
              {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </>
          )}

          {/* État : erreur */}
          {!chargement && erreur && (
            <div className="erreur-box">
              <span className="erreur-icon">⚠️</span>
              <p>{erreur}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          )}

          {/* Aucun résultat */}
          {!chargement && !erreur && alertesFiltrees.length === 0 && (
            <p className="aucun-resultat">Aucun avis ne correspond à vos critères.</p>
          )}

          {/* Liste des alertes */}
          {!chargement && !erreur && alertesFiltrees.length > 0 && (
            <>
              <p className="results-text">
                {alertesFiltrees.length} résultat{alertesFiltrees.length > 1 ? 's' : ''}
              </p>

              {alertesPage.map(alerte => (
                <CarteAlerte key={alerte.id} alerte={alerte} />
              ))}

              {nbAffiches < alertesFiltrees.length && (
                <button
                  className="charger-plus-btn"
                  onClick={() => setNbAffiches(n => n + PAGE_SIZE)}
                >
                  Charger plus ({alertesFiltrees.length - nbAffiches} restant
                  {alertesFiltrees.length - nbAffiches > 1 ? 's' : ''})
                </button>
              )}
            </>
          )}
        </div>

        <AbonnementAlertes />
      </div>
    </div>
  )
}

export default Accueil
EOF

# ─── pages/Detail.jsx ────────────────────────────────────────────────────────
echo "✏️  src/pages/Detail.jsx"
cat > src/pages/Detail.jsx << 'EOF'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAlerteById } from '../services/alertes'

function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alerte, setAlerte] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getAlerteById(id)
        setAlerte(data)
      } catch (err) {
        setErreur("Impossible de charger les détails de cet avis.")
      } finally {
        setChargement(false)
      }
    })()
  }, [id])

  return (
    <div className="detail-page">
      <button className="retour-btn" onClick={() => navigate(-1)}>
        ← Retour aux alertes
      </button>

      {/* État : chargement */}
      {chargement && (
        <div className="detail-skeleton" aria-hidden="true">
          <div className="skeleton-line sk-detail-title" />
          <div className="skeleton-line sk-detail-meta" />
          <div className="skeleton-line sk-detail-body" />
          <div className="skeleton-line sk-detail-body" />
          <div className="skeleton-line sk-detail-body sk-short" />
        </div>
      )}

      {/* État : erreur */}
      {!chargement && erreur && (
        <div className="erreur-box">
          <span className="erreur-icon">⚠️</span>
          <p>{erreur}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      )}

      {/* Introuvable */}
      {!chargement && !erreur && !alerte && (
        <p className="aucun-resultat">Cet avis est introuvable.</p>
      )}

      {/* Contenu */}
      {!chargement && !erreur && alerte && (
        <article>
          <h1 className="detail-titre">{alerte.titre}</h1>
          <p className="detail-meta">
            <span className="sujet-badge">{alerte.sujet}</span>
            {alerte.arrondissement && alerte.arrondissement !== 'Non précisé' && (
              <span> · {alerte.arrondissement}</span>
            )}
            {alerte.dateEmission && <span> · {alerte.dateEmission}</span>}
            {alerte.heure && <span> · {alerte.heure}</span>}
          </p>
          <hr className="separator" />
          {alerte.lien ? (
            <div className="detail-lien-box">
              <p className="detail-lien-text">
                Pour consulter le contenu complet de cet avis, rendez-vous sur la page officielle de la Ville de Montréal.
              </p>
              <a
                href={alerte.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-lien-btn"
              >
                Voir l'avis complet sur montreal.ca →
              </a>
            </div>
          ) : (
            <p className="detail-description">{alerte.description || alerte.resume}</p>
          )}
        </article>
      )}
    </div>
  )
}

export default Detail
EOF

# ─── Supprimer le fichier vide ────────────────────────────────────────────────
if [ -f "src/components/BarreHeader.jsx" ]; then
  echo "🗑️  Suppression de BarreHeader.jsx (fichier vide)"
  rm src/components/BarreHeader.jsx
fi

echo ""
echo "✅ Corrections appliquées avec succès !"
echo ""
echo "Fichiers modifiés :"
echo "  src/main.jsx"
echo "  src/App.jsx"
echo "  src/components/Header.jsx"
echo "  src/components/CarteAlerte.jsx"
echo "  src/components/AbonnementAlertes.jsx"
echo "  src/components/SkeletonCard.jsx"
echo "  src/components/FiltreDropdown.jsx  ← nouveau"
echo "  src/pages/Accueil.jsx"
echo "  src/pages/Detail.jsx"
echo ""
echo "Lance 'npm run dev' pour vérifier que tout fonctionne."
