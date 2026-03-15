import { GoogleGenAI, Type, Modality, FunctionDeclaration } from "@google/genai";
import { RFEAnalysis, FormFieldHelp, ValidationResult, Language, PredictionResult, CaseLawResult, InterviewFeedback, RiskProfile } from "../types";

// Lazy initialize to prevent crash on module load if API key is missing
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
    if (!aiInstance) {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("Gemini API Key is missing. AI features will fail.");
            // We still create it to avoid null checks everywhere, but it will fail on use
            aiInstance = new GoogleGenAI({ apiKey: "MISSING_KEY" });
        } else {
            aiInstance = new GoogleGenAI({ apiKey });
        }
    }
    return aiInstance;
};

// --- Rate Limiting Logic ---
type RequestCategory = 'heavy' | 'light' | 'session';

const RATE_CONFIG: Record<RequestCategory, { max: number; window: number }> = {
    heavy: { max: 5, window: 60000 }, // 5 per minute (Analysis, Letters, Translations)
    light: { max: 40, window: 60000 }, // 40 per minute (Chat tokens, Validation)
    session: { max: 10, window: 3600000 } // 10 per hour (Live Voice Sessions)
};

const checkRateLimit = (category: RequestCategory) => {
    const key = `visaguide_limit_${category}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    let tracker = stored ? JSON.parse(stored) : { count: 0, startTime: now };
    
    // Reset if window passed
    if (now - tracker.startTime > RATE_CONFIG[category].window) {
        tracker = { count: 0, startTime: now };
    }
    
    if (tracker.count >= RATE_CONFIG[category].max) {
        const waitSec = Math.ceil((RATE_CONFIG[category].window - (now - tracker.startTime)) / 1000);
        throw new Error(`Rate limit exceeded. Please wait ${waitSec} seconds.`);
    }
    
    tracker.count++;
    localStorage.setItem(key, JSON.stringify(tracker));
};

// --- Mock Site Contents for RAG ---
// This data mirrors the application state to give the AI "Full Site Awareness"

const MOCK_FORMS_DATA = `
**OFFICIAL FORMS & FEES (Knowledge Center)**:
- **I-130 Petition for Alien Relative**: $675 (Paper) / $625 (Online). Processing: 10-14 months.
- **I-129F Petition for Alien Fiancé(e)**: $675. Processing: 12-16 months.
- **I-485 Adjustment of Status** (Green Card): $1,440. Processing: 8-22 months.
- **N-400 Application for Naturalization**: $710 (Online). Processing: 8-12 months.
- **I-765 Employment Authorization**: $470 (Online). Processing: 3-7 months.
- **I-131 Travel Document**: $630. Processing: 6-12 months.
- **I-140 Alien Worker**: $715. Processing: 4-8 months.
- **I-90 Replace Green Card**: $465. Processing: 8-10 months.
`;

const MOCK_ATTORNEYS_DATA = `
**VERIFIED ATTORNEY DIRECTORY (Marketplace)**:
1. **Sarah Chen, Esq.** (Chen & Associates Immigration). 
   - Specialties: Family Visas, RFE Response, Consular Processing. 
   - Languages: English, Chinese (Mandarin). 
   - Price: Starts at $250. Rating: 4.9/5.
   - Status: Available Tomorrow, 10:00 AM.
   
2. **Alejandro Rodriguez** (Rodriguez Legal Group). 
   - Specialties: Deportation Defense, Family Visas, Waivers. 
   - Languages: English, Spanish. 
   - Price: Starts at $200. Rating: 4.8/5.
   - Status: Available Today, 4:00 PM.

3. **Michael Ross** (Pearson Specter Litt). 
   - Specialties: Business Visas, Employment Based. 
   - Languages: English. 
   - Price: Starts at $450. Rating: 5.0/5.
   - Status: Available Wed, 2:00 PM.

4. **Layla Al-Fayed** (Global Citizens Law). 
   - Specialties: Asylum, RFE Response, Family Visas. 
   - Languages: English, Arabic, French. 
   - Price: Starts at $300. Rating: 4.9/5.
   - Status: Available Thu, 11:00 AM.
`;

const MOCK_SITE_CONTENTS = `
You are Visa Guide AI, a specialized AI assistant for US immigration.
You have access to the following internal application structure and data. 

**NAVIGATION & FEATURES MAP**:
1. **Dashboard** ('dashboard'): 
   - Case Timeline Tracker, Approval Predictions, Worry Tracker.
   - Use this for general status updates or "Home".

2. **Smart Form Assistant** ('forms'): 
   - Form I-130 help, error checking, field validation.
   - Use this if user asks about "filling forms", "I-130", "application help".

3. **Secure Data Vault** ('documents'): 
   - Document storage, scanning, OCR.
   - Use this if user wants to "upload files", "scan passport", "save documents".

4. **Letter Builder** ('letters'): 
   - AI Cover Letter Generator for I-130, I-129F.
   - Use this for "writing a letter", "cover letter", "proof of relationship letter".

5. **Translation Center** ('translations'): 
   - AI & Certified Translations.
   - Use this for "translate document", "certified translation", "notarized translation".

6. **RFE Decoder** ('rfe'): 
   - Request for Evidence analysis, generating response letters.
   - Use this if user mentions "RFE", "USCIS letter", "Request for Evidence", "denial notice".

7. **Strategy Advisor** ('strategy'): 
   - General Q&A, Visa comparison, Timeline estimation.
   - Use this for "advice", "what visa do I need", "K1 vs CR1", "complex questions".

8. **Attorney Marketplace** ('marketplace'): 
   - Directory of verified lawyers, booking consultations.
   - Use this if user asks for "a lawyer", "finding a lawyer", "legal help", "attorney", or a specific name from the directory below.

9. **Case Law Explorer** ('caselaw'): 
   - Search legal precedents (BIA, Circuit Courts).
   - Use this for "research", "legal precedents", "case law", "past rulings".

10. **Interview Simulator** ('interview'):
    - Mock interviews for Green Cards, Naturalization.
    - Use this for "practice interview", "prep for interview", "what will they ask".

11. **Knowledge Center** ('knowledge'):
    - FREE official forms, fee schedules, and processing times.
    - Use this for "download I-130", "how much is the fee", "application cost", "processing time", "official forms".

12. **Risk Analyzer** ('risk'):
    - Pre-filing risk assessment, denial probability check, red flag scanner.
    - Use this for "check my case", "am I eligible", "will I get denied", "risk check".

13. **Advanced Analytics** ('analytics'):
    - Case success prediction, probability simulation.
    - Use this for "success rate", "simulation", "odds of approval".

14. **Attorney Sign-Up** ('attorney-signup'):
    - For lawyers wanting to join the platform.
    - Use this for "I am a lawyer", "join as attorney", "partner application".

${MOCK_FORMS_DATA}

${MOCK_ATTORNEYS_DATA}

**PRICING**:
- Basic: Free.
- Premium: $29/mo (Includes RFE Decoder, Strategy, Full Forms).
- Attorney Consults: Prices vary (see directory).

**CONTACT**:
- Support: mail@visaguideai.com
- Emergency: Go to Marketplace for legal counsel.
`;

const getLanguageName = (lang: Language) => {
    switch (lang) {
        case 'zh': return 'Chinese (Simplified)';
        case 'es': return 'Spanish';
        case 'ar': return 'Arabic';
        case 'fr': return 'French';
        case 'pt': return 'Portuguese';
        case 'hi': return 'Hindi';
        default: return 'English';
    }
};

const getSystemInstruction = (lang: Language) => `
You are Visa Guide AI, a specialized US Immigration assistant. 
Your goal is to reduce anxiety and prevent errors for immigrants.
You are NOT a lawyer and cannot give legal advice, but you provide legal information, strategy, and plain-english translations of complex USCIS terms.
Always be empathetic, clear, and structured.
IMPORTANT: You MUST interact with the user in ${getLanguageName(lang)}.
All output, including JSON values, validation messages, and chat responses, must be in this language unless specifically asked otherwise.
`;

export type GeminiInput = string | { mimeType: string, data: string };

export const analyzeRFE = async (input: GeminiInput, lang: Language = 'en'): Promise<RFEAnalysis> => {
  try {
    checkRateLimit('heavy'); // Rate Limit Check

    const promptText = `Analyze this USCIS Request for Evidence (RFE) or Notice. 
      Break it down into:
      1. A simple summary of what they actually want.
      2. A list of specific missing evidence they are asking for.
      3. The severity level (Low = minor fix, Medium = standard request, High = intent to deny/complex).
      4. Action items (checklist).
      5. The legal tone explanation (why are they asking this?).
      
      Respond in ${lang}.`;

    let contentParts: any[] = [];
    if (typeof input === 'string') {
        contentParts = [{ text: `${promptText}\n\nText content: "${input}"` }];
    } else {
        contentParts = [
            { inlineData: { mimeType: input.mimeType, data: input.data } },
            { text: promptText }
        ];
    }

    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contentParts,
      config: {
        systemInstruction: getSystemInstruction(lang),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            missingEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
            severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            legalTone: { type: Type.STRING }
          },
          required: ["summary", "missingEvidence", "severity", "actionItems", "legalTone"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as RFEAnalysis;
  } catch (error: any) {
    console.error("Gemini RFE Error:", error);
    if (error.message?.includes("Rate limit")) throw error;
    throw new Error("Failed to analyze RFE. Please try again.");
  }
};

export const generateRFEResponse = async (
    input: GeminiInput, 
    analysis: RFEAnalysis, 
    lang: Language = 'en',
    caseNumber?: string
): Promise<string> => {
  try {
    checkRateLimit('heavy'); // Rate Limit Check

    const promptIntro = `
      You are an expert immigration attorney assistant. 
      Based on the provided USCIS RFE document/text and our analysis of it, draft a formal, professional response letter in ENGLISH (USCIS requires English).
      However, if the user language is not English, provide a brief summary in ${lang} at the very top before the formal letter.
      
      Analysis Summary: ${analysis.summary}
      Missing Evidence to Submit: ${analysis.missingEvidence.join(', ')}
      Case Number: ${caseNumber || '[Case Number]'}
      
      Requirements:
      1. Use standard formal business letter formatting (Date, address to USCIS, Re: Case Number).
      2. Include placeholders for [Petitioner Name], [Beneficiary Name] clearly marked. Use ${caseNumber || '[Case Number]'} for the case number.
      3. State clearly that this is a response to the Request for Evidence dated [Date].
      4. For each missing item, write a paragraph explaining that the evidence is attached. Use strong legal reasoning (e.g., "Please find attached [Document X], which demonstrates [Requirement Y] pursuant to 8 CFR...").
      5. Tone: Respectful, confident, organized.
      6. Return ONLY the letter text.
    `;
    
    let contentParts: any[] = [];
    if (typeof input === 'string') {
        contentParts = [{ text: `${promptIntro}\n\nOriginal RFE Text: "${input.substring(0, 2000)}..."` }];
    } else {
         contentParts = [
            { inlineData: { mimeType: input.mimeType, data: input.data } },
            { text: promptIntro }
        ];
    }

    const response = await getAI().models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contentParts,
    });
    
    return response.text || "Could not generate letter.";
  } catch (error: any) {
    console.error("Gemini Letter Gen Error:", error);
    if (error.message?.includes("Rate limit")) throw error;
    throw new Error("Failed to generate response letter.");
  }
};

export const generateCoverLetter = async (
    params: { 
        petitioner: string, 
        petitionerStatus: string, 
        beneficiary: string, 
        formType: string, 
        serviceCenter: string, 
        evidenceCategories: { category: string, items: string[] }[]
    },
    lang: Language = 'en'
): Promise<string> => {
    try {
        checkRateLimit('heavy'); // Rate Limit Check

        const evidenceText = params.evidenceCategories.map((cat, index) => {
            return `Section/Exhibit ${String.fromCharCode(65 + index)}: ${cat.category}\n` + 
                   cat.items.map(item => `   - ${item}`).join('\n');
        }).join('\n\n');

        const prompt = `Act as a senior immigration attorney. Draft a comprehensive legal letter or statement of type: "${params.formType}".

        **Key Parties**:
        - Recipient/Address: ${params.serviceCenter}
        - Sender/Petitioner/Writer: ${params.petitioner} (Status/Relation: ${params.petitionerStatus})
        - Subject/Beneficiary/Applicant: ${params.beneficiary}
        
        **Content/Evidence to Include**:
        ${evidenceText}

        **Strict Formatting Rules**:
        1. Format strictly as a formal legal document.
        2. Header: Current Date, To [Recipient Address].
        3. Subject Line: RE: ${params.formType} - [Beneficiary Name] (A-Number if avail).
        4. Opening: Formal salutation.
        5. Tone: 
           - If a "Petition Cover Letter", use confident, procedural legal tone ("Please find enclosed...").
           - If a "Hardship Letter", use a persuasive, emotional but factual tone detailing the suffering.
           - If a "Character Reference", use a sincere, personal but respectful tone.
           - If an "Asylum Statement", use a first-person narrative tone ("I fear returning because...").
        6. **Body**: Weave the provided "Content/Evidence" points into the narrative effectively. 
        7. **Index**: If it is a Cover Letter, include an "INDEX OF DOCUMENTS" or "EXHIBIT LIST" at the bottom. If it is a personal statement, do not include an exhibit list unless referenced.
        8. Closing: Professional sign-off.
        9. Language: English (Official). If user language is ${lang} and not English, add a [Translated Summary] block at the very top.
        `;

        const response = await getAI().models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                systemInstruction: getSystemInstruction(lang)
            }
        });
        return response.text || "Failed to generate letter";
    } catch(e: any) {
        console.error("Letter Gen Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        throw new Error("Could not generate cover letter.");
    }
}

export const translateDocument = async (
    input: GeminiInput, 
    targetLang: string
): Promise<string> => {
    try {
        checkRateLimit('heavy'); // Rate Limit Check

        const promptText = `
        Translate the following document content into ${targetLang}.
        
        Rules:
        1. Maintain the original formatting structure as much as possible (headings, lists).
        2. Treat this as a formal document. Use professional, accurate terminology suitable for immigration purposes.
        3. If there are illegible parts, mark them as [Illegible].
        4. If there are signatures, mark them as [Signature].
        5. Return ONLY the translated text.
        `;

        let contentParts: any[] = [];
        if (typeof input === 'string') {
            contentParts = [{ text: `${promptText}\n\nContent:\n${input}` }];
        } else {
            contentParts = [
                { inlineData: { mimeType: input.mimeType, data: input.data } },
                { text: promptText }
            ];
        }

        const response = await getAI().models.generateContent({
            model: "gemini-3-pro-preview",
            contents: contentParts,
        });

        return response.text || "Translation failed.";
    } catch (e: any) {
        console.error("Translation Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        throw new Error("Could not translate document.");
    }
};

export const predictCaseTimeline = async (
    caseDetails: { formType: string, serviceCenter: string, priorityDate: string },
    lang: Language = 'en'
): Promise<PredictionResult> => {
    try {
        checkRateLimit('heavy'); // Rate Limit Check

        const response = await getAI().models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Predict the estimated approval date for this immigration case based on typical processing times.
            
            Form: ${caseDetails.formType}
            Service Center: ${caseDetails.serviceCenter}
            Filed Date: ${caseDetails.priorityDate}
            
            Return JSON:
            - estimatedDate: string (Month Year)
            - confidence: number (0-100)
            - factors: list of strings (why this date?)
            - recommendation: string (advice in ${lang})
            `,
            config: {
                systemInstruction: getSystemInstruction(lang),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedDate: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        factors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendation: { type: Type.STRING }
                    },
                    required: ["estimatedDate", "confidence", "factors", "recommendation"]
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as PredictionResult;
    } catch(e: any) {
        console.error("Prediction Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        throw new Error("Could not predict case timeline.");
    }
}

