export type RankerFnProtocol = (p_ids: string[]) => string;

export interface RankerProtocol {
  rank: RankerFnProtocol;
}

export class RankerDiscardError extends Error {
  public constructor() {
    super("ranker discarded");
    this.name = "RankerDiscardError";
  }
}

function firstCatalogId(p_ids: string[]): string {
  const first: string | undefined = p_ids[0];
  if (first === undefined) {
    throw new RankerDiscardError();
  }
  return first;
}

export class RankerAdapter implements RankerProtocol {
  public constructor(private readonly p_adaptee: RankerFnProtocol = firstCatalogId) {}

  public rank(p_ids: string[]): string {
    if (p_ids.length === 0) {
      throw new RankerDiscardError();
    }
    const raw: string = this.p_adaptee(p_ids);
    if (!p_ids.includes(raw)) {
      throw new RankerDiscardError();
    }
    return raw;
  }
}
