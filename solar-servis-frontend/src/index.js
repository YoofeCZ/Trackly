import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Vaše vlastní styly
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Styly pro Bootstrap
import "tabler-react/dist/Tabler.css"; // Styly pro Tabler

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();
