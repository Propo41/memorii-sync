import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { makeStyles, useTheme } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import Set from '../components/Set';
import { Cache } from '../models/Cache';
import { _Set } from '../models/dto';
import { FirebaseApp } from '../models/FirebaseApp';
import { useFocusEffect } from '@react-navigation/native';

const userId = `SDBk0R01TxrTHF839qoL`;

export default function SetsScreen({ navigation, route }: NavProps) {
  const { theme } = useTheme();
  const [sets, setSets] = useState<_Set[]>([]);
  const [statuses, setStatuses] = useState<Map<string, number>>();
  const [deckId, setDeckId] = useState();

  useFocusEffect(
    React.useCallback(() => {
      // Perform actions you want to do when the screen is focused
      const { deckId } = route.params!;

      const getData = async (userId: string, deckId: string) => {
        const deck = await Cache.getInstance().getDeck(deckId);
        setSets(deck?.sets || []);

        const statuses = await FirebaseApp.getInstance().getSetStatuses(userId, deckId);
        setStatuses(statuses);
      };

      getData(userId, deckId);
      setDeckId(deckId);

      console.log('in focus');
      

      // You can check for conditions or execute code when returning from another view
      // For example, check for changes in state or props
    }, [])
  );

  //navigation.navigate()

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title="Sets" />
        <View style={{ marginTop: theme.spacing.sm }}>
          {sets.map((set, index) => {
            const { name, cards, appearance } = set;
            const { bgColor, fgColor } = appearance;

            return (
              <Set
                key={index}
                name={name}
                completed={statuses?.get(index.toString()) || 0}
                total={cards.length}
                mt={index > 0 ? 8 : 0}
                mb={index === sets.length - 1 ? 70 : 0}
                fgColor={fgColor}
                bgColor={bgColor}
                onSetPress={() => {
                  navigation.push(NavRoutes.Cards, {
                    deckId: deckId,
                    setId: index,
                    cards: cards,
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

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
