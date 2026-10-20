export const FREE_PLAN_ID: string = "24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1";

export type FamilyRouteParams = {
  params: Promise<{ id: string }>;
};

export type ArrangedFamily = {
  familyId: string;
  holderId: string;
};

export function jsonRequest(
  p_path: string,
  p_method: string,
  p_body?: unknown,
  p_actorUserId?: string,
): Request {
  const headers: Record<string, string> = {};
  if (p_body !== undefined) {
    headers["content-type"] = "application/json";
  }
  if (p_actorUserId !== undefined) {
    headers["x-actor-user-id"] = p_actorUserId;
  }
  const init: RequestInit = {
    method: p_method,
    headers,
  };
  if (p_body !== undefined) {
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

export function familyRouteParams(p_familyId: string): FamilyRouteParams {
  return { params: Promise.resolve({ id: p_familyId }) };
}

export async function arrangeFamilyViaApi(): Promise<ArrangedFamily> {
  const { POST: postUser } = await import("@/app/api/app-users/route");
  const { POST: postFamily } = await import("@/app/api/families/route");
  const userResponse: Response = await postUser(
    jsonRequest("/api/app-users", "POST", {
      name: "Ana",
      nick_name: "Ana",
      email: "ana@example.com",
      role: "Parent",
      status: "active",
    }),
  );
  const user: { id: string } = (await userResponse.json()) as { id: string };
  const familyResponse: Response = await postFamily(
    jsonRequest("/api/families", "POST", {
      holder_user_id: user.id,
      status: "active",
    }),
  );
  const family: { id: string } = (await familyResponse.json()) as { id: string };
  return { familyId: family.id, holderId: user.id };
}

export async function arrangeFamilyViaHusk(): Promise<ArrangedFamily> {
  const { AppUser } = await import("@/models/app_user");
  const holder: { id: string } = await AppUser.instance.create({
    name: "Ana",
    nick_name: "Ana",
    email: "ana@example.com",
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

export async function arrangeSecondParent(): Promise<{ id: string }> {
  const { POST: postUser } = await import("@/app/api/app-users/route");
  const userResponse: Response = await postUser(
    jsonRequest("/api/app-users", "POST", {
      name: "Bia",
      nick_name: "Bia",
      email: "bia@example.com",
      role: "Parent",
      status: "active",
    }),
  );
  return (await userResponse.json()) as { id: string };
}
