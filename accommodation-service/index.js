const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const alojamentoRoutes = require('./routes/alojamentoRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/accommodations', alojamentoRoutes);

db.sync({ alter: true }).then(() => {
    app.listen(3002, () => console.log("Accommodation Service na porta 3002"));
});