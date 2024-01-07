import { Avatar, makeStyles, useTheme } from '@rneui/themed';
import React from 'react';
import { ScrollView, View } from 'react-native';
import Deck from '../components/Deck';
import TitleBar from '../components/TitleBar';
import { iconSize } from '../config';
import { NavProps, NavRoutes } from '../config/routes';
import { getDecks, getUser } from '../database';
import { toSize } from '../helpers/scaling';

export default function HomeScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const [decks, setDecks] = React.useState([]);
  const [user, setUser] = React.useState([]);

  React.useEffect(() => {
    const decks = getDecks();
    setDecks(decks);

    const user = getUser();
    setUser(user);
  }, []);

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TitleBar
          title="Decks"
          subtitle="Your available decks"
          icon={<Avatar size={iconSize.lg} rounded source={{ uri: user.avatar }} containerStyle={styles.avatar} />}
        />
        <View style={{ marginTop: theme.spacing.lg }}>
          {decks.map((deck, index) => {
            const { containerBgColor, pbColor, pbBackgroundColor, textColor } = deck.styles;

            let completed = 0;
            let total = 0;
            for (const set of deck.sets) {
              total += set.cards.length;
              completed += set.completed;
            }
            const progress = completed / total;

            return (
              <Deck
                key={index}
                name={deck.name}
                progress={progress}
                mt={index > 0 ? 8 : 0}
                mb={index === decks.length - 1 ? 70 : 0}
                containerBgColor={containerBgColor}
                pbColor={pbColor}
                pbBackgroundColor={pbBackgroundColor}
                textColor={textColor}
                onDeckPress={() => {
                  navigation.push(NavRoutes.Sets);
                }}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginVertical: toSize(15),
  },
}));
