'use client';

import { useState } from 'react';
import { useApp } from './AppContext';
import ChatList from './ChatList';
import ChatInput from './ChatInput';
import { motion } from 'framer-motion';
import { MessageCircle, ShieldAlert, X, Globe } from 'lucide-react';

export default function ChatHub({ onClose }) {
    const { t } = useApp();
    const [activeTab, setActiveTab] = useState('nearby'); // 'nearby' | 'global' | 'admin'

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header - Glassmorphic Pill Style (Consistent with History/Settings) */}
            <div className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-1 px-5 py-2.5 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md shadow-sm rounded-full pointer-events-auto border border-white/20 dark:border-white/10"
                >
                    <Globe className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100 pr-1">
                        {t.chat_hub_title || 'Public Chat'}
                    </span>
                </motion.div>
            </div>

            {/* Back Button (Mobile) */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute left-4 top-12 md:top-6 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[60] md:hidden"
            >
                <X className="w-6 h-6" />
            </motion.button>

            {/* Close Button (Desktop) */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute right-4 top-12 md:top-6 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[60] hidden md:block"
            >
                <X className="w-6 h-6" />
            </motion.button>

            {/* Content Container */}
            <div className="flex-1 flex flex-col pt-24 md:pt-20 pb-24 md:pb-0 max-w-2xl mx-auto w-full">
                {/* Tabs */}
                {/* Tabs */}
                <div className="px-4 mb-4">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto relative z-0">
                        <button
                            onClick={() => setActiveTab('nearby')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap z-10 ${activeTab === 'nearby'
                                ? 'text-ncp-green'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {activeTab === 'nearby' && (
                                <motion.div
                                    layoutId="activeChatTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-lg -z-10"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <MessageCircle className="w-4 h-4" />
                            {t.chat_tab_nearby || 'Nearby'}
                        </button>
                        <button
                            onClick={() => setActiveTab('nationwide')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap z-10 ${activeTab === 'nationwide'
                                ? 'text-indigo-500'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {activeTab === 'nationwide' && (
                                <motion.div
                                    layoutId="activeChatTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-lg -z-10"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <Globe className="w-4 h-4" />
                            {t.chat_tab_nationwide || 'Nationwide'}
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap z-10 ${activeTab === 'admin'
                                ? 'text-blue-500'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {activeTab === 'admin' && (
                                <motion.div
                                    layoutId="activeChatTab"
                                    className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-lg -z-10"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <ShieldAlert className="w-4 h-4" />
                            {t.chat_tab_admin || 'Official'}
                        </button>
                    </div>
                </div>

                {/* List */}
                <ChatList type={activeTab === 'nationwide' ? 'public' : activeTab} />

                {/* Input */}
                {(activeTab === 'nearby' || activeTab === 'nationwide' || activeTab === 'support') && (
                    <ChatInput type={activeTab === 'nationwide' ? 'public' : activeTab} onMessageSent={() => { }} />
                )}

                {/* Admin/Official Footer Action */}
                {activeTab === 'admin' && (
                    <div className="absolute bottom-6 left-0 right-0 px-4 z-50 pointer-events-none flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('support')}
                            className="pointer-events-auto bg-blue-100 dark:bg-blue-900/50 backdrop-blur-md text-blue-600 dark:text-blue-300 px-6 py-3 rounded-full font-bold shadow-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2"
                        >
                            <ShieldAlert className="w-5 h-5" />
                            <span>Report Bug / Support</span>
                        </motion.button>
                    </div>
                )}
            </div>
        </div>
    );
}
