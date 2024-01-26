import { Appearance } from './Appearance';
import { Card } from './Card';

export class Set {
  id: string;
  name: string;
  appearance: Appearance = new Appearance('#fff', '#fff', '#fff');
  cards?: Card[];

  constructor(id: string, name: string, appearance?: Appearance) {
    this.id = id;
    this.name = name;
    this.appearance = appearance || this.appearance;
  }

  static transform(_set: InstanceType<typeof Set>): Set {
    const set = new Set(_set.id, _set.name, Appearance.transform(_set.appearance));
    set.cards = _set.cards?.map((card) => Card.transform(card));

    return set;
  }
}
