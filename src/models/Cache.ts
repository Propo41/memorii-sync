import { log } from '../helpers/utility';
import { _AppInfo, _Card, _CardStatus, _Deck, _User } from './dto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

interface CacheInterface {
  getDeck(deckId: string): Promise<_Deck | null>;
  getDecks(deckIds: string[]): Promise<_Deck[]>;
  createDeck(deck: _Deck): Promise<string | null>;
  updateDeck(deckId: string, deck: _Deck): Promise<void>; // creates/updates/sets decks
  deleteDeck(deckId: string): Promise<void>;
  updateCards(deckId: string, setId: string, cards: _Card[]): Promise<void>;

  deleteCardStatuses(deckId: string, setId: string): Promise<void>;
  saveCardStatuses(deckId: string, setId: string, cardStatuses: Record<string, _CardStatus>): Promise<void>;
  getCardStatuses(deckId: string, setId: string): Promise<Record<string, _CardStatus> | null>;
  resetCardStatuses(deckId: string, setId: string): Promise<void>;

  getAppInfo(): Promise<_AppInfo | null>;
  saveAppInfo(appInfo: _AppInfo): Promise<void>;
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
      await AsyncStorage.setItem(`${this.uid}/deck/${deck.id}`, JSON.stringify(deck));
      return deck.id;
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async updateDeck(deckId: string, deck: _Deck): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.uid}/deck/${deckId}`, JSON.stringify(deck));
      console.log('updated deck', deckId, deck.name);
    } catch (error: any) {
      log(error.message);
    }
  }

  async updateCards(deckId: string, setId: string, cards: _Card[]): Promise<void> {
    try {
      const deck = await this.getDeck(deckId);
      if (!deck) return;

      const setIndex = deck.sets.findIndex((s) => s.id === setId);
      if (setIndex === -1) {
        return;
      }

      for (let card of deck.sets[setIndex].cards) {
        const _tmp = cards.find((c) => c.id === card.id);
        if (_tmp) {
          Object.assign(card, _tmp);
        }
      }

      await this.updateDeck(deckId, deck);
      console.log('updated cards');
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

  async getDecks(userDecks: string[]): Promise<_Deck[]> {
    let decks: _Deck[] = [];

    try {
      const data = await AsyncStorage.multiGet(userDecks.map((id) => `${this.uid}/deck/${id}`));
      if (data) {
        for (const pair of data) {
          if (pair[1]) {
            const deck = _Deck.transform(JSON.parse(pair[1]));
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

  async saveCardStatuses(deckId: string, setId: string, cardStatuses: Record<string, _CardStatus>): Promise<void> {
    try {
      const deck = await this.getDeck(deckId);
      if (!deck) return;

      for (const set of deck.sets) {
        if (set.id === setId) {
          set.cardStatuses = cardStatuses;
          break;
        }
      }

      await this.updateDeck(deckId, deck);
      log('Updated card statuses');
    } catch (error: any) {
      log(error.message);
    }
  }

  async getCardStatuses(deckId: string, setId: string): Promise<Record<string, _CardStatus> | null> {
    try {
      const deck = await this.getDeck(deckId);
      if (!deck) return null;

      const set = deck.sets.find((set) => set.id === setId);
      if (!set) return null;

      return set.cardStatuses;
    } catch (error: any) {
      log(error.message);
    }

    return null;
  }

  async resetCardStatuses(deckId: string, setId: string) {
    try {
      const deck = await Cache.getInstance().getDeck(deckId);
      if (!deck) return;

      for (const set of deck.sets) {
        if (set.id === setId) {
          for (const card of set.cards) {
            set.cardStatuses[card.id] = new _CardStatus();
          }
          break;
        }
      }

      await this.updateDeck(deckId, deck);
      log('Resetted card statuses');
    } catch (error: any) {
      log(error.message);
    }
  }

  async deleteAllData() {
    try {
      await AsyncStorage.clear();
    } catch (e: any) {
      log(e.message);
    }
    console.log('Purged all data');
  }

  async getAppInfo(): Promise<_AppInfo | null> {
    try {
      const data = await AsyncStorage.getItem(`appinfo`);
      if (data) {
        return _AppInfo.transform(JSON.parse(data));
      }
    } catch (error: any) {
      log(error.message);
    }
    return null;
  }

  async saveAppInfo(appInfo: _AppInfo) {
    try {
      await AsyncStorage.setItem(`appinfo`, JSON.stringify(appInfo));
    } catch (error: any) {
      log(error.message);
    }
  }
}
