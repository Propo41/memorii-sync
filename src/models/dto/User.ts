import { UserPreference } from './UserPreference';

export class User {
  id?: string;
  name: string;
  email: string;
  profilePicture: string;
  preferences: UserPreference = new UserPreference();
  decksCreated?: string[];
  decksPurchased?: string[];
  completed?: Map<string, Map<string, number>>;

  constructor(name: string, email: string, profilePicture: string) {
    this.name = name;
    this.email = email;
    this.profilePicture = profilePicture;
  }

  static transform(_user: InstanceType<typeof User>): User | null {
    if (!_user) {
      return null;
    }

    const user = new User(_user.name, _user.email, _user.profilePicture);
    user.preferences = UserPreference.transform(_user.preferences);
    user.decksCreated = _user.decksCreated;
    user.decksPurchased = _user.decksPurchased;
    user.completed = _user.completed;

    return user;
  }
}
