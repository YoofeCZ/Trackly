import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { generateWordDocument } from '../services/docxService.js';
import { calculateCosts, calculateTotalTime } from '../services/costService.js';
import { calculateTravelTime } from '../services/directionsService.js';
import Report from '../models/Report.js';
import Technician from '../models/Technician.js';
import Client from '../models/Client.js';
import ChangeLog from '../models/ChangeLog.js';
import Version from '../models/Version.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
// 1. Vytvoření reportu
router.post('/', async (req, res) => {
    try {
        const {
            opCode,
            description,
            departureTime,
            arrivalTime,
            leaveTime,
            returnTime,
            materials,
            hourlyRate,
            travelCost,
            technicianId,
            clientId,
            notes,
            status,
            jobs, // Pole pro více zakázek
        } = req.body;

        const reports = [];

        // Podpora více zakázek
        for (const job of jobs || [{ description, materials, clientId }]) {
            const travelTime = await calculateTravelTime(departureTime, arrivalTime);
            const totalTime = calculateTotalTime(departureTime, leaveTime, returnTime);
            const totalCosts = calculateCosts(job.materials, hourlyRate, travelCost, totalTime);

            const report = await Report.create({
                opCode,
                description: job.description,
                departureTime,
                arrivalTime,
                leaveTime,
                returnTime,
                transitionTime: travelTime,
                materials: job.materials,
                hourlyRate,
                travelCost,
                totalTime,
                totalCosts,
                technicianId,
                clientId: job.clientId,
                notes,
                status,
            });

            reports.push(report);

            // Aktualizace klienta
            if (clientId && opCode) {
                const client = await Client.findByPk(clientId);
                if (client && (!client.opCodes || !client.opCodes.includes(opCode))) {
                    const updatedOpCodes = client.opCodes ? [...client.opCodes, opCode] : [opCode];
                    await client.update({ opCodes: updatedOpCodes });
                }
            }
        }

        res.status(201).json(reports);
    } catch (error) {
        res.status(400).json({ message: 'Chyba při vytváření reportu', error: error.message });
    }
});

// 2. Získání všech reportů s filtrováním
router.get('/', async (req, res) => {
    try {
        const { technicianId, clientId, fromDate, toDate, status } = req.query;
        const filters = {};

        if (technicianId) filters.technicianId = technicianId;
        if (clientId) filters.clientId = clientId;
        if (status) filters.status = status;
        if (fromDate || toDate) {
            filters.date = {};
            if (fromDate) filters.date.$gte = new Date(fromDate);
            if (toDate) filters.date.$lte = new Date(toDate);
        }

        const reports = await Report.findAll({
            where: filters,
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
        res.status(500).json({ message: 'Chyba při ukládání verze' });
    }
});

// 9. Odesílání e-mailů
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
        res.status(500).json({ message: 'Chyba při odesílání emailu' });
    }
});

export default router;
