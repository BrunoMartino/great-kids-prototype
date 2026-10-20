export const SEEDED_FAMILY_ID: string =
  "c10a0003-3333-4333-8333-000000000010";

export const SEEDED_TITULAR_USER_ID: string =
  "c10a0001-1111-4111-8111-000000000003";

export const SEEDED_ACCEPTED_CYCLE_ID: string =
  "c10a0007-7777-4777-8777-000000000001";

export const SEEDED_ACCEPTED_TITLE: string = "Living room fort";

export type SeededPublishedMission = {
  id: string;
  title: string;
};

export const SEEDED_PUBLISHED_MISSIONS: readonly SeededPublishedMission[] = [
  { id: "c10a0004-4444-4444-8444-000000000001", title: "Movie night" },
  { id: "c10a0004-4444-4444-8444-000000000002", title: "Cartoon Saturday" },
  { id: "c10a0004-4444-4444-8444-000000000003", title: "Bedtime story" },
  { id: "c10a0004-4444-4444-8444-000000000004", title: "Paper boats" },
  { id: "c10a0004-4444-4444-8444-000000000005", title: "Living room fort" },
];

export const SEEDED_PLANS: readonly { id: string; name: string }[] = [
  { id: "24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1", name: "Free" },
  { id: "c10a0002-2222-4222-8222-000000000001", name: "Plus" },
];
