import { Friend, HangoutLabel, HangoutRecommendation, AppSettings } from '../types/index';

// Activity suggestion database organized by preference type
const activitySuggestions: Record<string, string[]> = {
  'Dining': [
    'Try that new restaurant you both wanted to visit',
    'Cook a meal together at home',
    'Explore a food market or food truck festival',
    'Have brunch at a cozy café',
    'Order from your favorite takeout and catch up'
  ],
  'Museums': [
    'Visit the local art museum',
    'Check out a new exhibition downtown',
    'Explore a science or history museum',
    'Take a guided museum tour together',
    'Visit a small gallery in your neighborhood'
  ],
  'Night Life': [
    'Go bar hopping in the entertainment district',
    'Try a new cocktail bar',
    'Attend a live music venue',
    'Check out a comedy show',
    'Go dancing at a fun club'
  ],
  'Bars': [
    'Happy hour at your favorite spot',
    'Try a new brewery or distillery',
    'Rooftop bar with a view',
    'Sports bar to watch the game',
    'Quiet wine bar for good conversation'
  ],
  'Neighborhood Walk': [
    'Take a long walk through the park',
    'Explore a new neighborhood together',
    'Walk along the waterfront or scenic route',
    'Stroll through downtown and window shop',
    'Take a nature walk or hiking trail'
  ],
  'Coffee': [
    'Morning coffee at a new café',
    'Afternoon coffee and pastries',
    'Coffee shop with board games',
    'Outdoor café with people watching',
    'Cozy bookstore café'
  ],
  'Movies': [
    'Movie night at home with snacks',
    'Catch the latest blockbuster',
    'Watch a classic film together',
    'Attend an outdoor movie screening',
    'Binge-watch a series together'
  ],
  'Sports': [
    'Play tennis or basketball',
    'Go bowling or mini golf',
    'Watch a game at a sports bar',
    'Try a new fitness class together',
    'Go for a bike ride'
  ],
  'Shopping': [
    'Browse the local farmers market',
    'Go thrift shopping or vintage hunting',
    'Mall trip with lunch',
    'Explore local boutiques',
    'Holiday or seasonal shopping'
  ],
  'Concerts': [
    'Check out a local band',
    'Attend a concert at a nearby venue',
    'Music festival or outdoor concert',
    'Jazz club or intimate music venue',
    'Free concert in the park'
  ]
};

// Default activities for when no preferences are set
const defaultActivities = [
  'Grab coffee and catch up',
  'Take a walk and chat',
  'Meet for lunch',
  'Visit a local park',
  'Try something new together'
];

// Calculate days since last hangout
const daysSinceLastHangout = (lastHangout?: string): number => {
  if (!lastHangout) return 999; // Never hung out
  const lastDate = new Date(lastHangout);
  const today = new Date();
  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
};

// Calculate recommended frequency based on closeness (days between hangouts)
const getRecommendedFrequency = (closeness: number): number => {
  if (closeness >= 9) return 7;   // Weekly for very close friends
  if (closeness >= 7) return 14;  // Bi-weekly for close friends
  if (closeness >= 5) return 21;  // Every 3 weeks for moderate friends
  if (closeness >= 3) return 30;  // Monthly for casual friends
  return 60; // Every 2 months for distant friends
};

// Generate activity suggestions based on preferences and closeness
const generateActivitySuggestions = (
  friend: Friend,
  hangoutLabels: HangoutLabel[]
): string[] => {
  const suggestions: string[] = [];
  const { hangoutPreferences, closeness } = friend;
  
  // If no preferences, use default activities
  if (hangoutPreferences.length === 0) {
    return defaultActivities.slice(0, 3);
  }
  
  // Get suggestions based on preferences
  hangoutPreferences.forEach(preference => {
    const activities = activitySuggestions[preference] || [];
    if (activities.length > 0) {
      // Randomly select an activity from this category
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      suggestions.push(randomActivity);
    }
  });
  
  // Enhance suggestions based on closeness level
  const enhancedSuggestions = suggestions.map(activity => {
    if (closeness >= 8) {
      // For very close friends, suggest more intimate/extended activities
      if (activity.includes('coffee')) return activity + ' and spend the whole afternoon together';
      if (activity.includes('walk')) return activity + ' and have deep conversations';
      if (activity.includes('restaurant')) return activity + ' and try the tasting menu';
      return activity;
    } else if (closeness >= 6) {
      // For close friends, suggest comfortable activities
      return activity;
    } else {
      // For less close friends, suggest shorter/casual activities
      if (activity.includes('afternoon')) return activity.replace('afternoon', 'quick');
      if (activity.includes('long')) return activity.replace('long', 'short');
      return activity;
    }
  });
  
  // Return 2-3 suggestions
  return enhancedSuggestions.slice(0, 3);
};

