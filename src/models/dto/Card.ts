export class Card {
  id: number;
  front: string;
  back: string;
  backLocale: string;
  example?: string;

  constructor(id: number, front: string, back: string, backLocale = '', example = '') {
    this.id = id;
    this.front = front;
    this.back = back;
    this.backLocale = backLocale;
    this.example = example;
  }

  static transform(_card: InstanceType<typeof Card>): Card {
    const card = new Card(_card.id, _card.front, _card.back, _card.backLocale || '', _card.example || '');
    return card;
  }
}
