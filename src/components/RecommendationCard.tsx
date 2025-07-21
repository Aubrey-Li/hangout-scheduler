import React from 'react';
import { HangoutRecommendation } from '../types/index';
import FriendCard from './FriendCard.tsx';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: HangoutRecommendation;
  onMarkAsHungOut: (friendId: string, date: string) => void;
  onSnooze: (friendId: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onMarkAsHungOut,
  onSnooze
}) => {
  const { friend, suggestedActivities, nextHangoutDate, reason } = recommendation;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateStatus = (dateString: string): { text: string; className: string } => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: 'Today', className: 'date-status-today' };
    if (diffDays === 1) return { text: 'Tomorrow', className: 'date-status-tomorrow' };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, className: 'date-status-this-week' };
    return { text: `In ${diffDays} days`, className: 'date-status-later' };
  };

  const dateStatus = getDateStatus(nextHangoutDate);

  const handleMarkAsHungOut = () => {
    const today = new Date().toISOString().split('T')[0];
    onMarkAsHungOut(friend.id, today);
  };

    return (
    <div className="recommendation-card">
      {/* Header with priority indicator */}
      <div className="recommendation-header">
        <div className="recommendation-priority">
          <div className="priority-indicator"></div>
          <span className="priority-label">Recommended Hangout</span>
        </div>
        <div className="recommendation-date-info">
          <div className="recommendation-date">
            {formatDate(nextHangoutDate)}
          </div>
          <div className={`date-status-badge ${dateStatus.className}`}>
            {dateStatus.text}
          </div>
        </div>
      </div>

      {/* Friend Card */}
      <div className="friend-card-container">
        <FriendCard friend={friend} showActions={false} />
      </div>

      {/* Recommendation Reason */}
      <div className="recommendation-reason">
        <div className="reason-content">
          <svg className="reason-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="reason-text-container">
            <h4>Why now?</h4>
            <p className="reason-text">{reason}</p>
          </div>
        </div>
      </div>

      {/* Suggested Activities */}
      <div className="activities-section">
        <h4 className="activities-header">
          <svg className="activities-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Suggested Activities
        </h4>
        <div className="activities-list">
          {suggestedActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-number">
                {index + 1}
              </div>
              <p className="activity-text">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="recommendation-actions">
        <button
          onClick={handleMarkAsHungOut}
          className="action-button mark-hung-out-button"
        >
          <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mark as Hung Out
        </button>
        <button
          onClick={() => onSnooze(friend.id)}
          className="action-button snooze-button"
        >
          <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Snooze
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
