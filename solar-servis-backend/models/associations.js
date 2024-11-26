// models/associations.js
import sequelize from '../database.js';
import Report from './Report.js';
import Client from './Client.js';
import Technician from './Technician.js';
import System from './System.js';
import Component from './Component.js';

// Definice asociací

// Asociace mezi Technician a Report
Technician.hasMany(Report, { foreignKey: 'technicianId', as: 'reports' });
Report.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' });

// Asociace mezi Client a Report
Client.hasMany(Report, { foreignKey: 'clientId', as: 'reports' });
Report.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Asociace mezi System a Component
System.hasMany(Component, { foreignKey: 'systemId', as: 'components' });
Component.belongsTo(System, { foreignKey: 'systemId', as: 'system' });

// Asociace mezi System a Report
System.hasMany(Report, { foreignKey: 'systemId', as: 'reports' });
Report.belongsTo(System, { foreignKey: 'systemId', as: 'system' });

// Asociace mezi Component a Report
Component.hasMany(Report, { foreignKey: 'componentId', as: 'reports' });
Report.belongsTo(Component, { foreignKey: 'componentId', as: 'component' });

//Asociace mezi System a Client
System.hasMany(Client, { foreignKey: 'systemId', as: 'clients' });
Client.belongsTo(System, { foreignKey: 'systemId', as: 'system' });

// Export všech modelů pro snadný import v jiných částech aplikace
export {
  sequelize,
  Report,
  Client,
  Technician,
  System,
  Component,
};
