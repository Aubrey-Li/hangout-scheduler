import React from 'react';
import { HangoutRecommendation, Friend, AppSettings, HangoutLabel } from '../types/index';
import RecommendationCard from '../components/RecommendationCard.tsx';
import { updateLastHangout, generateRecommendations } from '../services/recommendationEngine.ts';
import { updateFriend } from '../services/localStorage.ts';
import './RecommendationsView.css';

interface RecommendationsViewProps {
  recommendations: HangoutRecommendation[];
  friends: Friend[];
  labels: HangoutLabel[];
  settings: AppSettings;
  loading: boolean;
  refreshStatus: string;
  onRecommendationsChange: (recommendations: HangoutRecommendation[]) => void;
  onFriendsChange: (friends: Friend[]) => void;
  onNavigateToFriends: () => void;
  onLoadingChange: (loading: boolean) => void;
  onRefreshStatusChange: (status: string) => void;
}

const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  friends,
  labels,
  settings,
  loading,
  refreshStatus,
  onRecommendationsChange,
  onFriendsChange,
  onNavigateToFriends,
  onLoadingChange,
  onRefreshStatusChange
}) => {
  const handleMarkAsHungOut = (friendId: string, date: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      const updatedFriend = updateLastHangout(friend, date);
      updateFriend(friendId, { lastHangout: date });
      const updatedFriends = friends.map(f => f.id === friendId ? updatedFriend : f);
      onFriendsChange(updatedFriends);
    }
  };

  const handleSnooze = (friendId: string) => {
    // Remove from current recommendations with a helpful message
    const updatedRecommendations = recommendations.filter(r => r.friend.id !== friendId);
    onRecommendationsChange(updatedRecommendations);
    
    // Optional: You could add a temporary storage here to prevent the same friend 
    // from appearing in recommendations for a short period (e.g., 24 hours)
    // This would require storing snooze timestamps in localStorage
  };

  const handleRefreshRecommendations = async () => {
    onLoadingChange(true);
    onRefreshStatusChange('');
    try {
      const recs = await generateRecommendations(friends, labels, settings, true);
      onRecommendationsChange(recs);
      onRefreshStatusChange(`✅ Found ${recs.length} new recommendation${recs.length !== 1 ? 's' : ''} scheduled over the next 2 weeks with no overlapping dates!`);
      
      // Clear status after 3 seconds
      setTimeout(() => onRefreshStatusChange(''), 3000);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      onRefreshStatusChange('❌ Error refreshing recommendations');
      setTimeout(() => onRefreshStatusChange(''), 3000);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="recommendations-container">
      {/* Refresh button */}
      <div className="recommendations-header">
        <div className="recommendations-status">
          {recommendations.length > 0 ? (
            `${recommendations.length} recommendation${recommendations.length !== 1 ? 's' : ''} found`
          ) : (
            'No recommendations available'
          )}
        </div>
        <button
          onClick={handleRefreshRecommendations}
          disabled={loading}
          className="refresh-button"
        >
          <svg 
            className={`refresh-button-icon ${loading ? 'spinning' : ''}`} 
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
        <div className="refresh-notification">
          {refreshStatus}
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="recommendations-list">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.friend.id}
              recommendation={rec}
              onMarkAsHungOut={handleMarkAsHungOut}
              onSnooze={handleSnooze}
            />
          ))}
        </div>
      ) : (
        <div className="recommendations-empty-state">
          <div className="empty-state-icon-container">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No recommendations yet</h3>
          <p className="empty-state-description">
            Add some friends and set their hangout preferences to get personalized recommendations!
          </p>
          <div className="empty-state-actions">
            <button
              onClick={onNavigateToFriends}
              className="empty-state-button"
            >
              Add Friends
            </button>
            <button
              onClick={handleRefreshRecommendations}
              disabled={loading}
              className="empty-state-button"
            >
              {loading ? 'Refreshing...' : 'Refresh Recommendations'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsView; 