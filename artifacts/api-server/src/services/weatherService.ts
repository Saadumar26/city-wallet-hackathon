import { logger } from "../lib/logger";
import { CITY_CONFIG } from "../config/cityConfig";

interface Weather {
  temp: number;
  condition: string;
  feelsLike: number;
}

const FALLBACK: Weather = { temp: 9, condition: "overcast", feelsLike: 6 };

export async function getStuttgartWeather(): Promise<Weather> {
  const key = process.env["OPENWEATHER_API_KEY"];
  if (!key) {
    logger.warn("OPENWEATHER_API_KEY not set, returning fallback weather");
    return FALLBACK;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_CONFIG.lat}&lon=${CITY_CONFIG.lon}&appid=${key}&units=metric`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      logger.warn({ status: res.status }, "Weather API non-200");
      return FALLBACK;
    }
    const data = (await res.json()) as {
      main?: { temp?: number; feels_like?: number };
      weather?: Array<{ description?: string; main?: string }>;
    };
    const condition =
      data.weather?.[0]?.description ?? data.weather?.[0]?.main ?? "overcast";
    return {
      temp: Math.round(data.main?.temp ?? FALLBACK.temp),
      condition,
      feelsLike: Math.round(data.main?.feels_like ?? FALLBACK.feelsLike),
    };
  } catch (err) {
    logger.warn({ err }, "Weather fetch failed, returning fallback");
    return FALLBACK;
  }
}
