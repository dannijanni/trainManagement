import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MapPin,
  DollarSign,
  Clock,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Route } from '../../types';

const RoutesManagement: React.FC = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    from: '',
    to: '',
    via: '',
    distance: '',
    estimatedDuration: '',
    firstClassPrice: '',
    businessClassPrice: '',
    economyClassPrice: '',
    isActive: true
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    filterRoutes();
  }, [routes, searchTerm]);

  const loadRoutes = () => {
    const routesData = LocalStorageManager.getRoutes();
    setRoutes(routesData);
  };

  const filterRoutes = () => {
    let filtered = routes;

    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRoutes(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const routeData: Route = {
      id: editingRoute?.id || Date.now().toString(),
      name: formData.name,
      from: formData.from,
      to: formData.to,
      via: formData.via.split(',').map(s => s.trim()).filter(s => s),
      distance: parseFloat(formData.distance),
      estimatedDuration: formData.estimatedDuration,
      isActive: formData.isActive,
      pricing: {
        'First Class': parseFloat(formData.firstClassPrice),
        'Business Class': parseFloat(formData.businessClassPrice),
        'Economy Class': parseFloat(formData.economyClassPrice)
      },
      createdAt: editingRoute?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRoutes = editingRoute
      ? routes.map(r => r.id === editingRoute.id ? routeData : r)
      : [...routes, routeData];

    setRoutes(updatedRoutes);
    LocalStorageManager.saveRoutes(updatedRoutes);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      editingRoute ? 'route_updated' : 'route_created',
      `${editingRoute ? 'Updated' : 'Created'} route: ${routeData.name}`
    );
    
    resetForm();
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      from: route.from,
      to: route.to,
      via: route.via.join(', '),
      distance: route.distance.toString(),
      estimatedDuration: route.estimatedDuration,
      firstClassPrice: route.pricing['First Class'].toString(),
      businessClassPrice: route.pricing['Business Class'].toString(),
      economyClassPrice: route.pricing['Economy Class'].toString(),
      isActive: route.isActive
    });
    setShowCreateModal(true);
  };

  const handleDelete = (routeId: string) => {
    if (user?.role !== 'admin') {
      alert('Only administrators can delete routes');
      return;
    }
    
    if (confirm('Are you sure you want to delete this route?')) {
      const updatedRoutes = routes.filter(r => r.id !== routeId);
      setRoutes(updatedRoutes);
      LocalStorageManager.saveRoutes(updatedRoutes);
      
      // Log activity
      LocalStorageManager.logUserActivity(
        user?.id || '',
        'route_deleted',
        `Deleted route: ${routeId}`
      );
    }
  };

  const toggleRouteStatus = (routeId: string) => {
    const updatedRoutes = routes.map(route =>
      route.id === routeId 
        ? { ...route, isActive: !route.isActive, updatedAt: new Date().toISOString() }
        : route
    );
    
    setRoutes(updatedRoutes);
    LocalStorageManager.saveRoutes(updatedRoutes);
    
    // Log activity
    const route = routes.find(r => r.id === routeId);
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'route_status_changed',
      `${route?.isActive ? 'Disabled' : 'Enabled'} route: ${route?.name}`
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      from: '',
      to: '',
      via: '',
      distance: '',
      estimatedDuration: '',
      firstClassPrice: '',
      businessClassPrice: '',
      economyClassPrice: '',
      isActive: true
    });
    setEditingRoute(null);
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Routes Management</h1>
          <p className="text-gray-600 mt-2">Manage transport routes and pricing</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Route
            </button>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{route.from} → {route.to}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRouteStatus(route.id)}
                    className="flex items-center"
                  >
                    {route.isActive ? (
                      <ToggleRight className="h-6 w-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{route.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{route.distance} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      From ${Math.min(...Object.values(route.pricing))}
                    </span>
                  </div>
                </div>

                {route.via.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Via:</p>
                    <div className="flex flex-wrap gap-1">
                      {route.via.map((station, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {station}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Pricing:</p>
                  <div className="space-y-1">
                    {Object.entries(route.pricing).map(([className, price]) => (
                      <div key={className} className="flex justify-between text-sm">
                        <span className="text-gray-600">{className}:</span>
                        <span className="font-medium">${price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(route)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No routes found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Route Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="NYC-Chicago Express"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.from}
                      onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.to}
                      onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Chicago"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Via (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.via}
                    onChange={(e) => setFormData(prev => ({ ...prev, via: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Philadelphia, Pittsburgh"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.distance}
                      onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="790"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="8h 30m"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Class Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.firstClassPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstClassPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="299"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Class Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.businessClassPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessClassPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="199"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Economy Class Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.economyClassPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, economyClassPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="99"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Route is active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingRoute ? 'Update Route' : 'Add Route'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesManagement;