'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Image as ImageIcon, X, Loader2, Mic, ArrowUp } from 'lucide-react';
import { useApp } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ type = 'global', onMessageSent }) {
    const { t } = useApp();
    const [message, setMessage] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    // Audio Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], "voice-message.webm", { type: 'audio/webm' });
                setMediaFile(file);
                setMediaPreview(URL.createObjectURL(blob)); // Preview URL
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Microphone access is required for voice messages.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setMediaFile(null);
        setMediaPreview(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMediaFile(file);
        const objectUrl = URL.createObjectURL(file);
        setMediaPreview(objectUrl);
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!message.trim() && !mediaFile) || isSending) return;

        setIsSending(true);

        try {
            let mediaUrl = null;
            let mediaType = null;
            let lat = null;
            let lng = null;

            // 1. Get Location only if "Nearby"
            if (type === 'nearby') {
                if ("geolocation" in navigator) {
                    try {
                        const position = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject);
                        });
                        lat = position.coords.latitude;
                        lng = position.coords.longitude;
                    } catch (err) {
                        console.warn("Location denied for nearby chat");
                        // Proceed but maybe alert user? For now just send as global fallback or null
                    }
                }
            }

            // 2. Upload Media if present
            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('chat-media')
                    .upload(fileName, mediaFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chat-media')
                    .getPublicUrl(fileName);

                mediaUrl = publicUrl;
                mediaType = mediaFile.type.startsWith('audio/') ? 'audio' :
                    mediaFile.type.startsWith('image/') ? 'image' : 'video';
            }

            // WORKAROUND: Encode 'support' type into media_type
            if (type === 'support') {
                mediaType = mediaType ? `support_${mediaType}` : 'support_text';
            }

            // 3. Insert Message
            const userId = localStorage.getItem('ncp_user_id');
            const { error: insertError } = await supabase
                .from('public_chats')
                .insert({
                    content: message.trim(),
                    media_url: mediaUrl,
                    media_type: mediaType,
                    username: localStorage.getItem('ncp_username') || 'Anonymous',
                    user_id: userId,
                    lat: lat,
                    lng: lng,
                    // type: type // Removed to prevent error if column missing
                });

            if (insertError) throw insertError;

            // 4. Cleanup
            setMessage('');
            clearMedia();
            if (onMessageSent) onMessageSent();

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none z-[60]">
            {/* Dynamic Island / Dock Container */}
            <motion.div
                layout
                className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl shadow-2xl rounded-[2rem] border border-white/20 ring-1 ring-black/5 mx-auto max-w-lg pointer-events-auto overflow-hidden relative"
            >
                {/* Media Preview Overlay */}
                <AnimatePresence>
                    {mediaPreview && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-2 pt-2"
                        >
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 max-h-32 flex items-center justify-center">
                                {mediaFile?.type.startsWith('audio/') ? (
                                    <div className="p-4 flex items-center gap-2 text-ncp-green font-bold">
                                        <span>🎤 Voice Message Ready</span>
                                    </div>
                                ) : (
                                    <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
                                )}

                                <button
                                    onClick={clearMedia}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 backdrop-blur-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording UI Overlay */}
                {isRecording ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-mono text-red-500 font-bold">{formatTime(recordingTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={cancelRecording} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase">Cancel</button>
                            <button onClick={stopRecording} className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg shadow-red-500/30">Done</button>
                        </div>
                    </div>
                ) : (
                    /* Standard Input Bar */
                    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2">
                        {/* Attachment Button */}
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ImageIcon className="w-6 h-6" />
                        </motion.button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*,video/*" // Voice is handled by Mic button
                            className="hidden"
                        />

                        {/* Text Input */}
                        <div className="flex-1 py-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={type === 'nearby' ? "Message nearby..." : "Broadcast message..."}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none p-0 text-[16px] text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                                disabled={isSending}
                            />
                        </div>

                        {/* Mic / Send Button */}
                        <div className="flex gap-1">
                            {(!message.trim() && !mediaFile) ? (
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={startRecording}
                                    className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <Mic className="w-6 h-6" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="submit"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={isSending}
                                    className="p-3 bg-ncp-green text-white rounded-full shadow-lg shadow-green-500/20"
                                >
                                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowUp className="w-6 h-6" />}
                                </motion.button>
                            )}
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
