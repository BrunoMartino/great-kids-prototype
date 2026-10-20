import { assertStaffOrDeny, StaffDeniedError } from "@/app/api/missions/staff-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { DuplicateSlugError, MissionCategory } from "@/models/mission_category";

type CategoryPostBody = {
  slug?: string;
  name?: string;
};

export async function GET(): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const categories = MissionCategory.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      categories,
    },
    { status: 200 },
  );
}

export async function POST(p_request: Request): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const body: CategoryPostBody = (await p_request.json()) as CategoryPostBody;
  if (body.slug === undefined || body.name === undefined) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const category = MissionCategory.instance.create({
      slug: body.slug,
      name: body.name,
    });
    return Response.json(
      {
        id: crypto.randomUUID(),
        category,
      },
      { status: 201 },
    );
  } catch (p_error: unknown) {
    if (p_error instanceof DuplicateSlugError) {
      return Response.json({ error: "conflict" }, { status: 409 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
