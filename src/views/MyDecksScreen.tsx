import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, TouchableNativeFeedback, View } from 'react-native';
import { Button, FAB, Image, Text, makeStyles } from '@rneui/themed';
import { NavProps, NavRoutes } from '../config/routes';
import TitleBar from '../components/TitleBar';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import { fetchOfferings, kickUser, makePurchase } from '../helpers/utility';
import { FirebaseApp } from '../models/FirebaseApp';
import { _Deck, _Offering, _User } from '../models/dto';
import { Cache } from '../models/Cache';
import { toFont, toSize } from '../helpers/scaling';
import { useTheme } from '@rneui/themed';
import { BOTTOM_NAV_HEIGHT, iconSize, margins } from '../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { INSTRUCTION_URL } from '../config/conf';
import { FF_REGULAR } from '../theme/typography';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { PurchasesPackage } from 'react-native-purchases';
import { showToast } from '../components/CustomToast';

type Pricing = {
  [key: string]: {
    type: 'Free' | 'Premium';
    priceString?: string;
    summary: string[];
  };
};

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

// const pricingCards: Pricing = {
//   free: {
//     type: 'Free',
//     summary: ['You can make maximum 1 custom deck', 'Maximum 3 sets', 'Maximum 50 cards per deck', 'Lifetime access'],
//   },
//   offering_pro_access: {
//     type: 'Premium',
//     summary: [
//       'You can make unlimited custom decks and cards',
//       'Option to add 2 different meanings',
//       'Option to add self-hosted audio urls',
//       'Lifetime access',
//     ],
//   },
// };

type PricingCardProps = {
  onPricingSelect: (p?: PurchasesPackage) => void;
  isPremium: boolean;
  showPricingCard: (show: boolean) => void;
};

const PricingCard = ({ onPricingSelect, isPremium, showPricingCard }: PricingCardProps) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const [selection, setSelection] = useState(0);

  const [pricingCards, setPricingCards] = useState<_Offering[]>([]);

  useFocusEffect(
    useCallback(() => {
      !isPremium &&
        FirebaseApp.getInstance()
          .fetchOffers()
          .then(async (items) => {
            const offerings = await fetchOfferings();
            console.log(offerings);
            
            const appOffers = items.map((item) => {
              const inAppPackage = offerings.find((offeringPkg) => offeringPkg.offeringIdentifier === item.offeringIdentifier);
              if (inAppPackage) {
                item._package = inAppPackage;
              }

              return item;
            });

            if (appOffers.length === 0) {
              showToast("Coudn't retrieve app offerings. Connection issues?", 'error');
              showPricingCard(false);
            } else {
              setPricingCards(appOffers);
            }
          });
    }, [])
  );

  if (pricingCards.length === 0) {
    return null;
  }

  return (
    <View style={styles.pricingCardContainer}>
      <View style={styles.pricingContentContainerTop}>
        <Text head1>{pricingCards[selection]?._package?.product.priceString}</Text>
        <View style={styles.pricingStackedBtnsContainer}>
          {pricingCards.map((p, index) => {
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
        {pricingCards[selection]?.summary.map((summary, index) => {
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
            onPricingSelect(pricingCards[selection]?._package);
          }}
          title={'Continue'}
          buttonStyle={styles.pricingBtn}
          titleStyle={styles.pricingBtnTitle}
        />
      </View>
    </View>
  );
};

export default function MyDecks({ navigation }: NavProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [isEmpty, setIsEmpty] = useState(false);
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

      FirebaseApp.getInstance()
        .getUser(currentUser.uid)
        .then(async (user) => {
          if (!user) {
            kickUser(navigation, t);
            return;
          }

          console.log('user.isPremium', user.isPremium);

          setUser(user);
          const decksList = await Cache.getInstance().getDecks([...user.decksCreated, ...user.decksPurchased]);
          setDecks(decksList);

          if (decksList.length === 0) {
            setIsEmpty(true);
          } else {
            setIsEmpty(false);
          }
        });
    }, [])
  );

  const onPricingSelect = async (pkg?: PurchasesPackage) => {
    if (!user) return;

    if (!pkg) {
      setShowPricingCard(false);
    } else {
      const transaction = await makePurchase(user.id, pkg);
      if (transaction) {
        await FirebaseApp.getInstance().makePremium(user.id);
        showToast('Congratulations 🎉 You have unlocked premium access!');
        setShowPricingCard(false);
        setUser({ ...user, isPremium: true });
      }
    }
  };

  const onCreateDeckClick = () => {
    if (!user) {
      return;
    }

    if ((user.decksCreated || []).length === 0 && user.isPremium) {
      // if user has not created any decks yet and the user is not a premium user, let him create a deck
      setShowPricingCard(false);
      navigation.push(NavRoutes.CreateDeck);
    } else if (user.isPremium) {
      navigation.push(NavRoutes.CreateDeck);
    } else {
      setShowPricingCard(true);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TitleBar title={t('screens.myDecks.title')} subtitle={t('screens.myDecks.subtitle')} />
        {showPricingCard && (
          <PricingCard onPricingSelect={onPricingSelect} isPremium={user?.isPremium || false} showPricingCard={setShowPricingCard} />
        )}
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
                Linking.openURL(INSTRUCTION_URL);
              }}
            >
              {t('screens.myDecks.instructions2')}
            </Text>
          </View>
        )}
        {!showPricingCard && decks.length > 0 && (
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
      {!showPricingCard && (
        <FAB
          size="large"
          icon={<Entypo name="plus" color={theme.colors.white} size={iconSize.sm} />}
          color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
          style={styles.fab}
          onPress={onCreateDeckClick}
        />
      )}
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
