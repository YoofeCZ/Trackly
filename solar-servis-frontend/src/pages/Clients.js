//Frontednd/Clients.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message } from 'antd';
import { getClients, createClient, createClientFolder,deleteClient, updateClient } from '../services/api';
import { useLocation } from 'react-router-dom';
import { Upload, Breadcrumb } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, FolderOutlined, FileOutlined, DownloadOutlined  } from '@ant-design/icons';
import { uploadClientFile } from '../services/api';


const Clients = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('');
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
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
const [newFolderName, setNewFolderName] = useState('');

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
      setFilteredFiles(files);
    } else {
      const lowerCaseSearchTerm = fileSearchTerm.toLowerCase();
      const filtered = files.filter((file) =>
        file.name.toLowerCase().includes(lowerCaseSearchTerm)
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
  
  
//Soubory
const handleShowFiles = async (client, path = '') => {
  if (!client) {
    message.error("Klient není dostupný.");
    return;
  }

  try {
    setCurrentClient(client);
    setIsFileManagerVisible(true);
    setCurrentPath(path); // Nastavuje aktuální cestu správně

    const response = await fetch(`http://localhost:5000/api/clients/${client.id}/files?path=${path}`);
    const data = await response.json();

    if (Array.isArray(data.files)) {
      const formattedFiles = data.files.map((file) => ({
        id: file.id || file.name,
        name: file.name,
        type: file.isDirectory ? "folder" : "file",
        size: file.size || 0,
        updatedAt: file.updatedAt || new Date().toISOString(),
        path: path ? `${path}/${file.name}` : file.name, // Správná cesta k souboru
      }));
      setFiles(formattedFiles);
    } else {
      message.error("Chybný formát dat souborů.");
    }
  } catch (error) {
    console.error("Chyba při načítání souborů:", error);
    message.error("Chyba při načítání souborů.");
  }
};


const handleFileDownload = (files) => {
  files.forEach((file) => {
    if (!file.isDirectory) {
      const fileURL = file.path.startsWith('/uploads')
        ? `http://localhost:5000${file.path}`
        : `http://localhost:5000/uploads/${file.path}`;

      const link = document.createElement('a');
      link.href = fileURL;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.warning('Složky nelze stáhnout.');
    }
  });
};

  
  

const handleCreateFolder = async () => {
  if (!newFolderName.trim()) {
    message.error('Název složky nemůže být prázdný.');
    return;
  }

  try {
    // Složíme správnou cestu ke složce
    const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;

    // Posíláme cestu na backend
    const response = await createClientFolder(currentClient.id, folderPath);
    message.success('Složka byla vytvořena.');
    setIsFolderModalOpen(false);
    setNewFolderName(''); // Reset názvu
    handleShowFiles(currentClient, currentPath); // Aktualizace seznamu souborů
  } catch (error) {
    message.error('Chyba při vytváření složky.');
    console.error('Chyba při vytváření složky:', error);
  }
};

  
  
  
  
  
  const handleDelete = async (file) => {
    Modal.confirm({
      title: `Opravdu chcete smazat ${file.name}?`,
      okText: 'Ano',
      okType: 'danger',
      cancelText: 'Ne',
      onOk: async () => {
        try {
          await fetch(`http://localhost:5000/api/clients/${currentClient.id}/files`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: file.path }),
          });
          message.success(`Položka ${file.name} byla odstraněna.`);
          handleShowFiles(currentClient, currentPath); // Aktualizace seznamu
        } catch (error) {
          message.error('Chyba při mazání souboru nebo složky.');
        }
      },
    });
  };
  

  
  const handleDeleteClient = async (clientId) => {
    try {
      await deleteClient(clientId); // Volání API pro smazání klienta
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
    const fileURL = file.path.startsWith('/uploads')
      ? `http://localhost:5000${file.path}` // Cesta už obsahuje /uploads
      : `http://localhost:5000/uploads/${file.path}`; // Přidáme /uploads jen pokud chybí
  
    window.open(fileURL, '_blank');
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
      title: "OP",
      dataIndex: "opCodes",
      key: "opCodes",
      render: (opCodes) => (opCodes && opCodes.length > 0 ? opCodes[0] : "N/A"), // Zobrazí první OP kód nebo "N/A"
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


<Modal
  title={currentClient ? "Upravit klienta" : "Přidat nového klienta"}
  open={isModalOpen}
  onOk={currentClient ? handleUpdateClient : handleAddClient}
  onCancel={() => {
    setIsModalOpen(false);
    setCurrentClient(null);
  }}
  okText={currentClient ? "Upravit" : "Přidat"}
  cancelText="Zrušit"
>
  <Form layout="vertical">
    <Form.Item label="Jméno" required>
      <Input
        value={currentClient?.name || newClient.name}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, name: e.target.value })
            : setNewClient({ ...newClient, name: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="E-mail" required>
      <Input
        value={currentClient?.email || newClient.email}
        onChange={(e) =>
          currentClient
            ? setCurrentClient({ ...currentClient, email: e.target.value })
            : setNewClient({ ...newClient, email: e.target.value })
        }
      />
    </Form.Item>
    <Form.Item label="Telefon" required>
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
</Modal>


<Modal
  title={`Soubory klienta: ${currentClient?.name || ''}`}
  open={isFileManagerVisible}
  onCancel={() => setIsFileManagerVisible(false)}
  footer={null}
  width="80%"
>
  <div>
    {/* Breadcrumb navigace */}
    <Breadcrumb style={{ marginBottom: '16px' }}>
      <Breadcrumb.Item>
        <Button type="link" onClick={() => handleShowFiles(currentClient, '')}>
          Kořen
        </Button>
      </Breadcrumb.Item>
      {currentPath.split('/').map((folder, index, array) => (
        <Breadcrumb.Item key={index}>
          <Button
            type="link"
            onClick={() =>
              handleShowFiles(currentClient, array.slice(0, index + 1).join('/'))
            }
          >
            {folder}
          </Button>
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>

    {/* Akce: Vytvořit složku, nahrát soubor */}
    <div style={{ marginBottom: '16px' }}>
    <Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={() => setIsFolderModalOpen(true)}
  style={{ marginRight: '8px' }}
>
  Vytvořit složku
</Button>
<Modal
  title="Vytvořit novou složku"
  open={isFolderModalOpen}
  onOk={handleCreateFolder}
  onCancel={() => {
    setIsFolderModalOpen(false);
    setNewFolderName(''); // Reset názvu při zavření
  }}
  okText="Vytvořit"
  cancelText="Zrušit"
>
  <Form layout="vertical">
    <Form.Item label="Název složky" required>
      <Input
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Zadejte název nové složky"
      />
    </Form.Item>
  </Form>
</Modal>

      <Upload
        customRequest={async ({ file }) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            await uploadClientFile(currentClient.id, formData);
            message.success(`Soubor ${file.name} byl nahrán.`);
            handleShowFiles(currentClient, currentPath); // Aktualizace seznamu souborů
          } catch (error) {
            message.error('Chyba při nahrávání souboru.');
          }
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Nahrát soubor</Button>
      </Upload>
      <Input
  placeholder="Vyhledat soubor nebo složku"
  value={fileSearchTerm}
  onChange={(e) => setFileSearchTerm(e.target.value)}
  style={{ marginBottom: '16px', width: '300px' }}
/>

    </div>

    {/* Tabulka souborů a složek */}
    <Table
      dataSource={filteredFiles} // Použijeme filtrované soubory
      columns={[
        {
          title: 'Název',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      record.type === 'folder' ? (
        <Button
          type="link"
          icon={<FolderOutlined />}
          onClick={() => handleShowFiles(currentClient, record.path)}
        >
          {text}
        </Button>
      ) : (
        <span>
          <FileOutlined style={{ marginRight: '8px' }} />
          {text}
        </span>
      )
    ),
  },
  {
    title: 'Velikost',
    dataIndex: 'size',
    key: 'size',
    render: (size) => (size ? `${(size / 1024).toFixed(2)} KB` : '-'),
  },
  {
    title: 'Poslední změna',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (date) => new Date(date).toLocaleString(),
  },
  {
    title: 'Akce',
    key: 'actions',
    render: (_, record) => (
      <div>
        <Button
          type="link"
          onClick={() =>
            record.type === 'folder'
              ? handleShowFiles(currentClient, record.path)
              : handleFileOpen(record) // Nyní volá funkci
          }
        >
          Otevřít
        </Button>
        {record.type === 'file' && (
          <Button
            type="link"
            onClick={() => handleFileDownload([record])} // Funkce je nyní volána
            icon={<DownloadOutlined />}
          >
            Stáhnout
          </Button>
        )}
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          Smazat
        </Button>
      </div>
    ),
  },
      ]}
      rowKey="path"
    />
  </div>
</Modal>





    </div>
  );
};

export default Clients;
