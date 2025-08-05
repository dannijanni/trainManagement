import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings as SettingsIcon, 
  Mail, 
  CreditCard, 
  Building,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LocalStorageManager from '../../utils/localStorage';
import { SystemSettings } from '../../types';

const SystemSettingsComponent: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(LocalStorageManager.getSystemSettings());
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load any initial data if needed
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

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'booking', label: 'Booking Rules', icon: SettingsIcon },
    { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
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
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsComponent;