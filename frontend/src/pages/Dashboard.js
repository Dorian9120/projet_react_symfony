import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "../css/dashboard.css";

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.roles && decoded.roles.includes("ROLE_ADMIN")) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Token invalide");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="card">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <div className="dashboard-links">
          {/* Liens utilisateur */}
          <div className="user-links">
            <h3>Utilisateur</h3>
            <Link to="/tasks">Mes tâches</Link>
          </div>

          {/* Liens admin, seulement si admin */}
          {isAdmin && (
            <div className="admin-links">
              <h3>Admin</h3>
              <Link to="/admin/users" className="admin-link">
                Admin Users
              </Link>
              <Link to="/admin/tasks" className="admin-link">
                Admin Tasks
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
