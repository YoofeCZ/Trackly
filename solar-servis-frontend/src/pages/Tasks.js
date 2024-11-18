import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  Select,
  Typography,
  DatePicker,
  message,
} from 'antd';
import { getTasks, createTask, updateTask, deleteTask, getClients, getTechnicians } from '../services/api';
import dayjs from 'dayjs'; // Import Day.js
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ description: '', dueDate: '', clientId: '', technicianId: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 255; // Maximální počet znaků pro popis
  


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, clientsData, techniciansData] = await Promise.all([
          getTasks(),
          getClients(),
          getTechnicians(),
        ]);
        setTasks(tasksData);
        setFilteredTasks(tasksData);
        setClients(clientsData);
        setTechnicians(techniciansData);
      } catch (error) {
        message.error('Chyba při načítání dat.');
      }
    };

    fetchData();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const lowerCaseValue = value.toLowerCase();

    setFilteredTasks(
      tasks.filter((task) => {
        const technicianName = technicians.find((tech) => tech.id === task.technicianId)?.name?.toLowerCase() || '';
        const clientName = clients.find((client) => client.id === task.clientId)?.name?.toLowerCase() || '';
        const description = task.description?.toLowerCase() || '';

        return (
          description.includes(lowerCaseValue) ||
          technicianName.includes(lowerCaseValue) ||
          clientName.includes(lowerCaseValue)
        );
      })
    );
  };

  const handleAddTask = () => {
    setNewTask({ description: '', dueDate: '', clientId: '', technicianId: '' });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setNewTask(task);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (isEditMode) {
        await updateTask(newTask.id, newTask);
        message.success('Úkol byl úspěšně aktualizován.');
      } else {
        await createTask(newTask);
        message.success('Úkol byl úspěšně přidán.');
      }
  
      // Po uložení znovu načti seznam úkolů
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
  
      setIsModalOpen(false);
      setNewTask({ description: '', dueDate: '', clientId: '', technicianId: '' });
    } catch (error) {
      message.error('Chyba při ukládání úkolu.');
      console.error('Chyba při ukládání:', error);
    }
  };
  
  

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setFilteredTasks(tasks.filter((task) => task.id !== taskId));
      message.success('Úkol byl úspěšně smazán.');
    } catch (error) {
      message.error('Chyba při mazání úkolu.');
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewTask({ description: '', dueDate: '', clientId: '', technicianId: '' });
    setIsEditMode(false);
  };

  const columns = [
    {
      title: 'Popis',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Termín',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Klient',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (id) => {
        const client = clients.find((client) => client.id === id);
        return client ? (
          <Button
            type="link"
            onClick={() => {
              // Přesměruj na stránku klienta a předvyplň vyhledávání
              navigate(`/clients?search=${encodeURIComponent(client.name)}`);
            }}
          >
            {client.name}
          </Button>
        ) : (
          'N/A'
        );
      },
    },
    {
      title: 'Technik',
      dataIndex: 'technicianId',
      key: 'technicianId',
      render: (id) => {
        const technician = technicians.find((tech) => tech.id === id);
        return technician ? (
          <Button
            type="link"
            onClick={() => {
              // Přesměruj na stránku technika a předvyplň vyhledávání
              navigate(`/technicians?search=${encodeURIComponent(technician.name)}`);
            }}
          >
            {technician.name}
          </Button>
        ) : (
          'N/A'
        );
      },
    },
    {
      title: 'Akce',
      key: 'action',
      render: (_, task) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="link" onClick={() => handleEditTask(task)}>
            Upravit
          </Button>
          <Button type="link" danger onClick={() => handleDeleteTask(task.id)}>
            Smazat
          </Button>
          <Button type="link" onClick={() => handleViewDetails(task)}>
            Detaily
          </Button>
        </div>
      ),
    },
  ];
  

  return (
    <div>
      <Typography.Title level={2}>Úkoly</Typography.Title>
      <Input.Search
        placeholder="Vyhledat úkoly podle popisu, klienta nebo technika"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button type="primary" onClick={handleAddTask} style={{ marginBottom: '20px' }}>
        Přidat Úkol
      </Button>
      <Table dataSource={filteredTasks} columns={columns} rowKey="id" />

      <Modal
        title={isEditMode ? 'Upravit Úkol' : 'Přidat Úkol'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSaveTask}
      >
        <Form layout="vertical">
        <Form.Item
  label="Popis"
  validateStatus={newTask.description.length > MAX_DESCRIPTION_LENGTH ? 'error' : ''}
  help={newTask.description.length > MAX_DESCRIPTION_LENGTH ? 'Maximální délka je 255 znaků' : ''}
>
  <TextArea
    value={newTask.description}
    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
    rows={3}
    maxLength={MAX_DESCRIPTION_LENGTH}
  />
  <Typography.Text type={newTask.description.length > MAX_DESCRIPTION_LENGTH ? 'danger' : 'secondary'}>
    {newTask.description.length}/{MAX_DESCRIPTION_LENGTH} znaků
  </Typography.Text>
</Form.Item>

          <Form.Item label="Termín">
            <DatePicker
              showTime={{ minuteStep: 15 }}
              format="YYYY-MM-DD HH:mm"
              value={newTask.dueDate ? dayjs(newTask.dueDate, 'YYYY-MM-DD HH:mm') : null}
              onChange={(date) =>
                setNewTask({ ...newTask, dueDate: date ? date.format('YYYY-MM-DD HH:mm') : '' })
              }
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item label="Klient">
            <Select
              value={newTask.clientId}
              onChange={(value) => setNewTask({ ...newTask, clientId: value })}
              placeholder="Vyberte klienta"
            >
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Technik">
            <Select
              value={newTask.technicianId}
              onChange={(value) => setNewTask({ ...newTask, technicianId: value })}
              placeholder="Vyberte technika"
            >
              {technicians.map((tech) => (
                <Option key={tech.id} value={tech.id}>
                  {tech.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Detaily Úkolu"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedTask && (
          <>
            <Typography.Title level={5}>Popis</Typography.Title>
            <Typography>{selectedTask.description || 'N/A'}</Typography>

            <Typography.Title level={5}>Datum splnění</Typography.Title>
            <Typography>
              {selectedTask.dueDate ? dayjs(selectedTask.dueDate).format('YYYY-MM-DD HH:mm') : 'N/A'}
            </Typography>

            <Typography.Title level={5}>Klient</Typography.Title>
            <Typography>
              {clients.find((client) => client.id === selectedTask.clientId)?.name || 'N/A'}
            </Typography>

            <Typography.Title level={5}>Technik</Typography.Title>
            <Typography>
              {technicians.find((tech) => tech.id === selectedTask.technicianId)?.name || 'N/A'}
            </Typography>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
