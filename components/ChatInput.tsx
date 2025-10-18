import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendIcon, MicrophoneIcon } from './Icons';

// FIX: Define a minimal interface for SpeechRecognition to satisfy TypeScript,
// as this is a non-standard browser API not included in default typings.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onend: () => void;
    onerror: (event: any) => void;
    abort: () => void;
    start: () => void;
    stop: () => void;
}

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access non-standard properties, and rename the variable
// to `SpeechRecognitionAPI` to avoid shadowing the `SpeechRecognition` type interface.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // FIX: Use the defined `SpeechRecognition` interface for the ref type.
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messageBeforeRecording = useRef<string>('');

    // Initialize SpeechRecognition
    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }

        // FIX: Use the renamed constructor `SpeechRecognitionAPI`.
        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
             const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            const separator = messageBeforeRecording.current.trim() === '' ? '' : ' ';
            setMessage(messageBeforeRecording.current + separator + transcript);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
             if (event.error === 'not-allowed') {
                alert('Microphone access was denied. Please allow microphone access in your browser settings to use this feature.');
            }
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        
        return () => {
            recognitionRef.current?.abort();
        };
    }, []);


    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
            textarea.scrollTop = textarea.scrollHeight;
        }
    }, [message]);

    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        const messageToSend = message.trim();
        if (messageToSend && !isLoading) {
            if (isRecording) {
                 recognitionRef.current?.stop();
            }
            onSendMessage(messageToSend);
            setMessage('');
        }
    };
    
    const handleMicClick = () => {
        if (isLoading) return;
        
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            messageBeforeRecording.current = message;
            recognitionRef.current?.start();
        }
        setIsRecording(!isRecording);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex items-end w-full p-3 pr-24 rounded-lg bg-[#40414f] shadow-lg"
        >
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Gemini..."
                rows={1}
                className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none max-h-48"
                disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                {isSpeechRecognitionSupported && (
                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`p-2 rounded-md transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-transparent text-gray-400 hover:text-white'}`}
                        disabled={isLoading}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                )}
                <button
                    type="submit"
                    className="p-2 rounded-md bg-green-500 disabled:bg-gray-500 text-white transition-colors"
                    disabled={isLoading || !message.trim()}
                    aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
