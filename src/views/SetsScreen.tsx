import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { makeStyles, useTheme } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import Set from '../components/Set';
import { Cache } from '../models/Cache';
import { _Set } from '../models/dto';
import { FirebaseApp } from '../models/FirebaseApp';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import LottieView from 'lottie-react-native';
import { showToast } from '../components/CustomToast';
import { useTranslation } from 'react-i18next';

export default function SetsScreen({ navigation, route }: NavProps) {
  const { theme } = useTheme();
  const [sets, setSets] = useState<_Set[]>([]);
  const [statuses, setStatuses] = useState<Map<string, number>>();
  const [deckId, setDeckId] = useState();
  const [loading, setLoading] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const styles = useStyles();
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      const loadingTimer = setTimeout(() => {
        setLoading(true);
      }, 500);

      // the screen is focused
      const { deckId } = route.params!;

      const setData = async (userId: string, deckId: string) => {
        const deck = await Cache.getInstance().getDeck(deckId);
        if (!deck) {
          showToast(t('screens.toast.cacheExpired'));
          return;
        }
        setSets(deck.sets || []);

        const statuses = await FirebaseApp.getInstance().getSetStatuses(userId, deckId);
        setStatuses(statuses);
        setLoading(false);
        clearTimeout(loadingTimer);
        animationRef.current?.pause();
      };

      const user = auth().currentUser;
      animationRef.current?.play();
      setData(user!.uid, deckId);
      setDeckId(deckId);
    }, [])
  );

  //navigation.navigate()

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title={t('screens.sets.title')} />
        <View style={{ marginTop: theme.spacing.xs }}>
          {!loading && (
            <>
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
          )}
        </View>
      </ScrollView>
      {loading && <LottieView ref={animationRef} loop={true} source={require('../assets/animation/loading-animation.json')} style={styles.loading} />}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  loading: {
    width: '70%',
    height: '50%',
    alignSelf: 'center',
    marginBottom: 200,
  },
}));
