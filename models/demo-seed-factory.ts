import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getConnection, queryRaw } from "@/internal/db/connection";
import { FamilyMission } from "@/models/family_mission";

export const DEMO_FAMILY_ID: string = "c10a0003-3333-4333-8333-000000000010";

type FamilyIdRow = {
  id: string;
};

export abstract class SeedFactory {
  public abstract getSeed(): void;

  public applyIfMissing(): void {
    this.getSeed();
  }
}

export class DemoSeedFactory extends SeedFactory {
  private static _instance: DemoSeedFactory | null = null;

  private constructor() {
    super();
  }

  public static get instance(): DemoSeedFactory {
    if (DemoSeedFactory._instance === null) {
      DemoSeedFactory._instance = new DemoSeedFactory();
    }
    return DemoSeedFactory._instance;
  }

  public getSeed(): void {
    getConnection();
    FamilyMission.instance.ensureTitleColumn();
    const existing: FamilyIdRow[] = queryRaw<FamilyIdRow>(
      "SELECT id FROM family WHERE id = ?",
      [DEMO_FAMILY_ID],
    );
    if (existing.length > 0) {
      return;
    }
    const seedPath: string = resolve(process.cwd(), "db/migrations/100100_demo_seed.sql");
    const seedSql: string = readFileSync(seedPath, "utf8");
    getConnection().exec(seedSql);
  }
}
