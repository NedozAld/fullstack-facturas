
const { Usuario, Cliente } = require('../models');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // For now, passwords are plain text in the provided SQL, so I will compare directly first, then we can add hashing if needed.
// Wait, the user provided SQL inserts with 'password123'. It's safer to assume plain text for now unless specified otherwise, but standard practice is hashing.
// However, since the initial data is inserted directly via SQL, they are likely not hashed.
// I will implement plain text comparison for now to match the provided data.

async function login(req, res) {
    const { username, password } = req.body;

    try {
        const usuario = await Usuario.findOne({
            where: { usu_username: username },
            include: [{ model: Cliente }]
        });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Simple password check (INSECURE: for demonstration/matching provided SQL only)
        // In a real app, use bcrypt.compare(password, usuario.usu_password)
        if (usuario.usu_password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: usuario.usu_id,
                username: usuario.usu_username,
                rol: usuario.usu_rol,
                cli_id: usuario.cli_id
            },
            process.env.JWT_SECRET || 'secreto_super_secreto', // Use env var in production
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: usuario.usu_id,
                username: usuario.usu_username,
                rol: usuario.usu_rol,
                cliente: usuario.Cliente
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Error en el servidor: ' + error.message });
    }
}

module.exports = { login };
