import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrangeFamilyViaApi,
  arrangeSecondParent,
  familyRouteParams,
  jsonRequest,
} from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type AddressObject = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

describe("PUT /api/families/[id]/address", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("echoes the plain address object for the titular", async () => {
    // Break: not 200 or response is an envelope instead of the street object.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/address/route");
    const payload: AddressObject = {
      street: "Rua A",
      number: "10",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      zip_code: "80000-000",
    };
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/address`,
        "PUT",
        payload,
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const body: AddressObject = (await response.json()) as AddressObject;
    expect(response.status).toBe(200);
    expect(body).toEqual(payload);
  });

  it("rejects an address envelope with 400", async () => {
    // Break: { id, address: [] } is accepted as a valid address.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/address/route");
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/address`,
        "PUT",
        { id: "x", address: [] },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });

  it("rejects an invited non-titular PUT with 403", async () => {
    // Break: invited/non-titular Parent updates address (200).
    const arranged = await arrangeFamilyViaApi();
    const outsider = await arrangeSecondParent();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/address/route");
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/address`,
        "PUT",
        {
          street: "Rua A",
          number: "10",
          neighborhood: "Centro",
          city: "Curitiba",
          state: "PR",
          zip_code: "80000-000",
        },
        outsider.id,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });

  it("allows an empty city with 200", async () => {
    // Break: empty city is rejected.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/address/route");
    const payload: AddressObject = {
      street: "Rua A",
      number: "10",
      neighborhood: "Centro",
      city: "",
      state: "PR",
      zip_code: "80000-000",
    };
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/address`,
        "PUT",
        payload,
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const body: AddressObject = (await response.json()) as AddressObject;
    expect(response.status).toBe(200);
    expect(body.city).toBe("");
    expect(body.state).toBe("PR");
  });
});
