import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Client from '../models/Client.js';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import System from '../models/System.js';


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

router.delete('/:id/files', async (req, res) => {
  const clientId = req.params.id;
  const { path: relativePath } = req.body; // Získání cesty z těla požadavku

  try {
      const client = await Client.findByPk(clientId);
      if (!client) {
          return res.status(404).json({ message: 'Klient nenalezen.' });
      }

      const clientName = slugify(client.name, { lower: true, strict: true });
      const fullPath = path.join(uploadDir, clientName, relativePath);

      if (!fs.existsSync(fullPath)) {
          return res.status(404).json({ message: 'Soubor nebo složka nenalezena.' });
      }

      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
          fs.rmdirSync(fullPath, { recursive: true });
      } else {
          fs.unlinkSync(fullPath);
      }

      res.status(200).json({ message: 'Soubor nebo složka byla úspěšně odstraněna.' });
  } catch (error) {
      console.error('Chyba při mazání souboru nebo složky:', error);
      res.status(500).json({ message: 'Chyba při mazání souboru nebo složky.', error: error.message });
  }
});

// Nastavení úložiště pro multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const clientId = req.params.id;
      const client = await Client.findByPk(clientId);

      if (!client) {
        return cb(new Error('Klient nenalezen'));
      }

      const clientName = slugify(client.name, { lower: true, strict: true });
      const clientDir = path.join(uploadDir, clientName);

      if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir, { recursive: true });
      }

      cb(null, clientDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Získání přípony souboru (např. .png, .jpg)
    const extension = path.extname(file.originalname);
    // Získání jména souboru bez přípony
    const baseName = path.basename(file.originalname, extension);
    // Použití slugify pouze na jméno souboru, přípona zůstane zachována
    const safeFileName = `${slugify(baseName, { lower: true, strict: true })}${extension}`;
    cb(null, `${Date.now()}-${safeFileName}`);
  },
  
});


const upload = multer({ storage });

router.get('/clients/:clientId/files', async (req, res) => {
  try {
      const clientId = req.params.clientId;
      const clientPath = path.join(__dirname, 'uploads', clientId); // Složka pro daného klienta
      if (!fs.existsSync(clientPath)) {
          return res.status(404).json({ message: 'Složka klienta neexistuje' });
      }

      const files = fs.readdirSync(clientPath).map(file => ({
          name: file,
          isDirectory: fs.statSync(path.join(clientPath, file)).isDirectory(),
          path: `/${clientId}/${file}`,
      }));

      res.status(200).json({ files });
  } catch (error) {
      console.error('Chyba při načítání souborů:', error);
      res.status(500).json({ message: 'Chyba při načítání souborů', error: error.message });
  }
});


// Přidání nového klienta
router.post('/', async (req, res) => {
  try {
    const { opCodes, systemId, ...clientData } = req.body;

    // Ověření existence systému
    const system = await System.findByPk(systemId);
    if (!system) {
      return res.status(400).json({ message: 'Systém nenalezen' });
    }

    // Vytvoření nového klienta s přiřazeným systémem
    const newClient = await Client.create({ ...clientData, opCodes, systemId });
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
      attributes: ['id', 'name', 'email', 'phone', 'address', 'opCodes'],
      include: [
        {
          model: System,
          as: 'system',
          attributes: ['id', 'name'],
        },
      ],
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

    const filePath = `/uploads/${slugify(client.name, { lower: true, strict: true })}/${req.file.filename}`;

    const uploadedFile = {
      name: req.file.originalname, // Původní název souboru
      isDirectory: false, // Jedná se o soubor, nikoli složku
      path: filePath,
      updatedAt: new Date().toISOString(),
      size: req.file.size,
    };

    res.status(200).json(uploadedFile);
  } catch (error) {
    console.error('Chyba při nahrávání souboru:', error);
    res.status(500).json({ message: 'Chyba při nahrávání souboru', error: error.message });
  }
});


// Získání všech souborů a složek klienta
router.get('/:id/files', async (req, res) => {
  const clientId = req.params.id;
  const folderPath = req.query.path || ''; // Relativní cesta ke složce

  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }

    const clientName = slugify(client.name, { lower: true, strict: true });
    const fullPath = path.join(uploadDir, clientName, folderPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Složka nenalezena' });
    }

    const filesAndFolders = fs.readdirSync(fullPath).map((item) => {
      const itemPath = path.join(fullPath, item);
      const stats = fs.statSync(itemPath);
      console.log("Přidání souboru/složky:", item, stats.isDirectory());
      return {
        name: item,
        isDirectory: stats.isDirectory(),
        path: path.join(folderPath, item).replace(/\\/g, '/'),
        updatedAt: stats.mtime.toISOString(),
        size: stats.isDirectory() ? undefined : stats.size,
      };
    });

    res.status(200).json({ files: filesAndFolders });
  } catch (error) {
    console.error('Chyba při načítání souborů:', error);
    res.status(500).json({ message: 'Chyba při načítání souborů', error: error.message });
  }
});





// Vytvoření nové podsložky
router.post('/:id/folders', async (req, res) => {
  const clientId = parseInt(req.params.id, 10); // Převod ID na číslo
  const { folderPath } = req.body; // Celá cesta složky

  if (isNaN(clientId)) {
    return res.status(400).json({ message: 'Neplatné ID klienta.' });
  }

  try {
    const client = await Client.findByPk(clientId); // Vyhledání klienta
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen.' });
    }

    const clientName = slugify(client.name, { lower: true, strict: true });
    const fullPath = path.join(uploadDir, clientName, folderPath); // Složíme absolutní cestu

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true }); // Vytvoříme cestu
    }

    res.status(201).json({
      name: path.basename(folderPath), // Název složky
      isDirectory: true,
      path: `/uploads/${clientName}/${folderPath}`.replace(/\\/g, '/'), // Vrací relativní cestu
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chyba při vytváření složky:', error);
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

// Aktualizace klienta
router.put('/:id', async (req, res) => {
  try {
    const { opCodes, systemId, ...clientData } = req.body;

    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Klient nenalezen' });
    }

    // Ověření existence systému, pokud je poskytnut
    if (systemId) {
      const system = await System.findByPk(systemId);
      if (!system) {
        return res.status(400).json({ message: 'Systém nenalezen' });
      }
    }

    await client.update({ ...clientData, opCodes, systemId });
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