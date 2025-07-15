import React, { useState, useEffect } from 'react';
import { Friend, HangoutLabel, HangoutRecommendation, AppSettings } from './types/index';
import FriendCard from './components/FriendCard.tsx';
import FriendForm from './components/FriendForm.tsx';
import HangoutLabelsManager from './components/HangoutLabelsManager.tsx';
import RecommendationCard from './components/RecommendationCard.tsx';
import { generateRecommendations, updateLastHangout } from './services/recommendationEngine.ts';
import {
  loadFriends,
  addFriend,
  updateFriend,
  deleteFriend,
  loadHangoutLabels,
  addHangoutLabel,
  updateHangoutLabel,
  deleteHangoutLabel,
  loadSettings,
  updateSettings,
  exportData,
  importData,
  createAutoBackup
} from './services/localStorage.ts';
import './App.css';

type ViewType = 'recommendations' | 'friends' | 'labels' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('recommendations');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [hangoutLabels, setHangoutLabels] = useState<HangoutLabel[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ weeklyHangoutTarget: 2, preferredDays: ['Friday', 'Saturday', 'Sunday'] });
  const [recommendations, setRecommendations] = useState<HangoutRecommendation[]>([]);
  const [showFriendForm, setShowFriendForm] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<string>('');
  const [refreshStatus, setRefreshStatus] = useState<string>('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedFriends = loadFriends();
        const loadedLabels = loadHangoutLabels();
        const loadedSettings = loadSettings();
        
        setFriends(loadedFriends);
        setHangoutLabels(loadedLabels);
        setSettings(loadedSettings);
        
        // Generate recommendations
        const recs = await generateRecommendations(loadedFriends, loadedLabels, loadedSettings);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Regenerate recommendations when friends, labels, or settings change
  useEffect(() => {
    const updateRecommendations = async () => {
      if (friends.length > 0 && hangoutLabels.length > 0) {
        const recs = await generateRecommendations(friends, hangoutLabels, settings);
        setRecommendations(recs);
      }
    };

    updateRecommendations();
  }, [friends, hangoutLabels, settings]);

  // Friend management
  const handleAddFriend = (friendData: Omit<Friend, 'id'>) => {
    const newFriend = addFriend(friendData);
    setFriends(prev => [...prev, newFriend]);
    setShowFriendForm(false);
    createAutoBackup(); // Auto-backup after adding friend
  };

  const handleUpdateFriend = (friendData: Omit<Friend, 'id'>) => {
    if (editingFriend) {
      const updatedFriend = updateFriend(editingFriend.id, friendData);
      if (updatedFriend) {
        setFriends(prev => prev.map(f => f.id === editingFriend.id ? updatedFriend : f));
        createAutoBackup(); // Auto-backup after updating friend
      }
      setEditingFriend(null);
    }
  };

  const handleDeleteFriend = (friendId: string) => {
    if (window.confirm('Are you sure you want to delete this friend?')) {
      deleteFriend(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      createAutoBackup(); // Auto-backup after deleting friend
    }
  };

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setShowFriendForm(true);
  };

  // Hangout label management
  const handleAddLabel = (labelData: Omit<HangoutLabel, 'id'>) => {
    const newLabel = addHangoutLabel(labelData);
    setHangoutLabels(prev => [...prev, newLabel]);
  };

  const handleUpdateLabel = (labelId: string, labelData: Omit<HangoutLabel, 'id'>) => {
    const updatedLabel = updateHangoutLabel(labelId, labelData);
    if (updatedLabel) {
      setHangoutLabels(prev => prev.map(l => l.id === labelId ? updatedLabel : l));
    }
  };

  const handleDeleteLabel = (labelId: string) => {
    deleteHangoutLabel(labelId);
    setHangoutLabels(prev => prev.filter(l => l.id !== labelId));
  };

  // Settings management
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = updateSettings(newSettings);
    setSettings(updatedSettings);
    createAutoBackup(); // Auto-backup after settings change
  };

  // Backup/Restore functionality
  const handleExportData = () => {
    exportData();
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('Importing...');
    
    try {
      await importData(file);
      
      // Reload data after successful import
      const loadedFriends = loadFriends();
      const loadedLabels = loadHangoutLabels();
      const loadedSettings = loadSettings();
      
      setFriends(loadedFriends);
      setHangoutLabels(loadedLabels);
      setSettings(loadedSettings);
      
      setImportStatus('✅ Import successful!');
      
      // Clear status after 3 seconds
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('❌ Import failed. Please check the file format.');
      setTimeout(() => setImportStatus(''), 5000);
    }
    
    // Clear file input
    event.target.value = '';
  };

  // Recommendation actions
  const handleMarkAsHungOut = (friendId: string, date: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      const updatedFriend = updateLastHangout(friend, date);
      updateFriend(friendId, { lastHangout: date });
      setFriends(prev => prev.map(f => f.id === friendId ? updatedFriend : f));
    }
  };

  const handleSnooze = (friendId: string) => {
    // Remove from current recommendations with a helpful message
    setRecommendations(prev => prev.filter(r => r.friend.id !== friendId));
    
    // Optional: You could add a temporary storage here to prevent the same friend 
    // from appearing in recommendations for a short period (e.g., 24 hours)
    // This would require storing snooze timestamps in localStorage
  };

  // Add refresh functionality
  const handleRefreshRecommendations = async () => {
    setLoading(true);
    setRefreshStatus('');
    try {
      const recs = await generateRecommendations(friends, hangoutLabels, settings, true);
      setRecommendations(recs);
      setRefreshStatus(`✅ Found ${recs.length} new recommendation${recs.length !== 1 ? 's' : ''} scheduled over the next 2 weeks with no overlapping dates!`);
      
      // Clear status after 3 seconds
      setTimeout(() => setRefreshStatus(''), 3000);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      setRefreshStatus('❌ Error refreshing recommendations');
      setTimeout(() => setRefreshStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getViewTitle = (view: ViewType): string => {
    switch (view) {
      case 'recommendations': return 'Hangout Recommendations';
      case 'friends': return 'My Friends';
      case 'labels': return 'Hangout Labels';
      case 'settings': return 'Settings';
      default: return 'Hangout Scheduler';
    }
  };

  const getViewIcon = (view: ViewType): string => {
    switch (view) {
      case 'recommendations': return '🎯';
      case 'friends': return '👥';
      case 'labels': return '🏷️';
      case 'settings': return '⚙️';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your hangout scheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-purple-600">Hangout</span> Scheduler
              </h1>
            </div>
            <nav className="flex space-x-4">
              {(['recommendations', 'friends', 'labels', 'settings'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="mr-2">{getViewIcon(view)}</span>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {getViewTitle(currentView)}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentView === 'recommendations' && 'AI-powered suggestions for your next hangouts'}
              {currentView === 'friends' && 'Manage your friends and their hangout preferences'}
              {currentView === 'labels' && 'Customize your hangout activity categories'}
              {currentView === 'settings' && 'Customize your hangout scheduling preferences'}
            </p>
          </div>
          
          {currentView === 'friends' && (
            <button
              onClick={() => setShowFriendForm(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Friend
            </button>
          )}
        </div>

        {/* Content based on current view */}
        {currentView === 'recommendations' && (
          <div className="space-y-6">
            {/* Add refresh button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {recommendations.length > 0 ? (
                  `${recommendations.length} recommendation${recommendations.length !== 1 ? 's' : ''} found`
                ) : (
                  'No recommendations available'
                )}
              </div>
              <button
                onClick={handleRefreshRecommendations}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Refresh status notification */}
            {refreshStatus && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                {refreshStatus}
              </div>
            )}

            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.friend.id}
                  recommendation={rec}
                  onMarkAsHungOut={handleMarkAsHungOut}
                  onSnooze={handleSnooze}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600 mb-4">
                  {friends.length === 0 ? (
                    'Add some friends and set their hangout preferences to get personalized recommendations!'
                  ) : (
                    'No friends need hangouts right now. Try refreshing or adjusting your settings.'
                  )}
                </p>
                <div className="flex gap-3 justify-center">
                  {friends.length === 0 ? (
                    <button
                      onClick={() => setCurrentView('friends')}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Friends
                    </button>
                  ) : (
                    <button
                      onClick={handleRefreshRecommendations}
                      disabled={loading}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Refreshing...' : 'Refresh Recommendations'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onEdit={handleEditFriend}
                onDelete={handleDeleteFriend}
              />
            ))}
            {friends.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friends added yet</h3>
                <p className="text-gray-600 mb-4">
                  Add your first friend to start scheduling hangouts!
                </p>
                <button
                  onClick={() => setShowFriendForm(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Your First Friend
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'labels' && (
          <HangoutLabelsManager
            labels={hangoutLabels}
            onAddLabel={handleAddLabel}
            onUpdateLabel={handleUpdateLabel}
            onDeleteLabel={handleDeleteLabel}
          />
        )}

        {currentView === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">Hangout Scheduling Settings</h3>
            
            <div className="space-y-6">
              {/* Weekly Hangout Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Hangout Target
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.weeklyHangoutTarget}
                    onChange={(e) => handleUpdateSettings({ weeklyHangoutTarget: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-lg font-medium text-purple-600 min-w-[3rem]">
                    {settings.weeklyHangoutTarget}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  The recommendation engine will suggest up to {settings.weeklyHangoutTarget} hangout{settings.weeklyHangoutTarget !== 1 ? 's' : ''} per week
                </p>
              </div>

              {/* Preferred Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Days for Hangouts
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.preferredDays.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...settings.preferredDays, day]
                            : settings.preferredDays.filter(d => d !== day);
                          handleUpdateSettings({ preferredDays: newDays });
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Recommendations will be scheduled on your preferred days when possible
                </p>
              </div>

              {/* Data Backup & Restore */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Data Backup & Restore</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleExportData}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Data
                    </button>
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                        id="import-file"
                      />
                      <label
                        htmlFor="import-file"
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Import Data
                      </label>
                    </div>
                  </div>
                  
                  {importStatus && (
                    <div className={`p-3 rounded-lg ${importStatus.includes('successful') ? 'bg-green-50 text-green-800' : importStatus.includes('failed') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                      {importStatus}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>Export:</strong> Download all your data as a JSON backup file</p>
                    <p>• <strong>Import:</strong> Restore data from a previous backup file</p>
                    <p>• <strong>Auto-backup:</strong> Your data is automatically backed up when you make changes</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Current Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{friends.length}</div>
                    <div className="text-sm text-gray-600">Total Friends</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                    <div className="text-sm text-gray-600">Current Recommendations</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{settings.weeklyHangoutTarget}</div>
                    <div className="text-sm text-gray-600">Weekly Target</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Friend Form Modal */}
      {showFriendForm && (
        <FriendForm
          friend={editingFriend || undefined}
          onSubmit={editingFriend ? handleUpdateFriend : handleAddFriend}
          onCancel={() => {
            setShowFriendForm(false);
            setEditingFriend(null);
          }}
          hangoutLabels={hangoutLabels.map(label => label.name)}
        />
      )}
    </div>
  );
}

export default App;
