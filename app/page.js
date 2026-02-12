'use client';

import { useState, useEffect } from 'react';
import MapLoader from '@/components/MapLoader';
import ReportForm from '@/components/ReportForm';
import SettingsView from '@/components/SettingsView';
import ShareModal from '@/components/ShareModal';
import IncidentHistory from '@/components/IncidentHistory';
import { AlertTriangle, MapPin, Settings, Map as MapIcon, Clock, MessageCircle } from 'lucide-react';
import ChatHub from '@/components/ChatHub';
import CCTVDashboard from '@/components/CCTVDashboard';
import { AppProvider, useApp } from '@/components/AppContext';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import AnimatedIntro from '@/components/AnimatedIntro';
import { Cctv } from 'lucide-react';

function MainContent() {
    const { t } = useApp();
    const [userLocation, setUserLocation] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCCTVOpen, setIsCCTVOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareEnabled, setShareEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // CCTV Picking State
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedLocation, setPickedLocation] = useState(null);

    // 🧹 Clean up old data on fresh launch
    useEffect(() => {
        const FRESH_LAUNCH_DATE = '2026-02-12';
        const lastClear = localStorage.getItem('last_data_clear');

        if (!lastClear || lastClear < FRESH_LAUNCH_DATE) {
            // Clear all old app data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.startsWith('ncp_') ||
                    key.includes('username') ||
                    key.includes('user_id') ||
                    key.includes('incident') ||
                    key.includes('chat')
                )) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
            localStorage.setItem('last_data_clear', FRESH_LAUNCH_DATE);
            console.log('🧹 Old data cleared for fresh launch');
        }
    }, []);

    const handleTabChange = (tab) => {
        if (tab === 'map') {
            setIsSettingsOpen(false);
            setIsHistoryOpen(false);
            setIsChatOpen(false);
            setIsCCTVOpen(false);
        } else if (tab === 'history') {
            setIsSettingsOpen(false);
            setIsHistoryOpen(true);
            setIsChatOpen(false);
        } else if (tab === 'chat') {
            setIsSettingsOpen(false);
            setIsHistoryOpen(false);
            setIsChatOpen(true);
        } else if (tab === 'settings') {
            setIsHistoryOpen(false);
            setIsChatOpen(false);
            setIsCCTVOpen(false);
            setIsSettingsOpen(true);
        } else if (tab === 'cctv') {
            setIsSettingsOpen(false);
            setIsHistoryOpen(false);
            setIsChatOpen(false);
            setIsCCTVOpen(true);
        }
    };

    const handlePickLocation = () => {
        setIsCCTVOpen(false);
        setIsPickingLocation(true);
        // Show a temporary toast or instruction? 
        // For now relying on visual cursor change in MapDisplay
    };

    const handleMapClick = (latlng) => {
        if (isPickingLocation) {
            setPickedLocation(latlng);
            setIsPickingLocation(false);
            setIsCCTVOpen(true); // Re-open dashboard
        }
    };

    return (
        <LayoutGroup>
            <AnimatePresence>
                {isLoading && (
                    <AnimatedIntro onAnimationComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            <main className="relative h-[100dvh] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors">

                <div className="absolute inset-0 z-0">
                    <MapLoader
                        onLocationUpdate={setUserLocation}
                        shareLocation={shareEnabled}
                        isPickingLocation={isPickingLocation}
                        onMapClick={handleMapClick}
                    />
                </div>

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg rounded-full p-2 pl-3 pr-3 flex items-center justify-between pointer-events-auto border border-white/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-ncp-green rounded-full flex items-center justify-center overflow-hidden p-0.5 shadow-md">
                                <img src="/logo.png" alt="OB" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="font-bold text-ncp-green dark:text-green-400 text-sm leading-tight">{t.app_name}</h1>
                                <div className="flex items-center gap-1.5">
                                    <img src="/red-team-icon.svg" alt="Team" className="w-3 h-3" />
                                    <p className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider">{t.team_name}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${shareEnabled
                                ? 'bg-green-500 text-white shadow-green-500/30'
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            {shareEnabled ? (
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                            ) : (
                                <MapPin className="w-3 h-3" />
                            )}
                            {shareEnabled ? t.sharing_btn : t.share_btn}
                        </button>
                    </motion.div>
                </div>

                {/* SOS Button */}
                <div className="absolute bottom-28 left-0 right-0 z-10 flex flex-col items-center gap-3 pointer-events-none px-4">
                    <AnimatePresence>
                        {!isReportOpen && !isSettingsOpen && !isHistoryOpen && !isChatOpen && !isCCTVOpen && !isShareModalOpen && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur text-xs font-bold px-4 py-1.5 rounded-full shadow-lg text-gray-600 dark:text-gray-300 pointer-events-auto border border-gray-100 dark:border-gray-700"
                            >
                                {t.sos_helper}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsReportOpen(true)}
                        className="group pointer-events-auto relative flex items-center justify-center w-20 h-20 bg-transparent rounded-full shadow-xl shadow-red-500/40"
                    >
                        {!isLoading && (
                            <motion.div
                                layoutId="sos-button-bg"
                                className="absolute inset-0 bg-ncp-red rounded-full"
                            />
                        )}

                        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
                        <div className="flex flex-col items-center justify-center text-white z-10">
                            <AlertTriangle className="w-8 h-8 fill-current mb-0.5" />
                            <span className="text-[10px] font-black tracking-wide">{t.sos_btn}</span>
                        </div>
                    </motion.button>
                </div>

                {/* Navigation Dock */}
                {/* Premium Glass Dock */}
                <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-2xl rounded-[2rem] p-2 flex items-center gap-2 pointer-events-auto border border-white/20 ring-1 ring-black/5"
                    >
                        {[
                            { id: 'map', icon: MapIcon },
                            { id: 'history', icon: Clock },
                            { id: 'cctv', icon: Cctv },
                            { id: 'chat', icon: MessageCircle },
                            { id: 'settings', icon: Settings }
                        ].map((tab) => {
                            const isActive = (tab.id === 'map' && !isSettingsOpen && !isHistoryOpen && !isChatOpen && !isCCTVOpen) ||
                                (tab.id === 'history' && isHistoryOpen) ||
                                (tab.id === 'chat' && isChatOpen) ||
                                (tab.id === 'cctv' && isCCTVOpen) ||
                                (tab.id === 'settings' && isSettingsOpen);

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className="relative p-3.5 rounded-full transition-colors duration-300"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-tab"
                                            className="absolute inset-0 bg-ncp-green rounded-full shadow-lg shadow-green-500/30"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <tab.icon
                                        className={`relative z-10 w-6 h-6 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                        strokeWidth={2.5}
                                    />
                                </button>
                            );
                        })}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isHistoryOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-[50] bg-white dark:bg-gray-900"
                        >
                            <IncidentHistory onClose={() => handleTabChange('map')} />

                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTabChange('map')}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 ml-[-85px] bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black px-8 py-3 rounded-full text-sm font-bold shadow-2xl z-50 border border-white/10 dark:border-black/5 flex items-center gap-2"
                            >
                                <span>Close History</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-[50]"
                        >
                            <ChatHub onClose={() => handleTabChange('map')} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isCCTVOpen && (
                        <CCTVDashboard
                            userLocation={userLocation}
                            onClose={() => handleTabChange('map')}
                            onPickLocation={handlePickLocation}
                            pickedLocation={pickedLocation}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isSettingsOpen && <SettingsView onClose={() => setIsSettingsOpen(false)} />}
                </AnimatePresence>

                <AnimatePresence>
                    {isReportOpen && <ReportForm userLocation={userLocation} onClose={() => setIsReportOpen(false)} />}
                </AnimatePresence>

                <AnimatePresence>
                    {isShareModalOpen && (
                        <ShareModal
                            shareEnabled={shareEnabled}
                            setShareEnabled={setShareEnabled}
                            onClose={() => setIsShareModalOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </main>
        </LayoutGroup>
    );
}

export default function Home() {
    return (
        <AppProvider>
            <MainContent />
        </AppProvider>
    );
}
