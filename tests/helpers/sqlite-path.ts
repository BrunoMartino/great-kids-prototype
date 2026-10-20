import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function arrangeTestSqlitePath(): string {
  const tempDir: string = mkdtempSync(join(tmpdir(), "great-kids-w0-"));
  const sqlitePath: string = join(tempDir, "great-kids.sqlite");
  process.env.SQLITE_PATH = sqlitePath;
  return sqlitePath;
}
