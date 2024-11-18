// Načtení balíčků
require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./database'); // Načtení připojení k databázi
const technicianRoutes = require('./routes/technicians'); // Načtení technicians routes
const clientRoutes = require('./routes/clients'); // Načtení klientských routes
const reportRoutes = require('./routes/reports'); // Načtení report routes
// index.js - Přidání /tasks route
const taskRoutes = require('./routes/tasks'); // Import pro tasks route



// Načtení proměnných prostředí
dotenv.config();

// Inicializace aplikace Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Middleware pro práci s JSON daty

// Použití technických, klientských a report routes
app.use('/api/technicians', technicianRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes); // Použití /tasks route

// index.js - Synchronizace databáze
sequelize.sync({ alter: true }) // Použijeme alter pro přidání nových tabulek bez mazání existujících dat
  .then(() => {
    console.log('Databáze připojena a tabulky synchronizovány');
    app.listen(PORT, () => {
      console.log(`Server běží na portu: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Chyba při připojování k databázi:', error);
  });

// Základní trasa pro ověření funkčnosti serveru
app.get('/', (req, res) => {
  res.send('Solar Servis API běží...');
});
