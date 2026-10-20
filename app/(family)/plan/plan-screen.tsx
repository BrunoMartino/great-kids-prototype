"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import {
  SEEDED_FAMILY_ID,
  SEEDED_PLANS,
  SEEDED_TITULAR_USER_ID,
} from "../chrome/seeded-family";
import { useFamilySession } from "../context-switch/family-session-context";

const SCREEN_STYLES: string = `
[data-plan-screen] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-plan-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 4px 16px;
  -webkit-overflow-scrolling: touch;
}
[data-plan-screen] h1 { margin: 0; font-size: 1.35rem; }
[data-plan-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-plan-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-plan-card] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-plan-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-plan-screen] input,
[data-plan-screen] select {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
}
[data-plan-screen] button {
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
[data-plan-screen] button[data-kind="invite"] {
  background: var(--color-secondary);
}
[data-plan-error] { color: var(--color-danger); font-weight: 600; }
[data-plan-ok] { color: var(--color-success); font-weight: 600; }
[data-plan-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
`;

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
        <style href="plan-screen" precedence="medium">
          {SCREEN_STYLES}
        </style>
        <div data-plan-scroll>
          <FamilyThumbShell
            content={
              <>
          <h1>Action blocked</h1>
          <p>Child view cannot change the plan or invite family members.</p>
              </>
            }
            actions={
          <button
            type="button"
            onClick={(): void => {
              router.push("/child");
            }}
          >
            Stay in Child view
          </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div data-plan-screen>
      <style href="plan-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-plan-scroll>
        <FamilyThumbShell
          content={<h1>Family plan</h1>}
          actions={
            <>
        <form data-plan-card onSubmit={(p_event): void => { void onPlan(p_event); }}>
          <h2>Change plan</h2>
          <label>
            Plan
            <select
              value={planId}
              onChange={(p_event: ChangeEvent<HTMLSelectElement>): void => {
                setPlanId(p_event.currentTarget.value);
              }}
            >
              {SEEDED_PLANS.map((p_plan) => (
                <option key={p_plan.id} value={p_plan.id}>
                  {p_plan.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={isSaving}>
            Change plan
          </button>
        </form>
        <form data-plan-card onSubmit={(p_event): void => { void onInvite(p_event); }}>
          <h2>Invite family member</h2>
          <p>The family member can be Parent or Child. No child photo.</p>
          <label>
            Email
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                setEmail(p_event.currentTarget.value);
              }}
            />
          </label>
          <label>
            Role
            <select
              value={inviteRole}
              onChange={(p_event: ChangeEvent<HTMLSelectElement>): void => {
                const next: string = p_event.currentTarget.value;
                if (next === "Parent" || next === "Child") {
                  setInviteRole(next);
                }
              }}
            >
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
            </select>
          </label>
          <button type="submit" data-kind="invite" disabled={isSaving}>
            Invite family member
          </button>
        </form>
        {errorMessage !== null ? (
          <p data-plan-error role="alert">
            {errorMessage}
          </p>
        ) : null}
        {okMessage !== null ? (
          <p data-plan-ok>
            {okMessage}
          </p>
        ) : null}
            </>
          }
        />
      </div>
    </div>
  );
}
