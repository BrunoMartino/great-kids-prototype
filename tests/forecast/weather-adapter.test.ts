import { describe, expect, it } from "vitest";

describe("WeatherAdapter", () => {
  it("maps a previous_weather path as data", async () => {
    // Break: Adapter rewrites or prefixes the path.
    const { WeatherAdapter } = await import("@/app/api/forecast-contexts/weather-adapter");
    const mapped: string = WeatherAdapter.readPreviousWeather({ path: "calendar/rain.txt" });
    expect(mapped).toBe("calendar/rain.txt");
  });

  it("maps an empty path to an empty string", async () => {
    // Break: empty path becomes fabricated weather copy.
    const { WeatherAdapter } = await import("@/app/api/forecast-contexts/weather-adapter");
    const mapped: string = WeatherAdapter.readPreviousWeather({ path: "" });
    expect(mapped).toBe("");
  });

  it("does not throw for a plain path", async () => {
    // Break: Adapter performs a live weather call that throws.
    const { WeatherAdapter } = await import("@/app/api/forecast-contexts/weather-adapter");
    expect(() => {
      WeatherAdapter.readPreviousWeather({ path: "calendar/rain.txt" });
    }).not.toThrow();
  });

  it("stores a traversal-shaped path as data without IO", async () => {
    // Break: Adapter resolves the path against the filesystem or a weather API.
    const { WeatherAdapter } = await import("@/app/api/forecast-contexts/weather-adapter");
    const mapped: string = WeatherAdapter.readPreviousWeather({
      path: "weather/../../etc/passwd",
    });
    expect(mapped).toBe("weather/../../etc/passwd");
  });
});
