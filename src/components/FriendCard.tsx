import React from 'react';
import { Friend } from '../types/index';

interface FriendCardProps {
  friend: Friend;
  onEdit?: (friend: Friend) => void;
  onDelete?: (friendId: string) => void;
  showActions?: boolean;
}

const FriendCard: React.FC<FriendCardProps> = ({ 
  friend, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const getClosenessColor = (closeness: number): string => {
    if (closeness >= 8) return 'bg-green-100 text-green-800';
    if (closeness >= 6) return 'bg-yellow-100 text-yellow-800';
    if (closeness >= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getClosenessLabel = (closeness: number): string => {
    if (closeness >= 8) return 'Very Close';
    if (closeness >= 6) return 'Close';
    if (closeness >= 4) return 'Moderate';
    return 'Distant';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
            {friend.avatar ? (
              <img 
                src={friend.avatar} 
                alt={friend.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              friend.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{friend.name}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getClosenessColor(friend.closeness)}`}>
              {getClosenessLabel(friend.closeness)} ({friend.closeness}/10)
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(friend)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(friend.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {friend.description && (
        <p className="mt-3 text-gray-600 text-sm">{friend.description}</p>
      )}

      <div className="mt-4 space-y-2">
        {friend.birthday && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Birthday: {friend.birthday}
          </div>
        )}
        
        {friend.anniversary && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Anniversary: {friend.anniversary}
          </div>
        )}

        {friend.lastHangout && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last hangout: {friend.lastHangout}
          </div>
        )}
      </div>

      {friend.hangoutPreferences.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Hangout Preferences:</h4>
          <div className="flex flex-wrap gap-1">
            {friend.hangoutPreferences.map((pref) => (
              <span
                key={pref}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>
      )}

      {friend.socials && (
        <div className="mt-4 flex space-x-3">
          {friend.socials.twitter && (
            <a
              href={`https://twitter.com/${friend.socials.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          )}
          {friend.socials.instagram && (
            <a
              href={`https://instagram.com/${friend.socials.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.309-3.44-.599.599-.897 1.198-1.794 1.797-2.691.898.599 1.797.898 2.992.898 1.198 0 2.394-.3 3.292-.898l1.198 1.497c-.898.898-2.096 1.497-3.593 1.497-.898 0-1.497-.3-2.246-.704zm7.186-2.991c-.599.898-1.497 1.497-2.694 1.497-.898 0-1.796-.3-2.394-.898l-1.198-1.497c.599-.599 1.198-1.198 1.796-1.796.599.298 1.198.597 1.796.597.898 0 1.796-.299 2.394-.898l.9 1.198c-.3.299-.6.598-.9.898zm-3.593-7.485c1.497 0 2.694.598 3.593 1.796l-.9 1.198c-.598-.598-1.496-.897-2.394-.897-.598 0-1.197.299-1.796.598-.598-.599-1.197-1.198-1.796-1.796.9-1.198 2.096-1.796 3.593-1.796z"/>
              </svg>
            </a>
          )}
          {friend.socials.linkedin && (
            <a
              href={`https://linkedin.com/in/${friend.socials.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendCard;
