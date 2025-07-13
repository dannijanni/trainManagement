import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  Train,
  MapPin,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { Train as TrainType } from '../../types';

const TrainManagement: React.FC = () => {
  const { user } = useAuth();
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<TrainType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrain, setEditingTrain] = useState<TrainType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    from: '',
    to: '',
    via: '',
    departure: '',
    arrival: '',
    duration: '',
    firstClassSeats: '20',
    businessClassSeats: '40',
    economyClassSeats: '80',
    firstClassPrice: '299',
    businessClassPrice: '199',
    economyClassPrice: '99',
    amenities: '',
    status: 'active' as 'active' | 'cancelled' | 'delayed'
  });

  useEffect(() => {
    loadTrains();
  }, []);

  useEffect(() => {
    filterTrains();
  }, [trains, searchTerm, filterStatus]);

  const loadTrains = () => {
    const trainData = LocalStorageManager.getTrains();
    setTrains(trainData);
  };

  const filterTrains = () => {
    let filtered = trains;

    if (searchTerm) {
      filtered = filtered.filter(train =>
        train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.route.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(train => train.status === filterStatus);
    }

    setFilteredTrains(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trainData: TrainType = {
      id: editingTrain?.id || Date.now().toString(),
      name: formData.name,
      number: formData.number,
      route: {
        from: formData.from,
        to: formData.to,
        via: formData.via.split(',').map(s => s.trim()).filter(s => s)
      },
      schedule: {
        departure: formData.departure,
        arrival: formData.arrival,
        duration: formData.duration
      },
      classes: {
        'First Class': {
          totalSeats: parseInt(formData.firstClassSeats),
          availableSeats: parseInt(formData.firstClassSeats),
          price: parseFloat(formData.firstClassPrice)
        },
        'Business Class': {
          totalSeats: parseInt(formData.businessClassSeats),
          availableSeats: parseInt(formData.businessClassSeats),
          price: parseFloat(formData.businessClassPrice)
        },
        'Economy Class': {
          totalSeats: parseInt(formData.economyClassSeats),
          availableSeats: parseInt(formData.economyClassSeats),
          price: parseFloat(formData.economyClassPrice)
        }
      },
      status: formData.status,
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(s => s),
      createdAt: editingTrain?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTrains = editingTrain
      ? trains.map(t => t.id === editingTrain.id ? trainData : t)
      : [...trains, trainData];

    setTrains(updatedTrains);
    LocalStorageManager.saveTrains(updatedTrains);
    resetForm();
  };

  const handleDelete = (trainId: string) => {
    if (user?.role !== 'admin') {
      alert('Only administrators can delete trains');
      return;
    }
    
    if (confirm('Are you sure you want to delete this train?')) {
      const updatedTrains = trains.filter(t => t.id !== trainId);
      setTrains(updatedTrains);
      LocalStorageManager.saveTrains(updatedTrains);
    }
  };

  const handleEdit = (train: TrainType) => {
    setEditingTrain(train);
    setFormData({
      name: train.name,
      number: train.number,
      from: train.route.from,
      to: train.route.to,
      via: train.route.via.join(', '),
      departure: train.schedule.departure,
      arrival: train.schedule.arrival,
      duration: train.schedule.duration,
      firstClassSeats: train.classes['First Class'].totalSeats.toString(),
      businessClassSeats: train.classes['Business Class'].totalSeats.toString(),
      economyClassSeats: train.classes['Economy Class'].totalSeats.toString(),
      firstClassPrice: train.classes['First Class'].price.toString(),
      businessClassPrice: train.classes['Business Class'].price.toString(),
      economyClassPrice: train.classes['Economy Class'].price.toString(),
      amenities: train.amenities.join(', '),
      status: train.status
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      from: '',
      to: '',
      via: '',
      departure: '',
      arrival: '',
      duration: '',
      firstClassSeats: '20',
      businessClassSeats: '40',
      economyClassSeats: '80',
      firstClassPrice: '299',
      businessClassPrice: '199',
      economyClassPrice: '99',
      amenities: '',
      status: 'active'
    });
    setEditingTrain(null);
    setShowAddModal(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Train Management</h1>
          <p className="text-gray-600 mt-2">Manage your fleet of trains and their schedules</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search trains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="delayed">Delayed</option>
              </select>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Train
              </button>
            </div>
          </div>
        </div>

        {/* Trains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrains.map((train) => (
            <div key={train.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{train.name}</h3>
                    <p className="text-sm text-gray-600">{train.number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(train.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(train.status)}`}>
                      {train.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{train.route.from} → {train.route.to}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{train.schedule.departure} - {train.schedule.arrival}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      From ${Math.min(...Object.values(train.classes).map(c => c.price))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {Object.values(train.classes).reduce((sum, c) => sum + c.totalSeats, 0)} seats
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(train)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(train.id)}
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

        {filteredTrains.length === 0 && (
          <div className="text-center py-12">
            <Train className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No trains found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingTrain ? 'Edit Train' : 'Add New Train'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Train Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Train Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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
                    placeholder="Station1, Station2, Station3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.departure}
                      onChange={(e) => setFormData(prev => ({ ...prev, departure: e.target.value }))}
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
                      value={formData.arrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, arrival: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="8h 30m"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Class Seats
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.firstClassSeats}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstClassSeats: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Class Seats
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.businessClassSeats}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessClassSeats: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Economy Class Seats
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.economyClassSeats}
                      onChange={(e) => setFormData(prev => ({ ...prev, economyClassSeats: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amenities (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="WiFi, Dining Car, AC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'cancelled' | 'delayed' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="delayed">Delayed</option>
                    </select>
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
                    {editingTrain ? 'Update Train' : 'Add Train'}
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

export default TrainManagement;