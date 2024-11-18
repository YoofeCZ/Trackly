import React, { useEffect, useState } from 'react';
import { getReports, createReport } from '../services/api';

function Reports() {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    date: '',
    description: '',
    technicianId: '',
    clientId: '',
    materialUsed: '',
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Chyba při načítání reportů:', error);
      }
    };

    fetchReports();
  }, []);

  const handleAddReport = async () => {
    try {
      const createdReport = await createReport(newReport);
      setReports([...reports, createdReport]);
      setNewReport({
        date: '',
        description: '',
        technicianId: '',
        clientId: '',
        materialUsed: '',
      });
    } catch (error) {
      console.error('Chyba při přidávání reportu:', error);
    }
  };

  return (
    <div>
      <h2>Reporty</h2>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            {report.date} - {report.description}
          </li>
        ))}
      </ul>
      <div>
        <h3>Přidat nový report</h3>
        <input
          type="date"
          value={newReport.date}
          onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
        />
        <textarea
          value={newReport.description}
          onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
          placeholder="Popis zásahu"
        />
        <input
          type="text"
          value={newReport.technicianId}
          onChange={(e) => setNewReport({ ...newReport, technicianId: e.target.value })}
          placeholder="ID Technika"
        />
        <input
          type="text"
          value={newReport.clientId}
          onChange={(e) => setNewReport({ ...newReport, clientId: e.target.value })}
          placeholder="ID Klienta"
        />
        <button onClick={handleAddReport}>Přidat Report</button>
      </div>
    </div>
  );
}

export default Reports;