const AppState = {
  language: 'English',
  colorMode: 'dark',
};

const decks = [...Array(10)].map(() => {
  return {
    name: 'English',
    styles: {
      containerBgColor: '#F48B8E',
      pbColor: '#ED6468',
      pbBackgroundColor: '#FFCACB',
      textColor: '#3C1E64',
    },
    sets: [
      {
        name: 'Beginner',
        cards: [...Array(20)].map((_, i) => `Horse-${i}`),
        completed: 15,
        bgColor: '#F35B60',
        fgColor: '#F48B8E',
      },
      {
        name: 'Intermediate',
        cards: [...Array(20)].map((_, i) => `Horse-${i}`),
        completed: 5,
        bgColor: '#F35B60',
        fgColor: '#F48B8E',
      },
    ],
  };
});

const user = {
  name: 'Monkey D Luffy',
  avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
};

export const getAppState = () => {
  return AppState;
};

export const getUser = () => {
  return user;
};

export const getDecks = () => {
  return decks;
};

export const getSets = (deckName: string) => {
  return decks.find((deck) => deck.name === deckName)?.sets;
};
