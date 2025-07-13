import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Calendar,
  Clock,
  Train,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Schedule, Route, Train as TrainType, Driver } from '../../types';

const ScheduleManagement: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    routeId: '',
    trainId: '',
    driverId: '',
    departureTime: '',
    arrivalTime: '',
    date: '',
    frequency: 'one-time' as 'daily' | 'weekly' | 'monthly' | 'one-time',
    daysOfWeek: [] as number[],
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'delayed'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, statusFilter, dateFilter]);

  const loadData = () => {
    const schedulesData = LocalStorageManager.getSchedules();
    const routesData = LocalStorageManager.getRoutes();
    const trainsData = LocalStorageManager.getTrains();
    const driversData = LocalStorageManager.getDrivers();
    
    setSchedules(schedulesData);
    setRoutes(routesData);
    setTrains(trainsData);
    setDrivers(driversData);
  };

  const filterSchedules = () => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(schedule => {
        const route = routes.find(r => r.id === schedule.routeId);
        const train = trains.find(t => t.id === schedule.trainId);
        return route?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               train?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(schedule => 
        schedule.date.startsWith(dateFilter)
      );
    }

    setFilteredSchedules(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData: Schedule = {
      id: editingSchedule?.id || Date.now().toString(),
      routeId: formData.routeId,
      trainId: formData.trainId,
      driverId: formData.driverId || undefined,
      departureTime: formData.departureTime,
      arrivalTime: formData.arrivalTime,
      date: formData.date,
      frequency: formData.frequency,
      daysOfWeek: formData.frequency === 'weekly' ? formData.daysOfWeek : undefined,
      status: formData.status,
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSchedules = editingSchedule
      ? schedules.map(s => s.id === editingSchedule.id ? scheduleData : s)
      : [...schedules, scheduleData];

    setSchedules(updatedSchedules);
    LocalStorageManager.saveSchedules(updatedSchedules);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      editingSchedule ? 'schedule_updated' : 'schedule_created',
      `${editingSchedule ? 'Updated' : 'Created'} schedule for ${getRouteName(scheduleData.routeId)}`
    );
    
    resetForm();
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      routeId: schedule.routeId,
      trainId: schedule.trainId,
      driverId: schedule.driverId || '',
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      date: schedule.date,
      frequency: schedule.frequency,
      daysOfWeek: schedule.daysOfWeek || [],
      status: schedule.status
    });
    setShowCreateModal(true);
  };

  const handleDelete = (scheduleId: string) => {
    if (user?.role !== 'admin') {
      alert('Only administrators can delete schedules');
      return;
    }
    
    if (confirm('Are you sure you want to delete this schedule?')) {
      const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
      setSchedules(updatedSchedules);
      LocalStorageManager.saveSchedules(updatedSchedules);
      
      // Log activity
      LocalStorageManager.logUserActivity(
        user?.id || '',
        'schedule_deleted',
        `Deleted schedule: ${scheduleId}`
      );
    }
  };

  const resetForm = () => {
    setFormData({
      routeId: '',
      trainId: '',
      driverId: '',
      departureTime: '',
      arrivalTime: '',
      date: '',
      frequency: 'one-time',
      daysOfWeek: [],
      status: 'scheduled'
    });
    setEditingSchedule(null);
    setShowCreateModal(false);
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const getTrainName = (trainId: string) => {
    const train = trains.find(t => t.id === trainId);
    return train ? `${train.name} (${train.number})` : 'Unknown Train';
  };

  const getDriverName = (driverId?: string) => {
    if (!driverId) return 'Not assigned';
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown Driver';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDayOfWeekChange = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-2">Manage train schedules and assignments</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search schedules..."
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="delayed">Delayed</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getRouteName(schedule.routeId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTrainName(schedule.trainId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDriverName(schedule.driverId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(schedule.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.departureTime} - {schedule.arrivalTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {schedule.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(schedule.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No schedules found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Route
                    </label>
                    <select
                      required
                      value={formData.routeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, routeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Route</option>
                      {routes.filter(r => r.isActive).map(route => (
                        <option key={route.id} value={route.id}>
                          {route.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Train
                    </label>
                    <select
                      required
                      value={formData.trainId}
                      onChange={(e) => setFormData(prev => ({ ...prev, trainId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Train</option>
                      {trains.filter(t => t.status === 'active').map(train => (
                        <option key={train.id} value={train.id}>
                          {train.name} ({train.number})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver (Optional)
                  </label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Driver</option>
                    {drivers.filter(d => d.status === 'active').map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.departureTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="one-time">One Time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
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
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </div>

                {formData.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days of Week
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {dayNames.map((day, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.daysOfWeek.includes(index)}
                            onChange={() => handleDayOfWeekChange(index)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-xs">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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
                    {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
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

export default ScheduleManagement;