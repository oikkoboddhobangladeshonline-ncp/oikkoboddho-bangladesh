'use client';

import { useApp } from './AppContext';
import { Moon, Sun, Globe, Bell, Download, Map as MapIcon, ChevronRight, X, Phone, Plus, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState, useRef } from 'react';

export default function SettingsView({ onClose }) {
    const {
        language, toggleLanguage,
        darkMode, toggleDarkMode,
        notificationsEnabled, toggleNotifications,
        satelliteView, toggleSatellite,
        installPrompt, promptInstall,
        emergencyContacts, addEmergencyContact, removeEmergencyContact,
        t
    } = useApp();

    const [newContact, setNewContact] = useState('');
    const [hidden, setHidden] = useState(false);

    // Scroll handling
    const containerRef = useRef(null);
    const { scrollY } = useScroll({ container: containerRef });
    const lastYRef = useRef(0);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const diff = latest - lastYRef.current;
        if (Math.abs(diff) > 20) {
            setHidden(diff > 0 && latest > 50);
            lastYRef.current = latest;
        }
    });

    const handleAddContact = (e) => {
        e.preventDefault();
        if (newContact.trim()) {
            addEmergencyContact(newContact.trim());
            setNewContact('');
        }
    };

    const SettingItem = ({ icon: Icon, label, value, onClick, type = 'toggle' }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700/50 last:border-0 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-ncp-green dark:text-green-400">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
            </div>

            {type === 'toggle' && (
                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-spring ${value ? 'bg-ncp-green' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <motion.div
                        className="bg-white w-5 h-5 rounded-full shadow-sm"
                        animate={{ x: value ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </div>
            )}

            {type === 'action' && (
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm font-medium">{value}</span>
                    <ChevronRight className="w-4 h-4" />
                </div>
            )}
        </button>
    );

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[9999] bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-xl pt-40 pb-24 overflow-y-auto scrollbar-hide"
        >
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
                    <Settings className="w-5 h-5 text-ncp-green" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{t.settings_title}</span>
                </div>

                {/* Close Button (Absolute Right) */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-12 md:top-6 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full"
                >
                    <X className="w-6 h-6" />
                </button>
            </motion.div>

            <div className="space-y-6 px-5 max-w-lg mx-auto pt-36 md:pt-0">
                {/* Install App */}
                <section>
                    <div className="rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-800 p-6 flex flex-col items-center text-center border border-gray-100 dark:border-gray-800">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-ncp-green dark:text-green-400 mb-4">
                            <Download className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.install_app}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t.install_desc}</p>

                        <button
                            onClick={promptInstall}
                            disabled={!installPrompt}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all transform active:scale-95 ${installPrompt
                                ? 'bg-ncp-green hover:bg-green-700 text-white shadow-lg shadow-green-500/20'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {installPrompt ? t.install_app : t.installed}
                        </button>
                    </div>
                </section>
                {/* Emergency Contacts */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{t.emergency_contacts}</h2>
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                        <form onSubmit={handleAddContact} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newContact}
                                onChange={(e) => setNewContact(e.target.value)}
                                placeholder={t.contact_placeholder}
                                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-ncp-green outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!newContact}
                                className="bg-ncp-green disabled:opacity-50 text-white p-2.5 rounded-xl"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>

                        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            ℹ️ Contacts must start <b>@ncp_emergency_alert_bot</b> to get their ID.
                        </div>

                        <div className="space-y-2">
                            <AnimatePresence>
                                {emergencyContacts.length === 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-sm text-gray-400 py-2"
                                    >
                                        {t.no_contacts}
                                    </motion.p>
                                )}
                                {emergencyContacts.map((contact, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span className="font-mono text-gray-700 dark:text-gray-300">{contact}</span>
                                        </div>
                                        <button
                                            onClick={() => removeEmergencyContact(index)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 rounded-full transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* General Settings */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{t.general}</h2>
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                        <SettingItem
                            icon={Globe}
                            label={t.language}
                            value={language === 'en' ? 'English' : 'বাংলা'}
                            onClick={toggleLanguage}
                            type="action"
                        />
                        <SettingItem
                            icon={darkMode ? Moon : Sun}
                            label={t.dark_mode}
                            value={darkMode}
                            onClick={toggleDarkMode}
                        />
                    </div>
                </section>

                {/* Map & Notifications */}
                <section>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{t.notifications}</h2>
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                        <SettingItem
                            icon={Bell}
                            label={t.nearby_alert}
                            value={notificationsEnabled}
                            onClick={toggleNotifications}
                        />
                    </div>
                </section>


            </div>
        </motion.div>
    );
}