// Calculate priority score for sorting recommendations
const calculatePriorityScore = (friend: Friend): number => {
  const daysSince = daysSinceLastHangout(friend.lastHangout);
  const recommendedFreq = getRecommendedFrequency(friend.closeness);
  
  // Higher score = higher priority
  const timeScore = daysSince / recommendedFreq; // How overdue is this hangout?
  const closenessScore = friend.closeness / 10; // How close are you?
  
  return timeScore * 0.7 + closenessScore * 0.3;
};

// Generate recommendations for all friends
export const generateRecommendations = async (
  friends: Friend[],
  hangoutLabels: HangoutLabel[],
  settings: AppSettings
): Promise<HangoutRecommendation[]> => {
  const recommendations: HangoutRecommendation[] = [];
  
  for (const friend of friends) {
    const daysSince = daysSinceLastHangout(friend.lastHangout);
    const recommendedFreq = getRecommendedFrequency(friend.closeness);
    
    // Only recommend if it's been long enough since last hangout
    if (daysSince >= recommendedFreq) {
      const activities = generateActivitySuggestions(friend, hangoutLabels);
      
      // Calculate next hangout date (within next week, weighted by closeness)
      const nextDate = new Date();
      const daysToAdd = friend.closeness >= 7 ? 
        Math.floor(Math.random() * 3) + 1 : // 1-3 days for close friends
        Math.floor(Math.random() * 7) + 1;   // 1-7 days for others
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      
      // Generate reason based on timing and closeness
      let reason: string;
      if (daysSince >= recommendedFreq * 2) {
        reason = `It's been ${daysSince} days since you last hung out - time to reconnect!`;
      } else if (friend.closeness >= 8) {
        reason = `You're very close friends - regular hangouts keep the friendship strong!`;
      } else if (friend.closeness >= 6) {
        reason = `Based on your friendship level, it's a good time to catch up.`;
      } else {
        reason = `A casual hangout would be nice to maintain your connection.`;
      }
      
      recommendations.push({
        friend,
        suggestedActivities: activities,
        nextHangoutDate: nextDate.toISOString().split('T')[0],
        reason
      });
    }
  }
  
  // Sort by priority (highest score first)
  const sortedRecommendations = recommendations.sort((a, b) => {
    const scoreA = calculatePriorityScore(a.friend);
    const scoreB = calculatePriorityScore(b.friend);
    return scoreB - scoreA;
  });

  // Limit recommendations based on weekly hangout target
  // Show at most the weekly target number of recommendations
  const weeklyLimit = Math.max(1, settings.weeklyHangoutTarget);
  return sortedRecommendations.slice(0, weeklyLimit);
};

// Update friend's last hangout date
export const updateLastHangout = (friend: Friend, date: string): Friend => {
  return {
    ...friend,
    lastHangout: date
  };
};

// Get next recommended hangout date for a specific friend
export const getNextHangoutDate = (friend: Friend): string => {
  const daysSince = daysSinceLastHangout(friend.lastHangout);
  const recommendedFreq = getRecommendedFrequency(friend.closeness);
  
  if (daysSince >= recommendedFreq) {
    // Overdue - suggest soon
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + Math.floor(Math.random() * 3) + 1);
    return nextDate.toISOString().split('T')[0];
  } else {
    // Calculate when next hangout should be
    const nextDate = new Date(friend.lastHangout || new Date());
    nextDate.setDate(nextDate.getDate() + recommendedFreq);
    return nextDate.toISOString().split('T')[0];
  }
};

// AI Integration placeholder for future enhancement
export const AI_CONFIG = {
  apiEndpoint: process.env.REACT_APP_AI_API_ENDPOINT || '',
  apiKey: process.env.REACT_APP_AI_API_KEY || '',
  model: process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo'
};

// Future AI integration function
export const getAIActivityRecommendations = async (
  friendName: string,
  preferences: string[],
  closeness: number,
  location?: string
): Promise<string[]> => {
  // This would be replaced with actual AI API call in the future
  // For now, fall back to our algorithm
  const mockFriend: Friend = {
    id: 'temp',
    name: friendName,
    hangoutPreferences: preferences,
    closeness
  };
  
  return generateActivitySuggestions(mockFriend, []);
};
