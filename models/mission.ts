import { getConnection, queryRaw } from "@/internal/db/connection";

export type MissionListItem = {
  id: string;
  title: string;
  category_id: string;
  review_status: string;
};

export type MissionValuesEnvelope = {
  id: string;
  values: string[];
};

export type MissionMaterialRow = {
  id: string;
  mission_id: string;
  material_id: string;
  status: string;
};

export type MissionFiche = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  img_path: string | null;
  type: string;
  format: string;
  duration_minutes: number | null;
  age_min: number | null;
  age_max: number | null;
  setting: string | null;
  values: MissionValuesEnvelope;
  materials: MissionMaterialRow[];
  review_status: string;
  status: string;
};

export type MissionInsertInput = {
  title: string;
  category_id: string;
  review_status: string;
  status: string;
  type: string;
  format: string;
  values: string;
};

export type MissionUpdateInput = {
  description?: string | null;
  img_path?: string | null;
  duration_minutes?: number | null;
  age_min?: number | null;
  age_max?: number | null;
  setting?: string | null;
  values?: MissionValuesEnvelope | null;
  type?: string;
  format?: string;
};

type MissionFicheRow = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  img_path: string | null;
  type: string;
  format: string;
  duration_minutes: number | null;
  age_min: number | null;
  age_max: number | null;
  setting: string | null;
  values: string;
  review_status: string;
  status: string;
};

export class Mission {
  private static _instance: Mission | null = null;

  private constructor() {}

  public static get instance(): Mission {
    if (Mission._instance === null) {
      Mission._instance = new Mission();
    }
    return Mission._instance;
  }

  public insert(p_input: MissionInsertInput): MissionListItem {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO mission (
        id, status, title, type, format, review_status, category_id, "values", created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p_input.status,
        p_input.title,
        p_input.type,
        p_input.format,
        p_input.review_status,
        p_input.category_id,
        p_input.values,
        now,
        now,
      ],
    );
    return {
      id,
      title: p_input.title,
      category_id: p_input.category_id,
      review_status: p_input.review_status,
    };
  }

  public list(p_categoryId?: string): MissionListItem[] {
    getConnection();
    if (p_categoryId !== undefined && p_categoryId !== "") {
      return queryRaw<MissionListItem>(
        `SELECT id, title, category_id, review_status FROM mission
         WHERE deleted = 0 AND category_id = ?`,
        [p_categoryId],
      );
    }
    return queryRaw<MissionListItem>(
      `SELECT id, title, category_id, review_status FROM mission WHERE deleted = 0`,
      [],
    );
  }

  public findById(p_id: string): MissionFiche | null {
    getConnection();
    const rows: MissionFicheRow[] = queryRaw<MissionFicheRow>(
      `SELECT id, category_id, title, description, img_path, type, format,
              duration_minutes, age_min, age_max, setting, "values",
              review_status, status
       FROM mission
       WHERE id = ? AND deleted = 0`,
      [p_id],
    );
    const row: MissionFicheRow | undefined = rows[0];
    if (row === undefined) {
      return null;
    }
    const materials: MissionMaterialRow[] = queryRaw<MissionMaterialRow>(
      `SELECT id, mission_id, material_id, status
       FROM mission_material
       WHERE mission_id = ?`,
      [p_id],
    );
    const parsedValues: unknown = JSON.parse(row.values);
    return {
      id: row.id,
      category_id: row.category_id,
      title: row.title,
      description: row.description,
      img_path: row.img_path,
      type: row.type,
      format: row.format,
      duration_minutes: row.duration_minutes,
      age_min: row.age_min,
      age_max: row.age_max,
      setting: row.setting,
      values: parsedValues as MissionValuesEnvelope,
      materials,
      review_status: row.review_status,
      status: row.status,
    };
  }

  public update(p_id: string, p_input: MissionUpdateInput): MissionFiche | null {
    getConnection();
    const current: MissionFiche | null = this.findById(p_id);
    if (current === null) {
      return null;
    }
    const sets: string[] = [];
    const params: Array<string | number | null> = [];
    if (p_input.description !== undefined) {
      sets.push("description = ?");
      params.push(p_input.description);
    }
    if (p_input.img_path !== undefined) {
      sets.push("img_path = ?");
      params.push(p_input.img_path);
    }
    if (p_input.duration_minutes !== undefined) {
      sets.push("duration_minutes = ?");
      params.push(p_input.duration_minutes);
    }
    if (p_input.age_min !== undefined) {
      sets.push("age_min = ?");
      params.push(p_input.age_min);
    }
    if (p_input.age_max !== undefined) {
      sets.push("age_max = ?");
      params.push(p_input.age_max);
    }
    if (p_input.setting !== undefined) {
      sets.push("setting = ?");
      params.push(p_input.setting);
    }
    if (p_input.values !== undefined && p_input.values !== null) {
      sets.push("\"values\" = ?");
      params.push(JSON.stringify(p_input.values));
    }
    if (p_input.type !== undefined) {
      sets.push("type = ?");
      params.push(p_input.type);
    }
    if (p_input.format !== undefined) {
      sets.push("format = ?");
      params.push(p_input.format);
    }
    if (sets.length === 0) {
      return current;
    }
    sets.push("updated_at = ?");
    params.push(new Date().toISOString());
    params.push(p_id);
    queryRaw(`UPDATE mission SET ${sets.join(", ")} WHERE id = ? AND deleted = 0`, params);
    return this.findById(p_id);
  }

  public listPublished(): MissionListItem[] {
    getConnection();
    return queryRaw<MissionListItem>(
      `SELECT id, title, category_id, review_status FROM mission
       WHERE deleted = 0 AND status = 'active' AND review_status = 'published'`,
      [],
    );
  }

  public updateReviewStatus(p_id: string, p_reviewStatus: string): void {
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(
      `UPDATE mission SET review_status = ?, updated_at = ? WHERE id = ? AND deleted = 0`,
      [p_reviewStatus, now, p_id],
    );
  }
}
