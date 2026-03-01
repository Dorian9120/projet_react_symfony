import { Link } from "react-router-dom";
import "../css/accueil.css";

export default function Accueil() {
  return (
    <div className="accueil-container">
      <div className="accueil-card">
        <h1>Bienvenue sur TaskManager</h1>
        <p className="accueil-intro">
          Gérez facilement vos tâches quotidiennes et améliorez votre
          productivité !
        </p>

        <div className="accueil-features">
          <h2>Fonctionnalités :</h2>
          <ul>
            <li>📌 Créez et gérez vos tâches personnelles</li>
            <li>🕒 Ajoutez une date et une heure à chaque tâche</li>
            <li>✏️ Modifiez ou supprimez vos tâches à tout moment</li>
            <li>
              🛡️ Gestion des utilisateurs et tâches pour les administrateurs
            </li>
            <li>🔒 Sécurisé grâce à une authentification par JWT</li>
          </ul>
        </div>

        <div className="accueil-login">
          <Link to="/login" className="btn-login">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
