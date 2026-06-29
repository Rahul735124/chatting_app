import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateReply = async (message, context = "") => {
    try {
        const prompt = `You are a helpful AI assistant inside a chat application.
Context of the conversation so far:
${context}

User says: "${message}"
Reply naturally and conversationally as an AI.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI Reply Error:", error);
        return "I'm sorry, I couldn't process that right now.";
    }
};

export const suggestReplies = async (message) => {
    try {
        const prompt = `Generate 3 short, human-like replies for the following message.
Message: "${message}"
Return ONLY a JSON array of 3 strings. Example: ["Yes, sounds good!", "No, I can't.", "Maybe later."]`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        return [];
    }
};

export const summarizeMessages = async (messages) => {
    try {
        const conversation = messages.map(m => `${m.sender}: ${m.text}`).join("\n");
        const prompt = `Summarize this conversation in 1-2 lines concisely:
${conversation}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("AI Summary Error:", error);
        return "Could not summarize the conversation.";
    }
};

export const moderateMessage = async (message) => {
    try {
        const prompt = `Analyze the following message for spam, toxicity, or abusive language.
Message: "${message}"
Is this message spam, toxic, or abusive? Return a JSON object with a single boolean property "isUnsafe". Return true if it is spam or abusive, false otherwise.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        const result = JSON.parse(response.text);
        return result.isUnsafe;
    } catch (error) {
        console.error("AI Moderation Error:", error);
        return false; // Fail open
    }
};

export const completeMessage = async (prefix, context = "") => {
    try {
        const prompt = `You are a typing assistant. The user is typing a message in a chat.
Context: ${context}
Current text: "${prefix}"
Provide ONLY the suggested completion for the text. Do not repeat the prefix. Keep it short (max 5-10 words). If no good completion exists, return empty.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("AI Completion Error:", error);
        return "";
    }
};
