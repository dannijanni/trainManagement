import React from 'react';
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
  icon: React.ComponentType<any>;
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
    id: 'payments',
    label: 'Payment Management',
    icon: CreditCard,
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

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
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
  );
};

export default Sidebar;