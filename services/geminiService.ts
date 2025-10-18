
import { GoogleGenAI } from '@google/genai';
import type { Content } from '@google/genai';
import { Message, Role } from '../types';

// FIX: Initialize GoogleGenAI with API key directly from environment variables as per guidelines.
// The API key's availability is a hard requirement and handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash';

export const streamChatResponse = async (
    history: Message[],
    newMessage: string,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    })) as Content[];

    const chat = ai.chats.create({
        model: modelName,
        history: chatHistory
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
        onChunk(chunk.text);
    }
};

export const generateChatTitle = async (conversation: string): Promise<string> => {
    const prompt = `Based on this conversation, create a short, descriptive title of 5 words or less. Only return the title itself, without any introductory text.\n\nConversation:\n${conversation}`;
    
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });

        const title = response.text.trim().replace(/^"|"$/g, ''); // Remove leading/trailing quotes
        return title || "Untitled Chat";
    } catch (error) {
        console.error("Error generating title:", error);
        return "Untitled Chat";
    }
};
