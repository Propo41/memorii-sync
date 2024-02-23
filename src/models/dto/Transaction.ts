export class Transaction {
  userId: string;
  date: Record<string, string | null>;
  productId: string;

  constructor(userId: string, date: Record<string, string | null>, productId: string) {
    this.userId = userId;
    this.date = date;
    this.productId = productId;
  }

  static transform(_trans: InstanceType<typeof Transaction>): Transaction {
    const trans = new Transaction(_trans.userId, _trans.date, _trans.productId);
    trans.userId = _trans.userId;
    trans.date = _trans.date;
    trans.productId = _trans.productId;

    return trans;
  }
}
