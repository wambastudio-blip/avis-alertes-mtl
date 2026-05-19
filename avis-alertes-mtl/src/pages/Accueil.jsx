import { useState, useEffect } from "react";
import { getAlertes } from "../services/alertes";
import CarteAlerte from "../components/CarteAlerte";
import AbonnementAlertes from "../components/AbonnementAlertes";
import "../index.css";
import "../indexmbl.css";

function Accueil() {
  const [alertes, setAlertes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreArrondissement, setFiltreArrondissement] = useState("");
  const [filtreSujet, setFiltreSujet] = useState("");
  const [filtreDate, setFiltreDate] = useState("");

  useEffect(() => {
    getAlertes().then((data) => {
      setAlertes(data);
      setChargement(false);
    });
  }, []);

  const arrondissements = [...new Set(alertes.map((a) => a.arrondissement))];
  const sujets = [...new Set(alertes.map((a) => a.sujet))];

  function sansAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const alertesFiltrees = alertes.filter((alerte) => {
    const matchRecherche = sansAccents(alerte.titre.toLowerCase()).includes(
      sansAccents(recherche.toLowerCase())
    );
    const matchArrondissement =
      filtreArrondissement === "" ||
      alerte.arrondissement === filtreArrondissement;
    const matchSujet = filtreSujet === "" || alerte.sujet === filtreSujet;
    const matchDate = filtreDate === "" || alerte.dateEmission >= filtreDate;
    return matchRecherche && matchArrondissement && matchSujet && matchDate;
  });

  function reinitialiserFiltres() {
    setRecherche("");
    setFiltreArrondissement("");
    setFiltreSujet("");
    setFiltreDate("");
  }

  if (chargement) return <p>Chargement...</p>;

  return (
    <div className="accueil-page">

      {/* --- BLOC AVIS ET ALERTES --- */}
      <section className="header-bloc">
        <h1 className="header-title">Avis et alertes</h1>
        <p className="header-subtitle">Trouver un avis</p>

        <input
          type="text"
          placeholder="🔎   Que cherchez-vous?"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="search-bar"
        />
      </section>

      {/* --- LIGNE DE SÉPARATION --- */}
      <hr className="separator" />

      {/* --- FILTRES EN DEHORS DU CARRÉ --- */}
      <div className="filters-outside">
        <select
          value={filtreArrondissement}
          onChange={(e) => setFiltreArrondissement(e.target.value)}
        >
          <option value="">Arrondissement</option>
          {arrondissements.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          type="date"
          value={filtreDate}
          onChange={(e) => setFiltreDate(e.target.value)}
        />

        <select
          value={filtreSujet}
          onChange={(e) => setFiltreSujet(e.target.value)}
        >
          <option value="">Sujet</option>
          {sujets.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button onClick={reinitialiserFiltres} className="reset-btn">
          Réinitialiser
        </button>
      </div>

      {/* --- CONTENU PRINCIPAL --- */}
      <div className="content-layout">
        <div className="alertes-list">
          <p className="results-text">{alertesFiltrees.length} résultat(s)</p>

          {alertesFiltrees.length === 0 ? (
            <p>Aucun résultat.</p>
          ) : (
            alertesFiltrees.map((alerte) => (
              <CarteAlerte key={alerte.id} alerte={alerte} />
            ))
          )}
        </div>

        <AbonnementAlertes />
      </div>
    </div>
  );
}

export default Accueil;
