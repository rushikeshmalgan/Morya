// lib/haptics.ts — Haptic vibration, Web Audio festive chimes, and browser notification alerts

/**
 * Trigger vibration patterns on supported devices (Android, Chrome, Firefox, Progressive Web Apps)
 */
export function triggerHaptic(
  type: "detected" | "in_range" | "discovery" | "tap" | "warning" = "detected"
) {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    switch (type) {
      case "detected":
        // Double alert pulse when entering 1km radius: buzz-pause-buzz
        navigator.vibrate([160, 90, 160]);
        break;
      case "in_range":
        // Celebratory rhythm when within check-in radius (<= 150m)
        navigator.vibrate([220, 80, 220, 80, 350]);
        break;
      case "discovery":
        // Grand celebration pattern on unlocking Bappa
        navigator.vibrate([100, 50, 100, 50, 180, 60, 300]);
        break;
      case "tap":
        navigator.vibrate(30);
        break;
      case "warning":
        navigator.vibrate([300, 100, 300]);
        break;
    }
  } catch {
    // Vibration blocked or unsupported
  }
}

/**
 * Play a synthesized temple chime (Ghanta bell harmonic chime) via Web Audio API
 * No external mp3/wav files required; zero latency, offline-ready
 */
export function playFestiveChime(type: "detected" | "in_range" | "discovery" = "detected") {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    if (type === "in_range") {
      // Harmonic twin-bell chime (Higher pitch: E5 -> G5)
      const frequencies = [659.25, 783.99, 1318.5]; // E5, G5, E6
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.25 / (i + 1), now + i * 0.08);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.2);
      });
    } else if (type === "detected") {
      // Gentle temple bell resonance (A4 -> C#5)
      const frequencies = [440, 554.37, 880];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.2 / (i + 1), now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start(now);
        osc.stop(now + 1.0);
      });
    } else {
      // Discovery fanfare (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, now + i * 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 1.4);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 1.4);
      });
    }
  } catch {
    // AudioContext autoplay restrictions or unsupported
  }
}

/**
 * Request notification permission from browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

/**
 * Trigger browser system notification
 */
export function sendPandalNotification(title: string, body: string, icon = "/icon-192.png") {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon,
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
        tag: "pandal-proximity",
      } as NotificationOptions);
    } catch {
      // Fallback
    }
  }
}
