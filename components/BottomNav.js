'use client';

import { Map, Bell, Settings } from 'lucide-react';
import { useApp } from './AppContext';

export default function BottomNav({ activeTab, onTabChange }) {
    const { t } = useApp();

    const tabs = [
        { id: 'map', icon: Map, label: t.tab_map },
        // { id: 'alerts', icon: Bell, label: t.tab_alerts }, // Can add later
        { id: 'settings', icon: Settings, label: t.tab_settings },
    ];

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 shadow-lg z-50 flex justify-around items-center h-16">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                            isActive 
                                ? 'text-ncp-green dark:text-green-400' 
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
