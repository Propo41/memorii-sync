import { getInitialStack, reviewFlashcard } from '../helpers/utility';
import { Card } from '../models/dto/Card';

let cards = [new Card('Hello', 'this is hello'), new Card('Hello1', 'this is hello1')];

// export const runTest = () => {
//   let currentDate = new Date().getTime();
//   cards = getInitialStack(cards);
//   console.log(cards);

//   console.log('cards for today: ', cards.length);

//   //reviewFlashcard(cards[0], 2.5);
//   if (cards.length > 0) {
//     reviewFlashcard(cards[1], 2.5);
//    // reviewFlashcard(cards[1], 4.5);
//     console.log(cards);

//     currentDate = new Date().getTime();

//     cards = getInitialStack(cards, currentDate + 0 * 24 * 60 * 60 * 1000);
//     console.log('cards for today: ', cards.length);
//   }
// };
