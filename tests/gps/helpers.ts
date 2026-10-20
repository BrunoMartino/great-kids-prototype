import {
  arrangeFamilyViaHusk,
  familyRouteParams,
  jsonRequest,
  type ArrangedFamily,
  type FamilyRouteParams,
} from "../family/helpers";

export { familyRouteParams, jsonRequest };
export type { ArrangedFamily, FamilyRouteParams };

export async function arrangeGpsFamily(): Promise<ArrangedFamily> {
  const arranged: ArrangedFamily = await arrangeFamilyViaHusk();
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = "Parent";
  const { applyRole } = await import("@/app/api/session/presentation-strategy");
  applyRole("Parent");
  return arranged;
}

export async function seedLiveFamilyQuiz(p_text: string): Promise<{ id: string }> {
  const { FamilyQuiz } = await import("@/models/family_quiz");
  return FamilyQuiz.instance.create({
    question_text: p_text,
    kind: "Family-Quiz",
    weight: 1,
    status: "active",
  });
}
