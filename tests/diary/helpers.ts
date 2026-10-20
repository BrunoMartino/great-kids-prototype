import {
  arrangeAcceptedCycle,
  familyRouteParams,
  jsonRequest,
  patchCycle,
  type ArrangedCycle,
} from "../mission-play/helpers";
import { arrangePickFamily, type ArrangedFamily } from "../pick/helpers";

export { familyRouteParams, jsonRequest };
export type { ArrangedFamily };

export const NOTE_KINDS: readonly string[] = [
  "phrase",
  "first_time",
  "funny",
  "learned",
  "family_fail",
];

export const UNKNOWN_FAMILY_ID: string = "00000000-0000-4000-8000-000000000404";

export async function arrangeDiaryFamily(): Promise<ArrangedFamily> {
  return arrangePickFamily();
}

export async function arrangeSecondDiaryFamily(): Promise<ArrangedFamily> {
  const { AppUser } = await import("@/models/app_user");
  const holder: { id: string } = await AppUser.instance.create({
    name: "Cora",
    nick_name: "Cora",
    email: "cora@example.com",
    role: "Parent",
    status: "active",
  });
  const { createFamilyHusk } = await import("@/app/api/families/husk-service");
  const family: { id: string } = await createFamilyHusk({
    holder_user_id: holder.id,
    status: "active",
  });
  return { familyId: family.id, holderId: holder.id };
}

export async function getDiary(p_familyId: string): Promise<Response> {
  const { GET } = await import("@/app/api/families/[id]/diary/route");
  return GET(
    jsonRequest(`/api/families/${p_familyId}/diary`, "GET"),
    familyRouteParams(p_familyId),
  );
}

export async function postDiary(p_familyId: string, p_body: unknown): Promise<Response> {
  const { POST } = await import("@/app/api/families/[id]/diary/route");
  return POST(
    jsonRequest(`/api/families/${p_familyId}/diary`, "POST", p_body),
    familyRouteParams(p_familyId),
  );
}

export async function arrangeCompletedCycle(p_title: string): Promise<ArrangedCycle> {
  const arranged: ArrangedCycle = await arrangeAcceptedCycle(p_title);
  await patchCycle(arranged.cycleId, { status: "Doing" });
  const completed: Response = await patchCycle(arranged.cycleId, {
    status: "Completed",
    closing: { do_again: false, save_memory: true },
  });
  if (completed.status !== 200) {
    throw new Error(`complete cycle failed: ${String(completed.status)}`);
  }
  return arranged;
}
