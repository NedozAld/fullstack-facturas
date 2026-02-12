const { Router } = require("express");
const router = Router();


const facturaController = require('../controllers/factura-controller');
const clienteProductoController = require('../controllers/cliente-producto-controller');


router.get('/', (req, res) => {
    res.send('Bienvenido a mi API de facturación');
});


router.use('/', require('./auth-routes'));


router.post('/facturas', facturaController.createFactura);
router.put('/facturas/:facId', facturaController.updateFactura);
router.delete('/facturas/:facId', facturaController.deleteFactura);
router.get('/facturas', facturaController.getFacturas);
router.get('/facturas/:facId', facturaController.getFacturaById);

router.post('/facturas/:facId/productos', facturaController.addProductoToFactura);
router.delete('/facturas/:facId/productos/:proId', facturaController.removeProductoFromFactura);

router.get('/consultas/clientes-facturas', facturaController.clientesFacturas);
router.get('/consultas/factura/:facId/productos', facturaController.facturaProductosById);
router.get('/consultas/cliente/:cliId/facturas-productos', facturaController.facturasProductosByCliente);

module.exports = router;



router.post('/clientes', clienteProductoController.createCliente);
router.put('/clientes/:cliId', clienteProductoController.updateCliente);
router.delete('/clientes/:cliId', clienteProductoController.deleteCliente);
router.get('/clientes', clienteProductoController.getClientes);
router.get('/clientes/:cliId', clienteProductoController.getClienteById);


router.post('/productos', clienteProductoController.createProducto);
router.put('/productos/:proId', clienteProductoController.updateProducto);
router.delete('/productos/:proId', clienteProductoController.deleteProducto);
router.get('/productos', clienteProductoController.getProductos);
router.get('/productos/:proId', clienteProductoController.getProductoById);


const usuarioController = require('../controllers/usuario-controller');


router.post('/usuarios', usuarioController.createUsuario);
router.get('/usuarios', usuarioController.getUsuarios);
router.get('/usuarios/:id', usuarioController.getUsuarioById);
router.put('/usuarios/:id', usuarioController.updateUsuario);
router.delete('/usuarios/:id', usuarioController.deleteUsuario);
