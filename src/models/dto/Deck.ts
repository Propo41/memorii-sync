import { Appearance } from './Appearance';
import { Set } from './Set';

export class Deck {
  id?: string;
  name: string;
  appearance: Appearance;
  sets: Set[] = [];
  isDisabled: boolean = false;
  _progress?: number;

  constructor(name: string, appearance?: Appearance) {
    this.name = name;
    this.appearance = appearance || new Appearance('#FF9497', '#ED6468', '#FFCACB');
  }

  static transform(_deck: InstanceType<typeof Deck>): Deck {
    const deck = new Deck(_deck.name);
    deck.appearance = Appearance.transform(_deck.appearance);
    deck.sets = _deck.sets.map((set, i) => {
      set._id = i;
      return Set.transform(set);
    });
    deck.isDisabled = _deck.isDisabled;

    return deck;
  }
}
