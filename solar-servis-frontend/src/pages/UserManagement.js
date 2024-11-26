import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Select, message } from "antd";
import { getUsers, updateUserPassword, deleteUser, updateUserRole } from "../services/api";



const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // Typ modalu (heslo nebo role)

  // Načítání uživatelů
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getUsers(token);
        setUsers(data);
      } catch (error) {
        message.error("Chyba při načítání uživatelů.");
      }
    };

    fetchUsers();
  }, []);

  // Otevření modalu
  const showModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setIsModalVisible(true);
  };

  // Uzavření modalu
  const handleCancel = () => {
    setIsModalVisible(false);
    setNewPassword("");
    setNewRole("");
  };

  // Změna hesla uživatele
  const handlePasswordChange = async () => {
    if (!newPassword) {
      message.error("Nové heslo nemůže být prázdné.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await updateUserPassword(selectedUser.id, newPassword, token);
      message.success("Heslo bylo úspěšně změněno.");
      handleCancel();
    } catch (error) {
      message.error("Chyba při změně hesla.");
    }
  };

  // Změna role uživatele
  const handleChangeRole = async () => {
    if (!newRole) {
      message.error("Role nemůže být prázdná.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updatedUser = await updateUserRole(selectedUser.id, newRole, token);
      setUsers(users.map((user) => (user.id === selectedUser.id ? updatedUser : user)));
      message.success("Role byla úspěšně změněna.");
      handleCancel();
    } catch (error) {
      message.error("Chyba při změně role.");
    }
  };

  // Smazání uživatele
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await deleteUser(userId, token);
      setUsers(users.filter((user) => user.id !== userId));
      message.success("Uživatel byl úspěšně smazán.");
    } catch (error) {
      message.error("Chyba při mazání uživatele.");
    }
  };

  // Konfigurace sloupců pro tabulku
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Uživatelské jméno",
      dataIndex: "username",
      key: "username",
      align: "center",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role) => (
        <span style={{ color: role === "admin" ? "#ff4500" : "#007bff" }}>
          {role}
        </span>
      ),
    },
    {
      title: "Akce",
      key: "actions",
      align: "center",
      render: (text, user) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Button type="primary" onClick={() => showModal(user, "password")}>
            Změnit heslo
          </Button>
          <Button type="default" onClick={() => showModal(user, "role")}>
            Změnit roli
          </Button>
          <Button danger onClick={() => handleDeleteUser(user.id)}>
            Smazat
          </Button>
        </div>
      ),
    },
  ];
  

  return (
    <div className="container mt-5">
      <h2>Správa uživatelů</h2>
      <Table dataSource={users} columns={columns} rowKey="id" />

      {/* Modal pro změnu hesla a role */}
      <Modal
  title={
    modalType === "password" ? (
      <span style={{ color: "#fff" }}>Změna hesla</span>
    ) : (
      <span style={{ color: "#fff" }}>Změna role</span>
    )
  }
  visible={isModalVisible}
  onCancel={handleCancel}
  footer={null}
>
  {modalType === "password" ? (
    <>
      <Input.Password
        placeholder="Nové heslo"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{
          borderRadius: "5px",
          fontSize: "1rem",
          marginBottom: "20px",
        }}
      />
      <Button type="primary" onClick={handlePasswordChange}>
        Změnit heslo
      </Button>
    </>
  ) : (
    <>
      <Select
        placeholder="Vyberte roli"
        value={newRole}
        onChange={(value) => setNewRole(value)}
        style={{
          width: "100%",
          borderRadius: "5px",
          fontSize: "1rem",
          marginBottom: "20px",
        }}
      >
        <Option value="admin">Admin</Option>
        <Option value="user">User</Option>
      </Select>
      <Button type="primary" onClick={handleChangeRole}>
        Změnit roli
      </Button>
    </>
  )}
</Modal>

    </div>
  );
};

export default UserManagement;
