import React, { useState } from "react";
import { loginUser } from "../services/api"; // Import API funkce
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Inicializace navigate pro přesměrování

  // Při přihlášení uživatele
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Zavolání backend API pro přihlášení
      const data = await loginUser(username, password);
      localStorage.setItem("token", data.token);  // Uložení tokenu do localStorage
      onLogin(); // Oznámení aplikaci, že uživatel je přihlášen
      window.location.reload(); // Obnovení stránky, což způsobí přesměrování na dashboard
    } catch (err) {
      setError("Přihlášení selhalo: Nesprávné přihlašovací údaje.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3 className="mb-4">Přihlášení</h3>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Uživatelské jméno
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Zadejte uživatelské jméno"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Heslo
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Zadejte heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
