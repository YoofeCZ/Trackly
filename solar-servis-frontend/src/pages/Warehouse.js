import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import axios from 'axios';


let API_URL;

if (window.location.hostname === 'localhost') {
  API_URL = 'http://localhost:5000/api'; // Lokální prostředí
} else if (window.location.hostname.startsWith('192.168')) {
  API_URL = 'http://192.168.0.101:5000/api'; // Interní IP
} else {
  API_URL = 'http://188.175.32.34/api'; // Veřejná IP
}

const Warehouse = () => {
  const [materials, setMaterials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Načtení materiálů ze skladu
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/warehouse`);
      setMaterials(response.data);
    } catch (error) {
      message.error('Chyba při načítání skladu');
    }
  };

  useEffect(() => {
    fetchMaterials(); // Načtení materiálů při inicializaci komponenty
  }, []);

  const handleAddMaterial = async (values) => {
    try {
      const response = await axios.post(`${API_URL}/warehouse`, values);
      setMaterials([...materials, response.data]);
      message.success('Materiál byl úspěšně přidán!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Chyba při přidávání materiálu');
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await axios.delete(`${API_URL}/warehouse/${id}`);
      setMaterials(materials.filter((material) => material.id !== id));
      message.success('Materiál byl úspěšně smazán!');
    } catch (error) {
      message.error('Chyba při mazání materiálu');
    }
  };

  const columns = [
    {
      title: 'Název materiálu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cena za jednotku (Kč)',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Množství',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Akce',
      key: 'action',
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteMaterial(record._id)}>
          Smazat
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Správa skladu</h2>
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: 20 }}>
        Přidat materiál
      </Button>
      <Table dataSource={materials} columns={columns} rowKey="_id" />

      <Modal
        title="Přidat materiál"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddMaterial}>
          <Form.Item
            name="name"
            label="Název materiálu"
            rules={[{ required: true, message: 'Zadejte název materiálu' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Cena za jednotku (Kč)"
            rules={[{ required: true, message: 'Zadejte cenu' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Množství"
            rules={[{ required: true, message: 'Zadejte množství' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Warehouse;
