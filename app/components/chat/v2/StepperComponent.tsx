import React from 'react';

interface Step {
  step_id: number;
  title: string;
  description: string;
  is_complete: boolean;
  steps?: string[];
  note?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onContinue?: (stepId: number) => void;
  onBack?: (stepId: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  currentStep,
  onContinue = () => {},
  onBack = () => {},
}) => {
  return (
    <ol className="overflow-hidden space-y-8">
      {steps.map((step, index) => {
        const isActive = step.step_id === currentStep;
        const isLast = index === steps.length - 1;
        
        return (
          <li
            key={step.step_id}
            className={`relative flex-1 ${!isLast ? `after:content-[''] after:w-0.5 after:h-[125%] after:inline-block after:absolute after:-bottom-11 after:left-2.5 lg:after:left-2 ${step.is_complete ? 'after:bg-gray-600' : 'after:bg-gray-200 after:z-0'}` : ''}`}
          >
            <div className="flex items-start font-medium w-full">
              <span
              style={{ fontFamily: 'var(--font-nohemi)' }}
                className={`w-6 h-6 pt-0.5 aspect-square ${
                  step.is_complete 
                    ? 'bg-gray-700 border-2 border-transparent text-white' 
                    : isActive 
                      ? 'bg-gray-50 border-2 border-gray-600 text-gray-700 relative z-20' 
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-500 relative z-10'
                } rounded-full flex justify-center items-center mr-3 text-xs lg:w-8 lg:h-8`}
              >
                {step.is_complete ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.step_id
                )}
              </span>
              <div className="block">
                <h4 className={`text-sm mb-1 ${step.is_complete || isActive ? 'text-gray-700' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-600 max-w-xs mb-3">
                  {step.description}
                </p>

                {step.steps && step.steps.length > 0 && (
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 w-full max-w-xl mb-3">
                    {step.steps.map((subStep, idx) => (
                      <li key={idx} className="text-xs font-medium text-gray-900">
                        {subStep}{idx < step.steps!.length - 1 ? ' >' : ''}
                      </li>
                    ))}
                  </ul>
                )}

                {step.note && (
                  <p className="text-xs text-gray-600 max-w-xs">
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;