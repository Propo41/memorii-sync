import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import Set from '../components/Set';
import { Cache } from '../models/Cache';
import { _Set } from '../models/dto';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { showToast } from '../components/CustomToast';
import { useTranslation } from 'react-i18next';

const calculateSetProgress = async (deckId: string, setList: _Set[]) => {
  let setId = 0;
  const updatedSets = [];
  for (const set of setList) {
    let completedCount = 0;
    const statuses = await Cache.getInstance().getCardStatuses(deckId, setId.toString());

    if (statuses) {
      completedCount = Object.values(statuses).filter(Boolean).length;
    }

    set._progress = completedCount;
    updatedSets.push(set);
    setId++;
  }
  return updatedSets;
};

export default function SetsScreen({ navigation, route }: NavProps) {
  const { theme } = useTheme();
  const [sets, setSets] = useState<_Set[]>([]);
  const [deckId, setDeckId] = useState();
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      // the screen is focused
      const { deckId } = route.params!;

      const setData = async (deckId: string) => {
        const deck = await Cache.getInstance().getDeck(deckId);
        if (!deck) {
          showToast(t('screens.toast.cacheExpired'));
          return;
        }

        setSets((await calculateSetProgress(deckId, deck.sets)) || []);
      };

      setData(deckId);
      setDeckId(deckId);
    }, [])
  );

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title={t('screens.sets.title')} />
        <View style={{ marginTop: theme.spacing.lg }}>
          {
            <>
              {sets.map((set, index) => {
                const { name, cards, appearance } = set;
                const { bgColor, fgColor } = appearance;

                return (
                  <Set
                    key={index}
                    name={name}
                    completed={set._progress || 0}
                    total={cards.length}
                    mt={index > 0 ? 8 : 0}
                    mb={index === sets.length - 1 ? 70 : 0}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    onSetPress={() => {
                      // @ts-expect-error cant fix this ts error
                      navigation.push(NavRoutes.Cards, {
                        deckId: deckId,
                        setId: index,
                        cards: cards,
                        userId: auth().currentUser!.uid,
                      });
                    }}
                  />
                );
              })}
            </>
          }
        </View>
      </ScrollView>
    </View>
  );
}
