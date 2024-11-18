import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Technicians from './pages/Technicians';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks'; // Importovat stránku s úkoly

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tasks" element={<Tasks />} /> {/* Přidat Route pro úkoly */}
      </Routes>
    </Router>
  );
}


export default App;