"use client";

import { useState, useEffect } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    className?: string;
    placeholder?: string;
}

export function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognizer, setRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);

    const startListening = async () => {
        try {
            // Get token from our backend
            const response = await fetch("/api/speech/token");
            const data = await response.json();

            if (!data.token) throw new Error("Could not fetch speech token");

            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
                data.token,
                data.region
            );

            speechConfig.speechRecognitionLanguage = "en-US";

            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

            setRecognizer(newRecognizer);

            newRecognizer.recognizing = (s, e) => {
                // Real-time partial results if we wanted them
                // console.log(`RECOGNIZING: Text=${e.result.text}`);
            };

            newRecognizer.recognized = (s, e) => {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    onTranscript(e.result.text);
                }
            };

            newRecognizer.canceled = (s, e) => {
                console.error(`CANCELED: Reason=${e.reason}`);
                setIsListening(false);
            };

            newRecognizer.sessionStopped = (s, e) => {
                setIsListening(false);
                newRecognizer.stopContinuousRecognitionAsync();
            };

            await newRecognizer.startContinuousRecognitionAsync();
            setIsListening(true);
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setIsListening(false);
        }
    };

    const stopListening = async () => {
        if (recognizer) {
            await recognizer.stopContinuousRecognitionAsync();
            setIsListening(false);
            // setRecognizer(null); // Keep instance or nullify? Nullify to clean up.
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognizer) {
                recognizer.close();
            }
        };
    }, [recognizer]);

    return (
        <button
            onClick={toggleListening}
            type="button"
            className={`relative p-3 rounded-full transition-all ${isListening
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent"
                } ${className}`}
            title={isListening ? "Stop Recording" : "Start Recording"}
        >
            {/* Pulse Animation when listening */}
            <AnimatePresence>
                {isListening && (
                    <motion.span
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-red-400"
                    />
                )}
            </AnimatePresence>

            {/* Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
            >
                {isListening ? (
                    // Stop Square/Mic Off
                    <path d="M9 9h6v6H9z" />
                ) : (
                    // Mic Icon
                    <>
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                    </>
                )}
            </svg>
        </button>
    );
}
