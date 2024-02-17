import React, { useCallback, useRef, useState } from 'react';
import { Linking, ScrollView, TouchableNativeFeedback, View } from 'react-native';
import { Button, FAB, Image, Text, makeStyles } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import TitleBar from '../components/TitleBar';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import { kickUser } from '../helpers/utility';
import { FirebaseApp } from '../models/FirebaseApp';
import LottieView from 'lottie-react-native';
import { _Deck, _User } from '../models/dto';
import { Cache } from '../models/Cache';
import { toFont, toSize } from '../helpers/scaling';
import { useTheme } from '@rneui/themed';
import { BOTTOM_NAV_HEIGHT, iconSize, margins } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { instructionUrl } from '../config/conf';
import { FF_REGULAR } from '../theme/typography';
import Icon2 from 'react-native-vector-icons/MaterialIcons';

const fetchAndSaveDeck = async (deckId: string) => {
  const deck = await FirebaseApp.getInstance().getDeck(deckId);
  if (deck) {
    await Cache.getInstance().saveDeck(deckId, deck);
    return deck;
  }

  return null;
};

type Pricing = {
  type: 'free' | '4.99' | '8.99';
  price: number;
  summary: string[];
};

type DeckItemProps = {
  name: string;
  bgColor: string;
  totalCards: number;
  mt?: number;
  onDeckPress: () => void;
};

const DeckItem = ({ name, bgColor, totalCards, mt, onDeckPress }: DeckItemProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={{ ...styles.container, marginTop: mt || 0, backgroundColor: bgColor }}>
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(theme.colors.lightAsh!, false)} onPress={onDeckPress}>
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

type PricingCardProps = {
  onPricingSelect: (p: Pricing) => void;
};

const PricingCard = ({ onPricingSelect }: PricingCardProps) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const [selection, setSelection] = useState(0);
  const [pricing, _] = useState<Pricing[]>(getPricingCards());

  return (
    <View style={styles.pricingCardContainer}>
      <View style={styles.pricingContentContainerTop}>
        <Text head1>{pricing[selection].type}</Text>
        <View style={styles.pricingStackedBtnsContainer}>
          {pricing.map((p, index) => {
            return (
              <Button
                key={index}
                title={p.type}
                onPress={() => {
                  setSelection(index);
                }}
                // eslint-disable-next-line react-native/no-inline-styles
                buttonStyle={{
                  ...styles.pricingStackedButtons,
                  backgroundColor: index === selection ? theme.colors.purple : theme.colors.white,
                  marginLeft: index !== 0 ? 5 : 0,
                }}
                titleStyle={{ ...styles.pricingStackedButtonsTitle, color: index === selection ? theme.colors.white : theme.colors.black }}
              />
            );
          })}
        </View>
      </View>
      <View style={styles.pricingContentContainerBtm}>
        {pricing[selection].summary.map((summary, index) => {
          return (
            // eslint-disable-next-line react-native/no-inline-styles
            <View key={index} style={{ marginTop: index === 0 ? 8 : 15, ...styles.pricingSummary }}>
              <Icon2 color="#4FF960" name="check-circle" style={styles.statusIcon} size={20} />
              <Text style={styles.pricingSummaryText} key={index}>
                {summary}
              </Text>
            </View>
          );
        })}

        <Button
          onPress={() => {
            onPricingSelect(pricing[selection]);
          }}
          title={'Continue'}
          buttonStyle={styles.pricingBtn}
          titleStyle={styles.pricingBtnTitle}
        />
      </View>
    </View>
  );
};

const getPricingCards = (): Pricing[] => {
  return [
    {
      price: 0,
      type: 'free',
      summary: ['You can make atmost 1 custom deck'],
    },
    {
      price: 4.99,
      type: '4.99',
      summary: ['You can make unlimited custom decks', 'Option to add 2 different meanings'],
    },
    {
      price: 8.99,
      type: '8.99',
      summary: [
        'You can make unlimited custom decks',
        'Option to add 2 different meanings',
        'Option to add audio and images',
        'Option to add audio and images',
        'Option to add audio and images',
      ],
    },
  ];
};

