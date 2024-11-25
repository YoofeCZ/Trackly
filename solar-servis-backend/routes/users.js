import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const secretKey = 'your-secret-key';

// Middleware pro ověření tokenu
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware pro kontrolu rolí
const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// Vytvoření nového uživatele (pouze admin)
router.post('/create', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';
    const newUser = await User.create({ username, password: hashedPassword, role: userRole });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user.', error: error.message });
  }
});

// Změna hesla uživatele (pouze admin)
router.put("/:id/password", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error updating password.", error: error.message });
  }
});

// Smazání uživatele (pouze admin)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.destroy();
    res.status(200).json({ message: `User with ID ${id} has been deleted.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
});

// Změna role uživatele (pouze admin)
router.put('/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: `Role of user ${user.username} updated to ${role}.` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role.', error: error.message });
  }
});

// Přihlášení uživatele
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
});

// Získání všech uživatelů (pouze admin)
router.get('/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
});

export default router;
