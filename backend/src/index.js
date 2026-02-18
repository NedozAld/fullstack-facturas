
const express = require('express')
const cors = require('cors');
const app = express()


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(require('../routes/index'))
const { sequelize } = require('../models');


(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada correctamente');

        await sequelize.sync();
        console.log('✅ Modelos sincronizados');

        app.listen(3000, () => {
            console.log('Listening on port: http://localhost:3000');
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
})();