export default function MyDecks({ navigation }: NavProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const [user, setUser] = useState<_User>();
  const [showPricingCard, setShowPricingCard] = useState(false);

  const [decks, setDecks] = useState<_Deck[]>([]);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        kickUser(navigation, t);
        return;
      }

      const fetchDecks = async (user: _User) => {
        const decksList: _Deck[] = [];
        if (user.decksCreated) {
          for (const deckId of user.decksCreated) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        setDecks(decksList);

        animationRef.current?.pause();
        return decksList;
      };

      FirebaseApp.getInstance()
        .getUser(currentUser.uid)
        .then(async (user) => {
          if (!user) {
            kickUser(navigation, t);
            return;
          }

          console.log('user.isPremium', user.isPremium);

          if (user.isPremium) {
            setShowPricingCard(false);
          } else {
            setShowPricingCard(true);
          }

          const loadingTimer = setTimeout(() => {
            setLoading(true);
            animationRef.current?.play();
          }, 500);

          setUser(user);
          const res = await fetchDecks(user);
          if (res.length === 0) {
            setIsEmpty(true);
          }

          clearTimeout(loadingTimer);
          setLoading(false);
        });
    }, [])
  );

  const onPricingSelect = (pricing: Pricing) => {
    if (pricing.type === 'free') {
      setShowPricingCard(false);
    } else {
      // todo
    }
  };

  const onCreateDeckClick = () => {
    if (!user) {
      return;
    }

    if (user.decksCreated.length < 2 && !user?.isPremium) {
      setShowPricingCard(true);
    } else {
      navigation.push(NavRoutes.CreateDeck);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TitleBar title={t('screens.myDecks.title')} subtitle={t('screens.myDecks.subtitle')} />
        {showPricingCard === true && <PricingCard onPricingSelect={onPricingSelect} />}
        {isEmpty && (
          <View style={styles.notFoundContainer}>
            <Image source={require('../assets/not-found.png')} style={styles.emptyImage} />
            <Text body1 style={styles.emptyText}>
              {t('screens.myDecks.empty_my_decks')}
            </Text>
            <Text
              body1_bold
              style={styles.instructions}
              onPress={() => {
                Linking.openURL(instructionUrl);
              }}
            >
              {t('screens.myDecks.instructions2')}
            </Text>
          </View>
        )}
        {!loading && decks.length > 0 && (
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

      {loading && <LottieView ref={animationRef} loop={true} source={require('../assets/animation/loading-animation.json')} style={styles.loading} />}
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
  pricingCardContainer: {
    marginTop: 40,
    height: '100%',
    borderRadius: 10,
    marginHorizontal: margins.window_hor,
  },
  pricingContentContainerTop: {
    backgroundColor: theme.colors.lightAsh,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 20,
  },
  pricingContentContainerBtm: {
    paddingHorizontal: 50,
    backgroundColor: theme.colors.white,
    marginHorizontal: 0,
    paddingBottom: 15,
    paddingTop: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  pricingBtn: {
    backgroundColor: theme.colors.orange,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 30,
  },
  pricingBtnTitle: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(16),
    paddingHorizontal: 5,
    color: theme.colors.white,
  },
  pricingStackedBtnsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 30,
  },
  pricingStackedButtons: {
    borderRadius: 10,
    borderColor: theme.colors.black,
    borderWidth: 1,
  },
  pricingStackedButtonsTitle: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(16),
    paddingHorizontal: 8,
  },
  pricingSummary: {
    display: 'flex',
    flexDirection: 'row',
  },
  pricingSummaryText: {
    color: theme.colors.black,
    marginLeft: 3,
  },
}));
