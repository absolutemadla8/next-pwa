import React from 'react';
import { motion } from 'framer-motion';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

const HorizontalScroll = ({ children, className = '' }: HorizontalScrollProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="w-full scrollbar-hide overflow-x-auto px-2">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className={`flex flex-row gap-2 ${className}`}
      >
        <div className='' />
        {React.Children.map(children, (child) => (
          <motion.div variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default HorizontalScroll;