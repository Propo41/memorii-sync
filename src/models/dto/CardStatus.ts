export interface IStatus {
  // spaced repitition stuff
  easiness: number; // Reflects how easy it is to recall the content, 2.5 minimum
  interval: number; // The number of days after which a review is need
  repetitions: number; // How many times the flashcard has been recalled correctly in a row
  nextReview: number; // The earliest date we can review the flashcard (ms)
  isCompleted: boolean;
}

export class CardStatus implements IStatus {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReview: number; // review it on the day of creation or later
  isCompleted: boolean;

  constructor(easiness = 2.5, interval = 1, repetitions = 0, nextReview = new Date().getTime(), isCompleted = false) {
    this.easiness = easiness;
    this.interval = interval;
    this.repetitions = repetitions;
    this.nextReview = nextReview;
    this.isCompleted = isCompleted;
  }

  static transform(_status: InstanceType<typeof CardStatus>): CardStatus {
    const status = new CardStatus(_status.easiness, _status.interval, _status.repetitions, _status.nextReview, _status.isCompleted);
    return status;
  }
}
