'use client';

import { useApp } from './AppContext';
import { motion } from 'framer-motion';
import { X, MapPin, Share2, ExternalLink } from 'lucide-react';

export default function ShareModal({ onClose, shareEnabled, setShareEnabled }) {
    const { t } = useApp();

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-50 bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl p-6 shadow-2xl pointer-events-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-ncp-green" />
                        {t.share_modal_title}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Red Team Tracking */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800/50">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <img src="/red-team-icon.svg" className="w-5 h-5" alt="Red Team" />
                                <h3 className="font-bold text-ncp-green dark:text-green-400">{t.share_team_title}</h3>
                            </div>
                            <button
                                onClick={() => setShareEnabled(!shareEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${shareEnabled ? 'bg-ncp-green' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${shareEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t.share_team_desc}</p>
                        <p className={`text-xs font-bold ${shareEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                            {shareEnabled ? t.share_toggle_on : t.share_toggle_off}
                        </p>
                    </div>

                    {/* Google Maps Sharing */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">{t.share_google_title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t.share_google_desc}</p>

                        <div className="space-y-2 mb-5">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                {t.step_1}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                {t.step_2}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                {t.step_3}
                            </div>
                        </div>

                        <a
                            href="https://www.google.com/maps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {t.open_maps}
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
