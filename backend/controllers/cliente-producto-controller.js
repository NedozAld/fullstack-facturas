
const { Cliente, Producto } = require('../models');


async function createCliente(req, res) {
    const { cli_nombre, cli_correo, cli_estado } = req.body;
    try {
        const cliente = await Cliente.create({ cli_nombre, cli_correo, cli_estado });
        res.status(201).json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function updateCliente(req, res) {
    const cliId = parseInt(req.params.cliId, 10);
    const { cli_nombre, cli_correo, cli_estado } = req.body;
    try {
        const cliente = await Cliente.findByPk(cliId);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        await cliente.update({
            cli_nombre: cli_nombre ?? cliente.cli_nombre,
            cli_correo: cli_correo ?? cliente.cli_correo,
            cli_estado: cli_estado ?? cliente.cli_estado,
        });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function deleteCliente(req, res) {
    const cliId = parseInt(req.params.cliId, 10);
    try {
        const cliente = await Cliente.findByPk(cliId);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        await cliente.destroy();
        res.json({ deleted: cliId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getClientes(req, res) {
    try {
        const clientes = await Cliente.findAll({ order: [['cli_id', 'ASC']] });
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getClienteById(req, res) {
    const cliId = parseInt(req.params.cliId, 10);
    try {
        const cliente = await Cliente.findByPk(cliId);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function createProducto(req, res) {
    const { pro_nombre, pro_pvp, pro_estado, pro_impuesto } = req.body;
    try {
        const producto = await Producto.create({ pro_nombre, pro_pvp, pro_estado, pro_impuesto });
        res.status(201).json(producto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function updateProducto(req, res) {
    const proId = parseInt(req.params.proId, 10);
    const { pro_nombre, pro_pvp, pro_estado, pro_impuesto } = req.body;
    try {
        const producto = await Producto.findByPk(proId);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        await producto.update({
            pro_nombre: pro_nombre ?? producto.pro_nombre,
            pro_pvp: pro_pvp ?? producto.pro_pvp,
            pro_impuesto: pro_impuesto ?? producto.pro_impuesto,
            pro_estado: pro_estado ?? producto.pro_estado,
        });
        res.json(producto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function deleteProducto(req, res) {
    const proId = parseInt(req.params.proId, 10);
    try {
        const producto = await Producto.findByPk(proId);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        await producto.destroy();
        res.json({ deleted: proId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getProductos(req, res) {
    try {
        const productos = await Producto.findAll({ order: [['pro_id', 'ASC']] });
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getProductoById(req, res) {
    const proId = parseInt(req.params.proId, 10);
    try {
        const producto = await Producto.findByPk(proId);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createCliente,
    updateCliente,
    deleteCliente,
    getClientes,
    getClienteById,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductos,
    getProductoById,
};
