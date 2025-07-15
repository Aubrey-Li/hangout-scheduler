import React from 'react';
import { HangoutRecommendation } from '../types/index';
import FriendCard from './FriendCard.tsx';

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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMarkAsHungOut = () => {
    const today = new Date().toISOString().split('T')[0];
    onMarkAsHungOut(friend.id, today);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200 shadow-lg">
      {/* Header with priority indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700">Recommended Hangout</span>
        </div>
        <div className="text-sm text-gray-600">
          Suggested for {formatDate(nextHangoutDate)}
        </div>
      </div>

      {/* Friend Card */}
      <div className="mb-4">
        <FriendCard friend={friend} showActions={false} />
      </div>

      {/* Recommendation Reason */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Why now?</h4>
            <p className="text-sm text-gray-700">{reason}</p>
          </div>
        </div>
      </div>

      {/* Suggested Activities */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Suggested Activities
        </h4>
        <div className="space-y-2">
          {suggestedActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 flex-1">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleMarkAsHungOut}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mark as Hung Out
        </button>
        <button
          onClick={() => onSnooze(friend.id)}
          className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-2 px-4 rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Snooze
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
