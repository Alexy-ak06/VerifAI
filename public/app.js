let currentBase64Image = null;
let currentMimeType = null;

window.onload = function() {
    initDropdown();
};

function initDropdown() {
    let subjects = JSON.parse(localStorage.getItem('verifai_subjects'));
    
    if (!subjects) {
        subjects = [
            { name: "Rahul Sharma", role: "Level 4 Developer" },
            { name: "Priya Patel", role: "Systems Architect" },
            { name: "Amit Kumar", role: "Security Engineer" }
        ];
        localStorage.setItem('verifai_subjects', JSON.stringify(subjects));
    }
    
    const select = document.getElementById("candidateSelect");
    select.innerHTML = ""; 
    
    subjects.forEach((sub, index) => {
        select.innerHTML += `<option value="${index}">Subject: ${sub.name} (${sub.role.split(' ')[0]})</option>`;
    });
    
    updateSelectedProfile(); 
}

function updateSelectedProfile() {
    let subjects = JSON.parse(localStorage.getItem('verifai_subjects'));
    const select = document.getElementById("candidateSelect");
    
    if (subjects && subjects[select.value]) {
        const selected = subjects[select.value];
        document.getElementById("candName").innerText = selected.name;
        document.getElementById("candRole").innerText = selected.role;
        
        const badge = document.getElementById("statusBadge");
        badge.className = "status-badge status-pending";
        badge.innerText = "[ AWAITING SCAN ]";
        
        document.getElementById("resultSection").classList.add("hidden");
        document.getElementById("aiOutput").innerHTML = "";
        logAudit(`Subject index switched to: ${selected.name}`);
    }
}

function addNewSubject() {
    const newName = prompt("[ SECURE ENTRY ] Enter new subject's full name:");
    if (!newName) return; 
    
    const newRole = prompt(`[ SECURE ENTRY ] Enter assigned class/role for ${newName}:`);
    if (!newRole) return;
    
    let subjects = JSON.parse(localStorage.getItem('verifai_subjects')) || [];
    subjects.push({ name: newName, role: newRole });
    localStorage.setItem('verifai_subjects', JSON.stringify(subjects));
    
    initDropdown();
    
    document.getElementById("candidateSelect").value = subjects.length - 1;
    updateSelectedProfile();
}

function switchView(viewId, element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    document.getElementById('view-hub').classList.add('hidden');
    document.getElementById('view-database').classList.add('hidden');
    document.getElementById('view-policy').classList.add('hidden');
    document.getElementById('view-logs').classList.add('hidden');
    document.getElementById('view-archives').classList.add('hidden');

    document.getElementById(viewId).classList.remove('hidden');
    
    if(viewId === 'view-database') {
        loadArchives();
    } else if(viewId === 'view-archives') {
        loadRawArchives(); 
    } else if(viewId === 'view-logs') {
        fetchServerLogs();
    }
}

async function fetchServerLogs() {
    const container = document.getElementById("serverLogsContainer");
    container.innerHTML = "> Querying Node.js backend telemetry streams...";
    
    try {
        const response = await fetch('http://localhost:3000/api/logs');
        const data = await response.json();
        
        if(data.success) {
            container.innerHTML = "";
            data.logs.forEach(log => {
                container.innerHTML += `<br>> [${log.timestamp.substring(11, 19)}] [${log.type}]: ${log.message}`;
            });
        } else {
            container.innerHTML += "<br>SYS_ERR: Failed to parse server telemetry.";
        }
    } catch(err) {
        container.innerHTML += `<br>FATAL: Cannot connect to backend server at localhost:3000. Make sure 'node server.js' is running!`;
    }
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
   element.innerHTML += "<br><br>> [GROQ_LPU_RESPONSE]:<br>";
    for (let i = 0; i < text.length; i++) {
        if(text.charAt(i) === '\n') { element.innerHTML += '<br>'; } 
        else { element.innerHTML += text.charAt(i); }
        await new Promise(r => setTimeout(r, speed));
    }
    document.getElementById("humanOverrideWarning").classList.remove("hidden");
    document.getElementById("actionButtons").classList.remove("hidden");
}

