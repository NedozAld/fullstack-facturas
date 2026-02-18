const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_secreto');
        req.user = verified;

        if (req.user.rol.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado: Requiere rol de administrador' });
        }

        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};
