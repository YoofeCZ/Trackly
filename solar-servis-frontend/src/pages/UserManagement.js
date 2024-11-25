import React, { useState, useEffect } from "react";
import { getUsers, updateUserPassword, deleteUser, updateUserRole } from "../services/api"; // Import API funkcí

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");
  const [message, setMessage] = useState("");

  // Načítání uživatelů
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getUsers(token);
        setUsers(data);
      } catch (error) {
        setMessage("Chyba při načítání uživatelů.");
      }
    };

    fetchUsers();
  }, []);

  // Změna hesla uživatele
  const handlePasswordChange = async (userId) => {
    if (!newPassword) {
      setMessage("Nové heslo nemůže být prázdné.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await updateUserPassword(userId, newPassword, token);
      setMessage("Heslo bylo úspěšně změněno.");
      setNewPassword("");
    } catch (error) {
      setMessage("Chyba při změně hesla.");
    }
  };

  // Smazání uživatele
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await deleteUser(userId, token);
      setMessage("Uživatel byl úspěšně smazán.");
      setUsers(users.filter((user) => user.id !== userId)); // Aktualizace seznamu
    } catch (error) {
      setMessage("Chyba při mazání uživatele.");
    }
  };

  // Změna role uživatele
  const handleChangeRole = async (userId) => {
    if (!newRole) {
      setMessage("Role nemůže být prázdná.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updatedUser = await updateUserRole(userId, newRole, token);
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user))); // Aktualizace seznamu
      setMessage("Role byla úspěšně změněna.");
      setNewRole("");
    } catch (error) {
      setMessage("Chyba při změně role.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Správa uživatelů</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Uživatelské jméno</th>
            <th>Role</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedUser(user)}
                >
                  Změnit heslo
                </button>
                <button
                  className="btn btn-warning btn-sm ms-2"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Smazat
                </button>
                <button
                  className="btn btn-secondary btn-sm ms-2"
                  onClick={() => setSelectedUser(user)}
                >
                  Změnit roli
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="mt-4">
          <h3>Úprava uživatele: {selectedUser.username}</h3>
          <div className="mb-3">
            <h4>Změna hesla</h4>
            <input
              type="password"
              placeholder="Nové heslo"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control"
            />
            <button
              className="btn btn-success mt-2"
              onClick={() => handlePasswordChange(selectedUser.id)}
            >
              Změnit heslo
            </button>
          </div>
          <div className="mb-3">
            <h4>Změna role</h4>
            <input
              type="text"
              placeholder="Nová role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="form-control"
            />
            <button
              className="btn btn-success mt-2"
              onClick={() => handleChangeRole(selectedUser.id)}
            >
              Změnit roli
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
