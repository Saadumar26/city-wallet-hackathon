import type { ContextState } from "@workspace/api-zod";
import { getStuttgartWeather } from "./weatherService";
import { simulateMerchantDemand } from "./payoneSimulator";
import { getDefaultMerchant } from "../lib/store";

function periodFromHour(hour: number): string {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export async function buildContextState(): Promise<ContextState> {
  const merchant = getDefaultMerchant();
  const weather = await getStuttgartWeather();
  const demand = simulateMerchantDemand(
    merchant.id,
    merchant.rules.volumeThreshold,
  );
  const hour = new Date().getHours();

  return {
    weather,
    location: { city: "Stuttgart", district: "Altstadt" },
    time: { hour, period: periodFromHour(hour) },
    merchantDemand: demand,
    userBehavior: "browsing",
  };
}
