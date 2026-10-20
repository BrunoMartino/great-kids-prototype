import { getConnection, queryRaw } from "@/internal/db/connection";

export type AppUserRole = "Admin" | "Operator" | "Parent" | "Child";
export type AppUserStatus = "active" | "inactive" | "suspended" | "blocked";

export type AppUserCreateInput = {
  name?: string | null;
  nick_name: string;
  email?: string | null;
  cellphone?: string | null;
  role: AppUserRole;
  status: AppUserStatus;
};

export type AppUserRecord = {
  id: string;
  name: string | null;
  nick_name: string;
  email: string | null;
  role: string;
  status: string;
  auth_user_id: string | null;
};

export class DuplicateEmailError extends Error {
  public constructor() {
    super("duplicate email");
    this.name = "DuplicateEmailError";
  }
}

export class AppUser {
  private static _instance: AppUser | null = null;

  private constructor() {}

  public static get instance(): AppUser {
    if (AppUser._instance === null) {
      AppUser._instance = new AppUser();
    }
    return AppUser._instance;
  }

  public async create(p_input: AppUserCreateInput): Promise<AppUserRecord> {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    try {
      queryRaw(
        `INSERT INTO app_user (
          id, name, nick_name, cellphone, email, role, status, auth_user_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          p_input.name ?? null,
          p_input.nick_name,
          p_input.cellphone ?? null,
          p_input.email ?? null,
          p_input.role,
          p_input.status,
          null,
          now,
          now,
        ],
      );
    } catch (p_error: unknown) {
      if (p_error instanceof Error && /UNIQUE/i.test(p_error.message)) {
        throw new DuplicateEmailError();
      }
      throw p_error;
    }
    return {
      id,
      name: p_input.name ?? null,
      nick_name: p_input.nick_name,
      email: p_input.email ?? null,
      role: p_input.role,
      status: p_input.status,
      auth_user_id: null,
    };
  }

  public findById(p_id: string): AppUserRecord | null {
    getConnection();
    const rows: AppUserRecord[] = queryRaw<AppUserRecord>(
      `SELECT id, name, nick_name, email, role, status, auth_user_id
       FROM app_user WHERE id = ?`,
      [p_id],
    );
    const first: AppUserRecord | undefined = rows[0];
    return first ?? null;
  }

  public list(): AppUserRecord[] {
    getConnection();
    return queryRaw<AppUserRecord>(
      `SELECT id, name, nick_name, email, role, status, auth_user_id FROM app_user`,
      [],
    );
  }
}
