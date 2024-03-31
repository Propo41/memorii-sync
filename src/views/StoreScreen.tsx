import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Button, FAB, Text, makeStyles, useTheme } from '@rneui/themed';
import { toFont, toSize } from '../helpers/scaling';
import { FF_REGULAR } from '../theme/typography';
import { useTranslation } from 'react-i18next';
import { NavProps } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import Markdown from 'react-native-markdown-display';
import { margins } from '../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { Audio } from 'expo-av';
import { showToast } from '../components/CustomToast';
import { Sound } from 'expo-av/build/Audio';
import * as SystemNavigationBar from 'expo-navigation-bar';
import { Market } from '../models/dto/Market';
import { isValidUrl, kickUser, log } from '../helpers/utility';
import auth from '@react-native-firebase/auth';
import { FirebaseApp } from '../models/FirebaseApp';
import { Cache } from '../models/Cache';
import { _User } from '../models/dto';
import { SITE_URL } from '../config/conf';

type SampleCardProps = {
  word: string;
  value1: string;
  value2?: string;
  example?: string;
  audio?: string;
  navigateIndex: string;
  onNextClick: () => void;
  onPrevClick: () => void;
};

const SampleCard = ({ word, value1, value2, example, audio, onNextClick, onPrevClick, navigateIndex }: SampleCardProps) => {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  // audio
  const [sound, setSound] = useState<Sound>();

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlayAudio = async () => {
    try {
      if (!isValidUrl(audio)) {
        showToast(t('screens.store.audio_broken'), 'error');
        return;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audio! });
      setSound(sound);
      await sound.playAsync();
    } catch (error: any) {
      log(error.message);
      showToast(t('screens.store.audio_unplayable'), 'error');
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text body1_bold>{t('screens.store.word')}</Text>
      <Text body1>{word}</Text>

      <Text body1_bold style={styles.titleSpacing}>
        {t('screens.store.meaning')}
      </Text>
      <Text body1 style={styles.textMarinTop}>
        {value1}
      </Text>

      {value2 && (
        <>
          <Text body1_bold style={styles.titleSpacing}>
            {t('screens.store.meaning_2')}
          </Text>
          <Text body1 style={styles.textMarinTop}>
            {value2}
          </Text>
        </>
      )}

      {example && (
        <>
          <Text body1_bold style={styles.textMarinTop}>
            {t('screens.store.example')}
          </Text>
          <Text body1 style={styles.textMarinTop}>
            {example}
          </Text>
        </>
      )}

      {audio && (
        <>
          <View style={styles.audioContainer}>
            <Text body1_bold style={styles.textMarinTop}>
              {t('screens.store.audio')}
            </Text>

            <FAB
              size="small"
              icon={<EntypoIcons name="sound" color={theme.colors.white} size={toSize(18)} />}
              color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
              style={{ marginLeft: theme.spacing.lg }}
              onPress={onPlayAudio}
            />
          </View>
        </>
      )}

      <View style={styles.navigateButtonContainer}>
        <Button radius={'sm'} type="solid" buttonStyle={styles.navigateButton} onPress={onPrevClick}>
          <Icon name="navigate-before" color={theme.colors.black} size={toSize(25)} />
        </Button>
        <Text style={styles.navigateIndex}>{navigateIndex}</Text>
        <Button radius={'sm'} type="solid" buttonStyle={styles.navigateButton} onPress={onNextClick}>
          <Icon name="navigate-next" color={theme.colors.black} size={toSize(25)} />
        </Button>
      </View>
    </View>
  );
};

