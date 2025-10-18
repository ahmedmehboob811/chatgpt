
import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { streamChatResponse, generateChatTitle } from './services/geminiService';
import { Chat, Message, Role } from './types';
import { v4 as uuidv4 } from 'uuid';
import { MenuIcon } from './components/Icons';

// Mock authentication
const useMockAuth = () => {
    const [user, setUser] = useState<{ name: string; email: string; image: string } | null>(null);

    const signIn = () => {
        setUser({
            name: 'Demo User',
            email: 'demo@example.com',
            image: `https://i.pravatar.cc/40?u=demo`
        });
    };

    const signOut = () => {
        setUser(null);
    };

    return { user, signIn, signOut, isSignedIn: !!user };
};


const App: React.FC = () => {
    const { user, signIn, signOut, isSignedIn } = useMockAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const activeChat = useMemo(() => {
        return chats.find(chat => chat.id === activeChatId) || null;
    }, [chats, activeChatId]);

    const handleNewChat = useCallback(() => {
        const newChat: Chat = {
            id: uuidv4(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date()
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    }, []);

    const handleSelectChat = useCallback((id: string) => {
        setActiveChatId(id);
    }, []);
    
    const handleDeleteChat = useCallback((id: string) => {
        setChats(prev => prev.filter(chat => chat.id !== id));
        if (activeChatId === id) {
            setActiveChatId(chats.length > 1 ? chats[1].id : null);
        }
    }, [activeChatId, chats]);

    const handleSendMessage = useCallback(async (messageContent: string) => {
        if (!activeChatId) {
            const newChatId = uuidv4();
            const newChat: Chat = { id: newChatId, title: 'New Chat', messages: [], createdAt: new Date() };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChatId);
            // We need to wait for state to update, so we pass the new chat directly
            await processMessage(newChat, messageContent);
        } else {
            const currentChat = chats.find(c => c.id === activeChatId);
            if (currentChat) {
                await processMessage(currentChat, messageContent);
            }
        }
    }, [activeChatId, chats]);
    
    const processMessage = async (chat: Chat, messageContent: string) => {
        const userMessage: Message = { role: Role.USER, content: messageContent };
        
        // Update chat with user message immediately
        const updatedChatWithUserMessage = {
            ...chat,
            messages: [...chat.messages, userMessage],
        };
        setChats(prev => prev.map(c => c.id === chat.id ? updatedChatWithUserMessage : c));
        
        setIsLoading(true);

        const modelMessage: Message = { role: Role.MODEL, content: '' };

        // Add empty model message
        const updatedChatWithModelMessage = {
            ...updatedChatWithUserMessage,
            messages: [...updatedChatWithUserMessage.messages, modelMessage],
        };
        setChats(prev => prev.map(c => c.id === chat.id ? updatedChatWithModelMessage : c));

        try {
            await streamChatResponse(
                chat.messages, 
                messageContent, 
                (chunk) => {
                    setChats(prev => {
                        return prev.map(c => {
                            if (c.id === chat.id) {
                                const lastMessage = c.messages[c.messages.length - 1];
                                const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
                                return { ...c, messages: [...c.messages.slice(0, -1), updatedLastMessage] };
                            }
                            return c;
                        });
                    });
                }
            );
            
            // Generate title for new chats
            if (chat.title === 'New Chat') {
                const conversationHistory = [...chat.messages, userMessage].map(m => `${m.role}: ${m.content}`).join('\n');
                const newTitle = await generateChatTitle(conversationHistory);
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: newTitle } : c));
            }

        } catch (error) {
            console.error("Error streaming chat response:", error);
             setChats(prev => {
                return prev.map(c => {
                    if (c.id === chat.id) {
                        const lastMessage = c.messages[c.messages.length - 1];
                        const updatedLastMessage = { ...lastMessage, content: "Sorry, I encountered an error. Please try again." };
                        return { ...c, messages: [...c.messages.slice(0, -1), updatedLastMessage] };
                    }
                    return c;
                });
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSignedIn) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Gemini Chat Clone</h1>
                    <p className="mb-8">Please sign in to continue</p>
                    <button
                        onClick={signIn}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Sign In with Mock Account
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen overflow-hidden bg-[#343541] text-white">
            <Sidebar
                user={user}
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                onSignOut={signOut}
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
            />
            <main className="flex-1 flex flex-col relative">
                 <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="absolute top-4 left-4 z-20 p-2 rounded-md bg-gray-700/50 hover:bg-gray-600/70 md:hidden">
                    <MenuIcon className="h-6 w-6" />
                </button>
                <ChatWindow 
                    chat={activeChat}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                    onNewChat={handleNewChat}
                />
            </main>
        </div>
    );
};

export default App;
