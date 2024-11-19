import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import sequelize from './database.js';
import technicianRoutes from './routes/technicians.js';
import clientRoutes from './routes/clients.js';
import reportRoutes from './routes/reports.js';
import taskRoutes from './routes/tasks.js';
import superagent from 'superagent';

// Načtení proměnných prostředí
dotenv.config();

// Inicializace aplikace Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Povolit přístup ze všech domén, můžeš to změnit pro specifickou doménu kvůli bezpečnosti
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Middleware pro práci s JSON daty

// Použití technických, klientských a report routes
app.use('/api/technicians', technicianRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes); // Použití /tasks route

// Proxy route pro výpočet vzdálenosti pomocí Google API
app.get('/api/distance', async (req, res) => {
  const { origins, destinations } = req.query;
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // Ověření, že API klíč je dostupný
  if (!GOOGLE_MAPS_API_KEY) {
    return res.status(500).json({ error: 'API klíč není nastaven. Ujistěte se, že je GOOGLE_MAPS_API_KEY definován ve vašem .env souboru.' });
  }

  try {
    // Volání Google Distance Matrix API pomocí superagent
    console.log(`Volání Google API s origins: ${origins}, destinations: ${destinations}`);
    
    const response = await superagent
      .get('https://maps.googleapis.com/maps/api/distancematrix/json')
      .query({
        origins,
        destinations,
        key: GOOGLE_MAPS_API_KEY,
      });

    // Kontrola, zda je odpověď od Google API platná
    if (response.body && response.body.status === 'OK' && response.body.rows.length > 0) {
      const data = response.body;
      console.log('Odpověď Google API:', data);
      res.json(data); // Odeslání odpovědi zpět klientovi
    } else {
      console.error('Neplatná odpověď z Google API:', response.body);
      res.status(500).json({ error: 'Nastala chyba při získávání dat z Google API', detail: response.body });
    }
  } catch (error) {
    console.error('Chyba při volání Google API:', error.response ? error.response.text : error);
    res.status(500).json({ error: 'Nastala chyba při volání Google API', detail: error.response ? error.response.text : error });
  }
});

// Synchronizace databáze
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
