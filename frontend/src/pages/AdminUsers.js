import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/Axios";
import "../css/admin.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const rolesOptions = ["ROLE_USER", "ROLE_ADMIN"];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?"))
      return;

    try {
      setLoading(true);
      await api.delete(`/admin/users/${id}`);
      toast.success("Utilisateur supprimé avec succès !");
      fetchUsers();
    } catch (err) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      setLoading(false);
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      setLoading(true);
      await api.put(`/admin/users/${id}`, { roles: [newRole] });
      toast.success("Rôle mis à jour !");
      fetchUsers();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du rôle");
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <Link to="/dashboard" className="back-link">
        ← Retour au dashboard
      </Link>

      <h2>Admin - Utilisateurs</h2>

      {loading ? (
        <div className="loader">Chargement des utilisateurs...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.roles[0]}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                  >
                    {rolesOptions.map((role) => (
                      <option key={role} value={role}>
                        {role.replace("ROLE_", "")}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="danger"
                    onClick={() => deleteUser(user.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
