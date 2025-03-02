import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { TablerIcon } from '@tabler/icons-react';

// Define the type for navigation items
export interface NavItem {
  name: string;
  path: string;
  icon: TablerIcon;
}

interface BottomNavigationProps {
  navItems: NavItem[];
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ navItems }) => {
  const pathname = usePathname();
  
  return (
    <motion.nav 
      className="flex z-10 w-full"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
        <motion.div 
          className="flex items-center justify-around h-fit bg-gray-800 w-full"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          {navItems.map((item) => {
            const isActive = 
              item.path === '/trippy' 
                ? pathname === '/trippy' || pathname === '/trippy/' 
                : pathname.startsWith(item.path);
            
            const Icon = item.icon;
            
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
                    className={isActive ? 'text-white' : 'text-slate-200'} 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <motion.span 
                  className={`mt-1 text-xs font-medium ${isActive ? 'text-white' : 'text-slate-200'}`}
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                >
                  {item.name}
                </motion.span>
              </Link>
            );
          })}
        </motion.div>
    </motion.nav>
  );
};

export default BottomNavigation;