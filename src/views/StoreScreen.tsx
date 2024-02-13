import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
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
import { isValidUrl, log } from '../helpers/utility';

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

  console.log(word);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlayAudio = async () => {
    try {
      if (isValidUrl(audio!)) {
        showToast('Audio url seems to be broken', 'error');
        return;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audio! });
      setSound(sound);
      log('Playing sound');

      await sound.playAsync();
    } catch (error: any) {
      log(error.message);
      showToast("Couldn't play the audio. Network issue?", 'error');
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

export default function StoreScreen({ route }: NavProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  // @ts-expect-error store is infact a type of Market. need to fix NavProps
  const store: Market = route.params!.store;
  const { title, description, price, discountRate, samples } = store;
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const newPrice = price - (price * discountRate) / 100;

  useEffect(() => {
    SystemNavigationBar.setBackgroundColorAsync(theme.colors.purple!);
    return () => {
      SystemNavigationBar.setBackgroundColorAsync(theme.mode === 'dark' ? theme.colors.violetShade! : theme.colors.white);
    };
  }, []);

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
            <Text body1 style={styles.oldPrice}>
              ৳{price}
            </Text>
            <Text body1 style={{ color: theme.colors.orange, marginLeft: theme.spacing.sm }}>
              ৳{newPrice}
            </Text>
          </View>

          <Text body1_bold style={{ ...styles.titleSpacing, color: theme.colors.text }}>
            {t('screens.store.sample')}
          </Text>

          <SampleCard
            word={samples[currentSampleIndex].front}
            value1={samples[currentSampleIndex].back}
            value2={samples[currentSampleIndex].backLocale}
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
        </View>
      </ScrollView>

      <Button
        title={t('screens.store.purchase')}
        titleStyle={styles.purchaseButtonTitle}
        buttonStyle={styles.purchaseButton}
        containerStyle={styles.purchaseButtonContainer}
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
