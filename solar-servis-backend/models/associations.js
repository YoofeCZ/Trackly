import Report from './Report.js';
import Client from './Client.js';
import Technician from './Technician.js';

// Definice asociace mezi Technician a Report
Technician.hasMany(Report, { foreignKey: 'technicianId', as: 'reports' });
Report.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' });

// Definice asociace mezi Client a Report
Client.hasMany(Report, { foreignKey: 'clientId', as: 'reports' });
Report.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
