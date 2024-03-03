import uuid from 'react-native-uuid';

export interface IFlashcard {
  id: string; // To uniquely identify flashcards
  front: string; // The text that goes on the front of the card
  back: string; // The answer to the question
  back2: string;
  example?: string;
  type?: string; // verb/adj/noun
  audio?: string; // url of the audio track
}

export class Card implements IFlashcard {
  id: string = uuid.v4().toString();
  front: string;
  back: string;
  back2: string;
  example?: string;
  type?: string; // verb/adj/noun
  audio?: string; // url of the audio track
  createdAt = new Date().getTime();

  constructor(front: string = '', back: string = '', back2 = '', example = '', type?: string, audio?: string) {
    this.front = front;
    this.back = back;
    this.back2 = back2;
    this.example = example;
    this.type = type;
    this.audio = audio;
  }

  static transform(_card: InstanceType<typeof Card>): Card {
    const card = new Card(_card.front, _card.back, _card.back2 || '', _card.example || '', _card.type, _card.audio);
    card.id = _card.id;

    return card;
  }
}
