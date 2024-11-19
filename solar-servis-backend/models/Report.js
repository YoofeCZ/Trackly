import { DataTypes } from 'sequelize';
import sequelize from '../database.js'; // Přidání .js přípony pro správný import v ESM

const Report = sequelize.define('Report', {
  // Identifikace zakázky
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  opCode: {
    type: DataTypes.STRING, // OP bude jedinečné pro report
    allowNull: false,
    validate: {
        isValidFormat(value) {
            if (!/^[A-Z]{2}-\d{3}-\d{3}$/.test(value)) {
                throw new Error('OP musí být ve formátu OP-323-332.');
            }
        },
    },
},

  // Časová osa
  departureTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  leaveTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  returnTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  transitionTime: {
    type: DataTypes.INTEGER, // Čas přejezdu v minutách
    allowNull: true,
  },
  totalTime: {
    type: DataTypes.INTEGER, // Celkový čas v minutách
    allowNull: true,
  },

  // Použitý materiál
  materialUsed: {
    type: DataTypes.JSONB, // Seznam materiálů: {name, quantity, price}
    allowNull: true,
  },
  files: {
    type: DataTypes.JSONB,
    defaultValue: [],
},
  totalMaterialCost: {
    type: DataTypes.FLOAT, // Celková cena za materiál
    allowNull: true,
  },

  // Náklady a výpočet ceny
  hourlyRate: {
    type: DataTypes.FLOAT, // Hodinová sazba technika
    allowNull: true,
  },
  travelCost: {
    type: DataTypes.FLOAT, // Cestovní náklady
    allowNull: true,
  },
  totalWorkCost: {
    type: DataTypes.FLOAT, // Celkové náklady na práci
    allowNull: true,
  },
  totalCost: {
    type: DataTypes.FLOAT, // Celková cena zakázky
    allowNull: true,
  },

  // Stav zakázky
  status: {
    type: DataTypes.STRING, // Stav zakázky: Rozpracováno, Dokončeno, Čeká na schválení
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT, // Další poznámky
    allowNull: true,
  },

  // Elektronický podpis
  technicianSignature: {
    type: DataTypes.STRING, // Uloží cestu k souboru s podpisem
    allowNull: true,
  },


  opCode: {
    type: DataTypes.STRING, // OP bude jedinečné pro report
},
clientId: {
    type: DataTypes.INTEGER,
    references: { model: 'Clients', key: 'id' }, // Vazba na klienta
    allowNull: true,
},

});



export default Report; // Použití export default pro správný import v ESM
