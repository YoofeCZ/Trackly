// routes/files.js

import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { getClientById } from './clients.js'; // Funkce pro získání klienta podle ID

const router = express.Router();
const __dirname = process.cwd(); // Pokud používáte ES6 moduly
const BASE_DIR = path.join(__dirname, 'uploads'); // Upravte cestu podle potřeby

router.use(
  fileUpload({
    createParentPath: true,
  })
);

// Middleware pro nastavení cesty podle `clientId`
router.use('/clients/:clientId', (req, res, next) => {
  req.clientDir = path.join(BASE_DIR, req.params.clientId);
  // Ujistěte se, že adresář pro klienta existuje
  if (!fs.existsSync(req.clientDir)) {
    fs.mkdirSync(req.clientDir, { recursive: true });
  }
  next();
});

router.use('/clients/:clientId', async (req, res, next) => {
    try {
      const client = await getClientById(req.params.clientId);
      const clientFolderName = client.name.replace(/\s+/g, '_'); // Nahrazení mezer podtržítky
      req.clientDir = path.join(BASE_DIR, clientFolderName);
      if (!fs.existsSync(req.clientDir)) {
        fs.mkdirSync(req.clientDir, { recursive: true });
      }
      next();
    } catch (error) {
      console.error('Chyba při získávání klienta:', error);
      res.status(500).send({ error: 'Nepodařilo se načíst klienta' });
    }
  });


  // Endpoint pro stahování souborů
  router.get('/clients/:clientId/files/download', (req, res) => {
    const filePath = path.join(req.clientDir, req.query.path || '');

    // Ověřte, že soubor existuje
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Soubor nenalezen:', filePath);
            if (!res.headersSent) {
                res.status(404).send({ error: 'Soubor nenalezen' });
            }
            return;
        }

        // Odesílání souboru
        res.download(filePath, (err) => {
            if (err) {
                console.error('Chyba při stahování souboru:', err);
                if (!res.headersSent) {
                    res.status(500).send({ error: 'Chyba při stahování souboru' });
                }
            }
        });
    });
});

  

// Endpoint pro získání seznamu souborů a složek
router.get('/clients/:clientId/files', (req, res) => {
    const currentPath = path.join(req.clientDir, req.query.path || '');
    fs.readdir(currentPath, { withFileTypes: true }, (err, items) => {
      if (err) {
        return res.status(500).send({ error: 'Nelze načíst adresář' });
      }
      const files = items.map((item) => {
        console.log(`Položka: ${item.name}, je složka: ${item.isDirectory()}`); // Logování
        const itemPath = path.join(currentPath, item.name);
        const stats = fs.statSync(itemPath);
        return {
          name: item.name,
          type: item.isDirectory() ? 'folder' : 'file',
          path: path.join(req.query.path || '', item.name),
          size: item.isDirectory() ? null : stats.size,
          updatedAt: stats.mtime,
        };
      });
      res.send({ files });
    });
  });
  
  
  
  
  

router.use('/clients/:clientId', (req, res, next) => {
    console.log('Middleware pro clientId:', req.params.clientId);
    req.clientDir = path.join(BASE_DIR, req.params.clientId);
    if (!fs.existsSync(req.clientDir)) {
      fs.mkdirSync(req.clientDir, { recursive: true });
    }
    next();
  });

  
// Endpoint pro vytvoření nové složky
router.post('/clients/:clientId/files/folder', (req, res) => {
    const folderPath = path.join(req.clientDir, req.body.path || '', req.body.name);
    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        return res.status(500).send({ error: 'Nelze vytvořit složku' });
      }
      res.send({ message: 'Složka byla úspěšně vytvořena' });
    });
  });
  
  
  
  
  

// Endpoint pro smazání souboru nebo složky
router.delete('/clients/:clientId/files', (req, res) => {
  const itemPath = path.join(req.clientDir, req.body.path);
  fs.stat(itemPath, (err, stats) => {
    if (err) {
      return res.status(500).send({ error: 'Položka nebyla nalezena' });
    }
    if (stats.isDirectory()) {
      fs.rmdir(itemPath, { recursive: true }, (err) => {
        if (err) {
          return res.status(500).send({ error: 'Nelze smazat složku' });
        }
        res.send({ message: 'Složka byla úspěšně smazána' });
      });
    } else {
      fs.unlink(itemPath, (err) => {
        if (err) {
          return res.status(500).send({ error: 'Nelze smazat soubor' });
        }
        res.send({ message: 'Soubor byl úspěšně smazán' });
      });
    }
  });
});

// Endpoint pro nahrávání souborů
router.post('/clients/:clientId/files/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
      return res.status(400).send({ error: 'Žádný soubor nebyl nahrán' });
    }
  
    try {
      // Získání klienta a jeho složky
      const client = await getClientById(req.params.clientId);
      const clientFolderName = client.name.replace(/\s+/g, '_'); // Nahrazení mezer podtržítky
      const clientDir = path.join(BASE_DIR, clientFolderName);
  
      // Cesta k uložení souboru
      const uploadPath = path.join(clientDir, req.body.path || '', req.files.file.name);
  
      // Zajistěte existenci složky
      if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
      }
  
      // Uložení souboru
      await req.files.file.mv(uploadPath);
  
      res.send({ message: 'Soubor byl úspěšně nahrán' });
    } catch (err) {
      console.error('Chyba při nahrávání souboru:', err);
      res.status(500).send({ error: 'Chyba při nahrávání souboru' });
    }
  });
  
  
  

export default router;
