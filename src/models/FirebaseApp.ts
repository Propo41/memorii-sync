import { _Deck, _Set, _User, _UserPreference } from './dto';
import firestore from '@react-native-firebase/firestore';
import { fetch } from '@react-native-community/netinfo';
import { log } from '../helpers/utility';

interface FirebaseAppInterface {
  getUser(userId: string): Promise<_User | null>;
  createUser(id: string, user: _User): Promise<void>;
  updateUser(userId: string, user: _User): Promise<void>;
  updateUserPreference(userId: string, preferences: _UserPreference): Promise<void>;

  createDeck(deck: _Deck): Promise<string | null>;
  getDeck(deckId: string): Promise<_Deck | null>;
  updateDeck(deckId: string, deck: _Deck): Promise<void>;
  deleteDeck(userId: string, deckId: string): Promise<void>;

  updateCardStatuses(userId: string, deckId: string, setId: string, statuses: Record<number, boolean>): Promise<void>;
  getDeckStatus(userId: string, deckId: string): Promise<number | null>;
  getCardStatuses(userId: string, deckId: string, setId: string): Promise<Record<number, boolean> | null>;
  getSetStatuses(userId: string, deckId: string): Promise<Map<string, number>>;

  addDeckToUser(deckId: string, userId: string): Promise<void>;
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
      const { isConnected } = await fetch();
      const snapshot = await firestore()
        .collection(this.collections.users)
        .doc(userId)
        .get({
          source: isConnected ? 'server' : 'cache',
        });

      if (snapshot.exists) {
        return _User.transform(snapshot.data() as InstanceType<typeof _User>);
      }
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async updateUser(userId: string, user: _User): Promise<void> {
    try {
      await firestore().collection(this.collections.users).doc(userId).update(user);
    } catch (error: any) {
      log(error.message);
    }
  }

  async updateUserPreference(userId: string, preferences: _UserPreference): Promise<void> {
    try {
      await firestore().collection(this.collections.users).doc(userId).update({
        preferences,
      });
    } catch (error: any) {
      log(error.message);
    }
  }

  async createUser(id: string, user: _User): Promise<void> {
    try {
      await firestore().collection(this.collections.users).doc(id).set(user);
    } catch (error: any) {
      log(error.message);
    }
  }

  async createDeck(deck: _Deck): Promise<string | null> {
    try {
      const doc = await firestore().collection(this.collections.decks).add(deck);
      return doc.id;
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async getDeck(deckId: string): Promise<_Deck | null> {
    try {
      const { isConnected } = await fetch();
      const snapshot = await firestore()
        .collection(this.collections.decks)
        .doc(deckId)
        .get({
          source: isConnected ? 'default' : 'cache',
        });

      if (snapshot.exists) {
        const d = _Deck.transform(snapshot.data() as InstanceType<typeof _Deck>);
        d.id = deckId;
        return d;
      }
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async updateDeck(deckId: string, deck: _Deck): Promise<void> {
    try {
      await firestore().collection(this.collections.decks).doc(deckId).update(deck);
    } catch (error: any) {
      log(error.message);
    }
  }

  async deleteDeck(userId: string, deckId: string): Promise<void> {
    try {
      await firestore().collection(this.collections.decks).doc(deckId).delete();
      await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).delete();
    } catch (error: any) {
      log(error.message);
    }
  }

  async createSet(set: _Set): Promise<string | null> {
    try {
      const doc = await firestore().collection(this.collections.sets).add(set);
      return doc.id;
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async updateCardStatuses(userId: string, deckId: string, setId: string, statuses: Record<number, boolean>): Promise<void> {
    try {
      await firestore()
        .collection(this.collections.completed)
        .doc(`${userId}.${deckId}`)
        .set({ [setId]: statuses }, { merge: true });
    } catch (error: any) {
      log(error.message);
    }
  }

  async getCardStatuses(userId: string, deckId: string, setId: string): Promise<Record<number, boolean> | null> {
    try {
      const snapshot = await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).get({
        source: 'cache',
      });
      if (snapshot.exists) {
        return snapshot.data()![setId];
      }
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  // returns the count of true values in completed/$userid.deckid
  async getDeckStatus(userId: string, deckId: string): Promise<number> {
    try {
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
    } catch (error: any) {
      log(`completed/${userId}.${deckId} does not exist`, error);
    }

    return 0;
  }

  // returns the count of true values in completed/$userid.deckid
  async getSetStatuses(userId: string, deckId: string): Promise<Map<string, number>> {
    const statuses: Map<string, number> = new Map<string, number>();

    try {
      const snapshot = await firestore().collection(this.collections.completed).doc(`${userId}.${deckId}`).get({
        source: 'cache',
      });

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
    } catch (error: any) {
      log(error.message);
    }
    return statuses;
  }

  async addDeckToUser(deckId: string, userId: string) {
    try {
      await firestore()
        .collection(this.collections.users)
        .doc(userId)
        .update({
          decksCreated: firestore.FieldValue.arrayUnion(deckId),
        });
    } catch (error: any) {
      log(error.message);
    }
  }
}
