// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Přidání nového úkolu (POST /api/tasks)
router.post('/', async (req, res) => {
    try {
      console.log('Request body:', req.body); // Přidej logování zde
      const task = await Task.create(req.body);
      res.status(201).json(task);
    } catch (error) {
      console.error('Chyba při vytváření úkolu:', error);
      res.status(400).json({ message: 'Chyba při vytváření úkolu', error: error.message });
    }
  });
  

// Získání úkolů (GET /api/tasks nebo GET /api/tasks?technicianId=...)
router.get('/', async (req, res) => {
  try {
    const { technicianId } = req.query;
    let tasks;
    if (technicianId) {
      tasks = await Task.findAll({ where: { technicianId } });
    } else {
      tasks = await Task.findAll(); // Získání všech úkolů, pokud není technicianId zadáno
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Chyba při získávání úkolů', error: error.message });
  }
});

// Získání jednoho úkolu podle ID (GET /api/tasks/:id)
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ message: 'Úkol nenalezen' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Chyba při získávání úkolu', error: error.message });
  }
});

// Aktualizace úkolu podle ID (PUT /api/tasks/:id)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      await task.update(req.body);
      res.status(200).json(task);
    } else {
      res.status(404).json({ message: 'Úkol nenalezen' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Chyba při aktualizaci úkolu', error: error.message });
  }
});

// Smazání úkolu podle ID (DELETE /api/tasks/:id)
router.delete('/:id', async (req, res) => {
  console.log('Mazání úkolu s ID:', req.params.id);
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      await task.destroy();
      console.log('Úkol smazán:', task);
      res.status(200).json({ message: 'Úkol byl úspěšně smazán' });
    } else {
      res.status(404).json({ message: 'Úkol nenalezen' });
    }
  } catch (error) {
    console.error('Chyba při mazání úkolu:', error);
    res.status(500).json({ message: 'Chyba při mazání úkolu', error: error.message });
  }
});


module.exports = router;