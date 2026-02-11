const { Usuario, Cliente } = require('../models');

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        const { usu_username, usu_password, usu_rol, cli_id } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await Usuario.findOne({ where: { usu_username } });
        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }

        const nuevoUsuario = await Usuario.create({
            usu_username,
            usu_password, // En un entorno real, esto debería estar hasheado
            usu_rol,
            cli_id: cli_id || null
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [{ model: Cliente }] // Incluir datos del cliente asociado si existe
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id, {
            include: [{ model: Cliente }]
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { usu_username, usu_password, usu_rol, cli_id } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await usuario.update({
            usu_username,
            usu_password, // Si se envía nueva contraseña
            usu_rol,
            cli_id: cli_id || null
        });

        res.json(usuario);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await usuario.destroy();
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};
