import { _Deck, _Market, _Offering, _Set, _User, _UserPreference } from './dto';
import firestore from '@react-native-firebase/firestore';
import { fetch as netInfo } from '@react-native-community/netinfo';
import { log } from '../helpers/utility';
import storage from '@react-native-firebase/storage';

interface FirebaseAppInterface {
  getUser(userId: string): Promise<_User | null>;
  createUser(id: string, user: _User): Promise<void>;
  updateUser(userId: string, user: _User): Promise<void>;
  updateUserPreference(userId: string, preferences: _UserPreference): Promise<void>;
  makePremium(userId: string): Promise<void>;
  addDeckToUser(deckId: string, userId: string): Promise<void>;

  getDeck(deckId: string): Promise<_Deck | null>;
  fetchMarketItems(): Promise<_Market[]>;
  fetchOffers(): Promise<_Offering[]>;

  backUpDecks(userId: string, decks: _Deck[]): Promise<void>;
  restoreDecks(userId: string): Promise<_Deck[]>;
}

export class FirebaseApp implements FirebaseAppInterface {
  private static instance: FirebaseApp | null = null;
  private collections = { users: 'users', decks: 'decks', market: 'market', offers: 'offers' };

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
      const { isConnected } = await netInfo();
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

  async makePremium(userId: string): Promise<void> {
    try {
      await firestore().collection(this.collections.users).doc(userId).update({
        isPremium: true,
      });
    } catch (error: any) {
      log(error.message);
    }
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

  async getDeck(deckId: string): Promise<_Deck | null> {
    try {
      const { isConnected } = await netInfo();
      if (!isConnected) {
        return null;
      }

      const snapshot = await firestore().collection(this.collections.decks).doc(deckId).get();
      if (snapshot.exists) {
        const d = _Deck.transform(snapshot.data() as InstanceType<typeof _Deck>);
        return d;
      }
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async fetchMarketItems(): Promise<_Market[]> {
    const items: _Market[] = [];
    try {
      const snapshot = await firestore().collection(this.collections.market).get();
      for (const doc of snapshot.docs) {
        const item = _Market.transform(doc.data() as InstanceType<typeof _Market>);
        item.id = doc.id;
        items.push(item);
      }
    } catch (error: any) {
      log(error.message);
    }

    return items;
  }

  async fetchOffers(): Promise<_Offering[]> {
    const items: _Offering[] = [];
    try {
      const snapshot = await firestore().collection(this.collections.offers).get();
      for (const doc of snapshot.docs) {
        const item = _Offering.transform(doc.data() as InstanceType<typeof _Offering>);
        items.push(item);
      }
    } catch (error: any) {
      log(error.message);
    }

    return items;
  }

  async backUpDecks(userId: string, decks: _Deck[]): Promise<void> {
    if (decks.length === 0) return;

    try {
      const ref = storage().ref(`backup/${userId}/decks/data.json`);
      await ref.putString(JSON.stringify(decks), storage.StringFormat.RAW, {
        contentType: 'application/json',
        cacheControl: 'no-store', // disable caching
        customMetadata: {
          createdBy: userId,
          createdAt: new Date().toUTCString(),
        },
      });
    } catch (error: any) {
      log(error.message);
    }
  }

  async restoreDecks(userId: string): Promise<_Deck[]> {
    const decks = [];
    try {
      const url = await storage().ref(`backup/${userId}/decks/data.json`).getDownloadURL();
      const res = await (await fetch(url)).json();

      for (const item of res) {
        const deck = _Deck.transform(item as InstanceType<typeof _Deck>);
        decks.push(deck);
      }
    } catch (error: any) {
      log(error.message);
    }
    return decks;
  }
}
