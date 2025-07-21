export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  description?: string;
  birthday?: string;
  anniversary?: string;
  closeness: number; // 1-10 scale
  lastHangout?: string;
  hangoutPreferences: string[];
  isRemote?: boolean; // Whether this is a remote friend
  location?: string; // City/location for remote friends
  connectionPreferences?: string[]; // Preferred ways to connect remotely
}

export interface HangoutLabel {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface HangoutRecommendation {
  friend: Friend;
  suggestedActivities: string[];
  nextHangoutDate: string;
  reason: string;
}

export interface AppSettings {
  weeklyHangoutTarget: number; // How many hangouts per week user wants
  preferredDays: string[]; // Days of week user prefers to hang out
}

export interface AppState {
  friends: Friend[];
  hangoutLabels: HangoutLabel[];
  recommendations: HangoutRecommendation[];
  settings: AppSettings;
}
