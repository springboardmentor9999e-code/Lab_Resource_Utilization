import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Mail, Bell, Smartphone, Save, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../../api/api';

const NOTIFICATION_TYPES = [
  { value: 'BOOKING_CREATED', label: 'Booking Created', description: 'When a new booking is created' },
  { value: 'BOOKING_APPROVED', label: 'Booking Approved', description: 'When your booking is approved' },
  { value: 'BOOKING_REJECTED', label: 'Booking Rejected', description: 'When your booking is rejected' },
  { value: 'BOOKING_CANCELLED', label: 'Booking Cancelled', description: 'When a booking is cancelled' },
  { value: 'BOOKING_REMINDER', label: 'Booking Reminder', description: 'Reminder before your booking starts' },
  { value: 'MAINTENANCE_SCHEDULED', label: 'Maintenance Scheduled', description: 'When maintenance is scheduled' },
  { value: 'MAINTENANCE_COMPLETED', label: 'Maintenance Completed', description: 'When maintenance is completed' },
  { value: 'CALIBRATION_DUE', label: 'Calibration Due', description: 'When equipment calibration is due' },
  { value: 'EQUIPMENT_AVAILABLE', label: 'Equipment Available', description: 'When equipment becomes available' },
  { value: 'WAITLIST_PROMOTED', label: 'Waitlist Promoted', description: 'When you are promoted from waitlist' },
  { value: 'PARTNERSHIP_INVITATION', label: 'Partnership Invitation', description: 'When you receive a partnership invitation' },
  { value: 'ANNOUNCEMENT', label: 'Announcements', description: 'System announcements and updates' },
  { value: 'PASSWORD_RESET', label: 'Password Reset', description: 'Password reset notifications' },
  { value: 'GENERAL', label: 'General', description: 'General system notifications' },
];

export default function NotificationPreferences() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({});

  const { data: savedPreferences = [], isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => { const res = await notificationApi.getPreferences(); return res.data; },
    onSuccess: (data) => {
      const prefsMap = {};
      data.forEach(pref => {
        prefsMap[pref.notificationType] = {
          emailEnabled: pref.emailEnabled,
          inAppEnabled: pref.inAppEnabled,
          smsEnabled: pref.smsEnabled,
          pushEnabled: pref.pushEnabled,
        };
      });
      setPreferences(prefsMap);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => notificationApi.updatePreferences(data),
    onSuccess: () => {
      toast.success('Preferences saved successfully');
      queryClient.invalidateQueries(['notification-preferences']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save preferences'),
  });

  const handleToggle = (type, field) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: !(prev[type]?.[field] ?? true),
      },
    }));
  };

  const handleSave = () => {
    const requests = NOTIFICATION_TYPES.map(type => ({
      notificationType: type.value,
      emailEnabled: preferences[type.value]?.emailEnabled ?? true,
      inAppEnabled: preferences[type.value]?.inAppEnabled ?? true,
      smsEnabled: preferences[type.value]?.smsEnabled ?? false,
      pushEnabled: preferences[type.value]?.pushEnabled ?? true,
    }));
    updateMutation.mutate(requests);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
          disabled={updateMutation.isPending}
        >
          <Save size={16} />
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
          <p className="text-sm text-gray-500">Toggle email and in-app notifications for each type</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Notification Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Mail size={14} /> Email
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Bell size={14} /> In-App
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Smartphone size={14} /> SMS
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    <Radio size={14} /> Push
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map((type) => {
                const pref = preferences[type.value] || { emailEnabled: true, inAppEnabled: true, smsEnabled: false, pushEnabled: true };
                return (
                  <tr key={type.value} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800">{type.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">{type.description}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(type.value, 'emailEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pref.emailEnabled ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pref.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(type.value, 'inAppEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pref.inAppEnabled ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pref.inAppEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(type.value, 'smsEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pref.smsEnabled ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pref.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(type.value, 'pushEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pref.pushEnabled ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pref.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
