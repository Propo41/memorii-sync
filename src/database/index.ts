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
      },
      {
        name: 'Intermediate',
        cards: [...Array(20)].map((_, i) => `Horse-${i}`),
        completed: 5,
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
}

export const getDecks = () => {
  return decks;
};
