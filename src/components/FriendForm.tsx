import React, { useState } from 'react';
import { Friend } from '../types/index';

interface FriendFormProps {
  friend?: Friend;
  onSubmit: (friend: Omit<Friend, 'id'>) => void;
  onCancel: () => void;
  hangoutLabels: string[];
  isRemoteContext?: boolean; // Whether we're adding from the remote friends view
}

const FriendForm: React.FC<FriendFormProps> = ({ 
  friend, 
  onSubmit, 
  onCancel, 
  hangoutLabels,
  isRemoteContext = false
}) => {
  const [formData, setFormData] = useState({
    name: friend?.name || '',
    avatar: friend?.avatar || '',
    description: friend?.description || '',
    birthday: friend?.birthday || '',
    anniversary: friend?.anniversary || '',
    lastHangout: friend?.lastHangout || '',
    closeness: friend?.closeness || 5,
    twitter: friend?.socials?.twitter || '',
    instagram: friend?.socials?.instagram || '',
    linkedin: friend?.socials?.linkedin || '',
    hangoutPreferences: friend?.hangoutPreferences || [],
    isRemote: friend?.isRemote || isRemoteContext,
    location: friend?.location || '',
    connectionPreferences: friend?.connectionPreferences || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFriend: Omit<Friend, 'id'> = {
      name: formData.name,
      avatar: formData.avatar || undefined,
      description: formData.description || undefined,
      birthday: formData.birthday || undefined,
      anniversary: formData.anniversary || undefined,
      lastHangout: formData.lastHangout || undefined,
      closeness: formData.closeness,
      socials: {
        twitter: formData.twitter || undefined,
        instagram: formData.instagram || undefined,
        linkedin: formData.linkedin || undefined,
      },
      hangoutPreferences: formData.hangoutPreferences,
      isRemote: formData.isRemote,
      location: formData.location || undefined,
      connectionPreferences: formData.connectionPreferences
    };
    
    onSubmit(newFriend);
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      hangoutPreferences: prev.hangoutPreferences.includes(preference)
        ? prev.hangoutPreferences.filter(p => p !== preference)
        : [...prev.hangoutPreferences, preference]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {friend ? 'Edit Friend' : 'Add New Friend'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description about your friend..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closeness Level (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.closeness}
              onChange={(e) => setFormData(prev => ({ ...prev, closeness: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Distant (1)</span>
              <span className="font-medium">Current: {formData.closeness}</span>
              <span>Very Close (10)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anniversary
            </label>
            <input
              type="date"
              value={formData.anniversary}
              onChange={(e) => setFormData(prev => ({ ...prev, anniversary: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Hangout
            </label>
            <input
              type="date"
              value={formData.lastHangout}
              onChange={(e) => setFormData(prev => ({ ...prev, lastHangout: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="When did you last hang out?"
            />
            <p className="text-xs text-gray-500 mt-1">
              This helps the recommendation engine suggest when to hang out next
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Twitter username"
              />
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instagram username"
              />
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LinkedIn username"
              />
            </div>
          </div>

          {/* Remote Friend Section */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={formData.isRemote}
                onChange={(e) => setFormData(prev => ({ ...prev, isRemote: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                This is a remote friend (long-distance)
              </label>
            </div>

            {formData.isRemote && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State/Country)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Connection Methods
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Phone calls', 'Video calls', 'Text messages', 'Social media', 'Email', 'Visiting each other'].map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.connectionPreferences.includes(method)}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              connectionPreferences: prev.connectionPreferences.includes(method)
                                ? prev.connectionPreferences.filter(p => p !== method)
                                : [...prev.connectionPreferences, method]
                            }));
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.isRemote ? 'Activity Interests (for when visiting)' : 'Hangout Preferences'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {hangoutLabels.map((label) => (
                <label key={label} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hangoutPreferences.includes(label)}
                    onChange={() => handlePreferenceToggle(label)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {friend ? 'Update Friend' : 'Add Friend'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FriendForm;
