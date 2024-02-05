export class Card {
  id: number;
  front: string;
  back: string;
  backLocale: string;

  constructor(id: number, front: string, back: string, backLocale = '') {
    this.id = id;
    this.front = front;
    this.back = back;
    this.backLocale = backLocale;
  }

  static transform(_card: InstanceType<typeof Card>): Card {
    const card = new Card(_card.id, _card.front, _card.back);
    card.backLocale = _card.backLocale || '';

    return card;
  }
}
