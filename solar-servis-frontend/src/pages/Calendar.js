import React, { useState, useEffect } from "react";
import { Calendar, Badge, Modal, Typography, Form, Input, Button, message, DatePicker, Menu, Dropdown } from "antd";
import { getTasks, createTask, deleteTask } from "../services/api";
import dayjs from "dayjs";

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({ description: "", dueDate: "" });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await getTasks();
        setTasks(tasksData);
      } catch (error) {
        message.error("Chyba při načítání úkolů.");
      }
    };

    fetchTasks();
  }, []);

  // Zakázání výchozího kontextového menu
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const handleSaveTask = async () => {
    if (!newTask.description || !newTask.dueDate) {
      message.error("Popis a termín jsou povinné.");
      return;
    }

    try {
      await createTask(newTask);
      message.success("Úkol byl úspěšně vytvořen.");
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
      setNewTask({ description: "", dueDate: "" });
      setIsModalOpen(false);
    } catch (error) {
      message.error("Chyba při vytváření úkolu.");
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      message.success("Úkol byl úspěšně smazán.");
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    } catch (error) {
      message.error("Chyba při mazání úkolu.");
    }
  };

  const handleTaskDetails = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleContextMenuClick = (date, event) => {
    setSelectedDate(date);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  };

  const handleDeleteAllTasks = async (date) => {
    const dailyTasks = tasks.filter((task) => dayjs(task.dueDate).isSame(date, "day"));
    try {
      await Promise.all(dailyTasks.map((task) => deleteTask(task.id)));
      message.success("Všechny úkoly na tento den byly smazány.");
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    } catch (error) {
      message.error("Chyba při mazání úkolů.");
    }
  };

  const dateCellRender = (date) => {
    const dailyTasks = tasks.filter((task) => dayjs(task.dueDate).isSame(date, "day"));

    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {dailyTasks.map((task) => (
          <li
            key={task.id}
            onClick={() => handleTaskDetails(task)}
            onContextMenu={(event) => handleContextMenuClick(date, event)}
          >
            <Badge
              status="success"
              text={`${dayjs(task.dueDate).format("HH:mm")} - ${task.description}`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const renderContextMenu = () => {
    const dailyTasks = tasks.filter((task) => dayjs(task.dueDate).isSame(selectedDate, "day"));
    return (
      <Menu>
        {dailyTasks.length > 0 && (
          <>
            {dailyTasks.map((task) => (
              <Menu.Item key={task.id} onClick={() => handleTaskDelete(task.id)}>
                Smazat úkol: {task.description}
              </Menu.Item>
            ))}
            <Menu.Divider />
          </>
        )}
        <Menu.Item onClick={() => setIsModalOpen(true)}>Přidat úkol/servis</Menu.Item>
        <Menu.Item onClick={() => handleDeleteAllTasks(selectedDate)}>Smazat všechny úkoly</Menu.Item>
      </Menu>
    );
  };

  return (
    <div>
      <Typography.Title level={2}>Kalendář plánování servisů</Typography.Title>
      <div
        onContextMenu={(event) => {
          const cellDate = dayjs(event.target.dataset.date); // Přístup k datu buňky
          handleContextMenuClick(cellDate, event);
        }}
        style={{ position: "relative" }}
      >
        <Calendar dateCellRender={dateCellRender} />
        {contextMenuVisible && (
          <div
            style={{
              position: "absolute",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              zIndex: 1000,
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onMouseLeave={() => setContextMenuVisible(false)}
          >
            {renderContextMenu()}
          </div>
        )}
      </div>

      {/* Modal pro přidání/úpravu úkolu */}
      <Modal
        title="Přidat úkol"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSaveTask}
      >
        <Form layout="vertical">
          <Form.Item label="Popis úkolu">
            <Input
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Datum a čas">
            <DatePicker
              showTime={{ minuteStep: 15 }}
              format="YYYY-MM-DD HH:mm"
              value={
                newTask.dueDate ? dayjs(newTask.dueDate, "YYYY-MM-DD HH:mm") : null
              }
              onChange={(date) =>
                setNewTask({ ...newTask, dueDate: date.format("YYYY-MM-DD HH:mm") })
              }
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal pro zobrazení detailů */}
      <Modal
        title="Detaily úkolu"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedTask && (
          <div>
            <Typography.Title level={5}>Popis</Typography.Title>
            <Typography>{selectedTask.description}</Typography>
            <Typography.Title level={5}>Datum</Typography.Title>
            <Typography>{dayjs(selectedTask.dueDate).format("YYYY-MM-DD HH:mm")}</Typography>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
