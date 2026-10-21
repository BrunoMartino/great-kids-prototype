import { setFamilyRole } from "@/internal/db/mock-session";

export type SessionPresentation = {
  role: "Parent" | "Child";
  presentation: "parent" | "child";
};

type PresentationStore = {
  present: boolean;
  strategy: PresentationStrategy;
};

export class PresentationStrategy {
  public constructor(
    public readonly role: "Parent" | "Child" = "Parent",
    public readonly presentation: "parent" | "child" = "parent",
  ) {}

  public getPresentation(): SessionPresentation {
    return { role: this.role, presentation: this.presentation };
  }
}

export class ParentPresentationStrategy extends PresentationStrategy {
  public constructor() {
    super("Parent", "parent");
  }
}

export class ChildPresentationStrategy extends PresentationStrategy {
  public constructor() {
    super("Child", "child");
  }
}

const store: PresentationStore = {
  present: true,
  strategy: new ParentPresentationStrategy(),
};

function alignFamilyMock(p_role: "Parent" | "Child"): void {
  setFamilyRole(p_role);
}

export function applyRole(p_role: string): void {
  if (p_role === "Parent") {
    store.strategy = new ParentPresentationStrategy();
    store.present = true;
    alignFamilyMock("Parent");
    return;
  }
  if (p_role === "Child") {
    store.strategy = new ChildPresentationStrategy();
    store.present = true;
    alignFamilyMock("Child");
    return;
  }
  throw new Error("invalid role");
}

export function getPresentation(): SessionPresentation {
  return store.strategy.getPresentation();
}

export function clearPresentation(): void {
  store.present = false;
}

export function isPresentationPresent(): boolean {
  return store.present;
}
