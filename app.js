// Global State
let currentBase64Image = null;
let currentMimeType = null;

const candidateDatabase = [
    { name: "Rahul Sharma", role: "Level 4 Developer", date: "2026-08-07", status: "pending" },
    { name: "Priya Patel", role: "Systems Architect", date: "2026-08-06", status: "approved" },
    { name: "Amit Kumar", role: "Security Analyst", date: "2026-08-05", status: "pending" },
    { name: "Sarah Jenkins", role: "Frontend Engineer", date: "2026-08-04", status: "rejected" },
    { name: "David Chen", role: "DevOps Lead", date: "2026-08-03", status: "approved" }
];

// --- VIEW ROUTING (Single Page App Logic) ---
function switchView(viewId, element) {
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Hide all views
    document.getElementById('view-hub').classList.add('hidden');
    document.getElementById('view-database').classList.add('hidden');

    // Show target view
    document.getElementById(viewId).classList.remove('hidden');
    
    // If opening database, render the table
    if(viewId === 'view-database') {
        renderCandidateTable();
    }
}

function renderCandidateTable() {
    const tbody = document.getElementById("candidateTableBody");
    tbody.innerHTML = ""; // Clear existing

    candidateDatabase.forEach(cand => {
        let statusHtml = "";
        if(cand.status === 'pending') statusHtml = `<span class="status-badge status-pending">PENDING</span>`;
        if(cand.status === 'approved') statusHtml = `<span class="status-badge status-approved">CLEARED</span>`;
        if(cand.status === 'rejected') statusHtml = `<span class="status-badge status-rejected">PURGED</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${cand.name}</strong></td>
                <td>${cand.role}</td>
                <td>${cand.date}</td>
                <td>${statusHtml}</td>
                <td><button class="btn-secondary" style="padding: 4px 8px; font-size: 10px;">[ VIEW RECORD ]</button></td>
            </tr>
        `;
    });
}

// --- MATRIX HUB LOGIC ---
function loadCandidateProfile() {
    const index = document.getElementById("candidateSelect").value;
    const candidate = candidateDatabase[index];
    
    document.getElementById("candName").innerText = candidate.name;
    document.getElementById("candRole").innerText = candidate.role;
    
    const badge = document.getElementById("statusBadge");
    badge.className = "status-badge status-pending";
    badge.style = ""; 
    badge.innerText = "[ AWAITING SCAN ]";
    
    logAudit(`Subject index switched to: ${candidate.name}`);
    
    document.getElementById("resultSection").classList.add("hidden");
    document.getElementById("aiOutput").innerHTML = "";
}

