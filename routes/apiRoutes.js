// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const { evaluateDocument } = require('../services/groqService');

const serverAuditLogs = [
    { timestamp: new Date().toISOString(), type: "SYSTEM_INIT", message: "Core matrix gateway online. Security protocols active." }
];


router.post('/verify', async (req, res) => {
    try {
        const { apiKey, mimeType, imageBase64, candidateName, customPolicy } = req.body;

        if (!apiKey) return res.status(400).json({ error: "Missing API Key on server gateway." });
        if (!imageBase64) return res.status(400).json({ error: "No image data payload received." });

        console.log(`[SECURE_GATEWAY] Processing compliance audit for: ${candidateName}`);
        serverAuditLogs.push({ timestamp: new Date().toISOString(), type: "AUDIT_START", message: `Initiated verification protocol for ${candidateName}` });

        const aiText = await evaluateDocument(apiKey, mimeType, imageBase64, candidateName, customPolicy);

        serverAuditLogs.push({
            timestamp: new Date().toISOString(),
            type: "AUDIT_SUCCESS",
            message: `Successfully audited ${candidateName} against active constraints.`
        });

        res.json({ success: true, analysis: aiText });

    } catch (err) {
        console.error("[FATAL_SERVER_ERR]", err);
        serverAuditLogs.push({ timestamp: new Date().toISOString(), type: "ERROR", message: err.message });
        res.status(500).json({ error: err.message });
    }
});

// GET Endpoint for Real-Time Backend Telemetry Logs
router.get('/logs', (req, res) => {
    res.json({ success: true, logs: serverAuditLogs });
});

module.exports = router;