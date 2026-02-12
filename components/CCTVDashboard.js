'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from './AppContext';
import { Camera, Plus, Trash2, Video, MapPin, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CCTVDashboard({ userLocation, onClose, onPickLocation, pickedLocation }) {
    const { t } = useApp();
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'add'
    const [userId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ncp_user_id') || 'anon';
        }
        return 'anon';
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        stream_url: '',
        lat: '',
        lng: ''
    });

    useEffect(() => {
        if (pickedLocation) {
            setFormData(prev => ({ ...prev, lat: pickedLocation.lat, lng: pickedLocation.lng }));
            setView('add'); // Ensure we are in add view if returning from pick
        }
    }, [pickedLocation]);

    useEffect(() => {
        fetchCameras();
    }, [userId]);

    const fetchCameras = async () => {
        if (!userId) return;
        setLoading(true);
        // RLS policy: owner_id check.
        // NOTE: Since the app uses a random local ID for 'userId', strict RLS 'auth.uid() = owner_id' queries might return nothing 
        // if we are not authenticated with Supabase Auth.
        // However, we can query by owner_id explicitly.
        const { data, error } = await supabase
            .from('public_cctv')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (data) setCameras(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.stream_url || !formData.lat || !formData.lng) {
            alert("Please fill all fields");
            return;
        }

        const { error } = await supabase.from('public_cctv').insert({
            owner_id: userId,
            name: formData.name,
            stream_url: formData.stream_url,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            is_active: false
        });

        if (error) {
            console.error(error);
            alert("Error saving camera: " + error.message);
        } else {
            setFormData({ name: '', stream_url: '', lat: '', lng: '' });
            setView('list');
            fetchCameras();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;

        const { error } = await supabase
            .from('public_cctv')
            .delete()
            .eq('id', id)
            .eq('owner_id', userId); // Extra safety

        if (!error) {
            setCameras(prev => prev.filter(c => c.id !== id));
        } else {
            alert("Delete failed");
        }
    };

    const toggleActive = async (id, currentState) => {
        // Optimistic update
        setCameras(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentState } : c));

        const { error } = await supabase
            .from('public_cctv')
            .update({ is_active: !currentState })
            .eq('id', id)
            .eq('owner_id', userId);

        if (error) {
            // Revert on error
            setCameras(prev => prev.map(c => c.id === id ? { ...c, is_active: currentState } : c));
            alert("Update failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto z-[2001]" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh] relative z-[2002]"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg text-blue-600 dark:text-blue-300">
                            <Video className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-lg dark:text-white">My Cameras</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    {view === 'list' ? (
                        <div className="space-y-4">
                            {cameras.length === 0 && !loading && (
                                <div className="text-center py-8 text-gray-500">
                                    <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No cameras added yet.</p>
                                    <p className="text-xs mt-1">Share your CCTV stream to help the community.</p>
                                </div>
                            )}

                            {cameras.map(cam => (
                                <div key={cam.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm dark:text-white">{cam.name}</h3>
                                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{cam.stream_url}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={cam.is_active}
                                                onChange={() => toggleActive(cam.id, cam.is_active)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                        <button
                                            onClick={() => handleDelete(cam.id)}
                                            className="text-gray-400 hover:text-red-500 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setView('add')}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Camera
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Camera Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Main Gate"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Stream / Embed URL</label>
                                <div className="text-[10px] text-gray-500 mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800">
                                    💡 Use <strong>RTSP.me</strong> to convert your RTSP link to a free web embed URL.
                                </div>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://rtsp.me/embed/..."
                                    value={formData.stream_url}
                                    onChange={e => setFormData({ ...formData, stream_url: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Lat"
                                            readOnly
                                            className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 text-xs"
                                            value={formData.lat}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Lng"
                                            readOnly
                                            className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 text-xs"
                                            value={formData.lng}
                                        />
                                    </div>
                                    <button
                                        onClick={onPickLocation}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg flex items-center justify-center transition"
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {view === 'add' && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                        <button
                            onClick={() => setView('list')}
                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 bg-ncp-green text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Camera
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
