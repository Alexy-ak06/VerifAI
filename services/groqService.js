
require('dotenv').config();

async function evaluateDocument(apiKey, mimeType, imageBase64, candidateName, customPolicy) {
    
    const secureKey = process.env.GROQ_API_KEY; 
    
    if (!secureKey) throw new Error("CRITICAL: Server GROQ_API_KEY is missing in .env file.");

    const activePolicy = customPolicy || "Company Policy HR-17: Mandatory Verification of Highest Degree Certificate and matching legal identification.";

    const prompt = `You are an AI HR Compliance Auditor for VerifAI. Look at the attached document image submitted by candidate ${candidateName}. 
Evaluate it strictly against this active policy constraint: "${activePolicy}".
Provide output strictly in this exact markdown structure:
1. DOCUMENT_TYPE (Identify document)
2. EXTRACTED_DATA (Names, Dates, Degrees)
3. STATUS (PASSED or FLAGGED)
4. LOGIC_REASONING (Detailed compliance breakdown)
5. CONFIDENCE_LEVEL (%)`;

    
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${secureKey}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            model: "qwen/qwen3.6-27b",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { 
                            type: "image_url", 
                            image_url: { 
                                url: `data:${mimeType};base64,${imageBase64}` 
                            } 
                        }
                    ]
                }
            ],
            temperature: 0.1
        })
    });

    const data = await response.json();
    
    
    if (!data.choices || !data.choices[0].message) {
        console.error("[GROQ_API_ERROR]:", JSON.stringify(data, null, 2));
        throw new Error(data.error ? data.error.message : "Groq API returned an invalid structure.");
    }

    let rawContent = data.choices[0].message.content;
    
    let cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>\n*/g, '');
    return cleanContent.trim();
}

module.exports = { evaluateDocument };