
const { Factura, Cliente, Producto, FacturaProducto } = require('../models');


async function createFactura(req, res) {
    const { cli_id, fac_fecha } = req.body;
    try {
        const factura = await Factura.create({ cli_id, fac_fecha });
        res.status(201).json(factura);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function updateFactura(req, res) {
    const facId = parseInt(req.params.facId, 10);
    const { cli_id, fac_fecha } = req.body;
    try {
        const factura = await Factura.findByPk(facId);
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        await factura.update({
            cli_id: cli_id ?? factura.cli_id,
            fac_fecha: fac_fecha ?? factura.fac_fecha,
        });
        res.json(factura);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function deleteFactura(req, res) {
    const facId = parseInt(req.params.facId, 10);
    try {
        const factura = await Factura.findByPk(facId);
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        await factura.destroy();
        res.json({ deleted: facId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function getFacturas(req, res) {
    try {
        const facturas = await Factura.findAll({ order: [['fac_id', 'ASC']] });
        res.json(facturas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getFacturaById(req, res) {
    const facId = parseInt(req.params.facId, 10);
    try {
        const factura = await Factura.findByPk(facId);
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(factura);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addProductoToFactura(req, res) {
    const facId = parseInt(req.params.facId, 10);
    const { pro_id, facpro_cantidad, facpro_pvp = null } = req.body;
    try {
        let pvp = facpro_pvp;
        if (pvp === null || pvp === undefined) {
            const prod = await Producto.findByPk(pro_id);
            if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
            pvp = prod.pro_pvp;
        }
        const fp = await FacturaProducto.create({ pro_id, fac_id: facId, facpro_cantidad, facpro_pvp: pvp });
        res.status(201).json(fp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function removeProductoFromFactura(req, res) {
    const facId = parseInt(req.params.facId, 10);
    const proId = parseInt(req.params.proId, 10);
    try {
        const fp = await FacturaProducto.findOne({ where: { fac_id: facId, pro_id: proId } });
        if (!fp) return res.status(404).json({ error: 'Producto no asignado a la factura' });
        await fp.destroy();
        res.json({ fac_id: facId, pro_id: proId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function clientesFacturas(req, res) {
    try {
        const rows = await Factura.findAll({
            include: [{ model: Cliente, attributes: ['cli_id', 'cli_nombre'] }],
            order: [['cli_id', 'ASC'], ['fac_id', 'ASC']]
        });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function facturaProductosById(req, res) {
    const facId = parseInt(req.params.facId, 10);
    try {
        const factura = await Factura.findByPk(facId, {
            include: [{ model: Producto, through: { attributes: ['facpro_cantidad', 'facpro_pvp'] } }],
        });
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        res.json(factura);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


async function facturasProductosByCliente(req, res) {
    const cliId = parseInt(req.params.cliId, 10);
    try {
        const facturas = await Factura.findAll({
            where: { cli_id: cliId },
            include: [{ model: Producto, through: { attributes: ['facpro_cantidad', 'facpro_pvp'] } }],
            order: [['fac_id', 'ASC']]
        });
        res.json(facturas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createFactura,
    updateFactura,
    deleteFactura,
    getFacturas,
    getFacturaById,
    addProductoToFactura,
    removeProductoFromFactura,
    clientesFacturas,
    facturaProductosById,
    facturasProductosByCliente,
};
