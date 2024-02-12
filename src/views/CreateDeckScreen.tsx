import React, { useEffect, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { Button, FAB, Text, makeStyles, useTheme } from '@rneui/themed';
import NavigationBar from '../components/NavigationBar';
import { _Appearance, _Deck, _Set } from '../models/dto';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../components/CustomTextInput';
import { margins } from '../config';
import Entypo from 'react-native-vector-icons/Entypo';
import { toFont, toSize } from '../helpers/scaling';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FF_REGULAR } from '../theme/typography';
import * as SystemNavigationBar from 'expo-navigation-bar';
import CreateSetDialog from '../components/CreateSetDialog';
import { showToast } from '../components/CustomToast';
import { FirebaseApp } from '../models/FirebaseApp';
import auth from '@react-native-firebase/auth';
import { kickUser } from '../helpers/utility';
import { NavProps } from '../config/routes';

type InputFields = {
  name?: string;
  trackColor?: string;
  bgColor?: string;
  fgColor?: string;
};

type SetItemProps = {
  name: string;
  mt?: number;
  onDeleteClick: () => void;
  onEditClick: () => void;
};

const SetItem = ({ name, mt, onEditClick, onDeleteClick }: SetItemProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={{ ...styles.setContainer, marginTop: mt || 0 }}>
      <Text>{name}</Text>
      <View style={styles.flexGrow} />
      <Button radius={'sm'} type="solid" buttonStyle={styles.iconButton} onPress={onEditClick}>
        <Icon name="edit" color={theme.colors.purple} size={toSize(25)} />
      </Button>
      <Button radius={'sm'} type="solid" buttonStyle={styles.iconButton} onPress={onDeleteClick}>
        <Icon name="delete" color={theme.colors.orange} size={toSize(25)} />
      </Button>
    </View>
  );
};

type DialogState = {
  open: boolean;
  editing: boolean;
  set?: null | _Set;
};

