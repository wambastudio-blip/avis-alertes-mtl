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
