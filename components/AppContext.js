'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Load state from localStorage if available
    const [language, setLanguage] = useState('en');
    const [darkMode, setDarkMode] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [satelliteView, setSatelliteView] = useState(false);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [emergencyContacts, setEmergencyContacts] = useState([]);

    useEffect(() => {
        // Initial load
        const storedLang = localStorage.getItem('ncp_lang');
        const storedTheme = localStorage.getItem('ncp_theme');
        const storedNotif = localStorage.getItem('ncp_notif');
        const storedSat = localStorage.getItem('ncp_sat');
        const storedContacts = localStorage.getItem('ncp_contacts');

        if (storedLang) setLanguage(storedLang);
        if (storedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
        if (storedNotif !== null) setNotificationsEnabled(JSON.parse(storedNotif));
        if (storedSat !== null) setSatelliteView(JSON.parse(storedSat));
        if (storedContacts) setEmergencyContacts(JSON.parse(storedContacts));

        // PWA Install Prompt Listener
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => console.log('SW registered:', registration))
                .catch((error) => console.log('SW registration failed:', error));
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'bn' : 'en';
        setLanguage(newLang);
        localStorage.setItem('ncp_lang', newLang);
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('ncp_theme', newMode ? 'dark' : 'light');
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleNotifications = () => {
        const newVal = !notificationsEnabled;
        setNotificationsEnabled(newVal);
        localStorage.setItem('ncp_notif', JSON.stringify(newVal));

        if (newVal && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    };

    const toggleSatellite = () => {
        const newVal = !satelliteView;
        setSatelliteView(newVal);
        localStorage.setItem('ncp_sat', JSON.stringify(newVal));
    };

    const addEmergencyContact = (number) => {
        const newContacts = [...emergencyContacts, number];
        setEmergencyContacts(newContacts);
        localStorage.setItem('ncp_contacts', JSON.stringify(newContacts));
    };

    const removeEmergencyContact = (index) => {
        const newContacts = emergencyContacts.filter((_, i) => i !== index);
        setEmergencyContacts(newContacts);
        localStorage.setItem('ncp_contacts', JSON.stringify(newContacts));
    };

    const promptInstall = () => {
        if (installPrompt) {
            installPrompt.prompt();
            installPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    setInstallPrompt(null);
                }
            });
        }
    };

    const t = translations[language];

    return (
        <AppContext.Provider value={{
            language,
            setLanguage,
            toggleLanguage,
            darkMode,
            toggleDarkMode,
            notificationsEnabled,
            toggleNotifications,
            satelliteView,
            toggleSatellite,
            installPrompt,
            promptInstall,
            emergencyContacts,
            addEmergencyContact,
            removeEmergencyContact,
            t
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