export default function StoreScreen({ route, navigation }: NavProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  // @ts-expect-error store is infact a type of Market. need to fix NavProps
  const store: Market = route.params!.store;
  const { id, title, deckId, description, price, discountRate, samples, _package } = store;
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const newPrice = price - (price * discountRate) / 100;
  const [user, setUser] = useState<_User>();
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      kickUser(navigation, t);
      return;
    }

    FirebaseApp.getInstance()
      .getUser(currentUser.uid)
      .then((user) => {
        if (!user) {
          kickUser(navigation, t);
          return;
        }

        const isDeckPurchased = user.decksPurchased.find((id) => id === deckId);
        if (isDeckPurchased) {
          setIsPurchased(true);
        }

        setUser(user);
      });

    SystemNavigationBar.setBackgroundColorAsync(theme.colors.purple!);
    return () => {
      SystemNavigationBar.setBackgroundColorAsync(theme.mode === 'dark' ? theme.colors.violetShade! : theme.colors.white);
    };
  }, []);

  const onPurchaseClick = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }

    const appInfo = await Cache.getInstance().getAppInfo();

    if (newPrice > 0 && !isPurchased) {
      Linking.openURL(appInfo?.storeUrl || SITE_URL);
      return;
      // const res = await makePurchase(currentUser.uid, _package);
      // if (res) {
      //   showToast(t('screens.store.deck_purchased'));
      // }
    }
    // for now, the deck will be added manually by admin after purchase completion
    // await FirebaseApp.getInstance().addDeckToUser(deckId, currentUser.uid); // at first, attach the deck id to user

    // if the product is free / or has 100% discount
    if (newPrice === 0) {
      await FirebaseApp.getInstance().purchaseDeck(deckId, currentUser.uid);
      await FirebaseApp.getInstance().addDeckToUser(deckId, currentUser.uid);
    }

    const downloadedDeck = await FirebaseApp.getInstance().getDeck(deckId); // next try downloading
    if (!downloadedDeck) {
      showToast(t('screens.store.deck_details_not_found'), 'error');
      return;
    }

    console.log(downloadedDeck);

    showToast(t('screens.store.deck_downloading'));
    await Cache.getInstance().updateDeck(deckId, downloadedDeck);
    navigation.pop();
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title={title} />
        <View style={styles.container}>
          <Text body1_bold style={{ color: theme.colors.text }}>
            {t('screens.store.description')}
          </Text>
          <Markdown
            style={{
              body: styles.markdownBody,
            }}
          >
            {description}
          </Markdown>

          <Text body1_bold style={{ ...styles.titleSpacing, color: theme.colors.text }}>
            {t('screens.store.price')}
          </Text>
          <View style={styles.priceContainer}>
            {discountRate > 0 && (
              <Text body1 style={styles.oldPrice}>
                ৳{price}
              </Text>
            )}
            <Text body1 style={{ color: theme.colors.orange, marginLeft: theme.spacing.sm }}>
              ৳{newPrice}
            </Text>
          </View>

          <Text body1_bold style={{ ...styles.titleSpacing, color: theme.colors.text }}>
            {t('screens.store.sample')}
          </Text>

          {samples.length > 0 && (
            <SampleCard
              word={samples[currentSampleIndex].front}
              value1={samples[currentSampleIndex].back}
              value2={samples[currentSampleIndex].back2}
              example={samples[currentSampleIndex].example}
              audio={samples[currentSampleIndex].audio}
              navigateIndex={`${currentSampleIndex + 1}/${samples.length}`}
              onNextClick={() => {
                if (currentSampleIndex + 1 < samples.length) {
                  setCurrentSampleIndex(currentSampleIndex + 1);
                }
              }}
              onPrevClick={() => {
                if (currentSampleIndex > 0) {
                  setCurrentSampleIndex(currentSampleIndex - 1);
                }
              }}
            />
          )}
        </View>
      </ScrollView>

      <Button
        title={newPrice === 0 || isPurchased ? t('screens.store.download') : t('screens.store.purchase')}
        titleStyle={styles.purchaseButtonTitle}
        buttonStyle={styles.purchaseButton}
        containerStyle={styles.purchaseButtonContainer}
        onPress={onPurchaseClick}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    height: '100%',
  },
  container: {
    marginHorizontal: margins.window_hor + 5,
    marginTop: theme.spacing.xs,
    paddingBottom: toSize(80),
  },
  cardContainer: {
    backgroundColor: theme.colors.lightAsh,
    paddingHorizontal: toSize(20),
    paddingVertical: toSize(15),
    marginTop: toSize(10),
  },
  markdownBody: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(20),
    color: theme.colors.text,
  },
  titleSpacing: {
    paddingTop: toSize(theme.spacing.lg),
  },
  textMarinTop: {
    paddingTop: toSize(theme.spacing.md),
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: theme.spacing.md,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: theme.colors.text,
  },
  navigateButton: {
    backgroundColor: theme.colors.lightAsh,
    padding: 0,
    paddingVertical: 3,
  },
  navigateButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: toSize(theme.spacing.lg),
    paddingBottom: toSize(theme.spacing.xs),
  },
  navigateIndex: {
    flexGrow: 1,
    textAlign: 'center',
  },
  audioContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
  },
  purchaseButton: {
    borderRadius: 0,
    paddingVertical: 10,
    backgroundColor: theme.colors.purple,
  },
  purchaseButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  purchaseButtonTitle: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(18),
  },
}));
