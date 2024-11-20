//services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // URL backendu

// Funkce pro získání všech techniků
export const getTechnicians = async () => {
  try {
    const response = await axios.get(`${API_URL}/technicians`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání techniků:', error);
    throw error;
  }
};
// Funkce pro nahrání souboru ke klientovi
export const uploadClientFile = async (clientId, formData) => { // Přijímáme formData jako parametr
  try {
    const response = await axios.post(`${API_URL}/clients/${clientId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Správné nastavení hlavičky
      },
    });

    return response.data;
  } catch (error) {
    console.error('Chyba při nahrávání souboru:', error);
    throw error;
  }
};


// Funkce pro vytvoření nové složky pro klienta
export const createClientFolder = async (clientId, folderName) => {
  try {
    const response = await axios.post(`${API_URL}/clients/${clientId}/folders`, { folderName });
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření složky:', error);
    throw error;
  }
};




// Funkce pro vytvoření nového technika
export const createTechnician = async (technicianData) => {
  try {
    const response = await axios.post(`${API_URL}/technicians`, technicianData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření technika:', error);
    throw error;
  }
};

// Funkce pro aktualizaci technika
export const updateTechnician = async (id, technicianData) => {
  try {
    const response = await axios.put(`${API_URL}/technicians/${id}`, technicianData);
    return response.data;
  } catch (error) {
    console.error('Chyba při aktualizaci technika:', error);
    throw error;
  }
};

// Funkce pro smazání technika
export const deleteTechnician = async (id) => {
  try {
    await axios.delete(`${API_URL}/technicians/${id}`);
    return { message: 'Technik smazán' };
  } catch (error) {
    console.error('Chyba při mazání technika:', error);
    throw error;
  }
};

// Funkce pro získání všech klientů
export const getClients = async () => {
  try {
    const response = await axios.get(`${API_URL}/clients`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání klientů:', error);
    throw error;
  }
};

// Funkce pro vytvoření nového klienta
export const createClient = async (clientData) => {
  try {
    console.log("Odesílám data do backendu:", clientData); // Přidáme logování
    const response = await fetch('http://localhost:5000/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      throw new Error('Failed to create client');
    }
    const data = await response.json();
    console.log("Odpověď backendu:", data); // Logujeme odpověď backendu
    return data;
  } catch (error) {
    console.error('Chyba při vytváření klienta:', error);
    throw error;
  }
};




// Funkce pro získání všech reportů
export const getReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání reportů:', error);
    throw error;
  }
};

// Funkce pro vytvoření nového reportu
export const createReport = async (reportData) => {
  try {
    const response = await axios.post(`${API_URL}/reports`, reportData);
    return response.data;
  } catch (error) {
    console.error("Chyba v odpovědi backendu:", error.response?.data || error.message);

    throw error;
  }
};

// Funkce pro získání úkolů podle technika
export const getTasksByTechnician = async (technicianId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks?technicianId=${technicianId}`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání úkolů pro technika:', error);
    throw error;
  }
};

// Funkce pro získání všech úkolů
export const getTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání všech úkolů:', error);
    throw error;
  }
};

// Funkce pro vytvoření nového úkolu
export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření úkolu:', error);
    throw error;
  }
};



// Funkce pro aktualizaci úkolu
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Chyba při aktualizaci úkolu:', error);
    throw error;
  }
};

// Funkce pro smazání úkolu
export const deleteTask = async (taskId) => {
  try {
    await axios.delete(`${API_URL}/tasks/${taskId}`);
    return { message: 'Úkol smazán' };
  } catch (error) {
    console.error('Chyba při mazání úkolu:', error);
    throw error;
  }
};

export const updateClient = async (clientId, clientData) => {
  const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, { // Absolutní URL
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
  });

  if (!response.ok) {
      throw new Error('Failed to update client');
  }

  return response.json();
};



export const deleteClient = async (id) => {
  const response = await fetch(`http://localhost:5000/api/clients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Chyba při mazání klienta.');
  }

  return await response.json();
};

// Získání všech materiálů
export const getWarehouseItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/warehouse`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání materiálů:', error);
    throw error;
  }
};

// Přidání nového materiálu
export const addWarehouseItem = async (item) => {
  try {
    const response = await axios.post(`${API_URL}/warehouse`, item);
    return response.data;
  } catch (error) {
    console.error('Chyba při přidávání materiálu:', error);
    throw error;
  }
};


export const updateWarehouseItem = async (id, item) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/warehouse/${id}`, item);
    return response.data;
  } catch (error) {
    console.error("Chyba při aktualizaci materiálu:", error);
    throw error;
  }
};


// Smazání materiálu
export const deleteWarehouseItem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/warehouse/${id}`);
    return response.data;
  } catch (error) {
    console.error('Chyba při mazání materiálu:', error);
    throw error;
  }
};
