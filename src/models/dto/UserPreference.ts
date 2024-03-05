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
    this.usingSm2 = usingSm2 === true ? true : false;
  }

  static transform(_userPreference: InstanceType<typeof UserPreference>): UserPreference {
    const userPreference = new UserPreference(
      _userPreference.isDarkMode,
      _userPreference.locale,
      _userPreference.usingSm2,
      Appearance.transform(_userPreference.cardAppearance)
    );

    return userPreference;
  }
}
