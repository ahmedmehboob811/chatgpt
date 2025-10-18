
import React, { Fragment } from 'react';
import { Chat } from '../types';
import { PlusIcon, ChatBubbleIcon, TrashIcon, SignOutIcon, CloseIcon } from './Icons';

interface SidebarProps {
    user: { name: string; email: string; image: string } | null;
    chats: Chat[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    onSignOut: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    user,
    chats,
    activeChatId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onSignOut,
    isOpen,
    setIsOpen
}) => {
    return (
        <>
            <div className={`fixed inset-0 bg-black/30 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            <aside className={`absolute md:relative flex flex-col w-64 bg-black/90 text-white h-full transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
                <div className="p-2">
                    <button
                        onClick={onNewChat}
                        className="flex items-center w-full p-3 rounded-md text-sm hover:bg-gray-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4 mr-3" />
                        New Chat
                    </button>
                    <button className="absolute right-2 top-2 p-2 md:hidden" onClick={() => setIsOpen(false)}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="p-2 space-y-1">
                        {chats.map(chat => (
                            <div key={chat.id} className={`group relative flex items-center w-full p-3 rounded-md text-sm cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                                <button onClick={() => onSelectChat(chat.id)} className="flex items-center flex-1 truncate">
                                    <ChatBubbleIcon className="w-4 h-4 mr-3" />
                                    <span className="truncate">{chat.title}</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                    className="absolute right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="p-2 border-t border-gray-700">
                    {user && (
                        <div className="group relative flex items-center w-full p-3 rounded-md text-sm hover:bg-gray-800 transition-colors">
                            <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full mr-3" />
                            <span className="truncate flex-1">{user.name}</span>
                            <button onClick={onSignOut} className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">
                                <SignOutIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
