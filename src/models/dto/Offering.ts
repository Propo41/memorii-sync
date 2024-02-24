import { PurchasesPackage } from 'react-native-purchases';

export class Offering {
  offeringIdentifier?: string; // revenue cat product identifier
  type: string;
  summary: string[];
  _package?: PurchasesPackage;

  constructor(type: string, summary: string[]) {
    this.type = type;
    this.summary = summary;
  }

  static transform(_offering: InstanceType<typeof Offering>): Offering {
    const offering = new Offering(_offering.type, _offering.summary);
    offering.offeringIdentifier = _offering.offeringIdentifier || '';

    return offering;
  }
}
