import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

export type QueryParam = string | number | bigint | Buffer | null;

export class Connection {
  private static _instance: Connection | null = null;
  private readonly database: Database.Database;

  private constructor() {
    const sqlitePath: string = process.env.SQLITE_PATH ?? "./data/great-kids.sqlite";
    const absolutePath: string = resolve(sqlitePath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    this.database = new Database(absolutePath);
    this.database.pragma("foreign_keys = ON");
    this.applySchema();
  }

  public static get instance(): Connection {
    if (Connection._instance === null) {
      Connection._instance = new Connection();
    }

    return Connection._instance;
  }

  public getDatabase(): Database.Database {
    return this.database;
  }

  private applySchema(): void {
    const existing: { name: string } | undefined = this.database
      .prepare<[], { name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'plan'",
      )
      .get();
    if (existing !== undefined) {
      return;
    }
    const schemaPath: string = resolve(process.cwd(), "db/migrations/000000_schema.sql");
    const schemaSql: string = readFileSync(schemaPath, "utf8");
    this.database.exec(schemaSql);
  }
}

export function getConnection(): Database.Database {
  return Connection.instance.getDatabase();
}

export function queryRaw<TRow>(
  p_sql: string,
  p_params: ReadonlyArray<QueryParam>,
): TRow[] {
  const database: Database.Database = getConnection();
  const boundParams: QueryParam[] = [...p_params];
  const statement: Database.Statement<QueryParam[], TRow> = database.prepare<
    QueryParam[],
    TRow
  >(p_sql);
  const kind: string = p_sql.trim().toUpperCase();
  if (kind.startsWith("SELECT") || kind.startsWith("PRAGMA") || kind.startsWith("WITH")) {
    return statement.all(...boundParams);
  }
  statement.run(...boundParams);
  return [];
}
