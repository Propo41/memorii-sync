import { Appearance } from './Appearance';
import { Card } from './Card';

export class Set {
  name: string;
  appearance: Appearance;
  cards: Card[] = [];
  localesSupported: string[];

  constructor(name: string, appearance?: Appearance, localesSupported?: string[]) {
    this.name = name;
    this.appearance = appearance || new Appearance('#F48B8E', '#F35B60');
    this.localesSupported = localesSupported || [];
  }

  static transform(_set: InstanceType<typeof Set>): Set {
    const set = new Set(_set.name, Appearance.transform(_set.appearance), _set.localesSupported || []);
    set.cards = _set.cards?.map((card) => Card.transform(card));

    return set;
  }
}