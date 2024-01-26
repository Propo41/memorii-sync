import { Deck, Set, User } from './dto';

interface FirebaseAppInterface {
  getUser(userId: string): Promise<User | null>;
  setUser(user: User): Promise<void>;

  createDeck(deck: Deck): Promise<void>;
  getDeck(deckId: string): Promise<Deck | null>;
  updateDeck(deckId: string, deck: Deck): Promise<void>;
  deleteDeck(deckId: string): Promise<void>;

  createSet(set: Set): Promise<void>;
  getSet(setId: string): Promise<Set | null>;
  updateSet(setId: string, set: Set): Promise<void>;
  deleteSet(setId: string): Promise<void>;

  updateCardStatuses(userId: string, deckSetId: string, status: Map<string, boolean>): Promise<void>;
}

export class FirebaseApp implements FirebaseAppInterface {
    
}
