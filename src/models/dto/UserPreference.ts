import { Language } from '../../config';
import { Appearance } from './Appearance';

export class UserPreference {
  isDarkMode: boolean = false;
  locale: Language = 'English';
  cardAppearance: Appearance = new Appearance('#fff', '#fff'); // currently not supported
  usingSm2: boolean = true;

  constructor(isDarkMode?: boolean | null, locale?: Language | null, usingSm2?: boolean, cardAppearance?: Appearance) {
    this.isDarkMode = isDarkMode || this.isDarkMode;
    this.locale = locale || this.locale;
    this.cardAppearance = cardAppearance || this.cardAppearance;
    this.usingSm2 = usingSm2 || this.usingSm2;
  }

  static transform(_userPreference: InstanceType<typeof UserPreference>): UserPreference {
    const userPreference = new UserPreference();
    userPreference.isDarkMode = _userPreference.isDarkMode;
    userPreference.locale = _userPreference.locale;
    userPreference.cardAppearance = Appearance.transform(_userPreference.cardAppearance);
    userPreference.usingSm2 = _userPreference.usingSm2;

    return userPreference;
  }
}
