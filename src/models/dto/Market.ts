export class Market {
  id?: string;
  deckId: string;
  price: number;
  discountRate?: number;
  discountValidTill?: Date;

  constructor(deckId: string, price: number) {
    this.deckId = deckId;
    this.price = price;
  }

  static transform(_market: InstanceType<typeof Market>): Market {
    const market = new Market(_market.deckId, _market.price);
    market.discountRate = _market.discountRate;
    market.discountValidTill = _market.discountValidTill;

    return market;
  }
}
