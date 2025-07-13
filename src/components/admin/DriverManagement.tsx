import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  User,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Driver, Route, Schedule } from '../../types';

const DriverManagement: React.FC = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    availability: 'available' as 'available' | 'on-duty' | 'off-duty',
    assignedRoutes: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchTerm, statusFilter, availabilityFilter]);

  const loadData = () => {
    const driversData = LocalStorageManager.getDrivers();
    const routesData = LocalStorageManager.getRoutes();
    const schedulesData = LocalStorageManager.getSchedules();
    
    setDrivers(driversData);
    setRoutes(routesData);
    setSchedules(schedulesData);
  };

  const filterDrivers = () => {
    let filtered = drivers;

    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(driver => driver.status === statusFilter);
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(driver => driver.availability === availabilityFilter);
    }

    setFilteredDrivers(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const driverData: Driver = {
      id: editingDriver?.id || Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      licenseExpiry: formData.licenseExpiry,
      experience: parseInt(formData.experience),
      status: formData.status,
      availability: formData.availability,
      assignedRoutes: formData.assignedRoutes,
      rating: editingDriver?.rating || 4.5,
      totalTrips: editingDriver?.totalTrips || 0,
      workHours: editingDriver?.workHours || {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      performance: editingDriver?.performance || {
        onTimePercentage: 95,
        customerRating: 4.5,
        totalRatings: 0
      },
      createdAt: editingDriver?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedDrivers = editingDriver
      ? drivers.map(d => d.id === editingDriver.id ? driverData : d)
      : [...drivers, driverData];

    setDrivers(updatedDrivers);
    LocalStorageManager.saveDrivers(updatedDrivers);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      editingDriver ? 'driver_updated' : 'driver_created',
      `${editingDriver ? 'Updated' : 'Created'} driver: ${driverData.firstName} ${driverData.lastName}`
    );
    
    resetForm();
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      experience: driver.experience.toString(),
      status: driver.status,
      availability: driver.availability,
      assignedRoutes: driver.assignedRoutes || []
    });
    setShowCreateModal(true);
  };

  const handleDelete = (driverId: string) => {
    if (user?.role !== 'admin') {
      alert('Only administrators can delete drivers');
      return;
    }
    
    if (confirm('Are you sure you want to delete this driver?')) {
      const updatedDrivers = drivers.filter(d => d.id !== driverId);
      setDrivers(updatedDrivers);
      LocalStorageManager.saveDrivers(updatedDrivers);
      
      // Log activity
      LocalStorageManager.logUserActivity(
        user?.id || '',
        'driver_deleted',
        `Deleted driver: ${driverId}`
      );
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      experience: '',
      status: 'active',
      availability: 'available',
      assignedRoutes: []
    });
    setEditingDriver(null);
    setShowCreateModal(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'suspended': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on-duty': return 'bg-blue-100 text-blue-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const handleRouteAssignment = (routeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedRoutes: prev.assignedRoutes.includes(routeId)
        ? prev.assignedRoutes.filter(id => id !== routeId)
        : [...prev.assignedRoutes, routeId]
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-2">Manage drivers, assignments, and performance</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="on-duty">On Duty</option>
                <option value="off-duty">Off Duty</option>
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Driver
              </button>
            </div>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {driver.firstName} {driver.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(driver.status)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{driver.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{driver.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">{driver.rating}/5.0 ({driver.totalTrips} trips)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(driver.availability)}`}>
                    {driver.availability}
                  </span>
                </div>

                {driver.assignedRoutes && driver.assignedRoutes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Assigned Routes:</p>
                    <div className="flex flex-wrap gap-1">
                      {driver.assignedRoutes.slice(0, 2).map(routeId => (
                        <span key={routeId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {getRouteName(routeId)}
                        </span>
                      ))}
                      {driver.assignedRoutes.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{driver.assignedRoutes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setViewingDriver(driver)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(driver)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(driver.id)}
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

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No drivers found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Expiry
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.licenseExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="on-duty">On Duty</option>
                      <option value="off-duty">Off Duty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Routes
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {routes.filter(r => r.isActive).map(route => (
                      <label key={route.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assignedRoutes.includes(route.id)}
                          onChange={() => handleRouteAssignment(route.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{route.name}</span>
                      </label>
                    ))}
                  </div>
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
                    {editingDriver ? 'Update Driver' : 'Add Driver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {viewingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Driver Performance - {viewingDriver.firstName} {viewingDriver.lastName}
                </h2>
                <button
                  onClick={() => setViewingDriver(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Overall Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{viewingDriver.rating}/5.0</p>
                    <p className="text-sm text-blue-700">{viewingDriver.totalTrips} total trips</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">On-Time Performance</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{viewingDriver.performance.onTimePercentage}%</p>
                    <p className="text-sm text-green-700">Punctuality rate</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Work Hours</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{viewingDriver.workHours.weekly}h</p>
                    <p className="text-sm text-purple-700">This week</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Work Hours Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{viewingDriver.workHours.daily}h</p>
                      <p className="text-sm text-gray-600">Today</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{viewingDriver.workHours.weekly}h</p>
                      <p className="text-sm text-gray-600">This Week</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{viewingDriver.workHours.monthly}h</p>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>
                  </div>
                </div>

                {viewingDriver.assignedRoutes && viewingDriver.assignedRoutes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Assigned Routes</h3>
                    <div className="space-y-2">
                      {viewingDriver.assignedRoutes.map(routeId => (
                        <div key={routeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{getRouteName(routeId)}</span>
                          <span className="text-sm text-gray-600">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;