import React, { useEffect, useState } from "react";
import { getClients, getTechnicians, getTasks, getWarehouseItems } from "../services/api"; // Import API funkcí

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    technicians: 0,
    tasks: 0,
    warehouse: 0,
  });

  const [recentClients, setRecentClients] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const clients = await getClients();
        const technicians = await getTechnicians();
        const tasks = await getTasks();
        const warehouse = await getWarehouseItems();

        setStats({
          clients: clients.length,
          technicians: technicians.length,
          tasks: tasks.length,
          warehouse: warehouse.length,
        });

        // Pro ukázku posledních klientů a úkolů
        setRecentClients(clients.slice(-5));
        setRecentTasks(tasks.slice(-5));
      } catch (error) {
        console.error("Chyba při načítání dat pro dashboard:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page">
      <div className="container-xl">
        <div className="page-header d-flex justify-content-between align-items-center">
          <h2 className="page-title">Dashboard</h2>
        </div>

        {/* Statistiky */}
        <div className="row row-cards">
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="h1 m-0">{stats.clients}</div>
                <div className="text-muted">Počet klientů</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="h1 m-0">{stats.technicians}</div>
                <div className="text-muted">Počet techniků</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="h1 m-0">{stats.tasks}</div>
                <div className="text-muted">Aktivní úkoly</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="h1 m-0">{stats.warehouse}</div>
                <div className="text-muted">Materiály na skladě</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sekce s posledními daty */}
        <div className="row row-cards mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Poslední přidaní klienti</h4>
              </div>
              <div className="card-body">
                <ul>
                  {recentClients.map((client) => (
                    <li key={client.id}>{client.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Poslední přidané úkoly</h4>
              </div>
              <div className="card-body">
                <ul>
                  {recentTasks.map((task) => (
                    <li key={task.id}>{task.title || "Neznámý úkol"}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder pro grafy */}
        <div className="row row-cards mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Výkon techniků</h4>
              </div>
              <div className="card-body">
                <div id="chart-performance" style={{ height: 300 }}>
                  {/* Zde můžeš přidat knihovnu na grafy */}
                  <div className="text-muted text-center">Graf zatím není</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Stav úkolů</h4>
              </div>
              <div className="card-body">
                <div id="chart-tasks" style={{ height: 300 }}>
                  {/* Zde můžeš přidat další graf */}
                  <div className="text-muted text-center">Graf zatím není</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
