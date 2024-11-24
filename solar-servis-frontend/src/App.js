import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Technicians from "./pages/Technicians";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Tasks from "./pages/Tasks";
import Warehouse from "./pages/Warehouse";
import Login from "./pages/Login";
import { loginUser } from './services/api';  // Ujistěte se, že máte tuto funkci v api.js pro přihlášení
import CreateUser from './pages/CreateUser';

function App() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  // Ověření tokenu v localStorage při prvním načtení
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  const handleLogin = async (username, password) => {
    try {
      // Volání API pro přihlášení
      const { token } = await loginUser(username, password);
      localStorage.setItem("token", token); // Uložení tokenu do localStorage
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Chyba při přihlášení:', error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token"); // Odstranění tokenu z localStorage
  };

  return (
    <>
      {/* Navbar bude viditelný pouze pro přihlášené uživatele */}
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Načítání...</span>
          </div>
        </div>
      ) : (
        <Routes>
          {/* Login stránka */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
  path="/create-user"
  element={
    isAuthenticated ? <CreateUser /> : <Navigate to="/login" />
  }
/>
          {/* Přesměrování na login při přístupu na root */}
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Chráněné stránky */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/technicians"
            element={
              isAuthenticated ? <Technicians /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/clients"
            element={isAuthenticated ? <Clients /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={isAuthenticated ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/tasks"
            element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />}
          />
          <Route
            path="/warehouse"
            element={isAuthenticated ? <Warehouse /> : <Navigate to="/login" />}
          />
        </Routes>
      )}
    </>
  );
}

export default App;
