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
    clientId: {  // Změna na 'clientId' pro konzistenci s ID klienta
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    technicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  

  export default Task;