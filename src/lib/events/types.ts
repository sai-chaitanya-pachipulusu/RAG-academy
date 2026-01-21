export type EventType = 
  | "weekly_challenge"      // Featured challenge with bonus XP
  | "paper_of_the_week"     // Featured research paper
  | "community_challenge"   // User-submitted challenge
  | "workshop"              // Live/recorded workshop
  | "study_group";          // Group study session topic

export type EventStatus = "upcoming" | "active" | "ended";

export interface WeeklyEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  startDate: string;  // ISO date
  endDate: string;    // ISO date
  
  // Type-specific data
  challengeSlug?: string;      // For weekly_challenge
  paperUrl?: string;           // For paper_of_the_week
  paperId?: string;            // Reference to readingList
  workshopUrl?: string;        // For workshop recordings
  
  // Rewards
  xpBonus?: number;            // Extra XP for participation
  badgeId?: string;            // Special badge for completion
  
  // Display
  bannerColor?: string;        // Custom banner color
  icon?: string;               // Emoji icon
}

export interface EventsState {
  currentWeekStart: string;    // ISO date of week start
  events: WeeklyEvent[];
}
