// lib/score-config.ts — Configurable score and XP rules for Bappa Mode

export const SCORE_RULES = {
  PANDAL_DISCOVERY: 50,
  RARE_PANDAL_DISCOVERY: 100,
  FIRST_DISCOVERY_OF_DAY: 20,
  DISCOVER_3_SAME_DAY: 75,
  PHOTO_APPROVED: 20,
  PHOTO_10_VOTES: 25,
  QUEST_COMPLETED: 100,
  ROUTE_COMPLETED: 150,
  STREAK_3_DAY: 50,
  STREAK_7_DAY: 150,
  UNIQUE_PANDALS_10: 100,
} as const;

export type ScoreEventType = keyof typeof SCORE_RULES;

export interface ScoreRuleDescription {
  type: ScoreEventType;
  points: number;
  label: string;
  description: string;
}

export const SCORE_RULE_DESCRIPTIONS: Record<ScoreEventType, ScoreRuleDescription> = {
  PANDAL_DISCOVERY: {
    type: "PANDAL_DISCOVERY",
    points: SCORE_RULES.PANDAL_DISCOVERY,
    label: "Pandal Discovery",
    description: "Unlocked a standard Ganpati pandal",
  },
  RARE_PANDAL_DISCOVERY: {
    type: "RARE_PANDAL_DISCOVERY",
    points: SCORE_RULES.RARE_PANDAL_DISCOVERY,
    label: "Rare Bappa Discovery",
    description: "Unlocked an iconic or famous Ganpati pandal",
  },
  FIRST_DISCOVERY_OF_DAY: {
    type: "FIRST_DISCOVERY_OF_DAY",
    points: SCORE_RULES.FIRST_DISCOVERY_OF_DAY,
    label: "First Darshan of the Day",
    description: "Bonus for your first pandal discovery of the calendar day",
  },
  DISCOVER_3_SAME_DAY: {
    type: "DISCOVER_3_SAME_DAY",
    points: SCORE_RULES.DISCOVER_3_SAME_DAY,
    label: "Triple Darshan Bonus",
    description: "Discovered 3 pandals in a single day",
  },
  PHOTO_APPROVED: {
    type: "PHOTO_APPROVED",
    points: SCORE_RULES.PHOTO_APPROVED,
    label: "Approved Lens Photo",
    description: "Your Bappa Lens photo submission was approved by moderators",
  },
  PHOTO_10_VOTES: {
    type: "PHOTO_10_VOTES",
    points: SCORE_RULES.PHOTO_10_VOTES,
    label: "Popular Photo (10 Votes)",
    description: "Your Bappa Lens photo reached 10 community votes",
  },
  QUEST_COMPLETED: {
    type: "QUEST_COMPLETED",
    points: SCORE_RULES.QUEST_COMPLETED,
    label: "Quest Completed",
    description: "Completed a daily exploration quest",
  },
  ROUTE_COMPLETED: {
    type: "ROUTE_COMPLETED",
    points: SCORE_RULES.ROUTE_COMPLETED,
    label: "Darshan Yatra Completed",
    description: "Completed a multi-pandal walking route",
  },
  STREAK_3_DAY: {
    type: "STREAK_3_DAY",
    points: SCORE_RULES.STREAK_3_DAY,
    label: "3-Day Discovery Streak",
    description: "Maintained a 3-day consecutive darshan streak",
  },
  STREAK_7_DAY: {
    type: "STREAK_7_DAY",
    points: SCORE_RULES.STREAK_7_DAY,
    label: "7-Day Discovery Streak",
    description: "Maintained a 7-day consecutive darshan streak",
  },
  UNIQUE_PANDALS_10: {
    type: "UNIQUE_PANDALS_10",
    points: SCORE_RULES.UNIQUE_PANDALS_10,
    label: "10 Unique Pandals",
    description: "Unlocked 10 unique pandals across your journey",
  },
};
