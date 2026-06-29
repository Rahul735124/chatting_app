import { suggestReplies, summarizeMessages, completeMessage } from '../services/aiService.js';

export const getSuggestions = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        const suggestions = await suggestReplies(message);
        res.status(200).json({ suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getSummary = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages array is required" });
        }
        const summary = await summarizeMessages(messages);
        res.status(200).json({ summary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const autoComplete = async (req, res) => {
    try {
        const { prefix, context } = req.body;
        if (!prefix) {
            return res.status(400).json({ error: "Prefix is required" });
        }
        const completion = await completeMessage(prefix, context);
        res.status(200).json({ completion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
