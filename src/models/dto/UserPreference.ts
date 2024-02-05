import { Language } from '../../config';
import { Appearance } from './Appearance';

export class UserPreference {
  isDarkMode: boolean = false;
  locale: Language = 'English';
  cardAppearance: Appearance = new Appearance('#fff', '#fff'); // currently not supported

  constructor(isDarkMode?: boolean | null, locale?: Language | null, cardAppearance?: Appearance) {
    this.isDarkMode = isDarkMode || this.isDarkMode;
    this.locale = locale || this.locale;
    this.cardAppearance = cardAppearance || this.cardAppearance;
  }

  static transform(_userPreference: InstanceType<typeof UserPreference>): UserPreference {
    const userPreference = new UserPreference();
    userPreference.isDarkMode = _userPreference.isDarkMode;
    userPreference.locale = _userPreference.locale;
    userPreference.cardAppearance = Appearance.transform(_userPreference.cardAppearance);

    return userPreference;
  }
}
