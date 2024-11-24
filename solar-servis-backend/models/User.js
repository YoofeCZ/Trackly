import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import db from '../database.js'; // připojení k databázi

const User = db.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'editor'),
        defaultValue: 'user',
        allowNull: false,
    },
});

// Hook pro hashování hesla před uložením do databáze
User.beforeCreate(async (user) => {
    // Ověřte, jestli heslo již není hashované
    if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
        console.log("Heslo před hashováním:", user.password);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log("Hashované heslo v hooku:", hashedPassword);
        user.password = hashedPassword;
    } else {
        console.log("Heslo již bylo hashované, znovu ho nehashujeme:", user.password);
    }
});




// Funkce pro vytvoření uživatele
User.createUser = async function (username, password, role = 'user') {
    return await User.create({
        username,
        password, // heslo bude automaticky zašifrováno
        role,
    });
};

export default User;
