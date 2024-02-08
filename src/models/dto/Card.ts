export class Card {
  id: number;
  front: string;
  back: string;
  backLocale: string;
  example?: string;
  type?: string; // verb/adj/noun
  audio?: string; // url of the audio track

  constructor(id: number, front: string, back: string, backLocale = '', example = '', type?: string, audio?: string) {
    this.id = id;
    this.front = front;
    this.back = back;
    this.backLocale = backLocale; 
    this.example = example;
    this.type = type;
    this.audio = audio;
  }

  static transform(_card: InstanceType<typeof Card>): Card {
    const card = new Card(_card.id, _card.front, _card.back, _card.backLocale || '', _card.example || '', _card.type, _card.audio);
    return card;
  }
}
