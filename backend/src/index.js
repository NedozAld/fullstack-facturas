//packages
const express = require('express')
const cors = require('cors');
const app = express()

//middlewears
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//routes
app.use(require('../routes/index'))
//service execution

app.listen(3000)
console.log('Listening on port: http://localhost:3000')