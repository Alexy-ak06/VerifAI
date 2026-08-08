
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`🚀 VerifAI Full-Stack Matrix online at http://localhost:${PORT}`);
});