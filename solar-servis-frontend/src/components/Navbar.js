import React, { useState } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
{/* Logo nebo název aplikace */}
<Link to="/dashboard" className="navbar-brand">
  <img src="/images/logo.png" alt="Solar Servis" className="navbar-logo" />
</Link>


        {/* Tlačítko pro zobrazení/skrytí menu na menších obrazovkách */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={menuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigační menu */}
        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/technicians" className="nav-link" onClick={() => setMenuOpen(false)}>
                Technici
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/clients" className="nav-link" onClick={() => setMenuOpen(false)}>
                Klienti
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/reports" className="nav-link" onClick={() => setMenuOpen(false)}>
                Reporty
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/tasks" className="nav-link" onClick={() => setMenuOpen(false)}>
                Úkoly
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/warehouse" className="nav-link" onClick={() => setMenuOpen(false)}>
                Sklad
              </Link>
            </li>
            {/* Tato položka bude zobrazena pouze pro adminy */}
            {userRole === "admin" && (
              <li className="nav-item">
                <Link to="/create-user" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Vytvořit uživatele
                </Link>
              </li>
            )}
            {userRole === "admin" && (
              <li className="nav-item">
                <Link to="/user-management" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Správa uživatelů
                </Link>
              </li>
            )}
          </ul>

          {/* Ikona ozubeného kola a tlačítko Odhlásit se */}
          <div className="d-flex align-items-center">
            {/* Ikona ozubeného kola */}
            <Link
              to="/settings"
              className="btn btn-secondary me-2"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px 10px",
              }}
              onClick={() => setMenuOpen(false)}
            >
              <i className="fas fa-cog"></i> {/* FontAwesome ikona */}
            </Link>
            {/* Tlačítko Odhlásit se */}
            <button
              className="btn btn-danger"
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              style={{
                padding: "5px 15px",
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
