import { useFocusEffect } from '@react-navigation/native';
import { Avatar, makeStyles, useTheme } from '@rneui/themed';
import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import Deck from '../components/Deck';
import TitleBar from '../components/TitleBar';
import { iconSize } from '../config';
import { NavProps, NavRoutes } from '../config/routes';
import { toSize } from '../helpers/scaling';
import { Cache } from '../models/Cache';
import { _Deck, _User } from '../models/dto';
import { FirebaseApp } from '../models/FirebaseApp';

const fetchAndSaveDeck = async (deckId: string) => {
  const deck = await FirebaseApp.getInstance().getDeck(deckId);
  if (deck) {
    await Cache.getInstance().saveDeck(deckId, deck);
    return deck;
  }

  return null;
};

const getCompletionCount = async (userId: string, deckId: string) => {
  return await FirebaseApp.getInstance().getDeckStatus(userId, deckId);
};

const calculateDeckProgress = async (decksList: _Deck[]) => {
  for (const deck of decksList) {
    const total = deck.sets.reduce((acc, set) => acc + (set.cards?.length || 0), 0);
    const completed = await getCompletionCount(userId, deck!.id!);
    const progress = completed / total;
    deck._progress = progress;
  }
};

const userId = `SDBk0R01TxrTHF839qoL`;

export default function HomeScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const [decks, setDecks] = React.useState<_Deck[]>([]);
  const [user, setUser] = React.useState<_User>();

  useFocusEffect(
    React.useCallback(() => {
      console.log('in focus');

      const fetchData = async () => {
        // get user id from firebase.auth()
        const user = await Cache.getInstance().getUser(userId);
        setUser(user!);

        const decksList: _Deck[] = [];

        if (user?.decksPurchased) {
          for (const deckId of user.decksPurchased) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        if (user?.decksCreated) {
          for (const deckId of user.decksCreated) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        await calculateDeckProgress(decksList);
        setDecks(decksList);
      };

      fetchData();
    }, [])
  );

  return (
    <View>
      <StatusBar backgroundColor={theme.colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TitleBar
          title="Decks"
          subtitle="Your available decks"
          icon={<Avatar size={iconSize.lg} rounded source={{ uri: user?.profilePicture }} containerStyle={styles.avatar} />}
        />
        <View style={{ marginTop: theme.spacing.lg }}>
          {decks.map((deck, index) => {
            const { bgColor, fgColor, trackColor, textColor } = deck.appearance;

            return (
              <Deck
                key={index}
                name={deck.name}
                progress={deck._progress || 0}
                mt={index > 0 ? 8 : 0}
                mb={index === decks.length - 1 ? 70 : 0}
                containerBgColor={bgColor}
                pbColor={fgColor}
                pbBackgroundColor={trackColor!}
                textColor={textColor}
                onDeckPress={() => {
                  // @ts-expect-error cant fix this ts error
                  navigation.push(NavRoutes.Sets, {
                    deckId: deck.id,
                  });
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  avatar: {
    marginVertical: toSize(15),
  },
}));
