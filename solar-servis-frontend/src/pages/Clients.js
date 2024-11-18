//Cleints.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message } from 'antd';
import { getClients, createClient, createClientFolder,deleteClient, updateClient } from '../services/api';
import { FileManager } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';
import { useLocation } from 'react-router-dom';

const Clients = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || ''; // Načtení výchozího vyhledávacího termínu
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]); // Pro filtrované klienty
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]); // Pro filtrované soubory
  const [clientSearchTerm, setClientSearchTerm] = useState(initialSearch); // Vyhledávání klientů
  const [fileSearchTerm, setFileSearchTerm] = useState(''); // Vyhledávání souborů
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileManagerVisible, setIsFileManagerVisible] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [newClient, setNewClient] = useState({  
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    opCode: '', // Přidání pole opCode
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        setFilteredClients(data); // Inicializujeme filtrované klienty
        setClientSearchTerm(initialSearch); // Nastavení výchozího vyhledávání
      } catch (error) {
        console.error('Chyba při načítání klientů:', error);
      }
    };
  
    fetchClients();
  }, [initialSearch]); // Pouze jednou při mountnutí komponenty
  
  
  useEffect(() => {
    if (clientSearchTerm.trim() === '') {
      setFilteredClients(clients); // Pokud není zadán vyhledávací termín, zobrazíme všechny klienty
    } else {
      const lowerCaseSearchTerm = clientSearchTerm.toLowerCase();
      const filtered = clients.filter((client) =>
        (client.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (client.email || '').toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [clientSearchTerm, clients]);
  
  useEffect(() => {
    if (fileSearchTerm.trim() === '') {
      setFilteredFiles(files); // Pokud není zadán vyhledávací termín, zobrazíme všechny soubory
    } else {
      const lowerCaseSearchTerm = fileSearchTerm.toLowerCase();
      const filtered = files.filter((file) =>
        (file.name || '').toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredFiles(filtered);
    }
  }, [fileSearchTerm, files]);
  

  const handleAddClient = async () => {
    try {
      const response = await createClient(newClient); // newClient obsahuje opCodes
      console.log(response); // Zkontrolujte, co backend vrací
      message.success('Klient úspěšně přidán!');
      setIsModalOpen(false);
      setNewClient({ name: '', email: '', phone: '', address: '', company: '', opCodes: [] }); // Reset
      const updatedClients = await getClients();
      setClients(updatedClients);
    } catch (error) {
      message.error('Chyba při přidávání klienta.');
      console.error('Chyba při přidávání klienta:', error);
    }
  };
  
  

  const handleShowFiles = async (client) => {
    if (!client) return; // Ochrana proti volání s null nebo undefined
    try {
      setCurrentClient(client);
      setIsFileManagerVisible(true);

      const response = await fetch(`http://localhost:5000/api/clients/${client.id}/files`);
      const data = await response.json();

      if (Array.isArray(data.files)) {
        const formattedFiles = data.files.map(file => ({
          ...file,
          isDirectory: file.type === 'folder' || file.isDirectory,
          path: file.url || `/${file.name}`,
        }));
        setFiles(formattedFiles);
        setFilteredFiles(formattedFiles); // Nastavíme filtrované soubory
      } else {
        console.error('Chyba: Očekávaný datový typ `files` je pole.');
      }
    } catch (error) {
      message.error('Chyba při načítání souborů.');
      console.error('Chyba při načítání souborů:', error);
    }
  };

  const handleCreateFolder = async (folderName) => {
    if (!currentClient) return; // Ochrana proti volání bez aktuálního klienta
    try {
      const response = await createClientFolder(currentClient.id, folderName);
      if (response && response.name) {
        const newFolder = {
          name: response.name,
          isDirectory: true,
          path: response.path || response.url || `/${response.name}`,
          updatedAt: new Date().toISOString(),
        };
        setFiles((prevFiles) => [...prevFiles, newFolder]);
        setFilteredFiles((prevFiles) => [...prevFiles, newFolder]); // Aktualizujeme filtrované soubory
        message.success('Složka úspěšně vytvořena!');
      }
    } catch (error) {
      message.error('Chyba při vytváření složky.');
      console.error('Chyba při vytváření složky:', error);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      // Zde by měla být volána API funkce pro smazání klienta
      await deleteClient(clientId);
      message.success('Klient úspěšně smazán!');
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientId)
      );
    } catch (error) {
      message.error('Chyba při mazání klienta.');
      console.error('Chyba při mazání klienta:', error);
    }
  };

  
  const handleUpdateClient = async () => {
    try {
      await updateClient(currentClient.id, currentClient); // Odesíláme i opCode
      message.success('Klient úspěšně aktualizován!');
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === currentClient.id ? currentClient : client
        )
      );
      setIsModalOpen(false);
      setCurrentClient(null); // Reset aktuálního klienta
    } catch (error) {
      message.error('Chyba při aktualizaci klienta.');
      console.error('Chyba při aktualizaci klienta:', error);
    }
  };
  

  
  const handleEditClient = (client) => {
    setCurrentClient(client); // Nastaví klienta k úpravě
    setIsModalOpen(true); // Otevře modal pro úpravu
  };

  const handleFileOpen = (file) => {
    if (file.isDirectory) {
      handleShowFiles({
        id: currentClient.id,
        path: file.path,
      });
    } else {
      window.open(`http://localhost:5000${file.path}`, '_blank');
    }
  };

  const columns = [
    {
      title: 'Jméno',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Adresa',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Firma',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'OP',
      dataIndex: 'opCodes',
      key: 'opCodes',
      render: (opCodes) => {
        if (Array.isArray(opCodes) && opCodes.length > 0) {
          return opCodes.join(', ');
        }
        return 'N/A';
      },
    },
    {
      title: 'Akce',
      key: 'action',
      render: (text, client) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="link" onClick={() => handleShowFiles(client)}>
            Zobrazit Soubory
          </Button>
          <Button type="link" onClick={() => handleEditClient(client)}>
            Upravit Klienta
          </Button>
          <Button type="link" danger onClick={() => handleDeleteClient(client.id)}>
            Smazat Klienta
          </Button>
        </div>
      ),
    },
  ];
  
  
  
  

  return (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={2}>Klienti</Typography.Title>
      <Input
        placeholder="Vyhledat klienta"
        value={clientSearchTerm}
        onChange={(e) => setClientSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: '20px' }}>
        Přidat Nového Klienta
      </Button>
      <Table dataSource={filteredClients} columns={columns} rowKey="id" />

      <Modal
  title={currentClient ? "Upravit Klienta" : "Přidat Nového Klienta"}
  open={isModalOpen}
  onOk={currentClient ? handleUpdateClient : handleAddClient}
  onCancel={() => {
    setIsModalOpen(false);
    setCurrentClient(null); // Reset aktuálního klienta
  }}
  okText={currentClient ? "Upravit" : "Přidat"}
  cancelText="Zrušit"
