import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { FamilyProfile, type GpsDocument } from "@/models/family_profile";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const document: GpsDocument | null = FamilyProfile.instance.findByFamilyId(familyId);
  if (document === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(
    {
      id: document.id,
      quiz_answer: document.quiz_answer,
      rhythms: document.rhythms,
      achievements: document.achievements,
      profile_notes: document.profile_notes,
    },
    { status: 200 },
  );
}
