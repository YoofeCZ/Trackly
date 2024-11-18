const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Version = sequelize.define('Version', {
    reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Reports', // Název tabulky s reporty
            key: 'id',
        },
    },
    versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    changes: {
        type: DataTypes.JSONB, // Záznam provedených změn
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Version;
