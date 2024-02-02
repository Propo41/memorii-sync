import { _Deck, _Set, _User } from './dto';
import firestore from '@react-native-firebase/firestore';

interface FirebaseAppInterface {
  getUser(userId: string): Promise<_User | null>;
  createUser(user: _User): Promise<string>;
  updateUser(userId: string, user: _User): Promise<void>;

  createDeck(deck: _Deck): Promise<string>;
  getDeck(deckId: string): Promise<_Deck | null>;
  updateDeck(deckId: string, deck: _Deck): Promise<void>;
  deleteDeck(userId: string, deckId: string): Promise<void>;

  createSet(set: _Set): Promise<string>;
  getSet(setId: string): Promise<_Set | null>;
  updateSet(setId: string, set: _Set): Promise<void>;
  deleteSet(userId: string, deckId: string, setId: string): Promise<void>;

  updateCardStatuses(userId: string, deckId: string, setId: string, statuses: Record<number, boolean>): Promise<void>;
  getDeckStatus(userId: string, deckId: string): Promise<number | null>;
  getCardStatuses(userId: string, deckId: string, setId: string): Promise<Record<number, boolean> | null>;
  getSetStatuses(userId: string, deckId: string): Promise<Map<string, number>>;
}

export class FirebaseApp implements FirebaseAppInterface {
  private static instance: FirebaseApp | null = null;
  private collections = { users: 'users', decks: 'decks', sets: 'sets', market: 'market', completed: 'completed' };

  constructor() {
    firestore().settings({
      ignoreUndefinedProperties: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });
  }

  static getInstance(): FirebaseApp {
    if (!FirebaseApp.instance) {
      FirebaseApp.instance = new FirebaseApp();
    }
    return FirebaseApp.instance;
  }

  async getUser(userId: string): Promise<_User | null> {
    try {
      const snapshot = await firestore().collection(this.collections.users).doc(userId).get();
      if (snapshot.exists) {
        return _User.transform(snapshot.data() as InstanceType<typeof _User>);
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  async updateUser(userId: string, user: _User): Promise<void> {
    await firestore().collection(this.collections.users).doc(userId).update(user);
  }

  async createUser(user: _User): Promise<string> {
    const doc = await firestore().collection(this.collections.users).add(user);
    return doc.id;
  }

  async createDeck(deck: _Deck): Promise<string> {
    const doc = await firestore().collection(this.collections.decks).add(deck);
    return doc.id;
  }

  async getDeck(deckId: string): Promise<_Deck | null> {
    const snapshot = await firestore().collection(this.collections.decks).doc(deckId).get({ source: 'cache' });
    if (snapshot.exists) {
      return _Deck.transform(snapshot.data() as InstanceType<typeof _Deck>);
    }

    return null;
  }

  async updateDeck(deckId: string, deck: _Deck): Promise<void> {
    await firestore().collection(this.collections.decks).doc(deckId).update(deck);
  }

  async deleteDeck(userId: string, deckId: string): Promise<void> {
    await firestore().collection(this.collections.decks).doc(deckId).delete();
    await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).delete();
  }

  async createSet(set: _Set): Promise<string> {
    const doc = await firestore().collection(this.collections.sets).add(set);
    return doc.id;
  }

  async getSet(setId: string): Promise<_Set | null> {
    const snapshot = await firestore().collection(this.collections.sets).doc(setId).get({
      source: 'cache',
    });
    if (snapshot.exists) {
      return _Set.transform(snapshot.data() as InstanceType<typeof _Set>);
    }
    return null;
  }

  async updateSet(setId: string, set: _Set): Promise<void> {
    await firestore().collection(this.collections.sets).doc(setId).update(set);
  }

  async deleteSet(userId: string, deckId: string, setId: string): Promise<void> {
    await firestore().collection(this.collections.decks).doc(setId).delete();
    await firestore()
      .collection(this.collections.completed)
      .doc(`${userId}.${deckId}`)
      .update({
        [setId]: firestore.FieldValue.delete(),
      });
  }

  async updateCardStatuses(userId: string, deckId: string, setId: string, statuses: Record<number, boolean>): Promise<void> {
    await firestore()
      .collection(this.collections.completed)
      .doc(`${userId}.${deckId}`)
      .set({ [setId]: statuses }, { merge: true });
  }

  async getCardStatuses(userId: string, deckId: string, setId: string): Promise<Record<number, boolean> | null> {
    const snapshot = await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).get({
      source: 'cache',
    });
    if (snapshot.exists) {
      return snapshot.data()![setId];
    }

    return null;
  }

  // returns the count of true values in completed/$userid.deckid
  async getDeckStatus(userId: string, deckId: string): Promise<number> {
    const snapshot = await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).get({
      source: 'cache',
    });
    let count = 0;

    if (snapshot.exists) {
      const data = snapshot.data();

      for (const key in data) {
        const innerObj = data[key];
        for (const innerKey in innerObj) {
          if (innerObj[innerKey] === true) {
            count++;
          }
        }
      }
    }
    return count;
  }

  // returns the count of true values in completed/$userid.deckid
  async getSetStatuses(userId: string, deckId: string): Promise<Map<string, number>> {
    const snapshot = await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).get({
      source: 'cache',
    });
    const statuses: Map<string, number> = new Map<string, number>();

    if (snapshot.exists) {
      const data = snapshot.data();
      for (const key in data) {
        let count = 0;
        const innerObj = data[key];
        for (const innerKey in innerObj) {
          if (innerObj[innerKey] === true) {
            count++;
          }
        }

        statuses.set(key, count);
      }
    }
    return statuses;
  }
}
