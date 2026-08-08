require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const initializeDatabase = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS compliance_logs (
            id SERIAL PRIMARY KEY,
            subject_name VARCHAR(100) NOT NULL,
            assigned_role VARCHAR(100),
            policy_constraint TEXT NOT NULL,
            compliance_status VARCHAR(50) NOT NULL,
            ai_reasoning TEXT,
            ingestion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('✅ [DATABASE] Compliance table verified.');
    } catch (err) {
        console.error('❌ [DATABASE ERROR]', err);
    }
};

initializeDatabase();

app.use('/api', apiRoutes);

app.post('/api/logs', async (req, res) => {
    const { subject_name, assigned_role, policy_constraint, compliance_status, ai_reasoning } = req.body;
    
    try {
        const insertQuery = `
            INSERT INTO compliance_logs (subject_name, assigned_role, policy_constraint, compliance_status, ai_reasoning)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const values = [subject_name, assigned_role, policy_constraint, compliance_status, ai_reasoning];
        
        const result = await pool.query(insertQuery, values);
        res.status(201).json({ success: true, record: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database Write Failed' });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM compliance_logs ORDER BY ingestion_date DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database Read Failed' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 VerifAI Full-Stack Matrix online at http://localhost:${PORT}`);
});