const AppState = {
  language: 'English',
  colorMode: 'dark',
};

function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

const decknames = ['English', 'IELTS', 'Biology', 'Moller'];

export const dummyDecks = decknames.map((name, i) => {
  return {
    name: name + i,
    appearance: {
      bgColor: '#FF9497',
      fgColor: '#ED6468',
      trackColor: '#FFCACB',
    },
    isDisabled: false,
    sets: [...Array(3)].map((_, i) => {
      return {
        name: `Set-${i}`,
        appearance: {
          bgColor: generateRandomColor(),
          fgColor: generateRandomColor(),
        },
        cards: [...Array(10)].map((_, i) => {
          return {
            id: i,
            front: 'Cat' + i,
            back: 'this is a cat' + i,
          };
        }),
      };
    }),
  };
});

export const dummyUser = {
  name: 'Ahnaf',
  email: 'aliahnaf@gmail.com',
  profilePicture: 'https://api.dicebear.com/7.x/pixel-art/svg',
  preferences: {
    isDarkMode: true,
    locale: 'EN',
    cardAppearance: {
      bgColor: '',
      fgColor: '',
    },
  },
  decksPurchased: []
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
