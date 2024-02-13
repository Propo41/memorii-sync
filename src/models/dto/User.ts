import { UserPreference } from './UserPreference';

export class User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  isEmailVerified: boolean = false;
  createdAt?: string;
  preferences: UserPreference = new UserPreference();
  decksCreated: string[] = [];
  decksPurchased: string[] = [];
  isPremium: boolean = false;

  constructor(id: string, name: string, email: string, profilePicture: string, isEmailVerified?: boolean, createdAt?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.profilePicture = profilePicture;
    this.isEmailVerified = isEmailVerified || false;
    this.createdAt = createdAt;
  }

  static transform(_user: InstanceType<typeof User>): User {
    const user = new User(_user.id, _user.name, _user.email, _user.profilePicture);
    user.id = _user.id;
    user.preferences = UserPreference.transform(_user.preferences);
    user.decksCreated = _user.decksCreated;
    user.decksPurchased = _user.decksPurchased;
    user.isPremium = _user.isPremium;

    return user;
  }
}
