export type FicheValuesEnvelope = {
  id: string;
  values: string[];
};

export type FicheBuildInput = {
  description?: string;
  img_path?: string;
  duration_minutes?: number;
  age_min?: number;
  age_max?: number;
  setting?: string;
  values?: FicheValuesEnvelope | string[];
};

export type FicheBuilt = {
  title?: string | null;
  description?: string | null;
  img_path?: string | null;
  duration_minutes?: number | null;
  age_min?: number | null;
  age_max?: number | null;
  setting?: string | null;
  values?: FicheValuesEnvelope | null;
};

export class FicheBuildError extends Error {
  public constructor(p_message: string) {
    super(p_message);
    this.name = "FicheBuildError";
  }
}

export interface MealBuilderProtocol {
  withDescription(p_description: string): this;
  withImgPath(p_imgPath: string): this;
  withDurationMinutes(p_durationMinutes: number): this;
  withAgeMin(p_ageMin: number): this;
  withAgeMax(p_ageMax: number): this;
  withSetting(p_setting: string): this;
  withValues(p_values: FicheValuesEnvelope): this;
  makeFiche(): this;
}

export class FicheBuilder implements MealBuilderProtocol {
  private _description: string | undefined;
  private _imgPath: string | undefined;
  private _durationMinutes: number | undefined;
  private _ageMin: number | undefined;
  private _ageMax: number | undefined;
  private _setting: string | undefined;
  private _values: FicheValuesEnvelope | undefined;

  public constructor() {
    this._description = undefined;
    this._imgPath = undefined;
    this._durationMinutes = undefined;
    this._ageMin = undefined;
    this._ageMax = undefined;
    this._setting = undefined;
    this._values = undefined;
  }

  public withDescription(p_description: string): this {
    this._description = p_description;
    return this;
  }

  public withImgPath(p_imgPath: string): this {
    this._imgPath = p_imgPath;
    return this;
  }

  public withDurationMinutes(p_durationMinutes: number): this {
    this._durationMinutes = p_durationMinutes;
    return this;
  }

  public withAgeMin(p_ageMin: number): this {
    this._ageMin = p_ageMin;
    return this;
  }

  public withAgeMax(p_ageMax: number): this {
    this._ageMax = p_ageMax;
    return this;
  }

  public withSetting(p_setting: string): this {
    this._setting = p_setting;
    return this;
  }

  public withValues(p_values: FicheValuesEnvelope): this {
    this._values = p_values;
    return this;
  }

  public makeFiche(): this {
    if (
      this._ageMin !== undefined &&
      this._ageMax !== undefined &&
      this._ageMin > this._ageMax
    ) {
      throw new FicheBuildError("age_min greater than age_max");
    }
    return this;
  }

  public getFiche(): FicheBuilt {
    const built: FicheBuilt = {};
    if (this._description !== undefined) {
      built.description = this._description;
    }
    if (this._imgPath !== undefined) {
      built.img_path = this._imgPath;
    }
    if (this._durationMinutes !== undefined) {
      built.duration_minutes = this._durationMinutes;
    }
    if (this._ageMin !== undefined) {
      built.age_min = this._ageMin;
    }
    if (this._ageMax !== undefined) {
      built.age_max = this._ageMax;
    }
    if (this._setting !== undefined) {
      built.setting = this._setting;
    }
    if (this._values !== undefined) {
      built.values = this._values;
    }
    return built;
  }

  public static build(p_input: FicheBuildInput): FicheBuilt {
    const builder: FicheBuilder = new FicheBuilder();
    if (p_input.description !== undefined) {
      builder.withDescription(p_input.description);
    }
    if (p_input.img_path !== undefined) {
      builder.withImgPath(p_input.img_path);
    }
    if (p_input.duration_minutes !== undefined) {
      builder.withDurationMinutes(p_input.duration_minutes);
    }
    if (p_input.age_min !== undefined) {
      builder.withAgeMin(p_input.age_min);
    }
    if (p_input.age_max !== undefined) {
      builder.withAgeMax(p_input.age_max);
    }
    if (p_input.setting !== undefined) {
      builder.withSetting(p_input.setting);
    }
    if (p_input.values !== undefined) {
      if (Array.isArray(p_input.values)) {
        throw new FicheBuildError("values must be envelope");
      }
      if (
        typeof p_input.values.id !== "string" ||
        !Array.isArray(p_input.values.values)
      ) {
        throw new FicheBuildError("values must be envelope");
      }
      builder.withValues(p_input.values);
    }
    return builder.makeFiche().getFiche();
  }
}
