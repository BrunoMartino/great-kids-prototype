import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("AddressPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows the titular Parent to write address", async () => {
    // Break: titular Parent is denied address write.
    const { AddressPolicy } = await import("@/app/api/families/[id]/address/address-policy");
    const holderId: string = "holder-ana-1";
    expect(() => {
      AddressPolicy.assertCanWrite(holderId, "Parent", holderId);
    }).not.toThrow();
  });

  it("rejects an invited Parent address write", async () => {
    // Break: invited Parent can rewrite household address.
    const { AddressPolicy } = await import("@/app/api/families/[id]/address/address-policy");
    expect(() => {
      AddressPolicy.assertCanWrite("invited-bia-2", "Parent", "holder-ana-1");
    }).toThrow();
  });

  it("rejects a Child address write", async () => {
    // Break: Child can update address (INV-002).
    const { AddressPolicy } = await import("@/app/api/families/[id]/address/address-policy");
    const holderId: string = "holder-ana-1";
    expect(() => {
      AddressPolicy.assertCanWrite(holderId, "Child", holderId);
    }).toThrow();
  });

  it("allows Admin to write address", async () => {
    // Break: Admin role is denied address write.
    const { AddressPolicy } = await import("@/app/api/families/[id]/address/address-policy");
    expect(() => {
      AddressPolicy.assertCanWrite("admin-1", "Admin", "holder-ana-1");
    }).not.toThrow();
  });
});
