import { ContextPolicy } from "@/policies/role";
import {
  applyRole,
  getPresentation,
  isPresentationPresent,
} from "@/app/api/session/presentation-strategy";

type ContextPostBody = {
  role?: string;
};

export async function POST(p_request: Request): Promise<Response> {
  try {
    const body: ContextPostBody = (await p_request.json()) as ContextPostBody;
    const role: string = body.role ?? "";
    applyRole(role);
    ContextPolicy.assertSessionPresent(isPresentationPresent());
    return Response.json(getPresentation(), { status: 200 });
  } catch (p_error: unknown) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
