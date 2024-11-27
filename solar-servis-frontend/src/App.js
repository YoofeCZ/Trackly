import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import Dashboard from "./pages/Dashboard";
import Technicians from "./pages/Technicians";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Tasks from "./pages/Tasks";
import Warehouse from "./pages/Warehouse";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import UserManagement from "./pages/UserManagement"; // Import komponenty
import Systems from "./pages/Systems";
import Components from "./pages/Components";
import CalendarPage from "./pages/Calendar"; // Import nové stránky kalendáře
import Changelog from "./components/Changelog"; // Cesta k souboru s komponentou


import { loginUser } from "./services/api"; // Import API funkce
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import SettingsPage from "./pages/SettingsPage"; // Import nové stránky
import "@fortawesome/fontawesome-free/css/all.min.css";
import './css/Global.css';


function App() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Stav pro roli uživatele
  const [isSplashVisible, setIsSplashVisible] = useState(true); // Stav pro Splash Screen
  const [isFading, setIsFading] = useState(false); // Stav pro fade-out animaci
  const location = useLocation();

  // Ověření tokenu a načtení role uživatele při načtení aplikace
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Dekódování JWT
        setIsAuthenticated(true);
        setUserRole(decodedToken.role); // Nastavení role uživatele
      } catch (error) {
        console.error("Chyba při dekódování tokenu:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }

    // Zobrazení Splash Screen a aktivace fade-out animace
    const fadeTimer = setTimeout(() => setIsFading(true), 2000); // Fade po 2 sekundách
    const timer = setTimeout(() => setIsSplashVisible(false), 3000); // Zmizí po 3 sekundách
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(timer);
    };
  }, []);

  // Zobrazení načítacího indikátoru při přechodu mezi stránkami
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  const handleLogin = async (username, password) => {
    try {
      const { token } = await loginUser(username, password); // Přihlášení přes API
      localStorage.setItem("token", token); // Uložení tokenu do localStorage
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setIsAuthenticated(true);
      setUserRole(decodedToken.role); // Nastavení role po přihlášení
    } catch (error) {
      console.error("Chyba při přihlášení:", error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem("token"); // Odstranění tokenu z localStorage
  };


  
  return (
    <>
      {isSplashVisible ? (
        <SplashScreen isFading={isFading} />
      ) : (
        <>
          {isAuthenticated && <Navbar onLogout={handleLogout} />}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center vh-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Načítání...</span>
              </div>
            </div>
          ) : (
            <>
<Changelog
  changelogKey="v1.0.1" // Změňte tento klíč při každé nové verzi changelogu
  changelogText={
    <>
      <h2>Novinky ve verzi v1.0.1</h2>
      <ul style={{ textAlign: "left" }}>
        <li>
          🆕 <b>Changelog:</b> Přidán systém changelogu, který zobrazuje novinky
          aplikace po spuštění. Zavřený changelog se znovu nezobrazí, dokud
          není vytvořen nový.
        </li>
        <li>
          🗓️ <b>Kalendář:</b> Nová stránka s kalendářem pro plánování úkolů a
          servisních aktivit. Kalendář je dostupný na nové adrese{" "}
          <code>/calendar</code>.
        </li>
        <li>
          ✨ <b>Vylepšení designu:</b> Větší a centrovaný changelog s moderním
          vzhledem. Text je přehlednější a design plně responsivní.
        </li>
        <li>
          🔧 <b>Modul úkolů:</b> Modul "Úkoly" byl přejmenován na{" "}
          <b>"Plánovač úkolů a servisů"</b>, aby reflektoval novou
          funkcionalitu.
        </li>
        <li>
          🛠️ <b>Globální styly:</b> Přidány nové styly pro responsivní design a
          lepší čitelnost.
        </li>
      </ul>
      <p>
        🎉 Užívejte novinky v této verzi a těšíme se na vaše zpětné vazby!
      </p>
    </>
  }
/>

  
              {/* Existující Routes */}
              <Routes>
                {/* Login stránka */}
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <Login onLogin={handleLogin} />
                    )
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
                  element={
                    isAuthenticated ? <Clients /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/reports"
                  element={
                    isAuthenticated ? <Reports /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    isAuthenticated ? <Tasks /> : <Navigate to="/login" />
                  }
                />
                {/* Přidání nové routy pro kalendář */}
                <Route
                  path="/calendar"
                  element={
                    isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/warehouse"
                  element={
                    isAuthenticated ? <Warehouse /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/systems"
                  element={
                    isAuthenticated ? <Systems /> : <Navigate to="/login" />
                  }
                />
                <Route
                  path="/components"
                  element={
                    isAuthenticated ? <Components /> : <Navigate to="/login" />
                  }
                />
                {/* Stránky přístupné pouze adminům */}
                <Route
                  path="/create-user"
                  element={
                    isAuthenticated && userRole === "admin" ? (
                      <CreateUser />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    isAuthenticated && userRole === "admin" ? (
                      <UserManagement />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />
                  }
                />
              </Routes>
            </>
          )}
        </>
      )}
    </>
  );
  
}

export default App;
