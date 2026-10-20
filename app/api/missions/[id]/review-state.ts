export class IllegalReviewTransitionError extends Error {
  public constructor() {
    super("illegal review transition");
    this.name = "IllegalReviewTransitionError";
  }
}

export interface ShoppingOrderState {
  getName(): string;
  submitForReview(): void;
  publish(): void;
  returnToDraft(): void;
  reReview(): void;
}

export class ReviewState {
  private state: ShoppingOrderState;

  public constructor(p_from: string) {
    this.state = ReviewState.createState(this, p_from);
  }

  public getState(): ShoppingOrderState {
    return this.state;
  }

  public setState(p_state: ShoppingOrderState): void {
    this.state = p_state;
  }

  public getName(): string {
    return this.state.getName();
  }

  public submitForReview(): void {
    this.state.submitForReview();
  }

  public publish(): void {
    this.state.publish();
  }

  public returnToDraft(): void {
    this.state.returnToDraft();
  }

  public reReview(): void {
    this.state.reReview();
  }

  public static transition(p_from: string, p_to: string): string {
    const order: ReviewState = new ReviewState(p_from);
    if (p_to === "in_review") {
      if (p_from === "published") {
        order.reReview();
      } else {
        order.submitForReview();
      }
    } else if (p_to === "published") {
      order.publish();
    } else if (p_to === "draft") {
      order.returnToDraft();
    } else {
      throw new IllegalReviewTransitionError();
    }
    return order.getName();
  }

  private static createState(p_order: ReviewState, p_from: string): ShoppingOrderState {
    if (p_from === "draft") {
      return new Draft(p_order);
    }
    if (p_from === "in_review") {
      return new InReview(p_order);
    }
    if (p_from === "published") {
      return new Published(p_order);
    }
    throw new IllegalReviewTransitionError();
  }
}

export class Draft implements ShoppingOrderState {
  private name: string;

  public constructor(private order: ReviewState) {
    this.name = "draft";
  }

  public getName(): string {
    return this.name;
  }

  public submitForReview(): void {
    this.order.setState(new InReview(this.order));
  }

  public publish(): void {
    throw new IllegalReviewTransitionError();
  }

  public returnToDraft(): void {
    throw new IllegalReviewTransitionError();
  }

  public reReview(): void {
    throw new IllegalReviewTransitionError();
  }
}

export class InReview implements ShoppingOrderState {
  private name: string;

  public constructor(private order: ReviewState) {
    this.name = "in_review";
  }

  public getName(): string {
    return this.name;
  }

  public submitForReview(): void {
    throw new IllegalReviewTransitionError();
  }

  public publish(): void {
    this.order.setState(new Published(this.order));
  }

  public returnToDraft(): void {
    this.order.setState(new Draft(this.order));
  }

  public reReview(): void {
    throw new IllegalReviewTransitionError();
  }
}

export class Published implements ShoppingOrderState {
  private name: string;

  public constructor(private order: ReviewState) {
    this.name = "published";
  }

  public getName(): string {
    return this.name;
  }

  public submitForReview(): void {
    throw new IllegalReviewTransitionError();
  }

  public publish(): void {
    throw new IllegalReviewTransitionError();
  }

  public returnToDraft(): void {
    throw new IllegalReviewTransitionError();
  }

  public reReview(): void {
    this.order.setState(new InReview(this.order));
  }
}
