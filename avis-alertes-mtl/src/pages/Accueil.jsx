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
