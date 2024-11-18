const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Import připojení k databázi

const Client = sequelize.define('Client', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  files: {
    type: DataTypes.ARRAY(DataTypes.JSON), // JSON pole pro soubory
    allowNull: false,
    defaultValue: [], // Inicializace prázdným polem
  },
  opCodes: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Pole pro více OP
    allowNull: true,
    defaultValue: [], // Výchozí prázdné pole
    validate: {
      // Validace, že `opCodes` je pole řetězců
      isArrayOfStrings(value) {
        if (!Array.isArray(value)) {
          throw new Error('opCodes musí být pole řetězců.');
        }
        value.forEach((code) => {
          if (typeof code !== 'string' || !code.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error('Každý OP musí být řetězec obsahující pouze písmena a číslice.');
          }
        });
      },
    },
  },
});

module.exports = Client;
