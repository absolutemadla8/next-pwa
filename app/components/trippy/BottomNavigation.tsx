import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

// Define the type for navigation items
export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface BottomNavigationProps {
  navItems: NavItem[];
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ navItems }) => {
  const pathname = usePathname();
  
  return (
    <motion.nav 
      className="fixed items-center bottom-0 left-0 right-0 z-10 w-full md:max-w-md"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="mx-4 mb-4">
        <motion.div 
          className="flex items-center justify-around h-16 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          {navItems.map((item) => {
            const isActive = 
              item.path === '/trippy' 
                ? pathname === '/trippy' || pathname === '/trippy/' 
                : pathname.startsWith(item.path);
            
            const Icon = item.icon;
            
            // Special case for the center "Trippy" button
            if (item.name === 'Trippy') {
              return (
                <Link 
                  href={item.path} 
                  key={item.name}
                  className="relative flex flex-col items-center justify-center"
                >
                  <motion.div
                    className="w-12 h-12 -mt-6 rounded-full flex items-center justify-center p-0"
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <img src="https://aktt5yjwyc.ufs.sh/f/VfNn67L471Nr9fmfEB9xWcQKNpIrHFt5DZdUvCubf13VRLoa" className='h-full w-full object-cover' />
                  </motion.div>
                  <motion.span 
                    className="mt-1 text-xs font-medium text-blue-600"
                    animate={{ opacity: isActive ? 1 : 0.8 }}
                  >
                    {item.name}
                  </motion.span>
                </Link>
              );
            }
            
            // Regular nav items
            return (
              <Link 
                href={item.path} 
                key={item.name}
                className="relative flex flex-col items-center justify-center py-2 w-16"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon 
                    className={isActive ? 'text-blue-600' : 'text-gray-400'} 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <motion.span 
                  className={`mt-1 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                >
                  {item.name}
                </motion.span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full"
                    layoutId="bottomNavIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;