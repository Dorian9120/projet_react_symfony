import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/Axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/tasks.css";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", date: "", hour: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const statusOptions = ["à faire", "en cours", "terminé"];
  const [editTaskData, setEditTaskData] = useState({
    title: "",
    date: "",
    hour: "",
    status: "à faire",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-tasks");
      setTasks(res.data);
    } catch (error) {
      toast.error("Erreur chargement des tâches");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const formatDateToFR = (date) => {
    if (!date) return null;
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    const payload = {
      title: newTask.title,
    };

    if (newTask.date) payload.date = formatDateToFR(newTask.date);
    if (newTask.hour) payload.hour = newTask.hour;

    try {
      setLoading(true);
      await api.post("/my-tasks", payload);
      toast.success("Tâche ajoutée avec succès !");
      setNewTask({ title: "", date: "", hour: "" });
      await fetchTasks();
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Erreur création tâche");
    } finally {
      setLoading(false);
    }
  };
  const deleteTask = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/my-tasks/${id}`);
      toast.success("Tâche supprimée avec succès");
      await fetchTasks();
    } catch (error) {
      toast.error("Erreur suppression tâche");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ----- START EDIT -----
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTaskData({
      title: task.title,
      date: task.date ? task.date.split("T")[0] : "",
      hour: task.hour ? task.hour.slice(0, 5) : "",
      status: task.status || "à faire",
    });
  };

  // ----- CANCEL EDIT -----
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskData({ title: "", date: "", hour: "" });
  };

  const saveEdit = async (id) => {
    const payload = {
      title: editTaskData.title,
      status: editTaskData.status,
    };

    if (editTaskData.date) payload.date = editTaskData.date;
    if (editTaskData.hour) payload.hour = editTaskData.hour;

    try {
      setLoading(true);
      await api.put(`/my-tasks/${id}`, payload);
      toast.success("Tâche mise à jour !");
      setEditingTaskId(null);
      await fetchTasks();
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Erreur mise à jour tâche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="card">
        <Link to="/dashboard" className="back-link">
          ← Retour au dashboard
        </Link>

        <h2 className="h2-tasks">Mes tâches</h2>

        {loading && <p>Chargement des tâches...</p>}
        {tasks.length === 0 && !loading && <p>Aucune tâche</p>}

        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            {editingTaskId === task.id ? (
              <div className="task-edit">
                <input
                  type="text"
                  placeholder={editTaskData.title || ""}
                  onChange={(e) =>
                    setEditTaskData({ ...editTaskData, title: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={editTaskData.date || ""}
                  onChange={(e) =>
                    setEditTaskData({ ...editTaskData, date: e.target.value })
                  }
                />
                <input
                  type="time"
                  value={editTaskData.hour || ""}
                  onChange={(e) =>
                    setEditTaskData({ ...editTaskData, hour: e.target.value })
                  }
                />
                <select
                  value={editTaskData.status}
                  onChange={(e) =>
                    setEditTaskData({ ...editTaskData, status: e.target.value })
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <div className="task-edit-buttons">
                  <button
                    className="primary"
                    onClick={() => saveEdit(task.id)}
                    disabled={loading}
                  >
                    Sauvegarder
                  </button>
                  <button
                    className="danger"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="task-view"
                onClick={() => startEdit(task)}
                style={{ cursor: "pointer" }}
              >
                <div className="task-content">
                  <strong className="task-title">{task.title}</strong>

                  <span
                    className={`task-status status-${task.status.replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>

                  {(task.date || task.hour) && (
                    <div className="task-date">
                      {task.date &&
                        new Date(task.date.split("T")[0]).toLocaleDateString(
                          "fr-FR",
                        )}
                      {task.hour && ` à ${task.hour.slice(0, 5)}`}
                    </div>
                  )}
                </div>
                <button
                  className="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="task-input">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Titre"
            disabled={loading}
          />
          <input
            type="date"
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            disabled={loading}
          />
          <input
            type="time"
            value={newTask.hour}
            onChange={(e) => setNewTask({ ...newTask, hour: e.target.value })}
            disabled={loading}
          />
        </div>
        <button className="primary" onClick={createTask} disabled={loading}>
          Ajouter une tâche
        </button>
      </div>
    </div>
  );
}
