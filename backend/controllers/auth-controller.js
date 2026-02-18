
const { Usuario, Cliente } = require('../models');
const jwt = require('jsonwebtoken');


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


        if (usuario.usu_password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }


        const token = jwt.sign(
            {
                id: usuario.usu_id,
                username: usuario.usu_username,
                rol: usuario.usu_rol,
                cli_id: usuario.cli_id
            },
            process.env.JWT_SECRET || 'secreto_super_secreto',
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
