export class IllegalCycleTransitionError extends Error {
  public constructor() {
    super("illegal cycle transition");
    this.name = "IllegalCycleTransitionError";
  }
}

export type CycleOfferedCommand = "start" | "complete";

export interface FamilyMissionCycleState {
  getName(): string;
  startDoing(): void;
  complete(): void;
  accept(): void;
  offeredCommands(): readonly CycleOfferedCommand[];
}

export class FamilyMissionCycle {
  private state: FamilyMissionCycleState;

  public constructor(p_from: string) {
    this.state = FamilyMissionCycle.createState(this, p_from);
  }

  public getState(): FamilyMissionCycleState {
    return this.state;
  }

  public setState(p_state: FamilyMissionCycleState): void {
    this.state = p_state;
  }

  public getName(): string {
    return this.state.getName();
  }

  public startDoing(): void {
    this.state.startDoing();
  }

  public complete(): void {
    this.state.complete();
  }

  public accept(): void {
    this.state.accept();
  }

  public offeredCommands(): readonly CycleOfferedCommand[] {
    return this.state.offeredCommands();
  }

  private static createState(
    p_cycle: FamilyMissionCycle,
    p_from: string,
  ): FamilyMissionCycleState {
    if (p_from === "Accepted") {
      return new AcceptedState(p_cycle);
    }
    if (p_from === "Doing") {
      return new DoingState(p_cycle);
    }
    if (p_from === "Completed") {
      return new CompletedState(p_cycle);
    }
    throw new IllegalCycleTransitionError();
  }
}

export class AcceptedState implements FamilyMissionCycleState {
  private name: string;

  public constructor(private cycle: FamilyMissionCycle) {
    this.name = "Accepted";
  }

  public getName(): string {
    return this.name;
  }

  public startDoing(): void {
    this.cycle.setState(new DoingState(this.cycle));
  }

  public complete(): void {
    throw new IllegalCycleTransitionError();
  }

  public accept(): void {
    throw new IllegalCycleTransitionError();
  }

  public offeredCommands(): readonly CycleOfferedCommand[] {
    return ["start"];
  }
}

export class DoingState implements FamilyMissionCycleState {
  private name: string;

  public constructor(private cycle: FamilyMissionCycle) {
    this.name = "Doing";
  }

  public getName(): string {
    return this.name;
  }

  public startDoing(): void {
    throw new IllegalCycleTransitionError();
  }

  public complete(): void {
    this.cycle.setState(new CompletedState(this.cycle));
  }

  public accept(): void {
    throw new IllegalCycleTransitionError();
  }

  public offeredCommands(): readonly CycleOfferedCommand[] {
    return ["complete"];
  }
}

export class CompletedState implements FamilyMissionCycleState {
  private name: string;

  public constructor(private cycle: FamilyMissionCycle) {
    this.name = "Completed";
  }

  public getName(): string {
    return this.name;
  }

  public startDoing(): void {
    throw new IllegalCycleTransitionError();
  }

  public complete(): void {
    throw new IllegalCycleTransitionError();
  }

  public accept(): void {
    throw new IllegalCycleTransitionError();
  }

  public offeredCommands(): readonly CycleOfferedCommand[] {
    return [];
  }
}
