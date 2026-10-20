import { ContextPolicy } from "@/policies/role";
import {
  clearPresentation,
  getPresentation,
  isPresentationPresent,
} from "@/app/api/session/presentation-strategy";

export async function GET(p_request: Request): Promise<Response> {
  try {
    ContextPolicy.assertSessionPresent(isPresentationPresent());
  } catch (p_error: unknown) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  void p_request;
  return Response.json(getPresentation(), { status: 200 });
}

export async function DELETE(p_request: Request): Promise<Response> {
  clearPresentation();
  void p_request;
  return new Response(null, { status: 204 });
}
