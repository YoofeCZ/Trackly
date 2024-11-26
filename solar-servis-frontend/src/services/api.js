//services/api.js
import axios from 'axios';
import superagent from "superagent";

let API_URL;

if (window.location.hostname === 'localhost') {
  API_URL = 'http://localhost:5000/api'; // Lokální prostředí
} else if (window.location.hostname.startsWith('192.168')) {
  API_URL = 'http://192.168.0.101:5000/api'; // Interní IP
} else {
  API_URL = 'http://188.175.32.34/api'; // Veřejná IP
}

// Funkce pro získání všech techniků
export const getTechnicians = async () => {
  const response = await fetch(`${API_URL}/technicians`);
  return response.json();
};

//Funkce pro Systems a Components
export const getSystems = async () => {
  try {
    const response = await axios.get(`${API_URL}/systems`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání systémů:', error);
    throw error;
  }
};

export const createSystem = async (systemData) => {
  try {
    const response = await axios.post(`${API_URL}/systems`, systemData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření systému:', error);
    throw error;
  }
};

export const updateSystem = async (systemId, systemData) => {
  try {
    const response = await axios.put(`${API_URL}/systems/${systemId}`, systemData);
    return response.data;
  } catch (error) {
    console.error('Chyba při aktualizaci systému:', error);
    throw error;
  }
};

export const deleteSystem = async (systemId) => {
  try {
    await axios.delete(`${API_URL}/systems/${systemId}`);
    return { message: 'Systém byl úspěšně smazán' };
  } catch (error) {
    console.error('Chyba při mazání systému:', error);
    throw error;
  }
};

export const getComponents = async () => {
  try {
    const response = await axios.get(`${API_URL}/components`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání komponent:', error);
    throw error;
  }
};

export const createComponent = async (componentData) => {
  try {
    const response = await axios.post(`${API_URL}/components`, componentData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření komponenty:', error);
    throw error;
  }
};

export const updateComponent = async (componentId, componentData) => {
  try {
    const response = await axios.put(`${API_URL}/components/${componentId}`, componentData);
    return response.data;
  } catch (error) {
    console.error('Chyba při aktualizaci komponenty:', error);
    throw error;
  }
};

export const deleteComponent = async (componentId) => {
  try {
    await axios.delete(`${API_URL}/components/${componentId}`);
    return { message: 'Komponenta byla úspěšně smazána' };
  } catch (error) {
    console.error('Chyba při mazání komponenty:', error);
    throw error;
  }
};
// Přidání nové funkce do ../services/api
export const getComponentsBySystemId = async (systemId) => {
  const response = await fetch(`${API_URL}/components/system/${systemId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch components by system ID');
  }
  return await response.json();
};




// Funkce pro nahrání souboru ke klientovi
export const uploadClientFile = async (clientId, formData) => {
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

// Přihlášení uživatele
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, { username, password });
    return response.data; // Očekáváme token
  } catch (error) {
    console.error('Chyba při přihlášení:', error.response?.data || error.message);
    throw error;
  }
};

// Vytvoření nového uživatele (pouze pro adminy)
export const createUser = async (userData, token) => {
  try {
    const response = await axios.post(`${API_URL}/users/create`, userData, {
      headers: {
        Authorization: `Bearer ${token}`, // Tento token musí být předán správně
      },
    });
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření uživatele:', error.response?.data || error.message);
    throw error;
  }
};


// Získání všech uživatelů (pouze pro adminy)// Získání všech uživatelů (pouze pro adminy)
export const getUsers = async () => {
  const token = localStorage.getItem("token"); // Načti token z localStorage
  if (!token) {
    throw new Error("Přístup odepřen: chybí token.");
  }

  try {
    const response = await axios.get(`${API_URL}/users/all`, {
      headers: {
        Authorization: `Bearer ${token}`, // Ověření přes Bearer token
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Chyba při získávání uživatelů:",
      error.response?.data || error.message
    );

    // Pokud je token neplatný, odhlásíme uživatele
    if (error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.reload(); // Obnovíme stránku, což způsobí přesměrování na login
    }

    throw error;
  }
};


// Funkce pro vytvoření nové složky pro klienta
export const createClientFolder = async (clientId, folderPath) => {
  try {
    const response = await axios.post(`${API_URL}/clients/${clientId}/folders`, { folderPath });
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření složky:', error);
    throw error;
  }
};



// Funkce pro přiřazení OP kódu klientovi
export const assignClientOpCode = async (clientId, opCode) => {
  try {
    const response = await axios.post(`${API_URL}/clients/${clientId}/assign-op`, { opCode });
    return response.data;
  } catch (error) {
    console.error('Chyba při přiřazení OP kódu klientovi:', error.response?.data || error.message);
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

// Funkce pro získání reportu podle ID
export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání reportu:', error);
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
export const getClientById = async (clientId) => {
  try {
    const response = await axios.get(`${API_URL}/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Chyba při načítání klienta:', error);
    throw error;
  }
};



// Funkce pro vytvoření nového klienta
export const createClient = async (clientData) => {
  try {
    console.log("Odesílám data do backendu:", clientData); // Přidáme logování
    const response = await fetch(`${API_URL}/clients`, {
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

//Sekce pro podúkoly
// Funkce pro získání podúkolů pro konkrétní úkol
export const getSubtasks = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/subtasks`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání podúkolů:', error);
    throw error;
  }
};

// Funkce pro vytvoření nového podúkolu
export const createSubtask = async (taskId, subtaskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/subtasks`, subtaskData);
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření podúkolu:', error);
    throw error;
  }
};

// Funkce pro aktualizaci podúkolu
export const updateSubtask = async (subtaskId, subtaskData) => {
  try {
    const response = await axios.put(`${API_URL}/subtasks/${subtaskId}`, subtaskData);
    return response.data;
  } catch (error) {
    console.error('Chyba při aktualizaci podúkolu:', error);
    throw error;
  }
};

// Funkce pro smazání podúkolu
export const deleteSubtask = async (subtaskId) => {
  try {
    await axios.delete(`${API_URL}/subtasks/${subtaskId}`);
    return { message: 'Podúkol byl smazán' };
  } catch (error) {
    console.error('Chyba při mazání podúkolu:', error);
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

export const calculateCosts = (materials = [], hourlyRate, travelCost) => {
  if (!Array.isArray(materials)) {
      throw new Error("Materials must be an array");
  }

  const materialCost = materials.reduce((sum, material) => {
      const cost = material.usedQuantity * material.price;
      return sum + (material.chargeCustomer ? cost : 0);
  }, 0);

  return materialCost + hourlyRate + travelCost;
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
// Funkce pro vytvoření nového úkolu včetně podúkolů
export const createTask = async (taskData) => {
  try {
    const { subtasks, ...task } = taskData; // Oddělíme podúkoly od úkolu
    const response = await axios.post(`${API_URL}/tasks`, task);

    // Pokud jsou přítomné podúkoly, vytvoříme je
    if (subtasks && subtasks.length > 0) {
      await Promise.all(
        subtasks.map((subtask) => createSubtask(response.data.id, subtask))
      );
    }

    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření úkolu:', error);
    throw error;
  }
};

// Funkce pro aktualizaci úkolu včetně podúkolů
export const updateTask = async (taskId, taskData) => {
  try {
    const { subtasks, ...task } = taskData; // Oddělíme podúkoly od úkolu
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, task);

    // Pokud jsou přítomné podúkoly, aktualizujeme je
    if (subtasks && subtasks.length > 0) {
      await Promise.all(
        subtasks.map((subtask) =>
          subtask.id
            ? updateSubtask(subtask.id, subtask) // Aktualizace stávajícího podúkolu
            : createSubtask(taskId, subtask)    // Vytvoření nového podúkolu
        )
      );
    }

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
  const response = await fetch(`${API_URL}/clients/${clientId}`, { // Absolutní URL
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
  const response = await fetch(`${API_URL}/clients/${id}`, {
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


// Načtení materiálů ze skladu
export const fetchMaterialsFromWarehouse = async () => {
  try {
      const response = await superagent.get(`${API_URL}/warehouse`);
      return response.body;
  } catch (error) {
      console.error("Chyba při načítání materiálů ze skladu:", error);
      throw error;
  }
};

// Funkce pro aktualizaci skladového materiálu
// Aktualizace položky skladu
export const updateWarehouseItem = async (id, data) => {
  try {
      const response = await superagent
          .put(`${API_URL}/warehouse/${id}`)
          .send(data);
      return response.body;
  } catch (error) {
      console.error("Chyba při aktualizaci skladu:", error);
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


// Aktualizace hesla uživatele (pouze admin)
export const updateUserPassword = async (userId, newPassword, token) => {
  if (!userId || !newPassword || !token) {
    throw new Error("Chybí userId, nové heslo nebo token.");
  }

  try {
    const response = await axios.put(
      `${API_URL}/users/${userId}/password`, // Správná cesta
      { password: newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Chyba při aktualizaci hesla uživatele:", error.response?.data || error.message);
    throw error;
  }
};

// Funkce pro získání aktuálních nastavení
export const getSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
  } catch (error) {
    console.error('Chyba při získávání nastavení:', error);
    throw error;
  }
};

// Funkce pro aktualizaci nastavení
export const updateSettings = async (settingsData) => {
  try {
    const response = await axios.put(`${API_URL}/settings`, settingsData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error('Chyba při aktualizaci nastavení:', error);
    throw error;
  }
};

// Funkce pro vytvoření nových nastavení
export const createSettings = async (defaultSettings) => {
  try {
    const response = await axios.post(`${API_URL}/settings`, defaultSettings, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error('Chyba při vytváření nastavení:', error);
    throw error;
  }
};

// Smazání uživatele
export const deleteUser = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Přístup odepřen: chybí token.");
  }

  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Chyba při mazání uživatele:", error.response?.data || error.message);
    throw error;
  }
};


// Aktualizace role uživatele
export const updateUserRole = async (userId, newRole) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Přístup odepřen: chybí token.");
  }

  try {
    const response = await axios.put(
      `${API_URL}/users/${userId}/role`,
      { role: newRole },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Chyba při aktualizaci role uživatele:", error.response?.data || error.message);
    throw error;
  }
};

