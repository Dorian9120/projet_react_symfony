import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/Axios";
import "../css/auth.css";
import "../css/global.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/register", { email, password });
      alert("Compte créé");
      navigate("/");
    } catch (err) {
      alert("Erreur inscription");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Créer compte</button>
        </form>
      </div>
    </div>
  );
}
