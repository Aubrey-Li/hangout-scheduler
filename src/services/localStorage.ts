import { Friend, HangoutLabel, AppState, AppSettings } from '../types/index';

const STORAGE_KEYS = {
  FRIENDS: 'hangout-scheduler-friends',
  HANGOUT_LABELS: 'hangout-scheduler-labels',
  APP_STATE: 'hangout-scheduler-state',
  SETTINGS: 'hangout-scheduler-settings'
};

// Default hangout labels
const DEFAULT_LABELS: HangoutLabel[] = [
  { id: '1', name: 'Dining', color: '#EF4444' },
  { id: '2', name: 'Coffee', color: '#8B5CF6' },
  { id: '3', name: 'Museums', color: '#10B981' },
  { id: '4', name: 'Bars', color: '#F59E0B' },
  { id: '5', name: 'Neighborhood Walk', color: '#3B82F6' },
  { id: '6', name: 'Movies', color: '#EC4899' },
  { id: '7', name: 'Shopping', color: '#6B7280' },
  { id: '8', name: 'Sports', color: '#14B8A6' }
];

// No sample friends - start with clean slate

// Default app settings
const DEFAULT_SETTINGS: AppSettings = {
  weeklyHangoutTarget: 2, // Default to 2 hangouts per week
  preferredDays: ['Friday', 'Saturday', 'Sunday'] // Default to weekends
};

// Generic storage utilities
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    // Try to clear some space and retry once
    try {
      localStorage.removeItem('hangout-scheduler-auto-backups');
      localStorage.setItem(key, JSON.stringify(data));
    } catch (finalError) {
      console.error(`Final save attempt failed for ${key}:`, finalError);
    }
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Friend operations
export const saveFriends = (friends: Friend[]): void => {
  saveToStorage(STORAGE_KEYS.FRIENDS, friends);
};

export const loadFriends = (): Friend[] => {
  return loadFromStorage<Friend[]>(STORAGE_KEYS.FRIENDS, []);
};

