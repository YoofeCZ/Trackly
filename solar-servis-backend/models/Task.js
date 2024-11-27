// models/Task.js
import { DataTypes } from 'sequelize';
import sequelize from '../database.js';


const Task = sequelize.define('Task', {
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('task', 'service'), // Typ úkolu: 'task' nebo 'service'
    allowNull: false,
    defaultValue: 'task',
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'in_progress', 'completed', 'missed'),
    allowNull: false,
    defaultValue: 'upcoming', // Výchozí stav
  },
  reason: {
    type: DataTypes.STRING, // Důvod nesplnění (volitelný)
    allowNull: true,
  },
  
});



  export default Task;