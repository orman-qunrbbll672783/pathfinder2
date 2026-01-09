"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VoiceInput } from "./VoiceInput";

interface StreamingTextProps {
    text: string;
    className?: string;
    speed?: number; // milliseconds per character
    onComplete?: () => void;
}

export function StreamingText({
    text,
    className = "",
    speed = 20,
    onComplete,
}: StreamingTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (currentIndex === text.length && onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    // Reset when text changes
    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
    }, [text]);

    return (
        <div className={className}>
            {displayedText}
            {currentIndex < text.length && (
                <motion.span
                    className="inline-block w-1 h-4 ml-1 bg-blue-500"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}
        </div>
    );
}

interface AIMessageProps {
    content: string;
    isStreaming?: boolean;
    className?: string;
}

export function AIMessage({
    content,
    isStreaming = false,
    className = "",
}: AIMessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${className}`}
        >
            {/* AI Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                </svg>
            </div>

            {/* Message Content */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                {isStreaming ? (
                    <StreamingText
                        text={content}
                        className="text-gray-800 leading-relaxed prose prose-sm max-w-none"
                    />
                ) : (
                    <div className="text-gray-800 leading-relaxed prose prose-sm max-w-none whitespace-pre-wrap">
                        {content}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface StreamingChatPanelProps {
    title?: string;
    streamGenerator?: AsyncGenerator<string>;
    onStreamComplete?: (fullText: string) => void;
    deploymentId?: string;
    systemPrompt?: string;
    initialMessage?: string;
    className?: string;
}

export function StreamingChatPanel({
    title = "AI Explanation",
    streamGenerator,
    onStreamComplete,
    deploymentId,
    systemPrompt,
    initialMessage,
    className = "",
}: StreamingChatPanelProps) {
    // Mode: "stream" (single generation) or "chat" (interactive)
    const mode = streamGenerator ? "stream" : "chat";

    const [content, setContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [inputValue, setInputValue] = useState("");

    // Initialize chat with initial message if provided
    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            setMessages([{ role: 'assistant', content: initialMessage }]);
        }
    }, [initialMessage]);

    // Handle single stream generator
    useEffect(() => {
        if (!streamGenerator) return;

        setIsStreaming(true);
        setContent("");

        (async () => {
            try {
                for await (const chunk of streamGenerator) {
                    setContent((prev) => prev + chunk);
                }
                setIsStreaming(false);
                if (onStreamComplete) {
                    onStreamComplete(content);
                }
            } catch (error) {
                console.error("Streaming error:", error);
                setIsStreaming(false);
            }
        })();
    }, [streamGenerator]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Add user message
        const newMessages = [...messages, { role: 'user' as const, content: inputValue }];
        setMessages(newMessages);
        setInputValue("");
        setIsStreaming(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    systemPrompt
                }),
            });

            if (!res.ok) throw new Error("API request failed");

            const data = await res.json();
            const responseText = data.message;
            setMessages([...newMessages, { role: 'assistant', content: responseText }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI. Please try again." }]);
        } finally {
            setIsStreaming(false);
        }
    };

    if (mode === "stream") {
        if (!content && !isStreaming) {
            return null;
        }

        return (
            <div className={`space-y-4 ${className}`}>
                {title && (
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}

                <AIMessage content={content} isStreaming={isStreaming} />

                {isStreaming && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span>AI is thinking...</span>
                    </div>
                )}
            </div>
        );
    }

    // Chat Interface
    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' ? (
                            <AIMessage content={msg.content} />
                        ) : (
                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        )}
                    </div>
                ))}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 ml-2">
                        <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span>AI is thinking...</span>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <VoiceInput onTranscript={(text) => setInputValue((prev) => (prev ? prev + " " + text : text))} />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask a question or use voice..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isStreaming}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Collapsible AI Explanation Panel
interface ExplanationPanelProps {
    title: string;
    streamGenerator?: AsyncGenerator<string>;
    defaultOpen?: boolean;
    className?: string;
}

export function ExplanationPanel({
    title,
    streamGenerator,
    defaultOpen = false,
    className = "",
}: ExplanationPanelProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [content, setContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (!streamGenerator || !isOpen) return;

        setIsStreaming(true);
        setContent("");

        (async () => {
            try {
                for await (const chunk of streamGenerator) {
                    setContent((prev) => prev + chunk);
                }
                setIsStreaming(false);
            } catch (error) {
                console.error("Streaming error:", error);
                setIsStreaming(false);
            }
        })();
    }, [streamGenerator, isOpen]);

    return (
        <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                    <span className="font-medium text-gray-900">{title}</span>
                </div>
                <motion.svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </motion.svg>
            </button>

            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="p-4 bg-white">
                    {content || isStreaming ? (
                        <AIMessage content={content} isStreaming={isStreaming} />
                    ) : (
                        <p className="text-gray-500 text-sm">Click to load explanation...</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