export const addFriend = (friend: Omit<Friend, 'id'>): Friend => {
  const friends = loadFriends();
  const newFriend: Friend = {
    ...friend,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  const updatedFriends = [...friends, newFriend];
  saveFriends(updatedFriends);
  return newFriend;
};

export const updateFriend = (friendId: string, updates: Partial<Friend>): Friend | null => {
  const friends = loadFriends();
  const friendIndex = friends.findIndex(f => f.id === friendId);
  
  if (friendIndex === -1) return null;
  
  const updatedFriend = { ...friends[friendIndex], ...updates };
  friends[friendIndex] = updatedFriend;
  saveFriends(friends);
  return updatedFriend;
};

export const deleteFriend = (friendId: string): boolean => {
  const friends = loadFriends();
  const filteredFriends = friends.filter(f => f.id !== friendId);
  
  if (filteredFriends.length === friends.length) return false;
  
  saveFriends(filteredFriends);
  return true;
};

// Hangout label operations
export const saveHangoutLabels = (labels: HangoutLabel[]): void => {
  saveToStorage(STORAGE_KEYS.HANGOUT_LABELS, labels);
};

export const loadHangoutLabels = (): HangoutLabel[] => {
  const labels = loadFromStorage<HangoutLabel[]>(STORAGE_KEYS.HANGOUT_LABELS, []);
  // If no labels exist, load default labels
  if (labels.length === 0) {
    saveHangoutLabels(DEFAULT_LABELS);
    return DEFAULT_LABELS;
  }
  return labels;
};

export const addHangoutLabel = (label: Omit<HangoutLabel, 'id'>): HangoutLabel => {
  const labels = loadHangoutLabels();
  const newLabel: HangoutLabel = {
    ...label,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  const updatedLabels = [...labels, newLabel];
  saveHangoutLabels(updatedLabels);
  return newLabel;
};

export const updateHangoutLabel = (labelId: string, updates: Partial<HangoutLabel>): HangoutLabel | null => {
  const labels = loadHangoutLabels();
  const labelIndex = labels.findIndex(l => l.id === labelId);
  
  if (labelIndex === -1) return null;
  
  const updatedLabel = { ...labels[labelIndex], ...updates };
  labels[labelIndex] = updatedLabel;
  saveHangoutLabels(labels);
  return updatedLabel;
};

export const deleteHangoutLabel = (labelId: string): boolean => {
  const labels = loadHangoutLabels();
  const filteredLabels = labels.filter(l => l.id !== labelId);
  
  if (filteredLabels.length === labels.length) return false;
  
  saveHangoutLabels(filteredLabels);
  return true;
};

// Settings operations
export const saveSettings = (settings: AppSettings): void => {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = (): AppSettings => {
  return loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const updateSettings = (updates: Partial<AppSettings>): AppSettings => {
  const currentSettings = loadSettings();
  const newSettings = { ...currentSettings, ...updates };
  saveSettings(newSettings);
  return newSettings;
};

// App state operations
export const saveAppState = (state: AppState): void => {
  saveToStorage(STORAGE_KEYS.APP_STATE, state);
};

export const loadAppState = (): AppState => {
  const friends = loadFriends();
  const hangoutLabels = loadHangoutLabels();
  const settings = loadSettings();
  
  return {
    friends,
    hangoutLabels,
    recommendations: [], // Recommendations are generated on-demand
    settings
  };
};

// Utility to reset all data (for testing/development)
export const resetAppData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.FRIENDS);
  localStorage.removeItem(STORAGE_KEYS.HANGOUT_LABELS);
  localStorage.removeItem(STORAGE_KEYS.APP_STATE);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};

// Data export/import for backup and restore
export const exportData = () => {
  const data = {
    friends: loadFriends(),
    hangoutLabels: loadHangoutLabels(),
    settings: loadSettings(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hangout-scheduler-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.friends || !data.hangoutLabels || !data.settings) {
          throw new Error('Invalid backup file format');
        }
        
        // Backup current data before import
        const backup = {
          friends: loadFriends(),
          hangoutLabels: loadHangoutLabels(),
          settings: loadSettings()
        };
        
        try {
          // Import data
          saveFriends(data.friends);
          saveHangoutLabels(data.hangoutLabels);
          saveSettings(data.settings);
          
          // Save backup for potential rollback
          saveToStorage('hangout-scheduler-backup', backup);
          
          resolve(true);
        } catch (importError) {
          // Rollback on error
          console.error('Import failed, rolling back:', importError);
          saveFriends(backup.friends);
          saveHangoutLabels(backup.hangoutLabels);
          saveSettings(backup.settings);
          reject(importError);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Auto-backup functionality
export const createAutoBackup = () => {
  const backupData = {
    friends: loadFriends(),
    hangoutLabels: loadHangoutLabels(),
    settings: loadSettings(),
    timestamp: new Date().toISOString()
  };
  
  // Keep last 5 auto-backups
  const backups = loadFromStorage<any[]>('hangout-scheduler-auto-backups', []);
  backups.push(backupData);
  
  if (backups.length > 5) {
    backups.shift(); // Remove oldest backup
  }
  
  saveToStorage('hangout-scheduler-auto-backups', backups);
};

// This section was moved up to replace the old saveToStorage function

// Export for debugging
export const getStorageInfo = () => {
  const totalSize = new Blob([JSON.stringify(loadAppState())]).size;
  const quotaEstimate = navigator.storage?.estimate ? navigator.storage.estimate() : null;
  
  return {
    friends: loadFriends(),
    labels: loadHangoutLabels(),
    settings: loadSettings(),
    storageSize: totalSize,
    quotaEstimate,
    autoBackups: loadFromStorage('hangout-scheduler-auto-backups', []).length
  };
};

// Data validation
export const validateData = () => {
  const issues: string[] = [];
  
  try {
    const friends = loadFriends();
    const labels = loadHangoutLabels();
    const settings = loadSettings();
    
    // Validate friends
    friends.forEach((friend, index) => {
      if (!friend.id || !friend.name) {
        issues.push(`Friend ${index} missing required fields`);
      }
      if (friend.closeness < 1 || friend.closeness > 10) {
        issues.push(`Friend ${friend.name} has invalid closeness: ${friend.closeness}`);
      }
    });
    
    // Validate labels
    labels.forEach((label, index) => {
      if (!label.id || !label.name) {
        issues.push(`Label ${index} missing required fields`);
      }
    });
    
    // Validate settings
    if (settings.weeklyHangoutTarget < 1 || settings.weeklyHangoutTarget > 10) {
      issues.push(`Invalid weekly hangout target: ${settings.weeklyHangoutTarget}`);
    }
    
  } catch (error) {
    issues.push(`Data validation error: ${error}`);
  }
  
  return issues;
};
