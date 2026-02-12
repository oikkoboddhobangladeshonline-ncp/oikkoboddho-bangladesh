'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AnimatedIntro({ onAnimationComplete }) {
    // Stage: 'hold' -> 'push' -> 'morph' & 'reveal'
    const [stage, setStage] = useState('hold');

    useEffect(() => {
        // Timeline
        const pushTimer = setTimeout(() => setStage('push'), 500); // 500ms Wait before push
        const morphTimer = setTimeout(() => setStage('reveal'), 2000); // Wait for push duration + hold
        const doneTimer = setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
        }, 3200); // Allow reveal to start and morph to fly

        return () => {
            clearTimeout(pushTimer);
            clearTimeout(morphTimer);
            clearTimeout(doneTimer);
        };
    }, [onAnimationComplete]);

    return (
        <div className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center">

            {/* Green Background with Hole Reveal */}
            <motion.div
                className="absolute inset-0 bg-ncp-green"
                initial={{
                    WebkitMaskImage: 'radial-gradient(circle at center, transparent 8rem, black 8.1rem)',
                    maskImage: 'radial-gradient(circle at center, transparent 8rem, black 8.1rem)'
                }}
                animate={stage === 'reveal' ? {
                    WebkitMaskImage: 'radial-gradient(circle at center, transparent 300vmax, black 300vmax)',
                    maskImage: 'radial-gradient(circle at center, transparent 300vmax, black 300vmax)',
                } : {}}
                transition={{
                    duration: 1.2,
                    ease: [0.4, 0, 0.2, 1] // Custom ease for dynamic reveal
                }}
            />

            {/* The Red Circle - Bangladesh Flag Style */}
            {/* Matches the hole size initially (r=8rem -> w=16rem = w-64) */}
            {stage !== 'finished' && (
                <motion.div
                    layoutId="sos-button-bg"
                    initial={{ scale: 1 }}
                    animate={stage === 'push' || stage === 'reveal' ? { scale: 0.6 } : { scale: 1 }}
                    transition={stage === 'push' ? {
                        duration: 1.0,
                        ease: "easeInOut"
                    } : { duration: 0.8 }}
                    className="w-96 h-96 bg-ncp-red rounded-full shadow-2xl z-20 flex items-center justify-center relative"
                >
                    {/* Ripple/Tap Effect Visual */}
                    {stage === 'push' && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 rounded-full border-2 border-white/50"
                        />
                    )}
                </motion.div>
            )}
        </div>
    );
}
