import { PurchasesPackage } from 'react-native-purchases';
import { Card } from './Card';

export class Market {
  id: string;
  title: string;
  deckId: string;
  subtitle: string;
  price: number;
  discountRate: number;
  color: string;
  description: string;
  samples: Card[];
  offeringIdentifier?: string; // revenue cat product identifier
  _package?: PurchasesPackage;

  constructor(
    id: string,
    title: string,
    subtitle: string,
    description: string,
    deckId: string,
    price: number,
    color: string,
    samples: Card[],
    discountRate: number = 0
  ) {
    this.id = id;
    this.deckId = deckId;
    this.price = price;
    this.title = title;
    this.subtitle = subtitle;
    this.discountRate = discountRate;
    this.color = color;
    this.description = description;
    this.samples = samples;
  }

  static transform(_market: InstanceType<typeof Market>): Market {
    const market = new Market(
      _market.id,
      _market.title,
      _market.subtitle,
      _market.description,
      _market.deckId,
      _market.price,
      _market.color,
      _market.samples,
      _market.discountRate || 0
    );

    market.offeringIdentifier = _market.offeringIdentifier;
    return market;
  }
}
