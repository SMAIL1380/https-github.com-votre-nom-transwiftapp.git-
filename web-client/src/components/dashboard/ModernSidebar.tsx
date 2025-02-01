import React from 'react';
import { motion } from 'framer-motion';

interface MenuItem {
  icon: string;
  label: string;
  active?: boolean;
  notification?: number;
}

const menuItems: MenuItem[] = [
  {
    icon: '🏠',
    label: 'Dashboard',
    active: true,
  },
  {
    icon: '📦',
    label: 'Livraisons',
    notification: 3,
  },
  {
    icon: '🚚',
    label: 'Suivi',
  },
  {
    icon: '📊',
    label: 'Analytics',
  },
  {
    icon: '⚙️',
    label: 'Paramètres',
  },
];

const ModernSidebar: React.FC = () => {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200 p-6 fixed left-0 top-0"
    >
      {/* Logo */}
      <div className="flex items-center mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
        >
          TranswiftApp
        </motion.div>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center p-3 rounded-xl cursor-pointer relative ${
              item.active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.notification && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {item.notification}
              </motion.div>
            )}
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      <motion.div
        whileHover={{ y: -2 }}
        className="absolute bottom-6 left-6 right-6 p-3 bg-gray-50 rounded-xl flex items-center cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
          JD
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-700">John Doe</div>
          <div className="text-xs text-gray-500">Administrateur</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModernSidebar;
