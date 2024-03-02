import { _CardStatus } from '.';
import { Appearance } from './Appearance';
import { Card } from './Card';
import uuid from 'react-native-uuid';

export class Set {
  id: string = uuid.v4().toString();
  name: string;
  appearance: Appearance;
  cards: Card[] = [];
  _progress?: number;
  cardStatuses: Record<string, _CardStatus> = {};
  createdAt = new Date().getTime();

  constructor(name: string, appearance?: Appearance) {
    this.name = name;
    this.appearance = appearance || new Appearance('#F48B8E', '#F35B60');
  }

  static transform(_set: InstanceType<typeof Set>): Set {
    const set = new Set(_set.name, Appearance.transform(_set.appearance));
    set.cards = _set.cards?.map((card) => Card.transform(card));
    set.id = _set.id;
    set.cardStatuses = _set.cardStatuses;
    set.createdAt = _set.createdAt;

    return set;
  }
}
