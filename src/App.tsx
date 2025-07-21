import React, { useState, useEffect } from 'react';
import { Friend, HangoutLabel, HangoutRecommendation, AppSettings } from './types/index';
import FriendForm from './components/FriendForm.tsx';
import RecommendationsView from './views/RecommendationsView.tsx';
import FriendsView from './views/FriendsView.tsx';
import RemoteFriendsView from './views/RemoteFriendsView.tsx';
import LabelsView from './views/LabelsView.tsx';
import SettingsView from './views/SettingsView.tsx';
import { generateRecommendations } from './services/recommendationEngine.ts';
import {
  loadFriends,
  addFriend,
  updateFriend,
  loadHangoutLabels,
  loadSettings,
  createAutoBackup
} from './services/localStorage.ts';
import './App.css';

type ViewType = 'recommendations' | 'friends' | 'remote-friends' | 'labels' | 'settings';

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

  // Friend management callbacks
  const handleAddFriend = (friendData: Omit<Friend, 'id'>) => {
    // If we're on the remote friends view, make sure the friend is marked as remote
    const finalFriendData = currentView === 'remote-friends' 
      ? { ...friendData, isRemote: true }
      : friendData;
    
    const newFriend = addFriend(finalFriendData);
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
      setShowFriendForm(false); // Close the form modal
    }
  };

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setShowFriendForm(true);
  };

  // Data change handlers for views
  const handleDataImport = (friends: Friend[], labels: HangoutLabel[], settings: AppSettings) => {
    setFriends(friends);
    setHangoutLabels(labels);
    setSettings(settings);
  };

  const getViewTitle = (view: ViewType): string => {
    switch (view) {
      case 'recommendations': return 'Hangout Recommendations';
      case 'friends': return 'Local Friends';
      case 'remote-friends': return 'Remote Friends';
      case 'labels': return 'Hangout Labels';
      case 'settings': return 'Settings';
      default: return 'Hangout Scheduler';
    }
  };

  const getViewIcon = (view: ViewType): string => {
    switch (view) {
      case 'recommendations': return '🎯';
      case 'friends': return '👥';
      case 'remote-friends': return '🌍';
      case 'labels': return '🏷️';
      case 'settings': return '⚙️';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your hangout scheduler...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-title-container">
              <h1 className="header-title">
                <span className="header-title-highlight">Hangout</span> Scheduler
              </h1>
            </div>
            <nav className="header-nav">
              {(['recommendations', 'friends', 'remote-friends', 'labels', 'settings'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`nav-button ${currentView === view ? 'active' : 'inactive'}`}
                >
                  <span className="nav-button-icon">{getViewIcon(view)}</span>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div className="page-title-section">
            <h2>
              {getViewTitle(currentView)}
            </h2>
            <p className="page-description">
              {currentView === 'recommendations' && 'AI-powered suggestions for your next hangouts'}
              {currentView === 'friends' && 'Manage your local friends and their hangout preferences'}
              {currentView === 'remote-friends' && 'Keep track of remote friends and when you last connected'}
              {currentView === 'labels' && 'Customize your hangout activity categories'}
              {currentView === 'settings' && 'Customize your hangout scheduling preferences'}
            </p>
          </div>
          
          {(currentView === 'friends' || currentView === 'remote-friends') && (
            <button
              onClick={() => setShowFriendForm(true)}
              className="add-button"
            >
              <svg className="add-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {currentView === 'remote-friends' ? 'Add Remote Friend' : 'Add Friend'}
            </button>
          )}
        </div>

        {/* Content based on current view */}
        {currentView === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            friends={friends}
            labels={hangoutLabels}
            settings={settings}
            loading={loading}
            refreshStatus={refreshStatus}
            onRecommendationsChange={setRecommendations}
            onFriendsChange={setFriends}
            onNavigateToFriends={() => setCurrentView('friends')}
            onLoadingChange={setLoading}
            onRefreshStatusChange={setRefreshStatus}
          />
        )}

        {currentView === 'friends' && (
          <FriendsView
            friends={friends}
            onFriendsChange={setFriends}
            onShowFriendForm={() => setShowFriendForm(true)}
            onEditFriend={handleEditFriend}
          />
        )}

        {currentView === 'remote-friends' && (
          <RemoteFriendsView
            friends={friends}
            onFriendsChange={setFriends}
            onShowFriendForm={() => setShowFriendForm(true)}
            onEditFriend={handleEditFriend}
          />
        )}

        {currentView === 'labels' && (
          <LabelsView
            hangoutLabels={hangoutLabels}
            onLabelsChange={setHangoutLabels}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            friends={friends}
            recommendations={recommendations}
            onSettingsChange={setSettings}
            onDataChange={handleDataImport}
            importStatus={importStatus}
            onImportStatusChange={setImportStatus}
          />
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
          isRemoteContext={currentView === 'remote-friends'}
        />
      )}
    </div>
  );
}

export default App;