export default function CreateDeckScreen({ navigation, route }: NavProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [input, setInput] = useState<InputFields>({});
  const [sets, setSets] = useState<_Set[]>([]);
  const [dialogOpen, setDialogOpen] = useState<DialogState>({
    open: false,
    editing: false,
    set: null,
  });
  const [isKeyboardShowing, setKeyboardShowing] = useState(false);

  useEffect(() => {
    // @ts-expect-error don't know how to fix it
    const { name, appearance, sets } = route?.params?.deck as _Deck;
    setInput({ name, bgColor: appearance.bgColor, fgColor: appearance.fgColor, trackColor: appearance.trackColor });
    setSets(sets);

    SystemNavigationBar.setBackgroundColorAsync(theme.colors.purple!);

    Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShowing(true);
    });

    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShowing(false);
    });
    return () => {
      SystemNavigationBar.setBackgroundColorAsync(theme.mode === 'dark' ? theme.colors.violetShade! : theme.colors.white);
    };
  }, []);

  const onInputChange = (name: string, text: string) => {
    setInput({
      ...input,
      [name]: text,
    });
  };

  const onSetAdded = (set: _Set) => {
    const isSetExist = sets.some((_set) => _set.name === set.name);
    if (isSetExist) {
      showToast('Please choose a different set name', 'error');
      return false;
    }
    setSets([...sets, set]);
    return true;
  };

  const onCreateDeck = async () => {
    console.log('creating deck');
    const { name, bgColor, fgColor, trackColor } = input;

    if (!name || !bgColor || !fgColor || !trackColor) {
      showToast('Please fill all the input fields', 'error');
      return;
    }

    if (sets.length === 0) {
      showToast('No sets added yet.', 'error');
      return;
    }

    const newDeck = new _Deck(name, new _Appearance(bgColor, fgColor, trackColor));
    newDeck.sets = sets;

    const currentUser = auth().currentUser;
    if (!currentUser) {
      kickUser(navigation, t);
      return;
    }

    const deckId = await FirebaseApp.getInstance().createDeck(newDeck);
    if (deckId) {
      await FirebaseApp.getInstance().addDeckToUser(deckId, currentUser.uid);
    } else {
      showToast("Couldn't add deck. Please try again", 'error');
      return;
    }

    showToast('Added deck!');
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <NavigationBar title={t('screens.myDecks.create_deck')} />
        <View style={{ marginTop: theme.spacing.xs, paddingHorizontal: margins.window_hor }}>
          <CustomTextInput name={'name'} value={input.name!} onChange={onInputChange} placeholder={t('screens.myDecks.input.enter_name')} />
          <Text body1_bold style={{ color: theme.colors.text, ...styles.mt0 }}>
            {t('screens.myDecks.deck_appr')}
          </Text>

          <CustomTextInput
            name={'bgColor'}
            value={input.bgColor!}
            onChange={onInputChange}
            placeholder={t('screens.myDecks.input.enter_bg_color')}
            mt={styles.mt1.marginTop}
          />
          <CustomTextInput
            name={'fgColor'}
            value={input.fgColor!}
            onChange={onInputChange}
            placeholder={t('screens.myDecks.input.enter_fg_color')}
            mt={styles.mt2.marginTop}
          />
          <CustomTextInput
            name={'trackColor'}
            value={input.trackColor!}
            onChange={onInputChange}
            placeholder={t('screens.myDecks.input.enter_track_color')}
            mt={styles.mt2.marginTop}
          />

          <View style={styles.setTitle}>
            <Text body1_bold style={{ color: theme.colors.text }}>
              {t('screens.myDecks.sets')}
            </Text>

            <View style={styles.flexGrow} />

            <FAB
              size="small"
              icon={<Entypo name="plus" color={theme.colors.white} size={toSize(18)} />}
              color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
              style={{ marginLeft: theme.spacing.lg }}
              onPress={() => {
                setDialogOpen({
                  open: true,
                  editing: false,
                });
              }}
            />
          </View>

          {sets.length === 0 && (
            <Text body2 style={{ color: theme.colors.text }}>
              {t('screens.myDecks.empty_sets')}
            </Text>
          )}

          {sets.length > 0 &&
            sets.map((set, index) => {
              return (
                <SetItem
                  name={set.name}
                  key={index}
                  mt={index === 0 ? 10 : 7}
                  onEditClick={() => {
                    // open dialog
                    console.log(`editing: set: ${set.name}`);
                    setDialogOpen({
                      open: true,
                      editing: true,
                      set: set,
                    });
                  }}
                  onDeleteClick={() => {
                    const remainingSets = sets.filter((_set) => _set.name !== set.name);
                    setSets(remainingSets);
                  }}
                />
              );
            })}
        </View>
      </ScrollView>

      <Button
        title={t('screens.myDecks.create_deck')}
        titleStyle={styles.createBtnTitle}
        buttonStyle={styles.createBtn}
        // eslint-disable-next-line react-native/no-inline-styles
        containerStyle={{ ...styles.createBtnContainer, display: isKeyboardShowing ? 'none' : 'flex' }}
        onPress={onCreateDeck}
      />

      <CreateSetDialog
        dialogOpen={dialogOpen}
        closeDialog={() => {
          setDialogOpen({ open: false, editing: false });
        }}
        onAddSetClick={onSetAdded}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  loading: {
    width: '70%',
    height: '50%',
    alignSelf: 'center',
    marginBottom: 200,
  },
  rootContainer: {
    height: '100%',
  },
  flexGrow: { flexGrow: 1 },
  setTitle: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  setContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 17,
    backgroundColor: theme.colors.lightAsh,
  },
  mt0: {
    marginTop: theme.spacing.xl,
  },
  mt1: {
    marginTop: theme.spacing.lg,
  },
  mt2: {
    marginTop: theme.spacing.md,
  },
  iconButton: {
    backgroundColor: theme.colors.lightAsh,
    padding: 0,
    paddingVertical: 3,
  },
  createBtn: {
    borderRadius: 0,
    paddingVertical: 10,
    backgroundColor: theme.colors.purple,
  },
  createBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  createBtnTitle: {
    fontFamily: FF_REGULAR,
    fontSize: toFont(18),
  },
}));
