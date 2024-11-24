import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  // Získání role uživatele z tokenu
  const token = localStorage.getItem("token");
  let userRole = null;

  if (token) {
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Dekódování JWT
    userRole = decodedToken.role;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        {/* Logo nebo název aplikace */}
        <Link to="/dashboard" className="navbar-brand">
          Solar Servis
        </Link>

        {/* Tlačítko pro zobrazení/skrytí menu na menších obrazovkách */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigační menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/technicians" className="nav-link">
                Technici
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/clients" className="nav-link">
                Klienti
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/reports" className="nav-link">
                Reporty
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/tasks" className="nav-link">
                Úkoly
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/warehouse" className="nav-link">
                Sklad
              </Link>
            </li>
            {/* Tato položka bude zobrazena pouze pro adminy */}
            {userRole === "admin" && (
              <li className="nav-item">
                <Link to="/create-user" className="nav-link">
                  Vytvořit uživatele
                </Link>
              </li>
            )}
          </ul>

          {/* Tlačítko Odhlásit se */}
          <button
            className="btn btn-danger ms-auto"
            onClick={onLogout}
            style={{
              marginLeft: "auto",
              padding: "5px 15px",
            }}
          >
            Odhlásit se
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
