import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/Axios";
import "../css/admin.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: "", status: "" });
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/tasks");
      setTasks(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const deleteTask = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;

    try {
      setLoading(true);
      await api.delete(`/admin/tasks/${id}`);
      toast.success("Tâche supprimée avec succès !");
      fetchTasks();
    } catch (err) {
      toast.error("Erreur lors de la suppression de la tâche");
      setLoading(false);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditedTask({ title: task.title, status: task.status });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTask({ title: "", status: "" });
  };

  const saveTask = async (id) => {
    try {
      setLoading(true);
      await api.put(`/admin/tasks/${id}`, editedTask);
      toast.success("Tâche mise à jour !");
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour de la tâche");
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin - Toutes les tâches</h2>
      <Link to="/dashboard" className="back-link">
        ← Retour au dashboard
      </Link>

      {loading ? (
        <div className="loader">Chargement des tâches utilisateurs...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Status</th>
              <th>Utilisateur</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => editingTaskId !== task.id && startEditing(task)}
              >
                <td>{task.id}</td>
                <td>
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editedTask.title}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          title: e.target.value,
                        })
                      }
                    />
                  ) : (
                    task.title
                  )}
                </td>
                <td>
                  {editingTaskId === task.id ? (
                    <select
                      value={editedTask.status}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="à faire">à faire</option>
                      <option value="en cours">en cours</option>
                      <option value="terminé">terminé</option>
                    </select>
                  ) : (
                    task.status
                  )}
                </td>
                <td>{task.user}</td>
                <td>
                  {editingTaskId === task.id ? (
                    <>
                      <button onClick={() => saveTask(task.id)}>💾</button>
                      <button onClick={cancelEditing}>❌</button>
                    </>
                  ) : (
                    <button
                      className="danger"
                      onClick={() => deleteTask(task.id)}
                    >
                      Supprimer
                    </button>
                  )}
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
