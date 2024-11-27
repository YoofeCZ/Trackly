// src/components/FileManager.js

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Upload,
  Breadcrumb,
  Input,
  message,
} from 'antd';
import {
  UploadOutlined,
  FolderAddOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import PropTypes from 'prop-types';


// Funkce pro dynamické nastavení API_URL na základě hostname
const getAPIUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  } else if (window.location.hostname.startsWith('192.168')) {
    return 'http://192.168.0.101:5000/api';
  } else {
    return 'http://188.175.32.34/api';
  }
};

const FileManager = ({ clientId }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
const [previewContent, setPreviewContent] = useState(null);
const [previewFile, setPreviewFile] = useState(null); // Obsahuje informace o souboru k náhledu

  

  const API_URL = getAPIUrl();

  useEffect(() => {
    // Načtěte jméno klienta při prvním načtení komponenty
    const fetchClientName = async () => {
      try {
        const response = await axios.get(`${API_URL}/clients/${clientId}`);
        setClientName(response.data.name);
      } catch (error) {
        console.error('Chyba při načítání jména klienta:', error);
      }
    };
    fetchClientName();
  }, [clientId]);

  useEffect(() => {
    fetchFiles(currentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  // Funkce pro načtení souborů z aktuální cesty
  const fetchFiles = async (path) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/${clientId}/files`, {
        params: { path },
      });
  
      // Přiřaďte správný typ na základě `isDirectory`
      const formattedFiles = response.data.files.map((file) => ({
        ...file,
        type: file.isDirectory ? 'folder' : 'file', // Nastavení typu
      }));
  
      console.log('Formátovaná data:', formattedFiles); // Logování výsledku
      setFiles(formattedFiles);
    } catch (error) {
      console.error('Chyba při načítání souborů:', error);
      message.error('Chyba při načítání souborů');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilePreview = (file) => {
    if (!file || !file.name) {
      setPreviewFile(null);
      setPreviewContent(<p>Soubor není k dispozici.</p>);
      setIsPreviewModalVisible(true);
      return;
    }
  
    const fileUrl = `${API_URL}/clients/${clientId}/files/download?path=${encodeURIComponent(file.path)}`;
    const fileExtension = file.name.split('.').pop().toLowerCase();
  
    setPreviewFile({ ...file, url: fileUrl }); // Nastavení previewFile s URL
  
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension)) {
      setPreviewContent(<img src={fileUrl} alt={file.name} style={{ width: '100%' }} />);
    } else if (fileExtension === 'pdf') {
      setPreviewContent(
        <iframe
          src={fileUrl}
          style={{ width: '100%', height: '500px' }}
          frameBorder="0"
          title={file.name}
        />
      );
    } else if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileExtension)) {
      setPreviewContent(
        <iframe
          src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
          style={{ width: '100%', height: '500px' }}
          frameBorder="0"
          title={file.name}
        />
      );
    } else {
      setPreviewContent(
        <p>
          Tento formát souboru ({fileExtension}) není podporován.{' '}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Stáhnout soubor
          </a>
        </p>
      );
    }
  
    setIsPreviewModalVisible(true);
  };
  
  

  // Funkce pro otevření souboru nebo složky
  const handleFileOpen = (file) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path); // Pokud jde o složku, změň cestu
    } else {
      window.open(
        `${API_URL}/clients/${clientId}/files/download?path=${encodeURIComponent(file.path)}`,
        '_blank'
      );
    }
  };
  
  

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.error('Název složky nemůže být prázdný.');
      return;
    }

    try {
      const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
      const response = await axios.post(`${API_URL}/clients/${clientId}/folders`, {
        folderPath,
      });
      message.success(`Složka '${response.data.name}' byla úspěšně vytvořena`);
      setIsFolderModalVisible(false);
      setNewFolderName('');
      fetchFiles(currentPath);
    } catch (error) {
      console.error('Chyba při vytváření složky:', error);
      message.error('Chyba při vytváření složky');
    }
  };
  
  
  
  

  // Funkce pro smazání souboru nebo složky
  const handleDelete = (file) => {
    Modal.confirm({
      title: `Opravdu chcete smazat ${file.name}?`,
      okText: 'Ano',
      okType: 'danger',
      cancelText: 'Ne',
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/clients/${clientId}/files`, {
            data: { path: file.path },
          });
          message.success(`Položka ${file.name} byla odstraněna.`);
          fetchFiles(currentPath);
        } catch (error) {
          console.error('Chyba při mazání souboru nebo složky:', error);
          message.error('Chyba při mazání souboru nebo složky');
        }
      },
    });
  };

  // Funkce pro nahrávání souborů
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath); // Aktuální cesta ke složce
  
    try {
      await axios.post(`${API_URL}/clients/${clientId}/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success(`Soubor ${file.name} byl úspěšně nahrán`);
      fetchFiles(currentPath); // Aktualizace zobrazení
    } catch (error) {
      console.error('Chyba při nahrávání souboru:', error);
      message.error('Chyba při nahrávání souboru');
    }
  };
  
  
  

  // Filtrování souborů podle vyhledávacího termínu
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(fileSearchTerm.toLowerCase())
  );
  

  // Definice sloupců pro tabulku
  // Úprava sloupců tabulky
const columns = [
    {
        title: 'Název',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) =>
          record.type === 'folder' ? ( // Kontrola podle atributu `type`
            <span>
              <FolderOutlined style={{ marginRight: 8 }} />
              <a onClick={() => handleFileOpen(record)}>{text}</a>
            </span>
          ) : (
            <span>
              <FileOutlined style={{ marginRight: 8 }} />
              {text}
            </span>
          ),
      },
      {
        title: 'Typ',
        dataIndex: 'type',
        key: 'type',
        render: (text) => (text === 'folder' ? 'Složka' : 'Soubor'),
      },
    {
      title: 'Typ',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (text === 'folder' ? 'Složka' : 'Soubor'),
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
          <span>
            {record.type === 'file' && (
              <>
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleFileOpen(record)}
                >
                  Stáhnout
                </Button>
                
                <Button
                  type="link"
                  onClick={() => handleFilePreview(record)} // Funkce pro náhled
                >
                  Zobrazit
                </Button>
              </>
            )}
      
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              danger
            >
              Smazat
            </Button>
          </span>
        ),
      },
      
  ];

  return (
    <div>
      {/* Breadcrumb navigace */}
      <Breadcrumb style={{ marginBottom: 16 }}>
  <Breadcrumb.Item>
    <Button type="link" onClick={() => setCurrentPath('')} style={{ padding: 0 }}>
      Domů
    </Button>
  </Breadcrumb.Item>
  {currentPath.split('/').map((folder, index, array) => {
    if (folder) {
      const path = array.slice(0, index + 1).join('/');
      return (
        <Breadcrumb.Item key={path}>
          <Button type="link" onClick={() => setCurrentPath(path)} style={{ padding: 0 }}>
            {folder}
          </Button>
        </Breadcrumb.Item>
      );
    }
    return null;
  })}
</Breadcrumb>


      {/* Akční tlačítka */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
      <Button
  icon={<FolderAddOutlined />}
  onClick={() => setIsFolderModalVisible(true)}
  style={{ marginRight: 8, borderRadius: '8px' }}
>
  Nová složka
</Button>
<Upload customRequest={handleUpload} showUploadList={false}>
  <Button icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>
    Nahrát soubor
  </Button>
</Upload>

        <Input.Search
  placeholder="Vyhledat soubory"
  value={fileSearchTerm}
  onChange={(e) => setFileSearchTerm(e.target.value)}
  style={{ width: 200, marginLeft: 'auto' }}
/>

      </div>

      {/* Tabulka souborů */}
      <Table
  dataSource={filteredFiles}
  columns={columns}
  rowKey={(record) => record.path}
  loading={loading}
  pagination={{ pageSize: 10 }}
  bordered
  style={{ backgroundColor: '#fff', borderRadius: '8px' }}
/>


      {/* Modal pro vytvoření nové složky */}
      <Modal
        title="Vytvořit novou složku"
        visible={isFolderModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => setIsFolderModalVisible(false)}
        okText="Vytvořit"
        cancelText="Zrušit"
      >
        <Input
          placeholder="Název složky"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
      </Modal>
      <Modal
  title={`Náhled souboru: ${previewFile?.name || 'Neznámý soubor'}`}
  visible={isPreviewModalVisible}
  footer={null}
  onCancel={() => setIsPreviewModalVisible(false)}
  width={800}
>
  {/* Kontrola existence previewFile a jeho url */}
  {previewFile?.url ? (
    <>
      {previewFile?.name?.match(/\.(png|jpe?g|gif|svg)$/i) && (
        <img
          src={previewFile.url}
          alt={previewFile.name}
          style={{ width: '100%', borderRadius: '8px', maxHeight: '600px' }}
        />
      )}

      {previewFile?.name?.match(/\.(mp3|wav)$/i) && (
        <audio controls style={{ width: '100%' }}>
          <source src={previewFile.url} type="audio/mpeg" />
          Váš prohlížeč nepodporuje přehrávání zvuku.
        </audio>
      )}

      {previewFile?.name?.match(/\.(mp4|webm|ogg)$/i) && (
        <video controls style={{ width: '100%', borderRadius: '8px' }}>
          <source src={previewFile.url} type="video/mp4" />
          Váš prohlížeč nepodporuje přehrávání videa.
        </video>
      )}

      {previewFile?.name?.match(/\.(txt|json|log)$/i) && (
        <iframe
          src={previewFile.url}
          title="Náhled textového souboru"
          style={{
            width: '100%',
            height: '400px',
            border: 'none',
            borderRadius: '8px',
          }}
        />
      )}

      {previewFile?.name?.match(/\.(pdf)$/i) && (
        <iframe
          src={previewFile.url}
          title="Náhled PDF"
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            borderRadius: '8px',
          }}
        />
      )}

      {previewFile?.name?.match(/\.(docx|doc|xlsx|xls|pptx|ppt)$/i) && (
        <iframe
          src={`https://docs.google.com/gview?url=${previewFile.url}&embedded=true`}
          title="Náhled dokumentu"
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            borderRadius: '8px',
          }}
        />
      )}

      {!previewFile?.name?.match(
        /\.(png|jpe?g|gif|svg|mp3|wav|mp4|webm|ogg|txt|json|log|pdf|docx?|xlsx?|pptx?)$/i
      ) && (
        <p>
          Tento formát souboru nelze zobrazit.{' '}
          <a href={previewFile.url} target="_blank" rel="noopener noreferrer">
            Stáhnout soubor
          </a>
        </p>
      )}
    </>
  ) : (
    <p>Soubor nelze načíst nebo není k dispozici náhled.</p>
  )}
</Modal>



    </div>
  );
};

FileManager.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default FileManager;
