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
