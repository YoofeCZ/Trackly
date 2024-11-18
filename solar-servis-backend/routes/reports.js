const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { generateWordDocument } = require('../services/docxService');
const { calculateCosts, calculateTotalTime } = require('../services/costService');
const Report = require('../models/Report');
const Technician = require('../models/Technician');
const Client = require('../models/Client');
const ChangeLog = require('../models/ChangeLog');
const Version = require('../models/Version');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', async (req, res) => {
  try {
      const {
          opCode,
          description,
          departureTime,
          arrivalTime,
          transitionTime,
          materials,
          hourlyRate,
          travelCost,
          technicianId,
          clientId,
          notes,
          status,
      } = req.body;

      // Výpočet celkového času a nákladů
      const totalTime = calculateTotalTime(departureTime, arrivalTime, transitionTime);
      const totalCosts = calculateCosts(materials, hourlyRate, travelCost, totalTime);

      // Vytvoření reportu
      const report = await Report.create({
          opCode,
          description,
          departureTime,
          arrivalTime,
          transitionTime,
          materials,
          hourlyRate,
          travelCost,
          totalTime,
          totalCosts,
          technicianId,
          clientId,
          notes,
          status,
      });

      // Aktualizace klienta, pokud je OP nové
      if (clientId && opCode) {
          const client = await Client.findByPk(clientId);
          if (client && (!client.opCodes || !client.opCodes.includes(opCode))) {
              const updatedOpCodes = client.opCodes ? [...client.opCodes, opCode] : [opCode];
              await client.update({ opCodes: updatedOpCodes });
          }
      }

      res.status(201).json(report);
  } catch (error) {
      res.status(400).json({ message: 'Chyba při vytváření reportu', error: error.message });
  }
});


// 2. Získání všech reportů
router.get('/', async (req, res) => {
    try {
        const reports = await Report.findAll({
            include: [Technician, Client],
        });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Chyba při získávání reportů', error: error.message });
    }
});

// 3. Získání jednoho reportu
router.get('/:id', async (req, res) => {
  try {
      const report = await Report.findByPk(req.params.id, {
          include: [Client],
      });

      if (!report) {
          return res.status(404).json({ message: 'Report nenalezen' });
      }

      res.status(200).json(report);
  } catch (error) {
      res.status(500).json({ message: 'Chyba při získávání reportu', error: error.message });
  }
});


// 4. Aktualizace reportu
router.put('/:id', async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report nenalezen' });
        }

        const updatedData = req.body;
        await report.update(updatedData);

        // Logování změn
        await ChangeLog.create({
            reportId: report.id,
            changes: JSON.stringify(updatedData),
            changedAt: new Date(),
        });

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Chyba při aktualizaci reportu', error: error.message });
    }
});

// 5. Smazání reportu
router.delete('/:id', async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report nenalezen' });
        }

        await report.destroy();
        res.status(200).json({ message: 'Report byl smazán' });
    } catch (error) {
        res.status(500).json({ message: 'Chyba při mazání reportu', error: error.message });
    }
});

// 6. Nahrávání souborů
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
      const report = await Report.findByPk(req.params.id);
      if (!report) {
          return res.status(404).json({ message: 'Report nenalezen' });
      }

      const filePath = req.file.path;
      const updatedFiles = [...(report.files || []), filePath];
      await report.update({ files: updatedFiles });

      res.status(200).json({ message: 'Soubor nahrán', files: updatedFiles });
  } catch (error) {
      res.status(500).json({ message: 'Chyba při nahrávání souboru', error: error.message });
  }
});


// 7. Generování a ukládání Word dokumentu
router.post('/:id/generate-document', async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findByPk(id);

        if (!report) {
            return res.status(404).json({ message: 'Report nenalezen' });
        }

        const clientDir = path.join(__dirname, '../documents', `client_${report.clientId}`);
        if (!fs.existsSync(clientDir)) {
            fs.mkdirSync(clientDir, { recursive: true });
        }

        const filePath = path.join(clientDir, `report_${report.opCode}.docx`);
        const docBuffer = await generateWordDocument(report);

        fs.writeFileSync(filePath, docBuffer);

        return res.json({ message: 'Dokument byl úspěšně uložen', path: filePath });
    } catch (error) {
        console.error('Chyba při generování dokumentu:', error);
        res.status(500).json({ message: 'Chyba při generování dokumentu' });
    }
});

// 8. Historie verzí
router.post('/:id/save-version', async (req, res) => {
    try {
        const { id } = req.params;
        const { changes, createdBy } = req.body;

        const report = await Report.findByPk(id);
        if (!report) {
            return res.status(404).json({ message: 'Report nenalezen' });
        }

        const lastVersion = await Version.findOne({
            where: { reportId: id },
            order: [['versionNumber', 'DESC']],
        });

        const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        const newVersion = await Version.create({
            reportId: id,
            versionNumber: newVersionNumber,
            changes,
            createdBy,
        });

        return res.json({ message: 'Verze byla úspěšně uložena', version: newVersion });
    } catch (error) {
        console.error('Chyba při ukládání verze:', error);
        res.status(500).json({ message: 'Chyba při ukládání verze' });
    }
});

// 9. Odesílání emailů
router.post('/:id/send-email', async (req, res) => {
    try {
        const { id } = req.params;
        const { recipient, subject, body } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject,
            text: body,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: 'Email byl úspěšně odeslán' });
    } catch (error) {
        console.error('Chyba při odesílání emailu:', error);
        res.status(500).json({ message: 'Chyba při odesílání emailu' });
    }
});



module.exports = router;
