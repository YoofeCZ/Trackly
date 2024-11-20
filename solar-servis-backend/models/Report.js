import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Report = sequelize.define('Report', {
  // Datum reportu
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Popis reportu
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Popis není přímo odesílán v handleSubmit, proto nastaveno jako nepovinné
  },
  // Technik
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Technicians',
      key: 'id',
    },
  },
  // Klient
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id',
    },
  },
  // OP kód
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
  // Časová osa
  departureTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  returnTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Použité materiály
  materialUsed: {
    type: DataTypes.JSONB, // Kombinace skladových a vlastních materiálů
    allowNull: true,
  },
  // Náklady
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
  // Vzdálenost a čas z mapy
  travelDistance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  travelDuration: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // Poznámky
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Stav reportu
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Rozpracováno',
  },
});

export default Report;
