import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings as SettingsIcon, 
  Mail, 
  CreditCard, 
  Building, 
  Clock,
  Shield,
  Truck,
  User,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { SystemSettings, Vehicle, Driver } from '../../types';

const SystemSettingsComponent: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(LocalStorageManager.getSystemSettings());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTab, setActiveTab] = useState('company');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    type: 'train' as 'train' | 'bus' | 'metro',
    capacity: '',
    registrationNumber: '',
    manufacturer: '',
    model: '',
    yearOfManufacture: '',
    status: 'active' as 'active' | 'maintenance' | 'retired'
  });
  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const vehiclesData = LocalStorageManager.getVehicles();
    const driversData = LocalStorageManager.getDrivers();
    setVehicles(vehiclesData);
    setDrivers(driversData);
  };

  const handleSaveSettings = () => {
    LocalStorageManager.saveSystemSettings(settings);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      'settings_updated',
      'Updated system settings'
    );
    
    alert('Settings saved successfully!');
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData: Vehicle = {
      id: editingVehicle?.id || Date.now().toString(),
      name: vehicleForm.name,
      type: vehicleForm.type,
      capacity: parseInt(vehicleForm.capacity),
      registrationNumber: vehicleForm.registrationNumber,
      manufacturer: vehicleForm.manufacturer,
      model: vehicleForm.model,
      yearOfManufacture: parseInt(vehicleForm.yearOfManufacture),
      status: vehicleForm.status,
      createdAt: editingVehicle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedVehicles = editingVehicle
      ? vehicles.map(v => v.id === editingVehicle.id ? vehicleData : v)
      : [...vehicles, vehicleData];

    setVehicles(updatedVehicles);
    LocalStorageManager.saveVehicles(updatedVehicles);
    
    // Log activity
    LocalStorageManager.logUserActivity(
      user?.id || '',
      editingVehicle ? 'vehicle_updated' : 'vehicle_created',
      `${editingVehicle ? 'Updated' : 'Created'} vehicle: ${vehicleData.name}`
    );
    
    resetVehicleForm();
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const driverData: Driver = {
      id: editingDriver?.id || Date.now().toString(),
      firstName: driverForm.firstName,
      lastName: driverForm.lastName,
      email: driverForm.email,
      phone: driverForm.phone,
      licenseNumber: driverForm.licenseNumber,
      licenseExpiry: driverForm.licenseExpiry,
      experience: parseInt(driverForm.experience),
      status: driverForm.status,
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
    
    resetDriverForm();
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      name: '',
      type: 'train',
      capacity: '',
      registrationNumber: '',
      manufacturer: '',
      model: '',
      yearOfManufacture: '',
      status: 'active'
    });
    setEditingVehicle(null);
    setShowVehicleModal(false);
  };

  const resetDriverForm = () => {
    setDriverForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      experience: '',
      status: 'active'
    });
    setEditingDriver(null);
    setShowDriverModal(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name,
      type: vehicle.type,
      capacity: vehicle.capacity.toString(),
      registrationNumber: vehicle.registrationNumber,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      yearOfManufacture: vehicle.yearOfManufacture.toString(),
      status: vehicle.status
    });
    setShowVehicleModal(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDriverForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      experience: driver.experience.toString(),
      status: driver.status
    });
    setShowDriverModal(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      setVehicles(updatedVehicles);
      LocalStorageManager.saveVehicles(updatedVehicles);
      
      // Log activity
      LocalStorageManager.logUserActivity(
        user?.id || '',
        'vehicle_deleted',
        `Deleted vehicle: ${vehicleId}`
      );
    }
  };

  const handleDeleteDriver = (driverId: string) => {
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

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'booking', label: 'Booking Rules', icon: SettingsIcon },
    { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
    { id: 'vehicles', label: 'Vehicle Management', icon: Truck },
    { id: 'drivers', label: 'Driver Management', icon: User }
  ];

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Email
          </label>
          <input
            type="email"
            value={settings.companyEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Phone
          </label>
          <input
            type="tel"
            value={settings.companyPhone}
            onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Address
        </label>
        <textarea
          value={settings.companyAddress}
          onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="bookingConfirmation"
            checked={settings.emailNotifications.bookingConfirmation}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              emailNotifications: {
                ...prev.emailNotifications,
                bookingConfirmation: e.target.checked
              }
            }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="bookingConfirmation" className="ml-2 text-sm text-gray-700">
            Send booking confirmation emails
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cancellation"
            checked={settings.emailNotifications.cancellation}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              emailNotifications: {
                ...prev.emailNotifications,
                cancellation: e.target.checked
              }
            }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="cancellation" className="ml-2 text-sm text-gray-700">
            Send cancellation emails
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reminders"
            checked={settings.emailNotifications.reminders}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              emailNotifications: {
                ...prev.emailNotifications,
                reminders: e.target.checked
              }
            }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="reminders" className="ml-2 text-sm text-gray-700">
            Send reminder emails
          </label>
        </div>
      </div>
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Booking Rules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Deadline (hours before departure)
          </label>
          <input
            type="number"
            value={settings.bookingRules.cancellationDeadline}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              bookingRules: {
                ...prev.bookingRules,
                cancellationDeadline: parseInt(e.target.value)
              }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refund Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={settings.bookingRules.refundPercentage}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              bookingRules: {
                ...prev.bookingRules,
                refundPercentage: parseInt(e.target.value)
              }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Bookings Per User
          </label>
          <input
            type="number"
            value={settings.bookingRules.maxBookingsPerUser}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              bookingRules: {
                ...prev.bookingRules,
                maxBookingsPerUser: parseInt(e.target.value)
              }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advance Booking Days
          </label>
          <input
            type="number"
            value={settings.bookingRules.advanceBookingDays}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              bookingRules: {
                ...prev.bookingRules,
                advanceBookingDays: parseInt(e.target.value)
              }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <select
            value={settings.paymentGateway.provider}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              paymentGateway: {
                ...prev.paymentGateway,
                provider: e.target.value
              }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="square">Square</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="testMode"
            checked={settings.paymentGateway.isTestMode}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              paymentGateway: {
                ...prev.paymentGateway,
                isTestMode: e.target.checked
              }
            }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="testMode" className="ml-2 text-sm text-gray-700">
            Test Mode
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <input
          type="password"
          value={settings.paymentGateway.apiKey}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            paymentGateway: {
              ...prev.paymentGateway,
              apiKey: e.target.value
            }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secret Key
        </label>
        <input
          type="password"
          value={settings.paymentGateway.secretKey}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            paymentGateway: {
              ...prev.paymentGateway,
              secretKey: e.target.value
            }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderVehicleManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Vehicle Management</h3>
        <button
          onClick={() => setShowVehicleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{vehicle.name}</h4>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditVehicle(vehicle)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Type: {vehicle.type}</p>
              <p>Capacity: {vehicle.capacity}</p>
              <p>Registration: {vehicle.registrationNumber}</p>
              <p>Status: <span className={`px-2 py-1 rounded-full text-xs ${
                vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{vehicle.status}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDriverManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Driver Management</h3>
        <button
          onClick={() => setShowDriverModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <div key={driver.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">
                {driver.firstName} {driver.lastName}
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditDriver(driver)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Email: {driver.email}</p>
              <p>License: {driver.licenseNumber}</p>
              <p>Experience: {driver.experience} years</p>
              <p>Status: <span className={`px-2 py-1 rounded-full text-xs ${
                driver.status === 'active' ? 'bg-green-100 text-green-800' :
                driver.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>{driver.status}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system preferences and manage resources</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'company' && renderCompanySettings()}
            {activeTab === 'email' && renderEmailSettings()}
            {activeTab === 'booking' && renderBookingSettings()}
            {activeTab === 'payment' && renderPaymentSettings()}
            {activeTab === 'vehicles' && renderVehicleManagement()}
            {activeTab === 'drivers' && renderDriverManagement()}
          </div>

          {/* Save Button */}
          {['company', 'email', 'booking', 'payment'].includes(activeTab) && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Name
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.name}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={vehicleForm.type}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                      <option value="metro">Metro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={vehicleForm.capacity}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.registrationNumber}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.manufacturer}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      required
                      value={vehicleForm.yearOfManufacture}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, yearOfManufacture: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={vehicleForm.status}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetVehicleForm}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={driverForm.firstName}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, firstName: e.target.value }))}
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
                      value={driverForm.lastName}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, lastName: e.target.value }))}
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
                      value={driverForm.email}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
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
                      value={driverForm.phone}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
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
                      value={driverForm.licenseNumber}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
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
                      value={driverForm.licenseExpiry}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      required
                      value={driverForm.experience}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={driverForm.status}
                      onChange={(e) => setDriverForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetDriverForm}
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
    </div>
  );
};

export default SystemSettingsComponent;