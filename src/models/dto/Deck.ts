import { Appearance } from './Appearance';
import { Set } from './Set';

export class Deck {
  id?: string;
  name: string;
  appearance: Appearance = new Appearance('#fff', '#fff', '#fff');
  sets: Set[] = [];

  constructor(name: string, appearance?: Appearance) {
    this.name = name;
    this.appearance = appearance || this.appearance;
  }

  static transform(_deck: InstanceType<typeof Deck>): Deck {
    const deck = new Deck(_deck.name);
    deck.id = _deck.id;
    deck.appearance = Appearance.transform(_deck.appearance);
    deck.sets = _deck.sets.map(set => Set.transform(set));

    return deck;
  }
}