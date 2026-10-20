import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeFamilyViaHusk } from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type AddressObject = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

type AddressRow = {
  address: string;
  city: string;
  state: string;
};

describe("Family.replaceAddress", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("stores a plain address object without an id wrapper", async () => {
    // Break: address stored as { id, address: [] } or missing street keys.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    const address: AddressObject = {
      street: "Rua A",
      number: "10",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      zip_code: "80000-000",
    };
    Family.instance.replaceAddress(arranged.familyId, address);
    const rows: AddressRow[] = queryRaw<AddressRow>(
      "SELECT address, city, state FROM family WHERE id = ?",
      [arranged.familyId],
    );
    const stored: AddressObject = JSON.parse(rows[0].address) as AddressObject;
    expect(stored).toEqual(address);
    expect(Object.prototype.hasOwnProperty.call(stored, "id")).toBe(false);
    expect(rows[0].city).toBe("Curitiba");
    expect(rows[0].state).toBe("PR");
  });

  it("allows an empty city and projects generated city/state", async () => {
    // Break: empty city is rejected, or generated city/state miss JSON.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    Family.instance.replaceAddress(arranged.familyId, {
      street: "Rua A",
      number: "10",
      neighborhood: "Centro",
      city: "",
      state: "PR",
      zip_code: "80000-000",
    });
    const rows: AddressRow[] = queryRaw<AddressRow>(
      "SELECT city, state FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0].city).toBe("");
    expect(rows[0].state).toBe("PR");
  });

  it("rejects an address envelope", async () => {
    // Break: { id, address: [] } is stored as the address object.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    expect(typeof Family.instance.replaceAddress).toBe("function");
    expect(() => {
      Family.instance.replaceAddress(arranged.familyId, { id: "x", address: [] });
    }).toThrow();
  });

  it("rejects invalid JSON and leaves city unchanged", async () => {
    // Break: invalid JSON is written, or city is cleared after the throw.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    Family.instance.replaceAddress(arranged.familyId, {
      street: "Rua A",
      number: "10",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      zip_code: "80000-000",
    });
    expect(() => {
      Family.instance.replaceAddress(arranged.familyId, "{");
    }).toThrow();
    const rows: AddressRow[] = queryRaw<AddressRow>(
      "SELECT city, state FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0].city).toBe("Curitiba");
    expect(rows[0].state).toBe("PR");
  });
});
