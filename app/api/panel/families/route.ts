import { SupportPolicy } from "@/app/api/panel/families/support-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Family, type FamilyListRow } from "@/models/family";
import { FamilyInvite, type FamilyInviteListItem } from "@/models/family_invite";
import { Plan, type PlanRecord } from "@/models/plan";

type PanelPlan = {
  id: string;
  name: string;
  status: string;
};

type PanelInvite = {
  id: string;
  email: string;
  status: string;
};

type PanelFamily = {
  id: string;
  status: string;
  plan: PanelPlan | null;
  invites: PanelInvite[];
};

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  try {
    SupportPolicy.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const families: FamilyListRow[] = Family.instance.list();
  const payload: { id: string; families: PanelFamily[] } = {
    id: crypto.randomUUID(),
    families: families.map((p_family: FamilyListRow) => {
      const plan: PlanRecord | null =
        p_family.plan_id === null ? null : Plan.instance.findById(p_family.plan_id);
      const invites: FamilyInviteListItem[] = FamilyInvite.instance.listByFamily(p_family.id);
      return {
        id: p_family.id,
        status: p_family.status,
        plan:
          plan === null
            ? null
            : {
                id: plan.id,
                name: plan.name,
                status: plan.status,
              },
        invites: invites.map((p_invite: FamilyInviteListItem) => ({
          id: p_invite.id,
          email: p_invite.email,
          status: p_invite.status,
        })),
      };
    }),
  };
  return Response.json(payload, { status: 200 });
}
