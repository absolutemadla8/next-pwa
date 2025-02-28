'use client';

import useVoiceChatStore from '@/app/store/voiceChatStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);

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
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, info) => {
              setIsDragging(false);
              if (info.offset.y > 200 && onClose) {
                onClose();
              }
            }}
            className={`fixed bottom-0 left-0 right-0 z-50 bg-slate-100 rounded-t-[32px] min-h-[${minHeight}] max-h-[${maxHeight}] overflow-hidden`}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="pb-8">
              <div className="flex flex-row items-center justify-between w-full px-6">
                <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className="text-lg text-blue-950">{title}</h2>
                
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
              </div>

              {/* Content */}
              <div className={`mt-4 ${isDragging ? 'pointer-events-none overflow-scroll' : ''}`}>
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