import React from 'react';
import { Friend } from '../types/index';
import { deleteFriend, createAutoBackup } from '../services/localStorage.ts';
import './RemoteFriendsView.css';

interface RemoteFriendsViewProps {
  friends: Friend[];
  onFriendsChange: (friends: Friend[]) => void;
  onShowFriendForm: () => void;
  onEditFriend: (friend: Friend) => void;
}

const RemoteFriendsView: React.FC<RemoteFriendsViewProps> = ({
  friends,
  onFriendsChange,
  onShowFriendForm,
  onEditFriend
}) => {
  const remoteFriends = friends.filter(friend => friend.isRemote)
    .sort((a, b) => {
      // Sort by last hangout date (most recent first)
      if (!a.lastHangout && !b.lastHangout) return 0;
      if (!a.lastHangout) return 1;
      if (!b.lastHangout) return -1;
      return new Date(b.lastHangout).getTime() - new Date(a.lastHangout).getTime();
    });

  const handleDeleteFriend = (friendId: string) => {
    if (window.confirm('Are you sure you want to delete this friend?')) {
      deleteFriend(friendId);
      const updatedFriends = friends.filter(f => f.id !== friendId);
      onFriendsChange(updatedFriends);
      createAutoBackup(); // Auto-backup after deleting friend
    }
  };

  return (
    <div className="remote-friends-container">
      {remoteFriends.map((friend) => (
        <div key={friend.id} className="remote-friend-card">
          <div className="remote-friend-header">
            <div className="remote-friend-info">
              <div className="remote-friend-avatar">
                {friend.avatar ? (
                  <img 
                    src={friend.avatar} 
                    alt={friend.name}
                  />
                ) : (
                  friend.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="remote-friend-details">
                <h3>{friend.name}</h3>
                <div className="remote-friend-meta">
                  <span>
                    📍 {friend.location || 'Unknown location'}
                  </span>
                  {friend.connectionPreferences && friend.connectionPreferences.length > 0 && (
                    <span>
                      💬 {friend.connectionPreferences.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="remote-friend-actions">
              <div className="remote-friend-contact-info">
                <div className="contact-label">
                  Last Contact
                </div>
                <div className="contact-date">
                  {friend.lastHangout ? 
                    new Date(friend.lastHangout).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 
                    'Never'
                  }
                </div>
                {friend.lastHangout && (
                  <div className="contact-days-ago">
                    {Math.floor((new Date().getTime() - new Date(friend.lastHangout).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                )}
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => onEditFriend(friend)}
                  className="action-button edit"
                >
                  <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteFriend(friend.id)}
                  className="action-button delete"
                >
                  <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {friend.description && (
            <div className="remote-friend-description">
              {friend.description}
            </div>
          )}
        </div>
      ))}
      {remoteFriends.length === 0 && (
        <div className="remote-friends-empty-state">
          <div className="empty-state-icon-container">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No remote friends added yet</h3>
          <p className="empty-state-description">
            Add remote friends to keep track of your long-distance connections!
          </p>
          <button
            onClick={onShowFriendForm}
            className="add-first-remote-friend-button"
          >
            Add Your First Remote Friend
          </button>
        </div>
      )}
    </div>
  );
};

export default RemoteFriendsView; 