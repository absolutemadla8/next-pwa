import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

// Define types for our component props and step structure
interface Step {
  title: string;
  description: string;
  percentage?: number; // Optional - if not provided, steps will be equally timed
}

interface StepLoaderProps {
  steps: Step[];
  totalTimeMs?: number; // Optional with default value
  onComplete?: () => void; // Optional callback when all steps are done
}

// The StepLoader component takes an array of steps and total time
const StepLoader: React.FC<StepLoaderProps> = ({ 
  steps, 
  totalTimeMs = 5000,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Calculate time for each step based on its percentage
    let timeoutIds: NodeJS.Timeout[] = [];
    
    // Process each step sequentially
    const processSteps = async (): Promise<void> => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        
        // Calculate step duration based on percentage or equal distribution
        const stepPercentage = steps[i].percentage || (100 / steps.length);
        const stepDuration = (stepPercentage / 100) * totalTimeMs;
        
        // Wait for the step to complete
        await new Promise<void>(resolve => {
          const timeoutId = setTimeout(() => {
            // Mark step as completed
            setCompletedSteps(prev => [...prev, i]);
            resolve();
          }, stepDuration);
          
          timeoutIds.push(timeoutId);
        });
      }
      
      // Finish loading
      setLoading(false);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    };
    
    processSteps();
    
    // Cleanup
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [steps, totalTimeMs, onComplete]);

  return (
    <div className="bg-blue-100 p-6 rounded-lg max-w-xl mx-auto border border-blue-600">
      <h2 style={{ fontFamily: 'var(--font-nohemi)' }}  className="text-lg font-normal mb-6 text-blue-700">Steps</h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = completedSteps.includes(index);
          const isVisible = index <= currentStepIndex + 1;
          
          return (
            <AnimatePresence key={index}>
              {isVisible && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 mt-1">
                    <motion.div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-blue-500 text-white' 
                          : isActive 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-blue-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 style={{ fontFamily: 'var(--font-nohemi)' }}  className="text-md font-normal text-blue-700">{step.title}</h3>
                    <p className="text-blue-600 text-sm font-normal tracking-tight">{step.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
};

export default StepLoader;