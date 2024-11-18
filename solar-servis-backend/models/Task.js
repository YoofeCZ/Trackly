// models/Task.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Task = sequelize.define('Task', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    clientId: {  // Změna na 'clientId' pro konzistenci s ID klienta
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    technicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  

module.exports = Task;