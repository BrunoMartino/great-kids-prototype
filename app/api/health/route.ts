import { getConnection, queryRaw } from "@/internal/db/connection";
import { getMockSession } from "@/internal/db/mock-session";
import type { MockRole } from "@/internal/db/mock-session";

export type HealthEnvelope = {
  ok: true;
  foreignKeys: boolean;
  sessionRole: MockRole;
};

export async function GET(): Promise<Response> {
  getConnection();
  const pragmaRows: Array<{ foreign_keys: number }> = queryRaw<{
    foreign_keys: number;
  }>("PRAGMA foreign_keys", []);
  const firstRow: { foreign_keys: number } | undefined = pragmaRows[0];
  const foreignKeysOn: boolean = firstRow !== undefined && firstRow.foreign_keys === 1;
  const sessionRole: MockRole = getMockSession().role;
  const body: HealthEnvelope = {
    ok: true,
    foreignKeys: foreignKeysOn,
    sessionRole,
  };
  return Response.json(body, { status: 200 });
}
