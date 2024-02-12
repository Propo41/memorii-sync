import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { showToast } from '../components/CustomToast';
import { NavRoutes } from '../config/routes';
import auth from '@react-native-firebase/auth';
import { Card } from '../models/dto/Card';

export const isValidUrl = (url: string) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

export const log = (message: string, data?: object) => {
  console.log(message, data ? data : '');
};

export const kickUser = async (navigation: any, t: any) => {
  try {
    showToast(t('screens.toast.sessionExpired'), 'error');
    await auth().signOut();
    await GoogleSignin.revokeAccess();
    navigation.replace(NavRoutes.Login);
  } catch (error) {
    navigation.replace(NavRoutes.Login);
  }
};

/**
 * @note: the first row is assumed to be the table headers
 * @returns Card[]
 * @param {string} rawData contains tab separated values
 */
export const rawToCards = async (rawData: string) => {
  const lines = rawData.split('\n');
  let id = -1; // first row is the table header
  const cards = [];
  for (const line of lines) {
    if (id === -1) {
      id++;
      continue;
    }

    const columns = line.trim().split('\t');
    const [word, type, meaning, example] = columns;

    const meaning2 = '';
    const audio = '';

    const card = new Card(id, word, meaning, meaning2, example, type, audio);
    cards.push(card);
    id++;
  }

  return cards;
};
