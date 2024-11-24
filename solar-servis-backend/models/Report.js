import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import Client from './Client.js';  // Importujte Client před použitím v asociaci

const Report = sequelize.define('Report', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: true,
      isDate: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Technicians',
      key: 'id',
    },
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id',
    },
  },
  opCode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isValidFormat(value) {
        if (!/^[A-Z]{2}-\d{3}-\d{3}$/.test(value)) {
          throw new Error('OP musí být ve formátu XX-123-456.');
        }
      },
    },
  },
  materialUsed: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  totalWorkCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalTravelCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalMaterialCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

export default Report;
