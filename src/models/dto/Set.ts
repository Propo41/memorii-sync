import { Appearance } from './Appearance';
import { Card } from './Card';

export class Set {
  _id?: number; // temporary. not stored in db
  name: string;
  appearance: Appearance;
  cards: Card[] = [];

  constructor(name: string, appearance?: Appearance) {
    this.name = name;
    this.appearance = appearance || new Appearance('#F48B8E', '#F35B60');
  }

  static transform(_set: InstanceType<typeof Set>): Set {
    const set = new Set(_set.name, Appearance.transform(_set.appearance));
    set.cards = _set.cards?.map((card) => Card.transform(card));
    set._id = _set._id;

    return set;
  }
}
