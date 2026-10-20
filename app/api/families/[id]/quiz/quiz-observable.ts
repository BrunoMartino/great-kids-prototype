import { FamilyProfile, type QuizAnswerItem } from "@/models/family_profile";

export interface GpsObserver {
  update(p_observable: QuizAnswerSubject): void;
}

export class QuizAnswerSubject {
  private observers: GpsObserver[] = [];

  public constructor(
    public familyId: string,
    public answer: QuizAnswerItem | null,
  ) {}

  public subscribe(...p_observers: GpsObserver[]): void {
    p_observers.forEach((p_observer: GpsObserver) => {
      if (!this.observers.includes(p_observer)) {
        this.observers.push(p_observer);
      }
    });
  }

  public unsubscribe(p_observer: GpsObserver): void {
    const index: number = this.observers.indexOf(p_observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notify(): void {
    this.observers.forEach((p_observer: GpsObserver) => {
      p_observer.update(this);
    });
  }
}

export class ProfileWriteObserver implements GpsObserver {
  public update(p_observable: QuizAnswerSubject): void {
    if (p_observable.answer === null) {
      return;
    }
    FamilyProfile.instance.appendAnswer(p_observable.familyId, p_observable.answer);
  }
}
