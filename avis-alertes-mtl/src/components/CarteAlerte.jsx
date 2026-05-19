import { useNavigate } from "react-router-dom";
import "../index.css";

function CarteAlerte({ alerte }) {
  const navigate = useNavigate();

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
  );
}

export default CarteAlerte;

