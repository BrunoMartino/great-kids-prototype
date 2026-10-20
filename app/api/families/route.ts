import { createFamilyHusk } from "@/app/api/families/husk-service";

type FamilyPostBody = {
  holder_user_id?: string;
  status?: string;
};

type MembersEnvelope = {
  id: string;
  members: Array<{ user_id: string; user_nickname: string; user_role: string }>;
};

type AddressObject = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

export async function POST(p_request: Request): Promise<Response> {
  const body: FamilyPostBody = (await p_request.json()) as FamilyPostBody;
  if (body.holder_user_id === undefined || body.holder_user_id === "") {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const status: string = body.status ?? "active";
  try {
    const family = await createFamilyHusk({
      holder_user_id: body.holder_user_id,
      status,
    });
    const members: MembersEnvelope = JSON.parse(family.family_members) as MembersEnvelope;
    const address: AddressObject = JSON.parse(family.address) as AddressObject;
    return Response.json(
      {
        id: family.id,
        status: family.status,
        plan_id: family.plan_id,
        family_members: members,
        address,
      },
      { status: 201 },
    );
  } catch (p_error: unknown) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