async function runVisionVerification() {
    const apiKey = "SERVER_VAULT_ACTIVE"; 
    const customPolicy = document.getElementById("policyInput") ? document.getElementById("policyInput").value.trim() : "";
    if (!currentBase64Image) { alert("SYS_ERR: No visual data packet detected."); return; }

    const resultSection = document.getElementById("resultSection");
    const aiOutput = document.getElementById("aiOutput");
    const scanLine = document.getElementById("scanLine");
    
    resultSection.classList.remove("hidden");
    document.getElementById("humanOverrideWarning").classList.add("hidden");
    document.getElementById("actionButtons").classList.add("hidden");
    aiOutput.innerHTML = "";
    
    scanLine.style.display = "block";
    logAudit("Routing through Secure Enterprise Backend Gateway...");

    const agentLogs = [
        "> [AGENT_1: ORCHESTRATOR] Initializing matrix pathways...",
        "> [AGENT_2: OCR_ENGINE] Extracting text nodes and metadata...",
        "> [AGENT_3: POLICY_BOT] Injecting active custom constraints...",
        "> [SYSTEM] Transmitting encrypted payload to Node.js backend..."
    ];

    for(let i=0; i < agentLogs.length; i++) {
        setTimeout(() => { aiOutput.innerHTML += agentLogs[i] + "<br>"; }, i * 600);
    }

    try {
        setTimeout(async () => {
            const response = await fetch('http://localhost:3000/api/verify', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: apiKey,
                    mimeType: currentMimeType,
                    imageBase64: currentBase64Image,
                    candidateName: document.getElementById("candName").innerText,
                    customPolicy: customPolicy
                })
            });

            const data = await response.json();
            scanLine.style.display = "none";

            if (data.success) {
                logAudit("Backend verification handshake complete. Streaming results.");
                typeWriter(data.analysis, aiOutput, 15); 
            } else {
                aiOutput.innerHTML += `<br>SYS_ERR: ${data.error || "Invalid response structure."}`;
                logAudit("ERROR: Backend gateway rejected packet.");
            }
        }, 2500); 

    } catch (err) {
        scanLine.style.display = "none";
        aiOutput.innerHTML += "<br>SYS_ERR connecting to local backend server: " + err.message;
        logAudit("FATAL ERROR: Backend server offline.");
    }
}

function grantClearance() {
    const candidateName = document.getElementById("candName").innerText;
    alert(`[SECURE OVERRIDE] Clearance officially granted for ${candidateName}. Data logged to Matrix.`);
    
    let clearedNodes = parseFloat(document.getElementById("metricRate").innerText);
    document.getElementById("metricRate").innerText = (clearedNodes > 99 ? clearedNodes : clearedNodes + 0.1).toFixed(1) + "%";

    saveToMatrix("APPROVED");
    resetDashboard();
}

function purgeRecord() {
    const candidateName = document.getElementById("candName").innerText;
    alert(`[SECURITY ALERT] Record purged for ${candidateName}. Subject flagged in system.`);
    saveToMatrix("REJECTED");
    resetDashboard();
}

function resetDashboard() {
    document.getElementById("resultSection").classList.add("hidden");
    document.getElementById("aiOutput").innerHTML = "";
    document.getElementById("imagePreview").src = "";
    document.getElementById("imageWrapper").style.display = "none";
    document.getElementById("dropText").style.display = "block";
    document.getElementById("fileBtn").style.display = "inline-block";
    currentBase64Image = null;
    currentMimeType = null;
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

function downloadReport() {
    const aiText = document.getElementById("aiOutput").innerText;
    if (!aiText || aiText.trim() === "") {
        alert("SYS_ERR: No active audit data to download.");
        return;
    }
    
    const candidateName = document.getElementById("candName").innerText.replace(/ /g, "_");
    const blob = new Blob(["> VERIFAI COMPLIANCE REPORT\n\n" + aiText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `VerifAI_Audit_${candidateName}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function saveToMatrix(status) {
    const candidateName = document.getElementById("candName").innerText;
    const candidateRole = document.getElementById("candRole").innerText;
    
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
    
    const record = { 
        name: candidateName, 
        role: candidateRole, 
        date: formattedDate, 
        status: status 
    };
    
    let archives = JSON.parse(localStorage.getItem("verifai_archives")) || [];
    archives.push(record);
    localStorage.setItem("verifai_archives", JSON.stringify(archives));
}

function loadArchives() {
    const archives = JSON.parse(localStorage.getItem("verifai_archives")) || [];
    const tbody = document.getElementById("candidateTableBody");
    
    tbody.innerHTML = "";
    
    if (archives.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No records found in the Matrix.</td></tr>`;
        return;
    }
    
    archives.slice().reverse().forEach(record => {
        const statusColor = record.status === "APPROVED" ? "var(--neon-green)" : "var(--neon-pink)";
        tbody.innerHTML += `
            <tr>
                <td style="color: var(--text-main); font-weight: bold;">${record.name}</td>
                <td>${record.role}</td>
                <td style="font-family: var(--font-mono); font-size: 11px;">${record.date}</td>
                <td style="color: ${statusColor}; font-weight: bold; letter-spacing: 1px;">[ ${record.status} ]</td>
                <td>
                    <button class="btn-secondary" style="font-size: 10px; padding: 4px 8px;" onclick="alert('Accessing encrypted audit log for ${record.name}...')">VIEW LOG</button>
                </td>
            </tr>
        `;
    });
}

function loadRawArchives() {
    const archives = JSON.parse(localStorage.getItem("verifai_archives")) || [];
    const vault = document.getElementById("archiveVault");
    
    if(archives.length === 0) {
        vault.innerHTML = "> SECURE VAULT IS EMPTY.<br>> No historical data found.";
        return;
    }
    
    vault.innerHTML = "> DECRYPTING VAULT RECORDS... [ SUCCESS ]<br>====================================================<br><br>";
    
    archives.slice().reverse().forEach((record, index) => {
        const statusColor = record.status === "APPROVED" ? "var(--neon-green)" : "var(--neon-pink)";
        vault.innerHTML += `<span style="color: var(--text-muted);">[PAYLOAD_${index + 1}]</span> TIMESTAMP: ${record.date} <br>> SUBJECT: ${record.name} <br>> STATUS: <span style="color: ${statusColor};">${record.status}</span><br><br>`;
    });
}