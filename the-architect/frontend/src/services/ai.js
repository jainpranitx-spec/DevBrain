// AI Service to handle chatbot interactions
// Can switch between Mock and Real API

import { GoogleGenerativeAI } from "@google/generative-ai";
import { mockAIResponses } from '../utils/mockData';

// Placeholder for API Key - In production use import.meta.env.VITE_GEMINI_API_KEY
// The user can paste their key here or in .env
const API_KEY = "AIzaSyA1A88qqOw8pIzJdr04ubhe1AF2FrJbuEo";

export const generateAIResponse = async (userMessage, contextNodeName) => {
    // 1. Check if we have a real API key
    if (API_KEY || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY)) {
        try {
            const key = API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
        You are an intelligent assistant for a project management mind-map tool called "DevMind".
        The user is asking about a node named "${contextNodeName}".
        
        User Query: "${userMessage}"
        
        Provide a concise, helpful Markdown response. If they ask to break it down, provide a task list.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return {
                message: response.text(),
                type: 'ai',
                source: 'real-api'
            };
        } catch (error) {
            console.warn("AI API Error (falling back to mock):", error);
            // Fallthrough to mock
        }
    }

    // 2. Fallback to Professional Mock (What we have now)
    const lowerInput = userMessage.toLowerCase();

    // Simulated Network Delay for realism
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

    if (lowerInput.includes('break') || lowerInput.includes('task') || lowerInput.includes('sub')) {
        return {
            message: `**Breakdown for ${contextNodeName}:**\n\n1. 🏗️ **Scaffold Component**: Initialize the base structure.\n2. 🔄 **State Logic**: Define ${contextNodeName} specific hooks/stores.\n3. 🎨 **Styling**: Apply glassmorphism tokens.\n4. 🧪 **Tests**: Write unit tests for core logic.\n\nWould you like me to generate these nodes?`,
            type: 'ai',
            source: 'mock'
        };
    }

    if (lowerInput.includes('context') || lowerInput.includes('search') || lowerInput.includes('what is')) {
        return {
            message: `**Context Analysis for ${contextNodeName}:**\n\nInitializing semantic search...\n\n🔍 *Found related pattern in SystemDesign.md*\n> "All UI components must implement the GlassCard interface for consistency."\n\nMake sure to import glass-card utility from the styles index.`,
            type: 'ai',
            source: 'mock'
        };
    }

    // Default "Smart" Response
    return {
        message: `I'm analyzing **${contextNodeName}**. \n\nI can assist with:\n- 🔨 Breaking this down into tasks\n- 🔍 Finding relevant code snippets\n- 📝 Generating documentation\n\nJust let me know what you're thinking.`,
        type: 'ai',
        source: 'mock'
    };
};
