import { Link } from "react-router-dom";
import logo from "../assets/image.jpeg";
import "../index.css";



function Header() {
  return (
    <header className="header">
    
      <Link to="/">
        <img src={logo} alt="Ville de Montréal" style={{ height: "50px" }} />
      </Link>

      <button onClick={() => alert("Mon Compte non disponible.")}>
        👤  Mon Compte
      </button>
    </header>
  );
}

export default Header;


