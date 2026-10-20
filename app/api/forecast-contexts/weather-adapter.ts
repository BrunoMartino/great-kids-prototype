export type PreviousWeatherInput = {
  path: string;
};

export interface WeatherPathFnProtocol {
  (p_input: PreviousWeatherInput): string;
}

export interface WeatherPathProtocol {
  readPreviousWeather: WeatherPathFnProtocol;
}

export class WeatherAdapter implements WeatherPathProtocol {
  public readPreviousWeather(p_input: PreviousWeatherInput): string {
    return p_input.path;
  }

  public static readPreviousWeather(p_input: PreviousWeatherInput): string {
    const adapter: WeatherAdapter = new WeatherAdapter();
    return adapter.readPreviousWeather(p_input);
  }
}
