// routes/technicians.js
const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');

// Přidání nového technika
router.post('/', async (req, res) => {
  try {
    const { name, employeeId, email, phone, address } = req.body;
    const technician = await Technician.create({ name, employeeId, email, phone, address });
    res.status(201).json(technician);
  } catch (error) {
    res.status(400).json({ message: 'Chyba při vytváření technika', error: error.message });
  }
});

// Získání všech techniků
router.get('/', async (req, res) => {
  try {
    const technicians = await Technician.findAll();
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při získávání techniků', error: error.message });
  }
});

// Aktualizace technika
router.put('/:id', async (req, res) => {
  try {
    const technicianId = req.params.id;
    const updatedTechnician = await Technician.update(req.body, { where: { id: technicianId }, returning: true });
    res.status(200).json(updatedTechnician[1][0]); // updatedTechnician[1] obsahuje pole se záznamy
  } catch (error) {
    res.status(400).json({ message: 'Chyba při aktualizaci technika', error: error.message });
  }
});

// Smazání technika
router.delete('/:id', async (req, res) => {
  try {
    const technicianId = req.params.id;
    await Technician.destroy({ where: { id: technicianId } });
    res.status(200).json({ message: 'Technik smazán' });
  } catch (error) {
    res.status(400).json({ message: 'Chyba při mazání technika', error: error.message });
  }
});

module.exports = router;