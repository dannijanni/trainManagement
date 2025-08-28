import React, { useState } from 'react';
import {
  LayoutDashboard,
  Train,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  Search,
  Ticket,
  MapPin,
  Clock,
  Route,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'customer']
  },
  {
    id: 'trains',
    label: 'Train Management',
    icon: Train,
    roles: ['admin', 'manager']
  },
  {
    id: 'routes',
    label: 'Routes',
    icon: Route,
    roles: ['admin', 'manager']
  },
  {
    id: 'schedules',
    label: 'Schedules',
    icon: Clock,
    roles: ['admin', 'manager']
  },
  {
    id: 'bookings-admin',
    label: 'Bookings Management',
    icon: Ticket,
    roles: ['admin', 'manager', 'staff']
  },
  {
    id: 'drivers',
    label: 'Driver Management',
    icon: UserCheck,
    roles: ['admin', 'manager']
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    icon: BarChart3,
    roles: ['admin', 'manager']
  },
  {
    id: 'search',
    label: 'Search Trains',
    icon: Search,
    roles: ['customer']
  },
  {
    id: 'bookings',
    label: 'My Bookings',
    icon: Ticket,
    roles: ['customer']
  },
  {
    id: 'users',
    label: 'User Management',
    icon: UserCheck,
    roles: ['admin']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['admin', 'manager']
  }
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = sidebarItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="mt-16 px-2">
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors w-full`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5`}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
