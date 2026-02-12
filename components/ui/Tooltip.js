'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Tooltip({ children, text, side = 'left', offset = 10 }) {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: offset },
        right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: offset },
        top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: offset },
        bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: offset },
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        style={positions[side]}
                        className="absolute px-2 py-1 bg-black/80 text-white text-xs font-bold rounded-lg whitespace-nowrap z-[1000] pointer-events-none backdrop-blur-sm shadow-md"
                    >
                        {text}
                        {/* Arrow */}
                        <div
                            className={`absolute w-2 h-2 bg-black/80 transform rotate-45 ${side === 'left' ? 'top-1/2 -right-1 -translate-y-1/2' :
                                    side === 'right' ? 'top-1/2 -left-1 -translate-y-1/2' :
                                        side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                                            'top-[-4px] left-1/2 -translate-x-1/2'
                                }`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
