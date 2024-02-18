import { log } from '../helpers/utility';
import { _Deck, _User } from './dto';
import EncryptedStorage from 'react-native-encrypted-storage';

interface CacheInterface {
  saveDeck(deckId: string, deck: _Deck): Promise<void>;
  getDeck(deckId: string): Promise<_Deck | null>;
}

export class Cache implements CacheInterface {
  private static instance: Cache | null = null;

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  async saveDeck(deckId: string, deck: _Deck): Promise<void> {
    try {
      await EncryptedStorage.setItem(deckId, JSON.stringify(deck));
    } catch (error: any) {
      log(error.message);
    }
  }

  async getDeck(deckId: string): Promise<_Deck | null> {
    try {
      const deck = await EncryptedStorage.getItem(deckId);
      if (deck) {
        return _Deck.transform(JSON.parse(deck));
      }
    } catch (error: any) {
      log(error.message);
    }
    return null;
  }

  async saveCardStatuses(userId: string, deckId: string, setId: string, cardStatuses: Record<number, boolean>): Promise<void> {
    try {
      await EncryptedStorage.setItem(`${deckId}:${userId}:${setId}`, JSON.stringify(cardStatuses));
    } catch (error: any) {
      log(error.message);
    }
  }

  async getCardStatuses(userId: string, deckId: string, setId: string): Promise<Record<number, boolean> | null> {
    try {
      const user = await EncryptedStorage.getItem(`${deckId}:${userId}:${setId}`);
      if (user) {
        return JSON.parse(user);
      }
    } catch (error: any) {
      log(error.message);
    }
    return null;
  }
}
