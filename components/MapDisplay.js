'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/lib/supabase';
import { useApp } from './AppContext';
import { Send, Map as MapIcon, Globe, Navigation, Plus, Minus, Box } from 'lucide-react';

export default function MapDisplay({ onLocationUpdate, shareLocation, isPickingLocation, onMapClick }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isSatellite, setIsSatellite] = useState(false);
    const [is3D, setIs3D] = useState(true);

    // Marker refs to manage updates imperatively
    const userMarkerRef = useRef(null); // My marker
    const fellowMarkersRef = useRef({}); // { id: marker }
    const cctvMarkersRef = useRef({}); // { id: marker }
    const incidentMarkersRef = useRef({}); // { id: marker }

    const { t } = useApp();

    // 1. Initialize Map
    useEffect(() => {
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/bright', // Free 3D-ready style
            center: [90.4125, 23.8103], // Dhaka
            zoom: 15,
            pitch: 45, // Start with 3D tilt
            bearing: 0,
            antialias: true,
            attributionControl: false,
            dragRotate: true,
            touchPitch: true
        });

        map.current.on('load', () => {
            // 3D Buildings
            const layers = map.current.getStyle().layers;
            const labelLayerId = layers.find(
                (layer) => layer.type === 'symbol' && layer.layout['text-field']
            )?.id;

            if (!map.current.getLayer('3d-buildings')) {
                map.current.addLayer(
                    {
                        'id': '3d-buildings',
                        'source': 'openfreemap',
                        'source-layer': 'building',
                        'filter': ['!=', ['get', 'hide_3d'], true],
                        'type': 'fill-extrusion',
                        'minzoom': 13,
                        'paint': {
                            'fill-extrusion-color': '#aaa',
                            'fill-extrusion-height': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                13,
                                0,
                                13.05,
                                ['get', 'render_height']
                            ],
                            'fill-extrusion-base': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                13,
                                0,
                                13.05,
                                ['get', 'render_min_height']
                            ],
                            'fill-extrusion-opacity': 0.6
                        }
                    },
                    labelLayerId
                );
            }
        });

        // Click Handler (Picking Location)
        map.current.on('click', (e) => {
            if (isPickingLocation && onMapClick) {
                onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            }
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // Run once

    // 2. Toggle Satellite Logic (Robust)
    useEffect(() => {
        if (!map.current) return;

        const toggleLayer = () => {
            if (isSatellite) {
                // Check/Add Source
                if (!map.current.getSource('satellite-source')) {
                    map.current.addSource('satellite-source', {
                        'type': 'raster',
                        'tiles': ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        'tileSize': 256
                    });
                }

                // Check/Add Layer
                if (!map.current.getLayer('satellite-layer')) {
                    // Start looking for a good place to insert. 
                    // Ideally below 3d-buildings, or just at the bottom of the stack (above background).
                    // If we just add it without 'beforeId', it goes to top. 
                    // We want it below labels and buildings.
                    const beforeId = map.current.getLayer('3d-buildings') ? '3d-buildings' : undefined;

                    map.current.addLayer({
                        'id': 'satellite-layer',
                        'type': 'raster',
                        'source': 'satellite-source',
                        'paint': {
                            'raster-opacity': 1
                        }
                    }, beforeId);
                }
                map.current.setLayoutProperty('satellite-layer', 'visibility', 'visible');
            } else {
                if (map.current.getLayer('satellite-layer')) {
                    map.current.setLayoutProperty('satellite-layer', 'visibility', 'none');
                }
            }
        };

        if (map.current.isStyleLoaded()) {
            toggleLayer();
        } else {
            // If style loading, wait.
            map.current.once('load', toggleLayer);
        }
    }, [isSatellite]);

    // 3. Locate User & Update My Marker
    useEffect(() => {
        if (!map.current) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newLoc = { lat: latitude, lng: longitude };
                setUserLocation(newLoc);
                if (onLocationUpdate) onLocationUpdate(newLoc);

                // Create or Update Marker
                if (!userMarkerRef.current) {
                    const el = document.createElement('div');
                    updateUserMarkerStyle(el, shareLocation);

                    userMarkerRef.current = new maplibregl.Marker({ element: el })
                        .setLngLat([longitude, latitude])
                        .addTo(map.current);

                    // Initial fly
                    map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
                } else {
                    userMarkerRef.current.setLngLat([longitude, latitude]);
                    updateUserMarkerStyle(userMarkerRef.current.getElement(), shareLocation);
                }
            },
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [onLocationUpdate, shareLocation]);

    const updateUserMarkerStyle = (el, isSharing) => {
        // Green (Default) or Red (Sharing)
        const baseClass = "w-5 h-5 rounded-full border-2 border-white shadow-lg animate-pulse transition-colors duration-500";
        const colorClass = isSharing ? "bg-red-500 shadow-red-500/50" : "bg-green-500 shadow-green-500/50";
        el.className = `${baseClass} ${colorClass}`;
    };

    // 4. User cursor logic
    useEffect(() => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = isPickingLocation ? 'crosshair' : 'grab';
    }, [isPickingLocation]);

    // 5. Realtime: Fellow Users
    useEffect(() => {
        if (!shareLocation || !userLocation) return;

        const userId = localStorage.getItem('ncp_user_id') || Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ncp_user_id', userId);

        const channel = supabase.channel('users_tracking')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                const { new: newUser, old: oldUser, eventType } = payload;
                if (eventType === 'INSERT' || eventType === 'UPDATE') {
                    if (newUser.id === userId) return;
                    if (!fellowMarkersRef.current[newUser.id]) {
                        const el = document.createElement('div');
                        el.innerHTML = '🛡️';
                        el.className = 'text-2xl drop-shadow-md';
                        const marker = new maplibregl.Marker({ element: el })
                            .setLngLat([newUser.lng, newUser.lat])
                            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<div class="p-2 font-bold text-ncp-green">Volunteer Active</div>'))
                            .addTo(map.current);
                        fellowMarkersRef.current[newUser.id] = marker;
                    } else {
                        fellowMarkersRef.current[newUser.id].setLngLat([newUser.lng, newUser.lat]);
                    }
                } else if (eventType === 'DELETE') {
                    if (fellowMarkersRef.current[oldUser.id]) {
                        fellowMarkersRef.current[oldUser.id].remove();
                        delete fellowMarkersRef.current[oldUser.id];
                    }
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await supabase.from('users').upsert({ id: userId, lat: userLocation.lat, lng: userLocation.lng, last_seen: new Date() });
                }
            });

        const fetchUsers = async () => {
            const { data } = await supabase.from('users').select('*').gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());
            if (data) {
                data.forEach(u => {
                    if (u.id === userId || fellowMarkersRef.current[u.id]) return;
                    const el = document.createElement('div');
                    el.innerHTML = '🛡️';
                    el.className = 'text-2xl drop-shadow-md';
                    const marker = new maplibregl.Marker({ element: el })
                        .setLngLat([u.lng, u.lat])
                        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<div class="p-2 font-bold text-ncp-green">Volunteer Active</div>'))
                        .addTo(map.current);
                    fellowMarkersRef.current[u.id] = marker;
                });
            }
        };
        fetchUsers();

        const interval = setInterval(() => {
            supabase.from('users').upsert({ id: userId, lat: userLocation.lat, lng: userLocation.lng, last_seen: new Date() }).then(() => { });
        }, 10000);

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [shareLocation, userLocation]);

    // 6. Realtime: CCTV
    useEffect(() => {
        if (!map.current) return;
        const fetchCCTV = async () => {
            const { data } = await supabase.from('public_cctv').select('*').eq('is_active', true);
            if (data) data.forEach(addCCTVMarker);
        };
        fetchCCTV();
        const channel = supabase.channel('cctv_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'public_cctv' }, (payload) => {
                const cam = payload.new;
                const oldCam = payload.old;
                if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && !cam.is_active)) {
                    const id = oldCam ? oldCam.id : cam.id;
                    if (cctvMarkersRef.current[id]) { cctvMarkersRef.current[id].remove(); delete cctvMarkersRef.current[id]; }
                } else if (cam && cam.is_active) {
                    addCCTVMarker(cam);
                }
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const addCCTVMarker = (cam) => {
        if (cctvMarkersRef.current[cam.id]) { cctvMarkersRef.current[cam.id].setLngLat([cam.lng, cam.lat]); return; }
        const el = document.createElement('div');
        el.className = 'w-10 h-10 bg-contain bg-no-repeat bg-center cursor-pointer hover:scale-110 transition-transform drop-shadow-lg';
        el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/4049/4049900.png)';
        const popup = new maplibregl.Popup({ maxWidth: '300px', offset: 25 })
            .setHTML(`<div class="w-64"><div class="aspect-video bg-black rounded-lg overflow-hidden mb-2 relative"><iframe src="${cam.stream_url}" class="absolute inset-0 w-full h-full border-0" allowfullscreen></iframe></div><p class="text-xs font-bold text-center text-gray-800">${cam.name}</p></div>`);
        const marker = new maplibregl.Marker({ element: el }).setLngLat([cam.lng, cam.lat]).setPopup(popup).addTo(map.current);
        cctvMarkersRef.current[cam.id] = marker;
    };

    // 7. Realtime: Incidents
    useEffect(() => {
        if (!map.current) return;
        const fetchIncidents = async () => {
            const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(20);
            if (data) data.forEach(addIncidentMarker);
        };
        fetchIncidents();
        const channel = supabase.channel('incidents_map')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => addIncidentMarker(payload.new))
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const addIncidentMarker = (incident) => {
        if (incidentMarkersRef.current[incident.id]) return;
        const el = document.createElement('div');
        el.innerHTML = `<div style="background-color: #ef4444; border: 2px solid white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg></div>`;

        // --- Embed Logic Start ---
        let embedHtml = "";
        let videoLink = incident.video_link;

        if (!videoLink && incident.description) {
            const matches = incident.description.match(/(https?:\/\/[^\s]+)/g);
            if (matches) {
                const potentialLink = matches.find(l =>
                    l.includes('youtube.com') ||
                    l.includes('youtu.be') ||
                    l.includes('facebook.com') ||
                    l.includes('fb.watch')
                );
                if (potentialLink) videoLink = potentialLink;
            }
        }

        if (videoLink) {
            if (videoLink.includes('youtube.com') || videoLink.includes('youtu.be')) {
                let videoId = "";
                if (videoLink.includes('v=')) {
                    videoId = videoLink.split('v=')[1].split('&')[0];
                } else if (videoLink.includes('youtu.be/')) {
                    videoId = videoLink.split('youtu.be/')[1].split('?')[0];
                }
                if (videoId) {
                    embedHtml = `<div class="aspect-video mt-2 rounded bg-black overflow-hidden"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                }
            } else if (videoLink.includes('facebook.com') || videoLink.includes('fb.watch')) {
                // Using Facebook's valid plugin endpoint
                const encodedUrl = encodeURIComponent(videoLink);
                embedHtml = `<div class="mt-2 rounded bg-white border border-gray-200 overflow-hidden"><iframe src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=280" width="100%" height="auto" style="border:none;overflow:hidden;min-height:160px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe></div>`;
            }
        }
        // --- Embed Logic End ---

        const popup = new maplibregl.Popup({ offset: 25, maxWidth: "300px" }).setHTML(`
            <div class="p-2 space-y-1">
                <b class="text-red-500 font-bold flex items-center gap-1">Emergency</b>
                <p class="font-medium text-sm text-gray-800">${incident.type || 'Incident'}</p>
                <p class="text-xs text-gray-600">${incident.description || ''}</p>
                ${embedHtml}
            </div>
        `);
        const marker = new maplibregl.Marker({ element: el }).setLngLat([incident.lng, incident.lat]).setPopup(popup).addTo(map.current);
        incidentMarkersRef.current[incident.id] = marker;
    };

    // Quick Fix for Map Resizing
    useEffect(() => {
        if (!map.current) return;
        const resizeObserver = new ResizeObserver(() => map.current.resize());
        resizeObserver.observe(mapContainer.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Handlers for Custom Controls
    const handleZoomIn = () => map.current?.zoomIn();
    const handleZoomOut = () => map.current?.zoomOut();

    const toggle3D = () => {
        if (!map.current) return;
        const targetPitch = is3D ? 0 : 60;
        map.current.easeTo({ pitch: targetPitch, duration: 1000 });
        setIs3D(!is3D);
    };

    const handleLocate = () => {
        if (userLocation && map.current) {
            map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 18, pitch: 60 });
            setIs3D(true);
        }
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Custom Right-Center Controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[400]">
                {/* Satellite Toggle */}
                <button
                    onClick={() => setIsSatellite(!isSatellite)}
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition"
                    title="Toggle View"
                >
                    {isSatellite ? <MapIcon size={20} /> : <Globe size={20} />}
                </button>

                {/* Locate Me */}
                <button
                    onClick={handleLocate}
                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:bg-gray-50 transition"
                    title="Locate Me"
                >
                    <Navigation size={20} className="fill-current" />
                </button>

                {/* Zoom & 3D Control Group */}
                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-700 dark:text-gray-200"
                        title="Zoom In"
                    >
                        <Plus size={20} />
                    </button>

                    {/* 3D Button Nestled in Zoom Controls */}
                    <button
                        onClick={toggle3D}
                        className={`w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition ${is3D ? 'text-blue-500 bg-blue-50/50' : 'text-gray-500'}`}
                        title="Toggle 3D"
                    >
                        <Box size={18} strokeWidth={is3D ? 2.5 : 2} />
                    </button>

                    <button
                        onClick={handleZoomOut}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-700 dark:text-gray-200"
                        title="Zoom Out"
                    >
                        <Minus size={20} />
                    </button>
                </div>

                {/* Telegram Link */}
                <a
                    href="https://t.me/ncp_emergency_alerts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition shadow-blue-500/30"
                    title="Join Telegram Channel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telegram" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09" />
                    </svg>
                </a>
            </div>
        </div >
    );
}
