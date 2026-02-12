'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from './AppContext';
import { MapPin, Calendar, Clock, ArrowLeft, X } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function IncidentHistory({ onClose }) {
    const { t } = useApp();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hidden, setHidden] = useState(false);

    // Scroll handling for hiding header
    const containerRef = useRef(null);
    const { scrollY } = useScroll({ container: containerRef });
    const lastYRef = useRef(0);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const diff = latest - lastYRef.current;
        if (Math.abs(diff) > 20) { // Increased threshold slightly
            setHidden(diff > 0 && latest > 50);
            lastYRef.current = latest;
        }
    });

    useEffect(() => {
    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) console.error('Error fetching history:', error);
            if (data) setHistory(data);
            setLoading(false);
        };

        fetchHistory();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('reports_history')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
                setHistory(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    return (
        <div ref={containerRef} className="h-full bg-gray-50 dark:bg-black overflow-y-auto pb-24 md:pb-10 md:pt-10 scrollbar-hide relative">
            {/* Desktop: Close Button outside (Functional now) */}
            <div className="hidden md:flex absolute top-6 right-6 z-50 fixed">
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-full bg-gray-100 dark:bg-gray-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Floating Header with Scroll Effect */}
            {/* Floating Header with Scroll Effect */}
            <motion.div
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: -100, opacity: 0 }
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-0 left-0 right-0 z-40 p-4 pt-12 md:pt-6 flex justify-center pointer-events-none"
            >
                <div className="bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-full px-6 py-2 border border-white/20 shadow-sm flex items-center gap-2 pointer-events-auto">
                    <Clock className="w-5 h-5 text-ncp-green" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Activity Log</span>
                </div>

                {/* Mobile Back Button (Absolute Right) */}
                <button
                    onClick={onClose}
                    className="md:hidden absolute right-4 top-12 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </motion.div>

            <div className="p-4 space-y-4 md:max-w-xl md:mx-auto md:space-y-0 pt-36 md:pt-24">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-ncp-green border-t-transparent rounded-full"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No activity yet.</p>
                    </div>
                ) : (
                    history.map((incident, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={incident.id}
                            className="bg-transparent md:border-b md:border-gray-100 dark:md:border-gray-800 md:pb-6 md:pt-4 rounded-xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 dark:border-gray-800 md:border-0 md:border-b overflow-hidden md:overflow-visible bg-white dark:bg-gray-900 md:bg-transparent dark:md:bg-transparent"
                        >
                            {/* Mobile Card Style / Desktop Threads Style */}
                            <div className="p-4 md:p-0 flex gap-4">
                                {/* Desktop: Left Timeline Line/Avatar */}
                                <div className="hidden md:flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        🚨
                                    </div>
                                    <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 my-2 rounded-full opacity-50"></div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                {incident.reporter_info ? incident.reporter_info.split(' ')[0] : 'Anonymous'}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500 text-xs">
                                                {incident.created_at ? formatDistanceToNow(new Date(incident.created_at)) : 'Unknown'}
                                            </span>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            <MapPin className="w-4 h-4" />
                                        </a>
                                    </div>

                                    <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed mb-3">
                                        {incident.description}
                                    </p>

                                    {incident.image_url && (
                                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                                            {incident.image_url.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? (
                                                <video
                                                    src={incident.image_url}
                                                    controls
                                                    className="w-full max-h-[400px] object-cover bg-black"
                                                />
                                            ) : (
                                                <img
                                                    src={incident.image_url}
                                                    alt="Evidence"
                                                    className="w-full max-h-[400px] object-cover bg-gray-100 dark:bg-gray-900"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Threads Actions (Visual only for now) */}
                                    {/* <div className="flex gap-4 mt-3 text-gray-400">
                                        <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
                                        <MessageCircle className="w-5 h-5 hover:text-blue-500 cursor-pointer transition-colors" />
                                        <Send className="w-5 h-5 hover:text-green-500 cursor-pointer transition-colors" />
                                     </div> */}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
