"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  CreditCardIcon,
  LockIcon,
  UsersThreeIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { StateCard, Well } from "../chrome/family-ui";
import {
  SEEDED_FAMILY_ID,
  SEEDED_PLANS,
  SEEDED_TITULAR_USER_ID,
} from "../chrome/seeded-family";
import { useFamilySession } from "../context-switch/family-session-context";

const PLAN_FORM_ID: string = "family-plan-form";

export function PlanScreen(): ReactElement {
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const router: ReturnType<typeof useRouter> = useRouter();
  const familyId: string = session.familyId || SEEDED_FAMILY_ID;
  const role: string = session.snapshot?.role ?? "Parent";
  const isChild: boolean = role === "Child";
  const [planId, setPlanId] = useState<string>(SEEDED_PLANS[1]?.id ?? "");
  const [email, setEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<"Parent" | "Child">("Parent");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const headers: HeadersInit = {
    "content-type": "application/json",
    "x-actor-user-id": SEEDED_TITULAR_USER_ID,
  };

  const onPlan = async (p_event: FormEvent<HTMLFormElement>): Promise<void> => {
    p_event.preventDefault();
    if (isChild) {
      setErrorMessage("Child view cannot change the plan.");
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    setOkMessage(null);
    try {
      const response: Response = await fetch(
        `/api/families/${encodeURIComponent(familyId)}/plan`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ plan_id: planId }),
        },
      );
      if (response.status === 403) {
        setErrorMessage("Only the account holder changes the plan.");
        return;
      }
      if (!response.ok) {
        setErrorMessage("Could not change the plan.");
        return;
      }
      setOkMessage("Plan updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const onInvite = async (p_event: FormEvent<HTMLFormElement>): Promise<void> => {
    p_event.preventDefault();
    if (isChild) {
      setErrorMessage("Child view cannot invite family members.");
      return;
    }
    const trimmed: string = email.trim();
    if (trimmed.length === 0) {
      setErrorMessage("Enter the family member's email.");
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    setOkMessage(null);
    try {
      const response: Response = await fetch(
        `/api/families/${encodeURIComponent(familyId)}/invites`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ email: trimmed, role: inviteRole }),
        },
      );
      if (response.status === 403) {
        setErrorMessage("Only the account holder invites family members.");
        return;
      }
      if (!response.ok) {
        setErrorMessage("Could not invite the family member.");
        return;
      }
      setOkMessage("Invite sent.");
      setEmail("");
    } finally {
      setIsSaving(false);
    }
  };

  if (isChild) {
    return (
      <div data-plan-screen>
        <FamilyThumbShell
          sub="Account holder"
          title="Family plan"
          content={
            <StateCard icon={LockIcon} title="Action blocked" role="alert">
              <p>Child view cannot change the plan or invite family members.</p>
            </StateCard>
          }
          actions={
            <div data-gk-action-row>
              <button
                type="button"
                data-gk-btn="primary"
                onClick={(): void => {
                  router.push("/child");
                }}
              >
                Stay in Child view
              </button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div data-plan-screen>
      <FamilyThumbShell
        sub="Account holder"
        title="Family plan"
        content={
          <>
            <form
              id={PLAN_FORM_ID}
              data-gk-qcard
              data-gk-enter
              onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
                void onPlan(p_event);
              }}
            >
              <Well icon={CreditCardIcon} />
              <h2>Choose a plan</h2>
              <fieldset data-gk-stack aria-label="Plan">
                {SEEDED_PLANS.map((p_plan: { id: string; name: string }) => (
                  <button
                    key={p_plan.id}
                    type="button"
                    data-gk-choice
                    aria-pressed={planId === p_plan.id}
                    onClick={(): void => {
                      setPlanId(p_plan.id);
                    }}
                  >
                    <span data-gk-radio aria-hidden="true" />
                    {p_plan.name}
                  </button>
                ))}
              </fieldset>
            </form>
            <form
              data-gk-card
              data-gk-enter
              onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
                void onInvite(p_event);
              }}
            >
              <Well icon={UsersThreeIcon} tone="warm" />
              <h2>Invite family member</h2>
              <p>The family member can be Parent or Child. No child photo.</p>
              <label data-gk-field>
                Email
                <input
                  data-gk-input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                    setEmail(p_event.currentTarget.value);
                  }}
                />
              </label>
              <fieldset data-gk-chips aria-label="Role">
                {(["Parent", "Child"] as const).map((p_role: "Parent" | "Child") => (
                  <button
                    key={p_role}
                    type="button"
                    data-gk-chip
                    aria-pressed={inviteRole === p_role}
                    onClick={(): void => {
                      setInviteRole(p_role);
                    }}
                  >
                    <CheckIcon data-gk-check size={16} weight="bold" aria-hidden="true" />
                    {p_role}
                  </button>
                ))}
              </fieldset>
              <button type="submit" data-gk-btn="secondary" data-kind="invite" disabled={isSaving}>
                Invite family member
              </button>
            </form>
            {errorMessage !== null ? (
              <p data-gk-alert="danger" role="alert">
                <WarningIcon size={20} aria-hidden="true" />
                {errorMessage}
              </p>
            ) : null}
            {okMessage !== null ? (
              <p data-gk-alert="success" role="status">
                <CheckIcon size={20} aria-hidden="true" />
                {okMessage}
              </p>
            ) : null}
          </>
        }
        actions={
          <div data-gk-action-row>
            <button type="submit" form={PLAN_FORM_ID} data-gk-btn="primary" disabled={isSaving}>
              Change plan
            </button>
          </div>
        }
      />
    </div>
  );
}