function logAudit(event) {
    const timestamp = new Date().toISOString().substring(11, 19);
    const log = document.getElementById("auditLog");
    const entry = `> [${timestamp}] ${event}`;
    log.innerHTML += `<br>${entry}`;
    log.scrollTop = log.scrollHeight;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentMimeType = file.type;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        document.getElementById("imageWrapper").style.display = "inline-block";
        const imgElement = document.getElementById("imagePreview");
        imgElement.src = e.target.result;
        document.getElementById("dropText").style.display = "none";
        document.getElementById("fileBtn").style.display = "none";
        
        currentBase64Image = e.target.result.split(',')[1];
        logAudit(`Visual protocol established: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    };
    reader.readAsDataURL(file);
}

async function typeWriter(text, element, speed = 10) {
    element.innerHTML += "<br><br>> [GEMINI_CORE_RESPONSE]:<br>";
    for (let i = 0; i < text.length; i++) {
        if(text.charAt(i) === '\n') { element.innerHTML += '<br>'; } 
        else { element.innerHTML += text.charAt(i); }
        await new Promise(r => setTimeout(r, speed));
    }
    document.getElementById("humanOverrideWarning").classList.remove("hidden");
    document.getElementById("actionButtons").classList.remove("hidden");
}

async function runVisionVerification() {
    const apiKey = document.getElementById("apiKey").value.trim();

    if (!apiKey) { alert("SYS_ERR: Invalid or missing Uplink Key."); return; }
    if (!currentBase64Image) { alert("SYS_ERR: No visual data packet detected."); return; }

    const resultSection = document.getElementById("resultSection");
    const aiOutput = document.getElementById("aiOutput");
    const scanLine = document.getElementById("scanLine");
    
    resultSection.classList.remove("hidden");
    document.getElementById("humanOverrideWarning").classList.add("hidden");
    document.getElementById("actionButtons").classList.add("hidden");
    aiOutput.innerHTML = "";
    
    scanLine.style.display = "block";
    logAudit("Triggering Multi-Agent Swarm...");

    const agentLogs = [
        "> [AGENT_1: ORCHESTRATOR] Initializing matrix pathways...",
        "> [AGENT_2: OCR_ENGINE] Extracting text nodes and metadata...",
        "> [AGENT_3: POLICY_BOT] Loading HR-17 constraints...",
        "> [SYSTEM] Uplinking to Gemini Core for neural evaluation. Standby..."
    ];

    for(let i=0; i < agentLogs.length; i++) {
        setTimeout(() => { aiOutput.innerHTML += agentLogs[i] + "<br>"; }, i * 600);
    }

    const prompt = `You are an AI HR Compliance Auditor for VerifAI. Look at the attached image of a document submitted by an onboarding candidate. Extract the relevant text and evaluate it against 'Company Policy HR-17' (Mandatory Verification of Highest Degree Certificate). Provide output strictly in this exact structure:
1. DOCUMENT_TYPE (Identify the document)
2. EXTRACTED_DATA (Names, Dates, Degrees)
3. STATUS (PASSED or FLAGGED)
4. LOGIC_REASONING (Why did you make this decision based on the image?)
5. CONFIDENCE_LEVEL (%)`;

    try {
        setTimeout(async () => {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: currentMimeType, data: currentBase64Image } }] }] })
            });

            const data = await response.json();
            scanLine.style.display = "none";

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const text = data.candidates[0].content.parts[0].text;
                logAudit("Neural scan complete. Awaiting human authority override.");
                typeWriter(text, aiOutput, 15); 
            } else {
                aiOutput.innerHTML += "<br>SYS_ERR: Invalid response structure from core.";
                logAudit("ERROR: Data packet loss during API handshake.");
            }
        }, 2500); 

    } catch (err) {
        scanLine.style.display = "none";
        aiOutput.innerHTML += "<br>SYS_ERR connecting to Gemini API: " + err.message;
        logAudit("FATAL ERROR: Uplink severed.");
    }
}

function recordDecision(decision) {
    const badge = document.getElementById("statusBadge");
    
    let nodes = parseInt(document.getElementById("metricNodes").innerText.replace(',',''));
    let pending = parseInt(document.getElementById("metricPending").innerText);
    
    document.getElementById("metricNodes").innerText = (nodes + 1).toLocaleString();
    if (pending > 0) document.getElementById("metricPending").innerText = pending - 1;

    // Update the database array for the new tab
    const index = document.getElementById("candidateSelect").value;

    if (decision === 'Approved') {
        badge.className = "status-badge status-approved";
        badge.innerText = "[ CLEARANCE GRANTED ]";
        candidateDatabase[index].status = "approved"; // Update DB
        logAudit("AUTHORITY OVERRIDE: Status updated. Subject cleared.");
    } else {
        badge.className = "status-badge status-rejected";
        badge.innerText = "[ ACCESS DENIED ]";
        candidateDatabase[index].status = "rejected"; // Update DB
        logAudit("AUTHORITY OVERRIDE: Subject rejected. Profile purged.");
    }
    
    document.getElementById("actionButtons").classList.add("hidden");
    document.getElementById("humanOverrideWarning").innerText = ">> OVERRIDE LOGGED. RETURN TO STANDBY.";
    document.getElementById("humanOverrideWarning").style.color = "var(--neon-green)";
}

function downloadAuditReport() {
    const logContent = document.getElementById("auditLog").innerText;
    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VerifAI_System_Log_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAudit("Data extracted by Admin node.");
}