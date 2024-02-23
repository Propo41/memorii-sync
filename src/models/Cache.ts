import { log } from '../helpers/utility';
import { _Deck, _User } from './dto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import auth from '@react-native-firebase/auth';

interface CacheInterface {
  getDeck(deckId: string): Promise<_Deck | null>;
  getDecks(deckIds: string[]): Promise<_Deck[]>;
  createDeck(deck: _Deck): Promise<string | null>;
  updateDeck(deckId: string, deck: _Deck): Promise<void>; // creates/updates/sets decks
  deleteDeck(deckId: string): Promise<void>;

  deleteCardStatuses(deckId: string, setId: string): Promise<void>;
  saveCardStatuses(deckId: string, setId: string, cardStatuses: Record<number, boolean>): Promise<void>;
  getCardStatuses(deckId: string, setId: string): Promise<Record<number, boolean> | null>;
}

export class Cache implements CacheInterface {
  private static instance: Cache | null = null;
  private uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      const currentUser = auth().currentUser;

      Cache.instance = new Cache(currentUser!.uid);
    }
    return Cache.instance;
  }

  async createDeck(deck: _Deck): Promise<string | null> {
    try {
      const deckId = uuid.v4().toString();
      await AsyncStorage.setItem(`${this.uid}/deck/${deckId}`, JSON.stringify(deck));
      return deckId;
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async updateDeck(deckId: string, deck: _Deck): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.uid}/deck/${deckId}`, JSON.stringify(deck));
    } catch (error: any) {
      log(error.message);
    }
  }

  async getDeck(deckId: string): Promise<_Deck | null> {
    try {
      const deck = await AsyncStorage.getItem(`${this.uid}/deck/${deckId}`);
      if (deck) {
        return _Deck.transform(JSON.parse(deck));
      }
    } catch (error: any) {
      log(error.message);
    }
    return null;
  }

  async getDecks(deckIds: string[]): Promise<_Deck[]> {
    let decks: _Deck[] = [];
    try {
      const data = await AsyncStorage.multiGet(deckIds.map((id) => `${this.uid}/deck/${id}`));
      if (data) {
        for (const pair of data) {
          if (pair[1]) {
            const deck = _Deck.transform(JSON.parse(pair[1]));
            deck.id = pair[0].split('/')[2]; // extracting the last part which is the deck id
            decks.push(deck);
          }
        }
      }
    } catch (error: any) {
      log(error.message);
    }

    return decks;
  }

  async deleteDeck(deckId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.uid}/deck/${deckId}`);
    } catch (e: any) {
      log(e.message);
    }
  }

  async deleteCardStatuses(deckId: string, setId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.uid}/completed/${deckId}/${setId}`);
    } catch (e: any) {
      log(e.message);
    }
  }

  async saveCardStatuses(deckId: string, setId: string, cardStatuses: Record<number, boolean>): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.uid}/completed/${deckId}/${setId}`, JSON.stringify(cardStatuses));
    } catch (error: any) {
      log(error.message);
    }
  }

  async getCardStatuses(deckId: string, setId: string): Promise<Record<number, boolean> | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.uid}/completed/${deckId}/${setId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error: any) {
      log(error.message);
    }
    return null;
  }
}