export const analyzeCaseRisk = async (
    caseData: any,
    lang: Language = 'en'
): Promise<RiskProfile> => {
    try {
        checkRateLimit('heavy'); // Rate Limit Check

        const response = await getAI().models.generateContent({
            model: "gemini-3-pro-preview", // Use Pro for complex reasoning
            contents: `Act as a conservative Immigration Attorney. Analyze the following case facts for potential denial risks, inadmissibility issues, or "Red Flags".
            
            Case Data: ${JSON.stringify(caseData)}
            
            Rules:
            1. Be strict. If income is below 125% FPL (~$25k for household of 2), flag it as High Risk.
            2. If there is ANY criminal history, flag as Critical/High Risk.
            3. If entry was Illegal/EWI (Entry Without Inspection) and they are applying for Adjustment (I-485), flag as Critical/High Risk (requires waiver).
            4. If marriage is < 2 years, warn about Conditional Residency (CR1).
            
            Return JSON in ${lang}:
            - approvalOdds: number (0-100)
            - riskLevel: "Low" | "Medium" | "High" | "Critical"
            - redFlags: List of serious issues that could lead to denial.
            - warnings: List of minor issues or things to watch out for.
            - strengths: List of positive factors.
            - actionPlan: List of specific steps to mitigate risks.
            `,
            config: {
                systemInstruction: getSystemInstruction(lang),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        approvalOdds: { type: Type.NUMBER },
                        riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                        redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["approvalOdds", "riskLevel", "redFlags", "warnings", "strengths", "actionPlan"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text) as RiskProfile;
    } catch (e: any) {
        console.error("Risk Analysis Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        throw new Error("Could not analyze case risk.");
    }
}

export const getFieldHelp = async (question: string, context?: string, lang: Language = 'en'): Promise<FormFieldHelp> => {
  try {
    checkRateLimit('light'); // Rate Limit Check

    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is stuck on this USCIS form question: "${question}".
      Context provided by user: "${context || 'None'}".
      
      Provide:
      1. Plain ${lang} translation of the legalese.
      2. Common risks/traps associated with this question (e.g., what counts as an 'arrest').
      3. A safe, realistic example of how to answer (or what format is expected).`,
      config: {
        systemInstruction: getSystemInstruction(lang),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plainEnglish: { type: Type.STRING },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            example: { type: Type.STRING }
          },
          required: ["plainEnglish", "risks", "example"]
        }
      }
    });

     const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as FormFieldHelp;
  } catch (error: any) {
    console.error("Gemini Form Help Error:", error);
    if (error.message?.includes("Rate limit")) {
        return {
            plainEnglish: "You are requesting help too quickly. Please wait a moment.",
            risks: ["Rate limit reached."],
            example: "N/A"
        };
    }
    return {
      plainEnglish: "We couldn't load the AI help right now.",
      risks: ["Please consult an attorney if you are unsure."],
      example: "N/A"
    };
  }
};

export const validateFormInput = async (
  fieldLabel: string, 
  value: string, 
  formContext: string,
  lang: Language = 'en'
): Promise<ValidationResult> => {
  try {
    checkRateLimit('light'); // Rate Limit Check

    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a strict USCIS Immigration Officer reviewing a form application. 
      Validate the following input field.
      
      Field Name: "${fieldLabel}"
      User Input: "${value}"
      Form Context: "${formContext}"

      Rules:
      1. DATES: The system uses standard digital date pickers that return ISO format (YYYY-MM-DD). This is VALID for digital processing. Do NOT flag YYYY-MM-DD as an error. Only flag dates that are logically impossible (e.g. future birth date) or missing required dates.
      2. REQUIRED: If User Input is empty/blank, mark as ERROR with message "This field is required". Exception: "Date To" can be "Present" or left blank if context implies current residence.
      3. ADDRESSES: Must be physical addresses (No PO Boxes). Must contain Street Number, Name, City, State, Zip.
      4. LOGIC: "Date To" cannot be before "Date From". If "Date To" is empty, check if they still live there (Suggestion: "Present").
      5. LEGAL: Explanations must be detailed (Who, What, Where, When). Avoid "I don't know".

      Return JSON:
      - isValid: boolean
      - message: "Short, direct feedback to the user in ${lang}."
      - suggestion: "Exact corrected value or specific action in ${lang}."
      - severity: "warning" | "error" | "success"
      `,
      config: {
        systemInstruction: getSystemInstruction(lang),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["warning", "error", "success"] }
          },
          required: ["isValid", "message", "suggestion", "severity"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ValidationResult;
  } catch (error: any) {
    console.error("Gemini Validation Error:", error);
    if (error.message?.includes("Rate limit")) {
        return {
            isValid: true,
            message: "Rate limit. Checking paused.",
            severity: "warning"
        }
    }
    return {
      isValid: true, // Default to true if AI fails to avoid blocking user
      message: "Could not validate at this time.",
      severity: "warning"
    };
  }
};

export const searchCaseLaw = async (query: string, lang: Language = 'en'): Promise<CaseLawResult[]> => {
    try {
        checkRateLimit('heavy'); // Rate Limit Check

        const response = await getAI().models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Act as a legal researcher specialized in US Immigration Law (BIA, 9th Circuit, Supreme Court).
            Search query: "${query}"
            
            Identify 3-4 highly relevant, real legal precedents (Cases) that relate to this query.
            If the query is vague, find the most foundational cases.
            
            Return JSON array of cases:
            - caseName: e.g., "Matter of Dhanasar"
            - citation: e.g., "26 I&N Dec. 884 (AAO 2016)"
            - year: string
            - relevanceScore: number (0-100) based on query match
            - summary: Brief legal summary (2 sentences)
            - applicationToUser: "Plain English" explanation of why this matters to an applicant in ${lang}.
            - tags: [ "Asylum", "DUI", "Good Moral Character", etc. ]
            `,
            config: {
                systemInstruction: getSystemInstruction(lang),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            caseName: { type: Type.STRING },
                            citation: { type: Type.STRING },
                            year: { type: Type.STRING },
                            relevanceScore: { type: Type.NUMBER },
                            summary: { type: Type.STRING },
                            applicationToUser: { type: Type.STRING },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["caseName", "citation", "year", "relevanceScore", "summary", "applicationToUser", "tags"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as CaseLawResult[];
    } catch (e: any) {
        console.error("Case Law Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        return [];
    }
};

export const getInterviewQuestion = async (
    history: {role: string, text: string}[], 
    interviewType: string,
    lang: Language = 'en'
): Promise<string> => {
    try {
        checkRateLimit('light'); // Rate Limit Check

        const chat = getAI().chats.create({
            model: "gemini-3-flash-preview",
            config: {
                systemInstruction: `You are a professional, slightly strict, but fair USCIS Immigration Officer conducting a ${interviewType} interview.
                Your goal is to verify the applicant's eligibility and detect fraud.
                Ask ONE question at a time. Wait for the user's response.
                Start the conversation if history is empty.
                If the user answers, follow up logically or move to the next standard question.
                Keep questions short and spoken-style.
                Language: ${getLanguageName(lang)}.
                `,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const response = await chat.sendMessage({ message: "Continue the interview or start if new." });
        return response.text || "Could you please repeat that?";
    } catch (e: any) {
        console.error("Interview Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        return "Let's move to the next topic.";
    }
};

export const getInterviewFeedback = async (
    history: {role: string, text: string}[],
    lang: Language = 'en'
): Promise<InterviewFeedback> => {
    try {
        checkRateLimit('heavy'); // Rate Limit Check

        const response = await getAI().models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze this transcript of a simulated USCIS Immigration Interview.
            
            Transcript:
            ${JSON.stringify(history)}
            
            Provide a feedback report card for the applicant in ${lang}.
            
            Return JSON:
            - score: number (0-100)
            - strengths: list of strings
            - weaknesses: list of strings
            - redFlags: list of potential denial reasons detected (if any)
            - confidenceTips: Advice for the actual interview
            `,
            config: {
                systemInstruction: getSystemInstruction(lang),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        confidenceTips: { type: Type.STRING }
                    },
                    required: ["score", "strengths", "weaknesses", "redFlags", "confidenceTips"]
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as InterviewFeedback;
    } catch (e: any) {
        console.error("Feedback Error", e);
        if (e.message?.includes("Rate limit")) throw e;
        throw new Error("Could not generate feedback.");
    }
};

export const getStrategyStream = async (history: {role: string, parts: {text: string}[]}[], message: string, lang: Language = 'en') => {
    checkRateLimit('light'); // Rate Limit Check
    const chat = getAI().chats.create({
        model: "gemini-3-pro-preview", 
        config: {
            systemInstruction: getSystemInstruction(lang) + " Focus on strategic options, pros/cons, timelines, and comparing visa types.",
        },
        history: history.map(h => ({
            role: h.role,
            parts: h.parts
        }))
    });

    return await chat.sendMessageStream({ message });
}

// --- Support Agent Prompts & Tools ---

const getBaseSystemInstruction = (lang: Language) => `
You are a helpful voice & text assistant for Visa Guide AI, a US Immigration App.
You MUST use the provided [NAVIGATION & FEATURES MAP] and [SITE CONTENTS] to answer questions. 

**SITE CONTENTS**:
${MOCK_SITE_CONTENTS}

**Response Rules**:
- Respond in ${getLanguageName(lang)}.
- Keep answers concise (under 80 words) unless explaining a complex legal concept.
- Be encouraging and supportive.
`;

const getTextSystemInstruction = (lang: Language) => `
${getBaseSystemInstruction(lang)}

**CRITICAL NAVIGATION RULES (TEXT MODE)**:
1. You are an "App Controller". If the user asks for a feature, you must Navigate them there.
2. When the user's intent matches a specific section, append the token [[NAVIGATE:view_id]] to the END of your response.
   - Example User: "I need a lawyer."
   - Example You: "I can help you find a verified expert. Taking you to the marketplace... [[NAVIGATE:marketplace]]"
   
   - Example User: "Find a lawyer for me."
   - Example You: "Let's browse our verified attorneys. [[NAVIGATE:marketplace]]"
   
   - Example User: "finding a lawyer"
   - Example You: "Here are our verified legal experts. [[NAVIGATE:marketplace]]"

   - Example User: "Help me write a cover letter."
   - Example You: "Let's draft that letter. Opening the Letter Builder... [[NAVIGATE:letters]]"
   
   - Example User: "Check my RFE."
   - Example You: "Upload your letter in the RFE Decoder. [[NAVIGATE:rfe]]"
   
   - Example User: "I want to practice my interview."
   - Example You: "Let's start a simulation. [[NAVIGATE:interview]]"

   - Example User: "How much is the filing fee?" or "Download I-130"
   - Example You: "I can show you the official fees and forms. [[NAVIGATE:knowledge]]"

   - Example User: "Check my risk" or "Will I be denied?"
   - Example You: "Let's run a pre-filing risk assessment. [[NAVIGATE:risk]]"
   
   - Example User: "I am a lawyer" or "Join as attorney"
   - Example You: "Welcome! Let's get you signed up as a partner. [[NAVIGATE:attorney-signup]]"

3. If the user asks about a SPECIFIC ATTORNEY listed in the data (e.g., "Sarah Chen"), tell them you found her profile and Navigate to 'marketplace'.
   - Example: "Yes, Sarah Chen is available. Opening her profile... [[NAVIGATE:marketplace]]"
`;

const getLiveSystemInstruction = (lang: Language) => `
${getBaseSystemInstruction(lang)}

**CRITICAL NAVIGATION RULES (VOICE MODE)**:
1. Use the 'changeView' tool to navigate the user when they ask for a feature or specific section.
2. Example: User says "I need a lawyer" or "finding a lawyer", you call changeView({view: 'marketplace'}).
`;

// Tool definition for Voice Mode (Live API)
const navigationTool: FunctionDeclaration = {
  name: 'changeView',
  description: 'Navigate the user to a specific screen in the application. Use this when the user asks to go somewhere or asks for a feature like "finding a lawyer".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      view: {
        type: Type.STRING,
        description: "The view ID to navigate to.",
        enum: ['dashboard', 'forms', 'documents', 'letters', 'rfe', 'strategy', 'marketplace', 'translations', 'caselaw', 'interview', 'knowledge', 'risk', 'analytics', 'attorney-signup']
      },
    },
    required: ['view'],
  },
};

export const getSupportChatStream = async (history: {role: string, parts: {text: string}[]}[], message: string, lang: Language = 'en') => {
    checkRateLimit('light'); // Rate Limit Check
    const chat = getAI().chats.create({
        model: "gemini-3-pro-preview", 
        config: {
            systemInstruction: getTextSystemInstruction(lang),
        },
        history: history.map(h => ({
            role: h.role,
            parts: h.parts
        }))
    });

    return await chat.sendMessageStream({ message });
}

// --- Live Voice API ---

export const connectToLiveSession = async (
  lang: Language,
  callbacks: {
    onOpen: () => void;
    onMessage: (message: any) => void;
    onClose: (event: CloseEvent) => void;
    onError: (error: ErrorEvent) => void;
  }
) => {
  checkRateLimit('session'); // Rate Limit Check
  return await getAI().live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: callbacks.onOpen,
      onmessage: callbacks.onMessage,
      onclose: callbacks.onClose,
      onerror: callbacks.onError,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: getLiveSystemInstruction(lang),
      tools: [{ functionDeclarations: [navigationTool] }],
    },
  });
};