>
  <Form layout="vertical">
    <Form.Item label="Jméno">
      <Input
        value={currentClient?.name || newClient.name}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, name: e.target.value })
            : setNewClient({ ...newClient, name: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="E-mail">
      <Input
        value={currentClient?.email || newClient.email}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, email: e.target.value })
            : setNewClient({ ...newClient, email: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Telefon">
      <Input
        value={currentClient?.phone || newClient.phone}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, phone: e.target.value })
            : setNewClient({ ...newClient, phone: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Adresa">
      <Input
        value={currentClient?.address || newClient.address}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, address: e.target.value })
            : setNewClient({ ...newClient, address: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Firma (volitelné)">
      <Input
        value={currentClient?.company || newClient.company}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, company: e.target.value })
            : setNewClient({ ...newClient, company: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item
  label="OP (volitelné)"
  validateStatus={
    (currentClient?.opCodes && currentClient.opCodes.some((op) => !/^[a-zA-Z0-9-]+$/.test(op))) ||
    (newClient.opCodes && newClient.opCodes.some((op) => !/^[a-zA-Z0-9-]+$/.test(op)))
      ? 'error'
      : ''
  }
  help={
    (currentClient?.opCodes && currentClient.opCodes.some((op) => !/^[a-zA-Z0-9-]+$/.test(op))) ||
    (newClient.opCodes && newClient.opCodes.some((op) => !/^[a-zA-Z0-9-]+$/.test(op)))
      ? 'OP může obsahovat pouze písmena, čísla a pomlčky.'
      : ''
  }
>
  <Input
    value={currentClient?.opCodes?.join(', ') || newClient.opCodes?.join(', ') || ''} // Bezpečná kontrola
    onChange={(e) => {
      const value = e.target.value
        .split(',')
        .map((op) => op.trim())
        .filter((op) => /^[a-zA-Z0-9-]+$/.test(op)); // Filtrování pouze platných OP
      if (currentClient) {
        setCurrentClient({ ...currentClient, opCodes: value }); // Aktualizace existujícího klienta
      } else {
        setNewClient({ ...newClient, opCodes: value }); // Nastavení nového klienta
      }
    }}
  />
</Form.Item>



  </Form>
</Modal>


      <Modal>
  title={currentClient ? "Upravit Klienta" : "Přidat Nového Klienta"}
  open={isModalOpen}
  onOk={currentClient ? handleUpdateClient : handleAddClient}
  onCancel={() => {
    setIsModalOpen(false);
    setCurrentClient(null); // Reset aktuálního klienta
  }}
  okText={currentClient ? "Upravit" : "Přidat"}
  cancelText="Zrušit"
  <Form layout="vertical">
    <Form.Item label="Jméno">
      <Input
        value={currentClient?.name || newClient.name}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, name: e.target.value })
            : setNewClient({ ...newClient, name: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="E-mail">
      <Input
        value={currentClient?.email || newClient.email}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, email: e.target.value })
            : setNewClient({ ...newClient, email: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Telefon">
      <Input
        value={currentClient?.phone || newClient.phone}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, phone: e.target.value })
            : setNewClient({ ...newClient, phone: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Adresa">
      <Input
        value={currentClient?.address || newClient.address}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, address: e.target.value })
            : setNewClient({ ...newClient, address: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Firma (volitelné)">
      <Input
        value={currentClient?.company || newClient.company}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, company: e.target.value })
            : setNewClient({ ...newClient, company: e.target.value })
        }
      />
    </Form.Item>
  </Form>
</Modal>;

      <Modal
        title={`Soubory klienta: ${currentClient?.name}`}
        open={isFileManagerVisible}
        onCancel={() => setIsFileManagerVisible(false)}
        footer={null}
        width="80%"
      >
        <Input
          placeholder="Vyhledat soubor"
          value={fileSearchTerm}
          onChange={(e) => setFileSearchTerm(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <FileManager
          files={filteredFiles}
          filePreviewPath="http://localhost:5000/uploads"
          fileUploadConfig={{
            url: `http://localhost:5000/api/clients/${currentClient?.id}/files`,
          }}
          onFileUploaded={(response) => {
            const newFile = {
              ...response,
              isDirectory: false,
              path: response.path || response.url || `/${response.name}`,
            };
            setFiles((prevFiles) => [...prevFiles, newFile]);
            setFilteredFiles((prevFiles) => [...prevFiles, newFile]); // Aktualizujeme filtrované soubory
          }}
          onCreateFolder={handleCreateFolder}
          onFileOpen={handleFileOpen}
          onError={(error) => {
            message.error(`Chyba: ${error.message}`);
          }}
        />
      </Modal>
    </div>
  );
};

export default Clients;
