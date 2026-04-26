export interface LocalEvents {
  hasNearbyEvent: boolean;
  eventName: string | null;
  expectedFootfall: "high" | "normal" | "low";
  distanceMeters: number;
}

const EVENT_POOL = [
  "Stuttgarter Weindorf",
  "Schlossplatz Concert",
  "Stuttgart Marathon",
  "Weihnachtsmarkt",
  "Frühlingsfest",
];

const FOOTFALL_POOL: Array<LocalEvents["expectedFootfall"]> = [
  "high",
  "normal",
  "low",
];

export function simulateLocalEvents(): LocalEvents {
  const hasNearbyEvent = Math.random() < 0.4;

  if (!hasNearbyEvent) {
    return {
      hasNearbyEvent: false,
      eventName: null,
      expectedFootfall: "normal",
      distanceMeters: 0,
    };
  }

  const eventName =
    EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)] ?? "Local Event";
  const expectedFootfall =
    FOOTFALL_POOL[Math.floor(Math.random() * FOOTFALL_POOL.length)] ?? "normal";
  const distanceMeters = Math.floor(Math.random() * 401) + 100; // 100-500

  return {
    hasNearbyEvent: true,
    eventName,
    expectedFootfall,
    distanceMeters,
  };
}
