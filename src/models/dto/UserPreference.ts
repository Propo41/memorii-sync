import { Appearance } from "./Appearance";

export class UserPreference {
  isDarkMode: boolean = false;
  locale: string = 'EN';
  cardAppearance: Appearance = new Appearance('#fff', '#fff'); // currently not supported

  static transform(_userPreference: InstanceType<typeof UserPreference>): UserPreference {
    const userPreference = new UserPreference();
    userPreference.isDarkMode = _userPreference.isDarkMode;
    userPreference.locale = _userPreference.locale;
    userPreference.cardAppearance = Appearance.transform(_userPreference.cardAppearance);
    
    return userPreference;
  }
}