import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Client from '../models/Client.js';
import { fileURLToPath } from 'url';

// Vytvoření ekvivalentu `__dirname` v ES Modulech
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializace routeru
const router = express.Router();

// Vytvořit složku 'uploads', pokud neexistuje
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Nastavení úložiště pro multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const clientId = req.params.id;
      const client = await Client.findByPk(clientId);

      if (!client) {
        return cb(new Error('Klient nenalezen'));
      }

      const clientName = client.name.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, '_');
      const clientDir = path.join(uploadDir, clientName);

      // Vytvořit složku klienta, pokud neexistuje
      if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir, { recursive: true });
      }

      cb(null, clientDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


// Přidání nového klienta
router.post('/', async (req, res) => {
  try {
    console.log("Tělo požadavku:", req.body); // Logování těla požadavku
    const { opCodes, ...clientData } = req.body;

    // Vytvoření nového klienta
    const newClient = await Client.create({ ...clientData, opCodes });
    console.log("Uložený klient:", newClient); // Logujeme nově vytvořeného klienta

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Chyba při vytváření klienta:', error);
    res.status(500).json({ message: 'Chyba při vytváření klienta', error: error.message });
  }
});





// Získání všech klientů

router.get('/', async (req, res) => {
    try {
        const clients = await Client.findAll({
            attributes: ['id', 'name', 'email', 'phone', 'address'],
        });
        res.json(clients);
    } catch (error) {
        console.error('Chyba při načítání klientů:', error);
        res.status(500).json({ error: 'Chyba při načítání klientů.' });
    }
});


// Přidání souboru ke klientovi
router.post('/:id/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Žádný soubor nebyl nahrán.' });
    }

    const clientId = req.params.id;
    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }

    const newFile = {
      name: req.file.originalname,
      url: `/uploads/${client.name.replace(/[^a-zA-Z0-9]/g, '_')}/${req.file.filename}`,
      type: req.file.mimetype,
    };

    if (!Array.isArray(client.files)) {
      client.files = [];
    }

    client.files.push(newFile);
    await client.save();

    res.status(200).json(newFile);
  } catch (error) {
    console.error('Chyba při nahrávání souboru:', error);
    res.status(500).json({ message: 'Chyba při nahrávání souboru', error: error.message });
  }
});

// Získání všech souborů a složek klienta
router.get('/:id/files', async (req, res) => {
  const clientId = req.params.id;
  const folderPath = req.query.path || ''; // Cesta ke složce, pokud je zadaná

  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }

    const clientName = client.name.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, '_');
    const fullPath = path.join(uploadDir, clientName, folderPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Složka nenalezena' });
    }

    const filesAndFolders = fs.readdirSync(fullPath).map(item => {
      const itemPath = path.join(fullPath, item);
      const stats = fs.statSync(itemPath);
      return {
        name: item,
        isDirectory: stats.isDirectory(),
        path: path.join(folderPath, item).replace(/\\/g, '/'), // Vytvoření relativní cesty pro FileManager
        updatedAt: stats.mtime.toISOString(),
        size: stats.isDirectory() ? undefined : stats.size,
      };
    });

    res.status(200).json({ files: filesAndFolders });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při získávání souborů', error: error.message });
  }
});

// Vytvoření nové podsložky
router.post('/:id/folders', async (req, res) => {
  const clientId = req.params.id;
  const { folderName } = req.body;

  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }

    const clientName = client.name.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, '_');
    const folderPath = path.join(uploadDir, clientName, folderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Vrátíme správné informace o složce
    res.status(201).json({
      name: folderName,
      isDirectory: true,
      path: `/uploads/${clientName}/${folderName}`.replace(/\\/g, '/'), // Správný relativní path
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při vytváření složky', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const clientId = req.params.id;
  try {
    const client = await Client.findByPk(clientId); // Použití Sequelize pro nalezení klienta
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }
    await client.destroy(); // Smazání klienta
    res.status(200).json({ message: 'Klient byl úspěšně smazán.' });
  } catch (error) {
    res.status(500).json({ message: 'Chyba při mazání klienta', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
      const { opCodes, ...clientData } = req.body;
      const client = await Client.findByPk(req.params.id);
      if (!client) {
          return res.status(404).json({ message: 'Klient nenalezen' });
      }
      await client.update({ ...clientData, opCodes });
      res.status(200).json(client);
  } catch (error) {
      console.error('Chyba při aktualizaci klienta:', error);
      res.status(500).json({ message: 'Chyba při aktualizaci klienta', error: error.message });
  }
});

router.post('/:id/assign-op', async (req, res) => {
  try {
    const clientId = req.params.id; // Získání ID klienta z parametru
    const { opCode } = req.body; // Získání OP kódu z těla požadavku

    const client = await Client.findByPk(clientId); // Vyhledání klienta podle ID
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }

    // Kontrola, zda OP kódy již existují, a přidání nového OP kódu
    const updatedOpCodes = client.opCodes ? [...client.opCodes, opCode] : [opCode];
    await client.update({ opCodes: updatedOpCodes });

    res.status(200).json({ message: 'OP kód byl přiřazen klientovi', opCodes: updatedOpCodes });
  } catch (error) {
    console.error('Chyba při přiřazování OP kódu klientovi:', error);
    res.status(500).json({ message: 'Chyba při přiřazování OP kódu klientovi', error: error.message });
  }
});




export default router;