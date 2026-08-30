// lib/mushak.ts — Centralized Mushak Maharaj personality, dialogue engine, and frequency control

export type MushakMood =
  | "idle"
  | "happy"
  | "excited"
  | "curious"
  | "thinking"
  | "celebrating"
  | "warning"
  | "searching"
  | "pointing"
  | "proud";

export type MushakContext =
  | "onboarding_welcome"
  | "onboarding_identity"
  | "onboarding_ready"
  | "map_idle"
  | "nearby_detected"
  | "nearby_approaching"
  | "nearby_in_range"
  | "navigation_start"
  | "navigation_enroute"
  | "navigation_arrived"
  | "discovery_moment"
  | "photo_prompt"
  | "photo_success"
  | "quest_mission"
  | "quest_complete"
  | "journey_empty"
  | "journey_milestone"
  | "rank_cheer"
  | "add_pandal_start"
  | "add_pandal_success"
  | "empty_radar"
  | "radar_scanning"
  | "radar_found"
  | "error";

export interface MushakDialogue {
  title?: string;
  message: string;
  mood: MushakMood;
  actionText?: string;
}

const DIALOGUES: Record<MushakContext, MushakDialogue[]> = {
  onboarding_welcome: [
    {
      title: "Arre bhau! 👀",
      message: "I'm Mushak Maharaj. Bappa has sent us on a city-wide pandal hunt!",
      mood: "excited",
    },
  ],
  onboarding_identity: [
    {
      title: "Identity Unlocked! 🐘",
      message: "This is your explorer identity. Wear it with pride across Maharashtra!",
      mood: "proud",
    },
  ],
  onboarding_ready: [
    {
      title: "Let's Go! 🪷",
      message: "Enable GPS so we can track down your very first Bappa!",
      mood: "pointing",
      actionText: "Enable GPS",
    },
  ],
  map_idle: [
    {
      message: "Explore the streets to uncover hidden Bappas!",
      mood: "idle",
    },
  ],
  nearby_detected: [
    {
      title: "Wait... 👀",
      message: "I smell sweet modaks! A Bappa is somewhere nearby within 2 km.",
      mood: "curious",
    },
  ],
  nearby_approaching: [
    {
      title: "AYOOO! 🔥",
      message: "Getting closer! Follow the festive vibes — Bappa is just ahead.",
      mood: "excited",
    },
  ],
  nearby_in_range: [
    {
      title: "BAPPA IS HERE! 🐘",
      message: "We're right at the pandal! Tap below to unlock and receive darshan!",
      mood: "celebrating",
      actionText: "Discover Bappa",
    },
  ],
  navigation_start: [
    {
      title: "Follow me! 🧭",
      message: "Shortest route mapped out! Follow the saffron path to find Bappa.",
      mood: "pointing",
    },
  ],
  navigation_enroute: [
    {
      message: "You're going the right way! Bappa awaits just down the road.",
      mood: "happy",
    },
  ],
  navigation_arrived: [
    {
      title: "WE MADE IT! 🐘",
      message: "Right at Bappa's feet. Time for darshan!",
      mood: "celebrating",
    },
  ],
  discovery_moment: [
    {
      title: "GANPATI BAPPA MORYA! 🎉",
      message: "You unlocked this pandal! Points added to your explorer journey.",
      mood: "celebrating",
    },
  ],
  photo_prompt: [
    {
      title: "Capture the moment? 📸",
      message: "Take a beautiful photo for Bappa Lens and save it in your festival album!",
      mood: "excited",
    },
  ],
  photo_success: [
    {
      title: "Darshan Captured! ✨",
      message: "Moment saved to your Journey! Other explorers can admire it soon.",
      mood: "happy",
    },
  ],
  quest_mission: [
    {
      title: "Today's Mission 🎯",
      message: "Complete today's hunt to earn bonus XP and boost your rank!",
      mood: "pointing",
    },
  ],
  quest_complete: [
    {
      title: "Mission Accomplished! 🔥",
      message: "You crushed today's quest. Mushak Maharaj is super proud of you!",
      mood: "proud",
    },
  ],
  journey_empty: [
    {
      title: "No Bappas discovered yet 🪷",
      message: "Step outside, follow the map, and start your darshan album!",
      mood: "curious",
    },
  ],
  journey_milestone: [
    {
      title: "Look at your collection! 👑",
      message: "You've visited iconic pandals across the city. Keep the streak alive!",
      mood: "celebrating",
    },
  ],
  rank_cheer: [
    {
      title: "Climbing the ranks! 🏆",
      message: "Every pandal you discover pushes you higher on the leaderboard.",
      mood: "proud",
    },
  ],
  add_pandal_start: [
    {
      title: "Found a hidden Bappa? 📍",
      message: "Help the community by marking this pandal so fellow explorers can visit!",
      mood: "curious",
    },
  ],
  add_pandal_success: [
    {
      title: "Pandal Pioneer! 🌟",
      message: "Submitted! Once reviewed by moderators, it'll appear for all explorers.",
      mood: "celebrating",
    },
  ],
  empty_radar: [
    {
      title: "Quiet on the radar 👀",
      message: "No pandals nearby yet. Try exploring another street or add one yourself!",
      mood: "thinking",
    },
  ],
  radar_scanning: [
    {
      title: "Sniffing for modaks... 👃",
      message: "Scanning nearby streets and alleys for Bappas...",
      mood: "searching",
    },
  ],
  radar_found: [
    {
      title: "Bappas on Radar! 🎯",
      message: "Spotted pandals in your area. Follow the map to discover them!",
      mood: "excited",
    },
  ],
  error: [
    {
      title: "Arre re! 🐾",
      message: "Something tripped us up. Let's try that again in a moment.",
      mood: "warning",
    },
  ],
};

/**
 * Get a contextual dialogue for Mushak
 */
export function getMushakDialogue(
  context: MushakContext,
  customParam?: string | number
): MushakDialogue {
  const list = DIALOGUES[context] || DIALOGUES.map_idle;
  const base = list[Math.floor(Math.random() * list.length)];

  if (customParam !== undefined && typeof customParam === "string") {
    return {
      ...base,
      message: base.message.replace(/\{param\}/g, customParam),
    };
  }

  return base;
}

const SETTINGS_KEY = "bappa_mushak_settings";

export interface MushakSettings {
  tipsEnabled: boolean;
  lastShownTimestamps: Record<string, number>;
}

export function getMushakSettings(): MushakSettings {
  if (typeof window === "undefined") {
    return { tipsEnabled: true, lastShownTimestamps: {} };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { tipsEnabled: true, lastShownTimestamps: {} };
  } catch {
    return { tipsEnabled: true, lastShownTimestamps: {} };
  }
}

export function setMushakTipsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  const current = getMushakSettings();
  current.tipsEnabled = enabled;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(current));
}

/**
 * Frequency throttling: Check if a tip should be shown to avoid spamming the user
 */
export function shouldShowMushakTip(
  contextKey: string,
  minIntervalMs: number = 45000 // 45s default throttle
): boolean {
  if (typeof window === "undefined") return false;
  const settings = getMushakSettings();
  if (!settings.tipsEnabled) return false;

  const now = Date.now();
  const lastTime = settings.lastShownTimestamps[contextKey] || 0;

  if (now - lastTime >= minIntervalMs) {
    settings.lastShownTimestamps[contextKey] = now;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  }

  return false;
}
