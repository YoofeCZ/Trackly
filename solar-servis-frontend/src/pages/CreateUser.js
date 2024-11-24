import React, { useState } from 'react';
import { createUser } from '../services/api'; // API funkce

const CreateUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Získání tokenu
    if (!token) {
      setMessage('Chybí přihlašovací token.');
      return;
    }

    try {
      await createUser({ username, password, role }, token); // Zavolání API pro vytvoření uživatele
      setMessage('Uživatel byl úspěšně vytvořen.');
      setUsername('');
      setPassword('');
      setRole('user');
    } catch (error) {
      setMessage('Chyba při vytváření uživatele. Zkuste to znovu.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Vytvořit nového uživatele</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Uživatelské jméno</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Heslo</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="role" className="form-label">Role</label>
          <select
            id="role"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Uživatel</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Vytvořit uživatele</button>
      </form>
    </div>
  );
};

export default CreateUser;
