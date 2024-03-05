import React, { useCallback, useState } from 'react';
import { Linking, RefreshControl, ScrollView, TouchableNativeFeedback, View } from 'react-native';
import { FAB, Image, Text, makeStyles } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import TitleBar from '../components/TitleBar';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import { kickUser } from '../helpers/utility';
import { FirebaseApp } from '../models/FirebaseApp';
import { _Deck, _Offering, _User } from '../models/dto';
import { Cache } from '../models/Cache';
import { toSize } from '../helpers/scaling';
import { useTheme } from '@rneui/themed';
import { BOTTOM_NAV_HEIGHT, iconSize, margins } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { SITE_URL } from '../config/conf';

type DeckItemProps = {
  name: string;
  bgColor: string;
  totalCards: number;
  mt?: number;
  mb?: number;
  onDeckPress: () => void;
};

const DeckItem = ({ name, bgColor, totalCards, mt, mb, onDeckPress }: DeckItemProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={{ ...styles.container, marginTop: mt || 0, marginBottom: mb || 0, backgroundColor: bgColor }}>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#A5A5A5', false)} onPress={onDeckPress}>
        <View style={styles.contentContainer}>
          <Text style={styles.title} head3>
            {name}
          </Text>
          <View style={styles.statusContainer}>
            <View style={styles.status}>
              <Icon name="cards-playing" style={styles.statusIcon} color={theme.colors.darkRed} />
              <Text body2 style={styles.statusText}>
                {totalCards}
              </Text>
            </View>
          </View>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

export default function MyDecks({ navigation }: NavProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [isEmpty, setIsEmpty] = useState(false);
  const [user, setUser] = useState<_User>();
  const [refreshing, setRefreshing] = React.useState(false);

  const [decks, setDecks] = useState<_Deck[]>([]);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      init();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    init();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const init = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      kickUser(navigation, t);
      return;
    }

    const user = await FirebaseApp.getInstance().getUser(currentUser.uid);
    if (!user) {
      kickUser(navigation, t);
      return;
    }

    setUser(user);
    const decksList = await Cache.getInstance().getDecks([...user.decksCreated, ...user.decksPurchased]);
    decksList.sort((a, b) => b.createdAt - a.createdAt);

    setDecks(decksList);

    if (decksList.length === 0) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
  };

  const onCreateDeckClick = () => {
    if (!user) {
      return;
    }

    // if ((user.decksCreated || []).length === 0 && user.isPremium) {
    //   navigation.push(NavRoutes.CreateDeck);
    // }

    navigation.push(NavRoutes.CreateDeck);
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TitleBar title={t('screens.myDecks.title')} subtitle={t('screens.myDecks.subtitle')} />
        {isEmpty && (
          <View style={styles.notFoundContainer}>
            <Image source={require('../assets/not-found.png')} style={styles.emptyImage} />
            <Text body1 style={styles.emptyText}>
              {t('screens.myDecks.empty_my_decks')}
            </Text>
            <Text
              body1_bold
              style={styles.instructions}
              onPress={async () => {
                const appInfo = await Cache.getInstance().getAppInfo();
                Linking.openURL(appInfo?.instructionUrl || SITE_URL);
              }}
            >
              {t('screens.myDecks.instructions2')}
            </Text>
          </View>
        )}
        {decks.length > 0 && (
          <>
            <View style={{ marginTop: theme.spacing.lg }}>
              {decks.map((deck, index) => {
                const { bgColor } = deck.appearance;
                const totalCards = deck.sets.reduce((acc, set) => acc + (set.cards?.length || 0), 0);

                return (
                  <DeckItem
                    key={index}
                    name={deck.name}
                    mt={index > 0 ? 8 : 0}
                    mb={index === decks.length - 1 ? 70 : 0}
                    bgColor={bgColor}
                    totalCards={totalCards}
                    onDeckPress={() => {
                      // @ts-expect-error cant fix this ts error
                      navigation.push(NavRoutes.CreateDeck, {
                        deck: deck,
                      });
                    }}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <FAB
        size="large"
        icon={<Entypo name="plus" color={theme.colors.white} size={iconSize.sm} />}
        color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
        style={styles.fab}
        onPress={onCreateDeckClick}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100%',
  },
  image: {
    marginTop: 30,
  },
  container: {
    borderRadius: 15,
    marginHorizontal: margins.window_hor,
    overflow: 'hidden',
  },
  notFoundContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loading: {
    width: '70%',
    height: '50%',
    alignSelf: 'center',
    marginBottom: 200,
  },
  emptyImage: {
    width: toSize(150),
    height: toSize(150),
  },
  fab: {
    marginLeft: theme.spacing.lg,
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginBottom: BOTTOM_NAV_HEIGHT + 20,
    marginRight: margins.window_hor,
  },
  instructions: {
    textDecorationLine: 'underline',
    color: theme.colors.text,
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  contentContainer: {
    height: 90,
    paddingHorizontal: margins.window_hor,
    display: 'flex',
    flexDirection: 'row',
  },
  status: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.white,
  },
  title: {
    color: theme.colors.white,
    paddingLeft: toSize(20),
    alignSelf: 'center',
    lineHeight: 30,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
    marginRight: 15,
    marginBottom: 10,
  },
}));
