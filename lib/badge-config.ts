// lib/badge-config.ts — Badge definitions, categories, and progress threshold metadata

export type BadgeCategory = "EXPLORATION" | "PHOTOGRAPHY" | "YATRA" | "STREAK" | "SPECIAL";
export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  threshold?: number;
  hidden?: boolean;
  sortOrder: number;
  points?: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: "FIRST_DARSHAN",
    name: "First Darshan",
    description: "Discovered your very first Ganpati pandal",
    icon: "🌸",
    category: "EXPLORATION",
    rarity: "COMMON",
    threshold: 1,
    hidden: false,
    sortOrder: 1,
    points: 10,
  },
  {
    key: "BAPPA_EXPLORER",
    name: "Bappa Explorer",
    description: "Discovered 5 unique Ganpati pandals",
    icon: "🐘",
    category: "EXPLORATION",
    rarity: "COMMON",
    threshold: 5,
    hidden: false,
    sortOrder: 2,
    points: 25,
  },
  {
    key: "PANDAL_HOPPER",
    name: "Pandal Hopper",
    description: "Discovered 10 unique Ganpati pandals",
    icon: "🪷",
    category: "EXPLORATION",
    rarity: "RARE",
    threshold: 10,
    hidden: false,
    sortOrder: 3,
    points: 50,
  },
  {
    key: "MORYA_MASTER",
    name: "Morya Master",
    description: "Discovered 25 unique Ganpati pandals",
    icon: "👑",
    category: "EXPLORATION",
    rarity: "EPIC",
    threshold: 25,
    hidden: false,
    sortOrder: 4,
    points: 100,
  },
  {
    key: "CITY_EXPLORER",
    name: "City Explorer",
    description: "Discovered 10 unique Ganpati pandals in a single city",
    icon: "🏙️",
    category: "EXPLORATION",
    rarity: "RARE",
    threshold: 10,
    hidden: false,
    sortOrder: 5,
    points: 75,
  },
  {
    key: "LEGENDARY_DARSHAN",
    name: "Legendary Darshan",
    description: "Discovered an iconic or famous historic pandal",
    icon: "⭐",
    category: "EXPLORATION",
    rarity: "LEGENDARY",
    threshold: 1,
    hidden: false,
    sortOrder: 6,
    points: 50,
  },
  {
    key: "BAPPA_PHOTOGRAPHER",
    name: "Bappa Photographer",
    description: "Have 5 approved Bappa Lens photo uploads",
    icon: "📸",
    category: "PHOTOGRAPHY",
    rarity: "RARE",
    threshold: 5,
    hidden: false,
    sortOrder: 7,
    points: 50,
  },
  {
    key: "LENS_LEGEND",
    name: "Lens Legend",
    description: "Had a photo awarded Photo of the Day status",
    icon: "✨",
    category: "PHOTOGRAPHY",
    rarity: "LEGENDARY",
    threshold: 1,
    hidden: false,
    sortOrder: 8,
    points: 100,
  },
  {
    key: "YATRA_ROOKIE",
    name: "Yatra Rookie",
    description: "Completed your first multi-pandal Darshan Yatra route",
    icon: "🚩",
    category: "YATRA",
    rarity: "COMMON",
    threshold: 1,
    hidden: false,
    sortOrder: 9,
    points: 30,
  },
  {
    key: "YATRA_MASTER",
    name: "Yatra Master",
    description: "Completed 5 multi-pandal Darshan Yatra routes",
    icon: "🎯",
    category: "YATRA",
    rarity: "EPIC",
    threshold: 5,
    hidden: false,
    sortOrder: 10,
    points: 150,
  },
  {
    key: "THREE_DAY_MORYA",
    name: "3-Day Morya",
    description: "Reached a 3-day consecutive darshan check-in streak",
    icon: "🔥",
    category: "STREAK",
    rarity: "RARE",
    threshold: 3,
    hidden: false,
    sortOrder: 11,
    points: 50,
  },
  {
    key: "SEVEN_DAY_MORYA",
    name: "7-Day Morya",
    description: "Reached a 7-day consecutive darshan check-in streak",
    icon: "⚡",
    category: "STREAK",
    rarity: "EPIC",
    threshold: 7,
    hidden: false,
    sortOrder: 12,
    points: 150,
  },
];
