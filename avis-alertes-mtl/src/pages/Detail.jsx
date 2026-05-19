import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlerteById } from "../services/alertes";


function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alerte, setAlerte] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getAlerteById(id).then((data) => {
      setAlerte(data);
      setChargement(false);
    });
  }, [id]);

  if (chargement) return <p>Chargement...</p>;
  if (!alerte) return <p>Alerte introuvable.</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: "20px", cursor: "pointer" }}
      >
        ← Retour aux alertes
      </button>

      <h1>{alerte.titre}</h1>
      <p style={{ color: "#666", margin: "10px 0" }}>
        {alerte.arrondissement} — {alerte.sujet} — {alerte.dateEmission}
      </p>
      <hr />
      <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
        {alerte.description}
      </p>
    </div>
  );
}

export default Detail;