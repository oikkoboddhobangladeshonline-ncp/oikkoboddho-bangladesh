'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from './AppContext';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, AlertTriangle, ShieldCheck } from 'lucide-react';

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

function ChatItem({ message, isOwn }) {
    const isMedia = !!message.media_url;
    // Strip support_ prefix if present
    const rawType = message.media_type ? message.media_type.replace('support_', '') : '';
    const isVideo = rawType === 'video';
    const isAudio = rawType === 'audio';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 px-4 py-3 ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${message.is_admin
                    ? 'bg-blue-500 text-white'
                    : isOwn ? 'bg-ncp-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                    {message.is_admin ? <ShieldCheck className="w-5 h-5" /> : message.username.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {message.is_admin ? 'NCP Admin' : (isOwn ? 'You' : message.username)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                        {formatDistanceToNow(new Date(message.created_at))} ago
                    </span>
                </div>

                <div className={`relative px-4 py-3 rounded-2xl shadow-sm border overflow-hidden ${isOwn
                    ? 'bg-ncp-green text-white border-transparent rounded-tr-none'
                    : message.is_admin
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-blue-100 dark:border-blue-800 rounded-tl-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-700 rounded-tl-none'
                    }`}>

                    {/* Media Content */}
                    {isMedia && (
                        <div className={`rounded-lg overflow-hidden ${isAudio ? 'w-64' : 'max-w-full mb-2 mt-1'}`}>
                            {isVideo ? (
                                <video src={message.media_url} controls className="w-full max-h-60 object-cover" />
                            ) : isAudio ? (
                                <div className="flex items-center gap-2 p-1">
                                    <audio src={message.media_url} controls className="h-8 w-full" />
                                </div>
                            ) : (
                                <img src={message.media_url} alt="Shared content" className="w-full max-h-60 object-cover" />
                            )}
                        </div>
                    )}

                    {/* Text Content */}
                    {message.content && (
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function ChatList({ type = 'nationwide' }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myLocation, setMyLocation] = useState(null);
    const bottomRef = useRef(null);
    const myUsername = typeof window !== 'undefined' ? localStorage.getItem('ncp_username') || 'Anonymous' : 'Anonymous';

    useEffect(() => {
        // Get Location for Filtering
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log(err)
            );
        }
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

                // Build Query
                let query = supabase
                    .from('public_chats')
                    .select('*')
                    .gt('created_at', oneDayAgo)
                    .order('created_at', { ascending: true });

                if (type === 'admin') {
                    query = query.eq('type', 'admin');
                } else if (type === 'support') {
                    // WORKAROUND: Use media_type to filter support messages since we couldn't add 'type' column
                    query = query.ilike('media_type', 'support%');
                } else {
                    // For nationwide/nearby, exclude support messages
                    // Ideally we exclude support messages from public feed.
                    query = query.not('media_type', 'ilike', 'support%').neq('type', 'admin'); // Safe fallback if type column exists or not
                }

                const { data, error } = await query;

                // Fallback for Admin if 'type' column error (if it doesn't exist)
                if (error && type === 'admin') {
                    const { data: retryData } = await supabase
                        .from('public_chats')
                        .select('*')
                        .gt('created_at', oneDayAgo)
                        .eq('is_admin', true)
                        .order('created_at', { ascending: true });
                    if (retryData) setMessages(retryData);
                } else if (data) {
                    setMessages(data);
                } else if (error) {
                    console.error('Chat fetch error:', error);
                    // Table might not exist - show empty state
                    setMessages([]);
                }
            } catch (err) {
                console.error('Chat initialization error:', err);
                setMessages([]);
            }

            setLoading(false);
            scrollToBottom();
        };

        fetchMessages();

        const channel = supabase
            .channel('public-chat-room')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_chats' }, (payload) => {
                const msg = payload.new;
                // Filter logic
                if (type === 'admin' && !msg.is_admin) return;

                // Support Filter
                const isSupport = msg.media_type && msg.media_type.startsWith('support');
                if (type === 'support' && !isSupport) return;
                if (type !== 'support' && isSupport) return; // Don't show support msgs in public

                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [type]);

    const scrollToBottom = () => {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Filter Messages
    const filteredMessages = messages.filter(msg => {
        if (type === 'nearby') {
            // Only show messages with location AND within 5km
            if (!msg.lat || !msg.lng || !myLocation) return false;
            const dist = getDistanceFromLatLonInKm(myLocation.lat, myLocation.lng, msg.lat, msg.lng);
            return dist < 50000; // 50000 km for testing (basically global), reduce to 5 or 10 for prod
        }
        return true;
    });

    if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ncp-green"></div></div>;

    return (
        <div className="flex-1 overflow-y-auto pb-4 pt-2 px-2">
            {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-sm">No messages nearby.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMessages.map(msg => (
                        <ChatItem
                            key={msg.id}
                            message={msg}
                            isOwn={myUsername !== 'Anonymous' && msg.username === myUsername ? true : (msg.user_id && msg.user_id === localStorage.getItem('ncp_user_id'))}
                        />
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
