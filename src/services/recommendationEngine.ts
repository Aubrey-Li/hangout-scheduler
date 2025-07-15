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

  // If we don't have enough suggestions, add some from other categories
  if (suggestions.length < 2) {
    const allActivityKeys = Object.keys(activitySuggestions);
    const unusedCategories = allActivityKeys.filter(key => !hangoutPreferences.includes(key));
    
    while (suggestions.length < 3 && unusedCategories.length > 0) {
      const randomCategory = unusedCategories.splice(Math.floor(Math.random() * unusedCategories.length), 1)[0];
      const activities = activitySuggestions[randomCategory] || [];
      if (activities.length > 0) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        suggestions.push(randomActivity);
      }
    }
  }
  
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

// Helper function to find next preferred day that's not already taken
const getNextAvailablePreferredDay = (
  preferredDays: string[], 
  startDate: Date, 
  maxDays: number, 
  usedDates: Set<string>
): Date => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // If no preferred days set, find any available day within the range
  if (preferredDays.length === 0) {
    for (let i = 1; i <= maxDays; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (!usedDates.has(dateStr)) {
        return checkDate;
      }
    }
    // If all days are taken, return a random day (this shouldn't happen often)
    const randomDays = Math.floor(Math.random() * maxDays) + 1;
    const result = new Date(startDate);
    result.setDate(startDate.getDate() + randomDays);
    return result;
  }
  
  // Find next occurrence of a preferred day that's not already taken
  for (let i = 1; i <= maxDays; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    const dayName = dayNames[checkDate.getDay()];
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (preferredDays.includes(dayName) && !usedDates.has(dateStr)) {
      return checkDate;
    }
  }
  
  // If no preferred day is available, find any available day
  for (let i = 1; i <= maxDays; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (!usedDates.has(dateStr)) {
      return checkDate;
    }
  }
  
  // If all days are taken within the preferred range, try extending the search slightly
  for (let i = maxDays + 1; i <= maxDays + 7; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (!usedDates.has(dateStr)) {
      return checkDate;
    }
  }
  
  // Final fallback - return a random day (this should rarely happen)
  const randomDays = Math.floor(Math.random() * maxDays) + 1;
  const result = new Date(startDate);
  result.setDate(startDate.getDate() + randomDays);
  return result;
};

// Generate recommendations for all friends
export const generateRecommendations = async (
  friends: Friend[],
  hangoutLabels: HangoutLabel[],
  settings: AppSettings,
  forceRefresh: boolean = false
): Promise<HangoutRecommendation[]> => {
  const recommendations: HangoutRecommendation[] = [];
  const usedDates = new Set<string>(); // Track already assigned dates
  
  for (const friend of friends) {
    const daysSince = daysSinceLastHangout(friend.lastHangout);
    const recommendedFreq = getRecommendedFrequency(friend.closeness);
    
    // More flexible criteria for recommendations
    const shouldRecommend = forceRefresh || 
      daysSince >= recommendedFreq || 
      daysSince >= recommendedFreq * 0.7; // 70% of recommended frequency
    
    if (shouldRecommend) {
      const activities = generateActivitySuggestions(friend, hangoutLabels);
      
      // Calculate next hangout date (within next 2 weeks, considering preferred days and avoiding conflicts)
      const nextDate = new Date();
      
      // Prioritize closer friends for earlier dates
      const maxDaysForFriend = friend.closeness >= 7 ? 7 : 14; // Close friends: 1 week, others: 2 weeks
      const scheduledDate = getNextAvailablePreferredDay(settings.preferredDays, nextDate, maxDaysForFriend, usedDates);
      
      // Mark this date as used
      const dateStr = scheduledDate.toISOString().split('T')[0];
      usedDates.add(dateStr);
      
      // Generate reason based on timing and closeness
      let reason: string;
      if (daysSince >= recommendedFreq * 2) {
        reason = `It's been ${daysSince} days since you last hung out - time to reconnect!`;
      } else if (daysSince >= recommendedFreq) {
        reason = `It's been ${daysSince} days since you last hung out - time to reconnect!`;
      } else if (forceRefresh) {
        reason = `It's been ${daysSince} days since you last hung out. A hangout would be nice!`;
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
        nextHangoutDate: dateStr,
        reason
      });
    }
  }
  
  // Sort by priority (highest score first) and then by date (earlier first)
  const sortedRecommendations = recommendations.sort((a, b) => {
    const scoreA = calculatePriorityScore(a.friend);
    const scoreB = calculatePriorityScore(b.friend);
    
    // Primary sort: by priority score
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // Secondary sort: by date (earlier dates first)
    const dateA = new Date(a.nextHangoutDate);
    const dateB = new Date(b.nextHangoutDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Respect weekly hangout target by distributing recommendations across 2 weeks
  const maxRecommendations = forceRefresh ? 
    Math.min(settings.weeklyHangoutTarget * 2, 8) : // Max 2 weeks worth, cap at 8
    Math.max(1, settings.weeklyHangoutTarget);
  
  // Further filter to ensure we don't exceed weekly target in any given week
  const finalRecommendations: HangoutRecommendation[] = [];
  const weeklyCount = { week1: 0, week2: 0 };
  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  for (const rec of sortedRecommendations) {
    if (finalRecommendations.length >= maxRecommendations) break;
    
    const recDate = new Date(rec.nextHangoutDate);
    const isWeek1 = recDate <= oneWeekFromNow;
    
    // Since dates are already unique and optimally distributed, we can be more flexible with weekly limits
    if (isWeek1 && weeklyCount.week1 < settings.weeklyHangoutTarget) {
      finalRecommendations.push(rec);
      weeklyCount.week1++;
    } else if (!isWeek1 && weeklyCount.week2 < settings.weeklyHangoutTarget) {
      finalRecommendations.push(rec);
      weeklyCount.week2++;
    } else if (forceRefresh && finalRecommendations.length < maxRecommendations) {
      // For force refresh, allow some flexibility with weekly limits since dates don't overlap
      finalRecommendations.push(rec);
      if (isWeek1) {
        weeklyCount.week1++;
      } else {
        weeklyCount.week2++;
      }
    }
  }
  
  return finalRecommendations;
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
