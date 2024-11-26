import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Získání aktuální cesty

  // Získání role uživatele z tokenu
  const token = localStorage.getItem("token");
  let userRole = null;

  if (token) {
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Dekódování JWT
    userRole = decodedToken.role;
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        {/* Logo aplikace */}
        <Link to="/dashboard" className="navbar-brand">
          <img src="/images/logo.png" alt="Solar Servis" className="navbar-logo" />
        </Link>

        {/* Tlačítko pro zobrazení/skrytí menu */}
        <button
          className={`navbar-toggler ${menuOpen ? "active" : ""}`}
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={menuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigační menu */}
        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/technicians"
                className={`nav-link ${location.pathname === "/technicians" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Technici
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/clients"
                className={`nav-link ${location.pathname === "/clients" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Klienti
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/reports"
                className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Reporty
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/tasks"
                className={`nav-link ${location.pathname === "/tasks" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Úkoly
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/warehouse"
                className={`nav-link ${location.pathname === "/warehouse" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Sklad
              </Link>
            </li>
            {userRole === "admin" && (
              <li className="nav-item">
                <Link
                  to="/create-user"
                  className={`nav-link ${location.pathname === "/create-user" ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Vytvořit uživatele
                </Link>
              </li>
            )}
            {userRole === "admin" && (
              <li className="nav-item">
                <Link
                  to="/user-management"
                  className={`nav-link ${location.pathname === "/user-management" ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Správa uživatelů
                </Link>
              </li>
            )}
          </ul>

          {/* Nastavení a Odhlášení */}
          <div className="d-flex align-items-center">
            <Link
              to="/settings"
              className={`btn settings-button me-2 ${location.pathname === "/settings" ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <i className="fas fa-cog"></i>
            </Link>

            <button
              className="btn logout-button"
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
            >
              Odhlásit se
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
