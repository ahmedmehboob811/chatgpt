
import React, { useEffect, useRef } from 'react';
import { Chat, Role } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { SunIcon, BoltIcon, WarningIcon, GeminiLogo } from './Icons';

interface ChatWindowProps {
    chat: Chat | null;
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    onNewChat: () => void;
}

const WelcomeScreen: React.FC<{onNewChat: () => void}> = ({onNewChat}) => (
    <div className="flex-1 flex flex-col items-center justify-center text-white pb-20">
        <div className="w-full max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-10">Gemini Chat Clone</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-white/5 rounded-lg">
                    <h2 className="flex items-center justify-center gap-2 mb-2 font-semibold"><SunIcon className="w-5 h-5"/> Examples</h2>
                    <ul className="space-y-2">
                        <li className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">"Explain quantum computing in simple terms"</li>
                        <li className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">"Got any creative ideas for a 10 year old’s birthday?"</li>
                        <li className="p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">"How do I make an HTTP request in Javascript?"</li>
                    </ul>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                    <h2 className="flex items-center justify-center gap-2 mb-2 font-semibold"><BoltIcon className="w-5 h-5"/> Capabilities</h2>
                    <ul className="space-y-2">
                        <li className="p-2 bg-white/5 rounded">Remembers what user said earlier in the conversation</li>
                        <li className="p-2 bg-white/5 rounded">Allows user to provide follow-up corrections</li>
                        <li className="p-2 bg-white/5 rounded">Trained to decline inappropriate requests</li>
                    </ul>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                    <h2 className="flex items-center justify-center gap-2 mb-2 font-semibold"><WarningIcon className="w-5 h-5"/> Limitations</h2>
                    <ul className="space-y-2">
                        <li className="p-2 bg-white/5 rounded">May occasionally generate incorrect information</li>
                        <li className="p-2 bg-white/5 rounded">May occasionally produce harmful instructions or biased content</li>
                        <li className="p-2 bg-white/5 rounded">Limited knowledge of world and events after 2021</li>
                    </ul>
                </div>
            </div>
             <button onClick={onNewChat} className="mt-10 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
                Start a New Chat
            </button>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ chat, isLoading, onSendMessage, onNewChat }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {!chat || chat.messages.length === 0 ? (
                    <WelcomeScreen onNewChat={onNewChat} />
                ) : (
                    <div className="w-full max-w-3xl mx-auto px-4">
                        {chat.messages.map((msg, index) => (
                            <ChatMessage 
                                key={index} 
                                message={msg}
                                isStreaming={isLoading && msg.role === Role.MODEL && index === chat.messages.length - 1}
                             />
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
            <div className="w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-4">
                <div className="w-full max-w-3xl mx-auto px-4">
                    <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
                    <p className="text-xs text-center text-gray-400 py-2">
                        This is a ChatGPT clone using the Gemini API. It is for demonstration purposes only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
