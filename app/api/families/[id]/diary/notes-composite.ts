import type {
  MissionNoteItem,
  MissionNotesEnvelope,
  NoteItem,
  NotesEnvelope,
} from "@/models/family_diary";

export abstract class DiaryComponent {
  private parent: DiaryComponent | null = null;

  public getParent(): DiaryComponent | null {
    return this.parent;
  }

  public setParent(p_parent: DiaryComponent | null): void {
    this.parent = p_parent;
  }

  public add(...p_children: DiaryComponent[]): void {
    void p_children;
  }

  public remove(p_child: DiaryComponent): void {
    void p_child;
  }

  public getChildren(): DiaryComponent[] {
    return [];
  }
}

export class NoteLeaf extends DiaryComponent {
  public constructor(public readonly p_item: NoteItem) {
    super();
  }
}

export class NotesComposite extends DiaryComponent {
  private children: DiaryComponent[] = [];

  public constructor(public readonly p_id: string) {
    super();
  }

  public add(...p_children: DiaryComponent[]): void {
    p_children.forEach((p_child: DiaryComponent) => {
      p_child.setParent(this);
      this.children.push(p_child);
    });
  }

  public getChildren(): DiaryComponent[] {
    return this.children;
  }

  public toEnvelope(): NotesEnvelope {
    const notes: NoteItem[] = [];
    for (const p_child of this.children) {
      if (p_child instanceof NoteLeaf) {
        notes.push(p_child.p_item);
      }
    }
    return { id: this.p_id, notes };
  }

  public static fromEnvelope(p_envelope: NotesEnvelope): NotesComposite {
    const hub: NotesComposite = new NotesComposite(p_envelope.id);
    for (const p_item of p_envelope.notes) {
      hub.add(new NoteLeaf(p_item));
    }
    return hub;
  }
}

export class MissionNoteLeaf extends DiaryComponent {
  public constructor(public readonly p_item: MissionNoteItem) {
    super();
  }
}

export class MissionNotesComposite extends DiaryComponent {
  private children: DiaryComponent[] = [];

  public constructor(public readonly p_id: string) {
    super();
  }

  public add(...p_children: DiaryComponent[]): void {
    p_children.forEach((p_child: DiaryComponent) => {
      p_child.setParent(this);
      this.children.push(p_child);
    });
  }

  public getChildren(): DiaryComponent[] {
    return this.children;
  }

  public toEnvelope(): MissionNotesEnvelope {
    const notes: MissionNoteItem[] = [];
    for (const p_child of this.children) {
      if (p_child instanceof MissionNoteLeaf) {
        notes.push(p_child.p_item);
      }
    }
    return { id: this.p_id, notes };
  }

  public static fromEnvelope(p_envelope: MissionNotesEnvelope): MissionNotesComposite {
    const hub: MissionNotesComposite = new MissionNotesComposite(p_envelope.id);
    for (const p_item of p_envelope.notes) {
      hub.add(new MissionNoteLeaf(p_item));
    }
    return hub;
  }
}
