import { getConnection, queryRaw } from "@/internal/db/connection";

export type CuratedMaterialType =
  | "Book"
  | "Play Manual"
  | "Activity"
  | "HandsOn-Activity"
  | "Faith-Teaching"
  | "Money-Teaching"
  | "Workout"
  | "Volunteer";

export type CuratedMaterialStatus = "Can-use" | "Not-use" | "Need-update";

export type CuratedMaterialRecord = {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  feat_img_path: string | null;
  file_path: string | null;
  deleted: number;
};

export type CuratedMaterialCreateInput = {
  type: string;
  title: string;
  description?: string | null;
  status?: string;
};

export type CuratedMaterialUpdateInput = {
  type?: string;
  title?: string;
  description?: string | null;
  status?: string;
  feat_img_path?: string | null;
  file_path?: string | null;
};

const MATERIAL_TYPES: readonly string[] = [
  "Book",
  "Play Manual",
  "Activity",
  "HandsOn-Activity",
  "Faith-Teaching",
  "Money-Teaching",
  "Workout",
  "Volunteer",
];

const MATERIAL_STATUSES: readonly string[] = ["Can-use", "Not-use", "Need-update"];

function isType(p_type: string): p_type is CuratedMaterialType {
  return MATERIAL_TYPES.includes(p_type);
}

function isStatus(p_status: string): p_status is CuratedMaterialStatus {
  return MATERIAL_STATUSES.includes(p_status);
}

export class CuratedMaterial {
  private static _instance: CuratedMaterial | null = null;

  private constructor() {}

  public static get instance(): CuratedMaterial {
    if (CuratedMaterial._instance === null) {
      CuratedMaterial._instance = new CuratedMaterial();
    }
    return CuratedMaterial._instance;
  }

  public create(p_input: CuratedMaterialCreateInput): CuratedMaterialRecord {
    if (p_input.title.trim() === "") {
      throw new Error("title required");
    }
    if (!isType(p_input.type)) {
      throw new Error("invalid type");
    }
    const status: string = p_input.status ?? "Can-use";
    if (!isStatus(status)) {
      throw new Error("invalid status");
    }
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO curated_material (
        id, type, status, title, description, feat_img_path, file_path, deleted,
        last_curated_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NULL, NULL, 0, ?, ?, ?)`,
      [id, p_input.type, status, p_input.title, p_input.description ?? null, now, now, now],
    );
    const stored: CuratedMaterialRecord | null = this.findById(id);
    if (stored === null) {
      throw new Error("curated_material insert failed");
    }
    return stored;
  }

  public findById(p_id: string): CuratedMaterialRecord | null {
    getConnection();
    const rows: CuratedMaterialRecord[] = queryRaw<CuratedMaterialRecord>(
      `SELECT id, type, status, title, description, feat_img_path, file_path, deleted
       FROM curated_material WHERE id = ?`,
      [p_id],
    );
    const first: CuratedMaterialRecord | undefined = rows[0];
    return first ?? null;
  }

  public list(): CuratedMaterialRecord[] {
    getConnection();
    return queryRaw<CuratedMaterialRecord>(
      `SELECT id, type, status, title, description, feat_img_path, file_path, deleted
       FROM curated_material WHERE deleted = 0 ORDER BY created_at`,
      [],
    );
  }

  public update(p_id: string, p_input: CuratedMaterialUpdateInput): CuratedMaterialRecord | null {
    const current: CuratedMaterialRecord | null = this.findById(p_id);
    if (current === null) {
      return null;
    }
    const type: string = p_input.type ?? current.type;
    const title: string = p_input.title ?? current.title;
    const description: string | null =
      p_input.description !== undefined ? p_input.description : current.description;
    const status: string = p_input.status ?? current.status;
    const featImgPath: string | null =
      p_input.feat_img_path !== undefined ? p_input.feat_img_path : current.feat_img_path;
    const filePath: string | null =
      p_input.file_path !== undefined ? p_input.file_path : current.file_path;
    if (!isType(type) || !isStatus(status) || title.trim() === "") {
      throw new Error("invalid material");
    }
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(
      `UPDATE curated_material
       SET type = ?, title = ?, description = ?, status = ?, feat_img_path = ?, file_path = ?,
           last_curated_at = ?, updated_at = ?
       WHERE id = ?`,
      [type, title, description, status, featImgPath, filePath, now, now, p_id],
    );
    return this.findById(p_id);
  }

  public softDelete(p_id: string): CuratedMaterialRecord | null {
    const current: CuratedMaterialRecord | null = this.findById(p_id);
    if (current === null) {
      return null;
    }
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE curated_material SET deleted = 1, updated_at = ? WHERE id = ?`, [now, p_id]);
    return this.findById(p_id);
  }
}
