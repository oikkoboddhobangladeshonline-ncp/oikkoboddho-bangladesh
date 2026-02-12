'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// Constants moved to server-side API route
import { Camera, Send, X, Loader2, MapPin } from 'lucide-react';
import { useApp } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportForm({ userLocation, onClose }) {
  const { t, emergencyContacts } = useApp();
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [reporterInfo, setReporterInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const [videoLink, setVideoLink] = useState('');
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    if (videoLink.includes('facebook.com') || videoLink.includes('fb.watch')) {
      setPlatform('facebook');
    } else if (videoLink.includes('youtube.com') || videoLink.includes('youtu.be')) {
      setPlatform('youtube');
    } else {
      setPlatform(null);
    }
  }, [videoLink]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      alert(t.detecting);
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      let image_url = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('evidence').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(fileName);
        image_url = publicUrl;
      }

      const incidentDataForDB = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        description: videoLink ? `${description}\n\nVideo: ${videoLink}` : description,
        image_url,
        // video_link column might not exist, so we append to description for DB
        reporter_info: reporterInfo || 'Anonymous',
        status: 'open'
      };

      // Use 'reports' table as it is the one consumed by MapDisplay
      const { error: dbError } = await supabase.from('reports').insert([incidentDataForDB]);
      if (dbError) throw dbError;

      // Call Server-Side API for Notifications
      try {
        const response = await fetch('/api/send-incident', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...incidentDataForDB,
            description, // Send original description to API
            video_link: videoLink, // Send explicit video link to API
            emergencyContacts
          })
        });

        if (!response.ok) {
          console.warn('Notification API returned non-OK status:', response.status);
        }
      } catch (notifyError) {
        console.error("Notification failed but report saved:", notifyError);
        // Don't throw - report is already saved to database
      }

      setStatus('success');
      setDescription('');
      setFile(null);
      setReporterInfo('');

      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="relative z-50 bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl p-6 shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-ncp-green dark:text-green-400 flex items-center gap-2">
            <span className="w-2 h-6 bg-ncp-red rounded-full"></span>
            {t.report_title}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.success_title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{t.success_msg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {userLocation ?
                `${t.location_detected}: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}` :
                t.detecting}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.desc_label}</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-ncp-green outline-none h-24 resize-none transition-all"
                placeholder={t.desc_placeholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video/Post Link (Optional)</label>
              <div className="relative">
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-ncp-green outline-none transition-all"
                  placeholder="Paste Facebook or YouTube link..."
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {platform === 'facebook' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-blue-600" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                    </svg>
                  ) : platform === 'youtube' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-red-600" viewBox="0 0 16 16">
                      <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded-full" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.media_label}</label>
              <label className="flex items-center gap-3 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file ? file.name : t.tap_upload}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.optional}</p>
                </div>
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.info_label}</label>
              <input
                type="text"
                value={reporterInfo}
                onChange={(e) => setReporterInfo(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-ncp-green outline-none transition-all"
                placeholder={t.info_placeholder}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !userLocation}
              className="w-full bg-ncp-red hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.submit_btn}
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
