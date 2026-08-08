# 🚀 VerifAI | Enterprise HR Compliance Matrix

**An AI-powered HR compliance engine with human-in-the-loop oversight, built for speed and security.**

VerifAI revolutionizes the way enterprise HR departments verify employee credentials, degrees, and certifications. By moving beyond standard OCR, VerifAI uses multimodal vision models to actually *understand* the context of uploaded documents, cross-reference them against custom corporate policies, and detect resume fraud instantly.

## ✨ Key Features

*   **Intelligent Vision Parsing:** Powered by Qwen Multimodal Vision AI, the system analyzes document images, extracts metadata, and evaluates authenticity.
*   **Lightning-Fast Inference:** Hosted on Groq's LPU architecture for near-instantaneous AI processing and reasoning generation.
*   **Secure Backend Gateway:** API keys and sensitive HR payloads are protected behind a Node.js Express server, ensuring zero browser leakage.
*   **Human-In-The-Loop (HITL):** AI provides the analysis, but authorized human administrators make the final call to Grant Clearance or Purge Records.
*   **Immutable Audit Vault:** All decisions, timestamps, and AI rationales are securely logged in a historical database for strict legal compliance.
*   **Live Telemetry:** Real-time backend system logs streamed directly to the frontend dashboard.

## 🛠️ Tech Stack

*   **Frontend:** Custom Cyberpunk/Terminal UI (HTML5, CSS3, Vanilla JavaScript)
*   **Backend:** Node.js, Express.js
*   **AI Engine:** Groq Cloud LPU, Qwen Multimodal Vision AI
*   **Storage:** Secure LocalStorage Vault Matrix

---

## ⚙️ Installation & Setup

Follow these exact terminal commands to get a local copy of VerifAI up and running.

### 1. Clone the Repository
```bash
git clone [https://github.com/Alexy-ak06/VerifAI.git](https://github.com/Alexy-ak06/VerifAI.git)
cd VerifAI