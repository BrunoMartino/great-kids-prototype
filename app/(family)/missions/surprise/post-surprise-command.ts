import { readSurprisePayload, type SurprisePayload } from "./surprise-payload";

export class SurpriseForbiddenError extends Error {
  public constructor() {
    super("forbidden");
    this.name = "SurpriseForbiddenError";
  }
}

export class SurpriseMissingFamilyError extends Error {
  public constructor() {
    super("not found");
    this.name = "SurpriseMissingFamilyError";
  }
}

export class PostSurpriseCommand {
  public constructor(private readonly p_familyId: string) {}

  public async execute(): Promise<SurprisePayload> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/missions/surprise`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({}),
      },
    );
    if (response.status === 403) {
      throw new SurpriseForbiddenError();
    }
    if (response.status === 404) {
      throw new SurpriseMissingFamilyError();
    }
    if (!response.ok) {
      throw new Error(`surprise failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const payload: SurprisePayload | null = readSurprisePayload(body);
    if (payload === null) {
      throw new Error("surprise envelope invalid");
    }
    return payload;
  }

  public async undo(): Promise<void> {
    return;
  }
}
