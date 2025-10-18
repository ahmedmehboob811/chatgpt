
import React from 'react';
import { Message, Role } from '../types';
import { UserIcon, GeminiLogo } from './Icons';
import { Remarkable } from 'remarkable';

const md = new Remarkable({
    html: false,
    breaks: true,
    linkify: true,
});

interface ChatMessageProps {
    message: Message;
    isStreaming: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
    const isModel = message.role === Role.MODEL;
    const bgColor = isModel ? 'bg-[#444654]' : 'bg-transparent';
    const Icon = isModel ? GeminiLogo : UserIcon;

    const renderContent = (content: string) => {
        const htmlContent = md.render(content);
        return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    return (
        <div className={`p-4 ${bgColor} border-b border-gray-600/50`}>
            <div className="flex w-full max-w-3xl mx-auto">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bg-gray-600 mr-4">
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-white space-y-4">
                        {renderContent(message.content)}
                        {isStreaming && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
