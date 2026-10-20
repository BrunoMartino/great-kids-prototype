import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyInsertInput = {
  fam_profile_id: string;
  fam_diary_id: string;
  status: string;
  family_members: string;
  address: string;
  holder_user_id?: string;
};

export type FamilyRecord = {
  id: string;
  fam_profile_id: string;
  fam_diary_id: string;
  status: string;
  family_members: string;
  address: string;
  plan_id: string | null;
};

export type FamilyListRow = {
  id: string;
  status: string;
  plan_id: string | null;
};

export type FamilyMemberRecord = {
  user_id: string | null;
  user_nickname: string;
  user_role: string;
};

export type MembersEnvelope = {
  id: string;
  members: FamilyMemberRecord[];
};

export type FamilyAddress = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export abstract class ProductComponent {
  private parent: ProductComponent | null = null;

  public getParent(): ProductComponent | null {
    return this.parent;
  }

  public setParent(p_parent: ProductComponent | null): void {
    this.parent = p_parent;
  }

  public abstract getPrice(): number;

  public add(...p_products: ProductComponent[]): void {}

  public remove(p_product: ProductComponent): void {}

  public getChildren(): ProductComponent[] {
    return [];
  }

  public toMember(): FamilyMemberRecord | null {
    return null;
  }
}

export class ProductLeaf extends ProductComponent {
  public constructor(
    public p_name: string,
    public p_price: number,
    private readonly p_userId: string | null,
    private readonly p_userRole: string,
  ) {
    super();
  }

  public getPrice(): number {
    return this.p_price;
  }

  public toMember(): FamilyMemberRecord {
    return {
      user_id: this.p_userId,
      user_nickname: this.p_name,
      user_role: this.p_userRole,
    };
  }
}

export class ProductComposite extends ProductComponent {
  private children: ProductComponent[] = [];

  public add(...p_products: ProductComponent[]): void {
    p_products.forEach((p_product: ProductComponent) => {
      p_product.setParent(this);
      this.children.push(p_product);
    });
  }

  public remove(p_product: ProductComponent): void {
    this.children = this.children.filter((p_child: ProductComponent) => p_child !== p_product);
    p_product.setParent(null);
  }

  public getChildren(): ProductComponent[] {
    return this.children;
  }

  public getPrice(): number {
    return this.children.reduce(
      (p_sum: number, p_child: ProductComponent) => p_sum + p_child.getPrice(),
      0,
    );
  }
}

class FamilyMembersComposite extends ProductComposite {
  public constructor(private readonly p_envelopeId: string) {
    super();
  }

  public toEnvelope(): MembersEnvelope {
    const members: FamilyMemberRecord[] = [];
    for (const p_child of this.getChildren()) {
      const member: FamilyMemberRecord | null = p_child.toMember();
      if (member !== null) {
        members.push(member);
      }
    }
    return { id: this.p_envelopeId, members };
  }
}

function parseMembersEnvelope(p_envelope: unknown): FamilyMembersComposite {
  if (Array.isArray(p_envelope)) {
    throw new Error("family_members must be an envelope");
  }
  if (!isRecord(p_envelope)) {
    throw new Error("family_members must be an envelope");
  }
  if (typeof p_envelope.id !== "string" || !Array.isArray(p_envelope.members)) {
    throw new Error("family_members must be an envelope");
  }
  const hub: FamilyMembersComposite = new FamilyMembersComposite(p_envelope.id);
  for (const p_member of p_envelope.members) {
    if (!isRecord(p_member)) {
      throw new Error("invalid member");
    }
    if ("photo" in p_member || "img" in p_member || "image" in p_member) {
      throw new Error("photo keys forbidden");
    }
    const userId: string | null = typeof p_member.user_id === "string" ? p_member.user_id : null;
    if (typeof p_member.user_nickname !== "string" || typeof p_member.user_role !== "string") {
      throw new Error("invalid member");
    }
    hub.add(new ProductLeaf(p_member.user_nickname, 0, userId, p_member.user_role));
  }
  return hub;
}

