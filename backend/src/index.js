//packages
const express = require('express')
const cors = require('cors');
const app = express()

//middlewears
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//routes
app.use(require('../routes/index'))
const { sequelize } = require('../models');

//service execution
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada correctamente');

        await sequelize.sync(); // Opcional: sincronizar modelos (cuidado en producción)
        console.log('✅ Modelos sincronizados');

        app.listen(3000, () => {
            console.log('Listening on port: http://localhost:3000');
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
})();