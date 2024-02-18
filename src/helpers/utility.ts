import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { showToast } from '../components/CustomToast';
import { NavRoutes } from '../config/routes';
import auth from '@react-native-firebase/auth';
import { Card } from '../models/dto/Card';

export const isValidUrl = (url: string | undefined) => {
  if (!url || url.length === 0) return false;
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

const possible_headers = [
  { header: 'front', required: true },
  { header: 'type', required: false },
  { header: 'back', required: true },
  { header: 'example', required: false },
  { header: 'backLocale', required: false, needPremium1: true },
  { header: 'audio', required: false, needPremium1: true },
];

/**
 * The .tsv file can have the @possible_headers in any order
 * @note: the first row is assumed to be the table headers. Check @possible_headers for the allowed headers
 * @returns Card[]
 * @param {string} rawData contains tab separated values
 */
export const rawToCards = async (rawData: string, hasPremiumAccess: boolean = false) => {
  const lines = rawData.split('\n');
  const cards: Card[] = [];

  const headers = lines[0].trim().split('\t');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.trim().split('\t');
    const card = new Card(i - 1);

    for (const ph of possible_headers) {
      const index = headers.findIndex((val: any) => val.toLowerCase() === ph.header);

      // if its a required card but value is missing, exit
      if (index === -1 && ph.required === true) {
        return null;
      }

      if (ph.needPremium1 && !hasPremiumAccess) {
        // @ts-expect-error ignore it
        card[ph.header] = '';
        continue;
      }

      const item = columns[index] || '';
      // @ts-expect-error ignore it
      card[ph.header] = item;
    }

    cards.push(card);
  }

  return cards;
};
