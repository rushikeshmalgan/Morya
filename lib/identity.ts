// lib/identity.ts — Auto-generated Bappa identity system

const TITLES = [
  "Pandal Hunter",
  "Morya Explorer",
  "Modak Warrior",
  "Bappa Bhakt",
  "Ganpati Yatri",
  "Morya Master",
  "Dhol Tasha Warrior",
  "Pandal Pro",
  "Bappa Explorer",
  "Modak Maharaj",
  "Bappa Nomad",
  "Morya Wanderer",
  "Ganesh Seeker",
  "Bappa Chaser",
  "Festival Ranger",
  "Morya Knight",
  "Dhol Warrior",
  "Bappa Scout",
  "Ganpati Guardian",
  "Morya Pilgrim",
];

/**
 * Generate a random Bappa identity name
 */
export function generateBappaIdentity(): {
  generatedName: string;
  generatedNumber: number;
} {
  const generatedName = TITLES[Math.floor(Math.random() * TITLES.length)];
  const generatedNumber = Math.floor(Math.random() * 9000) + 1000;
  return { generatedName, generatedNumber };
}

/**
 * Format display name: "Morya Explorer #4821"
 */
export function formatDisplayName(name: string, number: number): string {
  return `${name} #${number}`;
}

/**
 * Generate a squad code in MORYA-XXXX format
 */
export function generateSquadCode(): string {
  const prefixes = ["MORYA", "BAPPA", "MODAK", "DHOL", "GANESH"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${suffix}`;
}
