export class Card {
  id: number;
  front: string;
  back: string;
  back_locale?: { locale: string; value: string };

  constructor(id: number, front: string, back: string) {
    this.id = id;
    this.front = front;
    this.back = back;
  }

  static transform(_card: InstanceType<typeof Card>): Card {
    const card = new Card(_card.id, _card.front, _card.back);
    card.back_locale = _card.back_locale;
  
    return card;
  }
}
