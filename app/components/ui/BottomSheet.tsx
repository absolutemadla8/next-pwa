'use client';

import useVoiceChatStore from '@/app/store/voiceChatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  title?: string;
  showPin?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

const BottomSheet = ({ 
  isOpen = true, 
  onClose, 
  children, 
  title = "Trippy ActionSheet", 
  showPin = false,
  minHeight = '50vh',
  maxHeight = '90vh'
}: BottomSheetProps) => {
  const { sessionPin } = useVoiceChatStore();

  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 40, stiffness: 600 }}
            style={{ 
              minHeight: minHeight, 
              maxHeight: maxHeight 
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white flex flex-col w-full md:max-w-md"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 flex-shrink-0">
              {/* <div className="w-12 h-1.5 bg-gray-300 rounded-full" /> */}
            </div>

            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="flex flex-row items-center justify-between w-full px-6 flex-shrink-0">
                <h2 style={{ fontFamily: 'var(--font-domine)' }} className="text-lg text-primary lowercase">{title}</h2>
                
                <div className="flex items-center space-x-3">
                  {showPin && sessionPin ? (
                    <div className="flex justify-center space-x-1">
                      {sessionPin.split("").map((digit, index) => (
                        <div 
                          key={index} 
                          className="w-5 h-6 flex items-center justify-center bg-blue-100 border border-blue-600 rounded-md text-blue-800 text-md capitalize"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  ) : showPin ? (
                    <p className='text-blue-800 text-md'>No active session</p>
                  ) : null}
                  
                  {onClose && (
                    <button 
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="Close"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content with separate scrolling */}
              <div 
                className="mt-4 pt-2 pb-8 overflow-y-auto flex-grow"
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;