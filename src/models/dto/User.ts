import { UserPreference } from './UserPreference';

export class User {
  id?: string;
  name: string;
  email: string;
  profilePicture: string;
  preferences: UserPreference = new UserPreference();
  decksCreated?: string[];
  decksPurchased?: string[];

  constructor(name: string, email: string, profilePicture: string) {
    this.name = name;
    this.email = email;
    this.profilePicture = profilePicture;
  }

  static transform(_user: InstanceType<typeof User>): User {
    const user = new User(_user.name, _user.email, _user.profilePicture);
    user.id = _user.id;
    user.preferences = UserPreference.transform(_user.preferences);
    user.decksCreated = _user.decksCreated;
    user.decksPurchased = _user.decksPurchased;

    return user;
  }
}