function parseAddress(p_address: unknown): FamilyAddress {
  let parsed: unknown = p_address;
  if (typeof p_address === "string") {
    parsed = JSON.parse(p_address);
  }
  if (!isRecord(parsed)) {
    throw new Error("address must be a plain object");
  }
  if (Array.isArray(parsed.address) || ("id" in parsed && "address" in parsed)) {
    throw new Error("address envelope forbidden");
  }
  if (
    typeof parsed.street !== "string" ||
    typeof parsed.number !== "string" ||
    typeof parsed.neighborhood !== "string" ||
    typeof parsed.city !== "string" ||
    typeof parsed.state !== "string" ||
    typeof parsed.zip_code !== "string"
  ) {
    throw new Error("address fields must be strings");
  }
  return {
    street: parsed.street,
    number: parsed.number,
    neighborhood: parsed.neighborhood,
    city: parsed.city,
    state: parsed.state,
    zip_code: parsed.zip_code,
  };
}

export class Family {
  private static _instance: Family | null = null;

  private constructor() {}

  public static get instance(): Family {
    if (Family._instance === null) {
      Family._instance = new Family();
    }
    return Family._instance;
  }

  public insert(p_input: FamilyInsertInput): FamilyRecord {
    getConnection();
    const parsedMembers: unknown = JSON.parse(p_input.family_members);
    if (Array.isArray(parsedMembers)) {
      throw new Error("family_members must be an envelope");
    }
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO family (
        id, fam_profile_id, fam_diary_id, status, family_members, address, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p_input.fam_profile_id,
        p_input.fam_diary_id,
        p_input.status,
        p_input.family_members,
        p_input.address,
        now,
        now,
      ],
    );
    return {
      id,
      fam_profile_id: p_input.fam_profile_id,
      fam_diary_id: p_input.fam_diary_id,
      status: p_input.status,
      family_members: p_input.family_members,
      address: p_input.address,
      plan_id: null,
    };
  }

  public list(): FamilyListRow[] {
    getConnection();
    return queryRaw<FamilyListRow>(`SELECT id, status, plan_id FROM family`, []);
  }

  public findHolderUserId(p_familyId: string): string | null {
    getConnection();
    const rows: Array<{ family_members: string }> = queryRaw<{ family_members: string }>(
      `SELECT family_members FROM family WHERE id = ?`,
      [p_familyId],
    );
    const firstRow: { family_members: string } | undefined = rows[0];
    if (firstRow === undefined) {
      return null;
    }
    const parsed: unknown = JSON.parse(firstRow.family_members);
    if (!isRecord(parsed) || !Array.isArray(parsed.members) || parsed.members.length === 0) {
      return null;
    }
    const firstMember: unknown = parsed.members[0];
    if (!isRecord(firstMember) || typeof firstMember.user_id !== "string") {
      return null;
    }
    return firstMember.user_id;
  }

  public replaceMembers(p_familyId: string, p_envelope: unknown): MembersEnvelope {
    getConnection();
    const hub: FamilyMembersComposite = parseMembersEnvelope(p_envelope);
    const persisted: MembersEnvelope = hub.toEnvelope();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE family SET family_members = ?, updated_at = ? WHERE id = ?`, [
      JSON.stringify(persisted),
      now,
      p_familyId,
    ]);
    return persisted;
  }

  public replaceAddress(p_familyId: string, p_address: unknown): FamilyAddress {
    getConnection();
    const address: FamilyAddress = parseAddress(p_address);
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE family SET address = ?, updated_at = ? WHERE id = ?`, [
      JSON.stringify(address),
      now,
      p_familyId,
    ]);
    return address;
  }

  public updatePlanId(p_familyId: string, p_planId: string): void {
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE family SET plan_id = ?, updated_at = ? WHERE id = ?`, [
      p_planId,
      now,
      p_familyId,
    ]);
  }
}
